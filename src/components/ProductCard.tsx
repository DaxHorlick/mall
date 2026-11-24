import { Link } from 'react-router-dom'
import { useCopy } from '../i18n/index.ts'
import { formatEuro, type Product } from '../shop/products.ts'

export function ProductCard({ product, place }: { product: Product; place: 'home' | 'explore' }) {
  const copy = useCopy()
  const text = copy.catalog[product.slug]
  const tag = place === 'home' ? text.homeTag : text.tag
  return (
    <article>
      <Link to={`/products/${product.slug}`} className="relative block">
        <img
          src={product.image}
          alt=""
          className="h-[320px] w-full rounded-[10px] object-cover sm:h-[410px]"
        />
        <span className="absolute left-4 top-4 rounded bg-[#f7f6f0] px-2.5 py-[7px] text-[9px] font-bold text-[#191919]">
          {tag}
        </span>
      </Link>
      <div className="mt-5 flex items-start justify-between gap-4">
        <Link to={`/products/${product.slug}`} className="text-[19px] font-semibold leading-snug">
          {text.name}
        </Link>
        <p className="shrink-0 text-[17px] font-semibold">{formatEuro(product.priceCents)}</p>
      </div>
      <p className="mt-2 text-[13px] text-[#696b61]">{copy.common.by(product.creator)}</p>
      <p className="mt-1.5 text-xs text-[#696b61]">{text.material}</p>
    </article>
  )
}
