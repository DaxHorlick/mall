import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../components/ProductCard.tsx'
import { useCopy } from '../../i18n/index.ts'
import { campaignImage, products, studioImage } from '../../shop/products.ts'

export function HomePage() {
  const copy = useCopy()
  const [filter, setFilter] = useState<'trending' | 'new' | 'community'>('trending')
  const visible =
    filter === 'trending'
      ? products
      : products.filter((product) => product.group === filter)

  return (
    <div>
      <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-10 md:px-14 lg:grid-cols-[minmax(0,660px)_minmax(0,640px)] lg:py-8">
        <div>
          <p className="text-xs font-bold">{copy.home.eyebrow}</p>
          <h1 className="mt-6 text-5xl font-bold leading-[1.01] tracking-[-0.04em] md:text-7xl lg:text-[86px]">
            {copy.home.heroTitle1}
            <br />
            {copy.home.heroTitle2}
          </h1>
          <p className="mt-6 max-w-lg text-[19px] leading-relaxed text-[#696b61]">
            {copy.home.lede1}
            <br />
            {copy.home.lede2}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/explore"
              className="inline-flex h-[54px] items-center rounded-lg bg-[#191919] px-6 text-[15px] font-semibold text-[#f7f6f0]"
            >
              {copy.home.explore}
            </Link>
            <Link
              to="/studio"
              className="inline-flex h-[54px] items-center rounded-lg border border-[#c5c6bc] bg-[#f7f6f0] px-6 text-[15px] font-semibold"
            >
              {copy.home.create}
            </Link>
          </div>
          <p className="mt-8 text-[11px] font-semibold text-[#696b61]">{copy.home.note}</p>
        </div>
        <div className="relative">
          <img src={campaignImage} alt="" className="h-[420px] w-full rounded-2xl object-cover sm:h-[520px] lg:h-[578px]" />
          <p className="absolute bottom-6 left-6 rounded-md bg-[#f7f6f0] px-4 py-4 text-[11px] font-bold">
            {copy.home.badge}
          </p>
          <p className="absolute right-4 top-4 flex size-24 items-center justify-center rounded-full bg-[#d7fa55] text-center text-[13px] font-bold leading-tight md:size-28">
            {copy.home.batch1}
            <br />
            {copy.home.batch2}
            <br />
            {copy.home.batch3}
          </p>
        </div>
      </section>

      <section className="overflow-x-auto bg-[#d7fa55]">
        <p className="mx-auto max-w-[1440px] whitespace-nowrap px-5 py-6 text-[15px] font-bold md:px-12">
          {copy.home.marquee}
        </p>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-14 md:px-14">
        <p className="text-[11px] font-bold">{copy.home.good}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold md:text-[42px]">{copy.home.fresh}</h2>
          <Link to="/explore" className="text-sm font-semibold">
            {copy.home.exploreAll}
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className={`h-[38px] rounded-full px-4 text-xs font-medium ${filter === 'trending' ? 'bg-[#191919] text-white' : 'bg-[#eaeae2] text-[#191919]'}`}
            onClick={() => setFilter('trending')}
          >
            {copy.home.trending}
          </button>
          <button
            type="button"
            className={`h-[38px] rounded-full px-4 text-xs font-medium ${filter === 'new' ? 'bg-[#191919] text-white' : 'bg-[#eaeae2] text-[#191919]'}`}
            onClick={() => setFilter('new')}
          >
            {copy.home.newArrivals}
          </button>
          <button
            type="button"
            className={`h-[38px] rounded-full px-4 text-xs font-medium ${filter === 'community' ? 'bg-[#191919] text-white' : 'bg-[#eaeae2] text-[#191919]'}`}
            onClick={() => setFilter('community')}
          >
            {copy.home.communityFav}
          </button>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} place="home" />
          ))}
        </div>
      </section>

      <section className="bg-[#eceee4]">
        <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-14">
          <p className="text-[11px] font-bold">{copy.steps.eyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold md:text-[44px]">{copy.steps.title}</h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">01</p>
              <h3 className="mt-4 text-[27px] font-semibold">{copy.steps.oneTitle}</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">{copy.steps.oneBody}</p>
            </div>
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">02</p>
              <h3 className="mt-4 text-[27px] font-semibold">{copy.steps.twoTitle}</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">{copy.steps.twoBody}</p>
            </div>
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">03</p>
              <h3 className="mt-4 text-[27px] font-semibold">{copy.steps.threeTitle}</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">{copy.steps.threeBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-14 md:px-14 lg:grid-cols-2">
        <img src={studioImage} alt="" className="h-[360px] w-full rounded-xl object-cover" />
        <div>
          <p className="text-[11px] font-bold">{copy.home.communityEyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-[42px]">
            {copy.home.communityTitle1}
            <br />
            {copy.home.communityTitle2}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#696b61]">{copy.home.communityBody}</p>
          <Link
            to="/community"
            className="mt-8 inline-flex h-[52px] items-center rounded-lg bg-[#191919] px-6 text-sm font-semibold text-[#f7f6f0]"
          >
            {copy.home.meet}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-16 md:px-14">
        <div className="border-t border-[#d7d9ce] pt-14">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <p className="text-[11px] font-bold text-[#68705b]">{copy.home.intent}</p>
              <h3 className="mt-5 text-[25px] font-semibold">{copy.home.intentTitle}</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#696b61]">{copy.home.intentBody}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#68705b]">{copy.home.people}</p>
              <h3 className="mt-5 text-[25px] font-semibold">{copy.home.peopleTitle}</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#696b61]">{copy.home.peopleBody}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#68705b]">{copy.home.everyday}</p>
              <h3 className="mt-5 text-[25px] font-semibold">{copy.home.everydayTitle}</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#696b61]">{copy.home.everydayBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#d7fa55]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-14 md:py-16">
          <p className="text-[11px] font-bold">{copy.home.ideasEyebrow}</p>
          <h2 className="mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.03em] md:text-[60px]">
            {copy.home.ideasTitle1}
            <br />
            {copy.home.ideasTitle2}
          </h2>
          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[17px]">{copy.home.ideasBody}</p>
            <Link
              to="/studio"
              className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-lg bg-[#191919] px-6 text-sm font-semibold text-[#f7f6f0]"
            >
              {copy.home.start}
            </Link>
          </div>
          <p className="mt-6 text-[11px] font-semibold">{copy.home.ideasNote}</p>
        </div>
      </section>
    </div>
  )
}
