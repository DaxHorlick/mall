type BoundImageProps = {
  url: string
  alt: string
}

/** 始终使用接口返回的 url，不替换成其他图片。 */
export function BoundImage({ url, alt }: BoundImageProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-stone-100">
      <img src={url} alt={alt} className="h-52 w-full object-contain" />
      <p className="truncate px-3 py-2 text-xs text-stone-500" title={url}>
        {url}
      </p>
    </div>
  )
}
