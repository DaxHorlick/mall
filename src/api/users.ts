import { request } from './client.ts'
import { isMockMode, mockDelay } from './config.ts'
import { mockCurrentUser } from '../mocks/user.ts'
import type { AuthUser, UpdateProfileRequest } from '../types/auth.ts'
import type { CurrentUser } from '../types/user.ts'

/**
 * 当前登录用户资料。
 * Mock：返回本地演示用户；真实模式请求 `/users/me`（鉴权与后端尚未实现）
 */
export async function fetchCurrentUser(): Promise<CurrentUser> {
  if (isMockMode()) {
    await mockDelay(160)
    return mockCurrentUser
  }

  // TODO(backend): 商城演示用的扩展资料接口尚未实现。登录态以 /v1/auth/me 为准。
  return request<CurrentUser>('/users/me')
}

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
