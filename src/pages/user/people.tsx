import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/client.ts'
import { useSession } from '../../auth/session.ts'
import { UserNoCopy } from '../../components/UserNoCopy.tsx'
import { useCopy } from '../../i18n/index.ts'
import { changeFollow, fetchPeople, sameUser, type UserList } from '../../profile/api.ts'

export function PeoplePage() {
  const copy = useCopy()
  const { userId } = useParams()
  const { pathname } = useLocation()
  const me = useSession((s) => s.user)
  const followers = pathname.endsWith('/followers')
  const valid = userId === undefined || (/^\d+$/.test(userId) && BigInt(userId) > 0n)
  const listKey = `${userId ?? 'me'}:${followers ? 'followers' : 'following'}`
  const [pageState, setPageState] = useState({ key: listKey, page: 1 })
  const page = pageState.key === listKey ? pageState.page : 1
  const [data, setData] = useState<UserList | null>(null)
  const [loading, setLoading] = useState(valid)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [seenKey, setSeenKey] = useState(listKey)
  if (seenKey !== listKey) {
    setSeenKey(listKey)
    setPageState({ key: listKey, page: 1 })
    setData(null)
    setLoading(valid)
    setLoadError(null)
    setPendingId(null)
    setActionError(null)
  }
  const title = followers ? copy.common.followers : copy.common.following
  const people = data?.list ?? []
  const error = valid ? loadError : copy.common.paramError

  useEffect(() => {
    if (!valid) return
    let gone = false
    const path = userId
      ? `/v1/users/${userId}/${followers ? 'followers' : 'following'}`
      : `/v1/users/me/${followers ? 'followers' : 'following'}`
    void fetchPeople(path, page)
      .then((next) => {
        if (!gone) setData(next)
      })
      .catch((err: unknown) => {
        if (!gone) setLoadError(getErrorMessage(err))
      })
      .finally(() => {
        if (!gone) setLoading(false)
      })
    return () => {
      gone = true
    }
  }, [userId, followers, page, valid, attempt])

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-14">
      <h1 className="text-4xl font-bold">{title}</h1>
      {loading ? <p className="mt-6 text-sm text-[#696b61]">{copy.common.loading}</p> : null}
      {error ? (
        <div className="mt-6">
          <p className="text-sm text-[#9b2c2c]">{error}</p>
          {valid ? (
            <button
              type="button"
              className="mt-3 text-sm font-semibold underline underline-offset-4"
              onClick={() => {
                setLoading(true)
                setLoadError(null)
                setAttempt((current) => current + 1)
              }}
            >
              {copy.common.tryAgain}
            </button>
          ) : null}
        </div>
      ) : null}
      {actionError ? <p className="mt-4 text-sm text-[#9b2c2c]">{actionError}</p> : null}
      {data && people.length === 0 && !error ? (
        <p className="mt-8 text-sm text-[#696b61]">{copy.people.empty}</p>
      ) : null}
      <ul className="mt-8">
        {people.map((person) => {
          const name = person.nickname?.trim() || person.username
          const id = String(person.user_id)
          const pending = pendingId === id
          return (
            <li key={id} className="flex items-center gap-4 border-b border-[#ddded4] py-4">
              <Link to={`/users/${person.user_id}`} className="flex min-w-0 flex-1 items-center gap-4">
                {person.avatar?.trim() ? (
                  <img src={person.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d7fa55] text-sm font-bold">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{name}</span>
                  {person.username ? (
                    <span className="mt-1 block truncate text-sm text-[#696b61]">@{person.username}</span>
                  ) : null}
                  {person.user_no?.trim() ? (
                    <span className="mt-1 block">
                      <UserNoCopy userNo={person.user_no} />
                    </span>
                  ) : null}
                  {person.bio?.trim() ? (
                    <span className="mt-1 block truncate text-sm text-[#696b61]">{person.bio.trim()}</span>
                  ) : null}
                </span>
              </Link>
              {sameUser(me?.user_id, person.user_id) ? null : (
                <button
                  type="button"
                  disabled={pending || pendingId !== null}
                  className="h-10 shrink-0 rounded-lg border border-[#191919] px-4 text-sm font-semibold disabled:opacity-60"
                  onClick={() => {
                    if (pendingId) return
                    setActionError(null)
                    setPendingId(id)
                    void changeFollow(id, !person.is_following)
                      .then((result) => {
                        setData((current) =>
                          current
                            ? {
                                ...current,
                                list: (current.list ?? []).map((item) =>
                                  String(item.user_id) === id
                                    ? { ...item, is_following: result.is_following }
                                    : item,
                                ),
                              }
                            : current,
                        )
                      })
                      .catch((err: unknown) => {
                        setActionError(getErrorMessage(err))
                      })
                      .finally(() => {
                        setPendingId(null)
                      })
                  }}
                >
                  {pending ? copy.common.saving : person.is_following ? copy.common.following : copy.common.follow}
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {data && data.page < data.total_pages ? (
        <button
          type="button"
          className="mt-8 text-sm font-semibold underline underline-offset-4"
          onClick={() => {
            setLoading(true)
            setLoadError(null)
            setPageState((current) => ({
              key: listKey,
              page: (current.key === listKey ? current.page : 1) + 1,
            }))
          }}
        >
          {copy.common.next}
        </button>
      ) : null}
    </div>
  )
}
