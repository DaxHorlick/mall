export type DesignTaskStatus =
  | 'idle'
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'

export type DesignStyle =
  | 'minimal'
  | 'street'
  | 'retro'
  | 'illustration'

export type TeeStyle = 'regular' | 'oversized'

export type DesignPreviewConfig = {
  /** 图案水平偏移，百分比，50 为居中 */
  offsetX: number
  /** 图案垂直偏移，百分比 */
  offsetY: number
  /** 图案相对宽度，百分比 */
  scale: number
  teeColor: string
}

export type DesignTask = {
  taskId: string
  status: DesignTaskStatus
  prompt: string
  style: DesignStyle
  teeStyle: TeeStyle
  teeColor: string
  referenceImageName?: string
  resultImageUrl?: string
  errorMessage?: string
  /** 标明为本地模拟结果，非真实大模型输出 */
  isMock: true
  createdAt: string
}

export type DesignWork = {
  id: string
  title: string
  imageUrl: string
  creatorId: string
  creatorName: string
  createdAt: string
  /** 可购买的关联商品，可选 */
  productId?: string
  prompt?: string
  style?: DesignStyle
  teeStyle?: TeeStyle
  preview?: DesignPreviewConfig
  isMock?: boolean
}

export const DESIGN_STYLE_OPTIONS: { value: DesignStyle; label: string }[] = [
  { value: 'minimal', label: '极简' },
  { value: 'street', label: '街头' },
  { value: 'retro', label: '复古' },
  { value: 'illustration', label: '插画' },
]

export const TEE_STYLE_OPTIONS: { value: TeeStyle; label: string }[] = [
  { value: 'regular', label: '常规版型' },
  { value: 'oversized', label: 'Oversize' },
]

export const DEFAULT_PREVIEW_CONFIG: DesignPreviewConfig = {
  offsetX: 50,
  offsetY: 42,
  scale: 36,
  teeColor: '#171717',
}
