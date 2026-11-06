type ApiBody<T> = {
  code: string
  message: string
  data: T | null
}

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly body?: unknown

  constructor(status: number, message: string, code = 'UNKNOWN', body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
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

function httpMessage(status: number) {
  if (status === 500) {
    return '内部错误'
  }
  if (status === 503) {
    return '服务暂时不可用'
  }
  return '请求失败，请稍后重试'
}

/** 带 Cookie 的 fetch。响应若是 `{ code, message, data }`，返回其中的 data。 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) {
    throw new Error('缺少环境变量 VITE_API_BASE_URL')
  }

  const headers = new Headers(init?.headers)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData
  if (init?.body !== undefined && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers,
    })
  } catch {
    throw new ApiError(0, '网络异常，请检查连接后重试')
  }

  if (response.status === 204) {
    if (!response.ok) {
      throw new ApiError(response.status, httpMessage(response.status))
    }
    return undefined as T
  }

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  const record =
    payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
  const isEnvelope =
    !!record &&
    typeof record.code === 'string' &&
    typeof record.message === 'string' &&
    'data' in record

  if (isEnvelope) {
    const body = payload as ApiBody<T>
    if (!response.ok || body.code !== 'OK') {
      throw new ApiError(
        response.status,
        body.message || `请求失败（${response.status}）`,
        body.code,
        payload,
      )
    }
    return body.data as T
  }

  if (!response.ok) {
    const message =
      record && typeof record.message === 'string' && record.message.trim()
        ? record.message
        : httpMessage(response.status)
    throw new ApiError(response.status, message, 'UNKNOWN', payload ?? undefined)
  }

  return payload as T
}
