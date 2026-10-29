import { useQuery } from '@tanstack/react-query'
import { Button, Empty, Result, Spin } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { ApiError, getErrorMessage, isAccountDisabled, isSessionEnd } from '../../api/client.ts'
import { fetchPublicPosts, PUBLIC_POSTS_LIMIT } from '../../api/community.ts'
import { fetchPublicCreator } from '../../api/creators.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { SafeImage } from '../../components/common/SafeImage.tsx'
import { PublicPostCard } from '../../components/community/PublicPostCard.tsx'

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('zh-CN', { hour12: false })
}

export function CreatorPage() {
  const { userId = '' } = useParams()

  const creatorQuery = useQuery({
    queryKey: queryKeys.creators.publicProfile(userId),
    queryFn: () => fetchPublicCreator(userId),
    enabled: Boolean(userId),
    retry: false,
  })

  const authorUserId = creatorQuery.data?.user_id
  const postsQuery = useQuery({
    queryKey: queryKeys.community.publicList(PUBLIC_POSTS_LIMIT, authorUserId),
    queryFn: () => {
      if (typeof authorUserId !== 'number' || authorUserId <= 0) {
        throw new Error('作者 ID 不正确')
      }

      return fetchPublicPosts({
        limit: PUBLIC_POSTS_LIMIT,
        authorUserId,
      })
    },
    enabled: creatorQuery.isSuccess && typeof authorUserId === 'number' && authorUserId > 0,
    retry: false,
  })

  if (!userId || creatorQuery.isError) {
    const error = creatorQuery.error
    if (error instanceof ApiError && (error.status === 401 || isAccountDisabled(error))) {
      return (
        <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
          <Spin size="large" tip="正在前往登录…" />
        </div>
      )
    }

    const notFound = error instanceof ApiError && error.status === 404
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <Empty description={notFound ? '创作者不存在' : getErrorMessage(error, '创作者加载失败')}>
          <Link to="/" className="text-sm text-stone-600 underline">
            返回首页
          </Link>
        </Empty>
      </div>
    )
  }

  if (creatorQuery.isPending || !creatorQuery.data) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" tip="加载创作者…" />
      </div>
    )
  }

  const creator = creatorQuery.data
  const posts = Array.isArray(postsQuery.data?.items) ? postsQuery.data.items : []
  const initial = Array.from(creator.nickname)[0] || Array.from(creator.display_name)[0] || '创'

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <section className="flex flex-col gap-5 rounded-[2rem] bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
        {creator.avatar_url ? (
          <SafeImage
            src={creator.avatar_url}
            alt={creator.display_name}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-200 text-2xl font-semibold text-stone-700">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-[0.18em] text-stone-400">CREATOR</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{creator.display_name}</h1>
          <p className="mt-2 text-sm text-stone-500">昵称 {creator.nickname}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            {creator.bio || '还没有简介'}
          </p>
          <p className="mt-3 text-sm text-stone-400">加入于 {formatDateTime(creator.created_at)}</p>
        </div>
        <Link to="/" className="text-sm text-stone-500 transition-colors hover:text-stone-950">
          返回首页
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold tracking-tight">公开手记</h2>
        {postsQuery.isPending ? (
          <div className="mt-6 flex justify-center">
            <Spin tip="加载手记…" />
          </div>
        ) : null}
        {postsQuery.isError ? (
          isSessionEnd(postsQuery.error) ? (
            <div className="mt-6 flex justify-center">
              <Spin tip="正在前往登录…" />
            </div>
          ) : (
            <div className="mt-6">
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
          <div className="mt-6 rounded-[1.5rem] bg-white py-12 shadow-sm">
            <Empty description="还没有公开手记" />
          </div>
        ) : null}
        {postsQuery.isSuccess && posts.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {posts.map((post) => (
              <PublicPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
