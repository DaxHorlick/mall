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

/** 图库图片压到最长边 640。有透明像素时存 PNG，否则存 JPEG。 */
export function readLibraryImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('图片读取失败'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('图片读取失败'))
      image.onload = () => {
        const longest = Math.max(image.width, image.height)
        const scale = Math.min(1, 640 / longest)
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('图片读取失败'))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        // 透明像素不能存成 JPEG，否则空白会变成实心矩形。

        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
        let transparent = false
        for (let index = 3; index < pixels.length; index += 4) {
          if (pixels[index] < 255) {
            transparent = true
            break
          }
        }
        resolve(transparent ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.85))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
