import { useEffect, useRef } from 'react'
import { fetchCurrentUser } from '../api/auth.ts'
import { ApiError } from '../api/client.ts'
import { useAuthStore } from '../stores/auth.ts'

/** 用 Cookie 会话拉取当前用户；未登录（401 等）时清空本地 user。 */
export function useSessionBootstrap() {
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) {
      return
    }
    started.current = true

    let cancelled = false

    ;(async () => {
      try {
        const user = await fetchCurrentUser()
        if (!cancelled) {
          setUser(user)
        }
      } catch (err) {
        if (cancelled) {
          return
        }
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearUser()
          return
        }
        // 网络或其它错误：保留现有内存态，不强行登出
      }
    })()

    return () => {
      cancelled = true
    }
  }, [clearUser, setUser])
}
