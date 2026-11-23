import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage, request } from '../../api/client.ts'
import { useSession, type User } from '../../auth/session.ts'
import { AuthPanel } from '../../components/AuthPanel.tsx'

const fieldClass =
  'mt-3 h-[58px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none'

type LoginResult = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

export function LoginPage() {
  const notice = useSession((s) => s.notice)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const banner = error ?? notice

  return (
    <AuthPanel
      title={
        <>
          Good ideas
          <br />
          start here.
        </>
      }
      lede={
        <>
          Make something original.
          <br />
          Find your people.
          <br />
          Wear your kind of weird.
        </>
      }
    >
      <h2 className="text-4xl font-semibold">Welcome to Dezajn.</h2>
      <p className="mt-4 text-base text-[#696b61]">Sign in with your username, phone, or email.</p>
      {banner ? <p className="mt-5 text-sm text-[#9b2c2c]">{banner}</p> : null}
      <form
        className="mt-8"
        noValidate
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          const accountValue = account.trim()
          if (!accountValue || !password) {
            setError('账号或密码不能为空')
            return
          }
          if (accountValue.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountValue)) {
            setError('邮箱不合法')
            return
          }
          if (
            !accountValue.includes('@') &&
            !/^1\d{10}$/.test(accountValue) &&
            Array.from(accountValue).length > 50
          ) {
            setError('账号不合法')
            return
          }
          setError(null)
          useSession.getState().clearNotice()
          setPending(true)
          void request<LoginResult>('/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ account: accountValue, password }),
          })
            .then((data) => {
              useSession.getState().signIn(data.access_token, data.refresh_token, data.user)
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
          Account
          <input
            className={fieldClass}
            autoComplete="username"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
          />
        </label>
        <label className="mt-7 block text-xs font-semibold">
          Password
          <input
            type="password"
            className={fieldClass}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-8 h-[52px] w-full rounded-lg bg-[#191919] text-sm font-semibold text-[#f7f6f0] disabled:opacity-60"
        >
          {pending ? 'Signing in' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-sm leading-relaxed text-[#696b61]">
        <Link to="/forgot-password" className="font-medium text-[#191919]">
          Forgot password?
        </Link>
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[#696b61]">
        Need an account?{' '}
        <Link to="/register" className="font-medium text-[#191919]">
          Register
        </Link>
      </p>
    </AuthPanel>
  )
}
