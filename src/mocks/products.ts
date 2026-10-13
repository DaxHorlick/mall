import type { Product } from '../types/product.ts'

export const mockProducts: Product[] = [
  {
    id: 'p-ink-circle',
    name: 'Ink Circle Tee',
    price: 129,
    imageUrl: '/images/products/tee-ink.svg',
    category: 'graphic',
    creatorId: 'creator-nova',
    creatorName: 'Nova Ink',
    isHot: true,
    isRecommended: true,
    createdAt: '2026-03-12',
    description: '中心圆环印花，适合日常黑白穿搭。',
  },
  {
    id: 'p-wave-line',
    name: 'Wave Line Tee',
    price: 139,
    imageUrl: '/images/products/tee-wave.svg',
    category: 'graphic',
    creatorId: 'creator-linen',
    creatorName: 'Linen Lab',
    isHot: true,
    isRecommended: false,
    createdAt: '2026-03-18',
    description: '三层波浪线条，低调又有节奏感。',
  },
  {
    id: 'p-bloom-dot',
    name: 'Bloom Dot Tee',
    price: 149,
    imageUrl: '/images/products/tee-bloom.svg',
    category: 'limited',
    creatorId: 'creator-pulse',
    creatorName: 'Pulse Studio',
    isHot: true,
    isRecommended: true,
    createdAt: '2026-03-22',
    description: '点阵花形图案，限量配色。',
  },
  {
    id: 'p-grid-mark',
    name: 'Grid Mark Tee',
    price: 119,
    imageUrl: '/images/products/tee-grid.svg',
    category: 'graphic',
    creatorId: 'creator-orbit',
    creatorName: 'Orbit Atelier',
    isHot: false,
    isRecommended: true,
    createdAt: '2026-03-08',
    description: '网格十字标记，偏街头风格。',
  },
  {
    id: 'p-plain-soft',
    name: 'Soft Plain Tee',
    price: 99,
    imageUrl: '/images/products/tee-plain.svg',
    category: 'plain',
    creatorId: 'creator-linen',
    creatorName: 'Linen Lab',
    isHot: false,
    isRecommended: true,
    createdAt: '2026-02-28',
    description: '无印花基础款，柔软棉感面料。',
  },
  {
    id: 'p-oversize-xl',
    name: 'Oversize XL Tee',
    price: 159,
    imageUrl: '/images/products/tee-oversized.svg',
    category: 'oversized',
    creatorId: 'creator-pulse',
    creatorName: 'Pulse Studio',
    isHot: true,
    isRecommended: false,
    createdAt: '2026-03-25',
    description: '宽松版型，适合叠穿和外搭。',
  },
  {
    id: 'p-star-limited',
    name: 'Star Limited Tee',
    price: 189,
    imageUrl: '/images/products/tee-limited.svg',
    category: 'limited',
    creatorId: 'creator-nova',
    creatorName: 'Nova Ink',
    isHot: true,
    isRecommended: true,
    createdAt: '2026-03-28',
    description: '星形徽章限量印花，仅少量库存。',
  },
  {
    id: 'p-neon-orb',
    name: 'Neon Orb Tee',
    price: 145,
    imageUrl: '/images/products/tee-neon.svg',
    category: 'graphic',
    creatorId: 'creator-orbit',
    creatorName: 'Orbit Atelier',
    isHot: false,
    isRecommended: true,
    createdAt: '2026-03-05',
    description: '双环行星图案，深色底更显轮廓。',
  },
]

export function getProductById(id: string) {
  return mockProducts.find((item) => item.id === id)
}

export function getHotProducts() {
  return mockProducts.filter((item) => item.isHot)
}

export function getRecommendedProducts() {
  return mockProducts.filter((item) => item.isRecommended)
}
