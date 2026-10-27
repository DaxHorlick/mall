import type { AuthUser, LoginRequest, RegisterRequest } from '../types/auth.ts'
import { request } from './client.ts'

export function register(payload: RegisterRequest) {
  return request<AuthUser>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nickname: payload.nickname,
      identity_type: payload.identity_type,
      identifier: payload.identifier,
      password: payload.password,
    }),
  })
}

export function login(payload: LoginRequest) {
  return request<AuthUser>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identity_type: payload.identity_type,
      identifier: payload.identifier,
      password: payload.password,
    }),
  })
}

export function logout() {
  return request<Record<string, never>>('/v1/auth/logout', {
    method: 'POST',
  })
}

export function fetchCurrentUser() {
  return request<AuthUser>('/v1/auth/me', {
    method: 'GET',
  })
}
