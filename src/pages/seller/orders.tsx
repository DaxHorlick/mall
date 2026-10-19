import { Button, Empty, Select, Tag } from 'antd'
import { Link, useSearchParams } from 'react-router-dom'
import { SafeImage } from '../../components/common/SafeImage.tsx'
import { useOrdersStore } from '../../stores/orders.ts'
import { useSellerProductsStore } from '../../stores/sellerProducts.ts'
import {
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from '../../types/order.ts'
import { formatPrice } from '../../utils/format.ts'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending_payment', label: ORDER_STATUS_LABEL.pending_payment },
  { value: 'paid', label: ORDER_STATUS_LABEL.paid },
  { value: 'shipped', label: ORDER_STATUS_LABEL.shipped },
  { value: 'completed', label: ORDER_STATUS_LABEL.completed },
  { value: 'cancelled', label: ORDER_STATUS_LABEL.cancelled },
]

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString('zh-CN')
}

export function SellerOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const focusId = searchParams.get('order')
  const products = useSellerProductsStore((state) => state.products)
  const orders = useOrdersStore((state) => state.orders)
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus)

  const productIds = new Set(products.map((item) => item.id))
  const sellerOrders = orders.filter((order) =>
    order.items.some((item) => productIds.has(item.productId)),
  )

  const paidCount = sellerOrders.filter((item) => item.status === 'paid').length
  const shippedCount = sellerOrders.filter(
    (item) => item.status === 'shipped',
  ).length
  const salesAmount = sellerOrders.reduce((sum, order) => {
    return (
      sum +
      order.items
        .filter((item) => productIds.has(item.productId))
        .reduce((inner, item) => inner + item.price * item.quantity, 0)
    )
  }, 0)

  const focused = focusId
    ? sellerOrders.find((item) => item.id === focusId)
    : null

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            SELLER ORDERS
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            订单管理
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
            仅展示包含你店铺商品的本地 Mock 订单，可模拟更新状态，不触发真实发货。
          </p>
        </div>
        <Link to="/seller/products">
          <Button>商品管理</Button>
        </Link>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: '相关订单', value: String(sellerOrders.length) },
          { label: '待发货', value: String(paidCount) },
          { label: '已发货', value: String(shippedCount) },
          { label: '模拟销售额', value: formatPrice(salesAmount) },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[1.25rem] bg-white px-4 py-5 shadow-sm"
          >
            <p className="text-xs tracking-[0.16em] text-stone-400">
              {item.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-stone-950">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      {focused ? (
        <section className="mt-8 rounded-[1.5rem] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-950">
                订单详情 {focused.id}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {formatDate(focused.createdAt)} · 本地模拟
              </p>
            </div>
            <Button
              type="link"
              onClick={() => {
                const next = new URLSearchParams(searchParams)
                next.delete('order')
                setSearchParams(next, { replace: true })
              }}
            >
              关闭详情
            </Button>
          </div>
          <dl className="mt-4 grid gap-2 text-sm text-stone-600 md:grid-cols-2">
            <div>
              收货人：{focused.address.receiverName} / {focused.address.phone}
            </div>
            <div>地址：{focused.address.address}</div>
          </dl>
          <div className="mt-4 space-y-3">
            {focused.items
              .filter((item) => productIds.has(item.productId))
              .map((item) => (
                <div
                  key={`${item.productId}-${item.colorKey}-${item.size}`}
                  className="flex gap-3"
                >
                  <div className="h-14 w-14 overflow-hidden rounded-xl bg-stone-200">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-stone-950">{item.name}</p>
                    <p className="text-sm text-stone-500">
                      {item.colorLabel} / {item.size} x{item.quantity} ·{' '}
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 space-y-4">
        {sellerOrders.length === 0 ? (
          <div className="rounded-[1.5rem] bg-white py-16 shadow-sm">
            <Empty description="暂无店铺相关订单" />
          </div>
        ) : (
          sellerOrders.map((order) => (
            <article
              key={order.id}
              className="rounded-[1.5rem] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-stone-950">{order.id}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <Tag>{ORDER_STATUS_LABEL[order.status]}</Tag>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {order.items
                  .filter((item) => productIds.has(item.productId))
                  .map((item) => (
                    <div
                      key={`${order.id}-${item.productId}-${item.size}`}
                      className="flex items-center gap-2 text-sm text-stone-600"
                    >
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-stone-200">
                        <SafeImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {item.name} x{item.quantity}
                    </div>
                  ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-stone-950">
                  {formatPrice(order.totalAmount)}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    className="w-36"
                    value={order.status}
                    options={STATUS_OPTIONS}
                    onChange={(status) => updateOrderStatus(order.id, status)}
                  />
                  <Button
                    type="link"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams)
                      next.set('order', order.id)
                      setSearchParams(next, { replace: true })
                    }}
                  >
                    查看详情
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
