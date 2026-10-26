import { QueryClient } from '@tanstack/react-query'

/** 统一缓存策略：少重试、窗口聚焦不自动刷新，适合商城列表与 Mock 调试 */
export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}
