import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getErrorMessage, request } from '../../api/client.ts'
import { useSession } from '../../auth/session.ts'
import { AuthPanel } from '../../components/AuthPanel.tsx'

const fieldClass =
  'mt-3 h-[58px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none'

export function ResetPasswordPage() {
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
          Pick a new
          <br />
          password.
        </>
      }
      lede={
        <>
          Then sign in and
          <br />
          get back to it.
        </>
      }
    >
      <h2 className="text-4xl font-semibold">Choose a new password.</h2>
      <p className="mt-4 text-base text-[#696b61]">
        {tokenFromLink ? 'This page is using the token from your reset link.' : 'Paste the token from your reset link.'}
      </p>
      {error ? <p className="mt-5 text-sm text-[#9b2c2c]">{error}</p> : null}
      <form
        className="mt-8"
        noValidate
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          const tokenValue = token.trim()
          if (!tokenValue) {
            setError('令牌不能为空')
            return
          }
          if (!password) {
            setError('新密码不能为空')
            return
          }
          setError(null)
          setPending(true)
          void request<{ success: boolean }>('/v1/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token: tokenValue, new_password: password }),
          })
            .then(() => {
              useSession.getState().signOut('密码已重置，请登录')
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
            Token
            <input
              className={fieldClass}
              autoComplete="off"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </label>
        )}
        <label className={`${tokenFromLink ? '' : 'mt-7'} block text-xs font-semibold`}>
          New password
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
          {pending ? 'Saving' : 'Save password'}
        </button>
      </form>
      <p className="mt-6 text-sm leading-relaxed text-[#696b61]">
        <Link to="/login" className="font-medium text-[#191919]">
          Back to sign in
        </Link>
      </p>
    </AuthPanel>
  )
}
