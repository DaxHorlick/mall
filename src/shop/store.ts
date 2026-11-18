import { create } from 'zustand'
import { goodsCents, shippingCents } from './products.ts'

export type ShopLine = {
  slug: string
}

export type ShopOrder = {
  code: string
  lines: ShopLine[]
  totalCents: number
}

type ShopState = {
  lines: ShopLine[]
  votes: string[]
  order: ShopOrder | null
  studioSlug: string
  studioTitle: string
  addLine: (slug: string) => void
  removeLine: (slug: string) => void
  toggleVote: (slug: string) => void
  placeOrder: () => void
  setStudio: (slug: string, title: string) => void
  setStudioTitle: (title: string) => void
}

export const useShop = create<ShopState>((set) => ({
  lines: [],
  votes: [],
  order: null,
  studioSlug: 'a-little-outside-the-lines',
  studioTitle: 'A little outside the lines',
  addLine: (slug) =>
    set((state) => {
      if (state.lines.some((line) => line.slug === slug)) return state
      return { lines: [...state.lines, { slug }] }
    }),
  removeLine: (slug) =>
    set((state) => ({ lines: state.lines.filter((line) => line.slug !== slug) })),
  toggleVote: (slug) =>
    set((state) => ({
      votes: state.votes.includes(slug)
        ? state.votes.filter((item) => item !== slug)
        : [...state.votes, slug],
    })),
  placeOrder: () =>
    set((state) => {
      if (state.lines.length === 0) return state
      return {
        order: {
          code: 'DZ-1026',
          lines: state.lines,
          totalCents: goodsCents(state.lines.map((line) => line.slug)) + shippingCents,
        },
        lines: [],
      }
    }),
  setStudio: (slug, title) => set({ studioSlug: slug, studioTitle: title }),
  setStudioTitle: (title) => set({ studioTitle: title }),
}))
