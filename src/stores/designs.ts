import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockDesigns } from '../mocks/designs.ts'
import type { DesignPreviewConfig, DesignWork } from '../types/design.ts'
import { mockCurrentUser } from '../mocks/user.ts'

type SaveDesignInput = {
  title: string
  imageUrl: string
  prompt?: string
  style?: DesignWork['style']
  teeStyle?: DesignWork['teeStyle']
  preview?: DesignPreviewConfig
  productId?: string
}

type DesignsState = {
  works: DesignWork[]
  saveWork: (input: SaveDesignInput) => DesignWork
  updatePreview: (id: string, preview: DesignPreviewConfig) => void
  getMyWorks: () => DesignWork[]
  getWorkById: (id: string) => DesignWork | undefined
}

function createWorkId() {
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export const useDesignsStore = create<DesignsState>()(
  persist(
    (set, get) => ({
      works: mockDesigns,
      saveWork: (input) => {
        const work: DesignWork = {
          id: createWorkId(),
          title: input.title.trim() || '未命名设计',
          imageUrl: input.imageUrl,
          creatorId: mockCurrentUser.creatorId,
          creatorName: mockCurrentUser.creatorName,
          createdAt: new Date().toISOString().slice(0, 10),
          prompt: input.prompt,
          style: input.style,
          teeStyle: input.teeStyle,
          preview: input.preview,
          productId: input.productId,
          isMock: true,
        }
        set({ works: [work, ...get().works] })
        return work
      },
      updatePreview: (id, preview) => {
        set({
          works: get().works.map((item) =>
            item.id === id ? { ...item, preview } : item,
          ),
        })
      },
      getMyWorks: () =>
        get().works.filter((item) => item.creatorId === mockCurrentUser.creatorId),
      getWorkById: (id) => get().works.find((item) => item.id === id),
    }),
    {
      name: 'inktee-designs',
    },
  ),
)
