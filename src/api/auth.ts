import type { AuthUser, RegisterRequest } from '../types/auth.ts'
import { request } from './client.ts'

export function register(payload: RegisterRequest) {
  return request<AuthUser>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchCurrentUser() {
  return request<AuthUser>('/v1/auth/me', {
    method: 'GET',
  })
}
