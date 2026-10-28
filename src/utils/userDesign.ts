import { ApiError, isAccountDisabled } from '../api/client.ts'
import type {
  DesignImage,
  DesignImageInput,
  DesignReviewStatus,
  DesignUpdateInput,
  DesignVisibility,
  GenerationStatus,
  OwnedDesign,
  PreviewImage,
} from '../types/userDesign.ts'

const TITLE_CONTROL = /[\p{Cc}]/u

function hasPromptControl(value: string) {
  for (const char of value) {
    const code = char.charCodeAt(0)
    const isControl = code <= 31 || (code >= 127 && code <= 159)
    const allowed = code === 9 || code === 10 || code === 13
    if (isControl && !allowed) {
      return true
    }
  }

  return false
}
const SIGNED_QUERY = new Set([
  'x-amz-signature',
  'x-amz-credential',
  'x-amz-security-token',
  'x-amz-algorithm',
  'signature',
  'expires',
  'ossaccesskeyid',
  'q-signature',
  'token',
])

const CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const MY_DESIGNS_LIMIT = 20

export const PUBLIC_DESIGNS_LIMIT = 20

export const REVIEW_STATUS_LABEL: Record<DesignReviewStatus, string> = {
  draft: '草稿',
  pending: '审核中',
  approved: '已通过',
  rejected: '已拒绝',
}

export const VISIBILITY_LABEL: Record<DesignVisibility, string> = {
  private: '私有',
  public: '公开',
}

export const ORIGIN_LABEL = {
  ai: 'AI 设计',
  upload: '上传设计',
} as const

export const GENERATION_STATUS_LABEL: Record<GenerationStatus, string> = {
  pending: '排队中',
  running: '生成中',
  succeeded: '已完成',
  failed: '失败',
}

export type ImageFieldValues = {
  object_key: string
  url: string
  content_type: string
  bytes: string
  width: string
  height: string
}

export type PreviewFieldValues = {
  object_key: string
  url: string
}

export type DesignEditorValues = {
  title: string
  prompt: string
  visibility: DesignVisibility
  allow_sale: boolean
  original: ImageFieldValues
  result: ImageFieldValues
  preview: PreviewFieldValues
}

export function isSessionEnd(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || isAccountDisabled(error))
}

export function isRateLimited(error: unknown) {
  return error instanceof ApiError && (error.status === 429 || error.code === 'RATE_LIMITED')
}

export function parseDesignId(value: string | undefined) {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return null
  }

  const id = Number(value)
  if (!Number.isSafeInteger(id)) {
    return null
  }

  return id
}

export function isGenerationActive(status: GenerationStatus) {
  return status === 'pending' || status === 'running'
}

export function formatDesignTime(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('zh-CN', { hour12: false })
}

function charCount(value: string) {
  return Array.from(value).length
}

export function validateDesignTitle(value: string) {
  if (TITLE_CONTROL.test(value)) {
    return '标题不能包含控制字符'
  }

  const trimmed = value.trim()
  if (charCount(trimmed) < 1 || charCount(trimmed) > 128) {
    return '标题长度需为 1 到 128 个字符'
  }

  return null
}

export function validateDesignPrompt(value: string) {
  if (hasPromptControl(value)) {
    return '提示词不能包含控制字符'
  }

  const trimmed = value.trim()
  if (charCount(trimmed) < 1 || charCount(trimmed) > 4000) {
    return '提示词长度需为 1 到 4000 个字符'
  }

  return null
}

export function validateObjectKey(value: string, kind: 'image' | 'preview' = 'image') {
  const message = kind === 'preview' ? '预览图对象键不正确' : '图片对象键不正确'
  const trimmed = value.trim()

  if (charCount(trimmed) < 1 || charCount(trimmed) > 255) {
    return message
  }

  if (TITLE_CONTROL.test(trimmed) || trimmed.startsWith('/')) {
    return message
  }

  if (
    trimmed.includes('\\') ||
    trimmed.includes('..') ||
    trimmed.includes('://') ||
    trimmed.includes(' ') ||
    trimmed.includes('?') ||
    trimmed.includes('#')
  ) {
    return message
  }

  return null
}

export function validateImageUrl(value: string, kind: 'image' | 'preview' = 'image') {
  const incorrect = kind === 'preview' ? '预览图地址不正确' : '图片地址不正确'
  const signed = kind === 'preview' ? '预览图地址不能包含临时签名' : '图片地址不能包含临时签名'
  const trimmed = value.trim()

  if (!trimmed || charCount(trimmed) > 512) {
    return incorrect
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return incorrect
  }

  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname) {
    return incorrect
  }

  if (url.username || url.password) {
    return incorrect
  }

  for (const key of url.searchParams.keys()) {
    if (SIGNED_QUERY.has(key.toLowerCase())) {
      return signed
    }
  }

  return null
}

export function normalizeContentType(value: string) {
  return value.trim().split(';')[0]?.trim().toLowerCase() ?? ''
}

export function validateContentType(value: string) {
  if (!CONTENT_TYPES.has(normalizeContentType(value))) {
    return '图片类型只支持 jpeg、png 或 webp'
  }

  return null
}

export function validateBytes(value: string) {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) {
    return '图片大小不正确'
  }

  const bytes = Number(trimmed)
  if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > 20_971_520) {
    return '图片大小不正确'
  }

  return null
}

export function validateDimension(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (!/^\d+$/.test(trimmed)) {
    return '图片尺寸不正确'
  }

  const size = Number(trimmed)
  if (!Number.isSafeInteger(size) || size < 0 || size > 20_000) {
    return '图片尺寸不正确'
  }

  return null
}

export function emptyImageFields(): ImageFieldValues {
  return {
    object_key: '',
    url: '',
    content_type: 'image/png',
    bytes: '',
    width: '',
    height: '',
  }
}

export function imageToFields(image: DesignImage | null): ImageFieldValues {
  if (!image) {
    return emptyImageFields()
  }

  return {
    object_key: image.object_key,
    url: image.url,
    content_type: normalizeContentType(image.content_type) || image.content_type,
    bytes: String(image.bytes),
    width: image.width == null ? '' : String(image.width),
    height: image.height == null ? '' : String(image.height),
  }
}

export function previewToFields(preview: PreviewImage | null): PreviewFieldValues {
  return {
    object_key: preview?.object_key ?? '',
    url: preview?.url ?? '',
  }
}

export function isPreviewBlank(fields: PreviewFieldValues | undefined) {
  return !fields?.object_key.trim() && !fields?.url.trim()
}

export function toEditorValues(design: OwnedDesign): DesignEditorValues {
  return {
    title: design.title,
    prompt: design.prompt ?? '',
    visibility: design.visibility,
    allow_sale: design.allow_sale === 1,
    original: imageToFields(design.original),
    result: imageToFields(design.result),
    preview: previewToFields(design.preview),
  }
}

export function parseImageFields(
  fields: ImageFieldValues | undefined,
): { ok: true; value: DesignImageInput } | { ok: false; message: string } {
  const current = fields ?? emptyImageFields()
  const keyError = validateObjectKey(current.object_key)
  if (keyError) {
    return { ok: false, message: keyError }
  }

  const urlError = validateImageUrl(current.url)
  if (urlError) {
    return { ok: false, message: urlError }
  }

  const typeError = validateContentType(current.content_type)
  if (typeError) {
    return { ok: false, message: typeError }
  }

  const bytesError = validateBytes(current.bytes)
  if (bytesError) {
    return { ok: false, message: bytesError }
  }

  const widthError = validateDimension(current.width)
  if (widthError) {
    return { ok: false, message: widthError }
  }

  const heightError = validateDimension(current.height)
  if (heightError) {
    return { ok: false, message: heightError }
  }

  const value: DesignImageInput = {
    object_key: current.object_key.trim(),
    url: current.url.trim(),
    content_type: normalizeContentType(current.content_type),
    bytes: Number(current.bytes.trim()),
  }

  if (current.width.trim()) {
    value.width = Number(current.width.trim())
  }

  if (current.height.trim()) {
    value.height = Number(current.height.trim())
  }

  return { ok: true, value }
}

export function parsePreviewFields(
  fields: PreviewFieldValues | undefined,
): { ok: true; value: PreviewImage } | { ok: false; message: string } {
  const keyError = validateObjectKey(fields?.object_key ?? '', 'preview')
  if (keyError) {
    return { ok: false, message: keyError }
  }

  const urlError = validateImageUrl(fields?.url ?? '', 'preview')
  if (urlError) {
    return { ok: false, message: urlError }
  }

  return {
    ok: true,
    value: {
      object_key: fields?.object_key.trim() ?? '',
      url: fields?.url.trim() ?? '',
    },
  }
}

function sameImage(current: DesignImage | null, next: DesignImageInput) {
  if (!current) {
    return false
  }

  return (
    current.object_key === next.object_key &&
    current.url === next.url &&
    normalizeContentType(current.content_type) === next.content_type &&
    current.bytes === next.bytes &&
    (current.width ?? null) === (next.width ?? null) &&
    (current.height ?? null) === (next.height ?? null)
  )
}

function samePreview(current: PreviewImage | null, next: PreviewImage) {
  if (!current) {
    return false
  }

  return current.object_key === next.object_key && current.url === next.url
}

export function buildDesignPatch(
  design: OwnedDesign,
  values: DesignEditorValues,
): { ok: true; patch: DesignUpdateInput | null } | { ok: false; message: string } {
  if (design.review_status === 'pending') {
    return { ok: false, message: '设计正在审核' }
  }

  const titleError = validateDesignTitle(values.title)
  if (titleError) {
    return { ok: false, message: titleError }
  }

  const patch: DesignUpdateInput = {}
  const title = values.title.trim()
  if (title !== design.title) {
    patch.title = title
  }

  const promptEditable =
    design.origin === 'ai' &&
    (design.review_status === 'draft' || design.review_status === 'rejected')

  if (promptEditable) {
    const promptError = validateDesignPrompt(values.prompt ?? '')
    if (promptError) {
      return { ok: false, message: promptError }
    }

    const prompt = values.prompt.trim()
    if (prompt !== (design.prompt ?? '')) {
      patch.prompt = prompt
    }
  }

  if (!isPreviewBlank(values.preview)) {
    const preview = parsePreviewFields(values.preview)
    if (!preview.ok) {
      return preview
    }

    if (!samePreview(design.preview, preview.value)) {
      patch.preview = preview.value
    }
  }

  if (design.review_status === 'approved' && values.visibility !== design.visibility) {
    const willHavePreview = Boolean(patch.preview) || Boolean(design.preview)
    if (values.visibility === 'public' && !willHavePreview) {
      return { ok: false, message: '公开设计必须已通过审核并有预览图' }
    }

    patch.visibility = values.visibility
  }

  if (design.review_status === 'approved' && design.result) {
    const allowSale: 0 | 1 = values.allow_sale ? 1 : 0
    if (allowSale !== design.allow_sale) {
      if (allowSale === 1 && !design.result) {
        return { ok: false, message: '允许出售前必须已通过审核并有成品图' }
      }
      patch.allow_sale = allowSale
    }
  }

  const imagesEditable =
    design.origin === 'upload' &&
    (design.review_status === 'draft' || design.review_status === 'rejected')

  if (imagesEditable) {
    const original = parseImageFields(values.original)
    if (!original.ok) {
      return original
    }

    if (!sameImage(design.original, original.value)) {
      patch.original = original.value
    }

    const result = parseImageFields(values.result)
    if (!result.ok) {
      return result
    }

    if (!sameImage(design.result, result.value)) {
      patch.result = result.value
    }
  }

  return { ok: true, patch: Object.keys(patch).length > 0 ? patch : null }
}

export function sameResultImage(
  current: DesignImage | null,
  next: DesignImage | null,
) {
  if (!current || !next) {
    return false
  }

  return current.object_key === next.object_key && current.url === next.url
}
