export type Creator = {
  id: string
  name: string
  avatarUrl: string
  bio: string
  productCount: number
  followerCount: number
  isHot: boolean
}

/** 本地 Mock 登录用户，阶段 10/11 使用 */
export type CurrentUser = {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string
  bio: string
  /** 关联创作者身份，用于我的店铺 / 商家中心 */
  creatorId: string
  creatorName: string
}
