import { request, toQueryString } from './client.ts'
import type { CommunityPost, OwnedPost, PostComment, PublicPost } from '../types/community.ts'
import { COMMENTS_LIMIT, MY_POSTS_LIMIT, PUBLIC_POSTS_LIMIT } from '../utils/community.ts'

export { COMMENTS_LIMIT, MY_POSTS_LIMIT, PUBLIC_POSTS_LIMIT }

/** 已发布且仍满足公开条件的手记。不需要登录，不能搜索或按设计、状态筛选。 */
export function fetchPublicPosts(options?: { limit?: number; authorUserId?: number }) {
  return request<{ items: PublicPost[] }>(
    `/v1/community/posts${toQueryString({
      limit: options?.limit ?? PUBLIC_POSTS_LIMIT,
      author_user_id: options?.authorUserId,
    })}`,
  )
}

/** 当前用户自己的手记，包含草稿、审核中、已发布、已拒绝和已下架。 */
export function fetchMyPosts(limit = MY_POSTS_LIMIT) {
  return request<{ items: OwnedPost[] }>(
    `/v1/community/posts/mine${toQueryString({ limit })}`,
  )
}

/** 作者拿到完整资料；其他人只有公开条件全部成立时的公开资料。 */
export function fetchPost(id: number) {
  return request<CommunityPost>(`/v1/community/posts/${id}`)
}

/** body 可以省略。成功后状态为草稿。不要附带 status 或用户 ID。 */
export function createPost(input: { design_id: number; body?: string }) {
  const payload: { design_id: number; body?: string } = {
    design_id: input.design_id,
  }

  if (input.body !== undefined) {
    payload.body = input.body
  }

  return request<OwnedPost>('/v1/community/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** 只提交正文。不能用这个接口更换设计。 */
export function updatePostBody(id: number, body: string) {
  return request<OwnedPost>(`/v1/community/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ body }),
  })
}

export function submitPost(id: number) {
  return request<OwnedPost>(`/v1/community/posts/${id}/submissions`, {
    method: 'POST',
  })
}

export function withdrawPost(id: number) {
  return request<OwnedPost>(`/v1/community/posts/${id}/withdrawals`, {
    method: 'POST',
  })
}

export function fetchComments(postId: number, limit = COMMENTS_LIMIT) {
  return request<{ items: PostComment[] }>(
    `/v1/community/posts/${postId}/comments${toQueryString({ limit })}`,
  )
}

export function createComment(postId: number, content: string) {
  return request<PostComment>(`/v1/community/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function likePost(id: number) {
  return request<CommunityPost>(`/v1/community/posts/${id}/likes`, {
    method: 'POST',
  })
}

export function unlikePost(id: number) {
  return request<CommunityPost>(`/v1/community/posts/${id}/likes`, {
    method: 'DELETE',
  })
}
