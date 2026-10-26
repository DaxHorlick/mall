import { Link } from 'react-router-dom'
import type { DesignWork } from '../../types/design.ts'
import { SafeImage } from '../common/SafeImage.tsx'

type DesignCardProps = {
  design: DesignWork
}

export function DesignCard({ design }: DesignCardProps) {
  return (
    <article className="group flex flex-col">
      <Link
        to={`/marketplace?design=${design.id}`}
        className="block overflow-hidden rounded-3xl bg-white shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md"
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
          {design.isMock ? (
            <p className="text-xs text-amber-700">本地模拟作品</p>
          ) : null}
        </div>
      </Link>
      <div className="mt-2 flex gap-3 px-1 text-sm">
        <Link
          to={`/creators/${design.creatorId}`}
          className="text-stone-500 transition-colors hover:text-stone-950"
        >
          创作者
        </Link>
        {design.productId ? (
          <Link
            to={`/products/${design.productId}`}
            className="text-stone-500 transition-colors hover:text-stone-950"
          >
            购买
          </Link>
        ) : null}
      </div>
    </article>
  )
}
