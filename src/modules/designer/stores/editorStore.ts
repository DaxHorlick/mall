import { create } from 'zustand'
import {
  DEFAULT_MODEL_NAME,
  DEFAULT_MODEL_URL,
  type DesignLayer,
  type DesignRegionId,
  type FrameInfo,
  type ModelReport,
  type UvRect,
  type ViewId,
} from '../types'
import { dropImage } from '../utils/loadImage'

type EditorState = {
  modelUrl: string
  modelName: string
  report: ModelReport | null
  frame: FrameInfo | null
  overrides: Partial<Record<DesignRegionId, UvRect>>
  layers: DesignLayer[]
  selectedLayerId: string | null
  activeRegion: DesignRegionId
  autoRotate: boolean
  isolateGarment: boolean
  showRegions: boolean
  uvTemplateUrl: string | null
  view: { id: ViewId; nonce: number }
  printMessage: string
  notice: string | null
  modelError: string | null
  setInspection: (report: ModelReport, frame: FrameInfo) => void
  setModelError: (message: string | null) => void
  setNotice: (message: string | null) => void
  setPrintMessage: (message: string) => void
  setModelFile: (file: File) => void
  setGarment: (url: string, name: string) => void
  resetDefaultModel: () => void
  setActiveRegion: (region: DesignRegionId) => void
  addLayer: (input: { name: string; imageUrl: string; region?: DesignRegionId }) => void
  selectLayer: (id: string | null) => void
  updateLayer: (id: string, patch: Partial<DesignLayer>) => void
  moveLayer: (id: string, direction: -1 | 1) => void
  removeLayer: (id: string) => void
  clearRegionLayers: (region: DesignRegionId) => void
  setOverride: (region: DesignRegionId, rect: UvRect) => void
  clearOverride: (region: DesignRegionId) => void
  setAutoRotate: (value: boolean) => void
  setIsolateGarment: (value: boolean) => void
  setShowRegions: (value: boolean) => void
  setUvTemplate: (file: File | null) => void
  requestView: (id: ViewId) => void
}

/** 释放图案的 blob 地址和图片缓存，换模型或清空图层时调用。 */
function releaseLayers(layers: DesignLayer[]) {
  for (const layer of layers) {
    if (layer.imageUrl.startsWith('blob:')) URL.revokeObjectURL(layer.imageUrl)
    dropImage(layer.imageUrl)
  }
}

export const useEditorStore = create<EditorState>((set, get) => ({
  modelUrl: DEFAULT_MODEL_URL,
  modelName: DEFAULT_MODEL_NAME,
  report: null,
  frame: null,
  overrides: {},
  layers: [],
  selectedLayerId: null,
  activeRegion: 'front',
  autoRotate: false,
  isolateGarment: false,
  showRegions: false,
  uvTemplateUrl: null,
  view: { id: 'reset', nonce: 0 },
  printMessage: '正在读取模型…',
  notice: null,
  modelError: null,

  /** 写入检查结果，并清掉上一次的加载错误。 */
  setInspection: (report, frame) => set({ report, frame, modelError: null }),
  /** 记录加载失败；有文案时用它替换打印状态。 */
  setModelError: (message) => set({ modelError: message, printMessage: message ?? get().printMessage }),
  /** 文件类型不对一类的短提示。 */
  setNotice: (message) => set({ notice: message }),
  /** 贴图状态文案。内容没变就不更新，避免重绘触发无意义渲染。 */
  setPrintMessage: (message) => {
    if (get().printMessage !== message) set({ printMessage: message })
  },

  /** 换成用户上传的 GLB，并清掉上一件衣服的图案和手动 UV。 */
  setModelFile: (file) => {
    const previous = get().modelUrl
    if (previous.startsWith('blob:')) URL.revokeObjectURL(previous)
    releaseLayers(get().layers)
    set({
      modelUrl: URL.createObjectURL(file),
      modelName: file.name,
      report: null,
      frame: null,
      overrides: {},
      layers: [],
      selectedLayerId: null,
      printMessage: '正在读取模型…',
      modelError: null,
      notice: null,
      view: { id: 'reset', nonce: get().view.nonce + 1 },
    })
  },

  /** 换成选中款式的模型，图案留在衣服上。 */
  setGarment: (url, name) => {
    if (get().modelUrl === url && get().modelName === name) return
    const previous = get().modelUrl
    if (previous.startsWith('blob:')) URL.revokeObjectURL(previous)
    set({
      modelUrl: url,
      modelName: name,
      report: null,
      frame: null,
      overrides: {},
      printMessage: '正在读取模型…',
      modelError: null,
      notice: null,
      view: { id: 'reset', nonce: get().view.nonce + 1 },
    })
  },

  /** 回到内置模型，同样清掉上传文件和图案。 */
  resetDefaultModel: () => {
    const previous = get().modelUrl
    if (previous.startsWith('blob:')) URL.revokeObjectURL(previous)
    releaseLayers(get().layers)
    set({
      modelUrl: DEFAULT_MODEL_URL,
      modelName: DEFAULT_MODEL_NAME,
      report: null,
      frame: null,
      overrides: {},
      layers: [],
      selectedLayerId: null,
      printMessage: '正在读取模型…',
      modelError: null,
      notice: null,
      view: { id: 'reset', nonce: get().view.nonce + 1 },
    })
  },

  /** 切换当前正在编辑的印刷面。 */
  setActiveRegion: (region) => set({ activeRegion: region }),

  /** 新图案落在当前区域正中，默认缩放 0.92。 */
  addLayer: ({ name, imageUrl, region }) => {
    const id = crypto.randomUUID()
    const layer: DesignLayer = {
      id,
      name,
      imageUrl,
      region: region ?? get().activeRegion,
      x: 0.5,
      y: 0.5,
      scale: 0.92,
      rotation: 0,
      visible: true,
    }
    set({ layers: [...get().layers, layer], selectedLayerId: id, notice: null })
  },

  /** 选中图层时，把设计区域切到它所在的那一面。 */
  selectLayer: (id) => {
    const layer = get().layers.find((item) => item.id === id)
    set({
      selectedLayerId: id,
      activeRegion: layer?.region ?? get().activeRegion,
    })
  },

  /** 改位置、缩放、旋转、显隐或所属区域。 */
  updateLayer: (id, patch) =>
    set({
      layers: get().layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)),
    }),

  /** 调整绘制顺序，列表后面的图层盖在上面。 */
  moveLayer: (id, direction) => {
    const layers = [...get().layers]
    const index = layers.findIndex((layer) => layer.id === id)
    const next = index + direction
    if (index < 0 || next < 0 || next >= layers.length) return
    const [item] = layers.splice(index, 1)
    layers.splice(next, 0, item)
    set({ layers })
  },

  /** 删除图案，并释放它的图片地址。 */
  removeLayer: (id) => {
    const layer = get().layers.find((item) => item.id === id)
    if (layer?.imageUrl.startsWith('blob:')) URL.revokeObjectURL(layer.imageUrl)
    if (layer) dropImage(layer.imageUrl)
    const layers = get().layers.filter((item) => item.id !== id)
    set({
      layers,
      selectedLayerId: get().selectedLayerId === id ? (layers.at(-1)?.id ?? null) : get().selectedLayerId,
    })
  },

  /** 清掉某一面的全部图案。 */
  clearRegionLayers: (region) => {
    const removed = get().layers.filter((layer) => layer.region === region)
    for (const layer of removed) {
      if (layer.imageUrl.startsWith('blob:')) URL.revokeObjectURL(layer.imageUrl)
      dropImage(layer.imageUrl)
    }
    const layers = get().layers.filter((layer) => layer.region !== region)
    const selected = layers.some((layer) => layer.id === get().selectedLayerId)
      ? get().selectedLayerId
      : (layers.at(-1)?.id ?? null)
    set({ layers, selectedLayerId: selected })
  },

  /** 用手填的 UV 矩形盖过自动检测。 */
  setOverride: (region, rect) => set({ overrides: { ...get().overrides, [region]: rect } }),
  /** 丢掉手动范围，这一面回到自动检测。 */
  clearOverride: (region) => {
    const overrides = { ...get().overrides }
    delete overrides[region]
    set({ overrides })
  },

  /** 开关绕模型自动旋转。 */
  setAutoRotate: (value) => set({ autoRotate: value }),
  /** 开关只显示主服装轮廓内的三角面。 */
  setIsolateGarment: (value) => set({ isolateGarment: value }),
  /** 开关在衣服上用色块标出设计范围。 */
  setShowRegions: (value) => set({ showRegions: value }),
  /** 换 UV 预览上叠加的模板图，旧的 blob 先释放。 */
  setUvTemplate: (file) => {
    const previous = get().uvTemplateUrl
    if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous)
    set({ uvTemplateUrl: file ? URL.createObjectURL(file) : null })
  },
  /** 切视角。nonce 递增，重复点同一个按钮也会再摆一次相机。 */
  requestView: (id) => set({ view: { id, nonce: get().view.nonce + 1 } }),
}))

/** 手动范围够大就当成可印刷，太小则标成不可用并暂停自动检测。 */
function applyOverrides(
  parts: ModelReport['parts'],
  overrides: Partial<Record<DesignRegionId, UvRect>>,
) {
  return parts.map((part) => {
    const rect = overrides[part.id]
    if (!rect) return part
    const usable = rect.w > 0.005 && rect.h > 0.005
    return {
      ...part,
      uvRect: usable ? rect : null,
      status: usable ? 'ready' as const : 'unavailable' as const,
      reason: '这是手动指定的 UV 范围，自动检测已暂停。',
    }
  })
}

export { applyOverrides }
