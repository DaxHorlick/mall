import { useQuery } from '@tanstack/react-query'
import { App, Button, Empty, Input, Modal, Spin } from 'antd'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/client.ts'
import { fetchDesignWorks } from '../../api/designs.ts'
import {
  fetchMarketplaceProducts,
  fetchProductById,
} from '../../api/products.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { DesignCard } from '../../components/designs/DesignCard.tsx'
import { ProductCard } from '../../components/products/ProductCard.tsx'
import { SafeImage } from '../../components/common/SafeImage.tsx'
import { productCategories } from '../../constants/navigation.ts'
import { useFavoritesStore } from '../../stores/favorites.ts'
import { formatPrice } from '../../utils/format.ts'

export function MarketplacePage() {
  const { message } = App.useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const favoriteIds = useFavoritesStore((state) => state.ids)

  const [keywordDraft, setKeywordDraft] = useState(searchParams.get('q') ?? '')
  const keyword = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const designId = searchParams.get('design')

  const designsQuery = useQuery({
    queryKey: queryKeys.designs.all,
    queryFn: fetchDesignWorks,
  })

  const productsQuery = useQuery({
    queryKey: queryKeys.products.marketplace(keyword, category),
    queryFn: () => fetchMarketplaceProducts({ keyword, category }),
  })

  const works = designsQuery.data
  const latestWorks = useMemo(() => {
    if (!works) {
      return []
    }
    return [...works]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4)
  }, [works])
  const hotWorks = useMemo(() => {
    if (!works) {
      return []
    }
    return works
      .filter((item) => Boolean(item.productId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4)
  }, [works])

  const activeDesign = works?.find((item) => item.id === designId) ?? null
  const relatedProductId = activeDesign?.productId ?? ''

  const relatedProductQuery = useQuery({
    queryKey: queryKeys.products.detail(relatedProductId),
    queryFn: () => fetchProductById(relatedProductId),
    enabled: Boolean(relatedProductId),
  })

  const applyFilters = (nextKeyword: string, nextCategory: string) => {
    const next = new URLSearchParams()
    if (nextKeyword.trim()) {
      next.set('q', nextKeyword.trim())
    }
    if (nextCategory) {
      next.set('category', nextCategory)
    }
    if (designId) {
      next.set('design', designId)
    }
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div>
        <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
          MARKETPLACE
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          创作者市场
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
          浏览最新与热门作品，筛选创作者商品，并跳转详情购买。
        </p>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">最新作品</h2>
          <Link to="/designer" className="text-sm text-stone-500">
            去创作
          </Link>
        </div>
        {designsQuery.isPending ? (
          <div className="mt-8 flex justify-center">
            <Spin />
          </div>
        ) : null}
        {designsQuery.isError ? (
          <p className="mt-4 text-sm text-red-600">
            {getErrorMessage(designsQuery.error, '作品加载失败')}
          </p>
        ) : null}
        {latestWorks.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {latestWorks.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">热门作品</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {hotWorks.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">商品搜索</h2>
        <div className="mt-5 flex flex-col gap-3 rounded-[1.5rem] bg-white p-4 shadow-sm md:flex-row md:items-center">
          <Input.Search
            allowClear
            placeholder="搜索商品或创作者"
            value={keywordDraft}
            loading={productsQuery.isFetching}
            onChange={(event) => setKeywordDraft(event.target.value)}
            onSearch={(value) => applyFilters(value, category)}
            className="md:flex-1"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type={!category ? 'primary' : 'default'}
              onClick={() => applyFilters(keywordDraft, '')}
            >
              全部
            </Button>
            {productCategories.map((item) => (
              <Button
                key={item.key}
                type={category === item.key ? 'primary' : 'default'}
                onClick={() => applyFilters(keywordDraft, item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {productsQuery.isPending ? (
          <div className="mt-8 flex justify-center">
            <Spin />
          </div>
        ) : null}

        {productsQuery.isError ? (
          <p className="mt-4 text-sm text-red-600">
            {getErrorMessage(productsQuery.error, '商品加载失败')}
          </p>
        ) : null}

        {productsQuery.isSuccess && productsQuery.data.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] bg-white py-12 shadow-sm">
            <Empty description="没有匹配的商品" />
          </div>
        ) : null}

        {productsQuery.isSuccess && productsQuery.data.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {productsQuery.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      <Modal
        open={Boolean(activeDesign)}
        title={activeDesign?.title}
        onCancel={() => {
          const next = new URLSearchParams(searchParams)
          next.delete('design')
          setSearchParams(next, { replace: true })
        }}
        footer={null}
        width={560}
      >
        {activeDesign ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-stone-100">
              <SafeImage
                src={activeDesign.imageUrl}
                alt={activeDesign.title}
                className="mx-auto max-h-72 w-full object-contain"
              />
            </div>
            <p className="text-sm text-stone-500">
              创作者{' '}
              <Link
                to={`/creators/${activeDesign.creatorId}`}
                className="text-stone-950 underline-offset-2 hover:underline"
              >
                {activeDesign.creatorName}
              </Link>
            </p>
            {activeDesign.prompt ? (
              <p className="text-sm text-stone-600">描述：{activeDesign.prompt}</p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              {relatedProductQuery.data ? (
                <>
                  <Button
                    onClick={() => {
                      const product = relatedProductQuery.data
                      const wasFavorited = favoriteIds.includes(product.id)
                      toggleFavorite(product.id)
                      message.success(
                        wasFavorited ? '已取消收藏' : '已收藏作品对应商品',
                      )
                    }}
                  >
                    {favoriteIds.includes(relatedProductQuery.data.id)
                      ? '取消收藏'
                      : '收藏作品'}
                  </Button>
                  <Link to={`/products/${relatedProductQuery.data.id}`}>
                    <Button type="primary">
                      购买 · {formatPrice(relatedProductQuery.data.price)}
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-stone-400">
                  {relatedProductId
                    ? '正在加载关联商品…'
                    : '该作品暂未关联可购商品'}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
