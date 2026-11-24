import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getErrorMessage, request } from '../../api/client.ts'
import { useSession } from '../../auth/session.ts'
import { AuthPanel } from '../../components/AuthPanel.tsx'
import { useCopy } from '../../i18n/index.ts'

const fieldClass =
  'mt-3 h-[58px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none'

export function ResetPasswordPage() {
  const copy = useCopy()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tokenFromLink = params.get('token') ?? ''
  const [token, setToken] = useState(tokenFromLink)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <AuthPanel
      title={
        <>
          {copy.reset.title1}
          <br />
          {copy.reset.title2}
        </>
      }
      lede={
        <>
          {copy.reset.lede1}
          <br />
          {copy.reset.lede2}
        </>
      }
    >
      <h2 className="text-4xl font-semibold">{copy.reset.heading}</h2>
      <p className="mt-4 text-base text-[#696b61]">
        {tokenFromLink ? copy.reset.usingToken : copy.reset.pasteToken}
      </p>
      {error ? <p className="mt-5 text-sm text-[#9b2c2c]">{error}</p> : null}
      <form
        className="mt-8"
        noValidate
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          const tokenValue = token.trim()
          if (!tokenValue) {
            setError(copy.reset.emptyToken)
            return
          }
          if (!password) {
            setError(copy.reset.emptyPassword)
            return
          }
          setError(null)
          setPending(true)
          void request<{ success: boolean }>('/v1/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token: tokenValue, new_password: password }),
          })
            .then(() => {
              useSession.getState().signOut(copy.reset.done)
              navigate('/login')
            })
            .catch((err: unknown) => {
              setError(getErrorMessage(err))
            })
            .finally(() => {
              setPending(false)
            })
        }}
      >
        {tokenFromLink ? null : (
          <label className="block text-xs font-semibold">
            {copy.reset.token}
            <input
              className={fieldClass}
              autoComplete="off"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </label>
        )}
        <label className={`${tokenFromLink ? '' : 'mt-7'} block text-xs font-semibold`}>
          {copy.reset.password}
          <input
            type="password"
            className={fieldClass}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-8 h-[52px] w-full rounded-lg bg-[#191919] text-sm font-semibold text-[#f7f6f0] disabled:opacity-60"
        >
          {pending ? copy.reset.pending : copy.reset.submit}
        </button>
      </form>
      <p className="mt-6 text-sm leading-relaxed text-[#696b61]">
        <Link to="/login" className="font-medium text-[#191919]">
          {copy.reset.back}
        </Link>
      </p>
    </AuthPanel>
  )
}
