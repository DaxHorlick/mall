import { useEffect, useState } from 'react'
import { useCopy } from '../i18n/index.ts'

export function UserNoCopy({ userNo }: { userNo?: string | null }) {
  const copy = useCopy()
  const [copied, setCopied] = useState(false)
  const value = userNo?.trim() ?? ''
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timer)
  }, [copied])
  if (!value) return null
  return (
    <button
      type="button"
      className="text-sm font-semibold text-[#191919]"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void navigator.clipboard.writeText(value).then(() => setCopied(true))
      }}
    >
      {value}
      {copied ? <span className="ml-2 font-normal text-[#696b61]">{copy.common.copied}</span> : null}
    </button>
  )
}
