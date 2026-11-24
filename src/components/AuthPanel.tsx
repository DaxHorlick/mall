import type { ReactNode } from 'react'
import { useCopy } from '../i18n/index.ts'

export function AuthPanel({
  title,
  lede,
  children,
}: {
  title: ReactNode
  lede: ReactNode
  children: ReactNode
}) {
  const copy = useCopy()
  return (
    <section className="mx-auto grid max-w-[1440px] items-stretch gap-10 px-5 py-12 md:px-14 lg:grid-cols-[minmax(0,640px)_minmax(0,560px)] lg:justify-between lg:py-[50px]">
      <div className="h-full rounded-xl bg-[#d7fa55] px-9 py-10 text-[#191919] lg:min-h-[666px]">
        <p className="text-xs font-bold">{copy.auth.eyebrow}</p>
        <h1 className="mt-16 max-w-md text-5xl font-bold leading-[1.15] md:text-[70px] md:leading-[1.2]">
          {title}
        </h1>
        <p className="mt-16 max-w-md text-2xl font-medium leading-snug">{lede}</p>
      </div>
      <div className="lg:pt-7">{children}</div>
    </section>
  )
}
