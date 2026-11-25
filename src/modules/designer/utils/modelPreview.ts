import type { DesignRegionId } from '../types'

/** 底色和 UV 点不放进 React 状态，避免大图触发整页重渲染。 */
export const modelPreview = {
  albedoUrl: null as string | null,
  edges: null as Float32Array | null,
  clouds: {} as Partial<Record<DesignRegionId, Float32Array>>,
}
