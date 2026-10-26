import { ApiError, request, toQueryString } from './client.ts'
import { isMockMode, mockDelay } from './config.ts'
import {
  getHotProducts,
  getProductById,
  getRelatedProducts,
  getRecommendedProducts,
  mockProducts,
  queryMockProducts,
} from '../mocks/products.ts'
import type { Product, ProductListResult, ProductQuery } from '../types/product.ts'

function toListQuery(query: ProductQuery) {
  return toQueryString({
    keyword: query.keyword,
    category: query.category || undefined,
    minPrice: query.minPrice ?? undefined,
    maxPrice: query.maxPrice ?? undefined,
    sort: query.sort,
    page: query.page,
    pageSize: query.pageSize,
  })
}

/** 商品列表。Mock 本地筛选；真实模式请求 Go `/products`（尚未实现） */
export async function fetchProducts(
  query: ProductQuery = {},
): Promise<ProductListResult> {
  if (isMockMode()) {
    await mockDelay(420)
    if (query.forceError) {
      throw new ApiError(500, '模拟请求失败，请稍后重试')
    }
    return queryMockProducts(query)
  }

  // TODO(backend): Go 商品列表接口尚未实现
  return request<ProductListResult>(`/products${toListQuery(query)}`)
}

/** 商品详情 */
export async function fetchProductById(id: string): Promise<Product> {
  if (isMockMode()) {
    await mockDelay(420)
    const product = getProductById(id)
    if (!product) {
      throw new ApiError(404, '商品不存在或已下架')
    }
    return product
  }

  // TODO(backend): Go 商品详情接口尚未实现
  return request<Product>(`/products/${id}`)
}

/** 详情页推荐商品 */
export async function fetchRelatedProducts(
  productId: string,
  limit = 4,
): Promise<Product[]> {
  if (isMockMode()) {
    await mockDelay(280)
    return getRelatedProducts(productId, limit)
  }

  // TODO(backend): Go 推荐商品接口尚未实现
  return request<Product[]>(
    `/products/${productId}/related${toQueryString({ limit })}`,
  )
}

export async function fetchHotProducts(): Promise<Product[]> {
  if (isMockMode()) {
    await mockDelay(200)
    return getHotProducts()
  }

  // TODO(backend): Go 热门商品接口尚未实现
  return request<Product[]>('/products/hot')
}

export async function fetchRecommendedProducts(): Promise<Product[]> {
  if (isMockMode()) {
    await mockDelay(200)
    return getRecommendedProducts()
  }

  // TODO(backend): Go 推荐商品接口尚未实现
  return request<Product[]>('/products/recommended')
}

/** 创作者市场商品筛选（轻量列表，不分页） */
export async function fetchMarketplaceProducts(input: {
  keyword?: string
  category?: string
}): Promise<Product[]> {
  if (isMockMode()) {
    await mockDelay(240)
    const needle = input.keyword?.trim().toLowerCase() ?? ''
    const category = input.category ?? ''
    return mockProducts.filter((item) => {
      const matchKeyword =
        !needle ||
        [item.name, item.creatorName, item.description]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      const matchCategory = !category || item.category === category
      return matchKeyword && matchCategory
    })
  }

  // TODO(backend): Go 市场商品接口尚未实现
  return request<Product[]>(
    `/marketplace/products${toQueryString({
      keyword: input.keyword,
      category: input.category,
    })}`,
  )
}

/** 创作者发布的商品 */
export async function fetchProductsByCreator(
  creatorId: string,
): Promise<Product[]> {
  if (isMockMode()) {
    await mockDelay(220)
    return mockProducts.filter((item) => item.creatorId === creatorId)
  }

  // TODO(backend): Go 创作者商品接口尚未实现
  return request<Product[]>(`/creators/${creatorId}/products`)
}

/** 按 ID 批量取商品（收藏列表等） */
export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) {
    return []
  }

  if (isMockMode()) {
    await mockDelay(180)
    const idSet = new Set(ids)
    return mockProducts.filter((item) => idSet.has(item.id))
  }

  // TODO(backend): Go 批量商品接口尚未实现
  return request<Product[]>('/products/batch', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}
