import { ApiError, request } from './client.ts'
import type {
  CreatorApplicationRequest,
  CreatorProfile,
  PublicCreator,
  UpdateCreatorProfileRequest,
} from '../types/creator.ts'

/**
 * 当前登录用户的创作者资料。
 * 404「还不是创作者」表示已登录但还没申请，返回 null，不清登录态。
 */
export async function fetchMyCreator(): Promise<CreatorProfile | null> {
  try {
    return await request<CreatorProfile>('/v1/creators/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

/** 首次申请和被拒绝后的重新申请。不要附带 status 或 user_id。 */
export function applyForCreator(payload: CreatorApplicationRequest) {
  return request<CreatorProfile>('/v1/creators/applications', {
    method: 'POST',
    body: JSON.stringify({
      display_name: payload.display_name,
      bio: payload.bio,
    }),
  })
}

/** 只提交有改动的字段。pending 与 approved 可改，rejected 不能走这个接口。 */
export function updateMyCreator(payload: UpdateCreatorProfileRequest) {
  const body: UpdateCreatorProfileRequest = {}

  if (payload.display_name !== undefined) {
    body.display_name = payload.display_name
  }

  if (payload.bio !== undefined) {
    body.bio = payload.bio
  }

  return request<CreatorProfile>('/v1/creators/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

/** 公开主页。userId 是用户 ID，不需要登录。 */
export function fetchPublicCreator(userId: string) {
  return request<PublicCreator>(`/v1/creators/${encodeURIComponent(userId)}`)
}
