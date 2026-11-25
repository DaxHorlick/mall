import { useState, type FormEvent } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { getErrorMessage, request } from '../api/client.ts'
import { useSession } from '../auth/session.ts'
import { useCopy, useLocale } from '../i18n/index.ts'

const fieldClass =
  'mt-3 h-[52px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none'

export function SiteHeader() {
  const { pathname } = useLocation()
  const home = pathname === '/'
  const copy = useCopy()
  const locale = useLocale((state) => state.locale)
  const setLocale = useLocale((state) => state.setLocale)
  const status = useSession((s) => s.status)
  const user = useSession((s) => s.user)
  const username = user?.username?.trim() || user?.nickname?.trim() || copy.common.user
  const [openPath, setOpenPath] = useState<string | null>(null)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordPending, setPasswordPending] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const open = openPath === pathname
  const links = home
    ? [
        { to: '/explore', label: copy.nav.explore },
        { to: '/how-it-works', label: copy.nav.how },
        { to: '/studio', label: copy.nav.creators },
      ]
    : [
        { to: '/explore', label: copy.nav.explore },
        { to: '/how-it-works', label: copy.nav.how },
        { to: '/community', label: copy.nav.community },
      ]

  return (
    <header className="sticky top-0 z-40 bg-[#f7f6f0]">
      <div
        className={`mx-auto flex max-w-[1440px] items-center px-5 md:px-14 ${home ? 'h-[88px]' : 'h-24'}`}
      >
        <NavLink to="/" className="text-[32px] font-black leading-none text-[#191919] md:text-[36px]">
          hlstudio
        </NavLink>
        <nav className="ml-12 hidden items-center gap-10 text-sm font-medium text-[#191919] xl:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm font-medium text-[#191919] xl:gap-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={locale === 'zh' ? 'font-bold' : 'text-[#696b61]'}
              onClick={() => setLocale('zh')}
            >
              中文
            </button>
            <span className="text-[#c5c6bc]">/</span>
            <button
              type="button"
              className={locale === 'en' ? 'font-bold' : 'text-[#696b61]'}
              onClick={() => setLocale('en')}
            >
              EN
            </button>
          </div>
          <div className="hidden items-center gap-8 xl:flex">
            <NavLink to="/bag">{copy.nav.bag}</NavLink>
            <NavLink
              to="/studio"
              className="inline-flex h-12 items-center rounded-lg bg-[#191919] px-4 text-sm font-semibold text-[#f7f6f0]"
            >
              {copy.nav.start}
            </NavLink>
          </div>
          {status === 'loading' ? (
            <span className="inline-block h-8 w-16" />
          ) : status === 'authenticated' && user ? (
            <div className="relative z-50">
              <button type="button" className="peer block h-8 w-8 p-0" aria-label={username}>
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d7fa55] text-xs font-bold">
                    {username.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </button>
              <div className="pointer-events-none absolute right-0 top-full w-44 origin-top-right translate-y-1 scale-95 pt-2 opacity-0 shadow-none transition duration-200 ease-out peer-hover:pointer-events-auto peer-hover:translate-y-0 peer-hover:scale-100 peer-hover:opacity-100 peer-hover:shadow-[0_12px_32px_rgba(25,25,25,0.08)] hover:pointer-events-auto hover:translate-y-0 hover:scale-100 hover:opacity-100 hover:shadow-[0_12px_32px_rgba(25,25,25,0.08)]">
                <div className="overflow-hidden rounded-lg border border-[#ddded4] bg-[#f7f6f0] py-1 text-sm">
                  <NavLink to="/profile" className="block px-4 py-2.5 hover:bg-[#eceee3]">
                    {copy.nav.account}
                  </NavLink>
                  <NavLink to="/search" className="block px-4 py-2.5 hover:bg-[#eceee3]">
                    {copy.nav.search}
                  </NavLink>
                  <NavLink to="/designer" className="block px-4 py-2.5 hover:bg-[#eceee3]">
                    {copy.nav.designer}
                  </NavLink>
                  <NavLink to="/profile/addresses" className="block px-4 py-2.5 hover:bg-[#eceee3]">
                    {copy.nav.addresses}
                  </NavLink>
                  <button
                    type="button"
                    className="block w-full px-4 py-2.5 text-left hover:bg-[#eceee3]"
                    onClick={() => {
                      setPasswordError(null)
                      setPasswordMessage(null)
                      setPasswordOpen(true)
                    }}
                  >
                    {copy.nav.changePassword}
                  </button>
                  <button
                    type="button"
                    disabled={leaving}
                    className="block w-full px-4 py-2.5 text-left hover:bg-[#eceee3] disabled:opacity-60"
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
                    {leaving ? copy.nav.signingOut : copy.nav.signOut}
                  </button>
                  {logoutError ? <p className="px-4 py-2 text-xs text-[#9b2c2c]">{logoutError}</p> : null}
                </div>
              </div>
            </div>
          ) : (
            <NavLink to="/login">{copy.nav.signIn}</NavLink>
          )}
        </div>
        <button
          type="button"
          className="ml-4 text-sm font-medium text-[#191919] xl:hidden"
          aria-expanded={open}
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          {open ? copy.common.close : copy.common.menu}
        </button>
      </div>
      {open ? (
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 pb-5 text-sm font-medium text-[#191919] md:px-14 xl:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/bag">{copy.nav.bag}</NavLink>
          <NavLink
            to="/studio"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[#191919] px-4 text-sm font-semibold text-[#f7f6f0]"
          >
            {copy.nav.start}
          </NavLink>
        </div>
      ) : null}
      <div className="mx-auto max-w-[1440px] px-5 md:px-14">
        <div className="h-px bg-[#ddded4]" />
      </div>
      {passwordOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#191919]/40 p-4 sm:items-center"
          onClick={() => setPasswordOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-[#f7f6f0] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{copy.password.title}</h2>
              <button type="button" className="text-sm font-semibold" onClick={() => setPasswordOpen(false)}>
                {copy.common.close}
              </button>
            </div>
            {passwordError ? <p className="mt-5 text-sm text-[#9b2c2c]">{passwordError}</p> : null}
            {passwordMessage ? <p className="mt-5 text-sm text-[#191919]">{passwordMessage}</p> : null}
            <form
              className="mt-6"
              noValidate
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault()
                if (!oldPassword || !newPassword) {
                  setPasswordError(copy.password.empty)
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
                    setPasswordMessage(copy.password.updated)
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
                {copy.password.current}
                <input
                  type="password"
                  className={fieldClass}
                  autoComplete="current-password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                />
              </label>
              <label className="mt-5 block text-xs font-semibold">
                {copy.password.next}
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
                className="mt-6 h-[52px] w-full rounded-lg bg-[#191919] text-sm font-semibold text-[#f7f6f0] disabled:opacity-60"
              >
                {passwordPending ? copy.password.updating : copy.password.submit}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </header>
  )
}
