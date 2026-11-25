import type { DesignRegionId, PartMapping, UvRect } from '../types'

export type Axis = 0 | 1 | 2

export type TriangleSample = {
  meshId: string
  ia: number
  ib: number
  ic: number
  p: [number, number, number]
  n: [number, number, number]
  uv: [number, number]
  color: [number, number, number] | null
}

export type RegionBuild = {
  parts: PartMapping[]
  kept: Record<string, Uint32Array>
  clouds: Partial<Record<DesignRegionId, Float32Array>>
  facingLabel: string
  silhouetteReady: boolean
}

const AXIS_NAME = ['X', 'Y', 'Z'] as const

/** 用现有三角面的朝向和 UV 划出正面、背面、左右袖，不改模型坐标。 */
export function buildDesignRegions(
  tris: TriangleSample[],
  meshNames: Map<string, string>,
  options: { hasUv: boolean; doubleSided: boolean },
): RegionBuild {
  const emptyKept: Record<string, Uint32Array> = {}
  if (!options.hasUv || tris.length === 0) {
    const reason = '模型没有可用的 UV。图案可以先放在图层里，但不会贴到衣服上。'
    return {
      kept: emptyKept,
      clouds: {},
      facingLabel: '没有 UV',
      silhouetteReady: false,
      parts: [
        makePart('front', '正面', [], meshNames, reason).part,
        makePart('back', '背面', [], meshNames, reason).part,
        makePart('sleeveLeft', '左袖', [], meshNames, reason).part,
        makePart('sleeveRight', '右袖', [], meshNames, reason).part,
      ],
    }
  }

  let min: [number, number, number] = [Infinity, Infinity, Infinity]
  let max: [number, number, number] = [-Infinity, -Infinity, -Infinity]
  for (const tri of tris) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], tri.p[axis])
      max[axis] = Math.max(max[axis], tri.p[axis])
    }
  }
  const size = min.map((value, axis) => max[axis] - value) as [number, number, number]
  let up: Axis = 0
  if (size[1] < size[up]) up = 1
  if (size[2] < size[up]) up = 2
  const planar = ([0, 1, 2] as Axis[]).filter((axis) => axis !== up) as [Axis, Axis]

  let positive = 0
  let negative = 0
  for (const tri of tris) {
    const facing = tri.n[up]
    if (facing > 0.35) positive += 1
    else if (facing < -0.35) negative += 1
  }
  const sign = positive >= negative ? 1 : -1
  const facing = tris.filter((tri) => tri.n[up] * sign > 0.35)
  const facingLabel = `薄轴 ${AXIS_NAME[up]}（${size[up].toFixed(3)} m），印刷面朝 ${sign > 0 ? '+' : '-'}${AXIS_NAME[up]}`

  const colored = facing.filter((tri) => {
    if (!tri.color) return false
    const [r, g, b] = tri.color
    const maxChannel = Math.max(r, g, b)
    const minChannel = Math.min(r, g, b)
    if (maxChannel < 55 || maxChannel > 248) return false
    return (maxChannel - minChannel) / maxChannel > 0.16
  })
  const buckets = new Map<number, TriangleSample[]>()
  for (const tri of colored) {
    const [r, g, b] = tri.color!
    const maxChannel = Math.max(r, g, b)
    const minChannel = Math.min(r, g, b)
    const delta = maxChannel - minChannel
    let hue = 0
    if (delta !== 0) {
      if (maxChannel === r) hue = ((g - b) / delta) % 6
      else if (maxChannel === g) hue = (b - r) / delta + 2
      else hue = (r - g) / delta + 4
      hue *= 60
      if (hue < 0) hue += 360
    }
    const bucket = Math.floor(hue / 24)
    const list = buckets.get(bucket) ?? []
    list.push(tri)
    buckets.set(bucket, list)
  }
  let seed = facing
  let clusterNote = '没有足够的纯色区域，正面范围改用朝向印刷面的全部三角面。'
  let bestBucket: TriangleSample[] = []
  for (const list of buckets.values()) {
    if (list.length > bestBucket.length) bestBucket = list
  }
  if (bestBucket.length > 80) {
    seed = bestBucket
    clusterNote = `主色块有 ${bestBucket.length} 个朝向印刷面的三角面。`
  }

  const originA = min[planar[0]]
  const originB = min[planar[1]]
  const cell = Math.max(size[planar[0]], size[planar[1]], 0.001) / 32
  const cells = new Map<string, TriangleSample[]>()
  for (const tri of seed) {
    const key = `${Math.floor((tri.p[planar[0]] - originA) / cell)},${Math.floor((tri.p[planar[1]] - originB) / cell)}`
    const list = cells.get(key) ?? []
    list.push(tri)
    cells.set(key, list)
  }
  const cellKeys = [...cells.keys()]
  const remainingCells = new Set(cellKeys)
  let bestCells: string[] = []
  for (const start of cellKeys) {
    if (!remainingCells.has(start)) continue
    const stack = [start]
    remainingCells.delete(start)
    const component: string[] = []
    while (stack.length) {
      const current = stack.pop()!
      component.push(current)
      const [ix, iy] = current.split(',').map(Number)
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          const next = `${ix + dx},${iy + dy}`
          if (!remainingCells.has(next)) continue
          remainingCells.delete(next)
          stack.push(next)
        }
      }
    }
    if (component.length > bestCells.length) bestCells = component
  }
  const garment = bestCells.flatMap((key) => cells.get(key) ?? [])
  if (garment.length < 40) {
    const reason = `${clusterNote}连通区域太小，无法自动分出印刷范围。可以手动填 UV。`
    return {
      kept: {},
      clouds: {},
      facingLabel,
      silhouetteReady: false,
      parts: [
        makePart('front', '正面', [], meshNames, reason).part,
        makePart('back', '背面', [], meshNames, reason).part,
        makePart('sleeveLeft', '左袖', [], meshNames, reason).part,
        makePart('sleeveRight', '右袖', [], meshNames, reason).part,
      ],
    }
  }

  const extentA = garment.reduce((span, tri) => Math.max(span, tri.p[planar[0]]), -Infinity) -
    garment.reduce((span, tri) => Math.min(span, tri.p[planar[0]]), Infinity)
  const extentB = garment.reduce((span, tri) => Math.max(span, tri.p[planar[1]]), -Infinity) -
    garment.reduce((span, tri) => Math.min(span, tri.p[planar[1]]), Infinity)
  let cross: Axis
  let length: Axis
  if (planar[0] === 1 || planar[1] === 1) {
    length = 1
    cross = planar[0] === 1 ? planar[1] : planar[0]
  } else {
    cross = extentA >= extentB ? planar[0] : planar[1]
    length = cross === planar[0] ? planar[1] : planar[0]
  }

  const lengthValues = garment.map((tri) => tri.p[length])
  const lengthMin = Math.min(...lengthValues)
  const lengthMax = Math.max(...lengthValues)
  const binCount = 22
  const bins = Array.from({ length: binCount }, () => ({
    tris: [] as TriangleSample[],
    minC: Infinity,
    maxC: -Infinity,
  }))
  for (const tri of garment) {
    const span = lengthMax - lengthMin || 1
    const index = Math.min(binCount - 1, Math.max(0, Math.floor(((tri.p[length] - lengthMin) / span) * binCount)))
    const bin = bins[index]
    bin.tris.push(tri)
    bin.minC = Math.min(bin.minC, tri.p[cross])
    bin.maxC = Math.max(bin.maxC, tri.p[cross])
  }
  const widths = bins.map((bin) => (bin.tris.length ? bin.maxC - bin.minC : 0))
  const sleeveBin = widths.indexOf(Math.max(...widths))

  const negativeBody: number[] = []
  let seenNarrowNegative = false
  for (let index = sleeveBin - 1; index >= 0; index -= 1) {
    if (!bins[index].tris.length) {
      if (seenNarrowNegative) break
      continue
    }
    const narrow = widths[index] < widths[sleeveBin] * 0.72
    if (!narrow) {
      if (seenNarrowNegative) break
      continue
    }
    seenNarrowNegative = true
    negativeBody.push(index)
  }
  const positiveBody: number[] = []
  let seenNarrowPositive = false
  for (let index = sleeveBin + 1; index < bins.length; index += 1) {
    if (!bins[index].tris.length) {
      if (seenNarrowPositive) break
      continue
    }
    const narrow = widths[index] < widths[sleeveBin] * 0.72
    if (!narrow) {
      if (seenNarrowPositive) break
      continue
    }
    seenNarrowPositive = true
    positiveBody.push(index)
  }
  const body = positiveBody.length >= negativeBody.length ? positiveBody : negativeBody
  const reference = body.length ? bins[body[Math.floor(body.length / 2)]] : null
  const bodyMin = reference ? reference.minC : 0
  const bodyMax = reference ? reference.maxC : 0
  const torsoCenter = (bodyMin + bodyMax) / 2
  const torsoReach = (bodyMax - bodyMin) * 0.48
  const chest = facing.filter(
    (tri) => tri.p[cross] > torsoCenter - torsoReach && tri.p[cross] < torsoCenter + torsoReach,
  )

  const sleeveBinIds = bins
    .map((bin, index) => ({ index, width: widths[index], count: bin.tris.length }))
    .filter((bin) => bin.count > 0 && bin.width > (bodyMax - bodyMin) * 1.2)
    .map((bin) => bin.index)
  const sleeveSource = sleeveBinIds.length ? sleeveBinIds : [sleeveBin]
  const left: TriangleSample[] = []
  const right: TriangleSample[] = []
  for (const index of sleeveSource) {
    for (const tri of bins[index].tris) {
      if (tri.p[cross] < bodyMin) left.push(tri)
      else if (tri.p[cross] > bodyMax) right.push(tri)
    }
  }

  const front = makePart(
    'front',
    '正面',
    chest,
    meshNames,
    `没能从${clusterNote}里切出紧凑的胸口 UV。`,
  )
  const leftPart = makePart('sleeveLeft', '左袖', left, meshNames, `没能切出 ${AXIS_NAME[cross]} 较小一侧的袖子 UV。`)
  const rightPart = makePart('sleeveRight', '右袖', right, meshNames, `没能切出 ${AXIS_NAME[cross]} 较大一侧的袖子 UV。`)

  if (front.part.status === 'ready') {
    front.part.reason = `${clusterNote} 胸口是长度轴 ${AXIS_NAME[length]} 上的衣身。${front.part.reason}`
  }

  let crossMin = Infinity
  let crossMax = -Infinity
  for (const tri of garment) {
    crossMin = Math.min(crossMin, tri.p[cross])
    crossMax = Math.max(crossMax, tri.p[cross])
  }
  const backTris = tris.filter((tri) => {
    if (tri.n[up] * sign > -0.35) return false
    return tri.p[length] >= lengthMin && tri.p[length] <= lengthMax && tri.p[cross] >= crossMin && tri.p[cross] <= crossMax
  })
  const back = makePart('back', '背面', backTris, meshNames, '')
  let sameUv = false
  if (
    front.part.meshId &&
    front.part.meshId === back.part.meshId &&
    front.part.uvRect &&
    back.part.uvRect
  ) {
    const rectA = front.part.uvRect
    const rectB = back.part.uvRect
    const overlapU0 = Math.max(rectA.u, rectB.u)
    const overlapV0 = Math.max(rectA.v, rectB.v)
    const overlapU1 = Math.min(rectA.u + rectA.w, rectB.u + rectB.w)
    const overlapV1 = Math.min(rectA.v + rectA.h, rectB.v + rectB.h)
    const overlapArea = Math.max(0, overlapU1 - overlapU0) * Math.max(0, overlapV1 - overlapV0)
    const overlapBase = rectB.w * rectB.h
    sameUv = (overlapBase > 0 ? overlapArea / overlapBase : 0) > 0.45
  }
  if (backTris.length < 250) {
    const failed = makePart(
      'back',
      '背面',
      [],
      meshNames,
      options.doubleSided
        ? '胸口没有独立的背面三角面。材质是双面的，翻到底下会看到同一张贴图，不能单独印背面。'
        : '胸口没有朝向相反的三角面，这个模型没有可印刷的背面。',
    )
    back.part = failed.part
    back.cloud = null
  } else if (sameUv) {
    back.part = {
      ...back.part,
      uvRect: null,
      status: 'unavailable',
      reason: '背面三角面和正面用了同一块 UV，单独印背面会盖住正面。',
    }
  } else if (back.part.status === 'ready' && front.part.meshId && back.part.meshId && front.part.meshId !== back.part.meshId) {
    back.part.reason = `后片是独立 Mesh ${back.part.meshName ?? ''}。图案只画在这块材质上。${back.part.reason}`
  }

  const occupied = new Set<string>()
  for (const tri of garment) {
    occupied.add(`${Math.floor((tri.p[planar[0]] - originA) / cell)},${Math.floor((tri.p[planar[1]] - originB) / cell)}`)
  }
  const keptLists = new Map<string, number[]>()
  for (const tri of tris) {
    const key = `${Math.floor((tri.p[planar[0]] - originA) / cell)},${Math.floor((tri.p[planar[1]] - originB) / cell)}`
    if (!occupied.has(key)) continue
    const list = keptLists.get(tri.meshId) ?? []
    list.push(tri.ia, tri.ib, tri.ic)
    keptLists.set(tri.meshId, list)
  }
  const kept: Record<string, Uint32Array> = {}
  for (const [meshId, list] of keptLists) kept[meshId] = Uint32Array.from(list)

  const clouds: Partial<Record<DesignRegionId, Float32Array>> = {}
  if (front.cloud) clouds.front = front.cloud
  if (back.cloud) clouds.back = back.cloud
  if (leftPart.cloud) clouds.sleeveLeft = leftPart.cloud
  if (rightPart.cloud) clouds.sleeveRight = rightPart.cloud

  return {
    parts: [front.part, back.part, leftPart.part, rightPart.part],
    kept,
    clouds,
    facingLabel,
    silhouetteReady: body.length > 0 && chest.length > 0,
  }
}

/** 把一组三角面收成一块紧凑 UV。铺得太开就标成不能印刷。 */
function makePart(
  id: DesignRegionId,
  label: string,
  tris: TriangleSample[],
  meshNames: Map<string, string>,
  unavailable: string,
): { part: PartMapping; cloud: Float32Array | null } {
  const counts = new Map<string, number>()
  for (const tri of tris) counts.set(tri.meshId, (counts.get(tri.meshId) ?? 0) + 1)
  let meshId: string | null = null
  let meshCount = 0
  for (const [countedId, count] of counts) {
    if (count > meshCount) {
      meshCount = count
      meshId = countedId
    }
  }
  const meshName = meshId ? (meshNames.get(meshId) ?? meshId) : null

  let focused = tris
  if (tris.length >= 16) {
    const uvCell = 0.035
    const uvBuckets = new Map<string, TriangleSample[]>()
    for (const tri of tris) {
      const key = `${Math.floor(tri.uv[0] / uvCell)},${Math.floor(tri.uv[1] / uvCell)}`
      const list = uvBuckets.get(key) ?? []
      list.push(tri)
      uvBuckets.set(key, list)
    }
    const uvKeys = [...uvBuckets.keys()]
    const remaining = new Set(uvKeys)
    let bestKeys: string[] = []
    for (const start of uvKeys) {
      if (!remaining.has(start)) continue
      const stack = [start]
      remaining.delete(start)
      const component: string[] = []
      while (stack.length) {
        const current = stack.pop()!
        component.push(current)
        const [ix, iy] = current.split(',').map(Number)
        for (let dx = -1; dx <= 1; dx += 1) {
          for (let dy = -1; dy <= 1; dy += 1) {
            const next = `${ix + dx},${iy + dy}`
            if (!remaining.has(next)) continue
            remaining.delete(next)
            stack.push(next)
          }
        }
      }
      if (component.length > bestKeys.length) bestKeys = component
    }
    const clustered = bestKeys.flatMap((key) => uvBuckets.get(key) ?? [])
    if (clustered.length >= 16) focused = clustered
  }

  let rect: UvRect | null = null
  if (focused.length >= 16) {
    const uSorted = focused.map((tri) => tri.uv[0]).sort((a, b) => a - b)
    const vSorted = focused.map((tri) => tri.uv[1]).sort((a, b) => a - b)
    const u0 = uSorted[Math.min(uSorted.length - 1, Math.max(0, Math.round(0.08 * (uSorted.length - 1))))]
    const u1 = uSorted[Math.min(uSorted.length - 1, Math.max(0, Math.round(0.92 * (uSorted.length - 1))))]
    const v0 = vSorted[Math.min(vSorted.length - 1, Math.max(0, Math.round(0.08 * (vSorted.length - 1))))]
    const v1 = vSorted[Math.min(vSorted.length - 1, Math.max(0, Math.round(0.92 * (vSorted.length - 1))))]
    const width = u1 - u0
    const height = v1 - v0
    if (!(width < 0.012 || height < 0.012 || width > 0.42 || height > 0.42)) {
      const padU = width * 0.1
      const padV = height * 0.1
      const u = Math.max(0, u0 - padU)
      const v = Math.max(0, v0 - padV)
      rect = {
        u,
        v,
        w: Math.min(1 - u, width + padU * 2),
        h: Math.min(1 - v, height + padV * 2),
      }
    }
  }

  if (!rect) {
    let cloud: Float32Array | null = null
    if (tris.length) {
      const step = Math.max(1, Math.floor(tris.length / 480))
      const count = Math.ceil(tris.length / step)
      const data = new Float32Array(count * 2)
      let offset = 0
      for (let index = 0; index < tris.length; index += step) {
        data[offset] = tris[index].uv[0]
        data[offset + 1] = tris[index].uv[1]
        offset += 2
      }
      cloud = data
    }
    return {
      cloud,
      part: {
        id,
        label,
        meshId,
        meshName,
        uvRect: null,
        status: 'unavailable',
        reason: tris.length
          ? `${unavailable} 相关三角面 ${tris.length} 个，其中最密的一块有 ${focused.length} 个，UV 仍然铺得太开。`
          : unavailable,
        triangleCount: focused.length,
      },
    }
  }

  const step = Math.max(1, Math.floor(focused.length / 480))
  const count = Math.ceil(focused.length / step)
  const data = new Float32Array(count * 2)
  let offset = 0
  for (let index = 0; index < focused.length; index += step) {
    data[offset] = focused[index].uv[0]
    data[offset + 1] = focused[index].uv[1]
    offset += 2
  }
  const rectText = `u ${rect.u.toFixed(3)}–${(rect.u + rect.w).toFixed(3)}，v ${rect.v.toFixed(3)}–${(rect.v + rect.h).toFixed(3)}`
  return {
    cloud: data,
    part: {
      id,
      label,
      meshId,
      meshName,
      uvRect: rect,
      status: 'ready',
      reason: `${focused.length} 个三角面，UV ${rectText}。范围来自现有 UV，没有改动坐标。`,
      triangleCount: focused.length,
    },
  }
}
