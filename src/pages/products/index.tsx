import { useQuery } from '@tanstack/react-query'
import { Button, Pagination } from 'antd'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/client.ts'
import { fetchProducts } from '../../api/products.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { getCategoryLabel } from '../../constants/navigation.ts'
import {
  ProductListEmpty,
  ProductListError,
  ProductListLoading,
} from '../../components/products/ProductListStates.tsx'
import {
  ProductListFilters,
  type ProductFilterDraft,
} from '../../components/products/ProductListFilters.tsx'
import { ProductCard } from '../../components/products/ProductCard.tsx'
import {
  parseProductQuery,
  productQueryToSearchParams,
} from '../../utils/productQuery.ts'

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(() => parseProductQuery(searchParams), [searchParams])

  const listQuery = useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => fetchProducts(query),
  })

  const filterDraft: ProductFilterDraft = {
    category: query.category ?? '',
    minPrice: query.minPrice ?? null,
    maxPrice: query.maxPrice ?? null,
    sort: query.sort ?? 'newest',
  }

  const updateParams = (
    patch: Partial<typeof query>,
    options?: { resetPage?: boolean },
  ) => {
    const nextQuery = {
      ...query,
      ...patch,
    }

    if (options?.resetPage !== false && patch.page === undefined) {
      nextQuery.page = 1
    }

    setSearchParams(productQueryToSearchParams(nextQuery), { replace: true })
  }

  const clearFilters = () => {
    setSearchParams(
      productQueryToSearchParams({
        keyword: query.keyword,
        page: 1,
        sort: 'newest',
      }),
      { replace: true },
    )
  }

  const categoryLabel = getCategoryLabel(query.category || null)
  const keyword = query.keyword?.trim() ?? ''
  const total = listQuery.data?.total ?? 0
  const pageSize = listQuery.data?.pageSize ?? query.pageSize ?? 8
  const currentPage = listQuery.data?.page ?? query.page ?? 1

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            PRODUCTS
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            商品列表
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
            支持关键词搜索、分类、价格区间和排序。顶部搜索框与首页分类入口会把条件带到这里。
          </p>
          {(keyword || categoryLabel) && (
            <p className="mt-3 text-sm text-stone-600">
              {keyword ? `关键词「${keyword}」` : null}
              {keyword && categoryLabel ? ' · ' : null}
              {categoryLabel ? `分类「${categoryLabel}」` : null}
            </p>
          )}
        </div>
        <Link
          to="/designer"
          className="text-sm text-stone-500 transition-colors hover:text-stone-950"
        >
          去 AI 设计
        </Link>
      </div>

      <div className="mt-8 space-y-6">
        <ProductListFilters
          value={filterDraft}
          loading={listQuery.isFetching}
          resultCount={listQuery.isSuccess ? total : undefined}
          onChange={(next) =>
            updateParams({
              category: next.category,
              minPrice: next.minPrice,
              maxPrice: next.maxPrice,
              sort: next.sort,
            })
          }
          onReset={clearFilters}
        />

        {listQuery.isPending ? <ProductListLoading /> : null}

        {listQuery.isError ? (
          <ProductListError
            message={getErrorMessage(listQuery.error, '商品列表加载失败')}
            onRetry={() => {
              if (query.forceError) {
                updateParams({ forceError: false }, { resetPage: false })
                return
              }
              void listQuery.refetch()
            }}
          />
        ) : null}

        {listQuery.isSuccess && total === 0 ? (
          <ProductListEmpty
            action={
              <Button type="primary" onClick={clearFilters}>
                清空筛选
              </Button>
            }
          />
        ) : null}

        {listQuery.isSuccess && total > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {listQuery.data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="flex justify-center pt-4 pb-8">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                showSizeChanger={false}
                onChange={(page) => updateParams({ page }, { resetPage: false })}
              />
            </div>
          </>
        ) : null}

        <p className="pb-8 text-center text-xs text-stone-400">
          调试错误态：在地址栏追加{' '}
          <button
            type="button"
            className="cursor-pointer bg-transparent p-0 text-xs text-stone-500 underline"
            onClick={() => updateParams({ forceError: true, page: 1 })}
          >
            ?error=1
          </button>
        </p>
      </div>
    </div>
  )
}
