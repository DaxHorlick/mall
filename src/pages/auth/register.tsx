import { App, Button, Form, Input, Segmented } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth.ts'
import { ApiError } from '../../api/client.ts'
import { useAuthStore } from '../../stores/auth.ts'
import type { IdentityType } from '../../types/auth.ts'

type RegisterFormValues = {
  nickname: string
  identifier: string
  password: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^(?:\+?86|0086)?1[3-9]\d{9}$/

function passwordByteLength(value: string) {
  return new TextEncoder().encode(value).length
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const setUser = useAuthStore((s) => s.setUser)
  const [form] = Form.useForm<RegisterFormValues>()
  const [identityType, setIdentityType] = useState<IdentityType>('email')
  const [submitting, setSubmitting] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [conflict, setConflict] = useState(false)

  const switchIdentityType = (next: IdentityType) => {
    setIdentityType(next)
    setConflict(false)
    form.setFieldsValue({ identifier: undefined })
    form.setFields([{ name: 'identifier', errors: [] }])
  }

  const onFinish = async (values: RegisterFormValues) => {
    setSubmitting(true)
    setConflict(false)

    try {
      const user = await register({
        nickname: values.nickname.trim(),
        identity_type: identityType,
        identifier: values.identifier.trim(),
        password: values.password,
      })
      setUser(user)
      message.success('注册成功')
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 || err.code === 'CONFLICT') {
          setConflict(true)
          message.error(err.message)
        } else if (err.status === 429 || err.code === 'RATE_LIMITED') {
          setRateLimited(true)
          message.error(err.message)
        } else if (
          err.status === 503 &&
          err.message.includes('账号已创建，会话暂时不可用')
        ) {
          message.warning(err.message)
          navigate('/login', { replace: true })
        } else {
          message.error(err.message)
        }
      } else {
        message.error('注册失败，请稍后重试')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-md">
        <p className="text-xs font-medium tracking-[0.22em] text-stone-500">
          账户
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          注册
        </h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          支持邮箱或手机号注册，成功后将自动登录。本阶段无需验证码。
        </p>

        <div className="mt-8">
          <Segmented
            block
            value={identityType}
            options={[
              { label: '邮箱注册', value: 'email' },
              { label: '手机号注册', value: 'phone' },
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
            label="昵称"
            name="nickname"
            rules={[
              { required: true, message: '请输入昵称' },
              {
                validator: (_, value: string) => {
                  const trimmed = value?.trim() ?? ''
                  if (!trimmed) {
                    return Promise.reject(new Error('请输入昵称'))
                  }
                  if (trimmed.length > 64) {
                    return Promise.reject(new Error('昵称长度需为 1 到 64 个字符'))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Input size="large" placeholder="怎么称呼你" maxLength={64} />
          </Form.Item>

          <Form.Item
            label={identityType === 'email' ? '邮箱' : '手机号'}
            name="identifier"
            rules={[
              {
                required: true,
                message:
                  identityType === 'email' ? '请输入邮箱' : '请输入手机号',
              },
              {
                validator: (_, value: string) => {
                  const trimmed = value?.trim() ?? ''
                  if (!trimmed) {
                    return Promise.resolve()
                  }
                  if (identityType === 'email') {
                    if (!EMAIL_RE.test(trimmed)) {
                      return Promise.reject(new Error('邮箱格式不正确'))
                    }
                  } else if (!PHONE_RE.test(trimmed)) {
                    return Promise.reject(new Error('手机号格式不正确'))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Input
              size="large"
              placeholder={
                identityType === 'email'
                  ? 'name@example.com'
                  : '11 位大陆手机号'
              }
              autoComplete={identityType === 'email' ? 'email' : 'tel'}
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
                  if (value.length < 8) {
                    return Promise.reject(new Error('密码至少 8 个字符'))
                  }
                  if (passwordByteLength(value) > 72) {
                    return Promise.reject(
                      new Error('密码不超过 72 字节（中文等多字节字符请注意长度）'),
                    )
                  }
                  return Promise.resolve()
                },
              },
            ]}
            extra="至少 8 个字符，不超过 72 字节"
          >
            <Input.Password
              size="large"
              placeholder="设置登录密码"
              autoComplete="new-password"
            />
          </Form.Item>

          {conflict && (
            <p className="mb-4 text-sm text-stone-600">
              该账号已注册，可{' '}
              <Link to="/login" className="font-medium text-stone-950 underline">
                去登录
              </Link>
            </p>
          )}

          {rateLimited && (
            <p className="mb-4 text-sm text-amber-700">
              尝试次数过多，请稍后再试后再提交。
            </p>
          )}

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            disabled={rateLimited}
          >
            注册并登录
          </Button>
        </Form>

        <p className="mt-6 text-center text-sm text-stone-500">
          已有账号？{' '}
          <Link to="/login" className="font-medium text-stone-950 underline">
            去登录
          </Link>
        </p>
      </div>
    </section>
  )
}
