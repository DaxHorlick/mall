import { Link } from 'react-router-dom'

export function HowItWorksPage() {
  return (
    <div>
      <section className="bg-[#eceee4]">
        <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-14">
          <p className="text-[11px] font-bold">FROM YOUR HEAD TO YOUR WARDROBE</p>
          <h1 className="mt-4 text-3xl font-semibold md:text-[44px]">Good ideas deserve to be worn.</h1>
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">01</p>
              <h2 className="mt-4 text-[27px] font-semibold">Find your thing.</h2>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">
                Discover original designs from independent creatives. Find the one that feels like you.
              </p>
            </div>
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">02</p>
              <h2 className="mt-4 text-[27px] font-semibold">Make it yours.</h2>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">
                Pick your fit, color and size. Your favorite idea, on your new favorite everyday piece.
              </p>
            </div>
            <div className="border-t border-[#c5c9ba] pt-6">
              <p className="text-5xl text-[#7a8366]">03</p>
              <h2 className="mt-4 text-[27px] font-semibold">We bring it to life.</h2>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-[#62685a]">
                Printed just for you, only when you order. Less excess. More self-expression.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-14">
        <Link
          to="/explore"
          className="inline-flex h-[54px] items-center rounded-lg bg-[#191919] px-6 text-[15px] font-semibold text-[#f7f6f0]"
        >
          Explore the designs ↗
        </Link>
      </div>
    </div>
  )
}
