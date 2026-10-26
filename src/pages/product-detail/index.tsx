import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ApiError, getErrorMessage } from '../../api/client.ts'
import { fetchProductById, fetchRelatedProducts } from '../../api/products.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { ProductCard } from '../../components/products/ProductCard.tsx'
import { ProductCreatorCard } from '../../components/products/ProductCreatorCard.tsx'
import {
  ProductDetailError,
  ProductDetailLoading,
  ProductDetailNotFound,
} from '../../components/products/ProductDetailStates.tsx'
import { ProductPurchasePanel } from '../../components/products/ProductPurchasePanel.tsx'
import { SafeImage } from '../../components/common/SafeImage.tsx'
import { getCategoryLabel } from '../../constants/navigation.ts'
import { formatPrice } from '../../utils/format.ts'

export function ProductDetailPage() {
  const { id = '' } = useParams()

  const detailQuery = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: Boolean(id),
  })

  const relatedQuery = useQuery({
    queryKey: queryKeys.products.related(id),
    queryFn: () => fetchRelatedProducts(id),
    enabled: Boolean(id) && detailQuery.isSuccess,
  })

  if (!id) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <ProductDetailNotFound />
      </div>
    )
  }

  if (detailQuery.isPending) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <ProductDetailLoading />
      </div>
    )
  }

  if (detailQuery.isError) {
    const notFound =
      detailQuery.error instanceof ApiError && detailQuery.error.status === 404

    return (
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        {notFound ? (
          <ProductDetailNotFound />
        ) : (
          <ProductDetailError
            message={getErrorMessage(detailQuery.error, '商品详情加载失败')}
            onRetry={() => {
              void detailQuery.refetch()
            }}
          />
        )}
      </div>
    )
  }

  const product = detailQuery.data
  const categoryLabel = getCategoryLabel(product.category)

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <Link to="/products" className="transition-colors hover:text-stone-950">
          商品
        </Link>
        <span aria-hidden="true">/</span>
        {categoryLabel ? (
          <>
            <Link
              to={`/products?category=${product.category}`}
              className="transition-colors hover:text-stone-950"
            >
              {categoryLabel}
            </Link>
            <span aria-hidden="true">/</span>
          </>
        ) : null}
        <span className="text-stone-950">{product.name}</span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
          <div className="aspect-[5/6] bg-stone-200">
            <SafeImage
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
              PRODUCT
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
              {formatPrice(product.price)}
            </p>
            <p className="mt-4 text-sm leading-7 text-stone-600 md:text-base">
              {product.description}
            </p>
          </div>

          <ProductPurchasePanel key={product.id} product={product} />

          <ProductCreatorCard
            creatorId={product.creatorId}
            creatorName={product.creatorName}
          />
        </div>
      </div>

      <section className="mt-14 md:mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
              YOU MAY ALSO LIKE
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              推荐商品
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm text-stone-500 transition-colors hover:text-stone-950"
          >
            查看全部
          </Link>
        </div>

        {relatedQuery.isPending ? (
          <p className="mt-6 text-sm text-stone-500">正在加载推荐商品…</p>
        ) : null}

        {relatedQuery.isSuccess && relatedQuery.data.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-5">
            {relatedQuery.data.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
