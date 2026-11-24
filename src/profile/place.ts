import pinyin from 'tiny-pinyin'
import areasJson from 'china-area-data/data.json'

export type AreaMap = Record<string, Record<string, string>>

export const chinaName = '中国'

export const areas: AreaMap = areasJson

export function placeOptions(places: { name: string }[], current: string) {
  const labels = places.map((place) => place.name)
  if (current && !labels.includes(current)) labels.unshift(current)
  return labels.map((label) => ({ label }))
}

export function childPlaces(map: AreaMap, parentCode: string) {
  const group = map[parentCode]
  if (!group) return []
  return Object.entries(group).map(([code, name]) => ({ code, name }))
}

export function matchesPlace(label: string, extra: string, query: string) {
  const text = query.trim().toLowerCase()
  if (!text) return true
  if (label.toLowerCase().includes(text) || extra.toLowerCase().includes(text)) return true
  if (!pinyin.isSupported()) return false
  const full = pinyin.convertToPinyin(label, '', true)
  const initials = pinyin
    .convertToPinyin(label, ' ', true)
    .split(' ')
    .map((part) => part.slice(0, 1))
    .join('')
  return full.includes(text) || initials.includes(text)
}
