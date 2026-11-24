import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../api/client.ts'
import { useSession } from '../../auth/session.ts'
import { UserNoCopy } from '../../components/UserNoCopy.tsx'
import { useCopy } from '../../i18n/index.ts'
import { fetchMyProfile, statusLabel, type Profile } from '../../profile/api.ts'

export function AccountPage() {
  const copy = useCopy()
  const sessionUser = useSession((s) => s.user)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const shown = profile ?? sessionUser
  const name = shown?.nickname?.trim() || shown?.username || copy.account.yourProfile
  const initial = name.slice(0, 1).toUpperCase()
  const birthdayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(shown?.birthday ?? '')
  const birthdayLabel = birthdayMatch
    ? copy.account.birthday(birthdayMatch[1], birthdayMatch[2], birthdayMatch[3])
    : ''
  const facts = [shown?.location?.trim(), birthdayLabel].filter(Boolean).join('  ·  ')
  const gender = shown?.gender
  const accountLine = [shown?.email, shown?.phone, statusLabel(shown?.status)]
    .filter(Boolean)
    .join('  ·  ')

  useEffect(() => {
    let gone = false
    void fetchMyProfile()
      .then((me) => {
        if (gone) return
        setProfile(me)
        useSession.getState().patchUser({
          user_id: me.user_id,
          username: me.username,
          user_no: me.user_no,
          nickname: me.nickname,
          avatar: me.avatar ?? '',
          cover_image: me.cover_image,
          bio: me.bio,
          gender: me.gender,
          birthday: me.birthday,
          location: me.location,
          email: me.email,
          phone: me.phone,
          status: me.status,
          following_count: me.following_count,
          followers_count: me.followers_count,
          post_count: me.post_count,
        })
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
  }, [attempt])

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-[1440px] px-5 pt-8 md:px-14">
        <div className="h-48 overflow-hidden rounded-xl bg-[#eceee3] md:h-72">
          {shown?.cover_image?.trim() ? (
            <img src={shown.cover_image} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="flex flex-col gap-5 px-1 sm:px-4 md:flex-row md:items-end">
          <div className="-mt-14 flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#f7f6f0] bg-[#d7fa55] text-3xl font-bold md:-mt-16 md:h-36 md:w-36">
            {shown?.avatar?.trim() ? (
              <img src={shown.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0 pb-1 md:pb-3">
            {facts || gender === 1 || gender === 2 || gender === 3 ? (
              <p className="flex items-center gap-2 text-sm text-[#696b61]">
                {facts ? <span>{facts}</span> : null}
                {gender === 1 ? (
                  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-label={copy.gender.male}>
                    <circle cx="6.2" cy="10" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8.4 7.8 12.6 3.6M9.6 3.6h3v3" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                ) : null}
                {gender === 2 ? (
                  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-label={copy.gender.female}>
                    <circle cx="8" cy="6" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 9.1V14M6 12h4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                ) : null}
                {gender === 3 ? (
                  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-label={copy.gender.other}>
                    <circle cx="8" cy="8" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 1.8v2.2M8 12v2.2M1.8 8h2.2M12 8h2.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                ) : null}
              </p>
            ) : null}
            {accountLine ? <p className="mt-2 text-sm text-[#696b61]">{accountLine}</p> : null}
            {shown?.bio?.trim() ? (
              <p className="mt-2 max-w-xl text-base leading-relaxed text-[#696b61]">{shown.bio.trim()}</p>
            ) : null}
            <Link to="/profile/edit" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
              {copy.account.edit}
            </Link>
          </div>
          <div className="flex flex-col items-end gap-4 self-end md:mb-3 md:ml-auto">
            <h1 className="text-right text-4xl font-bold leading-none md:text-5xl">{name}</h1>
            {shown?.user_no?.trim() ? <UserNoCopy userNo={shown.user_no} /> : null}
            <dl className="flex gap-10">
              <Link to="/profile/following">
                <dt className="text-xs font-bold uppercase text-[#696b61]">{copy.common.following}</dt>
                <dd className="mt-1 text-2xl font-semibold">{profile ? profile.following_count : '—'}</dd>
              </Link>
              <Link to="/profile/followers">
                <dt className="text-xs font-bold uppercase text-[#696b61]">{copy.common.followers}</dt>
                <dd className="mt-1 text-2xl font-semibold">{profile ? profile.followers_count : '—'}</dd>
              </Link>
              <div>
                <dt className="text-xs font-bold uppercase text-[#696b61]">{copy.common.posts}</dt>
                <dd className="mt-1 text-2xl font-semibold">{profile ? profile.post_count : '—'}</dd>
              </div>
            </dl>
          </div>
        </div>
        {loading ? <p className="mt-6 text-sm text-[#696b61]">{copy.common.loadingProfile}</p> : null}
        {loadError ? (
          <div className="mt-6">
            <p className="text-sm text-[#9b2c2c]">{loadError}</p>
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
          </div>
        ) : null}
      </div>

      <div className="mx-auto mt-12 grid max-w-[1440px] gap-8 px-5 md:px-14 lg:grid-cols-2">
        <section className="rounded-xl bg-[#eceee3] px-7 py-8">
          <p className="text-[11px] font-bold">{copy.account.designs}</p>
          <h2 className="mt-3 text-3xl font-semibold">{copy.account.designsTitle}</h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#696b61]">{copy.account.designsBody}</p>
        </section>
        <section className="rounded-xl border border-[#ddded4] px-7 py-8">
          <p className="text-[11px] font-bold">{copy.account.made}</p>
          <h2 className="mt-3 text-3xl font-semibold">{copy.account.madeTitle}</h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#696b61]">{copy.account.madeBody}</p>
        </section>
      </div>
    </div>
  )
}
