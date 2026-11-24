import { Link } from 'react-router-dom'
import { useCopy } from '../../i18n/index.ts'

export function HowItWorksPage() {
  const copy = useCopy()

  return (
    <div>
      <section className="bg-[#eceee4]">
        <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-14">
          <p className="text-[11px] font-bold">{copy.steps.eyebrow}</p>
          <h1 className="mt-4 text-3xl font-semibold md:text-[44px]">{copy.steps.title}</h1>
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">01</p>
              <h2 className="mt-4 text-[27px] font-semibold">{copy.steps.oneTitle}</h2>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">{copy.steps.oneBody}</p>
            </div>
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">02</p>
              <h2 className="mt-4 text-[27px] font-semibold">{copy.steps.twoTitle}</h2>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">{copy.steps.twoBody}</p>
            </div>
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">03</p>
              <h2 className="mt-4 text-[27px] font-semibold">{copy.steps.threeTitle}</h2>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">{copy.steps.threeBody}</p>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-14">
        <Link
          to="/explore"
          className="inline-flex h-[54px] items-center rounded-lg bg-[#191919] px-6 text-[15px] font-semibold text-[#f7f6f0]"
        >
          {copy.home.explore}
        </Link>
      </div>
    </div>
  )
}
