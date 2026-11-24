import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCopy } from '../../i18n/index.ts'
import { formatEuro, products } from '../../shop/products.ts'
import { useShop } from '../../shop/store.ts'

export function ProductPage() {
  const copy = useCopy()
  const { slug } = useParams()
  const navigate = useNavigate()
  const product = products.find((item) => item.slug === slug)

  if (!product) {
    return (
      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-14">
        <h1 className="text-4xl font-bold">{copy.product.missing}</h1>
        <Link to="/explore" className="mt-6 inline-block text-sm font-medium">
          {copy.product.allDesigns}
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-7 md:px-14">
      <Link to="/explore" className="text-sm font-medium">
        {copy.product.allDesigns}
      </Link>
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)] lg:gap-16">
        <div>
          <img
            src={product.image}
            alt=""
            className="aspect-[640/620] w-full rounded-[10px] object-cover"
          />
          <p className="mt-6 text-[11px] font-bold text-[#696b61]">{copy.product.printed}</p>
        </div>
        <div className="lg:pt-1">
          <p className="text-[11px] font-bold">{copy.catalog[product.slug].code}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-[44px]">
            {copy.catalog[product.slug].name}
          </h1>
          <p className="mt-5 text-[15px] font-medium text-[#696b61]">{copy.common.by(product.creator)}</p>
          <p className="mt-4 text-[32px] font-semibold">{formatEuro(product.priceCents)}</p>
          <p className="mt-3 text-[13px] text-[#696b61]">{copy.product.taxes}</p>
          <p className="mt-8 text-xs font-bold">
            {copy.product.color(copy.catalog[product.slug].color.toUpperCase())}
          </p>
          <p className="mt-5 text-xs font-bold text-[#191919]/35">{copy.product.demoSize}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {product.sizes.map((size) =>
              size === 'M' ? (
                <span
                  key={size}
                  className="inline-flex h-[50px] w-[78px] items-center justify-center rounded-lg bg-[#191919] text-sm font-semibold text-[#f7f6f0]"
                >
                  {size}
                </span>
              ) : (
                <span
                  key={size}
                  className="inline-flex h-[50px] w-[78px] items-center justify-center rounded-lg border border-[#ddded4] text-sm font-semibold opacity-35"
                >
                  {size}
                </span>
              ),
            )}
          </div>
          <button
            type="button"
            className="mt-6 h-[50px] w-full rounded-lg bg-[#191919] px-4 text-left text-sm font-semibold text-[#f7f6f0]"
            onClick={() => {
              useShop.getState().addLine(product.slug)
              navigate('/bag')
            }}
          >
            {copy.product.add(formatEuro(product.priceCents))}
          </button>
          <p className="mt-4 text-sm text-[#696b61]">{copy.product.sizeNote}</p>
          <div className="mt-6 h-px bg-[#ddded4]" />
          <h2 className="mt-5 text-[17px] font-semibold">{copy.product.details}</h2>
          <div className="mt-3 text-[15px] leading-relaxed text-[#696b61]">
            {copy.catalog[product.slug].details.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
