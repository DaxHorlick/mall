import { request, toQueryString } from './client.ts'

export const MY_DESIGNS_LIMIT = 20

/** 写手记时只用来选择一件已有设计。设计的创建和编辑流程已撤下。 */
export type DesignListItem = {
  id: number
  title: string
}

export function fetchMyDesigns(limit = MY_DESIGNS_LIMIT) {
  return request<{ items: DesignListItem[] }>(`/v1/designs${toQueryString({ limit })}`)
}
