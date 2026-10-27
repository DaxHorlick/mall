import { create } from 'zustand'
import type { AuthUser } from '../types/auth.ts'

export type SessionStatus =
  | 'unknown'
  | 'authenticated'
  | 'anonymous'
  | 'unavailable'

type AuthState = {
  user: AuthUser | null
  status: SessionStatus
  /** /auth/me 失败时展示的服务端或网络文案 */
  statusMessage: string | null
  /** 递增后重新请求 /auth/me */
  bootstrapNonce: number
  setAuthenticated: (user: AuthUser) => void
  setAnonymous: () => void
  setUnavailable: (message: string) => void
  retryBootstrap: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'unknown',
  statusMessage: null,
  bootstrapNonce: 0,
  setAuthenticated: (user) =>
    set({ user, status: 'authenticated', statusMessage: null }),
  setAnonymous: () =>
    set({ user: null, status: 'anonymous', statusMessage: null }),
  setUnavailable: (statusMessage) => set({ status: 'unavailable', statusMessage }),
  retryBootstrap: () =>
    set((state) => ({
      status: 'unknown',
      statusMessage: null,
      bootstrapNonce: state.bootstrapNonce + 1,
    })),
}))
