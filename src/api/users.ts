import { request } from './client.ts'
import type { AuthUser, UpdateProfileRequest } from '../types/auth.ts'

/** 只提交有改动的字段。不能传 id、status 等只读字段。 */
export function updateProfile(payload: UpdateProfileRequest) {
  const body: UpdateProfileRequest = {}

  if (payload.nickname !== undefined) {
    body.nickname = payload.nickname
  }

  if (payload.avatar_url !== undefined) {
    body.avatar_url = payload.avatar_url
  }

  return request<AuthUser>('/v1/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
