import { create } from 'zustand'

export type Locale = 'zh' | 'en'

type LocaleState = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const key = 'dezajn.locale'

function readLocale(): Locale {
  try {
    const saved = localStorage.getItem(key)
    if (saved === 'zh' || saved === 'en') return saved
  } catch {
    // 浏览器禁用本地存储时，每次进入都按浏览器语言判断。
  }
  if (typeof navigator === 'undefined') return 'zh'
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

function applyLang(locale: Locale) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
}

const initial = readLocale()
applyLang(initial)

export const useLocale = create<LocaleState>((set) => ({
  locale: initial,
  setLocale: (locale) => {
    try {
      localStorage.setItem(key, locale)
    } catch {
      // 浏览器禁用本地存储时，这次切换只在当前页面有效。
    }
    applyLang(locale)
    set({ locale })
  },
}))
