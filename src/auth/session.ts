import { create } from 'zustand'

export type User = {
  id: number
  username: string | null
  nickname: string
  avatar_url: string | null
  phone: string | null
  email: string | null
  status: number
  roles: string[]
  created_at: string
}

type SessionState = {
  status: 'loading' | 'anonymous' | 'authenticated'
  accessToken: string | null
  user: User | null
  notice: string | null
  setToken: (accessToken: string) => void
  signIn: (accessToken: string, user: User) => void
  signOut: (notice?: string | null) => void
  clearNotice: () => void
}

export const useSession = create<SessionState>((set) => ({
  status: 'loading',
  accessToken: null,
  user: null,
  notice: null,
  setToken: (accessToken) => set({ accessToken }),
  signIn: (accessToken, user) =>
    set({ status: 'authenticated', accessToken, user, notice: null }),
  signOut: (notice = null) =>
    set({ status: 'anonymous', accessToken: null, user: null, notice }),
  clearNotice: () => set({ notice: null }),
}))
