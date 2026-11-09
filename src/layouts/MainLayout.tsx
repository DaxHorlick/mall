import { useQueryClient } from '@tanstack/react-query'
import { App, Button } from 'antd'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage, request } from '../api/client.ts'
import { bootstrapSession, claimInitialRedirect } from '../auth/bootstrap.ts'
import { useSession } from '../auth/session.ts'

export function MainLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const status = useSession((s) => s.status)
  const user = useSession((s) => s.user)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    void bootstrapSession()
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (claimInitialRedirect()) {
      navigate(status === 'authenticated' ? '/account' : '/login', { replace: true })
      return
    }
    if (
      status === 'authenticated' &&
      (pathname === '/' || pathname === '/login' || pathname === '/register')
    ) {
      navigate('/account', { replace: true })
      return
    }
    if (status === 'anonymous' && (pathname === '/' || pathname === '/account')) {
      navigate('/login', { replace: true })
    }
  }, [status, pathname, navigate])

  useEffect(() => {
    if (status === 'anonymous') queryClient.clear()
  }, [status, queryClient])

  const redirecting =
    (status === 'authenticated' &&
      (pathname === '/' || pathname === '/login' || pathname === '/register')) ||
    (status === 'anonymous' && (pathname === '/' || pathname === '/account'))

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#17181b]">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-4 md:px-8">
          <NavLink to="/" end className="text-sm font-medium tracking-normal text-[#17181b]">
            INKTEE
          </NavLink>
          <div className="ml-auto flex items-center gap-4 text-sm">
            {status === 'authenticated' && user ? (
              <>
                <NavLink to="/account" className="text-[#17181b]">
                  {user.nickname}
                </NavLink>
                <Button
                  type="primary"
                  shape="round"
                  disabled={leaving}
                  onClick={() => {
                    setLeaving(true)
                    void request('/v1/auth/logout', { method: 'POST' })
                      .then(() => {
                        useSession.getState().signOut(null)
                      })
                      .catch((error: unknown) => {
                        if (useSession.getState().status === 'anonymous') return
                        message.error(getErrorMessage(error))
                      })
                      .finally(() => {
                        setLeaving(false)
                      })
                  }}
                >
                  {leaving ? '正在退出' : '退出'}
                </Button>
              </>
            ) : status === 'anonymous' ? (
              <NavLink to="/login" className="text-[#17181b]">
                登录
              </NavLink>
            ) : null}
          </div>
        </div>
      </header>
      <main className="flex-1">
        {status === 'loading' || redirecting ? (
          <p className="mx-auto max-w-6xl px-5 py-16 text-sm text-stone-500 md:px-8">
            {status === 'loading'
              ? '正在恢复登录'
              : status === 'authenticated'
                ? '正在进入账号页'
                : '正在前往登录页'}
          </p>
        ) : (
          <Outlet />
        )}
      </main>
      <footer className="mt-auto border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
          <p className="text-sm font-medium tracking-normal">INKTEE</p>
          <p className="mt-3 text-sm text-stone-500">原创服饰</p>
        </div>
        <div className="border-t border-stone-100">
          <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-stone-400 md:px-8">© 2026 INKTEE</p>
        </div>
      </footer>
    </div>
  )
}
