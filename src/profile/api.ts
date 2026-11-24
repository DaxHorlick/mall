import { request, toQueryString } from '../api/client.ts'
import { copy } from '../i18n/index.ts'

export type Profile = {
  user_id: number | string
  username: string
  user_no?: string
  email?: string
  phone?: string
  status?: number
  nickname: string
  avatar?: string
  cover_image?: string
  bio?: string
  gender?: number
  birthday?: string
  location?: string
  following_count: number
  followers_count: number
  post_count: number
}

export type PublicProfile = {
  user_id: number | string
  username: string
  user_no?: string
  nickname: string
  avatar?: string
  cover_image?: string
  bio?: string
  gender?: number
  location?: string
  following_count: number
  followers_count: number
  post_count: number
  is_following: boolean
}

export type UserCard = {
  user_id: number | string
  username: string
  user_no?: string
  nickname: string
  avatar?: string
  bio?: string
  is_following: boolean
}

export type UserList = {
  list: UserCard[] | null
  total: number
  page: number
  page_size: number
  total_pages: number
}

export type ProfilePatch = {
  nickname?: string
  avatar?: string
  cover_image?: string
  bio?: string
  gender?: number
  birthday?: string
  location?: string
}

export function fetchMyProfile() {
  return request<Profile>('/v1/users/me', { auth: true })
}

export function saveMyProfile(body: ProfilePatch) {
  return request<Profile>('/v1/users/me/profile', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(body),
  })
}

export function fetchPublicProfile(userId: string) {
  return request<PublicProfile>(`/v1/users/${userId}`, { auth: true })
}

export function changeFollow(userId: string, follow: boolean) {
  return request<{ is_following: boolean }>(`/v1/users/${userId}/follow`, {
    method: follow ? 'POST' : 'DELETE',
    auth: true,
  })
}

export function fetchPeople(path: string, page: number) {
  return request<UserList>(`${path}${toQueryString({ page, page_size: 20 })}`, { auth: true })
}

export function genderLabel(gender?: number) {
  const label = copy().gender
  if (gender === 1) return label.male
  if (gender === 2) return label.female
  if (gender === 3) return label.other
  if (gender === 0) return label.unknown
  return ''
}

export function statusLabel(status?: number) {
  const label = copy().status
  if (status === 0) return label.disabled
  if (status === 1) return label.active
  if (status === 2) return label.frozen
  return ''
}

export function sameUser(left?: number | string | null, right?: number | string | null) {
  if (left === undefined || left === null || right === undefined || right === null) return false
  return String(left) === String(right)
}
