import { ApiError, getErrorMessage, request } from '../api/client.ts'
import { storedRefreshToken, useSession, type User } from './session.ts'

let pending: Promise<void> | null = null

type RefreshResult = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export function bootstrapSession() {
  if (pending) return pending
  pending = (async () => {
    const refreshToken = storedRefreshToken()
    if (!refreshToken) {
      if (useSession.getState().status === 'loading') useSession.getState().signOut(null)
      return
    }
    try {
      const refreshed = await request<RefreshResult>('/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      useSession.getState().setTokens(refreshed.access_token, refreshed.refresh_token)
      const me = await request<User>('/v1/auth/me', { auth: true })
      useSession.getState().signIn(refreshed.access_token, refreshed.refresh_token, me)
    } catch (error) {
      if (useSession.getState().status !== 'loading') return
      const expired =
        error instanceof ApiError && (error.status === 401 || error.code === '401' || error.code === '40100')
      useSession.getState().signOut(expired ? null : getErrorMessage(error))
    }
  })()
  return pending
}
