export type CreatorStatus = 'pending' | 'approved' | 'rejected' | 'disabled'

/** 当前登录用户自己的创作者资料。公开链接使用 user_id，不用 id。 */
export type CreatorProfile = {
  id: number
  user_id: number
  display_name: string
  bio: string
  status: CreatorStatus
  reject_reason: string
  applied_at: string
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

/** 公开主页。只有已通过且账号可用时才会返回。 */
export type PublicCreator = {
  user_id: number
  display_name: string
  bio: string
  nickname: string
  avatar_url: string | null
  status: 'approved'
  created_at: string
}

export type CreatorApplicationRequest = {
  display_name: string
  bio: string
}

export type UpdateCreatorProfileRequest = {
  display_name?: string
  bio?: string
}
