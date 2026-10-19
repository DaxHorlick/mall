import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  buildCartItemId,
  type AddCartItemInput,
  type CartItem,
} from '../types/cart.ts'

type CartState = {
  items: CartItem[]
  selectedIds: string[]
  addItem: (input: AddCartItemInput) => string
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  toggleSelect: (id: string) => void
  toggleSelectAll: () => void
  selectOnly: (ids: string[]) => void
  clearSelected: () => void
  removeSelected: () => void
  clear: () => void
  getSelectedItems: () => CartItem[]
  getTotalQuantity: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedIds: [],
      addItem: (input) => {
        const id = buildCartItemId(input.productId, input.colorKey, input.size)
        const existing = get().items.find((item) => item.id === id)
        const nextQuantity = Math.min(
          input.maxQuantity,
          (existing?.quantity ?? 0) + input.quantity,
        )

        if (nextQuantity < 1) {
          return id
        }

        const nextItem: CartItem = {
          id,
          productId: input.productId,
          name: input.name,
          price: input.price,
          imageUrl: input.imageUrl,
          colorKey: input.colorKey,
          colorLabel: input.colorLabel,
          colorHex: input.colorHex,
          size: input.size,
          quantity: nextQuantity,
        }

        set({
          items: existing
            ? get().items.map((item) => (item.id === id ? nextItem : item))
            : [...get().items, nextItem],
          selectedIds: get().selectedIds.includes(id)
            ? get().selectedIds
            : [...get().selectedIds, id],
        })

        return id
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          set({
            items: get().items.filter((item) => item.id !== id),
            selectedIds: get().selectedIds.filter((itemId) => itemId !== id),
          })
          return
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        })
      },
      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
          selectedIds: get().selectedIds.filter((itemId) => itemId !== id),
        })
      },
      toggleSelect: (id) => {
        const selected = get().selectedIds
        set({
          selectedIds: selected.includes(id)
            ? selected.filter((itemId) => itemId !== id)
            : [...selected, id],
        })
      },
      toggleSelectAll: () => {
        const { items, selectedIds } = get()
        const allSelected =
          items.length > 0 && items.every((item) => selectedIds.includes(item.id))
        set({
          selectedIds: allSelected ? [] : items.map((item) => item.id),
        })
      },
      selectOnly: (ids) => set({ selectedIds: ids }),
      clearSelected: () => set({ selectedIds: [] }),
      removeSelected: () => {
        const selected = new Set(get().selectedIds)
        set({
          items: get().items.filter((item) => !selected.has(item.id)),
          selectedIds: [],
        })
      },
      clear: () => set({ items: [], selectedIds: [] }),
      getSelectedItems: () => {
        const selected = new Set(get().selectedIds)
        return get().items.filter((item) => selected.has(item.id))
      },
      getTotalQuantity: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'inktee-cart',
    },
  ),
)
