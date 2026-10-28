import { useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Form, Input, Result, Spin } from 'antd'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { applyForCreator, fetchMyCreator, updateMyCreator } from '../../api/creators.ts'
import {
  ApiError,
  getErrorMessage,
  isAccountDisabled,
  isCreatorDisabled,
} from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import type { CreatorProfile } from '../../types/creator.ts'
import { validateCreatorBio, validateDisplayName } from '../../utils/creator.ts'

type CreatorFormValues = {
  display_name: string
  bio?: string
}

const STATUS_LABEL: Record<CreatorProfile['status'], string> = {
  pending: '审核中',
  approved: '已通过',
  rejected: '已拒绝',
  disabled: '创作者身份已停用',
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('zh-CN', { hour12: false })
}

function CreatorFieldsForm({
  initialName,
  initialBio,
  submitText,
  submitting,
  rateLimitMessage,
  onSubmit,
}: {
  initialName: string
  initialBio: string
  submitText: string
  submitting: boolean
  rateLimitMessage: string | null
  onSubmit: (values: { display_name: string; bio: string }) => void
}) {
  return (
    <Form<CreatorFormValues>
      layout="vertical"
      className="mt-6 max-w-lg"
      requiredMark={false}
      autoComplete="off"
      initialValues={{ display_name: initialName, bio: initialBio }}
      onFinish={(values) =>
        onSubmit({
          display_name: values.display_name ?? '',
          bio: values.bio ?? '',
        })
      }
      disabled={submitting || Boolean(rateLimitMessage)}
    >
      <Form.Item
        label="展示名"
        name="display_name"
        rules={[
          {
            validator: (_, value: string | undefined) => {
              const error = validateDisplayName(value ?? '')
              return error ? Promise.reject(new Error(error)) : Promise.resolve()
            },
          },
        ]}
      >
        <Input size="large" maxLength={64} placeholder="对外展示的名字" />
      </Form.Item>
      <Form.Item
        label="简介"
        name="bio"
        extra="可以留空，去掉首尾空白后不超过 500 个字符，不能包含换行或其他控制字符。"
        rules={[
          {
            validator: (_, value: string | undefined) => {
              const error = validateCreatorBio(value ?? '')
              return error ? Promise.reject(new Error(error)) : Promise.resolve()
            },
          },
        ]}
      >
        <Input.TextArea rows={4} maxLength={500} placeholder="介绍一下你的创作" />
      </Form.Item>
      {rateLimitMessage ? (
        <p className="mb-4 text-sm text-amber-700">{rateLimitMessage}</p>
      ) : null}
      <Button
        type="primary"
        htmlType="submit"
        loading={submitting}
        disabled={Boolean(rateLimitMessage)}
      >
        {submitText}
      </Button>
    </Form>
  )
}

export function CreatorCenterPage() {
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const submittingRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null)
  const [identityDisabled, setIdentityDisabled] = useState(false)

  const profileQuery = useQuery({
    queryKey: queryKeys.creators.me,
    queryFn: fetchMyCreator,
    retry: false,
  })

  const saveProfile = (profile: CreatorProfile) => {
    queryClient.setQueryData(queryKeys.creators.me, profile)
    if (profile.status === 'approved') {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.creators.publicProfile(String(profile.user_id)),
      })
    }
  }

  const submitApplication = async (values: { display_name: string; bio: string }) => {
    if (submittingRef.current || rateLimitMessage) {
      return
    }

    submittingRef.current = true
    setSubmitting(true)

    try {
      const profile = await applyForCreator({
        display_name: values.display_name.trim(),
        bio: values.bio.trim(),
      })
      saveProfile(profile)
      message.success('申请已提交，正在审核')
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || isAccountDisabled(err))) {
        return
      }
      if (isCreatorDisabled(err)) {
        setIdentityDisabled(true)
      }
      if (err instanceof ApiError && (err.status === 429 || err.code === 'RATE_LIMITED')) {
        setRateLimitMessage(err.message)
      }
      message.error(getErrorMessage(err))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const submitUpdate = async (values: { display_name: string; bio: string }) => {
    const current = profileQuery.data
    if (!current || submittingRef.current || rateLimitMessage) {
      return
    }

    const displayName = values.display_name.trim()
    const bio = values.bio.trim()
    const payload: { display_name?: string; bio?: string } = {}

    if (displayName !== current.display_name) {
      payload.display_name = displayName
    }
    if (bio !== current.bio) {
      payload.bio = bio
    }

    if (payload.display_name === undefined && payload.bio === undefined) {
      message.info('没有需要保存的修改')
      return
    }

    submittingRef.current = true
    setSubmitting(true)

    try {
      const profile = await updateMyCreator(payload)
      saveProfile(profile)
      message.success('资料已更新')
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || isAccountDisabled(err))) {
        return
      }
      if (isCreatorDisabled(err)) {
        setIdentityDisabled(true)
      }
      if (err instanceof ApiError && (err.status === 429 || err.code === 'RATE_LIMITED')) {
        setRateLimitMessage(err.message)
      }
      message.error(getErrorMessage(err))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (profileQuery.isPending) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" tip="加载创作者资料…" />
      </div>
    )
  }

  if (profileQuery.isError) {
    const error = profileQuery.error
    if (error instanceof ApiError && (error.status === 401 || isAccountDisabled(error))) {
      return (
        <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
          <Spin size="large" tip="正在前往登录…" />
        </div>
      )
    }

    if (isCreatorDisabled(error)) {
      return <DisabledState />
    }

    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Result
          status="warning"
          title={getErrorMessage(error)}
          extra={
            <Button type="primary" onClick={() => void profileQuery.refetch()}>
              重试
            </Button>
          }
        />
      </div>
    )
  }

  const profile = profileQuery.data

  if (identityDisabled || profile?.status === 'disabled') {
    return <DisabledState />
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div>
        <p className="text-xs font-medium tracking-[0.22em] text-stone-400">CREATOR</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          创作者中心
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
          创作者是当前登录账号上的可选身份。这里使用已有登录态，不会单独注册创作者账号。
        </p>
      </div>

      {!profile ? (
        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-stone-950">还不是创作者</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            填写展示名和简介后提交申请。审核期间可以修改资料，不能重复申请。
          </p>
          <CreatorFieldsForm
            key="apply"
            initialName=""
            initialBio=""
            submitText="提交申请"
            submitting={submitting}
            rateLimitMessage={rateLimitMessage}
            onSubmit={(values) => void submitApplication(values)}
          />
        </section>
      ) : null}

      {profile && (profile.status === 'pending' || profile.status === 'approved') ? (
        <>
          <StatusCard profile={profile} />
          <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-semibold text-stone-950">修改资料</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              {profile.status === 'pending'
                ? '申请正在审核，可以修改展示名和简介，不能再次申请。'
                : '已通过审核。修改展示名和简介不会改变通过状态。'}
            </p>
            <CreatorFieldsForm
              key={`${profile.status}-${profile.updated_at}`}
              initialName={profile.display_name}
              initialBio={profile.bio}
              submitText="保存修改"
              submitting={submitting}
              rateLimitMessage={rateLimitMessage}
              onSubmit={(values) => void submitUpdate(values)}
            />
          </section>
        </>
      ) : null}

      {profile?.status === 'rejected' ? (
        <>
          <StatusCard profile={profile} />
          <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-semibold text-stone-950">重新申请</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              申请已被拒绝，不能直接修改资料。重新提交后会再次进入审核。
            </p>
            <CreatorFieldsForm
              key={`rejected-${profile.updated_at}`}
              initialName={profile.display_name}
              initialBio={profile.bio}
              submitText="重新申请"
              submitting={submitting}
              rateLimitMessage={rateLimitMessage}
              onSubmit={(values) => void submitApplication(values)}
            />
          </section>
        </>
      ) : null}
    </div>
  )
}

function StatusCard({ profile }: { profile: CreatorProfile }) {
  const reviewedAt = formatDateTime(profile.reviewed_at)
  const appliedAt = formatDateTime(profile.applied_at)

  return (
    <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
      <p className="text-xs tracking-[0.18em] text-stone-400">STATUS</p>
      <h2 className="mt-2 text-2xl font-semibold text-stone-950">
        {STATUS_LABEL[profile.status]}
      </h2>
      <p className="mt-3 text-sm text-stone-500">展示名：{profile.display_name}</p>
      {profile.bio ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{profile.bio}</p>
      ) : (
        <p className="mt-2 text-sm text-stone-400">还没有简介</p>
      )}
      {appliedAt ? (
        <p className="mt-3 text-sm text-stone-500">申请时间：{appliedAt}</p>
      ) : null}
      {reviewedAt ? (
        <p className="mt-2 text-sm text-stone-500">审核时间：{reviewedAt}</p>
      ) : null}
      {profile.status === 'rejected' ? (
        <p className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-700">
          拒绝原因：{profile.reject_reason || '未填写'}
        </p>
      ) : null}
      {profile.status === 'approved' ? (
        <p className="mt-4 text-sm text-stone-600">
          公开主页：
          <Link
            to={`/creators/${profile.user_id}`}
            className="ml-2 font-medium text-stone-950 underline"
          >
            /creators/{profile.user_id}
          </Link>
        </p>
      ) : null}
    </section>
  )
}

function DisabledState() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div>
        <p className="text-xs font-medium tracking-[0.22em] text-stone-400">CREATOR</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          创作者中心
        </h1>
      </div>
      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-semibold text-stone-950">创作者身份已停用</h2>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          当前账号仍然保持登录，可以继续使用买家功能。
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-block text-sm font-medium text-stone-950 underline"
        >
          返回个人中心
        </Link>
      </section>
    </div>
  )
}
