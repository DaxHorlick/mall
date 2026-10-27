import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AuthSessionSync } from '../components/auth/AuthSessionSync.tsx'
import { SiteFooter } from '../components/layout/SiteFooter.tsx'
import { SiteHeader } from '../components/layout/SiteHeader.tsx'
import { useSessionBootstrap } from '../hooks/useSessionBootstrap.ts'

export function MainLayout() {
  const { pathname } = useLocation()
  useSessionBootstrap()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f4f1] text-stone-950">
      <AuthSessionSync />
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
