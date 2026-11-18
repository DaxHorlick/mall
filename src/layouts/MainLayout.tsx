import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { bootstrapSession } from '../auth/bootstrap.ts'
import { useSession } from '../auth/session.ts'
import { SiteFooter } from '../components/SiteFooter.tsx'
import { SiteHeader } from '../components/SiteHeader.tsx'

export function MainLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const status = useSession((s) => s.status)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    void bootstrapSession()
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'anonymous' && pathname === '/account') {
      navigate('/login', { replace: true })
      return
    }
    if (status === 'authenticated' && (pathname === '/login' || pathname === '/register')) {
      navigate('/account', { replace: true })
    }
  }, [status, pathname, navigate])

  useEffect(() => {
    if (status === 'anonymous') queryClient.clear()
  }, [status, queryClient])

  const redirecting =
    (status === 'anonymous' && pathname === '/account') ||
    (status === 'authenticated' && (pathname === '/login' || pathname === '/register'))

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f0] text-[#191919]">
      <SiteHeader />
      <main className="flex-1">
        {status === 'loading' || redirecting ? (
          <p className="mx-auto max-w-[1440px] px-5 py-16 text-sm text-[#696b61] md:px-14">
            {status === 'loading'
              ? 'Restoring your session'
              : status === 'authenticated'
                ? 'Opening your account'
                : 'Opening sign in'}
          </p>
        ) : (
          <Outlet />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
