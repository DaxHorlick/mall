/** TanStack Query 缓存键，集中维护便于失效与复用 */
export const queryKeys = {
  creators: {
    all: ['creators'] as const,
    me: ['creators', 'me'] as const,
    publicProfile: (userId: string) => ['creators', 'public', userId] as const,
  },
  designs: {
    all: ['designs'] as const,
    mine: (limit: number) => ['designs', 'mine', limit] as const,
    publicList: (limit: number) => ['designs', 'public', limit] as const,
    record: (id: string) => ['designs', 'record', id] as const,
    generations: (id: string) => ['designs', 'generations', id] as const,
  },
  community: {
    all: ['community'] as const,
    publicList: (limit: number, authorUserId?: number) =>
      ['community', 'posts', 'public', limit, authorUserId ?? null] as const,
    mine: (limit: number) => ['community', 'posts', 'mine', limit] as const,
    post: (id: string) => ['community', 'posts', 'record', id] as const,
    comments: (id: string, limit: number) =>
      ['community', 'posts', 'comments', id, limit] as const,
  },
} as const
