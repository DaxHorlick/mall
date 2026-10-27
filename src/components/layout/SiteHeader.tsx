import { Drawer, Dropdown, Input } from 'antd'
import type { MenuProps } from 'antd'
import { useState } from 'react'
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  footerGroups,
  primaryNav,
  productCategories,
} from '../../constants/navigation.ts'
import { useAuthStore } from '../../stores/auth.ts'
import { useCartStore } from '../../stores/cart.ts'
import { useLogout } from '../../hooks/useLogout.ts'

function linkClass(isActive: boolean) {
  return isActive
    ? 'text-sm font-medium text-stone-950'
    : 'text-sm text-stone-500 transition-colors hover:text-stone-950'
}

export function SiteHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const { logout, pending: logoutPending } = useLogout()
  const cartQuantity = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  )
  const keywordFromUrl = searchParams.get('keyword') ?? ''
  const category = searchParams.get('category') ?? ''
  const onProductList = location.pathname === '/products'

  const keepListFilters = (next: URLSearchParams) => {
    if (!onProductList) {
      return
    }

    for (const key of ['category', 'minPrice', 'maxPrice', 'sort'] as const) {
      const value = searchParams.get(key)
      if (value) {
        next.set(key, value)
      }
    }
  }

  const submitSearch = (value: string) => {
    const next = new URLSearchParams()
    const trimmed = value.trim()

    if (trimmed) {
      next.set('keyword', trimmed)
    }

    keepListFilters(next)

    const query = next.toString()
    navigate(query ? `/products?${query}` : '/products')
  }

  const goCategory = (key: string) => {
    const next = new URLSearchParams()
    const keyword = keywordFromUrl.trim()

    if (keyword) {
      next.set('keyword', keyword)
    }

    if (onProductList) {
      for (const filterKey of ['minPrice', 'maxPrice', 'sort'] as const) {
        const value = searchParams.get(filterKey)
        if (value) {
          next.set(filterKey, value)
        }
      }
    }

    if (key !== 'all') {
      next.set('category', key)
    }

    const query = next.toString()
    setMenuOpen(false)
    navigate(query ? `/products?${query}` : '/products')
  }

  const categoryMenu: MenuProps = {
    selectedKeys: onProductList ? [category || 'all'] : [],
    items: [
      { key: 'all', label: '全部商品' },
      ...productCategories.map((item) => ({
        key: item.key,
        label: item.label,
      })),
    ],
    onClick: ({ key }) => goCategory(String(key)),
  }

  const categoryActive = onProductList && category.length > 0

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-3 px-5 py-3 md:px-8 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto] lg:gap-x-6">
        <NavLink
          to="/"
          end
          className="col-start-1 row-start-1 text-sm font-semibold tracking-[0.28em] text-stone-950"
        >
          INKTEE
        </NavLink>

        <div className="col-span-3 col-start-1 row-start-2 min-w-0 lg:col-span-1 lg:col-start-2 lg:row-start-1">
          <Input.Search
            key={keywordFromUrl}
            aria-label="搜索 T 恤、图案或创作者"
            placeholder="搜索 T 恤、图案或创作者"
            allowClear
            enterButton="搜索"
            defaultValue={keywordFromUrl}
            onSearch={submitSearch}
          />
        </div>

        <nav
          aria-label="主导航"
          className="col-start-3 row-start-1 hidden items-center gap-5 lg:flex"
        >
          <NavLink to="/products" className={({ isActive }) => linkClass(isActive)}>
            商品
          </NavLink>
          <Dropdown menu={categoryMenu} trigger={['click']}>
            <button
              type="button"
              className={
                categoryActive
                  ? 'inline-flex cursor-pointer items-center gap-1 bg-transparent p-0 text-sm font-medium text-stone-950'
                  : 'inline-flex cursor-pointer items-center gap-1 bg-transparent p-0 text-sm text-stone-500 transition-colors hover:text-stone-950'
              }
            >
              分类
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                <path
                  d="M2.2 4.2 6 8l3.8-3.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Dropdown>
          <NavLink to="/designer" className={({ isActive }) => linkClass(isActive)}>
            AI 设计
          </NavLink>
          <NavLink
            to="/marketplace"
            className={({ isActive }) => linkClass(isActive)}
          >
            创作者市场
          </NavLink>
        </nav>

        <div className="col-start-3 row-start-1 flex items-center gap-3 justify-self-end lg:col-start-4">
          {status === 'unknown' ? (
            <span className="inline-block h-5 w-10" aria-hidden="true" />
          ) : user ? (
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: '个人中心' },
                  {
                    key: 'logout',
                    label: '退出登录',
                    disabled: logoutPending,
                  },
                ],
                onClick: ({ key }) => {
                  if (key === 'profile') {
                    navigate('/profile')
                  }
                  if (key === 'logout') {
                    void logout()
                  }
                },
              }}
              trigger={['click']}
            >
              <button
                type="button"
                className="max-w-32 cursor-pointer truncate bg-transparent p-0 text-sm font-medium text-stone-950"
                title={user.nickname}
              >
                {user.nickname}
              </button>
            </Dropdown>
          ) : (
            <NavLink to="/login" className={({ isActive }) => linkClass(isActive)}>
              登录
            </NavLink>
          )}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `${linkClass(isActive)} inline-flex items-center gap-1`
            }
          >
            购物车
            {cartQuantity > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-stone-950 px-1.5 text-[11px] font-medium text-white">
                {cartQuantity > 99 ? '99+' : cartQuantity}
              </span>
            ) : null}
          </NavLink>
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-stone-200 bg-white lg:hidden"
            aria-label="打开菜单"
            onClick={() => setMenuOpen(true)}
          >
            <span className="flex flex-col gap-1.5" aria-hidden="true">
              <span className="block h-px w-4 bg-stone-950" />
              <span className="block h-px w-4 bg-stone-950" />
              <span className="block h-px w-4 bg-stone-950" />
            </span>
          </button>
        </div>
      </div>

      <Drawer
        title="菜单"
        placement="right"
        size={320}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <nav aria-label="移动端导航" className="flex flex-col gap-8">
          {user ? (
            <div className="flex flex-col gap-3">
              <p className="text-base font-medium text-stone-950">{user.nickname}</p>
              <button
                type="button"
                className="cursor-pointer bg-transparent p-0 text-left text-base text-stone-600"
                disabled={logoutPending}
                onClick={() => {
                  setMenuOpen(false)
                  void logout()
                }}
              >
                退出登录
              </button>
            </div>
          ) : null}
          <div className="flex flex-col gap-3">
            {primaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? 'text-base font-medium text-stone-950'
                    : 'text-base text-stone-600'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div>
            <p className="text-xs tracking-[0.18em] text-stone-400">分类</p>
            <div className="mt-3 flex flex-col gap-3">
              <button
                type="button"
                className={
                  onProductList && !category
                    ? 'cursor-pointer bg-transparent p-0 text-left text-base font-medium text-stone-950'
                    : 'cursor-pointer bg-transparent p-0 text-left text-base text-stone-600'
                }
                onClick={() => goCategory('all')}
              >
                全部商品
              </button>
              {productCategories.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={
                    onProductList && category === item.key
                      ? 'cursor-pointer bg-transparent p-0 text-left text-base font-medium text-stone-950'
                      : 'cursor-pointer bg-transparent p-0 text-left text-base text-stone-600'
                  }
                  onClick={() => goCategory(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {footerGroups
            .filter((group) => group.title !== '逛逛')
            .map((group) => (
              <div key={group.title}>
                <p className="text-xs tracking-[0.18em] text-stone-400">
                  {group.title}
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  {group.links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? 'text-base font-medium text-stone-950'
                          : 'text-base text-stone-600'
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
        </nav>
      </Drawer>
    </header>
  )
}
