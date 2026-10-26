import { ApiError, request } from './client.ts'
import { isMockMode, mockDelay } from './config.ts'
import {
  getCreatorById,
  getHotCreators,
  mockCreators,
} from '../mocks/creators.ts'
import type { Creator } from '../types/user.ts'

/** 创作者列表 */
export async function fetchCreators(): Promise<Creator[]> {
  if (isMockMode()) {
    await mockDelay(200)
    return mockCreators
  }

  // TODO(backend): Go 创作者列表接口尚未实现
  return request<Creator[]>('/creators')
}

export async function fetchHotCreators(): Promise<Creator[]> {
  if (isMockMode()) {
    await mockDelay(200)
    return getHotCreators()
  }

  // TODO(backend): Go 热门创作者接口尚未实现
  return request<Creator[]>('/creators/hot')
}

export async function fetchCreatorById(id: string): Promise<Creator> {
  if (isMockMode()) {
    await mockDelay(220)
    const creator = getCreatorById(id)
    if (!creator) {
      throw new ApiError(404, '创作者不存在')
    }
    return creator
  }

  // TODO(backend): Go 创作者详情接口尚未实现
  return request<Creator>(`/creators/${id}`)
}
