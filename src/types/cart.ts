import type { ProductSize } from './product.ts'

export type CartItem = {
  /** 购物车行 ID，由 productId + color + size 组成 */
  id: string
  productId: string
  name: string
  price: number
  imageUrl: string
  colorKey: string
  colorLabel: string
  colorHex: string
  size: ProductSize
  quantity: number
}

export type AddCartItemInput = {
  productId: string
  name: string
  price: number
  imageUrl: string
  colorKey: string
  colorLabel: string
  colorHex: string
  size: ProductSize
  quantity: number
  /** 当前规格剩余库存，用于合并数量时封顶 */
  maxQuantity: number
}

export function buildCartItemId(
  productId: string,
  colorKey: string,
  size: ProductSize,
) {
  return `${productId}__${colorKey}__${size}`
}
