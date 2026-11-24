import { useLocale } from './locale.ts'
import { en } from './en.ts'
import { zh, type Messages } from './zh.ts'

export type { CatalogSlug, Messages } from './zh.ts'
export type { Locale } from './locale.ts'
export { useLocale } from './locale.ts'

export function copy(): Messages {
  return useLocale.getState().locale === 'zh' ? zh : en
}

export function useCopy(): Messages {
  const locale = useLocale((state) => state.locale)
  return locale === 'zh' ? zh : en
}

export function shownDesignTitle(slug: string, stored: string) {
  if (!(slug in zh.catalog)) return stored
  const key = slug as keyof typeof zh.catalog
  const zhName = zh.catalog[key].name
  const enName = en.catalog[key].name
  if (stored !== zhName && stored !== enName) return stored
  return useLocale.getState().locale === 'zh' ? zhName : enName
}
