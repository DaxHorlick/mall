import type { Creator } from '../types/user.ts'

export const mockCreators: Creator[] = [
  {
    id: 'creator-nova',
    name: 'Nova Ink',
    avatarUrl: '/images/avatars/avatar-01.svg',
    bio: '黑白几何与街头符号。',
    productCount: 18,
    followerCount: 4200,
    isHot: true,
  },
  {
    id: 'creator-linen',
    name: 'Linen Lab',
    avatarUrl: '/images/avatars/avatar-02.svg',
    bio: '极简线条，适合日常叠穿。',
    productCount: 12,
    followerCount: 2800,
    isHot: true,
  },
  {
    id: 'creator-pulse',
    name: 'Pulse Studio',
    avatarUrl: '/images/avatars/avatar-03.svg',
    bio: '节奏感图案和限定联名。',
    productCount: 24,
    followerCount: 6100,
    isHot: true,
  },
  {
    id: 'creator-orbit',
    name: 'Orbit Atelier',
    avatarUrl: '/images/avatars/avatar-04.svg',
    bio: '太空主题插画与徽章。',
    productCount: 9,
    followerCount: 1500,
    isHot: true,
  },
]

export function getCreatorById(id: string) {
  return mockCreators.find((item) => item.id === id)
}

export function getHotCreators() {
  return mockCreators.filter((item) => item.isHot)
}
