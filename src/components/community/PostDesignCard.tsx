import { Link } from 'react-router-dom'
import type { DesignReviewStatus, DesignVisibility } from '../../types/userDesign.ts'
import { REVIEW_STATUS_LABEL, VISIBILITY_LABEL } from '../../utils/userDesign.ts'
import { postImageUrl } from '../../utils/community.ts'
import { BoundImage } from '../designs/BoundImage.tsx'

type PostDesignCardProps = {
  design: {
    id: number
    title: string
    result: { url: string } | null
    preview: { url: string } | null
    visibility?: DesignVisibility
    review_status?: DesignReviewStatus
  }
  showStatus: boolean
}

export function PostDesignCard({ design, showStatus }: PostDesignCardProps) {
  const imageUrl = postImageUrl(design)

  return (
    <section className="rounded-[1.5rem] bg-white p-4 shadow-sm">
      <p className="text-xs tracking-[0.18em] text-stone-400">DESIGN</p>
      <h2 className="mt-2 text-lg font-medium text-stone-950">{design.title}</h2>
      {showStatus && design.visibility && design.review_status ? (
        <p className="mt-1 text-sm text-stone-500">
          {VISIBILITY_LABEL[design.visibility]} · {REVIEW_STATUS_LABEL[design.review_status]}
        </p>
      ) : null}
      <div className="mt-4">
        {imageUrl ? (
          <BoundImage url={imageUrl} alt={design.title} />
        ) : (
          <div className="flex h-52 items-center justify-center rounded-2xl bg-stone-100 px-4 text-center text-sm text-stone-500">
            {design.title}
          </div>
        )}
      </div>
      <Link
        to={`/designs/${design.id}`}
        className="mt-4 inline-block text-sm text-stone-500 transition-colors hover:text-stone-950"
      >
        查看设计
      </Link>
    </section>
  )
}
