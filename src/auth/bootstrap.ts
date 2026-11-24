import { ApiError, getErrorMessage, request } from '../api/client.ts'
import { storedAccessToken, storedRefreshToken, storedUser, useSession, type User } from './session.ts'

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
    if (useSession.getState().status !== 'loading') return
    const refreshToken = storedRefreshToken()
    const accessToken = storedAccessToken()
    if (!refreshToken && !accessToken) {
      useSession.getState().signOut(null)
      return
    }
    try {
      let nextAccess = accessToken
      let nextRefresh = refreshToken
      if (!nextAccess) {
        const refreshed = await request<RefreshResult>('/v1/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
        nextAccess = refreshed.access_token
        nextRefresh = refreshed.refresh_token
        useSession.getState().setTokens(nextAccess, nextRefresh, refreshed.expires_in)
      } else {
        useSession.getState().setTokens(nextAccess, nextRefresh ?? '')
      }
      const cached = storedUser()
      const latest = useSession.getState()
      if (cached) {
        useSession.getState().signIn(
          latest.accessToken ?? nextAccess,
          latest.refreshToken ?? nextRefresh ?? '',
          cached,
        )
        return
      }
      const me = await request<User>('/v1/users/me', { auth: true })
      const after = useSession.getState()
      useSession.getState().signIn(after.accessToken ?? nextAccess, after.refreshToken ?? nextRefresh ?? '', me)
    } catch (error) {
      if (useSession.getState().status !== 'loading') return
      const expired =
        error instanceof ApiError && (error.status === 401 || error.code === '401' || error.code === '40100')
      useSession.getState().signOut(expired ? null : getErrorMessage(error))
    }
  })()
  return pending
}
