import type { ProductCategoryKey, ProductQuery, ProductSort } from '../types/product.ts'

const SORT_VALUES: ProductSort[] = ['newest', 'price-asc', 'price-desc']
const CATEGORY_VALUES: ProductCategoryKey[] = [
  'graphic',
  'plain',
  'oversized',
  'limited',
]

export const DEFAULT_PRODUCT_PAGE_SIZE = 8

function parsePositiveInt(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }

  return Math.floor(parsed)
}

function parsePrice(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

export function parseProductQuery(
  params: URLSearchParams,
): Required<
  Pick<ProductQuery, 'page' | 'pageSize' | 'sort' | 'forceError'>
> &
  ProductQuery {
  const categoryRaw = params.get('category')
  const sortRaw = params.get('sort')
  const category =
    categoryRaw && CATEGORY_VALUES.includes(categoryRaw as ProductCategoryKey)
      ? (categoryRaw as ProductCategoryKey)
      : ''
  const sort =
    sortRaw && SORT_VALUES.includes(sortRaw as ProductSort)
      ? (sortRaw as ProductSort)
      : 'newest'

  return {
    keyword: params.get('keyword')?.trim() ?? '',
    category,
    minPrice: parsePrice(params.get('minPrice')),
    maxPrice: parsePrice(params.get('maxPrice')),
    sort,
    page: parsePositiveInt(params.get('page')) ?? 1,
    pageSize: DEFAULT_PRODUCT_PAGE_SIZE,
    forceError: params.get('error') === '1',
  }
}

export function productQueryToSearchParams(query: ProductQuery) {
  const next = new URLSearchParams()

  if (query.keyword?.trim()) {
    next.set('keyword', query.keyword.trim())
  }

  if (query.category) {
    next.set('category', query.category)
  }

  if (query.minPrice !== null && query.minPrice !== undefined) {
    next.set('minPrice', String(query.minPrice))
  }

  if (query.maxPrice !== null && query.maxPrice !== undefined) {
    next.set('maxPrice', String(query.maxPrice))
  }

  if (query.sort && query.sort !== 'newest') {
    next.set('sort', query.sort)
  }

  if (query.page && query.page > 1) {
    next.set('page', String(query.page))
  }

  if (query.forceError) {
    next.set('error', '1')
  }

  return next
}
