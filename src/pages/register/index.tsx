import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage, request } from '../../api/client.ts'
import { useSession } from '../../auth/session.ts'
import { AuthPanel } from '../../components/AuthPanel.tsx'

const fieldClass =
  'mt-3 h-[58px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none'

export function RegisterPage() {
  const navigate = useNavigate()
  const notice = useSession((s) => s.notice)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const banner = error ?? notice

  return (
    <AuthPanel
      title={
        <>
          Join the
          <br />
          weird ones.
        </>
      }
      lede={
        <>
          A username and a password.
          <br />
          Email and phone can wait.
        </>
      }
    >
      <h2 className="text-4xl font-semibold">Create your account.</h2>
      <p className="mt-4 text-base text-[#696b61]">Email and phone are optional.</p>
      {banner ? <p className="mt-5 text-sm text-[#9b2c2c]">{banner}</p> : null}
      <form
        className="mt-8"
        noValidate
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          const name = username.trim()
          const emailValue = email.trim()
          const phoneValue = phone.trim()
          if (!name || !password) {
            setError('用户名和密码不能为空')
            return
          }
          if (/\s/u.test(name) || name.includes('@') || Array.from(name).length > 50) {
            setError('用户名不合法')
            return
          }
          if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            setError('邮箱不合法')
            return
          }
          const body: { username: string; password: string; email?: string; phone?: string } = {
            username: name,
            password,
          }
          if (emailValue) body.email = emailValue
          if (phoneValue) body.phone = phoneValue
          setError(null)
          useSession.getState().clearNotice()
          setPending(true)
          void request<{ user_id: number; username: string }>('/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify(body),
          })
            .then(() => {
              useSession.getState().setNotice('账号已创建，请登录')
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
        <label className="block text-xs font-semibold">
          Username
          <input
            className={fieldClass}
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label className="mt-7 block text-xs font-semibold">
          Email
          <input
            type="email"
            className={fieldClass}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="mt-7 block text-xs font-semibold">
          Phone
          <input
            className={fieldClass}
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
        <label className="mt-7 block text-xs font-semibold">
          Password
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
          {pending ? 'Creating account' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-sm leading-relaxed text-[#696b61]">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-[#191919]">
          Sign in
        </Link>
      </p>
    </AuthPanel>
  )
}
