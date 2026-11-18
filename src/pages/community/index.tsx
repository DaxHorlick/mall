import { Link } from 'react-router-dom'
import { products } from '../../shop/products.ts'
import { useShop } from '../../shop/store.ts'

export function CommunityPage() {
  const votes = useShop((s) => s.votes)
  const designs = products.filter((product) => product.votable)

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-9 md:px-14">
      <p className="text-[11px] font-bold">GOOD TASTE. COLLECTIVELY CHOSEN.</p>
      <h1 className="mt-3 text-5xl font-bold leading-tight md:text-[62px]">You call the next drop.</h1>
      <p className="mt-4 text-lg text-[#696b61]">
        Vote for a reprint of your favorite. Independent ideas deserve another round.
      </p>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-3">
        {designs.map((product) => {
          const voted = votes.includes(product.slug)
          return (
            <article key={product.slug}>
              <img src={product.image} alt="" className="h-[360px] w-full rounded-[10px] object-cover" />
              <p className="mt-5 text-[10px] font-bold text-[#696b61]">NEXT REPRINT / COMMUNITY VOTE</p>
              <h2 className="mt-2 text-[22px] font-semibold">{product.name}</h2>
              <button
                type="button"
                className={`mt-4 h-[52px] w-full rounded-lg border border-[#ddded4] px-4 text-left text-sm font-semibold ${voted ? 'bg-[#d7fa55]' : 'bg-[#f7f6f0]'}`}
                onClick={() => useShop.getState().toggleVote(product.slug)}
              >
                {voted ? 'Voted · Click to undo' : 'Vote for this reprint ↑'}
              </button>
            </article>
          )
        })}
        <aside className="flex min-h-[520px] flex-col rounded-[10px] bg-[#eceee3] p-7">
          <p className="text-[11px] font-bold">PEOPLE OVER ALGORITHMS.</p>
          <h2 className="mt-5 text-4xl font-semibold leading-tight">
            A little vote.
            <br />
            A big difference.
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-[#696b61]">
            Your favorites help independent creators decide what comes next.
          </p>
          <p className="mt-5 text-[17px] leading-relaxed text-[#696b61]">
            Explore. Vote. Wear something original.
          </p>
          <Link
            to="/studio"
            className="mt-auto inline-flex h-[52px] items-center rounded-lg bg-[#191919] px-5 text-sm font-semibold text-[#f7f6f0]"
          >
            Bring your own idea ↗
          </Link>
        </aside>
      </div>
      <p className="mt-8 text-xs text-[#696b61]">Prototype votes are saved only for this preview session.</p>
    </section>
  )
}
