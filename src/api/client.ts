import { isMockMode } from './config.ts'

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly body?: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function getErrorMessage(error: unknown, fallback = '请求失败，请稍后重试') {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export function toQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    search.set(key, String(value))
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}

async function readErrorMessage(response: Response) {
  try {
    const data: unknown = await response.json()
    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
    ) {
      return (data as { message: string }).message
    }
    return `请求失败（${response.status}）`
  } catch {
    return `请求失败（${response.status}）`
  }
}

/**
 * 统一 fetch 封装。页面与业务代码应通过 `src/api/*` 调用，不要直接 fetch。
 * 注意：不得在此硬编码 API 密钥；鉴权后续由后端约定（如 Cookie / Authorization）。
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) {
    throw new Error('缺少环境变量 VITE_API_BASE_URL')
  }

  const headers = new Headers(init?.headers)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  const isFormData =
    typeof FormData !== 'undefined' && init?.body instanceof FormData

  if (init?.body !== undefined && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
    })
  } catch {
    throw new ApiError(0, '网络异常，请检查连接后重试')
  }

  if (!response.ok) {
    const message = await readErrorMessage(response)
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export type UploadImageResult = {
  url: string
  /** 标明当前是否为 Mock 上传结果 */
  isMock: boolean
}

/**
 * 图片上传调用结构。
 * - Mock：返回本地 object URL / 占位路径，不上传服务器
 * - 真实：POST multipart 到 `/uploads/images`（Go 后端尚未实现）
 */
export async function uploadImage(file: File): Promise<UploadImageResult> {
  if (isMockMode()) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 280)
    })
    return {
      url: URL.createObjectURL(file),
      isMock: true,
    }
  }

  const formData = new FormData()
  formData.append('file', file)

  // TODO(backend): Go 上传接口尚未实现
  return request<UploadImageResult>('/uploads/images', {
    method: 'POST',
    body: formData,
  })
}
