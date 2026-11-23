import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage, request } from '../../api/client.ts'
import { AuthPanel } from '../../components/AuthPanel.tsx'

const fieldClass =
  'mt-3 h-[58px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none'

export function ForgotPasswordPage() {
  const [account, setAccount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <AuthPanel
      title={
        <>
          Locked out?
          <br />
          Start again.
        </>
      }
      lede={
        <>
          Use the email or phone
          <br />
          on your account.
        </>
      }
    >
      <h2 className="text-4xl font-semibold">Reset your password.</h2>
      <p className="mt-4 text-base text-[#696b61]">We accept an email address or a phone number.</p>
      {error ? <p className="mt-5 text-sm text-[#9b2c2c]">{error}</p> : null}
      {message ? <p className="mt-5 text-sm text-[#191919]">{message}</p> : null}
      <form
        className="mt-8"
        noValidate
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          const value = account.trim()
          const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          const phone = /^\+?\d{8,15}$/.test(value)
          if (!email && !phone) {
            setError('请填写邮箱或手机号')
            setMessage(null)
            return
          }
          setError(null)
          setMessage(null)
          setPending(true)
          void request<{ success: boolean }>('/v1/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ account: value }),
          })
            .then(() => {
              setMessage('如果账号存在，重置说明会发到这个邮箱或手机号。')
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
          Email or phone
          <input
            className={fieldClass}
            autoComplete="username"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-8 h-[52px] w-full rounded-lg bg-[#191919] text-sm font-semibold text-[#f7f6f0] disabled:opacity-60"
        >
          {pending ? 'Sending' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-6 text-sm leading-relaxed text-[#696b61]">
        Remembered it?{' '}
        <Link to="/login" className="font-medium text-[#191919]">
          Sign in
        </Link>
      </p>
    </AuthPanel>
  )
}
