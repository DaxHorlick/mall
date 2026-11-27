const cache = new Map<string, Promise<HTMLImageElement>>()

/** 同一地址只解码一次，贴图重绘时复用。 */
export function loadImage(url: string) {
  const cached = cache.get(url)
  if (cached) return cached
  const pending = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`图片加载失败：${url}`))
    image.src = url
  })
  cache.set(url, pending)
  return pending
}

/** 图案删掉后丢掉缓存，下次同地址会重新加载。 */
export function dropImage(url: string) {
  cache.delete(url)
}
