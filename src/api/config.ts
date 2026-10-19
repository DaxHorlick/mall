/**
 * API 运行配置。
 * - VITE_USE_MOCK=true（默认）：走本地 Mock，不请求真实后端
 * - VITE_USE_MOCK=false：走 VITE_API_BASE_URL 指向的 Go/AI 服务
 */
export function isMockMode() {
  const flag = import.meta.env.VITE_USE_MOCK
  return flag !== 'false' && flag !== '0'
}

export const MOCK_DELAY_MS = 320

export function mockDelay(ms = MOCK_DELAY_MS) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
