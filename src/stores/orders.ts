import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedMockOrders } from '../mocks/orders.ts'
import type { Order, OrderAddress, OrderItem, OrderStatus } from '../types/order.ts'
import { calcShippingFee } from '../types/order.ts'

type CreateOrderInput = {
  items: OrderItem[]
  address: OrderAddress
  forceFail?: boolean
}

type OrdersState = {
  orders: Order[]
  createOrder: (
    input: CreateOrderInput,
  ) => { ok: true; order: Order } | { ok: false; message: string }
  getOrderById: (id: string) => Order | undefined
  updateOrderStatus: (id: string, status: OrderStatus) => void
}

function createOrderId() {
  return `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: seedMockOrders,
      createOrder: (input) => {
        if (input.forceFail) {
          return { ok: false, message: '模拟提交失败：支付通道暂不可用，请重试' }
        }

        if (input.items.length === 0) {
          return { ok: false, message: '没有可结算的商品' }
        }

        const receiver = input.address.receiverName.trim()
        const phone = input.address.phone.trim()
        const address = input.address.address.trim()

        if (!receiver || !phone || !address) {
          return { ok: false, message: '请完整填写收货信息' }
        }

        if (!/^1\d{10}$/.test(phone)) {
          return { ok: false, message: '请输入有效的 11 位手机号' }
        }

        const goodsAmount = input.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        )
        const shippingFee = calcShippingFee(goodsAmount)
        const order: Order = {
          id: createOrderId(),
          isMock: true,
          status: 'paid',
          items: input.items,
          address: { receiverName: receiver, phone, address },
          goodsAmount,
          shippingFee,
          totalAmount: goodsAmount + shippingFee,
          createdAt: new Date().toISOString(),
          note: '本地模拟订单，未接入真实支付与后端',
        }

        set({ orders: [order, ...get().orders] })
        return { ok: true, order }
      },
      getOrderById: (id) => get().orders.find((item) => item.id === id),
      updateOrderStatus: (id, status) => {
        set({
          orders: get().orders.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        })
      },
    }),
    {
      name: 'inktee-orders',
    },
  ),
)
