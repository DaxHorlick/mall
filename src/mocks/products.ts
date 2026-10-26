import type {
  Product,
  ProductColor,
  ProductListResult,
  ProductQuery,
  ProductSize,
  ProductSort,
} from '../types/product.ts'
import { variantStockKey } from '../types/product.ts'

const ALL_SIZES: ProductSize[] = ['S', 'M', 'L', 'XL']

const COLOR_BLACK: ProductColor = {
  key: 'black',
  label: '黑色',
  hex: '#171717',
}
const COLOR_WHITE: ProductColor = {
  key: 'white',
  label: '白色',
  hex: '#f5f5f4',
}
const COLOR_STONE: ProductColor = {
  key: 'stone',
  label: '石灰',
  hex: '#a8a29e',
}
const COLOR_NAVY: ProductColor = {
  key: 'navy',
  label: '藏青',
  hex: '#1e293b',
}
const COLOR_OLIVE: ProductColor = {
  key: 'olive',
  label: '橄榄绿',
  hex: '#3f4f3a',
}

function buildStockMap(
  colors: ProductColor[],
  sizes: ProductSize[],
  seed: number,
): Record<string, number> {
  const map: Record<string, number> = {}

  colors.forEach((color, colorIndex) => {
    sizes.forEach((size, sizeIndex) => {
      const value = ((seed + colorIndex * 3 + sizeIndex * 5) % 9) + 2
      // 个别规格故意缺货，便于演示
      map[variantStockKey(color.key, size)] =
        colorIndex === 0 && sizeIndex === 0 && seed % 4 === 0 ? 0 : value
    })
  })

  return map
}

type ProductSeed = Omit<Product, 'colors' | 'sizes' | 'stockMap'> & {
  colors: ProductColor[]
  seed: number
}

function createProduct(seed: ProductSeed): Product {
  const sizes = ALL_SIZES
  return {
    id: seed.id,
    name: seed.name,
    price: seed.price,
    imageUrl: seed.imageUrl,
    category: seed.category,
    creatorId: seed.creatorId,
    creatorName: seed.creatorName,
    isHot: seed.isHot,
    isRecommended: seed.isRecommended,
    createdAt: seed.createdAt,
    description: seed.description,
    colors: seed.colors,
    sizes,
    stockMap: buildStockMap(seed.colors, sizes, seed.seed),
  }
}

export const mockProducts: Product[] = [
  createProduct({
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
    description:
      '中心圆环印花，适合日常黑白穿搭。面料柔软透气，图案采用环保水性墨。',
    colors: [COLOR_BLACK, COLOR_WHITE, COLOR_STONE],
    seed: 11,
  }),
  createProduct({
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
    description: '三层波浪线条，低调又有节奏感。适合城市通勤与周末出行。',
    colors: [COLOR_BLACK, COLOR_NAVY, COLOR_WHITE],
    seed: 12,
  }),
  createProduct({
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
    description: '点阵花形图案，限量配色。每批次数量有限，售完不补。',
    colors: [COLOR_WHITE, COLOR_STONE, COLOR_OLIVE],
    seed: 13,
  }),
  createProduct({
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
    description: '网格十字标记，偏街头风格。胸口小面积印花，不易过时。',
    colors: [COLOR_BLACK, COLOR_WHITE],
    seed: 14,
  }),
  createProduct({
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
    description: '无印花基础款，柔软棉感面料。可作为日常内搭或单穿。',
    colors: [COLOR_WHITE, COLOR_BLACK, COLOR_STONE, COLOR_NAVY],
    seed: 15,
  }),
  createProduct({
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
    description: '宽松版型，适合叠穿和外搭。肩线略落，袖口自然垂坠。',
    colors: [COLOR_BLACK, COLOR_OLIVE, COLOR_STONE],
    seed: 16,
  }),
  createProduct({
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
    description: '星形徽章限量印花，仅少量库存。建议尽早选定尺码下单。',
    colors: [COLOR_BLACK, COLOR_NAVY],
    seed: 17,
  }),
  createProduct({
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
    description: '双环行星图案，深色底更显轮廓。夜光感线条适合暗色穿搭。',
    colors: [COLOR_BLACK, COLOR_NAVY, COLOR_WHITE],
    seed: 18,
  }),
  createProduct({
    id: 'p-plain-daily',
    name: 'Daily Plain Tee',
    price: 89,
    imageUrl: '/images/products/tee-plain.svg',
    category: 'plain',
    creatorId: 'creator-nova',
    creatorName: 'Nova Ink',
    isHot: false,
    isRecommended: false,
    createdAt: '2026-02-20',
    description: '轻薄基础白 Tee，适合内搭。多色可选，方便混搭。',
    colors: [COLOR_WHITE, COLOR_BLACK, COLOR_STONE],
    seed: 19,
  }),
  createProduct({
    id: 'p-oversize-ink',
    name: 'Ink Oversize Tee',
    price: 169,
    imageUrl: '/images/products/tee-ink.svg',
    category: 'oversized',
    creatorId: 'creator-orbit',
    creatorName: 'Orbit Atelier',
    isHot: false,
    isRecommended: true,
    createdAt: '2026-03-15',
    description: '宽松版型搭配圆环印花。版型偏长，遮臀效果更好。',
    colors: [COLOR_BLACK, COLOR_WHITE, COLOR_OLIVE],
    seed: 20,
  }),
  createProduct({
    id: 'p-wave-night',
    name: 'Night Wave Tee',
    price: 155,
    imageUrl: '/images/products/tee-wave.svg',
    category: 'graphic',
    creatorId: 'creator-pulse',
    creatorName: 'Pulse Studio',
    isHot: true,
    isRecommended: false,
    createdAt: '2026-03-30',
    description: '深色底波浪线，夜间更显层次。建议搭配深色下装。',
    colors: [COLOR_BLACK, COLOR_NAVY],
    seed: 21,
  }),
  createProduct({
    id: 'p-bloom-mini',
    name: 'Mini Bloom Tee',
    price: 135,
    imageUrl: '/images/products/tee-bloom.svg',
    category: 'limited',
    creatorId: 'creator-linen',
    creatorName: 'Linen Lab',
    isHot: false,
    isRecommended: false,
    createdAt: '2026-03-10',
    description: '小号点阵花，限量补货批次。印花位置偏胸口右侧。',
    colors: [COLOR_WHITE, COLOR_STONE],
    seed: 22,
  }),
]

const DEFAULT_PAGE_SIZE = 8

function matchesKeyword(product: Product, keyword: string) {
  const needle = keyword.trim().toLowerCase()
  if (!needle) {
    return true
  }

  return [product.name, product.creatorName, product.description, product.category]
    .join(' ')
    .toLowerCase()
    .includes(needle)
}

function sortProducts(items: Product[], sort: ProductSort) {
  const next = [...items]

  switch (sort) {
    case 'price-asc':
      return next.sort((a, b) => a.price - b.price || b.createdAt.localeCompare(a.createdAt))
    case 'price-desc':
      return next.sort((a, b) => b.price - a.price || b.createdAt.localeCompare(a.createdAt))
    case 'newest':
    default:
      return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

export function getProductById(id: string) {
  return mockProducts.find((item) => item.id === id)
}

export function getHotProducts() {
  return mockProducts.filter((item) => item.isHot)
}

export function getRecommendedProducts() {
  return mockProducts.filter((item) => item.isRecommended)
}

/** 详情页推荐：同分类优先，其次推荐商品，排除当前商品 */
export function getRelatedProducts(productId: string, limit = 4) {
  const current = getProductById(productId)
  if (!current) {
    return getRecommendedProducts().slice(0, limit)
  }

  const sameCategory = mockProducts.filter(
    (item) => item.id !== productId && item.category === current.category,
  )
  const recommended = mockProducts.filter(
    (item) =>
      item.id !== productId &&
      item.isRecommended &&
      !sameCategory.some((picked) => picked.id === item.id),
  )
  const rest = mockProducts.filter(
    (item) =>
      item.id !== productId &&
      !sameCategory.some((picked) => picked.id === item.id) &&
      !recommended.some((picked) => picked.id === item.id),
  )

  return [...sameCategory, ...recommended, ...rest].slice(0, limit)
}

export function queryMockProducts(query: ProductQuery = {}): ProductListResult {
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : DEFAULT_PAGE_SIZE
  const page = query.page && query.page > 0 ? query.page : 1
  const sort = query.sort ?? 'newest'
  const keyword = query.keyword ?? ''
  const category = query.category ?? ''
  const minPrice = query.minPrice ?? null
  const maxPrice = query.maxPrice ?? null

  let filtered = mockProducts.filter((item) => matchesKeyword(item, keyword))

  if (category) {
    filtered = filtered.filter((item) => item.category === category)
  }

  if (minPrice !== null && Number.isFinite(minPrice)) {
    filtered = filtered.filter((item) => item.price >= minPrice)
  }

  if (maxPrice !== null && Number.isFinite(maxPrice)) {
    filtered = filtered.filter((item) => item.price <= maxPrice)
  }

  const sorted = sortProducts(filtered, sort)
  const total = sorted.length
  const start = (page - 1) * pageSize
  const items = sorted.slice(start, start + pageSize)

  return {
    items,
    total,
    page,
    pageSize,
  }
}
