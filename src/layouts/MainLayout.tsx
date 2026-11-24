import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { bootstrapSession } from '../auth/bootstrap.ts'
import { useSession } from '../auth/session.ts'
import { SiteFooter } from '../components/SiteFooter.tsx'
import { SiteHeader } from '../components/SiteHeader.tsx'
import { useCopy } from '../i18n/index.ts'

export function MainLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const copy = useCopy()
  const status = useSession((s) => s.status)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    void bootstrapSession()
  }, [])

  const openToGuests =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'anonymous' && !openToGuests) {
      navigate('/login', { replace: true })
      return
    }
    if (status === 'authenticated' && (pathname === '/login' || pathname === '/register')) {
      navigate('/profile', { replace: true })
    }
  }, [status, pathname, navigate, openToGuests])

  useEffect(() => {
    if (status === 'anonymous') queryClient.clear()
  }, [status, queryClient])

  const redirecting =
    (status === 'anonymous' && !openToGuests) ||
    (status === 'authenticated' && (pathname === '/login' || pathname === '/register'))

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f0] text-[#191919]">
      <SiteHeader />
      <main className="flex-1">
        {status === 'loading' || redirecting ? (
          <p className="mx-auto max-w-[1440px] px-5 py-16 text-sm text-[#696b61] md:px-14">
            {status === 'loading'
              ? copy.layout.restoring
              : status === 'authenticated'
                ? copy.layout.openingAccount
                : copy.layout.openingSignIn}
          </p>
        ) : (
          <Outlet />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
