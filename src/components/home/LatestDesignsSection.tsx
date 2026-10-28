import { Button, Empty, Result, Spin } from 'antd'
import { Link } from 'react-router-dom'
import type { PublicDesign } from '../../types/userDesign.ts'

type LatestDesignsSectionProps = {
  designs: PublicDesign[]
  loading: boolean
  error: string | null
  sessionEnded: boolean
  onRetry: () => void
}

function coverUrl(design: PublicDesign) {
  return design.result?.url || design.preview?.url || null
}

export function LatestDesignsSection({
  designs,
  loading,
  error,
  sessionEnded,
  onRetry,
}: LatestDesignsSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">PUBLIC DESIGNS</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">设计广场</h2>
        </div>
        <Link to="/marketplace" className="text-sm text-stone-500 transition-colors hover:text-stone-950">
          查看全部
        </Link>
      </div>

      {loading || sessionEnded ? (
        <div className="mt-8 flex justify-center">
          <Spin tip={sessionEnded ? '正在前往登录…' : '加载公开设计…'} />
        </div>
      ) : null}

      {error && !sessionEnded ? (
        <div className="mt-6">
          <Result
            status="warning"
            title={error}
            extra={
              <Button type="primary" onClick={onRetry}>
                重试
              </Button>
            }
          />
        </div>
      ) : null}

      {!loading && !error && designs.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] bg-white py-12 shadow-sm">
          <Empty description="还没有公开设计" />
        </div>
      ) : null}

      {!loading && !error && designs.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {designs.map((design) => {
            const imageUrl = coverUrl(design)
            return (
              <Link
                key={design.id}
                to={`/designs/${design.id}`}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-stone-100">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={design.title}
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="px-3 text-center text-sm text-stone-500">尚未生成</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 text-base font-medium text-stone-950">{design.title}</h3>
                </div>
              </Link>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
