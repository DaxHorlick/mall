import { useEffect, useRef } from 'react'
import { drawGarment } from '../../utils/drawGarment.ts'
import { loadImage } from '../../utils/loadImage.ts'
import { useEditorStore } from '../../stores/editorStore.ts'
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DESIGN_REGIONS,
  GARMENT_STYLES,
  REGION_BOX,
  type DesignLayer,
} from '../../types/index.ts'

/** 平面衣服画布：画模板、图案和文字，并在画布上拖动。 */
export function GarmentBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)
  const side = useEditorStore((state) => state.side)
  const garmentColor = useEditorStore((state) => state.garmentColor)
  const garmentStyle = useEditorStore((state) => state.garmentStyle)
  const activeRegion = useEditorStore((state) => state.activeRegion)
  const layers = useEditorStore((state) => state.layers)
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId)
  const selectLayer = useEditorStore((state) => state.selectLayer)
  const updateLayer = useEditorStore((state) => state.updateLayer)
  const remember = useEditorStore((state) => state.remember)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    let cancelled = false
    const visible = layers.filter((layer) => layer.side === side && layer.visible)
    const jobs = visible
      .filter((layer) => layer.kind === 'image' && layer.imageUrl)
      .map((layer) =>
        loadImage(layer.imageUrl ?? '')
          .then((image) => [layer.id, image] as const)
          .catch(() => null),
      )

    // 等图案解码完再画，避免画到一半的图片。

    void Promise.all(jobs).then((pairs) => {
      if (cancelled) return
      const images = new Map<string, HTMLImageElement>()
      for (const pair of pairs) {
        if (pair) images.set(pair[0], pair[1])
      }
      const width = BOARD_WIDTH
      const height = BOARD_HEIGHT
      context.clearRect(0, 0, width, height)
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)

      // 当前款式的平面模板。

      drawGarment(context, garmentStyle, side, garmentColor)

      // 这一款能印的区域。

      const regionIds = GARMENT_STYLES.find((item) => item.id === garmentStyle)?.regions ?? []
      for (const region of DESIGN_REGIONS.filter((item) => regionIds.includes(item.id))) {
        const box = REGION_BOX[garmentStyle][region.id]
        context.save()
        context.setLineDash([7, 6])
        context.strokeStyle = region.id === activeRegion ? '#1c1e21' : 'rgba(28, 30, 33, 0.28)'
        context.lineWidth = region.id === activeRegion ? 2.5 : 1.5
        context.strokeRect(box.x * width, box.y * height, box.w * width, box.h * height)
        context.font = '20px sans-serif'
        context.fillStyle = 'rgba(28, 30, 33, 0.55)'
        context.fillText(region.label, box.x * width + 10, box.y * height + 28)
        context.restore()
      }

      // 当前这一面的图案和文字，后加入的画在上面。

      for (const layer of visible) {
        context.save()
        context.translate(layer.x * width, layer.y * height)
        context.rotate((layer.rotation * Math.PI) / 180)
        if (layer.kind === 'image') {
          const image = images.get(layer.id)
          if (image) {
            const drawWidth = 0.28 * width * layer.scale
            const drawHeight = drawWidth * (image.height / image.width)
            context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
          }
        } else {
          const size = Math.max(18, 42 * layer.scale)
          context.fillStyle = layer.textColor || '#1c1e21'
          context.font = `600 ${size}px sans-serif`
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText(layer.text || '', 0, 0)
        }
        if (layer.id === selectedLayerId) {
          context.strokeStyle = '#1c1e21'
          context.lineWidth = 2
          context.setLineDash([5, 4])
          const halfWidth = layer.kind === 'text' ? Math.max(48, (layer.text?.length ?? 1) * 14 * layer.scale) : 0.14 * width * layer.scale
          const halfHeight = layer.kind === 'text' ? 28 * layer.scale : 0.14 * width * layer.scale
          context.strokeRect(-halfWidth, -halfHeight, halfWidth * 2, halfHeight * 2)
        }
        context.restore()
      }
    })

    return () => {
      cancelled = true
    }
  }, [activeRegion, garmentColor, garmentStyle, layers, selectedLayerId, side])

  return (
    <canvas
      ref={canvasRef}
      width={BOARD_WIDTH}
      height={BOARD_HEIGHT}
      className="h-auto max-h-full w-auto max-w-full bg-white"
      onPointerDown={(event) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const bounds = canvas.getBoundingClientRect()
        const x = (event.clientX - bounds.left) / bounds.width
        const y = (event.clientY - bounds.top) / bounds.height
        const stack = layers.filter((layer) => layer.side === side && layer.visible)
        let hit: DesignLayer | null = null

        // 从最上层往下找被点中的图案。

        for (let index = stack.length - 1; index >= 0; index -= 1) {
          const layer = stack[index]
          const dx = x - layer.x
          const dy = y - layer.y
          const radian = (-layer.rotation * Math.PI) / 180
          const cosine = Math.cos(radian)
          const sine = Math.sin(radian)
          const localX = dx * cosine - dy * sine
          const localY = dx * sine + dy * cosine
          const halfWidth = layer.kind === 'text' ? Math.max(0.06, (layer.text?.length ?? 1) * 0.018 * layer.scale) : 0.14 * layer.scale
          const halfHeight = layer.kind === 'text' ? 0.035 * layer.scale : 0.14 * layer.scale
          if (Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight) {
            hit = layer
            break
          }
        }

        if (!hit) {
          drag.current = null
          selectLayer(null)
          return
        }

        // 一次拖动只记一笔撤销，按住的位置相对图案中心不变。

        canvas.setPointerCapture(event.pointerId)
        remember()
        drag.current = { id: hit.id, dx: hit.x - x, dy: hit.y - y }
        selectLayer(hit.id)
      }}
      onPointerMove={(event) => {
        const canvas = canvasRef.current
        const current = drag.current
        if (!canvas || !current) return
        const bounds = canvas.getBoundingClientRect()
        const x = Math.min(0.96, Math.max(0.04, (event.clientX - bounds.left) / bounds.width + current.dx))
        const y = Math.min(0.96, Math.max(0.04, (event.clientY - bounds.top) / bounds.height + current.dy))

        updateLayer(current.id, { x, y })
      }}
      onPointerUp={() => {
        drag.current = null
      }}
    />
  )
}
