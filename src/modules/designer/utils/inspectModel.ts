import {
  Box3,
  BufferGeometry,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector2,
  Vector3,
} from 'three'
import type { FrameInfo, MeshInfo, ModelReport } from '../types'
import { buildDesignRegions, type TriangleSample } from './uvRegions'

export type InspectResult = {
  report: ModelReport
  isolated: Record<string, Uint32Array>
  albedoUrl: string | null
  edges: Float32Array
  clouds: InspectClouds
}

type InspectClouds = ReturnType<typeof buildDesignRegions>['clouds']

const EXPECTED_PARTS = ['Body_Front', 'Body_Back', 'Sleeve_Left', 'Sleeve_Right', 'Collar']

/** 读取真实 Mesh、材质和 UV。文件里没有的部件名称不会被当成存在。 */
export function inspectScene(root: Object3D, fileName: string): InspectResult {
  root.updateMatrixWorld(true)
  const meshes: MeshInfo[] = []
  const samples: TriangleSample[] = []
  const edgePairs: number[] = []
  const meshNames = new Map<string, string>()
  const albedoPreview: { canvas: HTMLCanvasElement | null } = { canvas: null }
  let albedoScore = 0
  let doubleSided = false
  let multiGroup = false

  const positionA = new Vector3()
  const positionB = new Vector3()
  const positionC = new Vector3()
  const normalA = new Vector3()
  const normalB = new Vector3()
  const normalC = new Vector3()
  const uvA = new Vector2()
  const uvB = new Vector2()
  const uvC = new Vector2()
  const centroid = new Vector3()
  const normal = new Vector3()

  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    const geometry = mesh.geometry as BufferGeometry
    const id = String(mesh.userData.editorMeshId ?? mesh.uuid)
    const name = mesh.name || '未命名 Mesh'
    meshNames.set(id, name)
    const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).filter(
      (material): material is MeshStandardMaterial =>
        (material as MeshStandardMaterial).isMeshStandardMaterial === true,
    )
    if (!materials.length) return
    doubleSided = doubleSided || materials.some((material) => material.side === DoubleSide)
    if (geometry.groups.length > 1) multiGroup = true

    const position = geometry.getAttribute('position')
    const uv = geometry.getAttribute('uv')
    const normals = geometry.getAttribute('normal')
    const index = geometry.getIndex()
    const triangleCount = index ? index.count / 3 : position.count / 3
    let uMin = Infinity
    let vMin = Infinity
    let uMax = -Infinity
    let vMax = -Infinity
    if (uv) {
      for (let vertex = 0; vertex < uv.count; vertex += 1) {
        const u = uv.getX(vertex)
        const v = uv.getY(vertex)
        uMin = Math.min(uMin, u)
        vMin = Math.min(vMin, v)
        uMax = Math.max(uMax, u)
        vMax = Math.max(vMax, v)
      }
    }
    const hasUv = Boolean(uv) && uMax - uMin > 0.02 && vMax - vMin > 0.02
    meshes.push({
      id,
      name,
      materialName: materials.map((material) => material.name || '未命名材质').join('、'),
      vertexCount: position.count,
      triangleCount,
      attributes: Object.keys(geometry.attributes).map((attribute) =>
        attribute === 'uv' ? 'uv（glTF TEXCOORD_0）' : attribute,
      ),
      hasUv,
      uvBounds: hasUv ? { uMin, vMin, uMax, vMax } : null,
      doubleSided: materials.some((material) => material.side === DoubleSide),
      hasBaseMap: materials.some((material) => Boolean(material.map)),
    })
    if (!hasUv || !normals || !uv) return

    const images = materials.map((material) => {
      const source = material.map?.image as CanvasImageSource | undefined
      if (!source) return null
      let width = 0
      let height = 0
      if (source instanceof HTMLImageElement) {
        width = source.naturalWidth
        height = source.naturalHeight
      } else if (source instanceof HTMLVideoElement) {
        width = source.videoWidth
        height = source.videoHeight
      } else if (source instanceof HTMLCanvasElement || source instanceof ImageBitmap) {
        width = source.width
        height = source.height
      } else if (typeof OffscreenCanvas !== 'undefined' && source instanceof OffscreenCanvas) {
        width = source.width
        height = source.height
      } else if (typeof VideoFrame !== 'undefined' && source instanceof VideoFrame) {
        width = source.displayWidth
        height = source.displayHeight
      }
      if (!width || !height) return null
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const imageContext = canvas.getContext('2d', { willReadFrequently: true })
      if (!imageContext) return null
      imageContext.drawImage(source, 0, 0, width, height)
      return { image: imageContext.getImageData(0, 0, width, height), canvas }
    })
    const candidate = images.find((image) => image?.canvas)
    if (candidate && candidate.image.width > albedoScore) {
      albedoScore = candidate.image.width
      albedoPreview.canvas = candidate.canvas
    }

    const groups = geometry.groups.length
      ? geometry.groups
      : [{ start: 0, count: index ? index.count : position.count, materialIndex: 0 }]

    for (const group of groups) {
      const image = images[group.materialIndex ?? 0]?.image ?? null
      const groupEnd = group.start + group.count
      for (let cursor = group.start; cursor + 2 < groupEnd; cursor += 3) {
        const ia = index ? index.getX(cursor) : cursor
        const ib = index ? index.getX(cursor + 1) : cursor + 1
        const ic = index ? index.getX(cursor + 2) : cursor + 2
        positionA.set(position.getX(ia), position.getY(ia), position.getZ(ia)).applyMatrix4(mesh.matrixWorld)
        positionB.set(position.getX(ib), position.getY(ib), position.getZ(ib)).applyMatrix4(mesh.matrixWorld)
        positionC.set(position.getX(ic), position.getY(ic), position.getZ(ic)).applyMatrix4(mesh.matrixWorld)
        normalA.set(normals.getX(ia), normals.getY(ia), normals.getZ(ia)).transformDirection(mesh.matrixWorld)
        normalB.set(normals.getX(ib), normals.getY(ib), normals.getZ(ib)).transformDirection(mesh.matrixWorld)
        normalC.set(normals.getX(ic), normals.getY(ic), normals.getZ(ic)).transformDirection(mesh.matrixWorld)
        uvA.set(uv.getX(ia), uv.getY(ia))
        uvB.set(uv.getX(ib), uv.getY(ib))
        uvC.set(uv.getX(ic), uv.getY(ic))
        centroid.copy(positionA).add(positionB).add(positionC).multiplyScalar(1 / 3)
        normal.copy(normalA).add(normalB).add(normalC).normalize()
        const u = (uvA.x + uvB.x + uvC.x) / 3
        const v = (uvA.y + uvB.y + uvC.y) / 3
        let color: [number, number, number] | null = null
        if (image) {
          const x = Math.min(image.width - 1, Math.max(0, Math.round(u * (image.width - 1))))
          const y = Math.min(image.height - 1, Math.max(0, Math.round(v * (image.height - 1))))
          const offset = (y * image.width + x) * 4
          color = [image.data[offset], image.data[offset + 1], image.data[offset + 2]]
        }
        samples.push({
          meshId: id,
          ia,
          ib,
          ic,
          p: [centroid.x, centroid.y, centroid.z],
          n: [normal.x, normal.y, normal.z],
          uv: [u, v],
          color,
        })
        if (samples.length % 2 === 0) {
          edgePairs.push(uvA.x, uvA.y, uvB.x, uvB.y, uvB.x, uvB.y, uvC.x, uvC.y, uvC.x, uvC.y, uvA.x, uvA.y)
        }
      }
    }
  })

  const hasUv = meshes.some((mesh) => mesh.hasUv)
  const regions = buildDesignRegions(samples, meshNames, { hasUv, doubleSided })
  const totalTriangles = meshes.reduce((sum, mesh) => sum + mesh.triangleCount, 0)
  const isolatedCount = Object.values(regions.kept).reduce((sum, index) => sum + index.length / 3, 0)
  const canIsolate = !multiGroup && isolatedCount > 200 && isolatedCount < totalTriangles * 0.92
  const foundNames = EXPECTED_PARTS.filter((part) =>
    meshes.some((mesh) => mesh.name.toLowerCase().includes(part.toLowerCase())),
  )
  const summary = [
    meshes.length
      ? `实际 Mesh：${meshes.map((mesh) => `${mesh.name}（${mesh.vertexCount.toLocaleString('zh-CN')} 顶点，${mesh.triangleCount.toLocaleString('zh-CN')} 三角面）`).join('；')}。`
      : '文件里没有可渲染的 Mesh。',
    foundNames.length
      ? `名称里能对上的部件：${foundNames.join('、')}。`
      : '没有名为 Body_Front、Body_Back、Sleeve_Left、Sleeve_Right、Collar 的独立部件。',
    hasUv ? `存在 UV。${regions.facingLabel}。` : '没有可用 UV（缺少 uv / TEXCOORD_0，或坐标几乎是一个点）。',
    canIsolate
      ? `按主服装的平面占位保留 ${Math.round(isolatedCount).toLocaleString('zh-CN')} / ${totalTriangles.toLocaleString('zh-CN')} 个三角面。这只改绘制用的索引，不改 UV。`
      : '没有隐藏三角面：要么主服装几乎铺满整个模型，要么网格分组不适合裁切。',
  ]
  if (fileName === 'tshirt.glb') {
    summary.push('默认文件是 Poly Pizza 的 “T Shirt”，作者 Nour，CC-BY 3.0。这是一件白色宽松袖 T 恤，背面视图看到的是衣服后片。形状已加长下摆、加宽并加厚，仍是一个 Mesh，前后叠在同一套 UV 上，所以不能拆成两块单独印刷的面。授权和改动说明写在 public/models/SOURCE.txt。')
  }
  if (!regions.silhouetteReady && hasUv) {
    summary.push('轮廓没有分成衣身和袖子。可以在右侧手动填 UV 范围。')
  }

  return {
    report: {
      fileName,
      meshes,
      parts: regions.parts,
      summary,
      hasUv,
      canIsolate,
      isolateNote: canIsolate
        ? '只显示主服装会藏起落在这块轮廓以外的三角面。'
        : '当前结构不适合自动隐藏其余三角面。',
      shownTriangles: canIsolate ? Math.round(isolatedCount) : totalTriangles,
      totalTriangles,
    },
    isolated: regions.kept,
    albedoUrl: albedoPreview.canvas ? albedoPreview.canvas.toDataURL('image/jpeg', 0.72) : null,
    edges: Float32Array.from(edgePairs),
    clouds: regions.clouds,
  }
}

/** 把模型移到原点，并记下该从哪一面看。平铺和立着的衣服朝向不同。 */
export function frameFromObject(root: Object3D, fov: number): FrameInfo {
  const box = new Box3().setFromObject(root)
  const size = box.getSize(new Vector3())
  const center = box.getCenter(new Vector3())
  root.position.sub(center)
  root.updateMatrixWorld(true)
  const dims: [number, number, number] = [size.x, size.y, size.z]
  let facingAxis: 0 | 1 | 2 = 0
  if (dims[1] < dims[facingAxis]) facingAxis = 1
  if (dims[2] < dims[facingAxis]) facingAxis = 2
  let positive = 0
  let negative = 0
  const normal = new Vector3()
  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    const normals = mesh.geometry.getAttribute('normal')
    const index = mesh.geometry.getIndex()
    if (!normals) return
    const count = index ? index.count : normals.count
    for (let cursor = 0; cursor + 2 < count; cursor += 3) {
      normal.set(0, 0, 0)
      for (let corner = 0; corner < 3; corner += 1) {
        const vertex = index ? index.getX(cursor + corner) : cursor + corner
        normal.x += normals.getX(vertex)
        normal.y += normals.getY(vertex)
        normal.z += normals.getZ(vertex)
      }
      normal.transformDirection(mesh.matrixWorld)
      const facing = facingAxis === 0 ? normal.x : facingAxis === 1 ? normal.y : normal.z
      if (facing > 0.35) positive += 1
      else if (facing < -0.35) negative += 1
    }
  })
  const facingSign: 1 | -1 = positive >= negative ? 1 : -1
  const pose = facingAxis === 1 && dims[1] < Math.min(dims[0], dims[2]) * 0.45 ? 'flat' : 'stand'
  const span = pose === 'flat' ? Math.max(dims[0], dims[2], 0.2) : Math.max(dims[0], dims[1], dims[2], 0.2)
  const fovRad = (fov * Math.PI) / 180
  const distance = (span * 0.72) / Math.tan(fovRad / 2)
  return { distance, floorY: -size.y / 2 - 0.012, pose, facingAxis, facingSign }
}
