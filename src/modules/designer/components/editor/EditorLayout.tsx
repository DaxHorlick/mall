import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GarmentBoard } from './GarmentBoard.tsx'
import { getDesign, saveDesign } from '../../services/design.ts'
import { useEditorStore } from '../../stores/editorStore.ts'
import { readLibraryImage } from '../../utils/loadImage.ts'
import { DESIGN_REGIONS, GARMENT_COLORS, GARMENT_SIDES, GARMENT_STYLES } from '../../types/index.ts'

const quiet = 'rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium text-[#111827]'

/** 左选项、右预览：颜色和图案在左边，衣服大图在右边。 */
export function EditorLayout() {
  const patternInput = useRef<HTMLInputElement>(null)
  const savedId = useRef<string | null>(null)
  const { designId } = useParams()
  const navigate = useNavigate()
  const garmentColor = useEditorStore((state) => state.garmentColor)
  const setGarmentColor = useEditorStore((state) => state.setGarmentColor)
  const garmentStyle = useEditorStore((state) => state.garmentStyle)
  const setGarmentStyle = useEditorStore((state) => state.setGarmentStyle)
  const library = useEditorStore((state) => state.library)
  const addToLibrary = useEditorStore((state) => state.addToLibrary)
  const removeFromLibrary = useEditorStore((state) => state.removeFromLibrary)
  const side = useEditorStore((state) => state.side)
  const setSide = useEditorStore((state) => state.setSide)
  const activeRegion = useEditorStore((state) => state.activeRegion)
  const setActiveRegion = useEditorStore((state) => state.setActiveRegion)
  const notice = useEditorStore((state) => state.notice)
  const setNotice = useEditorStore((state) => state.setNotice)
  const addLayer = useEditorStore((state) => state.addLayer)
  const layers = useEditorStore((state) => state.layers)
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId)
  const selectLayer = useEditorStore((state) => state.selectLayer)
  const updateLayer = useEditorStore((state) => state.updateLayer)
  const moveLayer = useEditorStore((state) => state.moveLayer)
  const removeLayer = useEditorStore((state) => state.removeLayer)
  const remember = useEditorStore((state) => state.remember)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const applyDesign = useEditorStore((state) => state.applyDesign)
  const canUndo = useEditorStore((state) => state.past.length > 0)
  const canRedo = useEditorStore((state) => state.future.length > 0)
  const sideLayers = layers.filter((layer) => layer.side === side)
  const layer = layers.find((item) => item.id === selectedLayerId && item.side === side) ?? null
  const colorLabel = GARMENT_COLORS.find((item) => item.value === garmentColor)?.label ?? '自定义'
  const styleLabel = GARMENT_STYLES.find((item) => item.id === garmentStyle)?.label ?? '短袖 T 恤'
  const styleRegions = GARMENT_STYLES.find((item) => item.id === garmentStyle)?.regions ?? ['body']
  const sideLabel = GARMENT_SIDES.find((item) => item.id === side)?.label ?? '正面'
  const textColorLabel = GARMENT_COLORS.find((item) => item.value === layer?.textColor)?.label ?? '自定义'

  useEffect(() => {
    if (!designId || savedId.current === designId) return
    const draft = getDesign(designId)
    if (!draft?.saved) return
    savedId.current = designId
    applyDesign(draft.saved)
  }, [applyDesign, designId])

  return (
    <div className="flex h-full min-h-0 bg-[#eef0f3] p-3 md:p-5">
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-[#e6e8ee] bg-white lg:flex-row">
        <aside className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto border-[#eceef2] lg:w-[clamp(280px,34vw,380px)] lg:flex-none lg:border-r">
          {notice ? (
            <div className="mx-6 mt-5 flex items-start justify-between gap-3 rounded-lg bg-[#fff4e8] px-3 py-2 text-xs leading-5 text-[#9a3412]">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice(null)}>
                关闭
              </button>
            </div>
          ) : null}

          <section className="border-b border-[#f0f1f4] px-6 py-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-[#111827]">衣服款式</h2>
              <span className="text-sm text-[#6b7280]">{styleLabel}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {GARMENT_STYLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGarmentStyle(item.id)}
                  className={`rounded-lg px-2 py-3 text-sm ${garmentStyle === item.id ? 'border-2 border-[#111827] font-semibold' : 'border border-[#e5e7eb] text-[#6b7280]'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="border-b border-[#f0f1f4] px-6 py-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-[#111827]">衣服颜色</h2>
              <span className="text-sm text-[#6b7280]">{colorLabel}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {GARMENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  aria-label={color.label}
                  className={`h-9 w-9 rounded-full border border-[#e5e7eb] ${garmentColor === color.value ? 'ring-2 ring-[#111827] ring-offset-2' : ''}`}
                  style={{ background: color.value }}
                  onClick={() => setGarmentColor(color.value)}
                />
              ))}
            </div>
          </section>

          <section className="border-b border-[#f0f1f4] px-6 py-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-[#111827]">我的图库</h2>
              <span className="text-sm text-[#6b7280]">{library.length ? `${library.length} 张` : '空'}</span>
            </div>
            <button type="button" className={`${quiet} w-full`} onClick={() => patternInput.current?.click()}>
              上传图片
            </button>
            <input
              ref={patternInput}
              className="hidden"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (!file) return
                const allowed = ['image/png', 'image/jpeg', 'image/webp']
                if (!allowed.includes(file.type)) {
                  setNotice('请上传 PNG、JPG 或 WebP 图片。')
                  return
                }

                void readLibraryImage(file)
                  .then((url) => addToLibrary({ id: crypto.randomUUID(), name: file.name, url }))
                  .catch(() => setNotice('图片读取失败。'))
              }}
            />
            {library.length ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {library.map((item) => (
                  <div key={item.id} className="group relative">
                    <button type="button" className="block w-full overflow-hidden rounded-lg border border-[#e5e7eb]" aria-label={item.name} onClick={() => addLayer({ kind: 'image', name: item.name, imageUrl: item.url, region: activeRegion })}>
                      <img src={item.url} alt="" className="aspect-square w-full object-cover" />
                    </button>
                    <button type="button" className="absolute right-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-[#6b7280]" onClick={() => removeFromLibrary(item.id)}>
                      删除
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#6b7280]">上传后点图片，贴到当前区域。图片保存在这台浏览器里。</p>
            )}
          </section>

          {layer?.kind === 'text' ? (
            <section className="border-b border-[#f0f1f4] px-6 py-6">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-[#111827]">文字颜色</h2>
                <span className="text-sm text-[#6b7280]">{textColorLabel}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {GARMENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    aria-label={color.label}
                    className={`h-9 w-9 rounded-full border border-[#e5e7eb] ${layer.textColor === color.value ? 'ring-2 ring-[#111827] ring-offset-2' : ''}`}
                    style={{ background: color.value }}
                    onClick={() => updateLayer(layer.id, { textColor: color.value }, true)}
                  />
                ))}
              </div>
              <label className="mt-4 block text-xs font-medium text-[#6b7280]">
                文字内容
                <input
                  className="mt-1 w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827]"
                  value={layer.text ?? ''}
                  maxLength={24}
                  onFocus={remember}
                  onChange={(event) => updateLayer(layer.id, { text: event.target.value, name: event.target.value || '文字' })}
                />
              </label>
            </section>
          ) : null}

          <section className="border-b border-[#f0f1f4] px-6 py-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-[#111827]">图层</h2>
              <span className="text-sm text-[#6b7280]">{sideLabel}</span>
            </div>
            {sideLayers.length ? (
              <ul className="space-y-2">
                {sideLayers.map((item, index) => {
                  const selected = item.id === selectedLayerId
                  const itemRegion = DESIGN_REGIONS.find((region) => region.id === item.region)?.label ?? item.region
                  return (
                    <li key={item.id}>
                      <div className={`rounded-xl border p-2 ${selected ? 'border-[#111827]' : 'border-[#e5e7eb]'}`}>
                        <button type="button" className="flex w-full items-center gap-2 text-left" onClick={() => selectLayer(item.id)}>
                          {item.kind === 'image' && item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-md object-contain" />
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f3f4f6] text-sm font-semibold">文</span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{item.name}</span>
                            <span className="text-xs text-[#6b7280]">{itemRegion}</span>
                          </span>
                        </button>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <button type="button" className={quiet} onClick={() => updateLayer(item.id, { visible: !item.visible }, true)}>
                            {item.visible ? '隐藏' : '显示'}
                          </button>
                          <button type="button" className={quiet} onClick={() => moveLayer(item.id, 1)} disabled={index === sideLayers.length - 1}>
                            置于上层
                          </button>
                          <button type="button" className={quiet} onClick={() => moveLayer(item.id, -1)} disabled={index === 0}>
                            置于下层
                          </button>
                          <button type="button" className={quiet} onClick={() => removeLayer(item.id)}>
                            删除
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-[#6b7280]">这一面还没有图案。</p>
            )}
          </section>

          {layer ? (
            <section className="px-6 py-6">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-[#111827]">位置和大小</h2>
                <span className="truncate text-sm text-[#6b7280]">{layer.name}</span>
              </div>
              <div className="space-y-3">
                <Slider label="X" min={0} max={100} value={Math.round(layer.x * 100)} onStart={remember} onChange={(value) => updateLayer(layer.id, { x: value / 100 })} />
                <Slider label="Y" min={0} max={100} value={Math.round(layer.y * 100)} onStart={remember} onChange={(value) => updateLayer(layer.id, { y: value / 100 })} />
                <Slider label="缩放" min={20} max={220} value={Math.round(layer.scale * 100)} suffix="%" onStart={remember} onChange={(value) => updateLayer(layer.id, { scale: value / 100 })} />
                <Slider label="旋转" min={-180} max={180} value={Math.round(layer.rotation)} suffix="°" onStart={remember} onChange={(value) => updateLayer(layer.id, { rotation: value })} />
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" className="flex-1 rounded-lg border border-[#111827] px-3 py-2 text-sm font-semibold" onClick={() => updateLayer(layer.id, { x: 0.5, y: 0.42, rotation: 0 }, true)}>
                  恢复默认位置
                </button>
                <button type="button" className="flex-1 rounded-lg bg-[#9a3412] px-3 py-2 text-sm font-semibold text-white" onClick={() => removeLayer(layer.id)}>
                  删除图案
                </button>
              </div>
            </section>
          ) : null}
        </aside>

        <main className="order-first flex min-h-[42%] min-w-0 w-full flex-col lg:order-none lg:min-h-0 lg:flex-1">
          <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 px-3 pt-3 sm:px-4 sm:pt-4">
            <div className="flex items-center gap-1">
              <button type="button" aria-label="撤销" disabled={!canUndo} onClick={undo} className="flex h-9 w-9 items-center justify-center rounded-full text-[#6b7280]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 14 4 9l5-5" />
                  <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
                </svg>
              </button>
              <button type="button" aria-label="重做" disabled={!canRedo} onClick={redo} className="flex h-9 w-9 items-center justify-center rounded-full text-[#6b7280]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m15 14 5-5-5-5" />
                  <path d="M20 9H10a6 6 0 0 0 0 12h3" />
                </svg>
              </button>
            </div>
            <div className="flex gap-1 rounded-xl bg-white/95 p-1 shadow-[0_8px_24px_rgba(17,24,39,0.08)]">
                {GARMENT_SIDES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSide(item.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm ${side === item.id ? 'bg-[#111827] font-semibold text-white' : 'text-[#374151]'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 rounded-xl bg-white/95 p-1 shadow-[0_8px_24px_rgba(17,24,39,0.08)]">
                {DESIGN_REGIONS.filter((region) => styleRegions.includes(region.id)).map((region) => {
                  const selected = (layer?.region ?? activeRegion) === region.id
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => {
                        setActiveRegion(region.id)
                        if (layer) updateLayer(layer.id, { region: region.id }, true)
                      }}
                      className={`rounded-lg px-3 py-1.5 text-sm ${selected ? 'bg-[#111827] font-semibold text-white' : 'text-[#374151]'}`}
                    >
                      {region.label}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                className="h-10 rounded-lg bg-[#2563eb] px-4 text-sm font-medium text-white"
                onClick={() => {
                  try {
                    const draft = saveDesign({
                      id: designId,
                      title: styleLabel,
                      saved: { layers, garmentColor, garmentStyle },
                    })
                    savedId.current = draft.id
                    if (draft.id !== designId) navigate(`/designer/${draft.id}`, { replace: true })
                    setNotice('已保存为设计。')
                  } catch {
                    setNotice('设计没有保存下来，图片可能太大。')
                  }
                }}
              >
                保存为设计
              </button>
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden px-3 py-3 sm:px-4">
            <GarmentBoard />
          </div>
        </main>
      </div>
    </div>
  )
}

/** 位置、缩放、旋转共用的滑块。按下时记一笔撤销。 */
function Slider({
  label,
  min,
  max,
  value,
  suffix,
  onStart,
  onChange,
}: {
  label: string
  min: number
  max: number
  value: number
  suffix?: string
  onStart: () => void
  onChange: (value: number) => void
}) {
  return (
    <label className="grid grid-cols-[40px_1fr_84px] items-center gap-2 text-sm">
      <span className="text-xs font-medium text-[#6b7280]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onPointerDown={onStart}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-[#111827]"
      />
      <span className="flex items-center gap-1">
        <input
          type="number"
          min={min}
          max={max}
          step={1}
          value={value}
          onFocus={onStart}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-14 rounded-md border border-[#e5e7eb] px-1 py-1 text-right text-xs"
        />
        <span className="w-4 text-xs text-[#6b7280]">{suffix}</span>
      </span>
    </label>
  )
}
