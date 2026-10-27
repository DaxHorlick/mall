import { useEffect } from 'react'
import { fetchCurrentUser } from '../api/auth.ts'
import { ApiError, isAccountDisabled } from '../api/client.ts'
import { useAuthStore } from '../stores/auth.ts'

/**
 * 启动和刷新时用 Cookie 向 /auth/me 确认登录态。
 * 401 视为未登录；503 或网络失败保留内存中的用户，不跳转循环。
 */
export function useSessionBootstrap() {
  const bootstrapNonce = useAuthStore((s) => s.bootstrapNonce)
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)
  const setAnonymous = useAuthStore((s) => s.setAnonymous)
  const setUnavailable = useAuthStore((s) => s.setUnavailable)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const user = await fetchCurrentUser()
        if (!cancelled) {
          setAuthenticated(user)
        }
      } catch (err) {
        if (cancelled) {
          return
        }

        if (err instanceof ApiError && err.status === 401) {
          setAnonymous()
          return
        }

        if (isAccountDisabled(err)) {
          setAnonymous()
          return
        }

        const message =
          err instanceof ApiError ? err.message : '服务暂时不可用'
        setUnavailable(message)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [bootstrapNonce, setAnonymous, setAuthenticated, setUnavailable])
}
