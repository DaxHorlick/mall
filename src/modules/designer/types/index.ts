export type GarmentSide = 'front' | 'back'

export type DesignRegionId = 'body' | 'sleeveLeft' | 'sleeveRight'

export type GarmentStyleId = 'tee' | 'hoodie' | 'tank'

export type LibraryImage = {
  id: string
  name: string
  url: string
}

export type LayerKind = 'image' | 'text'

export type DesignLayer = {
  id: string
  kind: LayerKind
  name: string
  imageUrl?: string
  text?: string
  textColor?: string
  side: GarmentSide
  region: DesignRegionId
  x: number
  y: number
  scale: number
  rotation: number
  visible: boolean
}

export type RegionBox = {
  x: number
  y: number
  w: number
  h: number
}

export const DESIGN_REGIONS: { id: DesignRegionId; label: string }[] = [
  { id: 'body', label: '衣身' },
  { id: 'sleeveLeft', label: '左袖' },
  { id: 'sleeveRight', label: '右袖' },
]

export const GARMENT_SIDES: { id: GarmentSide; label: string }[] = [
  { id: 'front', label: '正面' },
  { id: 'back', label: '背面' },
]

export const GARMENT_STYLES: { id: GarmentStyleId; label: string; regions: DesignRegionId[] }[] = [
  { id: 'tee', label: '短袖 T 恤', regions: ['body', 'sleeveLeft', 'sleeveRight'] },
  { id: 'hoodie', label: '连帽衫', regions: ['body', 'sleeveLeft', 'sleeveRight'] },
  { id: 'tank', label: '背心', regions: ['body'] },
]

export const GARMENT_COLORS: { value: string; label: string }[] = [
  { value: '#f7f4ee', label: '米白' },
  { value: '#111111', label: '黑色' },
  { value: '#4b5563', label: '深灰' },
  { value: '#1e3a5f', label: '藏青' },
  { value: '#d1d5db', label: '浅灰' },
  { value: '#e7e5e4', label: '米色' },
  { value: '#b91c1c', label: '红色' },
  { value: '#2563eb', label: '蓝色' },
  { value: '#0f766e', label: '青色' },
  { value: '#4d7c0f', label: '橄榄绿' },
  { value: '#f9a8d4', label: '粉色' },
  { value: '#eab308', label: '黄色' },
  { value: '#65a30d', label: '绿色' },
  { value: '#9f1239', label: '酒红' },
]

/** 每种款式的区域占画布的比例，添加图案时落在区域中心。 */
export const REGION_BOX: Record<GarmentStyleId, Record<DesignRegionId, RegionBox>> = {
  tee: {
    body: { x: 0.26, y: 0.38, w: 0.48, h: 0.52 },
    sleeveLeft: { x: 0.05, y: 0.24, w: 0.22, h: 0.18 },
    sleeveRight: { x: 0.73, y: 0.24, w: 0.22, h: 0.18 },
  },
  hoodie: {
    body: { x: 0.28, y: 0.4, w: 0.44, h: 0.5 },
    sleeveLeft: { x: 0.04, y: 0.3, w: 0.24, h: 0.24 },
    sleeveRight: { x: 0.72, y: 0.3, w: 0.24, h: 0.24 },
  },
  tank: {
    body: { x: 0.32, y: 0.34, w: 0.36, h: 0.54 },
    sleeveLeft: { x: 0.24, y: 0.28, w: 0.1, h: 0.12 },
    sleeveRight: { x: 0.66, y: 0.28, w: 0.1, h: 0.12 },
  },
}

export const BOARD_WIDTH = 800
export const BOARD_HEIGHT = 960
