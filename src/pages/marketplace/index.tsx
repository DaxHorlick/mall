import { useQuery } from '@tanstack/react-query'
import { Button, Empty, Result, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { fetchPublicDesigns, PUBLIC_DESIGNS_LIMIT } from '../../api/userDesigns.ts'
import { BoundImage } from '../../components/designs/BoundImage.tsx'
import { isSessionEnd } from '../../utils/userDesign.ts'

export function MarketplacePage() {
  const designsQuery = useQuery({
    queryKey: queryKeys.designs.publicList(PUBLIC_DESIGNS_LIMIT),
    queryFn: () => fetchPublicDesigns(PUBLIC_DESIGNS_LIMIT),
    retry: false,
  })

  const designs = Array.isArray(designsQuery.data?.items) ? designsQuery.data.items : []

  return (
    <div className="mx-auto min-h-[calc(100dvh-4.5rem)] max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div>
        <p className="text-xs font-medium tracking-[0.22em] text-stone-400">PUBLIC DESIGNS</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">设计广场</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
          已公开并通过审核的设计，按创建时间从新到旧，最多 {PUBLIC_DESIGNS_LIMIT} 件。不能搜索，也不能按创作者筛选。
        </p>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">公开设计</h2>
          <Link to="/my-designs/new" className="text-sm text-stone-500">
            去创作
          </Link>
        </div>

        {designsQuery.isPending ? (
          <div className="mt-8 flex justify-center">
            <Spin tip="加载公开设计…" />
          </div>
        ) : null}

        {designsQuery.isError ? (
          isSessionEnd(designsQuery.error) ? (
            <div className="mt-8 flex justify-center">
              <Spin tip="正在前往登录…" />
            </div>
          ) : (
            <div className="mt-6">
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
        ) : null}

        {designsQuery.isSuccess && designs.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] bg-white py-12 shadow-sm">
            <Empty description="还没有公开设计" />
          </div>
        ) : null}

        {designsQuery.isSuccess && designs.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {designs.map((design) => (
              <Link
                key={design.id}
                to={`/designs/${design.id}`}
                className="overflow-hidden rounded-[1.5rem] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="line-clamp-1 text-base font-medium text-stone-950">{design.title}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs text-stone-400">成品图</p>
                    {design.result?.url ? (
                      <BoundImage url={design.result.url} alt={design.title} />
                    ) : (
                      <div className="flex h-52 items-center justify-center rounded-2xl bg-stone-100 text-sm text-stone-500">
                        没有成品图
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-stone-400">预览图</p>
                    {design.preview?.url ? (
                      <BoundImage url={design.preview.url} alt={`${design.title}预览`} />
                    ) : (
                      <div className="flex h-52 items-center justify-center rounded-2xl bg-stone-100 text-sm text-stone-500">
                        没有预览图
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
