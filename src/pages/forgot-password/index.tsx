import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage, request } from '../../api/client.ts'
import { AuthPanel } from '../../components/AuthPanel.tsx'
import { useCopy } from '../../i18n/index.ts'

const fieldClass =
  'mt-3 h-[58px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none'

export function ForgotPasswordPage() {
  const copy = useCopy()
  const [account, setAccount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <AuthPanel
      title={
        <>
          {copy.forgot.title1}
          <br />
          {copy.forgot.title2}
        </>
      }
      lede={
        <>
          {copy.forgot.lede1}
          <br />
          {copy.forgot.lede2}
        </>
      }
    >
      <h2 className="text-4xl font-semibold">{copy.forgot.heading}</h2>
      <p className="mt-4 text-base text-[#696b61]">{copy.forgot.lede}</p>
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
            setError(copy.forgot.invalid)
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
              setMessage(copy.forgot.sent)
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
          {copy.forgot.label}
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
          {pending ? copy.forgot.pending : copy.forgot.submit}
        </button>
      </form>
      <p className="mt-6 text-sm leading-relaxed text-[#696b61]">
        {copy.forgot.remembered}{' '}
        <Link to="/login" className="font-medium text-[#191919]">
          {copy.forgot.signIn}
        </Link>
      </p>
    </AuthPanel>
  )
}
