export const productCategories = [
  { key: 'graphic', label: '图案 T 恤' },
  { key: 'plain', label: '基础款' },
  { key: 'oversized', label: 'Oversize' },
  { key: 'limited', label: '限量设计' },
] as const

export function getCategoryLabel(key: string | null) {
  if (!key) {
    return null
  }

  return productCategories.find((item) => item.key === key)?.label ?? key
}

export const primaryNav = [
  { to: '/products', label: '商品' },
  { to: '/designer', label: 'AI 设计' },
  { to: '/marketplace', label: '创作者市场' },
] as const

export const footerGroups = [
  {
    title: '逛逛',
    links: [
      { to: '/', label: '首页' },
      { to: '/products', label: '全部商品' },
      { to: '/designer', label: 'AI 设计' },
      { to: '/marketplace', label: '创作者市场' },
    ],
  },
  {
    title: '账户',
    links: [
      { to: '/login', label: '登录' },
      { to: '/register', label: '注册' },
      { to: '/profile', label: '个人中心' },
      { to: '/orders', label: '我的订单' },
      { to: '/cart', label: '购物车' },
      { to: '/checkout', label: '订单确认' },
    ],
  },
  {
    title: '创作与店铺',
    links: [
      { to: '/my-designs', label: '我的设计' },
      { to: '/my-store', label: '我的店铺' },
      { to: '/seller/products', label: '商品管理' },
      { to: '/seller/orders', label: '订单管理' },
    ],
  },
] as const
