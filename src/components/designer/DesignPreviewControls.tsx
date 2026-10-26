import { Slider } from 'antd'
import type { DesignPreviewConfig } from '../../types/design.ts'

const TEE_COLORS = [
  { key: '#171717', label: '黑色' },
  { key: '#f5f5f4', label: '白色' },
  { key: '#1e293b', label: '藏青' },
  { key: '#3f4f3a', label: '橄榄' },
  { key: '#a8a29e', label: '石灰' },
]

type DesignPreviewControlsProps = {
  value: DesignPreviewConfig
  onChange: (next: DesignPreviewConfig) => void
}

export function DesignPreviewControls({
  value,
  onChange,
}: DesignPreviewControlsProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-stone-950">衣服颜色</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {TEE_COLORS.map((color) => {
            const selected = value.teeColor === color.key
            return (
              <button
                key={color.key}
                type="button"
                title={color.label}
                aria-label={color.label}
                aria-pressed={selected}
                className={
                  selected
                    ? 'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full ring-2 ring-stone-950 ring-offset-2'
                    : 'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full ring-1 ring-stone-300 ring-offset-2'
                }
                onClick={() => onChange({ ...value, teeColor: color.key })}
              >
                <span
                  className="h-7 w-7 rounded-full border border-black/10"
                  style={{ backgroundColor: color.key }}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-stone-950">水平位置</span>
          <span className="text-stone-500">{value.offsetX}%</span>
        </div>
        <Slider
          min={20}
          max={80}
          value={value.offsetX}
          onChange={(offsetX) => onChange({ ...value, offsetX })}
        />
      </div>

      <div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-stone-950">垂直位置</span>
          <span className="text-stone-500">{value.offsetY}%</span>
        </div>
        <Slider
          min={25}
          max={70}
          value={value.offsetY}
          onChange={(offsetY) => onChange({ ...value, offsetY })}
        />
      </div>

      <div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-stone-950">图案尺寸</span>
          <span className="text-stone-500">{value.scale}%</span>
        </div>
        <Slider
          min={18}
          max={58}
          value={value.scale}
          onChange={(scale) => onChange({ ...value, scale })}
        />
      </div>
    </div>
  )
}
