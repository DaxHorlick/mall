import { request } from './client.ts'
import { isMockMode, mockDelay } from './config.ts'
import { mockCurrentUser } from '../mocks/user.ts'
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

  // TODO(backend): Go 用户资料接口尚未实现，且未接入真实登录
  return request<CurrentUser>('/users/me')
}
