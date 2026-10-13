import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type FavoritesState = {
  ids: string[]
  toggle: (productId: string) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const current = get().ids
        const next = current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId]
        set({ ids: next })
      },
    }),
    {
      name: 'inktee-favorites',
    },
  ),
)
