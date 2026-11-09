import { Alert, Button, Input } from 'antd'
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
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-16 md:px-8 md:py-20">
      <div className="max-w-xl rounded-[28px] bg-gradient-to-br from-[#17181b] to-[#5c4033] px-8 py-10 text-white">
        <h1 className="text-5xl font-normal leading-none tracking-tight">登录</h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-white/80">
          使用用户名、手机号或邮箱登录。登录成功后进入账号页。
        </p>
      </div>
      <div className="w-full max-w-md">
        {banner ? <Alert type="error" showIcon title={banner} /> : null}
        <form
          className="mt-6 flex flex-col"
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
          <label className="text-sm text-stone-700">
            账号
            <Input
              className="mt-2"
              size="large"
              autoComplete="username"
              value={account}
              onChange={(event) => setAccount(event.target.value)}
            />
          </label>
          <label className="mt-5 text-sm text-stone-700">
            密码
            <Input.Password
              className="mt-2"
              size="large"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <Button
            className="mt-6"
            type="primary"
            shape="round"
            size="large"
            htmlType="submit"
            loading={pending}
          >
            登录
          </Button>
        </form>
        <p className="mt-6 text-sm text-stone-600">
          还没有账号？{' '}
          <Link
            to="/register"
            className="text-stone-950 underline decoration-stone-300 underline-offset-4"
          >
            注册
          </Link>
        </p>
      </div>
    </section>
  )
}
