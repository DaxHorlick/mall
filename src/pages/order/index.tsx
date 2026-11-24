import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCopy } from '../../i18n/index.ts'
import { formatEuro, products } from '../../shop/products.ts'
import { useShop } from '../../shop/store.ts'

export function OrderPage() {
  const copy = useCopy()
  const navigate = useNavigate()
  const order = useShop((s) => s.order)

  useEffect(() => {
    if (!order) navigate('/bag', { replace: true })
  }, [order, navigate])

  if (!order) return null

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-14">
      <div className="rounded-xl bg-[#d7fa55] px-8 py-8 md:px-10 md:py-10">
        <p className="text-xs font-bold">{copy.order.confirmed(order.code)}</p>
        <h1 className="mt-5 text-4xl font-bold leading-tight md:text-[61px]">{copy.order.title}</h1>
        <p className="mt-5 text-[19px]">{copy.order.lede}</p>
      </div>
      <h2 className="mt-10 text-[25px] font-semibold">{copy.order.piece}</h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-8">
          {order.lines.map((line) => {
            const product = products.find((item) => item.slug === line.slug)
            if (!product) return null
            return (
              <div key={line.slug} className="flex flex-col gap-5 sm:flex-row">
                <img src={product.image} alt="" className="size-[180px] rounded-lg object-cover" />
                <div>
                  <h3 className="text-[26px] font-semibold">{copy.catalog[product.slug].name}</h3>
                  <p className="mt-6 text-sm">
                    <span>M</span>
                    <span className="ml-10">{copy.catalog[product.slug].color}</span>
                  </p>
                  <p className="mt-4 text-sm text-[#696b61]">{copy.common.quantity}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div>
          <p className="text-base">{copy.order.total}</p>
          <p className="mt-3 text-4xl font-semibold">{formatEuro(order.totalCents, true)}</p>
          <p className="mt-5 text-sm leading-relaxed text-[#696b61]">
            {copy.order.demo1}
            <br />
            {copy.order.demo2}
          </p>
        </div>
      </div>
      <Link
        to="/explore"
        className="mt-10 inline-flex h-[52px] items-center rounded-lg bg-[#191919] px-5 text-sm font-semibold text-[#f7f6f0]"
      >
        {copy.order.explore}
      </Link>
    </section>
  )
}
