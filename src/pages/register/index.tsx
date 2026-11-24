import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage, request } from '../../api/client.ts'
import { useSession } from '../../auth/session.ts'
import { AuthPanel } from '../../components/AuthPanel.tsx'
import { useCopy } from '../../i18n/index.ts'

const fieldClass =
  'mt-3 h-[58px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none'

export function RegisterPage() {
  const text = useCopy()
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
          {text.register.title1}
          <br />
          {text.register.title2}
        </>
      }
      lede={
        <>
          {text.register.lede1}
          <br />
          {text.register.lede2}
        </>
      }
    >
      <h2 className="text-4xl font-semibold">{text.register.heading}</h2>
      <p className="mt-4 text-base text-[#696b61]">{text.register.lede}</p>
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
            setError(text.register.empty)
            return
          }
          if (/\s/u.test(name) || name.includes('@') || Array.from(name).length > 50) {
            setError(text.register.username)
            return
          }
          if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            setError(text.register.email)
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
              useSession.getState().setNotice(text.register.created)
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
          {text.register.usernameLabel}
          <input
            className={fieldClass}
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label className="mt-7 block text-xs font-semibold">
          {text.register.emailLabel}
          <input
            type="email"
            className={fieldClass}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="mt-7 block text-xs font-semibold">
          {text.register.phone}
          <input
            className={fieldClass}
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
        <label className="mt-7 block text-xs font-semibold">
          {text.register.password}
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
          {pending ? text.register.pending : text.register.submit}
        </button>
      </form>
      <p className="mt-6 text-sm leading-relaxed text-[#696b61]">
        {text.register.already}{' '}
        <Link to="/login" className="font-medium text-[#191919]">
          {text.register.signIn}
        </Link>
      </p>
    </AuthPanel>
  )
}
