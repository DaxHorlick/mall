import type { DesignPreviewConfig } from '../../types/design.ts'
import { SafeImage } from '../common/SafeImage.tsx'

type TeePreviewProps = {
  patternUrl: string
  config: DesignPreviewConfig
  teeStyle?: 'regular' | 'oversized'
  className?: string
}

/** CSS 图案叠加预览：不引入拖拽库，用滑块调整位置与尺寸 */
export function TeePreview({
  patternUrl,
  config,
  teeStyle = 'regular',
  className,
}: TeePreviewProps) {
  const bodyWidth = teeStyle === 'oversized' ? '78%' : '70%'

  return (
    <div
      className={
        className ??
        'relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] bg-stone-100'
      }
    >
      <div
        className="absolute top-[10%] bottom-[8%] rounded-[2rem] shadow-inner"
        style={{
          width: bodyWidth,
          left: '50%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(160deg, ${config.teeColor} 0%, color-mix(in srgb, ${config.teeColor} 82%, white) 100%)`,
        }}
      />
      <div
        className="absolute top-[8%] h-[14%] rounded-t-[3rem]"
        style={{
          width: '88%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: `color-mix(in srgb, ${config.teeColor} 90%, black)`,
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          left: `${config.offsetX}%`,
          top: `${config.offsetY}%`,
          width: `${config.scale}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <SafeImage
          src={patternUrl}
          alt="设计图案预览"
          className="h-auto w-full object-contain drop-shadow-sm"
        />
      </div>
      <p className="absolute right-3 bottom-3 rounded-full bg-white/80 px-2 py-1 text-[10px] tracking-wide text-stone-500">
        CSS 预览 · 模拟
      </p>
    </div>
  )
}
