import { Link } from 'react-router-dom'
import type { Creator } from '../../types/user.ts'
import { SafeImage } from '../common/SafeImage.tsx'

type HotCreatorsSectionProps = {
  creators: Creator[]
}

function formatFollowers(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k 关注`
  }
  return `${count} 关注`
}

export function HotCreatorsSection({ creators }: HotCreatorsSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 pb-20 md:px-8 md:py-14 md:pb-24">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            HOT CREATORS
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            热门创作者
          </h2>
        </div>
        <Link
          to="/marketplace"
          className="text-sm text-stone-500 transition-colors hover:text-stone-950"
        >
          发现更多
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {creators.map((creator) => (
          <Link
            key={creator.id}
            to={`/creators/${creator.id}`}
            className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <SafeImage
              src={creator.avatarUrl}
              alt={creator.name}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <h3 className="truncate text-base font-medium text-stone-950">
                {creator.name}
              </h3>
              <p className="mt-1 line-clamp-1 text-sm text-stone-500">
                {creator.bio}
              </p>
              <p className="mt-2 text-xs text-stone-400">
                {creator.productCount} 件商品 · {formatFollowers(creator.followerCount)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
