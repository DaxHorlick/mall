export const primaryNav = [{ to: '/community', label: '创作手记' }] as const

export const footerGroups = [
  {
    title: '逛逛',
    links: [
      { to: '/', label: '首页' },
      { to: '/community', label: '创作手记' },
    ],
  },
  {
    title: '账户',
    links: [
      { to: '/login', label: '登录' },
      { to: '/register', label: '注册' },
      { to: '/profile', label: '个人中心' },
      { to: '/creator', label: '创作者中心' },
      { to: '/my-posts', label: '我的手记' },
    ],
  },
] as const
