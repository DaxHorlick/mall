import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Vector3, type PerspectiveCamera } from 'three'
import { CAMERA_FOV, type ViewId } from '../../types'
import { applyOverrides, useEditorStore } from '../../stores/editorStore'
import { frameFromObject, inspectScene } from '../../utils/inspectModel'
import { modelPreview } from '../../utils/modelPreview'
import { applyIsolation, cloneScene } from '../../utils/scene'
import { createPrintSession, paintSession, type PrintSession } from './TextureManager'

const VIEW_OFFSET: Record<ViewId, [number, number, number]> = {
  front: [0, 0.08, 1],
  back: [0, 0.08, -1],
  left: [-1.05, 0.16, 0.28],
  right: [1.05, 0.16, 0.28],
  reset: [0.48, 0.22, 0.9],
}

/** 模型出错时卸掉画布内容，避免错误边界反复抛。 */
export class ModelRoot extends Component<{ url: string }, { failed: boolean }> {
  state = { failed: false }

  /** 一旦子树抛错，就停在失败状态，不再尝试渲染这件衣服。 */
  static getDerivedStateFromError() {
    return { failed: true }
  }

  /** 把加载或渲染失败写进状态栏，画布里不再留半截模型。 */
  componentDidCatch(error: Error) {
    useEditorStore.getState().setModelError(`模型加载失败：${error.message || '模型加载失败'}`)
  }

  /** 失败后留空，正常时等 GLB 解析完再挂上衣服。 */
  render() {
    if (this.state.failed) return null
    return (
      <Suspense fallback={null}>
        <Garment url={this.props.url} />
      </Suspense>
    )
  }
}

/** 克隆 GLB、检查 UV、把图案画进材质，并按视角按钮摆相机。 */
function Garment({ url }: { url: string }) {
  const gltf = useGLTF(url)
  const fileName = useEditorStore((state) => state.modelName)
  const prepared = useMemo(() => {
    const scene = cloneScene(gltf.scene)
    const frame = frameFromObject(scene, CAMERA_FOV)
    const inspected = inspectScene(scene, fileName)
    return { scene, frame, inspected }
  }, [gltf.scene, fileName])

  useLayoutEffect(() => {
    modelPreview.albedoUrl = prepared.inspected.albedoUrl
    modelPreview.edges = prepared.inspected.edges
    modelPreview.clouds = prepared.inspected.clouds
    useEditorStore.getState().setInspection(prepared.inspected.report, prepared.frame)
  }, [prepared])

  const sessionRef = useRef<PrintSession | null>(null)
  const [session, setSession] = useState<PrintSession | null>(null)
  useLayoutEffect(() => {
    const next = createPrintSession(prepared.scene)
    sessionRef.current = next
    setSession(next)
    return () => {
      next.dispose()
      if (sessionRef.current === next) sessionRef.current = null
    }
  }, [prepared.scene])

  const isolateGarment = useEditorStore((state) => state.isolateGarment)
  useLayoutEffect(() => {
    applyIsolation(
      prepared.scene,
      prepared.inspected.isolated,
      isolateGarment && prepared.inspected.report.canIsolate,
    )
  }, [prepared, isolateGarment])

  const layers = useEditorStore((state) => state.layers)
  const overrides = useEditorStore((state) => state.overrides)
  const showRegions = useEditorStore((state) => state.showRegions)
  const gl = useThree((state) => state.gl)
  const paintToken = useRef(0)

  useEffect(() => {
    const token = paintToken.current + 1
    paintToken.current = token
    const parts = applyOverrides(prepared.inspected.report.parts, overrides)
    let cancelled = false
    if (!session) return
    void paintSession(session, parts, layers, showRegions, gl.capabilities.getMaxAnisotropy()).then((message) => {
      if (!cancelled && paintToken.current === token) useEditorStore.getState().setPrintMessage(message)
    })
    return () => {
      cancelled = true
    }
  }, [session, prepared, layers, overrides, showRegions, gl])

  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const controls = useThree((state) => state.controls) as {
    target: { set: (x: number, y: number, z: number) => void }
    update: () => void
  } | null
  const view = useEditorStore((state) => state.view)
  const frame = useEditorStore((state) => state.frame)

  // 平铺衣服的薄轴是高度，立着的衣服薄轴是厚度，相机朝向跟这个轴走。
  useEffect(() => {
    if (!frame || !controls) return
    const distance = frame.distance
    const facing = new Vector3()
    facing.setComponent(frame.facingAxis, frame.facingSign)
    const upHint = frame.pose === 'flat' ? new Vector3(0, 0, -1) : new Vector3(0, 1, 0)
    if (Math.abs(upHint.dot(facing)) > 0.9) upHint.set(0, 0, facing.y === 0 ? 1 : -1)
    const right = new Vector3().crossVectors(upHint, facing).normalize()
    const up = new Vector3().crossVectors(facing, right).normalize()
    const [rightAmount, upAmount, frontAmount] = VIEW_OFFSET[view.id]
    camera.up.copy(up)
    camera.position
      .copy(right)
      .multiplyScalar(rightAmount * distance)
      .addScaledVector(up, upAmount * distance)
      .addScaledVector(facing, frontAmount * distance)
    controls.target.set(0, 0, 0)
    camera.lookAt(0, 0, 0)
    controls.update()
  }, [camera, controls, frame, view])

  return <primitive object={prepared.scene} />
}
