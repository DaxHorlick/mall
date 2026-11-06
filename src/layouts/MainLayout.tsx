import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

export function MainLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f4f1] text-stone-950">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-3 md:px-8">
          <NavLink to="/" end className="text-sm font-semibold tracking-[0.28em] text-stone-950">
            INKTEE
          </NavLink>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-auto border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
          <p className="text-sm font-semibold tracking-[0.28em]">INKTEE</p>
          <p className="mt-3 text-sm text-stone-500">前端脚手架</p>
        </div>
        <div className="border-t border-stone-100">
          <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-stone-400 md:px-8">© 2026 INKTEE</p>
        </div>
      </footer>
    </div>
  )
}
