import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/client.ts'
import { deleteLibraryImage, fetchLibrary, uploadLibraryImage, type LibraryImage } from '../../designer/api.ts'
import { listClothingColors, listClothingStyles, type ClothingColor, type ClothingStyle } from '../../designer/catalog.ts'
import { getDesign, saveDesign } from '../../designer/design.ts'
import { useEditorStore } from '../../designer/store.ts'
import { DESIGN_REGIONS, GARMENT_SIDES, styleRegions } from '../../designer/types.ts'
import { GarmentBoard } from './board.tsx'

const quiet = 'rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium text-[#111827]'

/** 左选项、右预览：颜色和图案在左边，衣服大图在右边。 */
export function EditorLayout() {
  const patternInput = useRef<HTMLInputElement>(null)
  const savedId = useRef<string | null>(null)
  const libraryTouched = useRef(false)
  const [styles, setStyles] = useState<ClothingStyle[]>([])
  const [colors, setColors] = useState<ClothingColor[]>([])
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [library, setLibrary] = useState<LibraryImage[]>([])
  const [libraryTotal, setLibraryTotal] = useState(0)
  const [libraryPage, setLibraryPage] = useState(0)
  const [libraryPages, setLibraryPages] = useState(0)
  const [libraryReady, setLibraryReady] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { designId } = useParams()
  const navigate = useNavigate()
  const garmentColor = useEditorStore((state) => state.garmentColor)
  const setGarmentColor = useEditorStore((state) => state.setGarmentColor)
  const garmentStyle = useEditorStore((state) => state.garmentStyle)
  const setGarmentStyle = useEditorStore((state) => state.setGarmentStyle)
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
  const colorLabel = colors.find((item) => item.hex_code.toLowerCase() === garmentColor.toLowerCase())?.name ?? '自定义'
  const styleLabel = styles.find((item) => item.code === garmentStyle)?.name ?? '衣服'
  const allowedRegions = styleRegions(garmentStyle)
  const sideLabel = GARMENT_SIDES.find((item) => item.id === side)?.label ?? '正面'
  const textColorLabel = colors.find((item) => item.hex_code.toLowerCase() === (layer?.textColor ?? '').toLowerCase())?.name ?? '自定义'

  useEffect(() => {
    if (!designId || savedId.current === designId) return
    const draft = getDesign(designId)
    if (!draft?.saved) return
    savedId.current = designId
    applyDesign(draft.saved)
  }, [applyDesign, designId])

  useEffect(() => {
    let gone = false

    // 向服务器要款式和颜色。没有打开旧设计时，选中项不在列表里就改用第一项。

    void Promise.all([listClothingStyles(), listClothingColors()])
      .then(([styleRows, colorRows]) => {
        if (gone) return
        const nextStyles = Array.isArray(styleRows) ? styleRows : []
        const nextColors = Array.isArray(colorRows) ? colorRows : []
        setStyles(nextStyles)
        setColors(nextColors)
        setCatalogError(null)
        if (designId && getDesign(designId)?.saved) return
        const state = useEditorStore.getState()
        const styleKnown = nextStyles.some((item) => item.code === state.garmentStyle)
        const colorKnown = nextColors.some((item) => item.hex_code.toLowerCase() === state.garmentColor.toLowerCase())
        if (styleKnown && colorKnown) return
        useEditorStore.setState({
          garmentStyle: styleKnown ? state.garmentStyle : (nextStyles[0]?.code ?? state.garmentStyle),
          garmentColor: colorKnown ? state.garmentColor : (nextColors[0]?.hex_code ?? state.garmentColor),
        })
      })
      .catch((error: unknown) => {
        if (gone) return
        setCatalogError(getErrorMessage(error))
      })

    return () => {
      gone = true
    }
  }, [designId])

  useEffect(() => {
    let gone = false

    // 打开设计器时读取当前用户图库的第一页。

    void fetchLibrary({ page: 1 })
      .then((page) => {
        if (gone || libraryTouched.current) return
        const list = Array.isArray(page?.list) ? page.list : []
        setLibrary(list)
        setLibraryTotal(typeof page?.total === 'number' ? page.total : list.length)
        setLibraryPage(typeof page?.page === 'number' ? page.page : 1)
        setLibraryPages(typeof page?.total_pages === 'number' ? page.total_pages : 1)
        setLibraryReady(true)
      })
      .catch((error: unknown) => {
        if (gone) return
        setLibraryReady(true)
        setNotice(getErrorMessage(error))
      })

    return () => {
      gone = true
    }
  }, [setNotice])

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
            {catalogError ? <p className="text-sm text-[#9a3412]">{catalogError}</p> : null}
            {styles.length === 0 && !catalogError ? <p className="text-sm text-[#6b7280]">正在加载款式。</p> : null}
            <div className="grid grid-cols-3 gap-2">
              {styles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGarmentStyle(item.code)}
                  className={`rounded-lg px-2 py-3 text-sm ${garmentStyle === item.code ? 'border-2 border-[#111827] font-semibold' : 'border border-[#e5e7eb] text-[#6b7280]'}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </section>

          <section className="border-b border-[#f0f1f4] px-6 py-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-[#111827]">衣服颜色</h2>
              <span className="text-sm text-[#6b7280]">{colorLabel}</span>
            </div>
            {colors.length === 0 && !catalogError ? <p className="text-sm text-[#6b7280]">正在加载颜色。</p> : null}
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  aria-label={color.name}
                  className={`h-9 w-9 rounded-full border border-[#e5e7eb] ${garmentColor.toLowerCase() === color.hex_code.toLowerCase() ? 'ring-2 ring-[#111827] ring-offset-2' : ''}`}
                  style={{ background: color.hex_code }}
                  onClick={() => setGarmentColor(color.hex_code)}
                />
              ))}
            </div>
          </section>

          <section className="border-b border-[#f0f1f4] px-6 py-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-[#111827]">我的图库</h2>
              <span className="text-sm text-[#6b7280]">{libraryReady ? (libraryTotal ? `${libraryTotal} 张` : '空') : '正在加载'}</span>
            </div>
            <button type="button" className={`${quiet} w-full disabled:opacity-60`} disabled={uploading} onClick={() => patternInput.current?.click()}>
              {uploading ? '正在上传' : '上传图片'}
            </button>
            <input
              ref={patternInput}
              className="hidden"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                // 读出选中的文件，并清空输入，方便再次选同一张。

                const file = event.target.files?.[0]
                event.target.value = ''
                if (!file) return

                // 类型和大小先在页面上拦住，文案和接口一致。

                const allowed = ['image/png', 'image/jpeg', 'image/webp']
                if (!allowed.includes(file.type)) {
                  setNotice('请上传 PNG、JPG 或 WebP 图片。')
                  return
                }
                if (file.size === 0) {
                  setNotice('请选择图片。')
                  return
                }
                if (file.size > 8 * 1024 * 1024) {
                  setNotice('图片不能超过 8MB。')
                  return
                }

                // 上传到当前用户的图库，成功后插到列表最前面。

                setUploading(true)
                libraryTouched.current = true
                void uploadLibraryImage(file)
                  .then((image) => {
                    setLibrary((current) => [image, ...current.filter((item) => item.id !== image.id)])
                    setLibraryTotal((total) => total + 1)
                    setLibraryReady(true)
                    setNotice(null)
                  })
                  .catch((error: unknown) => setNotice(getErrorMessage(error)))
                  .finally(() => setUploading(false))
              }}
            />
            {library.length ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {library.map((item) => (
                  <div key={item.id} className="group relative">
                    <button type="button" className="block w-full overflow-hidden rounded-lg border border-[#e5e7eb]" aria-label={item.name} onClick={() => addLayer({ kind: 'image', name: item.name, imageUrl: item.url, region: activeRegion })}>
                      <img src={item.url} alt="" className="aspect-square w-full object-cover" />
                    </button>
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-[#6b7280] disabled:opacity-60"
                      disabled={deletingId === item.id}
                      onClick={() => {
                        // 只从用户图库去掉这一张，衣服上已经贴好的图层不动。

                        setDeletingId(item.id)
                        libraryTouched.current = true
                        void deleteLibraryImage(item.id)
                          .then(() => {
                            setLibrary((current) => current.filter((image) => image.id !== item.id))
                            setLibraryTotal((total) => Math.max(0, total - 1))
                          })
                          .catch((error: unknown) => setNotice(getErrorMessage(error)))
                          .finally(() => setDeletingId((current) => (current === item.id ? null : current)))
                      }}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#6b7280]">{libraryReady ? '上传后点图片，贴到当前区域。' : '正在加载图库。'}</p>
            )}
            {libraryPage < libraryPages ? (
              <button
                type="button"
                className={`${quiet} mt-3 w-full`}
                onClick={() => {
                  const next = libraryPage + 1

                  // 下一页接到当前列表后面。

                  libraryTouched.current = true
                  void fetchLibrary({ page: next })
                    .then((page) => {
                      const list = Array.isArray(page?.list) ? page.list : []
                      setLibrary((current) => {
                        const seen = new Set(current.map((image) => image.id))
                        return [...current, ...list.filter((image) => !seen.has(image.id))]
                      })
                      setLibraryPage(typeof page?.page === 'number' ? page.page : next)
                      setLibraryPages(typeof page?.total_pages === 'number' ? page.total_pages : libraryPages)
                      if (typeof page?.total === 'number') setLibraryTotal(page.total)
                    })
                    .catch((error: unknown) => setNotice(getErrorMessage(error)))
                }}
              >
                加载更多
              </button>
            ) : null}
          </section>

          {layer?.kind === 'text' ? (
            <section className="border-b border-[#f0f1f4] px-6 py-6">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-[#111827]">文字颜色</h2>
                <span className="text-sm text-[#6b7280]">{textColorLabel}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    aria-label={color.name}
                    className={`h-9 w-9 rounded-full border border-[#e5e7eb] ${(layer.textColor ?? '').toLowerCase() === color.hex_code.toLowerCase() ? 'ring-2 ring-[#111827] ring-offset-2' : ''}`}
                    style={{ background: color.hex_code }}
                    onClick={() => updateLayer(layer.id, { textColor: color.hex_code }, true)}
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
                {DESIGN_REGIONS.filter((region) => allowedRegions.includes(region.id)).map((region) => {
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
