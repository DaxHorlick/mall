import { Link } from 'react-router-dom'
import type { PublicPost } from '../../types/community.ts'
import { postImageUrl } from '../../utils/community.ts'
import { BoundImage } from '../designs/BoundImage.tsx'

export function PublicPostCard({ post }: { post: PublicPost }) {
  const imageUrl = postImageUrl(post.design)

  return (
    <article className="rounded-[1.5rem] bg-white p-4 shadow-sm">
      <Link to={`/community/${post.id}`} className="block">
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">
          {post.body.trim() ? post.body : '没有正文'}
        </p>
        <h2 className="mt-4 text-base font-medium text-stone-950">{post.design.title}</h2>
        <div className="mt-3">
          {imageUrl ? (
            <BoundImage url={imageUrl} alt={post.design.title} />
          ) : (
            <div className="flex h-52 items-center justify-center rounded-2xl bg-stone-100 px-4 text-center text-sm text-stone-500">
              {post.design.title}
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <Link
          to={`/creators/${post.author.user_id}`}
          className="truncate font-medium text-stone-700 transition-colors hover:text-stone-950"
        >
          {post.author.display_name}
        </Link>
        <p className="shrink-0 text-stone-500">
          {post.like_count} 赞 · {post.comment_count} 评论
        </p>
      </div>
    </article>
  )
}
