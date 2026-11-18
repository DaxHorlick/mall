import { Link } from 'react-router-dom'
import { emptyBagImage, formatEuro, goodsCents, products, shippingCents } from '../../shop/products.ts'
import { useShop } from '../../shop/store.ts'

export function BagPage() {
  const lines = useShop((s) => s.lines)
  const subtotal = goodsCents(lines.map((line) => line.slug))
  const total = subtotal + shippingCents

  if (lines.length === 0) {
    return (
      <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 md:px-14 lg:grid-cols-[minmax(0,1fr)_464px]">
        <div>
          <p className="text-xs font-bold">ROOM FOR SOMETHING ORIGINAL.</p>
          <h1 className="mt-6 text-5xl font-bold leading-[1.15] md:text-7xl">
            Your next favorite
            <br />
            is out there.
          </h1>
          <p className="mt-6 max-w-xl text-[19px] text-[#696b61]">
            Your bag is empty. Find a design that feels a little more like you.
          </p>
          <Link
            to="/explore"
            className="mt-8 inline-flex h-[52px] items-center rounded-lg bg-[#191919] px-5 text-sm font-semibold text-[#f7f6f0]"
          >
            Explore the designs ↗
          </Link>
        </div>
        <img src={emptyBagImage} alt="" className="h-[360px] w-full rounded-xl object-cover sm:h-[495px]" />
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-14">
      <p className="text-[11px] font-bold">GOOD CHOICES. GREAT TASTE.</p>
      <h1 className="mt-3 text-5xl font-bold md:text-[62px]">Your bag.</h1>
      <p className="mt-5 text-xs font-bold text-[#696b61]">
        {lines.length} {lines.length === 1 ? 'ITEM' : 'ITEMS'} / MADE JUST FOR YOU
      </p>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_448px]">
        <div>
          <div className="h-px bg-[#ddded4]" />
          {lines.map((line) => {
            const product = products.find((item) => item.slug === line.slug)
            if (!product) return null
            return (
              <div key={line.slug} className="grid gap-6 border-b border-[#ddded4] py-8 sm:grid-cols-[260px_minmax(0,1fr)]">
                <img src={product.image} alt="" className="h-[268px] w-full rounded-lg object-cover sm:w-[260px]" />
                <div>
                  <h2 className="text-[25px] font-semibold">{product.name}</h2>
                  <p className="mt-6 text-sm">by {product.creator}</p>
                  <p className="mt-4 text-sm">
                    <span className="text-[#696b61]">Size</span>
                    <span className="ml-4 font-medium">M</span>
                    <span className="ml-8">{product.color}</span>
                  </p>
                  <p className="mt-4 text-sm">Quantity 1</p>
                  <button
                    type="button"
                    className="mt-6 h-[52px] rounded-lg border border-[#ddded4] bg-[#f7f6f0] px-5 text-sm font-semibold"
                    onClick={() => useShop.getState().removeLine(product.slug)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
          <Link
            to="/explore"
            className="mt-8 inline-flex h-[52px] items-center rounded-lg border border-[#ddded4] bg-[#f7f6f0] px-5 text-sm font-semibold"
          >
            ← Continue exploring
          </Link>
        </div>
        <aside className="rounded-[10px] bg-[#eceee3] p-7">
          <h2 className="text-[23px] font-semibold">The good stuff, summed up.</h2>
          <div className="mt-8 flex items-center justify-between text-[15px]">
            <p>Subtotal</p>
            <p className="font-medium">{formatEuro(subtotal, true)}</p>
          </div>
          <div className="mt-5 flex items-center justify-between text-[15px]">
            <p>Shipping</p>
            <p className="font-medium">{formatEuro(shippingCents, true)}</p>
          </div>
          <div className="mt-5 h-px bg-[#ddded4]" />
          <div className="mt-5 flex items-center justify-between">
            <p className="text-[21px] font-semibold">Total</p>
            <p className="text-[23px] font-semibold">{formatEuro(total, true)}</p>
          </div>
          <Link
            to="/checkout"
            className="mt-7 flex h-[52px] items-center rounded-lg bg-[#191919] px-5 text-sm font-semibold text-[#f7f6f0]"
          >
            Go to checkout ↗
          </Link>
          <p className="mt-5 text-[13px] text-[#696b61]">Made to order. Taxes included.</p>
        </aside>
      </div>
    </section>
  )
}
