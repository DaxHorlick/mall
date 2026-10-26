import { useQuery } from '@tanstack/react-query'
import { Button, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { queryKeys } from '../../api/queryKeys.ts'
import { fetchCurrentUser } from '../../api/users.ts'
import { useOrdersStore } from '../../stores/orders.ts'
import { useSellerProductsStore } from '../../stores/sellerProducts.ts'
import { ORDER_STATUS_LABEL } from '../../types/order.ts'
import { formatPrice } from '../../utils/format.ts'
import { getTotalStock } from '../../types/product.ts'

export function MyStorePage() {
  const userQuery = useQuery({
    queryKey: queryKeys.user.current,
    queryFn: fetchCurrentUser,
  })
  const products = useSellerProductsStore((state) => state.products)
  const orders = useOrdersStore((state) => state.orders)

  if (userQuery.isPending || !userQuery.data) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" tip="加载店铺…" />
      </div>
    )
  }

  const user = userQuery.data

  const productIds = new Set(products.map((item) => item.id))
  const relatedOrders = orders.filter((order) =>
    order.items.some((item) => productIds.has(item.productId)),
  )

  const salesAmount = relatedOrders.reduce((sum, order) => {
    return (
      sum +
      order.items
        .filter((item) => productIds.has(item.productId))
        .reduce((inner, item) => inner + item.price * item.quantity, 0)
    )
  }, 0)

  const soldUnits = relatedOrders.reduce((sum, order) => {
    return (
      sum +
      order.items
        .filter((item) => productIds.has(item.productId))
        .reduce((inner, item) => inner + item.quantity, 0)
    )
  }, 0)

  const onSaleCount = products.filter((item) => item.status === 'on_sale').length

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            MY STORE
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            我的店铺
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
            店铺「{user.creatorName}」的本地模拟销售数据，不代表真实交易。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/seller/products">
            <Button type="primary">管理商品</Button>
          </Link>
          <Link to="/seller/orders">
            <Button>管理订单</Button>
          </Link>
        </div>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: '在售商品', value: String(onSaleCount) },
          { label: '商品总数', value: String(products.length) },
          { label: '相关订单', value: String(relatedOrders.length) },
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

      <p className="mt-4 text-sm text-stone-500">
        已售出约 {soldUnits} 件（按本地 Mock 订单统计）
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-stone-950">商品概览</h2>
        <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
          <div className="divide-y divide-stone-100">
            {products.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-stone-950">{product.name}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatPrice(product.price)}
                    <span className="mx-2 text-stone-300">·</span>
                    库存 {getTotalStock(product)}
                    <span className="mx-2 text-stone-300">·</span>
                    {product.status === 'on_sale' ? '在售' : '已下架'}
                  </p>
                </div>
                <Link
                  to={`/products/${product.id}`}
                  className="text-sm text-stone-500 hover:text-stone-950"
                >
                  前台查看
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-stone-950">最近订单</h2>
        <div className="mt-4 space-y-3">
          {relatedOrders.slice(0, 5).map((order) => (
            <Link
              key={order.id}
              to={`/seller/orders?order=${order.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] bg-white px-5 py-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-stone-950">{order.id}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {ORDER_STATUS_LABEL[order.status]} · 本地模拟
                </p>
              </div>
              <p className="font-semibold text-stone-950">
                {formatPrice(order.totalAmount)}
              </p>
            </Link>
          ))}
          {relatedOrders.length === 0 ? (
            <p className="text-sm text-stone-500">暂无相关订单</p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
