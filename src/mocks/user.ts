import type { CurrentUser } from '../types/user.ts'

/** 本地 Mock 当前用户（未接入真实登录） */
export const mockCurrentUser: CurrentUser = {
  id: 'user-demo',
  name: '林墨',
  email: 'demo@inktee.local',
  phone: '13800138000',
  avatarUrl: '/images/avatars/avatar-01.svg',
  bio: '喜欢黑白几何与街头符号，偶尔也在创作者市场发布设计。',
  creatorId: 'creator-nova',
  creatorName: 'Nova Ink',
}
