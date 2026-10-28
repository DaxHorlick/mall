import type { PublicDesign } from '../../types/userDesign.ts'
import { ORIGIN_LABEL, formatDesignTime } from '../../utils/userDesign.ts'
import { BoundImage } from './BoundImage.tsx'

export function PublicDesignView({ design }: { design: PublicDesign }) {
  const createdAt = formatDesignTime(design.created_at)

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <p className="text-xs font-medium tracking-[0.22em] text-stone-400">DESIGN</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{design.title}</h1>
      <p className="mt-3 text-sm text-stone-500">
        {ORIGIN_LABEL[design.origin]}
        {createdAt ? ` · ${createdAt}` : ''}
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-medium text-stone-700">成品图</h2>
          {design.result?.url ? (
            <BoundImage url={design.result.url} alt={design.title} />
          ) : (
            <p className="rounded-2xl bg-white px-4 py-8 text-sm text-stone-500">没有成品图</p>
          )}
        </section>
        <section>
          <h2 className="mb-3 text-sm font-medium text-stone-700">预览图</h2>
          {design.preview?.url ? (
            <BoundImage url={design.preview.url} alt={`${design.title}预览`} />
          ) : (
            <p className="rounded-2xl bg-white px-4 py-8 text-sm text-stone-500">没有预览图</p>
          )}
        </section>
      </div>
    </div>
  )
}
