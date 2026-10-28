import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './client.ts'

/** 统一缓存策略：少重试、窗口聚焦不自动刷新，适合商城列表与 Mock 调试 */
export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          if (
            error instanceof ApiError &&
            (error.status === 400 ||
              error.status === 401 ||
              error.status === 403 ||
              error.status === 404 ||
              error.status === 409 ||
              error.status === 429)
          ) {
            return false
          }
          return failureCount < 1
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}
