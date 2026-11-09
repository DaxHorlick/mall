import { Alert, Button, Input } from 'antd'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage, request } from '../../api/client.ts'
import { useSession, type User } from '../../auth/session.ts'

const tenMinutes = 10 * 60 * 1000

export function RegisterPage() {
  const notice = useSession((s) => s.notice)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [phoneHint, setPhoneHint] = useState<string | null>(null)
  const [phoneSentFor, setPhoneSentFor] = useState<string | null>(null)
  const [phoneVerified, setPhoneVerified] = useState<{ target: string; at: number } | null>(null)
  const [phoneSending, setPhoneSending] = useState(false)
  const [phoneVerifying, setPhoneVerifying] = useState(false)
  const [email, setEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [emailHint, setEmailHint] = useState<string | null>(null)
  const [emailSentFor, setEmailSentFor] = useState<string | null>(null)
  const [emailVerified, setEmailVerified] = useState<{ target: string; at: number } | null>(null)
  const [emailSending, setEmailSending] = useState(false)
  const [emailVerifying, setEmailVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const banner = error ?? notice

  useEffect(() => {
    if (error) window.scrollTo(0, 0)
  }, [error])

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-16 md:px-8 md:py-20">
      <div className="max-w-xl rounded-[28px] bg-gradient-to-br from-[#17181b] to-[#5c4033] px-8 py-10 text-white">
        <h1 className="text-5xl font-normal leading-none tracking-tight">注册</h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-white/80">
          手机号和邮箱可以不填。填写时要先生成并校验验证码，通过后 10 分钟内可以注册。验证码生成后不会发送短信或邮件。开发环境的邮箱验证码可以填 000000。
        </p>
      </div>
      <div className="w-full max-w-md">
        {banner ? <Alert type="error" showIcon title={banner} /> : null}
        <form
          className="mt-6 flex flex-col"
          noValidate
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const name = username.trim()
            const phoneValue = phone.trim()
            const emailValue = email.trim()
            if (
              Array.from(name).length < 1 ||
              Array.from(name).length > 50 ||
              /\s/u.test(name) ||
              name.includes('@')
            ) {
              setError('用户名不合法')
              return
            }
            if (
              Array.from(password).length < 8 ||
              new TextEncoder().encode(password).length > 72
            ) {
              setError('密码至少 8 个字符，最长 72 字节')
              return
            }
            if (phoneValue && !/^1\d{10}$/.test(phoneValue)) {
              setError('手机号不合法')
              return
            }
            if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
              setError('邮箱不合法')
              return
            }
            if (phoneValue) {
              const fresh =
                phoneSentFor === phoneValue &&
                phoneVerified?.target === phoneValue &&
                Date.now() - phoneVerified.at <= tenMinutes
              if (!fresh) {
                setError(
                  phoneVerified?.target === phoneValue && Date.now() - phoneVerified.at > tenMinutes
                    ? '验证码校验已超过 10 分钟，请重新校验'
                    : '请先完成手机号验证码校验',
                )
                return
              }
            }
            if (emailValue) {
              const fresh =
                emailSentFor === emailValue &&
                emailVerified?.target === emailValue &&
                Date.now() - emailVerified.at <= tenMinutes
              if (!fresh) {
                setError(
                  emailVerified?.target === emailValue && Date.now() - emailVerified.at > tenMinutes
                    ? '验证码校验已超过 10 分钟，请重新校验'
                    : '请先完成邮箱验证码校验',
                )
                return
              }
            }
            const body: { username: string; password: string; phone?: string; email?: string } = {
              username: name,
              password,
            }
            if (phoneValue) body.phone = phoneValue
            if (emailValue) body.email = emailValue
            setError(null)
            useSession.getState().clearNotice()
            setPending(true)
            void request<{ access_token: string; expires_in: number; user: User }>(
              '/v1/auth/register',
              { method: 'POST', body: JSON.stringify(body) },
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
          <label className="text-sm text-stone-700">
            用户名
            <Input
              className="mt-2"
              size="large"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="mt-5 text-sm text-stone-700">
            密码
            <Input.Password
              className="mt-2"
              size="large"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label className="mt-5 text-sm text-stone-700">
            手机号（选填）
            <Input
              className="mt-2"
              size="large"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <div className="mt-3 flex gap-3">
            <Button
              htmlType="button"
              loading={phoneSending}
              onClick={() => {
                const target = phone.trim()
                if (!/^1\d{10}$/.test(target)) {
                  setError('手机号不合法')
                  return
                }
                setError(null)
                setPhoneSending(true)
                void request<{ expires_in: number }>('/v1/auth/send-code', {
                  method: 'POST',
                  body: JSON.stringify({ channel: 'phone', target }),
                })
                  .then((data) => {
                    setPhoneSentFor(target)
                    setPhoneVerified(null)
                    setPhoneHint(
                      `验证码已生成，${data.expires_in} 秒内有效。当前不会发送短信或邮件。`,
                    )
                  })
                  .catch((err: unknown) => {
                    setPhoneHint(null)
                    setError(getErrorMessage(err))
                  })
                  .finally(() => {
                    setPhoneSending(false)
                  })
              }}
            >
              生成验证码
            </Button>
          </div>
          <label className="mt-3 text-sm text-stone-700">
            手机验证码
            <Input
              className="mt-2"
              size="large"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={phoneCode}
              onChange={(event) => setPhoneCode(event.target.value)}
            />
          </label>
          <Button
            className="mt-3 self-start"
            htmlType="button"
            loading={phoneVerifying}
            onClick={() => {
              const target = phone.trim()
              const code = phoneCode.trim()
              if (phoneSentFor !== target) {
                setError('请先生成验证码')
                return
              }
              if (!/^1\d{10}$/.test(target)) {
                setError('手机号不合法')
                return
              }
              if (!/^\d{6}$/.test(code)) {
                setError('验证码错误')
                return
              }
              setError(null)
              setPhoneVerifying(true)
              void request<{ valid: boolean }>('/v1/auth/verify-code', {
                method: 'POST',
                body: JSON.stringify({ channel: 'phone', target, code }),
              })
                .then((data) => {
                  if (!data.valid) {
                    setPhoneVerified(null)
                    setError('验证码错误')
                    return
                  }
                  setPhoneVerified({ target, at: Date.now() })
                  setPhoneHint('已通过校验，请在 10 分钟内完成注册。')
                })
                .catch((err: unknown) => {
                  setPhoneVerified(null)
                  setError(getErrorMessage(err))
                })
                .finally(() => {
                  setPhoneVerifying(false)
                })
            }}
          >
            校验验证码
          </Button>
          {phoneHint ? <p className="mt-3 text-sm leading-6 text-stone-600">{phoneHint}</p> : null}
          <label className="mt-5 text-sm text-stone-700">
            邮箱（选填）
            <Input
              className="mt-2"
              size="large"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <div className="mt-3">
            <Button
              htmlType="button"
              loading={emailSending}
              onClick={() => {
                const target = email.trim()
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
                  setError('邮箱不合法')
                  return
                }
                setError(null)
                setEmailSending(true)
                void request<{ expires_in: number }>('/v1/auth/send-code', {
                  method: 'POST',
                  body: JSON.stringify({ channel: 'email', target }),
                })
                  .then((data) => {
                    setEmailSentFor(target)
                    setEmailVerified(null)
                    setEmailHint(
                      `验证码已生成，${data.expires_in} 秒内有效。当前不会发送短信或邮件。`,
                    )
                  })
                  .catch((err: unknown) => {
                    setEmailHint(null)
                    setError(getErrorMessage(err))
                  })
                  .finally(() => {
                    setEmailSending(false)
                  })
              }}
            >
              生成验证码
            </Button>
          </div>
          <label className="mt-3 text-sm text-stone-700">
            邮箱验证码
            <Input
              className="mt-2"
              size="large"
              autoComplete="one-time-code"
              value={emailCode}
              onChange={(event) => setEmailCode(event.target.value)}
            />
          </label>
          <p className="mt-2 text-sm text-stone-500">开发环境可以填 000000。</p>
          <Button
            className="mt-3 self-start"
            htmlType="button"
            loading={emailVerifying}
            onClick={() => {
              const target = email.trim()
              const code = emailCode.trim()
              if (emailSentFor !== target) {
                setError('请先生成验证码')
                return
              }
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
                setError('邮箱不合法')
                return
              }
              if (!/^\d{6}$/.test(code)) {
                setError('验证码错误')
                return
              }
              setError(null)
              setEmailVerifying(true)
              void request<{ valid: boolean }>('/v1/auth/verify-code', {
                method: 'POST',
                body: JSON.stringify({ channel: 'email', target, code }),
              })
                .then((data) => {
                  if (!data.valid) {
                    setEmailVerified(null)
                    setError('验证码错误')
                    return
                  }
                  setEmailVerified({ target, at: Date.now() })
                  setEmailHint('已通过校验，请在 10 分钟内完成注册。')
                })
                .catch((err: unknown) => {
                  setEmailVerified(null)
                  setError(getErrorMessage(err))
                })
                .finally(() => {
                  setEmailVerifying(false)
                })
            }}
          >
            校验验证码
          </Button>
          {emailHint ? <p className="mt-3 text-sm leading-6 text-stone-600">{emailHint}</p> : null}
          <Button
            className="mt-6"
            type="primary"
            shape="round"
            size="large"
            htmlType="submit"
            loading={pending}
          >
            注册
          </Button>
        </form>
        <p className="mt-6 text-sm text-stone-600">
          已有账号？{' '}
          <Link
            to="/login"
            className="text-stone-950 underline decoration-stone-300 underline-offset-4"
          >
            返回登录
          </Link>
        </p>
      </div>
    </section>
  )
}
