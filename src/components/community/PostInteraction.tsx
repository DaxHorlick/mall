import { useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Form, Input } from 'antd'
import { useRef, useState, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  COMMENTS_LIMIT,
  createComment,
  fetchComments,
  likePost,
  unlikePost,
} from '../../api/community.ts'
import { getErrorMessage } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { useAuthStore } from '../../stores/auth.ts'
import type { CommunityPost, PostComment } from '../../types/community.ts'
import { cacheCommunityPost, validateComment } from '../../utils/community.ts'
import { formatDesignTime, isRateLimited, isSessionEnd } from '../../utils/userDesign.ts'

type CommentFormValues = {
  content: string
}

function CommentItem({ comment }: { comment: PostComment }) {
  const [failed, setFailed] = useState(false)
  const time = formatDesignTime(comment.created_at)
  const initial = Array.from(comment.nickname)[0]

  return (
    <li className="flex gap-3">
      {comment.avatar_url && !failed ? (
        <img
          src={comment.avatar_url}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 text-sm text-stone-600">
          {initial || ''}
        </span>
      )}
      <div className="min-w-0 flex-1">
        {comment.nickname ? (
          <p className="text-sm font-medium text-stone-800">{comment.nickname}</p>
        ) : null}
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">
          {comment.content}
        </p>
        {time ? <p className="mt-1 text-xs text-stone-400">{time}</p> : null}
      </div>
    </li>
  )
}

export function PostInteraction({ post }: { post: CommunityPost }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const status = useAuthStore((s) => s.status)
  const [form] = Form.useForm<CommentFormValues>()
  const likeLock = useRef(false)
  const commentLock = useRef(false)
  const [liking, setLiking] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [likeLimited, setLikeLimited] = useState<string | null>(null)
  const [commentLimited, setCommentLimited] = useState<string | null>(null)

  const commentsKey = queryKeys.community.comments(String(post.id), COMMENTS_LIMIT)
  const commentsQuery = useQuery({
    queryKey: commentsKey,
    queryFn: () => fetchComments(post.id, COMMENTS_LIMIT),
    retry: false,
  })

  const comments = Array.isArray(commentsQuery.data?.items) ? commentsQuery.data.items : []

  const ensureLogin = () => {
    if (status === 'authenticated') {
      return true
    }

    if (status === 'anonymous') {
      const from = `${location.pathname}${location.search}`
      navigate('/login', { state: { from } })
    }

    return false
  }

  const toggleLike = async () => {
    if (likeLock.current || likeLimited) {
      return
    }

    if (!ensureLogin()) {
      return
    }

    likeLock.current = true
    setLiking(true)

    try {
      const next = post.liked ? await unlikePost(post.id) : await likePost(post.id)
      cacheCommunityPost(queryClient, next)
    } catch (error) {
      if (isSessionEnd(error)) {
        return
      }

      if (isRateLimited(error)) {
        setLikeLimited(getErrorMessage(error))
      }

      message.error(getErrorMessage(error))
    } finally {
      likeLock.current = false
      setLiking(false)
    }
  }

  const submitComment = async (values: CommentFormValues) => {
    if (commentLock.current || commentLimited) {
      return
    }

    if (!ensureLogin()) {
      return
    }

    if (commentsQuery.isPending) {
      return
    }

    const content = values.content ?? ''
    const error = validateComment(content)
    if (error) {
      message.error(error)
      return
    }

    commentLock.current = true
    setCommenting(true)

    try {
      const comment = await createComment(post.id, content.trim())
      queryClient.setQueryData<{ items: PostComment[] }>(commentsKey, (current) => {
        const items = Array.isArray(current?.items) ? [...current.items] : []
        if (items.some((item) => item.id === comment.id)) {
          return { items }
        }
        items.push(comment)
        return { items }
      })
      queryClient.setQueryData<CommunityPost>(queryKeys.community.post(String(post.id)), (current) => {
        if (!current) {
          return current
        }
        return { ...current, comment_count: current.comment_count + 1 }
      })
      form.resetFields()
      message.success('评论已发表')
    } catch (error) {
      if (isSessionEnd(error)) {
        return
      }

      if (isRateLimited(error)) {
        setCommentLimited(getErrorMessage(error))
      }

      message.error(getErrorMessage(error))
    } finally {
      commentLock.current = false
      setCommenting(false)
    }
  }

  const blockGuestSubmit = (event: MouseEvent<HTMLElement>) => {
    if (status === 'authenticated') {
      return
    }

    event.preventDefault()
    ensureLogin()
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type={post.liked ? 'primary' : 'default'}
          loading={liking}
          disabled={Boolean(likeLimited) || status === 'unknown'}
          aria-pressed={post.liked}
          onClick={() => void toggleLike()}
        >
          {post.liked ? '取消点赞' : '点赞'}
        </Button>
        <p className="text-sm text-stone-500">
          {post.like_count} 赞 · {post.comment_count} 评论
        </p>
      </div>
      {likeLimited ? <p className="mt-3 text-sm text-amber-700">{likeLimited}</p> : null}

      <div className="mt-8">
        <h2 className="text-lg font-medium text-stone-950">评论</h2>
        {commentsQuery.isPending ? (
          <p className="mt-4 text-sm text-stone-500">加载评论…</p>
        ) : null}
        {commentsQuery.isError ? (
          isSessionEnd(commentsQuery.error) ? (
            <p className="mt-4 text-sm text-stone-500">正在前往登录…</p>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-stone-600">{getErrorMessage(commentsQuery.error)}</p>
              <Button className="mt-3" onClick={() => void commentsQuery.refetch()}>
                重试
              </Button>
            </div>
          )
        ) : null}
        {commentsQuery.isSuccess && comments.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">还没有评论</p>
        ) : null}
        {commentsQuery.isSuccess && comments.length > 0 ? (
          <ul className="mt-4 space-y-5">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </ul>
        ) : null}
        {commentsQuery.isSuccess && post.comment_count > comments.length ? (
          <p className="mt-4 text-xs text-stone-400">这里显示最新的 {COMMENTS_LIMIT} 条评论。</p>
        ) : null}
      </div>

      <Form<CommentFormValues>
        form={form}
        layout="vertical"
        className="mt-6"
        requiredMark={false}
        autoComplete="off"
        disabled={commenting || Boolean(commentLimited)}
        onFinish={(values) => void submitComment(values)}
      >
        <Form.Item
          label="发表评论"
          name="content"
          extra="去掉首尾空白后 1 到 500 个字符，可以换行。"
          rules={[
            {
              validator: (_, value: string | undefined) => {
                const error = validateComment(value ?? '')
                return error ? Promise.reject(new Error(error)) : Promise.resolve()
              },
            },
          ]}
        >
          <Input.TextArea rows={4} placeholder="写下你的看法" />
        </Form.Item>
        {commentLimited ? <p className="mb-4 text-sm text-amber-700">{commentLimited}</p> : null}
        <Button
          type="primary"
          htmlType="submit"
          loading={commenting}
          disabled={
            Boolean(commentLimited) ||
            status === 'unknown' ||
            (status === 'authenticated' && commentsQuery.isPending)
          }
          onClick={blockGuestSubmit}
        >
          发表评论
        </Button>
      </Form>
    </section>
  )
}
