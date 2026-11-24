import { ApiError, request } from '../api/client.ts'
import { copy } from '../i18n/index.ts'

export type Address = {
  address_id: number | string
  receiver_name: string
  phone: string
  country: string
  province: string
  city: string
  district: string
  detail_address: string
  postal_code: string
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export function addressRequest<T>(path: string, init: RequestInit): Promise<T> {
  const options = { ...init, auth: true as const }
  return request<T>(path, options).catch((err: unknown) => {
    if (!(err instanceof ApiError) || (err.status !== 409 && err.code !== '40900')) throw err
    return request<T>(path, options).catch((again: unknown) => {
      if (again instanceof ApiError && (again.status === 409 || again.code === '40900')) {
        throw new ApiError(again.status, copy().errors.addressConflict, again.code, again.body)
      }
      throw again
    })
  })
}

export function missingAddress(error: unknown) {
  return error instanceof ApiError && (error.status === 404 || error.code === '40400')
}
