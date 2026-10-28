import type { DesignImage, DesignReviewStatus, DesignVisibility, PreviewImage } from './userDesign.ts'

export type PostStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'hidden'

/** 作者看到的设计卡片，用来判断这篇手记现在能不能公开。 */
export type OwnedPostDesign = {
  id: number
  title: string
  visibility: DesignVisibility
  review_status: DesignReviewStatus
  result: DesignImage | null
  preview: PreviewImage | null
}

/** 公开手记上的设计卡片。没有可见性和审核状态。 */
export type PublicPostDesign = {
  id: number
  title: string
  result: DesignImage | null
  preview: PreviewImage | null
}

export type PostAuthor = {
  user_id: number
  display_name: string
  nickname: string
  avatar_url: string | null
}

/** 自己的手记。响应当中有 reject_reason。 */
export type OwnedPost = {
  id: number
  design_id: number
  author_user_id: number
  body: string
  status: PostStatus
  reject_reason: string
  like_count: number
  liked: boolean
  comment_count: number
  design: OwnedPostDesign
  published_at: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

/** 公开手记。没有拒绝原因、审核时间和更新时间。 */
export type PublicPost = {
  id: number
  design_id: number
  author_user_id: number
  body: string
  status: 'published'
  like_count: number
  liked: boolean
  comment_count: number
  design: PublicPostDesign
  author: PostAuthor
  published_at: string | null
  created_at: string
}

export type CommunityPost = OwnedPost | PublicPost

export type PostComment = {
  id: number
  post_id: number
  user_id: number
  nickname: string
  avatar_url: string | null
  content: string
  created_at: string
}

export function isOwnedPost(post: CommunityPost): post is OwnedPost {
  return 'reject_reason' in post
}
