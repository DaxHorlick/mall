import { Link } from 'react-router-dom'
import { products } from '../../shop/products.ts'
import { useShop } from '../../shop/store.ts'

export function StudioSubmittedPage() {
  const studioSlug = useShop((s) => s.studioSlug)
  const studioTitle = useShop((s) => s.studioTitle)
  const product = products.find((item) => item.slug === studioSlug) ?? products[0]

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-14">
      <div className="rounded-xl bg-[#d7fa55] px-8 py-8 md:px-10 md:py-10">
        <p className="text-xs font-bold">DEMO SUBMISSION / PREVIEW COMPLETE</p>
        <h1 className="mt-6 text-4xl font-bold leading-tight md:text-[58px]">
          That idea looks good on you.
        </h1>
        <p className="mt-5 text-[19px]">Your sample project is ready for a community preview.</p>
      </div>
      <div className="mt-10 flex flex-col gap-8 lg:flex-row">
        <img src={product.image} alt="" className="h-[325px] w-full max-w-[340px] rounded-[10px] object-cover" />
        <div className="max-w-3xl pt-2">
          <p className="text-[11px] font-bold text-[#696b61]">YOUR SAMPLE DESIGN</p>
          <h2 className="mt-4 text-3xl font-semibold md:text-[35px]">{studioTitle}</h2>
          <p className="mt-5 text-[17px] leading-relaxed text-[#696b61]">
            This is a prototype preview, not a published listing.
            <br />
            Return to the studio to try the other artwork, or explore the community.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/studio"
              className="inline-flex h-[52px] items-center rounded-lg border border-[#ddded4] bg-[#f7f6f0] px-5 text-sm font-semibold"
            >
              ← Back to studio
            </Link>
            <Link
              to="/community"
              className="inline-flex h-[52px] items-center rounded-lg bg-[#191919] px-5 text-sm font-semibold text-[#f7f6f0]"
            >
              Explore the community ↗
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
