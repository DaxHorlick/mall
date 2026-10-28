export type DesignOrigin = 'ai' | 'upload'

export type DesignVisibility = 'private' | 'public'

export type DesignReviewStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export type GenerationStatus = 'pending' | 'running' | 'succeeded' | 'failed'

/** 成品图或原图。原图的宽高在响应里固定为 null。 */
export type DesignImage = {
  object_key: string
  url: string
  content_type: string
  bytes: number
  width: number | null
  height: number | null
}

/** 提交给设计接口的图片引用。宽高可以省略。 */
export type DesignImageInput = {
  object_key: string
  url: string
  content_type: string
  bytes: number
  width?: number
  height?: number
}

export type PreviewImage = {
  object_key: string
  url: string
}

/** 自己的设计。响应当中有 allow_sale。 */
export type OwnedDesign = {
  id: number
  owner_user_id: number
  title: string
  origin: DesignOrigin
  prompt: string | null
  visibility: DesignVisibility
  review_status: DesignReviewStatus
  allow_sale: 0 | 1
  reject_reason: string
  original: DesignImage | null
  result: DesignImage | null
  preview: PreviewImage | null
  created_at: string
  updated_at: string
}

/** 公开设计。没有提示词、原图、拒绝原因、出售许可和更新时间。 */
export type PublicDesign = {
  id: number
  owner_user_id: number
  title: string
  origin: DesignOrigin
  visibility: 'public'
  review_status: 'approved'
  result: DesignImage | null
  preview: PreviewImage | null
  created_at: string
}

export type DesignRecord = OwnedDesign | PublicDesign

export type DesignGeneration = {
  id: number
  design_id: number
  user_id: number
  retry_of_task_id: number | null
  attempt_no: number
  status: GenerationStatus
  prompt: string
  provider: string
  provider_task_id: string | null
  error_message: string
  result: DesignImage | null
  started_at: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
}

export type DesignUpdateInput = {
  title?: string
  prompt?: string
  visibility?: DesignVisibility
  allow_sale?: 0 | 1
  original?: DesignImageInput
  result?: DesignImageInput
  preview?: PreviewImage
}

export function isOwnedDesign(design: DesignRecord): design is OwnedDesign {
  return 'allow_sale' in design
}
