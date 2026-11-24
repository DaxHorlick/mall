import { Link } from 'react-router-dom'
import { useCopy } from '../../i18n/index.ts'
import { products } from '../../shop/products.ts'
import { useShop } from '../../shop/store.ts'

export function CommunityPage() {
  const copy = useCopy()
  const votes = useShop((s) => s.votes)
  const designs = products.filter((product) => product.votable)

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-9 md:px-14">
      <p className="text-[11px] font-bold">{copy.community.eyebrow}</p>
      <h1 className="mt-3 text-5xl font-bold leading-tight md:text-[62px]">{copy.community.title}</h1>
      <p className="mt-4 text-lg text-[#696b61]">{copy.community.lede}</p>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-3">
        {designs.map((product) => {
          const voted = votes.includes(product.slug)
          return (
            <article key={product.slug}>
              <img src={product.image} alt="" className="h-[360px] w-full rounded-[10px] object-cover" />
              <p className="mt-5 text-[10px] font-bold text-[#696b61]">{copy.community.reprint}</p>
              <h2 className="mt-2 text-[22px] font-semibold">{copy.catalog[product.slug].name}</h2>
              <button
                type="button"
                className={`mt-4 h-[52px] w-full rounded-lg border border-[#ddded4] px-4 text-left text-sm font-semibold ${voted ? 'bg-[#d7fa55]' : 'bg-[#f7f6f0]'}`}
                onClick={() => useShop.getState().toggleVote(product.slug)}
              >
                {voted ? copy.community.voted : copy.community.vote}
              </button>
            </article>
          )
        })}
        <aside className="flex min-h-[520px] flex-col rounded-[10px] bg-[#eceee3] p-7">
          <p className="text-[11px] font-bold">{copy.community.asideEyebrow}</p>
          <h2 className="mt-5 text-4xl font-semibold leading-tight">
            {copy.community.asideTitle1}
            <br />
            {copy.community.asideTitle2}
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-[#696b61]">{copy.community.asideBody1}</p>
          <p className="mt-5 text-[17px] leading-relaxed text-[#696b61]">{copy.community.asideBody2}</p>
          <Link
            to="/studio"
            className="mt-auto inline-flex h-[52px] items-center rounded-lg bg-[#191919] px-5 text-sm font-semibold text-[#f7f6f0]"
          >
            {copy.community.bring}
          </Link>
        </aside>
      </div>
      <p className="mt-8 text-xs text-[#696b61]">{copy.community.note}</p>
    </section>
  )
}
