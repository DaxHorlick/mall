import type { ApiBody } from '../types/auth.ts'

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, message: string, code = 'UNKNOWN') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) {
    throw new Error('缺少环境变量 VITE_API_BASE_URL')
  }

  const headers = new Headers(init?.headers)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  let body: ApiBody<T> | null = null
  try {
    body = (await response.json()) as ApiBody<T>
  } catch {
    body = null
  }

  if (!response.ok || !body || body.code !== 'OK') {
    throw new ApiError(
      response.status,
      body?.message || `请求失败（${response.status}）`,
      body?.code ?? 'UNKNOWN',
    )
  }

  return body.data as T
}
