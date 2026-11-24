import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client.ts'
import { useSession } from '../../auth/session.ts'
import { UserNoCopy } from '../../components/UserNoCopy.tsx'
import { useCopy } from '../../i18n/index.ts'
import { fetchMyProfile, saveMyProfile, type Profile, type ProfilePatch } from '../../profile/api.ts'

const fieldClass =
  'mt-3 h-[52px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none'

export function EditProfilePage() {
  const copy = useCopy()
  const navigate = useNavigate()
  const [base, setBase] = useState<Profile | null>(null)
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('')
  const [cover, setCover] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState(0)
  const [birthday, setBirthday] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let gone = false
    void fetchMyProfile()
      .then((me) => {
        if (gone) return
        setBase(me)
        setNickname(me.nickname ?? '')
        setAvatar(me.avatar ?? '')
        setCover(me.cover_image ?? '')
        setBio(me.bio ?? '')
        setLocation(me.location ?? '')
        setGender(me.gender ?? 0)
        setBirthday(me.birthday ?? '')
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
    <div className="mx-auto max-w-xl px-5 py-12 md:px-14">
      <Link to="/profile" className="text-sm font-semibold underline underline-offset-4">
        {copy.edit.back}
      </Link>
      <h1 className="mt-6 text-4xl font-bold">{copy.edit.title}</h1>
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
      {base ? (
        <form
          className="mt-8"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (nickname.length > 50) {
              setError(copy.edit.nicknameMax)
              setMessage(null)
              return
            }
            if (avatar.length > 500) {
              setError(copy.edit.avatarMax)
              setMessage(null)
              return
            }
            if (cover.length > 500) {
              setError(copy.edit.coverMax)
              setMessage(null)
              return
            }
            if (bio.length > 500) {
              setError(copy.edit.bioMax)
              setMessage(null)
              return
            }
            if (location.length > 100) {
              setError(copy.edit.locationMax)
              setMessage(null)
              return
            }
            if (![0, 1, 2, 3].includes(gender)) {
              setError(copy.edit.genderRequired)
              setMessage(null)
              return
            }
            if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
              setError(copy.edit.birthdayFormat)
              setMessage(null)
              return
            }
            const body: ProfilePatch = {}
            if (nickname !== (base.nickname ?? '')) body.nickname = nickname
            if (avatar !== (base.avatar ?? '')) body.avatar = avatar
            if (cover !== (base.cover_image ?? '')) body.cover_image = cover
            if (bio !== (base.bio ?? '')) body.bio = bio
            if (location !== (base.location ?? '')) body.location = location
            if (gender !== (base.gender ?? 0)) body.gender = gender
            if (birthday !== (base.birthday ?? '')) body.birthday = birthday
            if (Object.keys(body).length === 0) {
              setError(null)
              setMessage(copy.edit.unchanged)
              return
            }
            setError(null)
            setMessage(null)
            setPending(true)
            void saveMyProfile(body)
              .then((me) => {
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
                navigate('/profile')
              })
              .catch((err: unknown) => {
                setError(getErrorMessage(err))
              })
              .finally(() => {
                setPending(false)
              })
          }}
        >
          <label className="block text-xs font-semibold">
            {copy.edit.nickname}
            <input className={fieldClass} maxLength={50} value={nickname} onChange={(event) => setNickname(event.target.value)} />
          </label>
          <label className="mt-6 block text-xs font-semibold">
            {copy.edit.avatar}
            <input className={fieldClass} maxLength={500} value={avatar} onChange={(event) => setAvatar(event.target.value)} />
          </label>
          <label className="mt-6 block text-xs font-semibold">
            {copy.edit.cover}
            <input className={fieldClass} maxLength={500} value={cover} onChange={(event) => setCover(event.target.value)} />
          </label>
          <label className="mt-6 block text-xs font-semibold">
            {copy.edit.bio}
            <textarea
              className="mt-3 min-h-28 w-full rounded-lg border border-[#ddded4] bg-transparent px-4 py-3 text-base outline-none"
              maxLength={500}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </label>
          <fieldset className="mt-6">
            <legend className="text-xs font-semibold">{copy.edit.gender}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  [0, copy.gender.unknown],
                  [1, copy.gender.male],
                  [2, copy.gender.female],
                  [3, copy.gender.other],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`h-10 rounded-lg px-4 text-sm font-semibold ${
                    gender === value ? 'bg-[#191919] text-[#f7f6f0]' : 'border border-[#ddded4]'
                  }`}
                  onClick={() => setGender(Number(value))}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="mt-6 block text-xs font-semibold">
            {copy.edit.birthday}
            <input
              type="date"
              className={fieldClass}
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
            />
          </label>
          {birthday ? (
            <button type="button" className="mt-3 text-sm font-semibold underline underline-offset-4" onClick={() => setBirthday('')}>
              {copy.edit.clearBirthday}
            </button>
          ) : null}
          <label className="mt-6 block text-xs font-semibold">
            {copy.edit.location}
            <input className={fieldClass} maxLength={100} value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          {base.user_no?.trim() ? (
            <p className="mt-6">
              <UserNoCopy userNo={base.user_no} />
            </p>
          ) : null}
          <p className="mt-6 text-sm text-[#696b61]">
            {[base.username ? `@${base.username}` : '', base.email, base.phone].filter(Boolean).join('  ·  ')}
          </p>
          {error ? <p className="mt-6 text-sm text-[#9b2c2c]">{error}</p> : null}
          {message ? <p className="mt-6 text-sm text-[#191919]">{message}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-4 h-[52px] w-full rounded-lg bg-[#191919] text-sm font-semibold text-[#f7f6f0] disabled:opacity-60"
          >
            {pending ? copy.common.saving : copy.common.save}
          </button>
        </form>
      ) : null}
    </div>
  )
}
