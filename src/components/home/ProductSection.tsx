import { Link } from 'react-router-dom'
import type { Product } from '../../types/product.ts'
import { ProductCard } from '../products/ProductCard.tsx'

type ProductSectionProps = {
  eyebrow: string
  title: string
  products: Product[]
  moreTo?: string
  moreLabel?: string
}

export function ProductSection({
  eyebrow,
  title,
  products,
  moreTo = '/products',
  moreLabel = '查看更多',
}: ProductSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h2>
        </div>
        <Link
          to={moreTo}
          className="text-sm text-stone-500 transition-colors hover:text-stone-950"
        >
          {moreLabel}
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
