export type DesignRegionId = 'front' | 'back' | 'sleeveLeft' | 'sleeveRight'

export type ViewId = 'front' | 'back' | 'left' | 'right' | 'reset'

export type UvRect = {
  u: number
  v: number
  w: number
  h: number
}

export type PartStatus = 'ready' | 'unavailable'

export type PartMapping = {
  id: DesignRegionId
  label: string
  meshId: string | null
  meshName: string | null
  uvRect: UvRect | null
  status: PartStatus
  reason: string
  triangleCount: number
}

export type MeshInfo = {
  id: string
  name: string
  materialName: string
  vertexCount: number
  triangleCount: number
  attributes: string[]
  hasUv: boolean
  uvBounds: { uMin: number; vMin: number; uMax: number; vMax: number } | null
  doubleSided: boolean
  hasBaseMap: boolean
}

export type ModelReport = {
  fileName: string
  meshes: MeshInfo[]
  parts: PartMapping[]
  summary: string[]
  hasUv: boolean
  canIsolate: boolean
  isolateNote: string
  shownTriangles: number
  totalTriangles: number
}

export type DesignLayer = {
  id: string
  name: string
  imageUrl: string
  region: DesignRegionId
  x: number
  y: number
  scale: number
  rotation: number
  visible: boolean
}

export type FrameInfo = {
  distance: number
  floorY: number
  pose: 'flat' | 'stand'
  facingAxis: 0 | 1 | 2
  facingSign: 1 | -1
}

export const DESIGN_REGIONS: { id: DesignRegionId; label: string }[] = [
  { id: 'front', label: '正面' },
  { id: 'back', label: '背面' },
  { id: 'sleeveLeft', label: '左袖' },
  { id: 'sleeveRight', label: '右袖' },
]

export const CAMERA_FOV = 32

export const DEFAULT_MODEL_URL = '/models/T-shirt.glb'
export const DEFAULT_MODEL_NAME = 'T-shirt.glb'
