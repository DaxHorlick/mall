import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect } from 'react'
import { ACESFilmicToneMapping } from 'three'
import { shownDesignTitle, useCopy } from '../../../i18n/index.ts'
import { products } from '../../../shop/products.ts'
import { useShop } from '../../../shop/store.ts'
import { ModelRoot } from '../components/three/ModelRoot.tsx'
import { useEditorStore } from '../stores/editorStore.ts'
import { CAMERA_FOV, DEFAULT_MODEL_NAME, DEFAULT_MODEL_URL } from '../types/index.ts'

const garments: Record<string, { url: string; name: string }> = {
  'a-little-outside-the-lines': { url: DEFAULT_MODEL_URL, name: DEFAULT_MODEL_NAME },
  'stay-a-little-wild': { url: DEFAULT_MODEL_URL, name: DEFAULT_MODEL_NAME },
  // 卫衣的 glb 还没放进 public/models，先用 T 恤，补上文件后改这里的地址
  'less-noise-more-space': { url: DEFAULT_MODEL_URL, name: DEFAULT_MODEL_NAME },
}

useGLTF.preload(DEFAULT_MODEL_URL)

export function DesignerPage() {
  const copy = useCopy()

  // 工作室里选中的款式决定用哪一件衣服

  const slug = useShop((state) => state.studioSlug)
  const studioTitle = useShop((state) => state.studioTitle)
  const garment = garments[slug] ?? garments['a-little-outside-the-lines']
  const design = products.find((item) => item.slug === slug)
  const layers = useEditorStore((state) => state.layers)

  // 换款式就换模型，已经贴上的图案留着

  useEffect(() => {
    useEditorStore.getState().setGarment(garment.url, garment.name)
  }, [garment.url, garment.name])

  const modelUrl = useEditorStore((state) => state.modelUrl)

  // 左边半屏只放衣服，右边是当前设计和已上传的图案

  return (
    <section className="flex flex-col gap-8 px-5 py-8 md:flex-row md:px-14">
      <div className="h-[calc(100dvh-10rem)] w-full overflow-hidden bg-[#d9d4cc] md:w-1/2">
        <Canvas
          className="h-full w-full"
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
          <ModelRoot key={modelUrl} url={modelUrl} />
          <OrbitControls makeDefault enablePan={false} enableZoom={false} enableRotate enableDamping dampingFactor={0.08} />
        </Canvas>
      </div>
      <aside className="flex w-full flex-col gap-10 md:h-[calc(100dvh-10rem)] md:w-1/2 md:overflow-y-auto">
        <div>
          <p className="text-xs font-bold">{copy.editor.design}</p>
          {design ? (
            <img src={design.image} alt="" className="mt-4 aspect-square w-full max-w-sm rounded-[10px] object-cover" />
          ) : null}
          <p className="mt-4 text-2xl font-bold">{shownDesignTitle(slug, studioTitle)}</p>
        </div>
        <div>
          <p className="text-xs font-bold">{copy.editor.pattern}</p>
          <label className="mt-4 inline-flex h-11 cursor-pointer items-center rounded-lg bg-[#191919] px-4 text-sm font-semibold text-[#f7f6f0]">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (!file) return
                useEditorStore.getState().addLayer({ name: file.name, imageUrl: URL.createObjectURL(file) })
              }}
            />
            {copy.editor.upload}
          </label>
          {layers.length ? (
            <ul className="mt-4 grid grid-cols-2 gap-4">
              {layers.map((layer) => (
                <li key={layer.id}>
                  <img src={layer.imageUrl} alt="" className="aspect-square w-full rounded-[10px] bg-white object-contain" />
                  <p className="mt-2 truncate text-sm">{layer.name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[#696b61]">{copy.editor.empty}</p>
          )}
        </div>
      </aside>
    </section>
  )
}
