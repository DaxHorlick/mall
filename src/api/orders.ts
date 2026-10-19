import { ApiError, request } from './client.ts'
import { isMockMode, mockDelay } from './config.ts'
import { useOrdersStore } from '../stores/orders.ts'
import type { Order, OrderAddress, OrderItem } from '../types/order.ts'

export type CreateOrderPayload = {
  items: OrderItem[]
  address: OrderAddress
  /** 仅 Mock：强制模拟失败 */
  forceFail?: boolean
}

export type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; message: string }

/** 订单列表。Mock 读本地持久化 store；真实模式请求 Go `/orders` */
export async function fetchOrders(): Promise<Order[]> {
  if (isMockMode()) {
    await mockDelay(200)
    return useOrdersStore.getState().orders
  }

  // TODO(backend): Go 订单列表接口尚未实现
  return request<Order[]>('/orders')
}

export async function fetchOrderById(id: string): Promise<Order> {
  if (isMockMode()) {
    await mockDelay(200)
    const order = useOrdersStore.getState().getOrderById(id)
    if (!order) {
      throw new ApiError(404, '订单不存在')
    }
    return order
  }

  // TODO(backend): Go 订单详情接口尚未实现
  return request<Order>(`/orders/${id}`)
}

/**
 * 提交订单。
 * Mock：写入本地 store，并明确为非真实支付；真实模式 POST `/orders`
 */
export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResult> {
  if (isMockMode()) {
    await mockDelay(480)
    return useOrdersStore.getState().createOrder(payload)
  }

  try {
    // TODO(backend): Go 下单接口尚未实现，且不应声称真实支付已完成
    const order = await request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: payload.items,
        address: payload.address,
      }),
    })
    return { ok: true, order }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : '提交订单失败，请稍后重试',
    }
  }
}
