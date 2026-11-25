import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
} from 'three'
import type { DesignLayer, DesignRegionId, PartMapping } from '../../types'
import { loadImage } from '../../utils/loadImage'

const REGION_FILL: Record<DesignRegionId, string> = {
  front: 'rgba(214, 62, 48, 0.38)',
  back: 'rgba(98, 86, 232, 0.38)',
  sleeveLeft: 'rgba(36, 104, 224, 0.4)',
  sleeveRight: 'rgba(16, 138, 92, 0.4)',
}

type PrintBinding = {
  meshId: string
  meshName: string
  material: MeshStandardMaterial
  canvas: HTMLCanvasElement
  texture: CanvasTexture
  base: CanvasImageSource | null
  fillStyle: string
}

export type PrintSession = {
  bindings: PrintBinding[]
  dispose: () => void
}

/** 每次重绘先铺回原底色，避免图案叠在上一帧上。 */
function drawBase(binding: PrintBinding) {
  const context = binding.canvas.getContext('2d')
  if (!context) return
  const { width, height } = binding.canvas
  context.clearRect(0, 0, width, height)
  if (binding.base) context.drawImage(binding.base, 0, 0, width, height)
  else {
    context.fillStyle = binding.fillStyle
    context.fillRect(0, 0, width, height)
  }
}

/**
 * 给每个带 UV 的材质换上自己的画布贴图。
 * 没有底图时把材质颜色画进画布，颜色因子改回白色，避免和贴图乘两次变暗。
 */
export function createPrintSession(root: Object3D): PrintSession {
  const bindings: PrintBinding[] = []
  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh || !mesh.geometry.getAttribute('uv')) return
    const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).filter(
      (material): material is MeshStandardMaterial =>
        (material as MeshStandardMaterial).isMeshStandardMaterial === true,
    )
    for (const material of materials) {
      const source = (material.map?.image ?? null) as CanvasImageSource | null
      let sourceWidth = 1024
      let sourceHeight = 1024
      if (source) {
        sourceWidth = 0
        sourceHeight = 0
        if (source instanceof HTMLImageElement) {
          sourceWidth = source.naturalWidth
          sourceHeight = source.naturalHeight
        } else if (source instanceof HTMLVideoElement) {
          sourceWidth = source.videoWidth
          sourceHeight = source.videoHeight
        } else if (source instanceof HTMLCanvasElement || source instanceof ImageBitmap) {
          sourceWidth = source.width
          sourceHeight = source.height
        } else if (typeof OffscreenCanvas !== 'undefined' && source instanceof OffscreenCanvas) {
          sourceWidth = source.width
          sourceHeight = source.height
        } else if (typeof VideoFrame !== 'undefined' && source instanceof VideoFrame) {
          sourceWidth = source.displayWidth
          sourceHeight = source.displayHeight
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.min(sourceWidth || 1024, 2048))
      canvas.height = Math.max(1, Math.min(sourceHeight || 1024, 2048))
      const texture = new CanvasTexture(canvas)
      texture.colorSpace = SRGBColorSpace
      texture.flipY = false
      texture.wrapS = ClampToEdgeWrapping
      texture.wrapT = ClampToEdgeWrapping
      texture.minFilter = LinearMipmapLinearFilter
      texture.magFilter = LinearFilter
      texture.anisotropy = 8
      texture.needsUpdate = true
      const color = material.color.clone()
      if (!source) material.color.setRGB(1, 1, 1)
      const binding: PrintBinding = {
        meshId: String(mesh.userData.editorMeshId ?? mesh.uuid),
        meshName: mesh.name || '未命名 Mesh',
        material,
        canvas,
        texture,
        base: source,
        fillStyle: color.getStyle(),
      }
      drawBase(binding)
      material.map = texture
      material.needsUpdate = true
      bindings.push(binding)
    }
  })

  return {
    bindings,
    dispose: () => {
      for (const binding of bindings) binding.texture.dispose()
    },
  }
}

/** 只把图案画进它所属 Mesh 的贴图，正面和背面不是同一块材质时互不影响。 */
export async function paintSession(
  session: PrintSession,
  parts: PartMapping[],
  layers: DesignLayer[],
  showRegions: boolean,
  anisotropy: number,
) {
  if (!session.bindings.length) {
    return '模型没有带 UV 的标准材质。图案不会贴到表面上。'
  }

  const visible = layers.filter((layer) => layer.visible)
  const images = new Map<string, HTMLImageElement>()
  await Promise.all(
    visible.map(async (layer) => {
      images.set(layer.id, await loadImage(layer.imageUrl))
    }),
  )

  const materialNames = new Set<string>()
  let drawn = 0
  for (const binding of session.bindings) {
    if (binding.material.map !== binding.texture) {
      binding.material.map = binding.texture
      binding.material.needsUpdate = true
    }
    const context = binding.canvas.getContext('2d')
    if (!context) continue
    drawBase(binding)
    const { width, height } = binding.canvas
    if (showRegions) {
      for (const part of parts) {
        if (!part.uvRect || part.meshId !== binding.meshId) continue
        context.fillStyle = REGION_FILL[part.id]
        context.fillRect(part.uvRect.u * width, part.uvRect.v * height, part.uvRect.w * width, part.uvRect.h * height)
      }
    }
    for (const layer of visible) {
      const part = parts.find((item) => item.id === layer.region)
      if (!part?.uvRect || part.meshId !== binding.meshId) continue
      const image = images.get(layer.id)
      if (!image) continue
      const rect = part.uvRect
      const boundsW = rect.w * width
      const boundsH = rect.h * height
      const imageAspect = image.naturalWidth / image.naturalHeight || 1
      const fittedW = Math.min(boundsW, boundsH * imageAspect)
      const destW = fittedW * layer.scale
      const destH = destW / imageAspect
      const centerX = (rect.u + layer.x * rect.w) * width
      const centerY = (rect.v + layer.y * rect.h) * height
      context.save()
      context.beginPath()
      context.rect(rect.u * width, rect.v * height, rect.w * width, rect.h * height)
      context.clip()
      context.translate(centerX, centerY)
      context.rotate((layer.rotation * Math.PI) / 180)
      context.drawImage(image, -destW / 2, -destH / 2, destW, destH)
      context.restore()
      drawn += 1
      materialNames.add(binding.material.name || binding.meshName)
    }
    binding.texture.anisotropy = anisotropy
    binding.texture.needsUpdate = true
  }

  const skipped = visible.filter((layer) => {
    const part = parts.find((item) => item.id === layer.region)
    return !part?.uvRect
  })
  if (!visible.length && !showRegions) {
    return '衣服原来的底色还在。上传 PNG 后会画进这张贴图，旋转时贴着表面。'
  }
  if (!visible.length && showRegions) {
    return '色块标出了当前能用的 UV 设计范围，还没有图案。'
  }
  if (!drawn) {
    return `有 ${skipped.length} 个图案因为设计区域没有可用 UV，还没有画到模型上。`
  }
  const names = [...materialNames].join('、')
  const skipNote = skipped.length ? `另有 ${skipped.length} 个图案没有可用 UV。` : ''
  return `已把 ${drawn} 个图案画进材质 ${names}。旋转模型时图案贴在衣服表面上。${skipNote}`
}
