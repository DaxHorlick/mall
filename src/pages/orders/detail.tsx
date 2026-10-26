import { Button, Empty, Tag } from 'antd'
import { Link, useParams } from 'react-router-dom'
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

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const order = useOrdersStore((state) => state.getOrderById(id))

  if (!order) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <Empty description="找不到该订单">
          <Link to="/orders">
            <Button type="primary">返回订单列表</Button>
          </Link>
        </Empty>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            ORDER DETAIL
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            订单详情
          </h1>
          <p className="mt-3 text-sm text-stone-500">
            订单号 {order.id}
            <span className="mx-2 text-stone-300">·</span>
            {formatDate(order.createdAt)}
          </p>
          <p className="mt-2 text-xs text-amber-700">
            {order.note ?? '本地模拟订单，非真实后端数据'}
          </p>
        </div>
        <Tag className="text-sm">{ORDER_STATUS_LABEL[order.status]}</Tag>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[1.5rem] bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-stone-950">收货信息</h2>
          <dl className="mt-4 space-y-2 text-sm text-stone-600">
            <div className="flex justify-between gap-4">
              <dt>收货人</dt>
              <dd className="text-stone-950">{order.address.receiverName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>电话</dt>
              <dd className="text-stone-950">{order.address.phone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>地址</dt>
              <dd className="max-w-[70%] text-right text-stone-950">
                {order.address.address}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[1.5rem] bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-stone-950">费用</h2>
          <dl className="mt-4 space-y-2 text-sm text-stone-600">
            <div className="flex justify-between">
              <dt>商品金额</dt>
              <dd>{formatPrice(order.goodsAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>运费</dt>
              <dd>
                {order.shippingFee === 0
                  ? '免运费'
                  : formatPrice(order.shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-3 text-base font-semibold text-stone-950">
              <dt>订单总额</dt>
              <dd>{formatPrice(order.totalAmount)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-[1.5rem] bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-stone-950">商品清单</h2>
        <div className="mt-4 space-y-4">
          {order.items.map((item) => (
            <div
              key={`${item.productId}-${item.colorKey}-${item.size}`}
              className="flex gap-4"
            >
              <Link
                to={`/products/${item.productId}`}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-200"
              >
                <SafeImage
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${item.productId}`}
                  className="font-medium text-stone-950 hover:underline"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-stone-500">
                  {item.colorLabel} · {item.size} · x{item.quantity}
                </p>
                <p className="mt-1 text-sm font-semibold text-stone-950">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6">
        <Link to="/orders">
          <Button>返回订单列表</Button>
        </Link>
      </div>
    </div>
  )
}
