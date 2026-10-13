import { Link } from 'react-router-dom'
import { useFavoritesStore } from '../../stores/favorites.ts'
import type { Product } from '../../types/product.ts'
import { formatPrice } from '../../utils/format.ts'
import { SafeImage } from '../common/SafeImage.tsx'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const favorited = useFavoritesStore((state) => state.ids.includes(product.id))
  const toggleFavorite = useFavoritesStore((state) => state.toggle)

  return (
    <article className="group relative flex flex-col">
      <Link
        to={`/products/${product.id}`}
        className="block overflow-hidden rounded-3xl bg-white shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md"
      >
        <div className="aspect-[6/7] overflow-hidden bg-stone-200">
          <SafeImage
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-1 text-base font-medium text-stone-950">
            {product.name}
          </h3>
          <p className="text-sm text-stone-500">{product.creatorName}</p>
          <p className="text-base font-semibold tracking-tight text-stone-950">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>

      <button
        type="button"
        aria-label={favorited ? '取消收藏' : '收藏'}
        aria-pressed={favorited}
        className="absolute top-3 right-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-stone-950 shadow-sm backdrop-blur transition hover:bg-white"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          toggleFavorite(product.id)
        }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M12 20.2 4.8 13a4.4 4.4 0 0 1 6.2-6.2L12 7.8l1 1a4.4 4.4 0 0 1 6.2 6.2L12 20.2z"
            fill={favorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </article>
  )
}
