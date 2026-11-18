import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage, request } from '../../api/client.ts'
import { useSession, type User } from '../../auth/session.ts'

export function LoginPage() {
  const notice = useSession((s) => s.notice)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const banner = error ?? notice

  return (
    <section className="mx-auto grid max-w-[1440px] items-start gap-10 px-5 py-12 md:px-14 lg:grid-cols-[minmax(0,640px)_minmax(0,560px)] lg:justify-between lg:py-[50px]">
      <div className="rounded-xl bg-[#d7fa55] px-9 py-10 text-[#191919] lg:min-h-[666px]">
        <p className="text-xs font-bold">MADE FOR SELF-EXPRESSION.</p>
        <h1 className="mt-16 max-w-md text-5xl font-bold leading-[1.15] md:text-[70px] md:leading-[1.2]">
          Good ideas
          <br />
          start here.
        </h1>
        <p className="mt-16 max-w-md text-2xl font-medium leading-snug">
          Make something original.
          <br />
          Find your people.
          <br />
          Wear your kind of weird.
        </p>
      </div>
      <div className="lg:pt-7">
        <h2 className="text-4xl font-semibold">Welcome to Dezajn.</h2>
        <p className="mt-4 text-base text-[#696b61]">
          Sign in with your username, phone, or email.
        </p>
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
            if (
              accountValue.includes('@') &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountValue)
            ) {
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
            const deviceName = navigator.userAgent.slice(0, 100) || 'Web'
            void request<{ access_token: string; expires_in: number; user: User }>(
              '/v1/auth/login',
              {
                method: 'POST',
                body: JSON.stringify({
                  account: accountValue,
                  password,
                  device_type: 'web',
                  device_name: deviceName,
                }),
              },
            )
              .then((data) => {
                useSession.getState().signIn(data.access_token, data.user)
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
              className="mt-3 h-[58px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none"
              autoComplete="username"
              value={account}
              onChange={(event) => setAccount(event.target.value)}
            />
          </label>
          <label className="mt-7 block text-xs font-semibold">
            Password
            <input
              type="password"
              className="mt-3 h-[58px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none"
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
          Need an account?{' '}
          <Link to="/register" className="font-medium text-[#191919]">
            Register
          </Link>
        </p>
      </div>
    </section>
  )
}
