import { useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Empty, Form, Input, Result, Select, Spin } from 'antd'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createPost, fetchMyPosts, MY_POSTS_LIMIT } from '../../api/community.ts'
import { getErrorMessage, isRateLimited, isSessionEnd } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { fetchMyDesigns, MY_DESIGNS_LIMIT } from '../../api/userDesigns.ts'
import { cacheCommunityPost, invalidateCommunityLists, validatePostBody } from '../../utils/community.ts'

type CreatePostForm = {
  design_id: number
  body?: string
}

export function CreatePostPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const busyRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null)

  const designsQuery = useQuery({
    queryKey: queryKeys.designs.mine(MY_DESIGNS_LIMIT),
    queryFn: () => fetchMyDesigns(MY_DESIGNS_LIMIT),
    retry: false,
    refetchOnMount: 'always',
  })

  const postsQuery = useQuery({
    queryKey: queryKeys.community.mine(MY_POSTS_LIMIT),
    queryFn: () => fetchMyPosts(MY_POSTS_LIMIT),
    retry: false,
    refetchOnMount: 'always',
  })

  const submit = async (values: CreatePostForm) => {
    if (busyRef.current || rateLimitMessage) {
      return
    }

    if (!Number.isSafeInteger(values.design_id) || values.design_id <= 0) {
      message.error('设计 ID 不正确')
      return
    }

    const body = values.body ?? ''
    const bodyError = validatePostBody(body)
    if (bodyError) {
      message.error(bodyError)
      return
    }

    busyRef.current = true
    setSubmitting(true)

    try {
      const post = await createPost({
        design_id: values.design_id,
        ...(body.trim() ? { body } : {}),
      })
      cacheCommunityPost(queryClient, post)
      invalidateCommunityLists(queryClient)
      message.success('手记已保存为草稿')
      navigate(`/community/${post.id}`)
    } catch (error) {
      if (isSessionEnd(error)) {
        return
      }
      if (isRateLimited(error)) {
        setRateLimitMessage(getErrorMessage(error))
      }
      message.error(getErrorMessage(error))
    } finally {
      busyRef.current = false
      setSubmitting(false)
    }
  }

  if (designsQuery.isPending || postsQuery.isPending) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" tip="加载可写手记的设计…" />
      </div>
    )
  }

  const failedQuery = designsQuery.isError ? designsQuery : postsQuery.isError ? postsQuery : null
  if (failedQuery) {
    if (isSessionEnd(failedQuery.error)) {
      return (
        <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
          <Spin size="large" tip="正在前往登录…" />
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Result
          status="warning"
          title={getErrorMessage(failedQuery.error)}
          extra={
            <Button
              type="primary"
              onClick={() => {
                void designsQuery.refetch()
                void postsQuery.refetch()
              }}
            >
              重试
            </Button>
          }
        />
      </div>
    )
  }

  const designs = Array.isArray(designsQuery.data?.items) ? designsQuery.data.items : []
  const posts = Array.isArray(postsQuery.data?.items) ? postsQuery.data.items : []
  const usedDesignIds = new Set(posts.map((post) => post.design_id))
  const available = designs.filter((design) => !usedDesignIds.has(design.id))

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <p className="text-xs font-medium tracking-[0.22em] text-stone-400">NEW NOTE</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">写手记</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
        一篇手记绑定一件你自己的设计。正文是给别人看的创作说明，不是设计上的模型提示词。保存后是草稿，还不会公开。
      </p>

      {designs.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] bg-white py-16 shadow-sm">
          <Empty description="还没有可以写手记的设计" />
        </div>
      ) : null}

      {designs.length > 0 && available.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] bg-white py-16 shadow-sm">
          <Empty description="这些设计已经有创作手记">
            <Link to="/my-posts">
              <Button type="primary">查看我的手记</Button>
            </Link>
          </Empty>
        </div>
      ) : null}

      {available.length > 0 ? (
        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <Form<CreatePostForm>
            layout="vertical"
            requiredMark={false}
            autoComplete="off"
            className="max-w-2xl"
            disabled={submitting || Boolean(rateLimitMessage)}
            onFinish={(values) => void submit(values)}
          >
            <Form.Item
              label="设计"
              name="design_id"
              rules={[
                {
                  validator: (_, value: number | undefined) => {
                    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
                      return Promise.reject(new Error('设计 ID 不正确'))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Select
                placeholder="选择一件还没有手记的设计"
                options={available.map((design) => ({
                  value: design.id,
                  label: design.title,
                }))}
              />
            </Form.Item>
            <Form.Item
              label="正文"
              name="body"
              extra="可以留空。去掉首尾空白后不超过 8000 个字符，可以换行。"
              rules={[
                {
                  validator: (_, value: string | undefined) => {
                    const error = validatePostBody(value ?? '')
                    return error ? Promise.reject(new Error(error)) : Promise.resolve()
                  },
                },
              ]}
            >
              <Input.TextArea rows={8} placeholder="这件衣服的蓝色来自瓷片" />
            </Form.Item>
            {rateLimitMessage ? (
              <p className="mb-4 text-sm text-amber-700">{rateLimitMessage}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={Boolean(rateLimitMessage)}
              >
                保存草稿
              </Button>
              <Link to="/my-posts" className="text-sm text-stone-500 hover:text-stone-950">
                返回我的手记
              </Link>
            </div>
          </Form>
        </section>
      ) : null}
    </div>
  )
}
