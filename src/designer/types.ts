export type GarmentSide = 'front' | 'back'

export type DesignRegionId = 'body' | 'sleeveLeft' | 'sleeveRight'

export type GarmentStyleId = string

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

/** 接口款式里，只有背心没有袖子。 */
export function styleRegions(code: string): DesignRegionId[] {
  if (code === 'tank') return ['body']
  return ['body', 'sleeveLeft', 'sleeveRight']
}

type Silhouette = 'tee' | 'hoodie' | 'tank'

/** 每种平面轮廓的区域占画布的比例，添加图案时落在区域中心。 */
export const REGION_BOX: Record<Silhouette, Record<DesignRegionId, RegionBox>> = {
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

/** T 恤和圆领卫衣用圆领轮廓，卫衣用连帽轮廓。 */
export function styleBox(code: string, region: DesignRegionId) {
  const key: Silhouette = code === 'hoodie' ? 'hoodie' : code === 'tank' ? 'tank' : 'tee'
  return REGION_BOX[key][region] ?? REGION_BOX[key].body
}

export const BOARD_WIDTH = 800
export const BOARD_HEIGHT = 960
