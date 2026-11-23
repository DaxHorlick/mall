import { useEffect, useState, type FormEvent } from 'react'
import { getErrorMessage, request } from '../../api/client.ts'
import { useSession, type User } from '../../auth/session.ts'
import { AuthPanel } from '../../components/AuthPanel.tsx'

const fieldClass =
  'mt-3 h-[58px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none'

export function AccountPage() {
  const user = useSession((s) => s.user)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordPending, setPasswordPending] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [leavingAll, setLeavingAll] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const created = user?.created_at ? new Date(user.created_at) : null
  const createdLabel =
    created && !Number.isNaN(created.getTime())
      ? created.toLocaleString('zh-CN', { hour12: false })
      : (user?.created_at ?? '—')
  const name = user?.nickname?.trim() || user?.username || 'Your account'

  useEffect(() => {
    let gone = false
    void request<User>('/v1/auth/me', { auth: true })
      .then((me) => {
        if (gone) return
        const { accessToken, refreshToken } = useSession.getState()
        if (accessToken && refreshToken) useSession.getState().signIn(accessToken, refreshToken, me)
      })
      .catch((err: unknown) => {
        if (!gone) setLoadError(getErrorMessage(err))
      })
    return () => {
      gone = true
    }
  }, [])

  return (
    <AuthPanel
      title={
        <>
          This is
          <br />
          your place.
        </>
      }
      lede={
        <>
          Your name, your sign-in,
          <br />
          and the way back out.
        </>
      }
    >
      <h2 className="text-4xl font-semibold">{name}</h2>
      <p className="mt-4 text-base text-[#696b61]">Signed in on this browser.</p>
      {loadError ? <p className="mt-5 text-sm text-[#9b2c2c]">{loadError}</p> : null}
      {user?.avatar ? (
        <img src={user.avatar} alt="" className="mt-8 h-20 w-20 rounded-full object-cover" />
      ) : null}
      <dl className="mt-8 grid gap-5 text-sm">
        <div>
          <dt className="text-xs font-semibold">Username</dt>
          <dd className="mt-2 text-base">{user?.username || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold">Email</dt>
          <dd className="mt-2 text-base">{user?.email || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold">Phone</dt>
          <dd className="mt-2 text-base">{user?.phone || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold">Status</dt>
          <dd className="mt-2 text-base">{user?.status ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold">Joined</dt>
          <dd className="mt-2 text-base">{createdLabel}</dd>
        </div>
      </dl>

      <h2 className="mt-12 text-4xl font-semibold">Password</h2>
      {passwordError ? <p className="mt-5 text-sm text-[#9b2c2c]">{passwordError}</p> : null}
      {passwordMessage ? <p className="mt-5 text-sm text-[#191919]">{passwordMessage}</p> : null}
      <form
        className="mt-8"
        noValidate
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          if (!oldPassword || !newPassword) {
            setPasswordError('旧密码和新密码不能为空')
            setPasswordMessage(null)
            return
          }
          setPasswordError(null)
          setPasswordMessage(null)
          setPasswordPending(true)
          void request<{ success: boolean }>('/v1/auth/change-password', {
            method: 'POST',
            auth: true,
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
          })
            .then(() => {
              setOldPassword('')
              setNewPassword('')
              setPasswordMessage('密码已更新')
            })
            .catch((err: unknown) => {
              setPasswordError(getErrorMessage(err))
            })
            .finally(() => {
              setPasswordPending(false)
            })
        }}
      >
        <label className="block text-xs font-semibold">
          Current password
          <input
            type="password"
            className={fieldClass}
            autoComplete="current-password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
          />
        </label>
        <label className="mt-7 block text-xs font-semibold">
          New password
          <input
            type="password"
            className={fieldClass}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={passwordPending}
          className="mt-8 h-[52px] w-full rounded-lg bg-[#191919] text-sm font-semibold text-[#f7f6f0] disabled:opacity-60"
        >
          {passwordPending ? 'Updating' : 'Update password'}
        </button>
      </form>

      <h2 className="mt-12 text-4xl font-semibold">Sign out</h2>
      {logoutError ? <p className="mt-5 text-sm text-[#9b2c2c]">{logoutError}</p> : null}
      <button
        type="button"
        disabled={leaving || leavingAll}
        className="mt-8 h-[52px] w-full rounded-lg bg-[#191919] text-sm font-semibold text-[#f7f6f0] disabled:opacity-60"
        onClick={() => {
          const refreshToken = useSession.getState().refreshToken
          if (!refreshToken) {
            useSession.getState().signOut(null)
            return
          }
          setLogoutError(null)
          setLeaving(true)
          void request<{ success: boolean }>('/v1/auth/logout', {
            method: 'POST',
            auth: true,
            skipRefresh: true,
            body: JSON.stringify({ refresh_token: refreshToken }),
          })
            .then(() => {
              useSession.getState().signOut(null)
            })
            .catch((err: unknown) => {
              if (useSession.getState().status === 'anonymous') return
              setLogoutError(getErrorMessage(err))
              setLeaving(false)
            })
        }}
      >
        {leaving ? 'Signing out' : 'Sign out'}
      </button>
      <button
        type="button"
        disabled={leaving || leavingAll}
        className="mt-3 h-[52px] w-full rounded-lg border border-[#c5c6bc] bg-transparent text-sm font-semibold disabled:opacity-60"
        onClick={() => {
          setLogoutError(null)
          setLeavingAll(true)
          void request<{ success: boolean }>('/v1/auth/logout-all', {
            method: 'POST',
            auth: true,
            skipRefresh: true,
          })
            .then(() => {
              useSession.getState().signOut(null)
            })
            .catch((err: unknown) => {
              if (useSession.getState().status === 'anonymous') return
              setLogoutError(getErrorMessage(err))
              setLeavingAll(false)
            })
        }}
      >
        {leavingAll ? 'Signing out' : 'Sign out of all devices'}
      </button>
    </AuthPanel>
  )
}
