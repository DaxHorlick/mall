import { Link } from 'react-router-dom'
import type { DesignWork } from '../../types/design.ts'
import { SafeImage } from '../common/SafeImage.tsx'

type LatestDesignsSectionProps = {
  designs: DesignWork[]
}

export function LatestDesignsSection({ designs }: LatestDesignsSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            LATEST DESIGNS
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            最新设计作品
          </h2>
        </div>
        <Link
          to="/marketplace"
          className="text-sm text-stone-500 transition-colors hover:text-stone-950"
        >
          去创作者市场
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {designs.map((design) => (
          <Link
            key={design.id}
            to="/marketplace"
            className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="aspect-square overflow-hidden bg-stone-200">
              <SafeImage
                src={design.imageUrl}
                alt={design.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="space-y-1 p-4">
              <h3 className="line-clamp-1 text-base font-medium text-stone-950">
                {design.title}
              </h3>
              <p className="text-sm text-stone-500">{design.creatorName}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
