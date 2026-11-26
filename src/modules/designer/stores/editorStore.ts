import { create } from 'zustand'
import {
  GARMENT_STYLES,
  REGION_BOX,
  type DesignLayer,
  type DesignRegionId,
  type GarmentSide,
  type GarmentStyleId,
  type LayerKind,
  type LibraryImage,
} from '../types/index.ts'

const libraryKey = 'dezajn.design-library'

type Snapshot = {
  layers: DesignLayer[]
  garmentColor: string
  garmentStyle: GarmentStyleId
}

type EditorState = {
  garmentColor: string
  garmentStyle: GarmentStyleId
  library: LibraryImage[]
  side: GarmentSide
  activeRegion: DesignRegionId
  layers: DesignLayer[]
  selectedLayerId: string | null
  past: Snapshot[]
  future: Snapshot[]
  notice: string | null
  setNotice: (message: string | null) => void
  setSide: (side: GarmentSide) => void
  setActiveRegion: (region: DesignRegionId) => void
  setGarmentColor: (color: string) => void
  setGarmentStyle: (style: GarmentStyleId) => void
  addToLibrary: (image: LibraryImage) => void
  removeFromLibrary: (id: string) => void
  addLayer: (input: {
    kind: LayerKind
    name: string
    imageUrl?: string
    text?: string
    textColor?: string
    region?: DesignRegionId
  }) => void
  selectLayer: (id: string | null) => void
  updateLayer: (id: string, patch: Partial<DesignLayer>, record?: boolean) => void
  moveLayer: (id: string, direction: -1 | 1) => void
  removeLayer: (id: string) => void
  remember: () => void
  undo: () => void
  redo: () => void
  applyDesign: (saved: { layers: DesignLayer[]; garmentColor: string; garmentStyle: GarmentStyleId }) => void
}

function snapshot(state: { layers: DesignLayer[]; garmentColor: string; garmentStyle: GarmentStyleId }): Snapshot {
  return { layers: state.layers, garmentColor: state.garmentColor, garmentStyle: state.garmentStyle }
}

export const useEditorStore = create<EditorState>((set, get) => ({
  garmentColor: '#f7f4ee',
  garmentStyle: 'tee',
  library: (() => {
    try {
      const raw = localStorage.getItem(libraryKey)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      if (!Array.isArray(parsed)) return []
      return parsed
        .filter((item): item is LibraryImage => {
          if (!item || typeof item !== 'object') return false
          const image = item as LibraryImage
          return typeof image.id === 'string' && typeof image.name === 'string' && typeof image.url === 'string' && image.url.startsWith('data:image/')
        })
        .slice(0, 24)
    } catch {
      return []
    }
  })(),
  side: 'front',
  activeRegion: 'body',
  layers: [],
  selectedLayerId: null,
  past: [],
  future: [],
  notice: null,

  /** 文件类型不对一类的短提示。 */
  setNotice: (message) => set({ notice: message }),

  /** 切换正面或背面，选中项不在这一面时取消选中。 */
  setSide: (side) => {
    const selected = get().layers.find((layer) => layer.id === get().selectedLayerId)

    set({
      side,
      selectedLayerId: selected?.side === side ? selected.id : null,
    })
  },

  /** 切换当前要添加图案的衣服区域。 */
  setActiveRegion: (region) => set({ activeRegion: region }),

  /** 换衣服颜色，并记入撤销。 */
  setGarmentColor: (color) => {
    const state = get()

    set({
      past: [...state.past, snapshot(state)].slice(-40),
      future: [],
      garmentColor: color,
    })
  },

  /** 换款式，并记入撤销。背心没有袖子，区域回到衣身。 */
  setGarmentStyle: (style) => {
    const state = get()
    const allowed = GARMENT_STYLES.find((item) => item.id === style)?.regions ?? ['body']

    set({
      past: [...state.past, snapshot(state)].slice(-40),
      future: [],
      garmentStyle: style,
      activeRegion: allowed.includes(state.activeRegion) ? state.activeRegion : 'body',
    })
  },

  /** 图片写入这台浏览器的图库，最多留 24 张。 */
  addToLibrary: (image) => {
    const library = [image, ...get().library.filter((item) => item.id !== image.id)].slice(0, 24)
    try {
      localStorage.setItem(libraryKey, JSON.stringify(library))
      set({ library, notice: null })
    } catch {
      set({ notice: '图库空间不够，请先删掉几张图片。' })
    }
  },

  /** 从图库移除，已经贴到衣服上的图案还在。 */
  removeFromLibrary: (id) => {
    const library = get().library.filter((item) => item.id !== id)
    try {
      localStorage.setItem(libraryKey, JSON.stringify(library))
    } catch {
      // 删掉后写不回去时，页面上先去掉这一张。
    }
    set({ library })
  },

  /** 新图案或文字落在当前款式的区域中心。 */
  addLayer: ({ kind, name, imageUrl, text, textColor, region }) => {
    const state = get()
    const placed = region ?? state.activeRegion
    const box = REGION_BOX[state.garmentStyle][placed] ?? REGION_BOX[state.garmentStyle].body
    const id = crypto.randomUUID()
    const layer: DesignLayer = {
      id,
      kind,
      name,
      imageUrl,
      text,
      textColor: textColor ?? '#1c1e21',
      side: state.side,
      region: placed,
      x: box.x + box.w / 2,
      y: box.y + box.h / 2,
      scale: kind === 'text' ? 1 : 0.92,
      rotation: 0,
      visible: true,
    }

    set({
      past: [...state.past, snapshot(state)].slice(-40),
      future: [],
      layers: [...state.layers, layer],
      selectedLayerId: id,
      notice: null,
    })
  },

  /** 选中图层时，区域切到它所在的那一块。 */
  selectLayer: (id) => {
    const layer = get().layers.find((item) => item.id === id)

    set({
      selectedLayerId: id,
      activeRegion: layer?.region ?? get().activeRegion,
    })
  },

  /** 改位置、文字、显隐或所属区域。拖动过程中不重复记入撤销。 */
  updateLayer: (id, patch, record) => {
    const state = get()
    const layers = state.layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer))

    if (!record) {
      set({ layers })
      return
    }

    set({
      past: [...state.past, snapshot(state)].slice(-40),
      future: [],
      layers,
    })
  },

  /** 在当前这一面里调整绘制顺序，列表后面的盖在上面。 */
  moveLayer: (id, direction) => {
    const state = get()
    const layers = [...state.layers]
    const index = layers.findIndex((layer) => layer.id === id)
    const current = layers[index]
    if (!current) return
    const sameSide = layers.filter((layer) => layer.side === current.side)
    const position = sameSide.findIndex((layer) => layer.id === id)
    const neighbor = sameSide[position + direction]
    if (!neighbor) return
    const neighborIndex = layers.findIndex((layer) => layer.id === neighbor.id)
    layers[index] = neighbor
    layers[neighborIndex] = current

    set({
      past: [...state.past, snapshot(state)].slice(-40),
      future: [],
      layers,
    })
  },

  /** 删除图案。对象地址先留着，撤销后还能画出来。 */
  removeLayer: (id) => {
    const state = get()
    const removed = state.layers.find((layer) => layer.id === id)
    const layers = state.layers.filter((layer) => layer.id !== id)
    const fallback = layers.filter((layer) => layer.side === removed?.side).at(-1)?.id ?? null

    set({
      past: [...state.past, snapshot(state)].slice(-40),
      future: [],
      layers,
      selectedLayerId: state.selectedLayerId === id ? fallback : state.selectedLayerId,
    })
  },

  /** 拖动或输入开始前记一笔，过程中的更新不再入栈。 */
  remember: () => {
    const state = get()

    set({
      past: [...state.past, snapshot(state)].slice(-40),
      future: [],
    })
  },

  /** 回到上一笔衣服颜色和图层。 */
  undo: () => {
    const state = get()
    const prev = state.past.at(-1)
    if (!prev) return
    const selected = prev.layers.some((layer) => layer.id === state.selectedLayerId) ? state.selectedLayerId : null

    set({
      past: state.past.slice(0, -1),
      future: [...state.future, snapshot(state)],
      layers: prev.layers,
      garmentColor: prev.garmentColor,
      garmentStyle: prev.garmentStyle,
      selectedLayerId: selected,
    })
  },

  /** 打开一份已保存的设计，清掉撤销记录。 */
  applyDesign: (saved) => {
    const allowed = GARMENT_STYLES.find((item) => item.id === saved.garmentStyle)?.regions ?? ['body']

    set({
      layers: saved.layers,
      garmentColor: saved.garmentColor,
      garmentStyle: saved.garmentStyle,
      activeRegion: allowed[0] ?? 'body',
      side: 'front',
      selectedLayerId: null,
      past: [],
      future: [],
      notice: null,
    })
  },

  /** 重做刚撤销的一笔。 */
  redo: () => {
    const state = get()
    const next = state.future.at(-1)
    if (!next) return
    const selected = next.layers.some((layer) => layer.id === state.selectedLayerId) ? state.selectedLayerId : null

    set({
      future: state.future.slice(0, -1),
      past: [...state.past, snapshot(state)].slice(-40),
      layers: next.layers,
      garmentColor: next.garmentColor,
      garmentStyle: next.garmentStyle,
      selectedLayerId: selected,
    })
  },
}))
