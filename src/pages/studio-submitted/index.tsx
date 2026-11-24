import { Link } from 'react-router-dom'
import { shownDesignTitle, useCopy } from '../../i18n/index.ts'
import { products } from '../../shop/products.ts'
import { useShop } from '../../shop/store.ts'

export function StudioSubmittedPage() {
  const copy = useCopy()
  const studioSlug = useShop((s) => s.studioSlug)
  const studioTitle = useShop((s) => s.studioTitle)
  const product = products.find((item) => item.slug === studioSlug) ?? products[0]

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-14">
      <div className="rounded-xl bg-[#d7fa55] px-8 py-8 md:px-10 md:py-10">
        <p className="text-xs font-bold">{copy.studio.doneEyebrow}</p>
        <h1 className="mt-6 text-4xl font-bold leading-tight md:text-[58px]">{copy.studio.doneTitle}</h1>
        <p className="mt-5 text-[19px]">{copy.studio.doneLede}</p>
      </div>
      <div className="mt-10 flex flex-col gap-8 lg:flex-row">
        <img src={product.image} alt="" className="h-[325px] w-full max-w-[340px] rounded-[10px] object-cover" />
        <div className="max-w-3xl pt-2">
          <p className="text-[11px] font-bold text-[#696b61]">{copy.studio.sample}</p>
          <h2 className="mt-4 text-3xl font-semibold md:text-[35px]">
            {shownDesignTitle(product.slug, studioTitle)}
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-[#696b61]">
            {copy.studio.sample1}
            <br />
            {copy.studio.sample2}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/studio"
              className="inline-flex h-[52px] items-center rounded-lg border border-[#ddded4] bg-[#f7f6f0] px-5 text-sm font-semibold"
            >
              {copy.studio.back}
            </Link>
            <Link
              to="/community"
              className="inline-flex h-[52px] items-center rounded-lg bg-[#191919] px-5 text-sm font-semibold text-[#f7f6f0]"
            >
              {copy.studio.community}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
