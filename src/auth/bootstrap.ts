import { getErrorMessage, request } from '../api/client.ts'
import { useSession, type User } from './session.ts'

let pending: Promise<void> | null = null
let initialRedirectClaimed = false

export function bootstrapSession() {
  if (pending) return pending
  pending = (async () => {
    try {
      const refreshed = await request<{ access_token: string; expires_in: number }>(
        '/v1/auth/refresh',
        { method: 'POST' },
      )
      useSession.getState().setToken(refreshed.access_token)
      const me = await request<{ user: User }>('/v1/users/me', { auth: true })
      useSession.getState().signIn(refreshed.access_token, me.user)
    } catch (error) {
      if (useSession.getState().status !== 'loading') return
      const message = getErrorMessage(error)
      useSession.getState().signOut(message === '未登录' ? null : message)
    }
  })()
  return pending
}

export function claimInitialRedirect() {
  if (initialRedirectClaimed) return false
  initialRedirectClaimed = true
  return true
}
