import { useQueryClient } from '@tanstack/react-query'
import { App, Button, Form, Input } from 'antd'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  COMMENTS_LIMIT,
  fetchComments,
  submitPost,
  updatePostBody,
  withdrawPost,
} from '../../api/community.ts'
import { getErrorMessage } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import type { OwnedPost } from '../../types/community.ts'
import type { CreatorProfile } from '../../types/creator.ts'
import {
  DESIGN_NOT_READY_MESSAGE,
  POST_STATUS_LABEL,
  cacheCommunityPost,
  creatorSubmitHint,
  designReadyForPublicPost,
  invalidateCommunityLists,
  validatePostBody,
  validatePostBodyForSubmit,
  withdrawNotice,
} from '../../utils/community.ts'
import { formatDesignTime, isSessionEnd } from '../../utils/userDesign.ts'
import { PostDesignCard } from './PostDesignCard.tsx'
import { PostInteraction } from './PostInteraction.tsx'

type BodyFormValues = {
  body: string
}

export function OwnedPostView({ post }: { post: OwnedPost }) {
  const { message, modal } = App.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<BodyFormValues>()
  const busyRef = useRef(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const canEdit = post.status === 'draft' || post.status === 'rejected'
  const canWithdraw = post.status === 'published'
  const publishedAt = formatDesignTime(post.published_at)
  const reviewedAt = formatDesignTime(post.reviewed_at)
  const createdAt = formatDesignTime(post.created_at)
  const updatedAt = formatDesignTime(post.updated_at)
  const creator = queryClient.getQueryData<CreatorProfile | null>(queryKeys.creators.me)
  const hints = [
    creatorSubmitHint(creator),
    designReadyForPublicPost(post.design) ? null : DESIGN_NOT_READY_MESSAGE,
  ].filter((hint): hint is string => Boolean(hint))

  useEffect(() => {
    form.setFieldsValue({ body: post.body })
  }, [form, post.body, post.status, post.updated_at])

  const ask = (title: string, content: ReactNode, okText: string) => {
    return new Promise<boolean>((resolve) => {
      let settled = false
      const finish = (value: boolean) => {
        if (settled) {
          return
        }
        settled = true
        resolve(value)
      }

      modal.confirm({
        title,
        content,
        okText,
        cancelText: '取消',
        onOk: () => finish(true),
        onCancel: () => finish(false),
      })
    })
  }

  const report = (error: unknown) => {
    if (isSessionEnd(error)) {
      return
    }
    message.error(getErrorMessage(error))
  }

  const save = async (values: BodyFormValues) => {
    if (busyRef.current || !canEdit) {
      return
    }

    const body = values.body ?? ''
    const error = validatePostBody(body)
    if (error) {
      message.error(error)
      return
    }

    if (body === post.body) {
      message.info('没有需要保存的修改')
      return
    }

    busyRef.current = true
    setPendingAction('save')

    try {
      const next = await updatePostBody(post.id, body)
      cacheCommunityPost(queryClient, next)
      invalidateCommunityLists(queryClient)
      message.success('正文已保存')
    } catch (error) {
      report(error)
    } finally {
      busyRef.current = false
      setPendingAction(null)
    }
  }

  const submitForReview = async () => {
    if (busyRef.current || !canEdit) {
      return
    }

    const draft = (form.getFieldValue('body') as string | undefined) ?? post.body
    if (draft !== post.body) {
      message.error('请先保存正文')
      return
    }

    const error = validatePostBodyForSubmit(post.body)
    if (error) {
      message.error(error)
      return
    }

    const confirmed = await ask(
      '提交审核',
      <div className="space-y-2">
        {hints.map((hint) => (
          <p key={hint}>{hint}</p>
        ))}
        <p>提交后手记进入审核，审核期间不能修改或撤回。</p>
      </div>,
      '确认提交',
    )
    if (!confirmed || busyRef.current) {
      return
    }

    const latest = (form.getFieldValue('body') as string | undefined) ?? post.body
    if (latest !== post.body) {
      message.error('请先保存正文')
      return
    }

    busyRef.current = true
    setPendingAction('submit')

    try {
      const next = await submitPost(post.id)
      cacheCommunityPost(queryClient, next)
      invalidateCommunityLists(queryClient)
      message.success('已提交审核')
    } catch (error) {
      report(error)
    } finally {
      busyRef.current = false
      setPendingAction(null)
    }
  }

  const withdraw = async () => {
    if (busyRef.current || !canWithdraw) {
      return
    }

    const confirmed = await ask('撤回手记', withdrawNotice(), '确认撤回')
    if (!confirmed || busyRef.current) {
      return
    }

    busyRef.current = true
    setPendingAction('withdraw')

    try {
      const next = await withdrawPost(post.id)
      cacheCommunityPost(queryClient, next)
      invalidateCommunityLists(queryClient)
      let sessionEnded = false
      try {
        await queryClient.fetchQuery({
          queryKey: queryKeys.community.comments(String(post.id), COMMENTS_LIMIT),
          queryFn: () => fetchComments(post.id, COMMENTS_LIMIT),
          retry: false,
        })
      } catch (error) {
        sessionEnded = isSessionEnd(error)
        report(error)
      }
      if (!sessionEnded) {
        message.success('手记已撤回')
      }
    } catch (error) {
      report(error)
    } finally {
      busyRef.current = false
      setPendingAction(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
          {POST_STATUS_LABEL[post.status]}
        </span>
        <Link to="/my-posts" className="text-sm text-stone-500 transition-colors hover:text-stone-950">
          返回我的手记
        </Link>
      </div>

      {post.status === 'hidden' ? (
        <p className="mt-6 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-700">手记已下架</p>
      ) : null}
      {post.status === 'pending' ? (
        <p className="mt-6 text-sm leading-6 text-stone-500">
          手记正在审核，暂时不能修改、撤回、评论或点赞。
        </p>
      ) : null}
      {post.status === 'rejected' ? (
        <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">拒绝原因</p>
          <p className="mt-1 whitespace-pre-wrap break-words">{post.reject_reason}</p>
        </div>
      ) : null}

      {canEdit ? (
        <Form<BodyFormValues>
          form={form}
          layout="vertical"
          className="mt-6"
          requiredMark={false}
          autoComplete="off"
          initialValues={{ body: post.body }}
          disabled={pendingAction !== null}
          onFinish={(values) => void save(values)}
        >
          <Form.Item
            label="正文"
            name="body"
            extra="去掉首尾空白后不超过 8000 个字符，可以换行。这是给别人看的创作说明，不是模型提示词。"
            rules={[
              {
                validator: (_, value: string | undefined) => {
                  const error = validatePostBody(value ?? '')
                  return error ? Promise.reject(new Error(error)) : Promise.resolve()
                },
              },
            ]}
          >
            <Input.TextArea rows={10} placeholder="写下这件设计的创作说明" />
          </Form.Item>
          {hints.length > 0 ? (
            <div className="mb-4 space-y-1">
              {hints.map((hint) => (
                <p key={hint} className="text-sm text-amber-700">
                  {hint}
                </p>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="primary" htmlType="submit" loading={pendingAction === 'save'}>
              保存正文
            </Button>
            <Button
              htmlType="button"
              loading={pendingAction === 'submit'}
              onClick={() => void submitForReview()}
            >
              提交审核
            </Button>
          </div>
        </Form>
      ) : (
        <p className="mt-6 whitespace-pre-wrap break-words text-base leading-7 text-stone-800">
          {post.body}
        </p>
      )}

      <div className="mt-4 space-y-1 text-sm text-stone-400">
        {createdAt ? <p>创建于 {createdAt}</p> : null}
        {updatedAt ? <p>更新于 {updatedAt}</p> : null}
        {publishedAt ? <p>发布于 {publishedAt}</p> : null}
        {reviewedAt ? <p>审核于 {reviewedAt}</p> : null}
      </div>

      {canWithdraw ? (
        <div className="mt-6">
          <p className="text-sm leading-6 text-stone-500">{withdrawNotice()}</p>
          <Button className="mt-3" loading={pendingAction === 'withdraw'} onClick={() => void withdraw()}>
            撤回手记
          </Button>
        </div>
      ) : null}

      {post.status !== 'published' ? (
        <p className="mt-6 text-sm text-stone-500">
          {post.like_count} 赞 · {post.comment_count} 评论
        </p>
      ) : null}

      <div className="mt-8">
        <PostDesignCard design={post.design} showStatus />
      </div>

      {post.status === 'published' ? <PostInteraction post={post} /> : null}
    </div>
  )
}
