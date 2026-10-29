import { Link } from 'react-router-dom'

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-[#111111] text-stone-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 20%, rgba(255,255,255,0.18), transparent 42%), radial-gradient(circle at 82% 10%, rgba(255,255,255,0.08), transparent 36%), linear-gradient(135deg, rgba(255,255,255,0.05), transparent 50%)',
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:py-24">
        <div>
          <p className="text-xs font-medium tracking-[0.24em] text-stone-400">
            INKTEE · AI PERSONALIZED TEE
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            把一句话，印成一件 T 恤
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-stone-300">
            看看已经公开的创作手记，读一件作品背后的说明。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/community"
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-white px-5 text-sm font-medium text-stone-950 transition hover:bg-stone-200"
            >
              看创作手记
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-800 shadow-2xl shadow-black/40">
            <img
              src="/images/products/tee-limited.svg"
              alt="INKTEE 主视觉 T 恤"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-3 rounded-2xl bg-white px-4 py-3 text-stone-950 shadow-lg md:-left-6">
            <p className="text-xs tracking-[0.16em] text-stone-400">NOTES</p>
            <p className="mt-1 text-sm font-medium">作品背后的说明</p>
          </div>
        </div>
      </div>
    </section>
  )
}
