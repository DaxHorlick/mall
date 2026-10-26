import type { ProductSize } from './product.ts'

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export type OrderItem = {
  productId: string
  name: string
  price: number
  imageUrl: string
  colorKey: string
  colorLabel: string
  size: ProductSize
  quantity: number
}

export type OrderAddress = {
  receiverName: string
  phone: string
  address: string
}

export type Order = {
  id: string
  /** 明确标识为本地 Mock，非真实后端订单 */
  isMock: true
  status: OrderStatus
  items: OrderItem[]
  address: OrderAddress
  goodsAmount: number
  shippingFee: number
  totalAmount: number
  createdAt: string
  note?: string
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: '待付款',
  paid: '已付款',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
}

export const SHIPPING_FEE = 10
export const FREE_SHIPPING_THRESHOLD = 199

export function calcShippingFee(goodsAmount: number) {
  return goodsAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}
