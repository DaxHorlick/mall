import { useState } from 'react'
import { useCopy } from '../i18n/index.ts'
import { matchesPlace } from '../profile/place.ts'

export function SearchSelect({
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  value: string
  options: { label: string; search?: string }[]
  placeholder: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const copy = useCopy()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const text = query.trim()
  const shown = text
    ? options.filter((option) => matchesPlace(option.label, option.search ?? '', text))
    : options

  return (
    <div
      className={`relative ${open ? 'z-30' : ''}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <input
        className="mt-2 h-[52px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none disabled:opacity-60"
        placeholder={placeholder}
        disabled={disabled}
        value={open ? query : value}
        onFocus={() => {
          setQuery('')
          setOpen(true)
        }}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
      />
      {open && !disabled ? (
        <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[#ddded4] bg-[#f7f6f0] py-1">
          {shown.length === 0 ? (
            <li className="px-4 py-2 text-sm text-[#696b61]">{copy.common.noMatches}</li>
          ) : (
            shown.slice(0, 80).map((option) => (
              <li key={option.label}>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-[#eceee3]"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(option.label)
                    setQuery('')
                    setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
