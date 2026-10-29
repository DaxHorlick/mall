import { useQuery } from '@tanstack/react-query'
import { Button, Empty, Result, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { fetchMyPosts, MY_POSTS_LIMIT } from '../../api/community.ts'
import { getErrorMessage, isSessionEnd } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { POST_STATUS_LABEL } from '../../utils/community.ts'

export function MyPostsPage() {
  const postsQuery = useQuery({
    queryKey: queryKeys.community.mine(MY_POSTS_LIMIT),
    queryFn: () => fetchMyPosts(MY_POSTS_LIMIT),
    retry: false,
    refetchOnMount: 'always',
  })

  if (postsQuery.isPending) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" tip="加载我的手记…" />
      </div>
    )
  }

  if (postsQuery.isError) {
    if (isSessionEnd(postsQuery.error)) {
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
          title={getErrorMessage(postsQuery.error)}
          extra={
            <Button type="primary" onClick={() => void postsQuery.refetch()}>
              重试
            </Button>
          }
        />
      </div>
    )
  }

  const posts = Array.isArray(postsQuery.data.items) ? postsQuery.data.items : []

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">MY NOTES</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">我的手记</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
            当前账号的创作手记，包含草稿、审核中、已发布、已拒绝和已下架。列表只取最新 {MY_POSTS_LIMIT} 篇。
          </p>
        </div>
        <Link to="/my-posts/new">
          <Button type="primary">写手记</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] bg-white py-16 shadow-sm">
          <Empty description="还没有手记">
            <Link to="/my-posts/new">
              <Button type="primary">写手记</Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/community/${post.id}`}
              className="rounded-[1.5rem] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">
                {post.body.trim() ? post.body : '还没有正文'}
              </p>
              <h2 className="mt-4 text-base font-medium text-stone-950">{post.design.title}</h2>
              <p className="mt-2 text-sm text-stone-500">{POST_STATUS_LABEL[post.status]}</p>
              {post.reject_reason ? (
                <p className="mt-2 line-clamp-2 text-sm text-amber-800">拒绝原因：{post.reject_reason}</p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
