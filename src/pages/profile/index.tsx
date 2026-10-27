import { useQuery } from '@tanstack/react-query'
import { App, Button, Empty, Form, Input, Spin } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, getErrorMessage, isAccountDisabled } from '../../api/client.ts'
import { fetchProductsByIds } from '../../api/products.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { updateProfile } from '../../api/users.ts'
import { ProductCard } from '../../components/products/ProductCard.tsx'
import { SafeImage } from '../../components/common/SafeImage.tsx'
import { useLogout } from '../../hooks/useLogout.ts'
import { useAuthStore } from '../../stores/auth.ts'
import { useDesignsStore } from '../../stores/designs.ts'
import { useFavoritesStore } from '../../stores/favorites.ts'
import { useOrdersStore } from '../../stores/orders.ts'
import { useSellerProductsStore } from '../../stores/sellerProducts.ts'
import type { UpdateProfileRequest } from '../../types/auth.ts'
import { formatPrice } from '../../utils/format.ts'
import { validateAvatarUrl, validateNickname } from '../../utils/auth.ts'

const links = [
  { to: '/orders', label: '我的订单', desc: '查看本地模拟订单' },
  { to: '/my-designs', label: '我的设计', desc: 'AI 保存的作品' },
  { to: '/profile#favorites', label: '我的收藏', desc: '收藏的商品' },
  { to: '/my-store', label: '我的店铺', desc: '销售数据与店铺入口' },
  { to: '/seller/products', label: '我的商品', desc: '商家商品管理' },
  { to: '/seller/orders', label: '店铺订单', desc: '商家订单管理' },
]

type ProfileFormValues = {
  nickname: string
  avatar_url?: string
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('zh-CN', { hour12: false })
}

function statusLabel(status: string) {
  if (status === 'active') {
    return '正常'
  }
  if (status === 'disabled') {
    return '已停用'
  }
  return status
}

export function ProfilePage() {
  const { message } = App.useApp()
  const user = useAuthStore((s) => s.user)
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)
  const { logout, pending: logoutPending } = useLogout()
  const [form] = Form.useForm<ProfileFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const favoriteIds = useFavoritesStore((state) => state.ids)
  const favoritesQuery = useQuery({
    queryKey: [...queryKeys.products.all, 'favorites', favoriteIds],
    queryFn: () => fetchProductsByIds(favoriteIds),
  })

  const orderCount = useOrdersStore((state) => state.orders.length)
  const allWorks = useDesignsStore((state) => state.works)
  const sellerProducts = useSellerProductsStore((state) => state.products)
  const orders = useOrdersStore((state) => state.orders)

  useEffect(() => {
    if (!user) {
      return
    }

    form.setFieldsValue({
      nickname: user.nickname,
      avatar_url: user.avatar_url ?? '',
    })
  }, [form, user])

  if (!user) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" />
      </div>
    )
  }

  const designCount = allWorks.length
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

  const onFinish = async (values: ProfileFormValues) => {
    if (submittingRef.current) {
      return
    }

    const nickname = values.nickname.trim()
    const avatarUrl = values.avatar_url?.trim() ?? ''

    if (!avatarUrl && user.avatar_url) {
      message.warning('当前不能清空头像')
      return
    }

    const payload: UpdateProfileRequest = {}
    if (nickname !== user.nickname) {
      payload.nickname = nickname
    }
    if (avatarUrl && avatarUrl !== user.avatar_url) {
      payload.avatar_url = avatarUrl
    }

    if (payload.nickname === undefined && payload.avatar_url === undefined) {
      message.info('没有需要保存的修改')
      return
    }

    submittingRef.current = true
    setSubmitting(true)

    try {
      const next = await updateProfile(payload)
      setAuthenticated(next)
      message.success('资料已更新')
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || isAccountDisabled(err))) {
        return
      }
      message.error(getErrorMessage(err))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

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
          登录账号不会由接口返回。这里只展示并修改昵称和头像。
        </p>
      </div>

      <section className="mt-8 flex flex-col gap-5 rounded-[2rem] bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
        {user.avatar_url ? (
          <SafeImage
            src={user.avatar_url}
            alt={user.nickname}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-200 text-2xl font-semibold text-stone-700">
            {Array.from(user.nickname)[0] ?? '用'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold text-stone-950">{user.nickname}</h2>
          <p className="mt-2 text-sm text-stone-500">
            账号状态：{statusLabel(user.status)}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            注册时间：{formatDateTime(user.created_at)}
            <span className="mx-2 text-stone-300">·</span>
            最近登录：{formatDateTime(user.last_login_at)}
          </p>
        </div>
        <Button onClick={() => void logout()} loading={logoutPending}>
          退出登录
        </Button>
      </section>

      <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-stone-950">修改资料</h2>
        <Form
          form={form}
          layout="vertical"
          className="mt-6 max-w-lg"
          requiredMark={false}
          onFinish={onFinish}
          disabled={submitting}
        >
          <Form.Item
            label="昵称"
            name="nickname"
            rules={[
              { required: true, message: '请输入昵称' },
              {
                validator: (_, value: string) => {
                  if (!value) {
                    return Promise.resolve()
                  }
                  const error = validateNickname(value)
                  return error
                    ? Promise.reject(new Error(error))
                    : Promise.resolve()
                },
              },
            ]}
          >
            <Input size="large" maxLength={64} placeholder="怎么称呼你" />
          </Form.Item>
          <Form.Item
            label="头像地址"
            name="avatar_url"
            extra="留空表示不修改。当前接口不能清空已有头像。"
            rules={[
              {
                validator: (_, value: string) => {
                  const trimmed = value?.trim() ?? ''
                  if (!trimmed) {
                    return Promise.resolve()
                  }
                  const error = validateAvatarUrl(trimmed)
                  return error
                    ? Promise.reject(new Error(error))
                    : Promise.resolve()
                },
              },
            ]}
          >
            <Input
              size="large"
              maxLength={512}
              placeholder="https://example.com/avatar.png"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            保存
          </Button>
        </Form>
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
