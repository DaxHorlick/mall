import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCopy } from '../../i18n/index.ts'
import { formatEuro, goodsCents, products, shippingCents } from '../../shop/products.ts'
import { useShop } from '../../shop/store.ts'

export function CheckoutPage() {
  const copy = useCopy()
  const navigate = useNavigate()
  const lines = useShop((s) => s.lines)
  const order = useShop((s) => s.order)
  const [email, setEmail] = useState('alex@example.com')
  const [firstName, setFirstName] = useState('Alex')
  const [lastName, setLastName] = useState('Morgan')
  const [street, setStreet] = useState('24 Linden Street')
  const [city, setCity] = useState('Berlin')
  const [postal, setPostal] = useState('10115')
  const [error, setError] = useState<string | null>(null)
  const subtotal = goodsCents(lines.map((line) => line.slug))
  const total = subtotal + shippingCents

  useEffect(() => {
    if (lines.length === 0 && !order) navigate('/bag', { replace: true })
  }, [lines.length, order, navigate])

  if (lines.length === 0) return null

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-7 md:px-14">
      <Link to="/bag" className="text-sm font-medium">
        {copy.checkout.back}
      </Link>
      <h1 className="mt-5 text-5xl font-bold md:text-[56px]">{copy.checkout.title}</h1>
      <p className="mt-3 text-[11px] font-bold text-[#696b61]">{copy.checkout.note}</p>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,760px)_minmax(0,464px)] lg:justify-between">
        <form
          id="checkout-form"
          className="max-w-[760px]"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            if (![email, firstName, lastName, street, city, postal].every((value) => value.trim())) {
              setError(copy.checkout.incomplete)
              return
            }
            setError(null)
            useShop.getState().placeOrder()
            navigate('/order')
          }}
        >
          <h2 className="text-[25px] font-semibold">{copy.checkout.contact}</h2>
          <label className="mt-7 block text-xs font-semibold text-[#696b61]">
            {copy.checkout.email}
            <input
              className="mt-2 h-[52px] w-full rounded-md border border-[#ddded4] bg-transparent px-4 text-[15px] text-[#191919] outline-none"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[#696b61]">
              {copy.checkout.firstName}
              <input
                className="mt-2 h-[52px] w-full rounded-md border border-[#ddded4] bg-transparent px-4 text-[15px] text-[#191919] outline-none"
                value={firstName}
                autoComplete="given-name"
                onChange={(event) => setFirstName(event.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold text-[#696b61]">
              {copy.checkout.lastName}
              <input
                className="mt-2 h-[52px] w-full rounded-md border border-[#ddded4] bg-transparent px-4 text-[15px] text-[#191919] outline-none"
                value={lastName}
                autoComplete="family-name"
                onChange={(event) => setLastName(event.target.value)}
              />
            </label>
          </div>
          <label className="mt-6 block text-xs font-semibold text-[#696b61]">
            {copy.checkout.street}
            <input
              className="mt-2 h-[52px] w-full rounded-md border border-[#ddded4] bg-transparent px-4 text-[15px] text-[#191919] outline-none"
              value={street}
              autoComplete="street-address"
              onChange={(event) => setStreet(event.target.value)}
            />
          </label>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[#696b61]">
              {copy.checkout.city}
              <input
                className="mt-2 h-[52px] w-full rounded-md border border-[#ddded4] bg-transparent px-4 text-[15px] text-[#191919] outline-none"
                value={city}
                autoComplete="address-level2"
                onChange={(event) => setCity(event.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold text-[#696b61]">
              {copy.checkout.postal}
              <input
                className="mt-2 h-[52px] w-full rounded-md border border-[#ddded4] bg-transparent px-4 text-[15px] text-[#191919] outline-none"
                value={postal}
                autoComplete="postal-code"
                onChange={(event) => setPostal(event.target.value)}
              />
            </label>
          </div>
          <p className="mt-6 text-sm font-medium">{copy.checkout.country}</p>
          <h2 className="mt-8 text-xl font-semibold">
            02 / {copy.checkout.delivery} · {formatEuro(shippingCents, true)}
          </h2>
          <p className="mt-3 text-sm text-[#696b61]">{copy.checkout.deliveryNote}</p>
          {error ? <p className="mt-4 text-sm text-[#9b2c2c]">{error}</p> : null}
        </form>
        <aside className="rounded-[10px] bg-[#eceee3] p-7">
          <h2 className="text-[23px] font-semibold">{copy.checkout.summary}</h2>
          {lines.map((line) => {
            const product = products.find((item) => item.slug === line.slug)
            if (!product) return null
            return (
              <div key={line.slug} className="mt-6 flex gap-5">
                <img src={product.image} alt="" className="h-32 w-[120px] rounded-lg object-cover" />
                <div>
                  <p className="text-lg font-semibold">{copy.catalog[product.slug].name}</p>
                  <p className="mt-4 text-[13px]">
                    <span>{copy.bag.size}</span>
                    <span className="ml-3">M</span>
                  </p>
                  <p className="mt-2 text-[13px]">{copy.catalog[product.slug].color}</p>
                </div>
              </div>
            )
          })}
          <div className="mt-6 flex items-center justify-between text-[15px]">
            <p>{copy.bag.subtotal}</p>
            <p className="font-medium">{formatEuro(subtotal, true)}</p>
          </div>
          <div className="mt-4 flex items-center justify-between text-[15px]">
            <p>{copy.bag.shipping}</p>
            <p className="font-medium">{formatEuro(shippingCents, true)}</p>
          </div>
          <div className="mt-5 h-px bg-[#ddded4]" />
          <div className="mt-5 flex items-center justify-between">
            <p className="text-[22px] font-semibold">{copy.bag.total}</p>
            <p className="text-[25px] font-semibold">{formatEuro(total, true)}</p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            className="mt-7 h-[52px] w-full rounded-lg bg-[#191919] text-sm font-semibold text-[#f7f6f0]"
          >
            {copy.checkout.place}
          </button>
          <p className="mt-5 text-[13px] leading-relaxed text-[#696b61]">
            {copy.checkout.demo1}
            <br />
            {copy.checkout.demo2}
          </p>
        </aside>
      </div>
    </section>
  )
}
