import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSession } from '../auth/session.ts'

export function SiteHeader() {
  const { pathname } = useLocation()
  const home = pathname === '/'
  const status = useSession((s) => s.status)
  const user = useSession((s) => s.user)
  const username = user?.username?.trim() || user?.nickname?.trim() || '用户'
  const [openPath, setOpenPath] = useState<string | null>(null)
  const open = openPath === pathname
  const links = home
    ? [
        { to: '/explore', label: 'Explore designs' },
        { to: '/how-it-works', label: 'How it works' },
        { to: '/studio', label: 'For creators' },
      ]
    : [
        { to: '/explore', label: 'Explore designs' },
        { to: '/how-it-works', label: 'How it works' },
        { to: '/community', label: 'Community' },
      ]

  return (
    <header className="sticky top-0 z-40 bg-[#f7f6f0]">
      <div
        className={`mx-auto flex max-w-[1440px] items-center px-5 md:px-14 ${home ? 'h-[88px]' : 'h-24'}`}
      >
        <NavLink to="/" className="text-[32px] font-black leading-none text-[#191919] md:text-[36px]">
          dezajn®
        </NavLink>
        <nav className="ml-12 hidden items-center gap-10 text-sm font-medium text-[#191919] xl:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm font-medium text-[#191919] xl:gap-8">
          <div className="hidden items-center gap-8 xl:flex">
            <NavLink to="/bag">Bag</NavLink>
            <NavLink
              to="/studio"
              className="inline-flex h-12 w-[216px] items-center rounded-lg bg-[#191919] px-[18px] text-sm font-semibold text-[#f7f6f0]"
            >
              Start creating ↗
            </NavLink>
          </div>
          {status === 'loading' ? (
            <span className="inline-block h-8 w-16" />
          ) : status === 'authenticated' && user ? (
            <NavLink to="/account" className="flex max-w-40 items-center gap-2">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d7fa55] text-xs font-bold">
                  {username.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="truncate">{username}</span>
            </NavLink>
          ) : (
            <NavLink to="/login">未登录</NavLink>
          )}
        </div>
        <button
          type="button"
          className="ml-4 text-sm font-medium text-[#191919] xl:hidden"
          aria-expanded={open}
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {open ? (
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 pb-5 text-sm font-medium text-[#191919] md:px-14 xl:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/bag">Bag</NavLink>
          <NavLink
            to="/studio"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[#191919] px-4 text-sm font-semibold text-[#f7f6f0]"
          >
            Start creating ↗
          </NavLink>
        </div>
      ) : null}
      <div className="mx-auto max-w-[1440px] px-5 md:px-14">
        <div className="h-px bg-[#ddded4]" />
      </div>
    </header>
  )
}
