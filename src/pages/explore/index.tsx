import { ProductCard } from '../../components/ProductCard.tsx'
import { products } from '../../shop/products.ts'

export function ExplorePage() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-14">
      <p className="text-[11px] font-bold">ORIGINAL IDEAS. REALLY GOOD TEES.</p>
      <h1 className="mt-3 text-5xl font-bold leading-tight md:text-[62px]">Find your kind of weird.</h1>
      <p className="mt-4 text-lg text-[#696b61]">
        Independent designs. Made to order. Pick the one that feels like you.
      </p>
      <div className="mt-8 h-px bg-[#ddded4]" />
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-bold">THE COLLECTION / 03 ORIGINALS</p>
        <p className="text-[13px] text-[#696b61]">Every purchase supports an independent creator.</p>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} tag={product.tag} />
        ))}
      </div>
    </section>
  )
}
