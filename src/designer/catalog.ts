import { request } from '../api/client.ts'

export type ClothingStyle = {
  id: number
  parent_id: number | null
  code: string
  name: string
  description: string
  cover_url: string
  sort_order: number
}

export type ClothingColor = {
  id: number
  code: string
  name: string
  hex_code: string
  sort_order: number
}

/** 已登录用户能做的衣服款式。 */
export function listClothingStyles() {
  return request<ClothingStyle[] | null>('/v1/clothing/styles', { auth: true })
}

/** 已登录用户能选的衣服颜色。 */
export function listClothingColors() {
  return request<ClothingColor[] | null>('/v1/clothing/colors', { auth: true })
}
