import { useQuery } from '@tanstack/react-query'
import { Empty, Spin } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { ApiError, getErrorMessage } from '../../api/client.ts'
import { fetchCreatorById } from '../../api/creators.ts'
import { fetchDesignWorks } from '../../api/designs.ts'
import { fetchProductsByCreator } from '../../api/products.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { DesignCard } from '../../components/designs/DesignCard.tsx'
import { ProductCard } from '../../components/products/ProductCard.tsx'
import { SafeImage } from '../../components/common/SafeImage.tsx'

export function CreatorPage() {
  const { id = '' } = useParams()

  const creatorQuery = useQuery({
    queryKey: queryKeys.creators.detail(id),
    queryFn: () => fetchCreatorById(id),
    enabled: Boolean(id),
  })

  const productsQuery = useQuery({
    queryKey: queryKeys.creators.products(id),
    queryFn: () => fetchProductsByCreator(id),
    enabled: Boolean(id) && creatorQuery.isSuccess,
  })

  const designsQuery = useQuery({
    queryKey: queryKeys.designs.all,
    queryFn: fetchDesignWorks,
    enabled: Boolean(id) && creatorQuery.isSuccess,
  })

  const works = (designsQuery.data ?? []).filter(
    (item) => item.creatorId === id,
  )

  if (!id || creatorQuery.isError) {
    const notFound =
      creatorQuery.error instanceof ApiError && creatorQuery.error.status === 404
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <Empty
          description={
            notFound
              ? '找不到该创作者'
              : getErrorMessage(creatorQuery.error, '创作者加载失败')
          }
        >
          <Link to="/marketplace" className="text-sm text-stone-600 underline">
            返回创作者市场
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

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <section className="flex flex-col gap-5 rounded-[2rem] bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
        <SafeImage
          src={creator.avatarUrl}
          alt={creator.name}
          className="h-24 w-24 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-[0.18em] text-stone-400">CREATOR</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {creator.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            {creator.bio}
          </p>
          <p className="mt-3 text-sm text-stone-500">
            {creator.productCount} 件商品
            <span className="mx-2 text-stone-300">·</span>
            {creator.followerCount.toLocaleString('zh-CN')} 关注
          </p>
        </div>
        <Link
          to="/marketplace"
          className="text-sm text-stone-500 transition-colors hover:text-stone-950"
        >
          返回市场
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">发布的商品</h2>
        {productsQuery.isPending ? (
          <div className="mt-6 flex justify-center">
            <Spin />
          </div>
        ) : null}
        {productsQuery.isSuccess && productsQuery.data.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">暂无商品</p>
        ) : null}
        {productsQuery.data && productsQuery.data.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {productsQuery.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">设计作品</h2>
        {works.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">暂无作品</p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {works.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
