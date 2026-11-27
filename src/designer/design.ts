import type { DesignLayer, GarmentStyleId } from './types.ts'

export type SavedDesign = {
  layers: DesignLayer[]
  garmentColor: string
  garmentStyle: GarmentStyleId
}

export type DesignDraft = {
  id: string
  title: string
  modelName: string
  version: number
  saved?: SavedDesign
}

export type DesignAsset = {
  name: string
  url: string
}

const drafts = new Map<string, DesignDraft>()
const storageKey = 'dezajn.saved-designs'

/** 新建一份只存在于当前页面内存里的设计。 */
export function createDesign(title = '未命名设计') {
  const draft: DesignDraft = {
    id: crypto.randomUUID(),
    title,
    modelName: '平面T恤',
    version: 1,
  }
  drafts.set(draft.id, draft)
  return draft
}

/** 先看本次打开的内存，再看这台浏览器里保存过的设计。 */
export function getDesign(id: string) {
  const current = drafts.get(id)
  if (current) return current
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed: unknown = raw ? JSON.parse(raw) : {}
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const saved = (parsed as Record<string, DesignDraft>)[id]
    if (!saved) return null
    drafts.set(id, saved)
    return saved
  } catch {
    return null
  }
}

/** 把当前衣服、颜色和图案存成一份设计。已有记录就增加版本。 */
export function saveDesign(input: { id?: string; title: string; saved: SavedDesign }) {
  const current = input.id ? (drafts.get(input.id) ?? null) : null
  const draft: DesignDraft = current
    ? { ...current, title: input.title, modelName: input.title, version: current.version + 1, saved: input.saved }
    : {
        id: crypto.randomUUID(),
        title: input.title,
        modelName: input.title,
        version: 1,
        saved: input.saved,
      }
  drafts.set(draft.id, draft)
  const raw = localStorage.getItem(storageKey)
  const parsed: unknown = raw ? JSON.parse(raw) : {}
  const records = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? { ...(parsed as Record<string, DesignDraft>) } : {}
  records[draft.id] = draft
  localStorage.setItem(storageKey, JSON.stringify(records))
  return draft
}

/** 更新内存中的标题或模型名。记录不存在时返回 null。 */
export function updateDesign(id: string, patch: Partial<Pick<DesignDraft, 'title' | 'modelName'>>) {
  const current = drafts.get(id)
  if (!current) return null
  const next = { ...current, ...patch }
  drafts.set(id, next)
  return next
}

/** 在内存里把版本号加一。记录不存在时返回 null。 */
export function saveDesignVersion(id: string) {
  const current = drafts.get(id)
  if (!current) return null
  const next = { ...current, version: current.version + 1 }
  drafts.set(id, next)
  return next
}

/** 图案仍使用本地对象地址，这里不上传文件。 */
export function uploadDesignAsset(file: File): DesignAsset {
  return { name: file.name, url: URL.createObjectURL(file) }
}
