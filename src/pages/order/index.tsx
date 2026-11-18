import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatEuro, products } from '../../shop/products.ts'
import { useShop } from '../../shop/store.ts'

export function OrderPage() {
  const navigate = useNavigate()
  const order = useShop((s) => s.order)

  useEffect(() => {
    if (!order) navigate('/bag', { replace: true })
  }, [order, navigate])

  if (!order) return null

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-14">
      <div className="rounded-xl bg-[#d7fa55] px-8 py-8 md:px-10 md:py-10">
        <p className="text-xs font-bold">DEMO ORDER CONFIRMED / {order.code}</p>
        <h1 className="mt-5 text-4xl font-bold leading-tight md:text-[61px]">Good taste. Great choice.</h1>
        <p className="mt-5 text-[19px]">
          Your original is one step closer to becoming your everyday favorite.
        </p>
      </div>
      <h2 className="mt-10 text-[25px] font-semibold">Your made-to-order piece</h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-8">
          {order.lines.map((line) => {
            const product = products.find((item) => item.slug === line.slug)
            if (!product) return null
            return (
              <div key={line.slug} className="flex flex-col gap-5 sm:flex-row">
                <img src={product.image} alt="" className="size-[180px] rounded-lg object-cover" />
                <div>
                  <h3 className="text-[26px] font-semibold">{product.name}</h3>
                  <p className="mt-6 text-sm">
                    <span>M</span>
                    <span className="ml-10">{product.color}</span>
                  </p>
                  <p className="mt-4 text-sm text-[#696b61]">Quantity 1</p>
                </div>
              </div>
            )
          })}
        </div>
        <div>
          <p className="text-base">Total, including shipping</p>
          <p className="mt-3 text-4xl font-semibold">{formatEuro(order.totalCents, true)}</p>
          <p className="mt-5 text-sm leading-relaxed text-[#696b61]">
            This is a prototype confirmation.
            <br />
            No payment or real order was created.
          </p>
        </div>
      </div>
      <Link
        to="/explore"
        className="mt-10 inline-flex h-[52px] items-center rounded-lg bg-[#191919] px-5 text-sm font-semibold text-[#f7f6f0]"
      >
        Keep exploring ↗
      </Link>
    </section>
  )
}
