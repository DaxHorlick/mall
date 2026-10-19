import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchCreatorById } from '../../api/creators.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { SafeImage } from '../common/SafeImage.tsx'

type ProductCreatorCardProps = {
  creatorId: string
  creatorName: string
}

export function ProductCreatorCard({
  creatorId,
  creatorName,
}: ProductCreatorCardProps) {
  const creatorQuery = useQuery({
    queryKey: queryKeys.creators.detail(creatorId),
    queryFn: () => fetchCreatorById(creatorId),
  })

  const bio =
    creatorQuery.data?.bio ?? '创作者主页将展示更多作品与简介。'
  const avatarUrl =
    creatorQuery.data?.avatarUrl ?? '/images/placeholder-product.svg'

  return (
    <Link
      to={`/creators/${creatorId}`}
      className="flex items-center gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <SafeImage
        src={avatarUrl}
        alt={creatorName}
        className="h-14 w-14 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs tracking-[0.18em] text-stone-400">CREATOR</p>
        <p className="mt-1 truncate text-base font-medium text-stone-950">
          {creatorName}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-stone-500">{bio}</p>
      </div>
      <span className="shrink-0 text-sm text-stone-500">查看主页</span>
    </Link>
  )
}
