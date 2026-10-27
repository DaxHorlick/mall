export type ApiBody<T> = {
  code: string
  message: string
  data: T | null
}

export type IdentityType = 'email' | 'phone'

export type AuthUser = {
  id: number
  nickname: string
  avatar_url: string | null
  status: string
  last_login_at?: string | null
  created_at: string
}

export type RegisterRequest = {
  nickname: string
  identity_type: IdentityType
  identifier: string
  password: string
}

export type LoginRequest = {
  identity_type: IdentityType
  identifier: string
  password: string
}

export type UpdateProfileRequest = {
  nickname?: string
  avatar_url?: string
}

export type AuthLocationState = {
  from?: string
}
