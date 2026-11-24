import { ProductCard } from '../../components/ProductCard.tsx'
import { useCopy } from '../../i18n/index.ts'
import { products } from '../../shop/products.ts'

export function ExplorePage() {
  const copy = useCopy()

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-14">
      <p className="text-[11px] font-bold">{copy.explore.eyebrow}</p>
      <h1 className="mt-3 text-5xl font-bold leading-tight md:text-[62px]">{copy.explore.title}</h1>
      <p className="mt-4 text-lg text-[#696b61]">{copy.explore.lede}</p>
      <div className="mt-8 h-px bg-[#ddded4]" />
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-bold">{copy.explore.collection}</p>
        <p className="text-[13px] text-[#696b61]">{copy.explore.support}</p>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} place="explore" />
        ))}
      </div>
    </section>
  )
}
