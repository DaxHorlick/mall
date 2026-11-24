import { create } from 'zustand'

const refreshKey = 'dezajn.refresh_token'
const accessKey = 'dezajn.access_token'
const accessExpKey = 'dezajn.access_expires_at'
const userKey = 'dezajn.user'
const accessSkewMs = 60_000

export type User = {
  user_id: number | string
  username: string
  user_no?: string
  nickname: string
  avatar: string
  cover_image?: string
  bio?: string
  gender?: number
  birthday?: string
  location?: string
  email?: string
  phone?: string
  status?: number
  created_at?: string
  following_count?: number
  followers_count?: number
  post_count?: number
}

type SessionState = {
  status: 'loading' | 'anonymous' | 'authenticated'
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  notice: string | null
  setTokens: (accessToken: string, refreshToken: string, expiresIn?: number) => void
  signIn: (accessToken: string, refreshToken: string, user: User, expiresIn?: number) => void
  signOut: (notice?: string | null) => void
  setNotice: (notice: string | null) => void
  clearNotice: () => void
  patchUser: (patch: Partial<User>) => void
}

function writeStored(refreshToken: string | null, accessToken: string | null, expiresIn?: number) {
  try {
    if (refreshToken) localStorage.setItem(refreshKey, refreshToken)
    else localStorage.removeItem(refreshKey)
  } catch {
    // 浏览器禁用本地存储时，关闭页面后需要重新登录。
  }
  try {
    if (!accessToken) {
      sessionStorage.removeItem(accessKey)
      sessionStorage.removeItem(accessExpKey)
      return
    }
    sessionStorage.setItem(accessKey, accessToken)
    if (expiresIn !== undefined && Number.isFinite(expiresIn) && expiresIn > 0) {
      sessionStorage.setItem(accessExpKey, String(Date.now() + expiresIn * 1000))
    }
  } catch {
    // 浏览器禁用会话存储时，刷新页面后需要重新换发访问令牌。
  }
}

export function storedRefreshToken() {
  try {
    return localStorage.getItem(refreshKey)
  } catch {
    return null
  }
}

export function storedAccessToken() {
  try {
    const token = sessionStorage.getItem(accessKey)
    const expiresAt = Number(sessionStorage.getItem(accessExpKey))
    if (!token || !Number.isFinite(expiresAt) || expiresAt - accessSkewMs <= Date.now()) return null
    return token
  } catch {
    return null
  }
}

export function storedUser() {
  try {
    const raw = sessionStorage.getItem(userKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as User
    if (!parsed || typeof parsed !== 'object' || parsed.user_id === undefined || typeof parsed.username !== 'string') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeStoredUser(user: User | null) {
  try {
    if (user) sessionStorage.setItem(userKey, JSON.stringify(user))
    else sessionStorage.removeItem(userKey)
  } catch {
    // 浏览器禁用会话存储时，刷新后重新拉取当前用户。
  }
}

const openingAccess = storedAccessToken()
const openingRefresh = storedRefreshToken()
const openingUser = openingAccess ? storedUser() : null
const openingStatus: SessionState['status'] =
  openingAccess && openingUser ? 'authenticated' : !openingAccess && !openingRefresh ? 'anonymous' : 'loading'

export const useSession = create<SessionState>((set) => ({
  status: openingStatus,
  accessToken: openingStatus === 'anonymous' ? null : openingAccess,
  refreshToken: openingStatus === 'anonymous' ? null : openingRefresh,
  user: openingStatus === 'authenticated' ? openingUser : null,
  notice: null,
  setTokens: (accessToken, refreshToken, expiresIn) => {
    writeStored(refreshToken, accessToken, expiresIn)
    set({ accessToken, refreshToken })
  },
  signIn: (accessToken, refreshToken, user, expiresIn) => {
    writeStored(refreshToken, accessToken, expiresIn)
    writeStoredUser(user)
    set({ status: 'authenticated', accessToken, refreshToken, user, notice: null })
  },
  signOut: (notice = null) => {
    writeStored(null, null)
    writeStoredUser(null)
    set({ status: 'anonymous', accessToken: null, refreshToken: null, user: null, notice })
  },
  setNotice: (notice) => set({ notice }),
  clearNotice: () => set({ notice: null }),
  patchUser: (patch) =>
    set((state) => {
      if (!state.user) return {}
      const user = { ...state.user, ...patch }
      writeStoredUser(user)
      return { user }
    }),
}))
