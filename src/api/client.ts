import type { ApiBody } from '../types/auth.ts'

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly body?: unknown

  constructor(
    status: number,
    message: string,
    code = 'UNKNOWN',
    body?: unknown,
  ) {
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

export function isAccountDisabled(error: unknown) {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    error.message === '账号已停用'
  )
}

/** 创作者身份停用时保持买家登录态，不能清掉会话。 */
export function isCreatorDisabled(error: unknown) {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    error.message === '创作者身份已停用'
  )
}

type AuthFailureHandler = (error: ApiError) => void

let authFailureHandler: AuthFailureHandler | null = null
let lastFailureKey = ''
let lastFailureAt = 0

export function setAuthFailureHandler(handler: AuthFailureHandler | null) {
  authFailureHandler = handler
}

function notifyAuthFailure(path: string, error: ApiError) {
  const pathOnly = path.split('?')[0]
  const isAuthExchange =
    pathOnly.endsWith('/auth/login') ||
    pathOnly.endsWith('/auth/register') ||
    pathOnly.endsWith('/auth/logout') ||
    pathOnly.endsWith('/auth/me')

  const accountDisabled = isAccountDisabled(error)
  const sessionExpired = error.status === 401 && !isAuthExchange

  if (!accountDisabled && !sessionExpired) {
    return
  }

  const key = `${error.status}:${error.code}:${error.message}`
  const now = Date.now()
  if (key === lastFailureKey && now - lastFailureAt < 1500) {
    return
  }

  lastFailureKey = key
  lastFailureAt = now
  authFailureHandler?.(error)
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

function isApiBody(data: unknown): data is ApiBody<unknown> {
  return (
    !!data &&
    typeof data === 'object' &&
    'code' in data &&
    'message' in data &&
    'data' in data &&
    typeof (data as ApiBody<unknown>).code === 'string' &&
    typeof (data as ApiBody<unknown>).message === 'string'
  )
}

async function parseJson(response: Response): Promise<unknown | null> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

/**
 * 统一 fetch 封装。页面与业务代码应通过 `src/api/*` 调用，不要直接 fetch。
 * - 默认带 Cookie：`credentials: 'include'`（注册/登录会话依赖）
 * - 若响应为 `{ code, message, data }` 信封，则解包 `data` 并按 `code` 判成功
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
      credentials: 'include',
      headers,
    })
  } catch {
    throw new ApiError(0, '网络异常，请检查连接后重试')
  }

  if (response.status === 204) {
    if (!response.ok) {
      throw new ApiError(response.status, fallbackHttpMessage(response.status))
    }
    return undefined as T
  }

  const payload = await parseJson(response)

  if (isApiBody(payload)) {
    if (!response.ok || payload.code !== 'OK') {
      const error = new ApiError(
        response.status,
        payload.message || `请求失败（${response.status}）`,
        payload.code,
        payload,
      )
      notifyAuthFailure(path, error)
      throw error
    }
    return payload.data as T
  }

  if (!response.ok) {
    const message = messageFromPayload(payload) ?? fallbackHttpMessage(response.status)
    const error = new ApiError(response.status, message, 'UNKNOWN', payload ?? undefined)
    notifyAuthFailure(path, error)
    throw error
  }

  return payload as T
}

function messageFromPayload(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof (payload as { message: unknown }).message === 'string' &&
    (payload as { message: string }).message.trim()
  ) {
    return (payload as { message: string }).message
  }

  return null
}

function fallbackHttpMessage(status: number) {
  if (status === 500) {
    return '内部错误'
  }
  if (status === 503) {
    return '服务暂时不可用'
  }
  return '请求失败，请稍后重试'
}
