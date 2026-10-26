import type { DesignWork } from '../types/design.ts'

export const mockDesigns: DesignWork[] = [
  {
    id: 'd-orbit-ring',
    title: 'Orbit Ring',
    imageUrl: '/images/designs/design-01.svg',
    creatorId: 'creator-orbit',
    creatorName: 'Orbit Atelier',
    createdAt: '2026-03-29',
    productId: 'p-neon-orb',
  },
  {
    id: 'd-pulse-wave',
    title: 'Pulse Wave',
    imageUrl: '/images/designs/design-02.svg',
    creatorId: 'creator-pulse',
    creatorName: 'Pulse Studio',
    createdAt: '2026-03-27',
    productId: 'p-wave-line',
  },
  {
    id: 'd-grid-frame',
    title: 'Grid Frame',
    imageUrl: '/images/designs/design-03.svg',
    creatorId: 'creator-nova',
    creatorName: 'Nova Ink',
    createdAt: '2026-03-26',
    productId: 'p-grid-mark',
  },
  {
    id: 'd-star-mark',
    title: 'Star Mark',
    imageUrl: '/images/designs/design-04.svg',
    creatorId: 'creator-linen',
    creatorName: 'Linen Lab',
    createdAt: '2026-03-24',
    productId: 'p-star-limited',
  },
  {
    id: 'd-ink-circle',
    title: 'Ink Circle',
    imageUrl: '/images/designs/design-01.svg',
    creatorId: 'creator-nova',
    creatorName: 'Nova Ink',
    createdAt: '2026-03-22',
    productId: 'p-ink-circle',
  },
  {
    id: 'd-bloom-dot',
    title: 'Bloom Dot',
    imageUrl: '/images/designs/design-03.svg',
    creatorId: 'creator-pulse',
    creatorName: 'Pulse Studio',
    createdAt: '2026-03-21',
    productId: 'p-bloom-dot',
  },
]

export function getLatestDesigns(limit = 4) {
  return [...mockDesigns]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}

export function getHotDesigns(limit = 4) {
  return [...mockDesigns]
    .filter((item) => Boolean(item.productId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}

export function getDesignsByCreator(creatorId: string) {
  return mockDesigns.filter((item) => item.creatorId === creatorId)
}

export function getDesignById(id: string) {
  return mockDesigns.find((item) => item.id === id)
}
