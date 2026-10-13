import { useState } from 'react'

type SafeImageProps = {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
}

const DEFAULT_FALLBACK = '/images/placeholder-product.svg'

export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false)
  const currentSrc = failed ? fallbackSrc : src

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (!failed) {
          setFailed(true)
        }
      }}
    />
  )
}
