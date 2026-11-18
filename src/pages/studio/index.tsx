import { useNavigate } from 'react-router-dom'
import { products } from '../../shop/products.ts'
import { useShop } from '../../shop/store.ts'

export function StudioPage() {
  const navigate = useNavigate()
  const studioSlug = useShop((s) => s.studioSlug)
  const studioTitle = useShop((s) => s.studioTitle)
  const samples = products.filter((product) => product.votable)
  const selected = samples.find((product) => product.slug === studioSlug) ?? samples[0]
  if (!selected) return null

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-8 md:px-14">
      <p className="text-[11px] font-bold">CREATOR STUDIO / SAMPLE PROJECT</p>
      <h1 className="mt-3 text-4xl font-bold leading-tight md:text-[56px]">Your idea. In the real world.</h1>
      <p className="mt-4 text-[17px] text-[#696b61]">
        Try the sample artwork below. We take care of the printing, packing and shipping.
      </p>
      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
        <div className="rounded-xl bg-[#eceee3] p-6">
          <img src={selected.image} alt="" className="aspect-[592/564] w-full rounded-[10px] object-cover" />
        </div>
        <div>
          <p className="text-xs font-bold">01 / CHOOSE SAMPLE ARTWORK</p>
          <div className="mt-4 flex gap-5">
            {samples.map((product) => (
              <button
                key={product.slug}
                type="button"
                className={`size-36 overflow-hidden rounded-[10px] ${product.slug === selected.slug ? 'ring-2 ring-[#191919]' : ''}`}
                aria-label={product.name}
                onClick={() => useShop.getState().setStudio(product.slug, product.name)}
              >
                <img src={product.image} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-[#696b61]">Choose a sample to update the preview and title.</p>
          <p className="mt-8 text-xs font-bold">02 / DESIGN TITLE</p>
          <input
            className="mt-3 h-[62px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-[17px] font-medium outline-none"
            value={studioTitle}
            onChange={(event) => useShop.getState().setStudioTitle(event.target.value)}
          />
          <p className="mt-8 text-xs font-bold">03 / PRODUCT & FINISH</p>
          <p className="mt-3 text-base leading-relaxed text-[#696b61]">
            Organic cotton tee · Unisex fit
            <br />
            Garment color follows the selected sample.
          </p>
          <button
            type="button"
            className="mt-8 h-[52px] w-full rounded-lg bg-[#191919] text-left px-[18px] text-sm font-semibold text-[#f7f6f0] disabled:opacity-50"
            disabled={!studioTitle.trim()}
            onClick={() => navigate('/studio/submitted')}
          >
            Preview submission ↗
          </button>
          <p className="mt-4 text-[13px] text-[#696b61]">Demo workspace. This will not publish a real listing.</p>
        </div>
      </div>
    </section>
  )
}
