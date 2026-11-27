import { request, toQueryString } from '../api/client.ts'

export type LibraryImage = {
  id: number
  source: 'upload' | 'ai'
  name: string
  url: string
  mime: string
  width: number
  height: number
  file_size: number
  created_at: string
}

export type ImagePage = {
  list: LibraryImage[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

/** 当前用户的图库。不传 source 时，上传的图和以后保存的生图都在里面。 */
export function fetchLibrary(query: { source?: 'upload' | 'ai'; page?: number; page_size?: number }) {
  return request<ImagePage>(`/v1/users/me/images${toQueryString(query)}`, { auth: true })
}

/** 上传一张图。字段名是 file，Content-Type 交给浏览器带上 boundary。 */
export function uploadLibraryImage(file: File) {
  const body = new FormData()
  body.append('file', file)
  return request<LibraryImage>('/v1/users/me/images', {
    method: 'POST',
    auth: true,
    body,
  })
}

/** 从当前用户的图库删掉一张。衣服上已经贴好的图层不在这里处理。 */
export function deleteLibraryImage(id: number) {
  return request<void>(`/v1/users/me/images/${id}`, {
    method: 'DELETE',
    auth: true,
  })
}
