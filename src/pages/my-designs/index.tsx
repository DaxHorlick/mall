import { useQuery } from '@tanstack/react-query'
import { Button, Empty, Result, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { fetchMyDesigns, MY_DESIGNS_LIMIT } from '../../api/userDesigns.ts'
import { getErrorMessage } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { BoundImage } from '../../components/designs/BoundImage.tsx'
import {
  ORIGIN_LABEL,
  REVIEW_STATUS_LABEL,
  VISIBILITY_LABEL,
  isSessionEnd,
} from '../../utils/userDesign.ts'

export function MyDesignsPage() {
  const designsQuery = useQuery({
    queryKey: queryKeys.designs.mine(MY_DESIGNS_LIMIT),
    queryFn: () => fetchMyDesigns(MY_DESIGNS_LIMIT),
    retry: false,
    refetchOnMount: 'always',
  })

  if (designsQuery.isPending) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" tip="加载我的设计…" />
      </div>
    )
  }

  if (designsQuery.isError) {
    if (isSessionEnd(designsQuery.error)) {
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
          title={getErrorMessage(designsQuery.error)}
          extra={
            <Button type="primary" onClick={() => void designsQuery.refetch()}>
              重试
            </Button>
          }
        />
      </div>
    )
  }

  const items = Array.isArray(designsQuery.data.items) ? designsQuery.data.items : []

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">MY DESIGNS</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">我的设计</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
            这里是当前账号的设计，包含草稿和未公开作品。列表只取最新 {MY_DESIGNS_LIMIT} 件。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/my-designs/new">
            <Button type="primary">创建 AI 设计</Button>
          </Link>
          <Link to="/my-designs/upload">
            <Button>上传设计</Button>
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] bg-white py-16 shadow-sm">
          <Empty description="还没有设计">
            <Link to="/my-designs/new">
              <Button type="primary">创建 AI 设计</Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((design) => (
            <Link
              key={design.id}
              to={`/designs/${design.id}`}
              className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {design.result?.url ? (
                <BoundImage url={design.result.url} alt={design.title} />
              ) : (
                <div className="flex h-52 items-center justify-center bg-stone-100 text-sm text-stone-500">
                  尚未生成
                </div>
              )}
              <div className="space-y-1 p-4">
                <h2 className="line-clamp-1 text-base font-medium text-stone-950">{design.title}</h2>
                <p className="text-sm text-stone-500">
                  {ORIGIN_LABEL[design.origin]} · {REVIEW_STATUS_LABEL[design.review_status]} ·{' '}
                  {VISIBILITY_LABEL[design.visibility]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
