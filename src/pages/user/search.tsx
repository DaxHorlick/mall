import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/client.ts'
import { useSession } from '../../auth/session.ts'
import { UserNoCopy } from '../../components/UserNoCopy.tsx'
import { useCopy } from '../../i18n/index.ts'
import { changeFollow, sameUser, searchUsers, type UserList } from '../../profile/api.ts'

export function SearchPage() {
  const copy = useCopy()
  const me = useSession((s) => s.user)
  const [params, setParams] = useSearchParams()
  const keyword = (params.get('keyword') ?? '').trim()
  const pageNumber = Number(params.get('page'))
  const page = Number.isInteger(pageNumber) && pageNumber >= 1 ? pageNumber : 1
  const queryKey = keyword.length > 0 && keyword.length <= 50 ? `${keyword}:${page}` : ''
  const [draft, setDraft] = useState(keyword)
  const [seenKeyword, setSeenKeyword] = useState(keyword)
  if (seenKeyword !== keyword) {
    setSeenKeyword(keyword)
    setDraft(keyword)
  }
  const [formError, setFormError] = useState<string | null>(null)
  const [data, setData] = useState<UserList | null>(null)
  const [loading, setLoading] = useState(queryKey !== '')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [seenKey, setSeenKey] = useState(queryKey)
  if (seenKey !== queryKey) {
    setSeenKey(queryKey)
    setData(null)
    setLoading(queryKey !== '')
    setLoadError(null)
    setPendingId(null)
    setActionError(null)
  }
  const people = Array.isArray(data?.list) ? data.list : []
  const urlError =
    params.has('keyword') && keyword.length === 0
      ? copy.search.emptyKeyword
      : keyword.length > 50
        ? copy.search.keywordMax
        : null

  useEffect(() => {
    if (!queryKey) return
    let gone = false
    void searchUsers(keyword, page)
      .then((next) => {
        if (!gone) setData({ ...next, list: Array.isArray(next?.list) ? next.list : [] })
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
  }, [queryKey, keyword, page, attempt])

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-14">
      <h1 className="text-4xl font-bold">{copy.search.title}</h1>
      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const next = draft.trim()
          if (!next) {
            setFormError(copy.search.emptyKeyword)
            setParams({})
            return
          }
          if (next.length > 50) {
            setFormError(copy.search.keywordMax)
            return
          }
          setFormError(null)
          const same = next === keyword && page === 1
          setParams({ keyword: next, page: '1' })
          if (same) {
            setLoading(true)
            setLoadError(null)
            setAttempt((current) => current + 1)
          }
        }}
      >
        <input
          className="h-[52px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none"
          maxLength={50}
          value={draft}
          placeholder={copy.search.placeholder}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          type="submit"
          className="h-[52px] shrink-0 rounded-lg bg-[#191919] px-6 text-sm font-semibold text-[#f7f6f0]"
        >
          {copy.search.submit}
        </button>
      </form>
      {formError || urlError ? <p className="mt-6 text-sm text-[#9b2c2c]">{formError ?? urlError}</p> : null}
      {loading ? <p className="mt-6 text-sm text-[#696b61]">{copy.common.loading}</p> : null}
      {loadError ? (
        <div className="mt-6">
          <p className="text-sm text-[#9b2c2c]">{loadError}</p>
          {queryKey ? (
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
      {data && people.length === 0 && !loadError ? (
        <p className="mt-8 text-sm text-[#696b61]">{copy.search.empty}</p>
      ) : null}
      <ul className="mt-8">
        {people.map((person) => {
          const name = person.nickname?.trim() || person.username
          const id = String(person.user_id)
          const pending = pendingId === id
          return (
            <li key={id} className="flex items-center gap-4 border-b border-[#ddded4] py-4">
              <Link to={`/users/${id}`} className="flex min-w-0 flex-1 items-center gap-4">
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
            setParams({ keyword, page: String(data.page + 1) })
          }}
        >
          {copy.common.next}
        </button>
      ) : null}
    </div>
  )
}
