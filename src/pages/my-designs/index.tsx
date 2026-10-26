import { useQuery } from '@tanstack/react-query'
import { Button, Empty, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { queryKeys } from '../../api/queryKeys.ts'
import { fetchCurrentUser } from '../../api/users.ts'
import { TeePreview } from '../../components/designer/TeePreview.tsx'
import { SafeImage } from '../../components/common/SafeImage.tsx'
import { useDesignsStore } from '../../stores/designs.ts'
import { DEFAULT_PREVIEW_CONFIG } from '../../types/design.ts'

export function MyDesignsPage() {
  // 选择器必须返回稳定引用；在组件内再 filter，避免每次新建数组导致无限重渲染
  const allWorks = useDesignsStore((state) => state.works)
  const userQuery = useQuery({
    queryKey: queryKeys.user.current,
    queryFn: fetchCurrentUser,
  })
  const works = allWorks.filter(
    (item) => item.creatorId === userQuery.data?.creatorId,
  )

  if (userQuery.isPending) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" tip="加载我的设计…" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            MY DESIGNS
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            我的设计
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
            展示当前 Mock 创作者账号下的作品，包含 AI 设计器保存的本地数据。
          </p>
        </div>
        <Link to="/designer">
          <Button type="primary">去 AI 设计</Button>
        </Link>
      </div>

      {works.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] bg-white py-16 shadow-sm">
          <Empty description="还没有设计作品">
            <Link to="/designer">
              <Button type="primary">开始创作</Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {works.map((work) => (
            <article
              key={work.id}
              className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm"
            >
              <div className="grid gap-4 p-4 md:grid-cols-2 md:p-5">
                <TeePreview
                  patternUrl={work.imageUrl}
                  config={work.preview ?? {
                    ...DEFAULT_PREVIEW_CONFIG,
                    teeColor: '#171717',
                  }}
                  teeStyle={work.teeStyle}
                  className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-stone-100"
                />
                <div className="flex flex-col">
                  <div className="overflow-hidden rounded-xl bg-stone-50 p-3">
                    <SafeImage
                      src={work.imageUrl}
                      alt={work.title}
                      className="mx-auto h-28 w-auto object-contain"
                    />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-stone-950">
                    {work.title}
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {work.createdAt}
                    {work.isMock ? ' · 本地模拟' : null}
                  </p>
                  {work.prompt ? (
                    <p className="mt-3 line-clamp-3 text-sm text-stone-600">
                      {work.prompt}
                    </p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap gap-3 pt-4">
                    {work.productId ? (
                      <Link to={`/products/${work.productId}`}>
                        <Button>查看商品</Button>
                      </Link>
                    ) : (
                      <Link to="/seller/products?fromDesign=1">
                        <Button type="primary">发布为商品</Button>
                      </Link>
                    )}
                    <Link to={`/marketplace?design=${work.id}`}>
                      <Button type="link">作品详情</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
