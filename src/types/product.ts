export type ProductCategoryKey = 'graphic' | 'plain' | 'oversized' | 'limited'

export type ProductSort = 'newest' | 'price-asc' | 'price-desc'

export type ProductSize = 'S' | 'M' | 'L' | 'XL'

export type ProductColor = {
  key: string
  label: string
  hex: string
}

export type Product = {
  id: string
  name: string
  price: number
  imageUrl: string
  category: ProductCategoryKey
  creatorId: string
  creatorName: string
  isHot: boolean
  isRecommended: boolean
  createdAt: string
  description: string
  colors: ProductColor[]
  sizes: ProductSize[]
  /** 库存，键为 `${colorKey}:${size}` */
  stockMap: Record<string, number>
}

export type ProductQuery = {
  keyword?: string
  category?: ProductCategoryKey | ''
  minPrice?: number | null
  maxPrice?: number | null
  sort?: ProductSort
  page?: number
  pageSize?: number
  /** 仅用于本地 Mock 演示错误态，后续接真实 API 时删除 */
  forceError?: boolean
}

export type ProductListResult = {
  items: Product[]
  total: number
  page: number
  pageSize: number
}

export function variantStockKey(colorKey: string, size: ProductSize) {
  return `${colorKey}:${size}`
}

export function getVariantStock(
  product: Product,
  colorKey: string,
  size: ProductSize,
) {
  return product.stockMap[variantStockKey(colorKey, size)] ?? 0
}

export function getTotalStock(product: Product) {
  return Object.values(product.stockMap).reduce((sum, stock) => sum + stock, 0)
}
