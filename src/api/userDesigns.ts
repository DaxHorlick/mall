import { request, toQueryString } from './client.ts'
import type {
  DesignGeneration,
  DesignImageInput,
  DesignRecord,
  DesignUpdateInput,
  OwnedDesign,
  PreviewImage,
  PublicDesign,
} from '../types/userDesign.ts'
import { MY_DESIGNS_LIMIT, PUBLIC_DESIGNS_LIMIT } from '../utils/userDesign.ts'

export { MY_DESIGNS_LIMIT, PUBLIC_DESIGNS_LIMIT }

/** 当前用户自己的设计，含草稿和未公开作品。进入页面前先确认登录态。 */
export function fetchMyDesigns(limit = MY_DESIGNS_LIMIT) {
  return request<{ items: OwnedDesign[] }>(`/v1/designs${toQueryString({ limit })}`)
}

/** 已公开且已通过的设计。不需要登录，不能按用户筛选或搜索。 */
export function fetchPublicDesigns(limit = PUBLIC_DESIGNS_LIMIT) {
  return request<{ items: PublicDesign[] }>(`/v1/designs/public${toQueryString({ limit })}`)
}

/** 所有者拿到完整资料；其他人只有已公开且已通过的作品。 */
export function fetchDesign(id: number) {
  return request<DesignRecord>(`/v1/designs/${id}`)
}

export function createAiDesign(input: { title: string; prompt: string }) {
  return request<OwnedDesign>('/v1/designs', {
    method: 'POST',
    body: JSON.stringify({
      origin: 'ai',
      title: input.title,
      prompt: input.prompt,
    }),
  })
}

export function createUploadDesign(input: {
  title: string
  original: DesignImageInput
  result: DesignImageInput
  preview?: PreviewImage
}) {
  return request<OwnedDesign>('/v1/designs', {
    method: 'POST',
    body: JSON.stringify({
      origin: 'upload',
      title: input.title,
      original: input.original,
      result: input.result,
      ...(input.preview ? { preview: input.preview } : {}),
    }),
  })
}

/** 只提交有改动的字段。不要传审核状态、来源或用户 ID。 */
export function updateDesign(id: number, patch: DesignUpdateInput) {
  return request<OwnedDesign>(`/v1/designs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function submitDesign(id: number) {
  return request<OwnedDesign>(`/v1/designs/${id}/submissions`, {
    method: 'POST',
  })
}

/** 省略 prompt 时使用设计上现有的提示词。返回后状态仍是 pending。 */
export function createGeneration(designId: number, prompt?: string) {
  return request<DesignGeneration>(`/v1/designs/${designId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(prompt === undefined ? {} : { prompt }),
  })
}

export function fetchGenerations(designId: number) {
  return request<{ items: DesignGeneration[] }>(`/v1/designs/${designId}/tasks`)
}

export function fetchGeneration(designId: number, taskId: number) {
  return request<DesignGeneration>(`/v1/designs/${designId}/tasks/${taskId}`)
}

/** 省略 prompt 时沿用被重试那条任务的提示词。 */
export function retryGeneration(designId: number, taskId: number, prompt?: string) {
  return request<DesignGeneration>(`/v1/designs/${designId}/tasks/${taskId}/retries`, {
    method: 'POST',
    body: JSON.stringify(prompt === undefined ? {} : { prompt }),
  })
}

export function adoptGeneration(designId: number, taskId: number) {
  return request<OwnedDesign>(`/v1/designs/${designId}/tasks/${taskId}/adoption`, {
    method: 'POST',
  })
}
