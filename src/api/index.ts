/**
 * API 层统一出口。页面与组件应从此处或子模块导入，不要直接 fetch。
 * 基地址：VITE_API_BASE_URL，请求统一走 /api/v1。
 */
export { ApiError, getErrorMessage, request } from './client.ts'
export { queryKeys } from './queryKeys.ts'
export { createAppQueryClient } from './queryClient.ts'
