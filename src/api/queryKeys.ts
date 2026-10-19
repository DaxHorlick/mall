import type { ProductQuery } from '../types/product.ts'

/** TanStack Query 缓存键，集中维护便于失效与复用 */
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (query: ProductQuery) => ['products', 'list', query] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    related: (id: string) => ['products', 'related', id] as const,
    hot: ['products', 'hot'] as const,
    recommended: ['products', 'recommended'] as const,
    marketplace: (keyword: string, category: string) =>
      ['products', 'marketplace', keyword, category] as const,
  },
  creators: {
    all: ['creators'] as const,
    hot: ['creators', 'hot'] as const,
    detail: (id: string) => ['creators', 'detail', id] as const,
    products: (id: string) => ['creators', 'products', id] as const,
  },
  designs: {
    all: ['designs'] as const,
    latest: (limit: number) => ['designs', 'latest', limit] as const,
    task: (taskId: string) => ['designs', 'task', taskId] as const,
  },
  orders: {
    all: ['orders'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  user: {
    current: ['user', 'current'] as const,
  },
} as const
