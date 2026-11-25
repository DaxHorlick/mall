export type DesignDraft = {
  id: string
  title: string
  modelName: string
  version: number
}

export type DesignAsset = {
  name: string
  url: string
}

const drafts = new Map<string, DesignDraft>()

/** 新建一份只存在于当前页面内存里的设计。 */
export function createDesign(title = '未命名设计') {
  const draft: DesignDraft = {
    id: crypto.randomUUID(),
    title,
    modelName: 'T-shirt.glb',
    version: 1,
  }
  drafts.set(draft.id, draft)
  return draft
}

/** 读取内存中的设计。没有对应记录时返回 null，不向后端查询。 */
export function getDesign(id: string) {
  return drafts.get(id) ?? null
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
