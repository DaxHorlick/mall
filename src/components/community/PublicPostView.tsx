import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { PostAuthor, PublicPost } from '../../types/community.ts'
import { formatDesignTime } from '../../utils/userDesign.ts'
import { PostDesignCard } from './PostDesignCard.tsx'
import { PostInteraction } from './PostInteraction.tsx'

function AuthorBadge({ author }: { author: PostAuthor }) {
  const [failed, setFailed] = useState(false)
  const initial = Array.from(author.display_name)[0] || Array.from(author.nickname)[0] || '作'

  return (
    <Link to={`/creators/${author.user_id}`} className="flex items-center gap-3">
      {author.avatar_url && !failed ? (
        <img
          src={author.avatar_url}
          alt=""
          className="h-12 w-12 rounded-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-200 text-base font-medium text-stone-700">
          {initial}
        </span>
      )}
      <span>
        <span className="block text-base font-medium text-stone-950">{author.display_name}</span>
        {author.nickname ? (
          <span className="block text-sm text-stone-500">昵称 {author.nickname}</span>
        ) : null}
      </span>
    </Link>
  )
}

export function PublicPostView({ post }: { post: PublicPost }) {
  const publishedAt = formatDesignTime(post.published_at)

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AuthorBadge author={post.author} />
        <Link to="/community" className="text-sm text-stone-500 transition-colors hover:text-stone-950">
          返回手记
        </Link>
      </div>
      <p className="mt-8 whitespace-pre-wrap break-words text-base leading-7 text-stone-800">
        {post.body}
      </p>
      {publishedAt ? <p className="mt-4 text-sm text-stone-400">发布于 {publishedAt}</p> : null}
      <div className="mt-8">
        <PostDesignCard design={post.design} showStatus={false} />
      </div>
      {post.status === 'published' ? <PostInteraction post={post} /> : null}
    </div>
  )
}
