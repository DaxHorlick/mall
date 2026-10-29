import { Drawer, Dropdown } from 'antd'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { footerGroups, primaryNav } from '../../constants/navigation.ts'
import { useLogout } from '../../hooks/useLogout.ts'
import { useAuthStore } from '../../stores/auth.ts'

function linkClass(isActive: boolean) {
  return isActive
    ? 'text-sm font-medium text-stone-950'
    : 'text-sm text-stone-500 transition-colors hover:text-stone-950'
}

export function SiteHeader() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const { logout, pending: logoutPending } = useLogout()
  const accountLinks = footerGroups.find((group) => group.title === '账户')?.links ?? []

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3 md:px-8">
        <NavLink to="/" end className="text-sm font-semibold tracking-[0.28em] text-stone-950">
          INKTEE
        </NavLink>

        <nav aria-label="主导航" className="hidden flex-1 items-center gap-5 lg:flex">
          {primaryNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => linkClass(isActive)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {status === 'unknown' ? (
            <span className="inline-block h-5 w-10" aria-hidden="true" />
          ) : user ? (
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: '个人中心' },
                  { key: 'creator', label: '创作者中心' },
                  { key: 'posts', label: '我的手记' },
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
                  if (key === 'creator') {
                    navigate('/creator')
                  }
                  if (key === 'posts') {
                    navigate('/my-posts')
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

      <Drawer title="菜单" placement="right" size={320} open={menuOpen} onClose={() => setMenuOpen(false)}>
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
                  isActive ? 'text-base font-medium text-stone-950' : 'text-base text-stone-600'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] text-stone-400">账户</p>
            <div className="mt-3 flex flex-col gap-3">
              {accountLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? 'text-base font-medium text-stone-950' : 'text-base text-stone-600'
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </Drawer>
    </header>
  )
}
