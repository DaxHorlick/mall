import { useQuery } from '@tanstack/react-query'
import { Button, Empty, Result, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { fetchPublicPosts, PUBLIC_POSTS_LIMIT } from '../../api/community.ts'
import { getErrorMessage, isSessionEnd } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { PublicPostCard } from '../../components/community/PublicPostCard.tsx'

export function CommunityPage() {
  const postsQuery = useQuery({
    queryKey: queryKeys.community.publicList(PUBLIC_POSTS_LIMIT),
    queryFn: () => fetchPublicPosts({ limit: PUBLIC_POSTS_LIMIT }),
    retry: false,
  })

  const posts = Array.isArray(postsQuery.data?.items) ? postsQuery.data.items : []

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">NOTES</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">创作手记</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
            已发布的创作说明，按发布时间从新到旧，最多 {PUBLIC_POSTS_LIMIT} 篇。
          </p>
        </div>
        <Link to="/my-posts/new" className="text-sm text-stone-500 transition-colors hover:text-stone-950">
          写手记
        </Link>
      </div>

      {postsQuery.isPending ? (
        <div className="mt-10 flex justify-center">
          <Spin tip="加载手记…" />
        </div>
      ) : null}

      {postsQuery.isError ? (
        isSessionEnd(postsQuery.error) ? (
          <div className="mt-10 flex justify-center">
            <Spin tip="正在前往登录…" />
          </div>
        ) : (
          <div className="mt-8">
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
      ) : null}

      {postsQuery.isSuccess && posts.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] bg-white py-16 shadow-sm">
          <Empty description="还没有公开手记" />
        </div>
      ) : null}

      {postsQuery.isSuccess && posts.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <PublicPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
