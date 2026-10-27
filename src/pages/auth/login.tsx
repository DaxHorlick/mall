import { App, Button, Form, Input, Segmented, Spin } from 'antd'
import { useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { login } from '../../api/auth.ts'
import { ApiError } from '../../api/client.ts'
import { useAuthStore } from '../../stores/auth.ts'
import type { AuthLocationState, IdentityType } from '../../types/auth.ts'
import {
  normalizeIdentifier,
  safeReturnPath,
  validateIdentifier,
  validatePassword,
} from '../../utils/auth.ts'

type LoginFormValues = {
  identifier: string
  password: string
}

export function LoginPage() {
  const location = useLocation()
  const { message } = App.useApp()
  const status = useAuthStore((s) => s.status)
  const statusMessage = useAuthStore((s) => s.statusMessage)
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)
  const [form] = Form.useForm<LoginFormValues>()
  const [identityType, setIdentityType] = useState<IdentityType>('email')
  const [submitting, setSubmitting] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const submittingRef = useRef(false)
  const returnPath = safeReturnPath(
    (location.state as AuthLocationState | null)?.from,
  )

  const switchIdentityType = (next: IdentityType) => {
    setIdentityType(next)
    form.setFieldsValue({ identifier: undefined })
    form.setFields([{ name: 'identifier', errors: [] }])
  }

  const onFinish = async (values: LoginFormValues) => {
    if (submittingRef.current || rateLimited) {
      return
    }

    submittingRef.current = true
    setSubmitting(true)

    try {
      const user = await login({
        identity_type: identityType,
        identifier: normalizeIdentifier(identityType, values.identifier),
        password: values.password,
      })
      setAuthenticated(user)
      message.success('登录成功')
    } catch (err) {
      if (err instanceof ApiError && (err.status === 429 || err.code === 'RATE_LIMITED')) {
        setRateLimited(true)
      }

      message.error(err instanceof ApiError ? err.message : '登录失败，请稍后重试')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (status === 'unknown') {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-6xl items-center justify-center px-5 py-20">
        <Spin size="large" tip="正在确认登录状态…" />
      </div>
    )
  }

  if (status === 'authenticated') {
    return <Navigate to={returnPath} replace />
  }

  return (
    <section className="mx-auto min-h-[calc(100dvh-4.5rem)] max-w-6xl px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-md">
        <p className="text-xs font-medium tracking-[0.22em] text-stone-500">
          账户
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          登录
        </h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          使用注册时的邮箱或手机号登录。登录成功后会回到刚才访问的页面。
        </p>
        {status === 'unavailable' && statusMessage ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-8">
          <Segmented
            block
            disabled={submitting || rateLimited}
            value={identityType}
            options={[
              { label: '邮箱', value: 'email' },
              { label: '手机号', value: 'phone' },
            ]}
            onChange={(value) => switchIdentityType(value as IdentityType)}
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          className="mt-6"
          requiredMark={false}
          onFinish={onFinish}
          disabled={submitting || rateLimited}
        >
          <Form.Item
            label={identityType === 'email' ? '邮箱' : '手机号'}
            name="identifier"
            rules={[
              {
                required: true,
                message: identityType === 'email' ? '请输入邮箱' : '请输入手机号',
              },
              {
                validator: (_, value: string) => {
                  if (!value) {
                    return Promise.resolve()
                  }

                  const error = validateIdentifier(identityType, value)
                  return error
                    ? Promise.reject(new Error(error))
                    : Promise.resolve()
                },
              },
            ]}
          >
            <Input
              size="large"
              placeholder={
                identityType === 'email' ? 'name@example.com' : '11 位大陆手机号'
              }
              autoComplete={identityType === 'email' ? 'email' : 'tel'}
              maxLength={identityType === 'email' ? 128 : 32}
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              {
                validator: (_, value: string) => {
                  if (!value) {
                    return Promise.resolve()
                  }

                  const error = validatePassword(value)
                  return error
                    ? Promise.reject(new Error(error))
                    : Promise.resolve()
                },
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="登录密码"
              autoComplete="current-password"
            />
          </Form.Item>

          {rateLimited ? (
            <p className="mb-4 text-sm text-amber-700">
              尝试次数过多，请稍后再试后再提交。
            </p>
          ) : null}

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            disabled={rateLimited}
          >
            登录
          </Button>
        </Form>

        <p className="mt-6 text-center text-sm text-stone-500">
          还没有账号？{' '}
          <Link
            to="/register"
            state={location.state}
            className="font-medium text-stone-950 underline"
          >
            去注册
          </Link>
        </p>
      </div>
    </section>
  )
}
