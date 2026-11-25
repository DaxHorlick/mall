import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
  type Material,
} from 'three'

/**
 * 克隆网格和材质，避免改到 glTF 缓存。
 * 只有前后两层布在厚度上明显分开时，才拆成 Body_Front / Body_Back，UV 坐标不动。
 */
export function cloneScene(source: Object3D) {
  const clone = source.clone(true) as Group
  clone.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    mesh.geometry = (mesh.geometry as BufferGeometry).clone()
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const cloned = materials.map((material) => material.clone())
    mesh.material = (Array.isArray(mesh.material) ? cloned : cloned[0]) as Material
  })

  const meshes: Mesh[] = []
  clone.traverse((object) => {
    const mesh = object as Mesh
    if (mesh.isMesh) meshes.push(mesh)
  })
  if (meshes.length === 1) {
    const mesh = meshes[0]
    const geometry = mesh.geometry
    const position = geometry.getAttribute('position')
    const normals = geometry.getAttribute('normal')
    const index = geometry.getIndex()
    const standard = !Array.isArray(mesh.material) && (mesh.material as MeshStandardMaterial).isMeshStandardMaterial
    if (position && normals && index && standard) {
      mesh.updateWorldMatrix(true, false)
      const min = new Vector3(Infinity, Infinity, Infinity)
      const max = new Vector3(-Infinity, -Infinity, -Infinity)
      const point = new Vector3()
      for (let vertex = 0; vertex < position.count; vertex += 1) {
        point.fromBufferAttribute(position, vertex).applyMatrix4(mesh.matrixWorld)
        min.min(point)
        max.max(point)
      }
      const size = max.clone().sub(min)
      let thin = 0
      if (size.y < size.getComponent(thin)) thin = 1
      if (size.z < size.getComponent(thin)) thin = 2
      if (size.getComponent(thin) >= 0.04) {
        const corner = new Vector3()
        let frontCount = 0
        let backCount = 0
        let frontMean = 0
        let backMean = 0
        const triangles: { indices: [number, number, number]; facing: number; depth: number }[] = []
        for (let cursor = 0; cursor + 2 < index.count; cursor += 3) {
          const ids = [index.getX(cursor), index.getX(cursor + 1), index.getX(cursor + 2)] as [number, number, number]
          let facing = 0
          let depth = 0
          for (const vertex of ids) {
            corner.fromBufferAttribute(normals, vertex).transformDirection(mesh.matrixWorld)
            facing += corner.getComponent(thin)
            point.fromBufferAttribute(position, vertex).applyMatrix4(mesh.matrixWorld)
            depth += point.getComponent(thin)
          }
          facing /= 3
          depth /= 3
          triangles.push({ indices: ids, facing, depth })
          if (facing > 0.35) {
            frontCount += 1
            frontMean += depth
          } else if (facing < -0.35) {
            backCount += 1
            backMean += depth
          }
        }
        if (frontCount >= 80 && backCount >= 80) {
          frontMean /= frontCount
          backMean /= backCount
          if (Math.abs(frontMean - backMean) >= Math.max(0.03, size.getComponent(thin) * 0.35)) {
            const frontSign = frontMean >= backMean ? 1 : -1
            const frontIndices: number[] = []
            const backIndices: number[] = []
            for (const triangle of triangles) {
              const onFront = triangle.facing * frontSign > 0.2 || (Math.abs(triangle.facing) <= 0.2 && (triangle.depth - backMean) * frontSign >= (frontMean - backMean) * frontSign * 0.5)
              const target = onFront ? frontIndices : backIndices
              target.push(...triangle.indices)
            }
            const parent = mesh.parent
            if (frontIndices.length >= 30 && backIndices.length >= 30 && parent) {
              const frontGeometry = new BufferGeometry()
              const backGeometry = new BufferGeometry()
              for (const name of Object.keys(geometry.attributes)) {
                frontGeometry.setAttribute(name, geometry.getAttribute(name))
                backGeometry.setAttribute(name, geometry.getAttribute(name))
              }
              frontGeometry.setIndex(new BufferAttribute(Uint32Array.from(frontIndices), 1))
              backGeometry.setIndex(new BufferAttribute(Uint32Array.from(backIndices), 1))
              const sourceMaterial = mesh.material as MeshStandardMaterial
              const backMaterial = sourceMaterial.clone()
              backMaterial.name = `${sourceMaterial.name || 'material'}_back`
              const front = new Mesh(frontGeometry, sourceMaterial)
              const back = new Mesh(backGeometry, backMaterial)
              front.name = 'Body_Front'
              back.name = 'Body_Back'
              for (const piece of [front, back]) {
                piece.position.copy(mesh.position)
                piece.quaternion.copy(mesh.quaternion)
                piece.scale.copy(mesh.scale)
                const geometryIndex = piece.geometry.getIndex()
                piece.userData.originalIndex = geometryIndex ? geometryIndex.clone() : null
                parent.add(piece)
              }
              parent.remove(mesh)
            }
          }
        }
      }
    }
  }

  let meshIndex = 0
  clone.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    mesh.userData.editorMeshId = `mesh-${meshIndex}`
    meshIndex += 1
    if (!mesh.userData.originalIndex) {
      const geometryIndex = mesh.geometry.getIndex()
      mesh.userData.originalIndex = geometryIndex ? geometryIndex.clone() : null
    }
  })
  return clone
}

/** 只替换三角面索引，藏起轮廓以外的面，不改 UV。 */
export function applyIsolation(root: Object3D, isolated: Record<string, Uint32Array>, enabled: boolean) {
  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    const id = String(mesh.userData.editorMeshId ?? '')
    const original = mesh.userData.originalIndex as BufferAttribute | null
    if (enabled && isolated[id]?.length) {
      mesh.geometry.setIndex(new BufferAttribute(isolated[id], 1))
      return
    }
    if (original) mesh.geometry.setIndex(original.clone())
    else mesh.geometry.setIndex(null)
  })
}
