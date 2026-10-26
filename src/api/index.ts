/**
 * API 层统一出口。页面与组件应从此处或子模块导入，不要直接 fetch / 引用 mocks。
 *
 * Mock 切换：环境变量 VITE_USE_MOCK（默认 true）
 * 真实后端：VITE_API_BASE_URL
 */
export { ApiError, getErrorMessage, request, uploadImage } from './client.ts'
export { isMockMode } from './config.ts'
export { queryKeys } from './queryKeys.ts'
export { createAppQueryClient } from './queryClient.ts'
