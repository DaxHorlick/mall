import { useSession } from '../auth/session.ts'
import { copy } from '../i18n/index.ts'

type ApiBody<T> = {
  code: number | string
  message: string
  data: T | null
}

type RequestOptions = RequestInit & { auth?: boolean; skipRefresh?: boolean }

type RefreshResult = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
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

export function getErrorMessage(error: unknown, fallback = copy().errors.retry) {
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
  const errors = copy().errors
  if (status === 500) return errors.internal
  if (status === 503) return errors.unavailable
  return errors.retry
}

/** 发送 JSON 请求。`auth: true` 时附带访问令牌。响应若是 `{ code, message, data }`，返回其中的 data。 */
export async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  if (!baseUrl) {
    throw new Error(copy().errors.missingEnv)
  }

  const authed = Boolean(init?.auth)
  const skipRefresh = Boolean(init?.skipRefresh)
  const headers = new Headers(init?.headers)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  if (authed) {
    const token = useSession.getState().accessToken
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData
  if (init?.body !== undefined && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const fetchInit: RequestOptions = {
    ...init,
    headers,
  }
  delete fetchInit.auth
  delete fetchInit.skipRefresh

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, fetchInit)
  } catch {
    throw new ApiError(0, copy().errors.network)
  }

  if (response.status === 204) {
    if (!response.ok) {
      throw new ApiError(response.status, httpMessage(response.status))
    }
    return undefined as T
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  const record =
    payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
  const isEnvelope =
    !!record &&
    (typeof record.code === 'number' || typeof record.code === 'string') &&
    typeof record.message === 'string' &&
    'data' in record

  if (isEnvelope) {
    const body = payload as ApiBody<T>
    const success = body.code === 0 || body.code === 'OK'
    if (!response.ok || !success) {
      const unauthorized =
        response.status === 401 || body.code === 401 || body.code === 40100 || body.code === '40100'
      if (authed && unauthorized && !skipRefresh) {
        const refreshToken = useSession.getState().refreshToken
        if (refreshToken) {
          try {
            const refreshed = await request<RefreshResult>('/v1/auth/refresh', {
              method: 'POST',
              skipRefresh: true,
              body: JSON.stringify({ refresh_token: refreshToken }),
            })
            useSession.getState().setTokens(
              refreshed.access_token,
              refreshed.refresh_token,
              refreshed.expires_in,
            )
          } catch (error) {
            useSession.getState().signOut(null)
            throw error
          }
          return request<T>(path, { ...init, skipRefresh: true })
        }
      }
      if (authed && unauthorized) {
        useSession.getState().signOut(null)
      }
      throw new ApiError(
        response.status,
        body.message || copy().errors.failedStatus(response.status),
        String(body.code),
        payload,
      )
    }
    return body.data as T
  }

  if (
    response.ok &&
    record &&
    (record.code === 0 || record.code === '0' || record.code === 'OK') &&
    typeof record.message === 'string'
  ) {
    return undefined as T
  }

  if (!response.ok) {
    const message =
      record && typeof record.message === 'string' && record.message.trim()
        ? record.message
        : httpMessage(response.status)
    if (authed && response.status === 401) {
      useSession.getState().signOut(null)
    }
    throw new ApiError(response.status, message, 'UNKNOWN', payload ?? undefined)
  }

  return payload as T
}
