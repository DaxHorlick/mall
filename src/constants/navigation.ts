export const primaryNav = [
  { to: '/marketplace', label: '设计广场' },
  { to: '/community', label: '创作手记' },
  { to: '/my-designs', label: '我的设计' },
] as const

export const footerGroups = [
  {
    title: '逛逛',
    links: [
      { to: '/', label: '首页' },
      { to: '/marketplace', label: '设计广场' },
      { to: '/community', label: '创作手记' },
      { to: '/my-designs', label: '我的设计' },
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
