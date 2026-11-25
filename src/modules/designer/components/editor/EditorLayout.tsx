import { useEffect, useRef, useState } from 'react'
import { Grid, OrbitControls, useProgress } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { CAMERA_FOV, DESIGN_REGIONS, type DesignRegionId, type UvRect } from '../../types'
import { applyOverrides, useEditorStore } from '../../stores/editorStore'
import { modelPreview } from '../../utils/modelPreview'
import { ModelRoot } from '../three/ModelRoot'

const STROKE: Record<DesignRegionId, string> = {
  front: '#d23b2e',
  back: '#6256e8',
  sleeveLeft: '#2468e0',
  sleeveRight: '#108a5c',
}

const primary = 'w-full rounded-lg bg-[#1c1e21] px-3 py-2 text-sm font-semibold text-white'
const secondary = 'w-full rounded-lg border border-[#d9d3c8] bg-white px-3 py-2 text-sm font-medium'
const miniButton = 'rounded-md border border-[#e4dfd6] bg-white px-2 py-1 text-xs'

/** 三栏设计器：左侧模型和图层，中间画布，右侧是当前图案和 UV 范围。 */
export function EditorLayout() {
  const modelInput = useRef<HTMLInputElement>(null)
  const patternInput = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { active, progress } = useProgress()
  const modelUrl = useEditorStore((state) => state.modelUrl)
  const modelName = useEditorStore((state) => state.modelName)
  const report = useEditorStore((state) => state.report)
  const overrides = useEditorStore((state) => state.overrides)
  const activeRegion = useEditorStore((state) => state.activeRegion)
  const setActiveRegion = useEditorStore((state) => state.setActiveRegion)
  const isolateGarment = useEditorStore((state) => state.isolateGarment)
  const setIsolateGarment = useEditorStore((state) => state.setIsolateGarment)
  const showRegions = useEditorStore((state) => state.showRegions)
  const setShowRegions = useEditorStore((state) => state.setShowRegions)
  const notice = useEditorStore((state) => state.notice)
  const setNotice = useEditorStore((state) => state.setNotice)
  const resetDefaultModel = useEditorStore((state) => state.resetDefaultModel)
  const addLayer = useEditorStore((state) => state.addLayer)
  const setModelFile = useEditorStore((state) => state.setModelFile)
  const layers = useEditorStore((state) => state.layers)
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId)
  const selectLayer = useEditorStore((state) => state.selectLayer)
  const updateLayer = useEditorStore((state) => state.updateLayer)
  const moveLayer = useEditorStore((state) => state.moveLayer)
  const removeLayer = useEditorStore((state) => state.removeLayer)
  const printMessage = useEditorStore((state) => state.printMessage)
  const modelError = useEditorStore((state) => state.modelError)
  const autoRotate = useEditorStore((state) => state.autoRotate)
  const setAutoRotate = useEditorStore((state) => state.setAutoRotate)
  const requestView = useEditorStore((state) => state.requestView)
  const floorY = useEditorStore((state) => state.frame?.floorY ?? -0.03)
  const setOverride = useEditorStore((state) => state.setOverride)
  const clearOverride = useEditorStore((state) => state.clearOverride)
  const clearRegionLayers = useEditorStore((state) => state.clearRegionLayers)
  const uvTemplateUrl = useEditorStore((state) => state.uvTemplateUrl)
  const setUvTemplate = useEditorStore((state) => state.setUvTemplate)

  const parts = report ? applyOverrides(report.parts, overrides) : []
  const part = parts.find((item) => item.id === activeRegion) ?? null
  const layer = layers.find((item) => item.id === selectedLayerId) ?? null
  const manual = Boolean(overrides[activeRegion])
  const [draft, setDraft] = useState<UvRect>(part?.uvRect ?? { u: 0.1, v: 0.1, w: 0.2, h: 0.2 })

  useEffect(() => {
    setDraft(part?.uvRect ?? { u: 0.1, v: 0.1, w: 0.2, h: 0.2 })
  }, [activeRegion, manual, part?.uvRect])

  // V=0 在上方，和 glTF 一致，所以这里不把贴图上下翻转。
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    let cancelled = false
    const mapped = report ? applyOverrides(report.parts, overrides) : []
    const baseImage = modelPreview.albedoUrl
      ? new Promise<HTMLImageElement | null>((resolve) => {
          const image = new Image()
          image.onload = () => resolve(image)
          image.onerror = () => resolve(null)
          image.src = modelPreview.albedoUrl ?? ''
        })
      : Promise.resolve(null)
    const templateImage = uvTemplateUrl
      ? new Promise<HTMLImageElement | null>((resolve) => {
          const image = new Image()
          image.onload = () => resolve(image)
          image.onerror = () => resolve(null)
          image.src = uvTemplateUrl
        })
      : Promise.resolve(null)
    void Promise.all([baseImage, templateImage]).then(([base, template]) => {
      if (cancelled) return
      const size = canvas.width
      context.clearRect(0, 0, size, size)
      context.fillStyle = '#f6f3ed'
      context.fillRect(0, 0, size, size)
      if (base) context.drawImage(base, 0, 0, size, size)
      if (template) {
        context.save()
        context.globalAlpha = 0.55
        context.drawImage(template, 0, 0, size, size)
        context.restore()
      }
      const edges = modelPreview.edges
      if (edges) {
        context.beginPath()
        context.lineWidth = 1
        context.strokeStyle = 'rgba(28, 30, 33, 0.35)'
        for (let index = 0; index < edges.length; index += 4) {
          context.moveTo(edges[index] * size, edges[index + 1] * size)
          context.lineTo(edges[index + 2] * size, edges[index + 3] * size)
        }
        context.stroke()
      }
      const cloud = modelPreview.clouds[activeRegion]
      if (cloud) {
        context.fillStyle = STROKE[activeRegion]
        for (let index = 0; index < cloud.length; index += 2) {
          context.fillRect(cloud[index] * size - 1.5, cloud[index + 1] * size - 1.5, 3, 3)
        }
      }
      for (const regionPart of mapped) {
        if (!regionPart.uvRect) continue
        context.save()
        context.strokeStyle = STROKE[regionPart.id]
        context.lineWidth = regionPart.id === activeRegion ? 3 : 1.5
        context.strokeRect(
          regionPart.uvRect.u * size,
          regionPart.uvRect.v * size,
          regionPart.uvRect.w * size,
          regionPart.uvRect.h * size,
        )
        context.restore()
      }
      context.fillStyle = '#1c1e21'
      context.font = '22px sans-serif'
      context.fillText('U', size - 36, 34)
      context.fillText('V', 16, size - 18)
    })
    return () => {
      cancelled = true
    }
  }, [report, overrides, activeRegion, uvTemplateUrl])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#e6e3dc] xl:grid xl:grid-cols-[320px_minmax(0,1fr)_320px] xl:grid-rows-[minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col overflow-y-auto border-b border-[#ddd7cc] bg-[#f7f5f1] xl:border-r xl:border-b-0">
        <div className="border-b border-[#e6e1d8] px-4 py-4">
          <p className="text-xs font-medium text-[#7a7368]">服装定制</p>
          <h1 className="text-xl font-semibold tracking-tight">3D T恤设计器</h1>
        </div>
        {notice ? (
          <div className="mx-4 mt-3 flex items-start justify-between gap-3 rounded-lg bg-[#fff4e8] px-3 py-2 text-xs leading-5 text-[#9a3412]">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)}>
              关闭
            </button>
          </div>
        ) : null}
        <section className="border-b border-[#e6e1d8] px-4 py-4">
          <h2 className="mb-3 text-xs font-semibold text-[#7a7368]">模型</h2>
          <p className="mb-2 truncate text-sm font-medium">{modelName}</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={primary} onClick={() => modelInput.current?.click()}>
              上传 GLB
            </button>
            <button type="button" className={secondary} onClick={resetDefaultModel}>
              默认模型
            </button>
          </div>
          <input
            ref={modelInput}
            data-testid="model-upload"
            className="hidden"
            type="file"
            accept=".glb,model/gltf-binary"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              if (!file.name.toLowerCase().endsWith('.glb')) {
                setNotice('请上传 .glb 模型。')
                return
              }
              setModelFile(file)
            }}
          />
          <label className="mt-3 flex items-start gap-2 text-xs leading-5">
            <input
              data-testid="isolate-garment"
              type="checkbox"
              className="mt-1"
              checked={isolateGarment}
              disabled={Boolean(report && !report.canIsolate)}
              onChange={(event) => setIsolateGarment(event.target.checked)}
            />
            <span>只显示主服装。隐藏轮廓以外的三角面，不改 UV。</span>
          </label>
          <p className="mt-3 text-xs leading-5 text-[#6f685e]">
            替换模型需要：真实 T 恤 GLB、带 TEXCOORD_0、最好把正面、背面、左右袖拆成独立 Mesh，并且允许改材质。没有 UV 时不会宣称贴图成功。
          </p>
        </section>
        <section className="border-b border-[#e6e1d8] px-4 py-4">
          <h2 className="mb-3 text-xs font-semibold text-[#7a7368]">设计区域</h2>
          <div className="grid grid-cols-2 gap-2">
            {DESIGN_REGIONS.map((region) => {
              const regionPart = parts.find((item) => item.id === region.id)
              const ready = regionPart?.status === 'ready'
              const selected = activeRegion === region.id
              return (
                <button
                  key={region.id}
                  type="button"
                  data-testid={`region-${region.id}`}
                  onClick={() => setActiveRegion(region.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm ${selected ? 'border-[#1c1e21] bg-[#1c1e21] text-white' : 'border-[#e4dfd6] bg-white'}`}
                >
                  <span className="block font-semibold">{region.label}</span>
                  <span className={`text-xs ${selected ? 'text-white/75' : ready ? 'text-[#0f7a45]' : 'text-[#9a3412]'}`}>
                    {regionPart ? (ready ? 'UV 可用' : '需手动范围') : '解析中'}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
        <section className="border-b border-[#e6e1d8] px-4 py-4">
          <h2 className="mb-3 text-xs font-semibold text-[#7a7368]">图案</h2>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={primary} onClick={() => patternInput.current?.click()}>
              上传 PNG
            </button>
            <button
              type="button"
              className={secondary}
              data-testid="sample-pattern"
              onClick={() => {
                void (async () => {
                  const response = await fetch('/samples/mark.png')
                  if (!response.ok) {
                    setNotice('示例图案读取失败。')
                    return
                  }
                  const blob = await response.blob()
                  addLayer({
                    name: '示例图案.png',
                    imageUrl: URL.createObjectURL(blob),
                    region: activeRegion,
                  })
                })()
              }}
            >
              示例图案
            </button>
          </div>
          <input
            ref={patternInput}
            data-testid="pattern-upload"
            className="hidden"
            type="file"
            accept="image/png"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')
              if (!isPng) {
                setNotice('请上传 PNG，透明背景才能保留。')
                return
              }
              addLayer({ name: file.name, imageUrl: URL.createObjectURL(file), region: activeRegion })
            }}
          />
          <label className="mt-3 flex items-start gap-2 text-xs leading-5">
            <input
              data-testid="show-regions"
              type="checkbox"
              className="mt-1"
              checked={showRegions}
              onChange={(event) => setShowRegions(event.target.checked)}
            />
            <span>在衣服上用色块标出设计范围，用来核对 UV 是否贴在表面上。</span>
          </label>
        </section>
        <section className="border-b border-[#e6e1d8] px-4 py-4">
          <h2 className="mb-3 text-xs font-semibold text-[#7a7368]">图层</h2>
          {layers.length ? (
            <ul className="space-y-2" data-testid="layer-list">
              {layers.map((item, index) => {
                const selected = item.id === selectedLayerId
                const regionLabel = DESIGN_REGIONS.find((region) => region.id === item.region)?.label ?? item.region
                return (
                  <li key={item.id}>
                    <div
                      className={`rounded-xl border p-2 ${selected ? 'border-[#1c1e21] bg-white' : 'border-[#e4dfd6] bg-[#faf8f4]'}`}
                    >
                      <button type="button" className="flex w-full items-center gap-2 text-left" onClick={() => selectLayer(item.id)}>
                        <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-md bg-[repeating-conic-gradient(#ddd_0%_25%,#fff_0%_50%)] bg-[length:10px_10px] object-contain" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{item.name}</span>
                          <span className="text-xs text-[#6f685e]">{regionLabel}</span>
                        </span>
                      </button>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <button type="button" className={miniButton} onClick={() => updateLayer(item.id, { visible: !item.visible })}>
                          {item.visible ? '隐藏' : '显示'}
                        </button>
                        <button
                          type="button"
                          className={miniButton}
                          onClick={() => moveLayer(item.id, 1)}
                          disabled={index === layers.length - 1}
                        >
                          置于上层
                        </button>
                        <button type="button" className={miniButton} onClick={() => moveLayer(item.id, -1)} disabled={index === 0}>
                          置于下层
                        </button>
                        <button type="button" className={miniButton} onClick={() => removeLayer(item.id)}>
                          删除
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-[#6f685e]">还没有图案。上传 PNG 后会出现在这里。</p>
          )}
        </section>
        <section className="border-b border-[#e6e1d8] px-4 py-4">
          <h2 className="mb-3 text-xs font-semibold text-[#7a7368]">模型结构</h2>
          {modelError ? (
            <p className="text-sm leading-6 text-[#9a3412]">{modelError}</p>
          ) : !report ? (
            <p className="text-sm text-[#6f685e]">正在读取 Mesh、材质和 UV…</p>
          ) : (
            <div className="space-y-3" data-testid="model-inspector">
              {report.summary.map((line) => (
                <p key={line} className="text-xs leading-5 text-[#3d3a34]">
                  {line}
                </p>
              ))}
              <p className="text-xs leading-5 text-[#6f685e]">{report.isolateNote}</p>
              {report.meshes.map((mesh) => (
                <div key={mesh.id} className="rounded-xl border border-[#e4dfd6] bg-[#faf8f4] p-3">
                  <p className="mb-2 text-sm font-semibold">{mesh.name}</p>
                  <div className="space-y-1">
                    <div className="grid grid-cols-[88px_1fr] gap-2 text-xs leading-5">
                      <span className="text-[#7a7368]">材质</span>
                      <span className="break-all text-[#1c1e21]">{mesh.materialName}</span>
                    </div>
                    <div className="grid grid-cols-[88px_1fr] gap-2 text-xs leading-5">
                      <span className="text-[#7a7368]">顶点</span>
                      <span className="break-all text-[#1c1e21]">{mesh.vertexCount.toLocaleString('zh-CN')}</span>
                    </div>
                    <div className="grid grid-cols-[88px_1fr] gap-2 text-xs leading-5">
                      <span className="text-[#7a7368]">三角面</span>
                      <span className="break-all text-[#1c1e21]">{mesh.triangleCount.toLocaleString('zh-CN')}</span>
                    </div>
                    <div className="grid grid-cols-[88px_1fr] gap-2 text-xs leading-5">
                      <span className="text-[#7a7368]">属性</span>
                      <span className="break-all text-[#1c1e21]">{mesh.attributes.join('、')}</span>
                    </div>
                    <div className="grid grid-cols-[88px_1fr] gap-2 text-xs leading-5">
                      <span className="text-[#7a7368]">UV</span>
                      <span className="break-all text-[#1c1e21]">{mesh.hasUv ? '有' : '没有'}</span>
                    </div>
                    <div className="grid grid-cols-[88px_1fr] gap-2 text-xs leading-5">
                      <span className="text-[#7a7368]">UV 范围</span>
                      <span className="break-all text-[#1c1e21]">
                        {mesh.uvBounds
                          ? `u ${mesh.uvBounds.uMin.toFixed(3)}–${mesh.uvBounds.uMax.toFixed(3)}，v ${mesh.uvBounds.vMin.toFixed(3)}–${mesh.uvBounds.vMax.toFixed(3)}`
                          : '无'}
                      </span>
                    </div>
                    <div className="grid grid-cols-[88px_1fr] gap-2 text-xs leading-5">
                      <span className="text-[#7a7368]">双面材质</span>
                      <span className="break-all text-[#1c1e21]">{mesh.doubleSided ? '是' : '否'}</span>
                    </div>
                    <div className="grid grid-cols-[88px_1fr] gap-2 text-xs leading-5">
                      <span className="text-[#7a7368]">底色贴图</span>
                      <span className="break-all text-[#1c1e21]">{mesh.hasBaseMap ? '有，图案画在这张图上' : '没有'}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="space-y-2">
                {parts.map((regionPart) => (
                  <div key={regionPart.id} className="rounded-lg bg-[#f4f1ea] px-3 py-2 text-xs leading-5">
                    <p className="font-semibold">
                      {regionPart.label}
                      <span className={regionPart.status === 'ready' ? 'text-[#0f7a45]' : 'text-[#9a3412]'}>
                        {regionPart.status === 'ready' ? ' · 可印刷' : ' · 不能自动印刷'}
                      </span>
                    </p>
                    <p className="text-[#4e4942]">
                      {regionPart.meshName ? `Mesh ${regionPart.meshName}。` : ''}
                      {regionPart.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        <section className="border-b border-[#e6e1d8] px-4 py-4">
          <h2 className="mb-3 text-xs font-semibold text-[#7a7368]">UV</h2>
          <div className="space-y-2">
            <canvas
              ref={canvasRef}
              width={640}
              height={640}
              className="aspect-square w-full rounded-xl border border-[#e4dfd6] bg-[#f6f3ed]"
            />
            <p className="text-xs leading-5 text-[#6f685e]">
              底图是模型自己的底色贴图，线是真实 UV 边。V=0 在上方，和 glTF 一致。色点是当前设计区域的三角面。
            </p>
            <label className="block text-xs font-medium text-[#3d3a34]">
              叠加 UV 模板 PNG
              <input
                className="mt-1 block w-full text-xs"
                type="file"
                accept="image/png"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) setUvTemplate(file)
                  event.target.value = ''
                }}
              />
            </label>
            {uvTemplateUrl ? (
              <button type="button" className="text-xs font-medium text-[#9a3412]" onClick={() => setUvTemplate(null)}>
                移除模板
              </button>
            ) : null}
          </div>
        </section>
      </aside>
      <main className="relative order-first min-h-[420px] flex-1 xl:order-none xl:min-h-0">
        <Canvas
          dpr={[1, 1.75]}
          camera={{ fov: CAMERA_FOV, position: [0.7, 1.6, 1.05], near: 0.01, far: 50 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl, camera }) => {
            gl.toneMapping = ACESFilmicToneMapping
            gl.toneMappingExposure = 1.05
            camera.up.set(0, 1, 0)
          }}
        >
          <color attach="background" args={['#d9d4cc']} />
          <hemisphereLight args={['#f7f3ec', '#c9c2b6', 0.9]} />
          <ambientLight intensity={0.28} />
          <directionalLight position={[1.8, 3.4, 1.4]} intensity={2.4} />
          <directionalLight position={[-2.4, 1.8, -1.6]} intensity={0.55} />
          <directionalLight position={[0.2, 1.2, 2.4]} intensity={0.35} />
          <Grid
            position={[0, floorY + 0.001, 0]}
            args={[6, 6]}
            cellSize={0.1}
            cellThickness={0.6}
            cellColor="#c8c2b6"
            sectionSize={0.5}
            sectionThickness={1.1}
            sectionColor="#b3ab9e"
            fadeDistance={5}
            infiniteGrid
          />
          <ModelRoot key={modelUrl} url={modelUrl} />
          <OrbitControls
            makeDefault
            enablePan
            enableRotate
            enableZoom
            enableDamping
            dampingFactor={0.08}
            autoRotate={autoRotate}
            autoRotateSpeed={1.15}
            minDistance={0.2}
            maxDistance={8}
          />
        </Canvas>
        <div
          data-testid="print-message"
          className="pointer-events-none absolute top-4 right-4 left-4 max-w-xl rounded-2xl bg-white/90 px-4 py-3 text-sm leading-6 shadow-[0_10px_30px_rgba(40,32,20,0.08)]"
        >
          {modelError ?? printMessage}
        </div>
        {active ? (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-[#1c1e21] px-4 py-2 text-sm text-white">
            正在加载模型 {progress.toFixed(0)}%
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
          <div className="flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl bg-white/95 p-2 shadow-[0_10px_30px_rgba(40,32,20,0.1)]">
            <button type="button" data-testid="view-front" onClick={() => requestView('front')} className="rounded-xl bg-[#f3efe8] px-3 py-2 text-sm font-semibold">
              正面视图
            </button>
            <button type="button" data-testid="view-back" onClick={() => requestView('back')} className="rounded-xl bg-[#f3efe8] px-3 py-2 text-sm font-semibold">
              背面视图
            </button>
            <button type="button" data-testid="view-left" onClick={() => requestView('left')} className="rounded-xl bg-[#f3efe8] px-3 py-2 text-sm font-semibold">
              左侧视图
            </button>
            <button type="button" data-testid="view-right" onClick={() => requestView('right')} className="rounded-xl bg-[#f3efe8] px-3 py-2 text-sm font-semibold">
              右侧视图
            </button>
            <button type="button" data-testid="view-reset" onClick={() => requestView('reset')} className="rounded-xl bg-[#f3efe8] px-3 py-2 text-sm font-semibold">
              重置视角
            </button>
            <button
              type="button"
              data-testid="auto-rotate"
              aria-pressed={autoRotate}
              onClick={() => setAutoRotate(!autoRotate)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${autoRotate ? 'bg-[#1c1e21] text-white' : 'bg-[#f3efe8]'}`}
            >
              自动旋转
            </button>
            <span className="px-2 text-xs text-[#6f685e]">左键旋转 · 滚轮缩放 · 右键平移</span>
          </div>
        </div>
      </main>
      <aside className="flex min-h-0 flex-col overflow-y-auto border-t border-[#ddd7cc] bg-white xl:border-t-0 xl:border-l">
        <div className="border-b border-[#eeeae3] px-5 py-4">
          <p className="text-xs text-[#7a7368]">属性</p>
          <h2 className="text-lg font-semibold">当前图案与印刷范围</h2>
        </div>
        <section className="space-y-3 border-b border-[#eeeae3] px-5 py-4">
          <h3 className="text-sm font-semibold">{part?.label ?? '设计区域'} UV</h3>
          <p className="text-xs leading-5 text-[#5e584f]">{part?.reason ?? '模型还在解析。'}</p>
          {part ? (
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-[#5e584f]">
                U 起点
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.005}
                  value={Number(draft.u.toFixed(3))}
                  onChange={(event) => {
                    const raw = Number(event.target.value)
                    const u = Number.isNaN(raw) ? 0 : Math.min(0.99, Math.max(0, raw))
                    const v = Number.isNaN(draft.v) ? 0 : Math.min(0.99, Math.max(0, draft.v))
                    const next = {
                      u,
                      v,
                      w: Number.isNaN(draft.w) ? 0.01 : Math.min(1 - u, Math.max(0.01, draft.w)),
                      h: Number.isNaN(draft.h) ? 0.01 : Math.min(1 - v, Math.max(0.01, draft.h)),
                    }
                    setDraft(next)
                    setOverride(part.id, next)
                  }}
                  className="mt-1 w-full rounded-lg border border-[#ddd6cb] px-2 py-1.5 text-sm"
                />
              </label>
              <label className="text-xs text-[#5e584f]">
                V 起点
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.005}
                  value={Number(draft.v.toFixed(3))}
                  onChange={(event) => {
                    const raw = Number(event.target.value)
                    const u = Number.isNaN(draft.u) ? 0 : Math.min(0.99, Math.max(0, draft.u))
                    const v = Number.isNaN(raw) ? 0 : Math.min(0.99, Math.max(0, raw))
                    const next = {
                      u,
                      v,
                      w: Number.isNaN(draft.w) ? 0.01 : Math.min(1 - u, Math.max(0.01, draft.w)),
                      h: Number.isNaN(draft.h) ? 0.01 : Math.min(1 - v, Math.max(0.01, draft.h)),
                    }
                    setDraft(next)
                    setOverride(part.id, next)
                  }}
                  className="mt-1 w-full rounded-lg border border-[#ddd6cb] px-2 py-1.5 text-sm"
                />
              </label>
              <label className="text-xs text-[#5e584f]">
                宽度
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.005}
                  value={Number(draft.w.toFixed(3))}
                  onChange={(event) => {
                    const raw = Number(event.target.value)
                    const u = Number.isNaN(draft.u) ? 0 : Math.min(0.99, Math.max(0, draft.u))
                    const v = Number.isNaN(draft.v) ? 0 : Math.min(0.99, Math.max(0, draft.v))
                    const next = {
                      u,
                      v,
                      w: Number.isNaN(raw) ? 0.01 : Math.min(1 - u, Math.max(0.01, raw)),
                      h: Number.isNaN(draft.h) ? 0.01 : Math.min(1 - v, Math.max(0.01, draft.h)),
                    }
                    setDraft(next)
                    setOverride(part.id, next)
                  }}
                  className="mt-1 w-full rounded-lg border border-[#ddd6cb] px-2 py-1.5 text-sm"
                />
              </label>
              <label className="text-xs text-[#5e584f]">
                高度
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.005}
                  value={Number(draft.h.toFixed(3))}
                  onChange={(event) => {
                    const raw = Number(event.target.value)
                    const u = Number.isNaN(draft.u) ? 0 : Math.min(0.99, Math.max(0, draft.u))
                    const v = Number.isNaN(draft.v) ? 0 : Math.min(0.99, Math.max(0, draft.v))
                    const next = {
                      u,
                      v,
                      w: Number.isNaN(draft.w) ? 0.01 : Math.min(1 - u, Math.max(0.01, draft.w)),
                      h: Number.isNaN(raw) ? 0.01 : Math.min(1 - v, Math.max(0.01, raw)),
                    }
                    setDraft(next)
                    setOverride(part.id, next)
                  }}
                  className="mt-1 w-full rounded-lg border border-[#ddd6cb] px-2 py-1.5 text-sm"
                />
              </label>
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-[#ddd6cb] px-3 py-2 text-xs font-medium"
              disabled={!manual}
              onClick={() => clearOverride(activeRegion)}
            >
              恢复自动检测
            </button>
            <button
              type="button"
              className="rounded-lg border border-[#ddd6cb] px-3 py-2 text-xs font-medium"
              onClick={() => clearRegionLayers(activeRegion)}
            >
              清除此区域图案
            </button>
          </div>
        </section>
        <section className="space-y-4 px-5 py-4">
          <h3 className="text-sm font-semibold">当前选中图案</h3>
          {layer ? (
            <>
              <img
                src={layer.imageUrl}
                alt={layer.name}
                className="h-28 w-full rounded-xl bg-[repeating-conic-gradient(#e7e2d8_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] object-contain"
              />
              <label className="block text-xs font-medium text-[#5e584f]">
                所属区域
                <select
                  className="mt-1 w-full rounded-lg border border-[#ddd6cb] bg-white px-2 py-2 text-sm"
                  value={layer.region}
                  onChange={(event) => {
                    const region = event.target.value as DesignRegionId
                    updateLayer(layer.id, { region })
                    setActiveRegion(region)
                  }}
                >
                  {DESIGN_REGIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <Slider
                label="X"
                min={0}
                max={100}
                step={1}
                value={Math.round(layer.x * 100)}
                onChange={(value) => updateLayer(layer.id, { x: value / 100 })}
              />
              <Slider
                label="Y"
                min={0}
                max={100}
                step={1}
                value={Math.round(layer.y * 100)}
                onChange={(value) => updateLayer(layer.id, { y: value / 100 })}
              />
              <p className="text-xs text-[#7a7368]">X、Y 是设计区域内的位置，0 在左上，100 在右下。</p>
              <Slider
                label="缩放"
                min={8}
                max={180}
                step={1}
                value={Math.round(layer.scale * 100)}
                suffix="%"
                onChange={(value) => updateLayer(layer.id, { scale: value / 100 })}
              />
              <Slider
                label="旋转"
                min={-180}
                max={180}
                step={1}
                value={Math.round(layer.rotation)}
                suffix="°"
                onChange={(value) => updateLayer(layer.id, { rotation: value })}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  data-testid="reset-layer"
                  className="flex-1 rounded-lg border border-[#1c1e21] px-3 py-2 text-sm font-semibold"
                  onClick={() => updateLayer(layer.id, { x: 0.5, y: 0.5, rotation: 0 })}
                >
                  恢复默认位置
                </button>
                <button
                  type="button"
                  data-testid="delete-layer"
                  className="flex-1 rounded-lg bg-[#9a3412] px-3 py-2 text-sm font-semibold text-white"
                  onClick={() => removeLayer(layer.id)}
                >
                  删除图案
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-[#6f685e]">从左侧图层里选一个图案，再改位置、缩放和旋转。</p>
          )}
        </section>
      </aside>
    </div>
  )
}

/** 位置、缩放、旋转共用的滑块和数字框。 */
function Slider({
  label,
  min,
  max,
  step,
  value,
  suffix,
  onChange,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="grid grid-cols-[40px_1fr_84px] items-center gap-2 text-sm">
      <span className="text-xs font-medium text-[#5e584f]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-[#1c1e21]"
      />
      <span className="flex items-center gap-1">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-14 rounded-md border border-[#ddd6cb] px-1 py-1 text-right text-xs"
        />
        <span className="w-4 text-xs text-[#6f685e]">{suffix}</span>
      </span>
    </label>
  )
}
