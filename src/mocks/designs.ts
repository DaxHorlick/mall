import type { DesignWork } from '../types/design.ts'

export const mockDesigns: DesignWork[] = [
  {
    id: 'd-orbit-ring',
    title: 'Orbit Ring',
    imageUrl: '/images/designs/design-01.svg',
    creatorId: 'creator-orbit',
    creatorName: 'Orbit Atelier',
    createdAt: '2026-03-29',
  },
  {
    id: 'd-pulse-wave',
    title: 'Pulse Wave',
    imageUrl: '/images/designs/design-02.svg',
    creatorId: 'creator-pulse',
    creatorName: 'Pulse Studio',
    createdAt: '2026-03-27',
  },
  {
    id: 'd-grid-frame',
    title: 'Grid Frame',
    imageUrl: '/images/designs/design-03.svg',
    creatorId: 'creator-nova',
    creatorName: 'Nova Ink',
    createdAt: '2026-03-26',
  },
  {
    id: 'd-star-mark',
    title: 'Star Mark',
    imageUrl: '/images/designs/design-04.svg',
    creatorId: 'creator-linen',
    creatorName: 'Linen Lab',
    createdAt: '2026-03-24',
  },
]

export function getLatestDesigns(limit = 4) {
  return [...mockDesigns]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}
