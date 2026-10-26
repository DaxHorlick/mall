import { Empty, Tag } from 'antd'
import { Link } from 'react-router-dom'
import { SafeImage } from '../../components/common/SafeImage.tsx'
import { useOrdersStore } from '../../stores/orders.ts'
import { ORDER_STATUS_LABEL } from '../../types/order.ts'
import { formatPrice } from '../../utils/format.ts'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString('zh-CN')
}

export function OrdersPage() {
  const orders = useOrdersStore((state) => state.orders)

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div>
        <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
          ORDERS
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          我的订单
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
          以下为本地 Mock 订单，包含预置数据与你在本机模拟提交的订单。
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] bg-white px-6 py-16 shadow-sm">
          <Empty description="还没有订单">
            <Link
              to="/products"
              className="text-sm text-stone-600 underline-offset-2 hover:underline"
            >
              去逛逛商品
            </Link>
          </Empty>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block rounded-[1.5rem] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-stone-500">
                    订单号 {order.id}
                    <span className="mx-2 text-stone-300">·</span>
                    {formatDate(order.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-amber-700">本地模拟订单</p>
                </div>
                <Tag>{ORDER_STATUS_LABEL[order.status]}</Tag>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {order.items.map((item) => (
                  <div
                    key={`${order.id}-${item.productId}-${item.colorKey}-${item.size}`}
                    className="flex items-center gap-3"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-stone-200">
                      <SafeImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-950">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {item.colorLabel} / {item.size} x{item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-right text-sm text-stone-600">
                合计{' '}
                <span className="text-base font-semibold text-stone-950">
                  {formatPrice(order.totalAmount)}
                </span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
