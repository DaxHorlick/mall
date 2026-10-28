import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys.ts'
import type { CommunityPost, OwnedPostDesign, PostStatus } from '../types/community.ts'
import type { CreatorStatus } from '../types/creator.ts'

export const PUBLIC_POSTS_LIMIT = 20

export const MY_POSTS_LIMIT = 20

export const COMMENTS_LIMIT = 20

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  draft: '草稿',
  pending: '审核中',
  published: '已发布',
  rejected: '已拒绝',
  hidden: '已下架',
}

export const DESIGN_NOT_READY_MESSAGE = '公开手记的设计必须已公开并通过审核'

export const CREATOR_NOT_READY_MESSAGE = '公开手记需要已通过审核的创作者'

export const CREATOR_DISABLED_MESSAGE = '创作者身份已停用'

const WITHDRAW_NOTICE = '撤回后手记离开公开列表，已有评论和点赞会保留。'

export function withdrawNotice() {
  return WITHDRAW_NOTICE
}

function charCount(value: string) {
  return Array.from(value).length
}

function hasDisallowedControl(value: string) {
  for (const char of value) {
    const code = char.charCodeAt(0)
    const isControl = code <= 31 || (code >= 127 && code <= 159)
    const allowed = code === 9 || code === 10 || code === 13
    if (isControl && !allowed) {
      return true
    }
  }

  return false
}

export function parsePostId(value: string | undefined) {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return null
  }

  const id = Number(value)
  if (!Number.isSafeInteger(id)) {
    return null
  }

  return id
}

export function validatePostBody(value: string) {
  if (hasDisallowedControl(value)) {
    return '正文不能包含控制字符'
  }

  if (charCount(value.trim()) > 8000) {
    return '正文不能超过 8000 个字符'
  }

  return null
}

export function validatePostBodyForSubmit(value: string) {
  const error = validatePostBody(value)
  if (error) {
    return error
  }

  if (charCount(value.trim()) < 1) {
    return '正文不能为空'
  }

  return null
}

export function validateComment(value: string) {
  if (hasDisallowedControl(value)) {
    return '评论不能包含控制字符'
  }

  const count = charCount(value.trim())
  if (count < 1 || count > 500) {
    return '评论长度需为 1 到 500 个字符'
  }

  return null
}

export function postImageUrl(design: {
  result: { url: string } | null
  preview: { url: string } | null
}) {
  if (design.result?.url) {
    return design.result.url
  }

  if (design.preview?.url) {
    return design.preview.url
  }

  return null
}

export function designReadyForPublicPost(design: OwnedPostDesign) {
  return design.visibility === 'public' && design.review_status === 'approved'
}

export function creatorSubmitHint(
  creator: { status: CreatorStatus } | null | undefined,
) {
  if (creator === undefined) {
    return null
  }

  if (creator?.status === 'disabled') {
    return CREATOR_DISABLED_MESSAGE
  }

  if (creator === null || creator.status !== 'approved') {
    return CREATOR_NOT_READY_MESSAGE
  }

  return null
}

export function cacheCommunityPost(queryClient: QueryClient, post: CommunityPost) {
  queryClient.setQueryData(queryKeys.community.post(String(post.id)), post)
}

export function invalidateCommunityLists(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['community', 'posts', 'mine'] })
  void queryClient.invalidateQueries({ queryKey: ['community', 'posts', 'public'] })
}
