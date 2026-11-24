import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/client.ts'
import { useSession } from '../../auth/session.ts'
import { UserNoCopy } from '../../components/UserNoCopy.tsx'
import { useCopy } from '../../i18n/index.ts'
import {
  changeFollow,
  fetchPublicProfile,
  genderLabel,
  sameUser,
  type PublicProfile,
} from '../../profile/api.ts'

export function UserPage() {
  const copy = useCopy()
  const { userId = '' } = useParams()
  const me = useSession((s) => s.user)
  const valid = /^\d+$/.test(userId) && BigInt(userId) > 0n
  const mine = sameUser(me?.user_id, userId)
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(valid)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [seenId, setSeenId] = useState(userId)
  if (seenId !== userId) {
    setSeenId(userId)
    setProfile(null)
    setLoading(valid)
    setLoadError(null)
    setActionError(null)
    setPending(false)
  }
  const name = profile?.nickname?.trim() || profile?.username || copy.user.profile
  const initial = name.slice(0, 1).toUpperCase()
  const facts = [profile?.location?.trim(), genderLabel(profile?.gender)].filter(Boolean).join('  ·  ')
  const error = valid ? loadError : copy.common.paramError

  useEffect(() => {
    if (!valid) return
    let gone = false
    void fetchPublicProfile(userId)
      .then((next) => {
        if (!gone) setProfile(next)
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
  }, [userId, valid, attempt])

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-[1440px] px-5 pt-8 md:px-14">
        {valid && loading && !profile ? <p className="text-sm text-[#696b61]">{copy.common.loadingProfile}</p> : null}
        {profile ? (
          <>
            <div className="h-48 overflow-hidden rounded-xl bg-[#eceee3] md:h-72">
              {profile.cover_image?.trim() ? (
                <img src={profile.cover_image} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex flex-col gap-5 px-1 sm:px-4 md:flex-row md:items-end">
              <div className="-mt-14 flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#f7f6f0] bg-[#d7fa55] text-3xl font-bold md:-mt-16 md:h-36 md:w-36">
                {profile.avatar?.trim() ? (
                  <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div className="min-w-0 pb-1 md:pb-3">
                <h1 className="text-4xl font-bold leading-none md:text-5xl">{name}</h1>
                {profile.user_no?.trim() ? (
                  <p className="mt-3">
                    <UserNoCopy userNo={profile.user_no} />
                  </p>
                ) : null}
                {profile.username ? <p className="mt-3 text-sm text-[#696b61]">@{profile.username}</p> : null}
                {profile.bio?.trim() ? (
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-[#696b61]">{profile.bio.trim()}</p>
                ) : null}
                {facts ? <p className="mt-3 text-sm text-[#696b61]">{facts}</p> : null}
                {mine ? (
                  <Link to="/profile/edit" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
                    {copy.account.edit}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={pending}
                    className="mt-4 h-10 rounded-lg bg-[#191919] px-4 text-sm font-semibold text-[#f7f6f0] disabled:opacity-60"
                    onClick={() => {
                      setActionError(null)
                      setPending(true)
                      void changeFollow(userId, !profile.is_following)
                        .then((result) => {
                          setProfile((current) =>
                            current ? { ...current, is_following: result.is_following } : current,
                          )
                          return fetchPublicProfile(userId)
                        })
                        .then((next) => {
                          setProfile(next)
                        })
                        .catch((err: unknown) => {
                          setActionError(getErrorMessage(err))
                        })
                        .finally(() => {
                          setPending(false)
                        })
                    }}
                  >
                    {pending ? copy.common.saving : profile.is_following ? copy.common.following : copy.common.follow}
                  </button>
                )}
                {actionError ? <p className="mt-3 text-sm text-[#9b2c2c]">{actionError}</p> : null}
              </div>
              <dl className="flex gap-10 md:mb-3 md:ml-auto">
                <Link to={`/users/${userId}/following`}>
                  <dt className="text-xs font-bold uppercase text-[#696b61]">{copy.common.following}</dt>
                  <dd className="mt-1 text-2xl font-semibold">{profile.following_count}</dd>
                </Link>
                <Link to={`/users/${userId}/followers`}>
                  <dt className="text-xs font-bold uppercase text-[#696b61]">{copy.common.followers}</dt>
                  <dd className="mt-1 text-2xl font-semibold">{profile.followers_count}</dd>
                </Link>
                <div>
                  <dt className="text-xs font-bold uppercase text-[#696b61]">{copy.common.posts}</dt>
                  <dd className="mt-1 text-2xl font-semibold">{profile.post_count}</dd>
                </div>
              </dl>
            </div>
          </>
        ) : null}
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
      </div>
    </div>
  )
}
