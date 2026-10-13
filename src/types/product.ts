export type ProductCategoryKey = 'graphic' | 'plain' | 'oversized' | 'limited'

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
}
