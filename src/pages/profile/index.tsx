import { useQuery } from '@tanstack/react-query'
import { Empty, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../api/client.ts'
import { fetchProductsByIds } from '../../api/products.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { fetchCurrentUser } from '../../api/users.ts'
import { ProductCard } from '../../components/products/ProductCard.tsx'
import { SafeImage } from '../../components/common/SafeImage.tsx'
import { useDesignsStore } from '../../stores/designs.ts'
import { useFavoritesStore } from '../../stores/favorites.ts'
import { useOrdersStore } from '../../stores/orders.ts'
import { useSellerProductsStore } from '../../stores/sellerProducts.ts'
import { formatPrice } from '../../utils/format.ts'

const links = [
  { to: '/orders', label: '我的订单', desc: '查看本地模拟订单' },
  { to: '/my-designs', label: '我的设计', desc: 'AI 保存的作品' },
  { to: '/profile#favorites', label: '我的收藏', desc: '收藏的商品' },
  { to: '/my-store', label: '我的店铺', desc: '销售数据与店铺入口' },
  { to: '/seller/products', label: '我的商品', desc: '商家商品管理' },
  { to: '/seller/orders', label: '店铺订单', desc: '商家订单管理' },
]

export function ProfilePage() {
  const userQuery = useQuery({
    queryKey: queryKeys.user.current,
    queryFn: fetchCurrentUser,
  })

  const favoriteIds = useFavoritesStore((state) => state.ids)
  const favoritesQuery = useQuery({
    queryKey: [...queryKeys.products.all, 'favorites', favoriteIds],
    queryFn: () => fetchProductsByIds(favoriteIds),
  })

  const orderCount = useOrdersStore((state) => state.orders.length)
  const allWorks = useDesignsStore((state) => state.works)
  const sellerProducts = useSellerProductsStore((state) => state.products)
  const orders = useOrdersStore((state) => state.orders)

  if (userQuery.isPending) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" tip="加载个人资料…" />
      </div>
    )
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <Empty
          description={getErrorMessage(userQuery.error, '个人资料加载失败')}
        />
      </div>
    )
  }

  const user = userQuery.data
  const designCount = allWorks.filter(
    (item) => item.creatorId === user.creatorId,
  ).length
  const sellerProductIds = new Set(sellerProducts.map((item) => item.id))
  const salesAmount = orders.reduce((sum, order) => {
    const related = order.items.filter((item) =>
      sellerProductIds.has(item.productId),
    )
    return (
      sum +
      related.reduce((inner, item) => inner + item.price * item.quantity, 0)
    )
  }, 0)

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div>
        <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
          PROFILE
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          个人中心
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          当前通过 API 层读取 Mock 用户，未接入真实登录。
        </p>
      </div>

      <section className="mt-8 flex flex-col gap-5 rounded-[2rem] bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
        <SafeImage
          src={user.avatarUrl}
          alt={user.name}
          className="h-24 w-24 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold text-stone-950">{user.name}</h2>
          <p className="mt-2 text-sm text-stone-500">
            {user.email}
            <span className="mx-2 text-stone-300">·</span>
            {user.phone}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            {user.bio}
          </p>
          <p className="mt-3 text-sm text-stone-500">
            创作者身份：
            <Link
              to={`/creators/${user.creatorId}`}
              className="ml-1 text-stone-950 underline-offset-2 hover:underline"
            >
              {user.creatorName}
            </Link>
          </p>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: '订单', value: String(orderCount) },
          { label: '设计', value: String(designCount) },
          { label: '收藏', value: String(favoriteIds.length) },
          { label: '店铺销售额', value: formatPrice(salesAmount) },
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

      <section className="mt-8 grid gap-3 md:grid-cols-2">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-[1.25rem] bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-medium text-stone-950">{item.label}</p>
            <p className="mt-1 text-sm text-stone-500">{item.desc}</p>
          </Link>
        ))}
      </section>

      <section id="favorites" className="mt-12 scroll-mt-24">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">我的收藏</h2>
          <Link to="/products" className="text-sm text-stone-500">
            去逛商品
          </Link>
        </div>
        {favoritesQuery.isPending ? (
          <div className="mt-6 flex justify-center">
            <Spin />
          </div>
        ) : null}
        {favoritesQuery.isSuccess && favoritesQuery.data.length === 0 ? (
          <div className="mt-4 rounded-[1.5rem] bg-white py-12 shadow-sm">
            <Empty description="还没有收藏商品" />
          </div>
        ) : null}
        {favoritesQuery.data && favoritesQuery.data.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {favoritesQuery.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
