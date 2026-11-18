import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../components/ProductCard.tsx'
import { campaignImage, products, studioImage } from '../../shop/products.ts'

export function HomePage() {
  const [filter, setFilter] = useState<'trending' | 'new' | 'community'>('trending')
  const visible =
    filter === 'trending'
      ? products
      : products.filter((product) => product.group === filter)

  return (
    <div>
      <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-10 md:px-14 lg:grid-cols-[minmax(0,660px)_minmax(0,640px)] lg:py-8">
        <div>
          <p className="text-xs font-bold">INDEPENDENT DESIGN. EVERYDAY EXPRESSION.</p>
          <h1 className="mt-6 text-5xl font-bold leading-[1.01] tracking-[-0.04em] md:text-7xl lg:text-[86px]">
            Wear your
            <br />
            kind of weird.
          </h1>
          <p className="mt-6 max-w-lg text-[19px] leading-relaxed text-[#696b61]">
            Original ideas. Really good tees.
            <br />
            Made by independent minds, worn by you.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/explore"
              className="inline-flex h-[54px] items-center rounded-lg bg-[#191919] px-6 text-[15px] font-semibold text-[#f7f6f0]"
            >
              Explore the designs ↗
            </Link>
            <Link
              to="/studio"
              className="inline-flex h-[54px] items-center rounded-lg border border-[#c5c6bc] bg-[#f7f6f0] px-6 text-[15px] font-semibold"
            >
              Create your own
            </Link>
          </div>
          <p className="mt-8 text-[11px] font-semibold text-[#696b61]">
            NO MASS PRODUCTION. NO BORING CLOTHES.
          </p>
        </div>
        <div className="relative">
          <img src={campaignImage} alt="" className="h-[420px] w-full rounded-2xl object-cover sm:h-[520px] lg:h-[578px]" />
          <p className="absolute bottom-6 left-6 rounded-md bg-[#f7f6f0] px-4 py-4 text-[11px] font-bold">
            GOOD IDEAS, GREAT TEES.
          </p>
          <p className="absolute right-4 top-4 flex size-24 items-center justify-center rounded-full bg-[#d7fa55] text-center text-[13px] font-bold leading-tight md:size-28">
            SMALL
            <br />
            BATCH.
            <br />
            BIG ENERGY.
          </p>
        </div>
      </section>

      <section className="overflow-x-auto bg-[#d7fa55]">
        <p className="mx-auto max-w-[1440px] whitespace-nowrap px-5 py-6 text-[15px] font-bold md:px-12">
          NOT FOR EVERYONE. JUST FOR YOU. ✳ DESIGNED BY PEOPLE, NOT TRENDS. ✳ WEAR SOMETHING ORIGINAL.
        </p>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-14 md:px-14">
        <p className="text-[11px] font-bold">THE GOOD STUFF</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold md:text-[42px]">Fresh from independent minds.</h2>
          <Link to="/explore" className="text-sm font-semibold">
            Explore all designs ↗
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className={`h-[38px] rounded-full px-4 text-xs font-medium ${filter === 'trending' ? 'bg-[#191919] text-white' : 'bg-[#eaeae2] text-[#191919]'}`}
            onClick={() => setFilter('trending')}
          >
            Trending
          </button>
          <button
            type="button"
            className={`h-[38px] rounded-full px-4 text-xs font-medium ${filter === 'new' ? 'bg-[#191919] text-white' : 'bg-[#eaeae2] text-[#191919]'}`}
            onClick={() => setFilter('new')}
          >
            New arrivals
          </button>
          <button
            type="button"
            className={`h-[38px] rounded-full px-4 text-xs font-medium ${filter === 'community' ? 'bg-[#191919] text-white' : 'bg-[#eaeae2] text-[#191919]'}`}
            onClick={() => setFilter('community')}
          >
            Community favorites
          </button>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} tag={product.homeTag} />
          ))}
        </div>
      </section>

      <section className="bg-[#eceee4]">
        <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-14">
          <p className="text-[11px] font-bold">FROM YOUR HEAD TO YOUR WARDROBE</p>
          <h2 className="mt-4 text-3xl font-semibold md:text-[44px]">Good ideas deserve to be worn.</h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">01</p>
              <h3 className="mt-4 text-[27px] font-semibold">Find your thing.</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">
                Discover original designs from independent creatives. Find the one that feels like you.
              </p>
            </div>
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">02</p>
              <h3 className="mt-4 text-[27px] font-semibold">Make it yours.</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">
                Pick your fit, color and size. Your favorite idea, on your new favorite everyday piece.
              </p>
            </div>
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">03</p>
              <h3 className="mt-4 text-[27px] font-semibold">We bring it to life.</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">
                Printed just for you, only when you order. Less excess. More self-expression.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-14 md:px-14 lg:grid-cols-2">
        <img src={studioImage} alt="" className="h-[360px] w-full rounded-xl object-cover" />
        <div>
          <p className="text-[11px] font-bold">THE COMMUNITY CALLS IT</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-[42px]">
            Great taste.
            <br />
            Collectively chosen.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#696b61]">
            Help the next great design find its people. Explore new ideas, vote for your favorites, and
            shape what drops next.
          </p>
          <Link
            to="/community"
            className="mt-8 inline-flex h-[52px] items-center rounded-lg bg-[#191919] px-6 text-sm font-semibold text-[#f7f6f0]"
          >
            Meet the community ↗
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-16 md:px-14">
        <div className="border-t border-[#d7d9ce] pt-14">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <p className="text-[11px] font-bold text-[#68705b]">01 / MADE WITH INTENTION</p>
              <h3 className="mt-5 text-[25px] font-semibold">Printed when you want it.</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#696b61]">
                No warehouses full of maybes. Every piece is made to order, with less left behind.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#68705b]">02 / PEOPLE OVER ALGORITHMS</p>
              <h3 className="mt-5 text-[25px] font-semibold">Independent by design.</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#696b61]">
                Every design starts with a real person. Your purchase supports their next idea.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#68705b]">03 / YOUR NEW EVERYDAY FAVORITE</p>
              <h3 className="mt-5 text-[25px] font-semibold">Feels as good as it looks.</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#696b61]">
                Thoughtfully selected fabrics, easy fits and prints made for repeat wear.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#d7fa55]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-14 md:py-16">
          <p className="text-[11px] font-bold">FOR THE ONES WITH IDEAS</p>
          <h2 className="mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.03em] md:text-[60px]">
            Your next big idea.
            <br />
            Someone’s favorite tee.
          </h2>
          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[17px]">You bring the creativity. We handle the printing, shipping and the rest.</p>
            <Link
              to="/studio"
              className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-lg bg-[#191919] px-6 text-sm font-semibold text-[#f7f6f0]"
            >
              Start creating ↗
            </Link>
          </div>
          <p className="mt-6 text-[11px] font-semibold">NO STOCK. NO UPFRONT COSTS. ALL YOU.</p>
        </div>
      </section>
    </div>
  )
}
