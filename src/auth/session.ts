import { create } from 'zustand'

const refreshKey = 'dezajn.refresh_token'

export type User = {
  user_id: number
  username: string
  nickname: string
  avatar: string
  email?: string
  phone?: string
  status?: number
  created_at?: string
}

type SessionState = {
  status: 'loading' | 'anonymous' | 'authenticated'
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  notice: string | null
  setTokens: (accessToken: string, refreshToken: string) => void
  signIn: (accessToken: string, refreshToken: string, user: User) => void
  signOut: (notice?: string | null) => void
  setNotice: (notice: string | null) => void
  clearNotice: () => void
}

function writeRefresh(token: string | null) {
  try {
    if (token) localStorage.setItem(refreshKey, token)
    else localStorage.removeItem(refreshKey)
  } catch {
    // 浏览器禁用本地存储时，关闭页面后需要重新登录。
  }
}

export function storedRefreshToken() {
  try {
    return localStorage.getItem(refreshKey)
  } catch {
    return null
  }
}

export const useSession = create<SessionState>((set) => ({
  status: 'loading',
  accessToken: null,
  refreshToken: null,
  user: null,
  notice: null,
  setTokens: (accessToken, refreshToken) => {
    writeRefresh(refreshToken)
    set({ accessToken, refreshToken })
  },
  signIn: (accessToken, refreshToken, user) => {
    writeRefresh(refreshToken)
    set({ status: 'authenticated', accessToken, refreshToken, user, notice: null })
  },
  signOut: (notice = null) => {
    writeRefresh(null)
    set({ status: 'anonymous', accessToken: null, refreshToken: null, user: null, notice })
  },
  setNotice: (notice) => set({ notice }),
  clearNotice: () => set({ notice: null }),
}))
