import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Input, Select } from 'antd'
import { useState } from 'react'
import { getErrorMessage, request } from '../../api/client.ts'
import { useSession, type User } from '../../auth/session.ts'

type SessionItem = {
  id: number
  device_id: string | null
  device_type: string | null
  device_name: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  last_active_at: string
  expires_at: string
  current: boolean
}

type IdentityItem = {
  id: number
  provider: string
  created_at: string
}

function timeLabel(value: string) {
  const time = Date.parse(value)
  if (Number.isNaN(time)) return value
  return `${new Date(time).toLocaleString('zh-CN', { timeZone: 'UTC', hour12: false })} UTC`
}

export function AccountPage() {
  const user = useSession((s) => s.user)
  const status = useSession((s) => s.status)
  const sessions = useQuery({
    queryKey: ['me', 'sessions'],
    enabled: status === 'authenticated',
    queryFn: () => request<{ items: SessionItem[] }>('/v1/users/me/sessions', { auth: true }),
  })
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '')
  const [gender, setGender] = useState<number | null>(null)
  const [birthday, setBirthday] = useState('')
  const [birthdayClear, setBirthdayClear] = useState(false)
  const [bio, setBio] = useState('')
  const [bioClear, setBioClear] = useState(false)
  const [location, setLocation] = useState('')
  const [locationClear, setLocationClear] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profilePending, setProfilePending] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordPending, setPasswordPending] = useState(false)
  const [revokingId, setRevokingId] = useState<number | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)
  const [provider, setProvider] = useState<'wechat' | 'google' | 'apple'>('wechat')
  const [authorizationCode, setAuthorizationCode] = useState('')
  const [identityId, setIdentityId] = useState('')
  const [identities, setIdentities] = useState<IdentityItem[]>([])
  const [identityError, setIdentityError] = useState<string | null>(null)
  const [identityMessage, setIdentityMessage] = useState<string | null>(null)
  const [binding, setBinding] = useState(false)
  const [unbindingId, setUnbindingId] = useState<number | null>(null)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [leavingAll, setLeavingAll] = useState(false)

  const items = [...(sessions.data?.items ?? [])].sort((a, b) => Number(b.current) - Number(a.current))

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
      {user ? (
        <div>
          <div className="h-40 rounded-[28px] bg-[#17181b] sm:h-52" />
          <div className="-mt-10 ml-2 h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-stone-200">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <h1 className="mt-4 text-4xl font-normal tracking-tight">{user.nickname}</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {user.username ? `@${user.username}` : '未设置'}
            {' · '}
            加入 {timeLabel(user.created_at)}
          </p>
          <dl className="mt-8 max-w-xl space-y-5 text-sm">
            <div>
              <dt className="text-stone-500">简介</dt>
              <dd className="mt-1">当前没有简介数据</dd>
            </div>
            <div>
              <dt className="text-stone-500">社交链接</dt>
              <dd className="mt-1">当前没有社交链接数据</dd>
            </div>
            <div>
              <dt className="text-stone-500">粉丝</dt>
              <dd className="mt-1">当前没有粉丝数据</dd>
            </div>
            <div>
              <dt className="text-stone-500">作品</dt>
              <dd className="mt-1">当前没有作品数据</dd>
            </div>
          </dl>
          <dl className="mt-10 grid max-w-3xl gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-stone-500">手机</dt>
              <dd className="mt-1">{user.phone ?? '未绑定'}</dd>
            </div>
            <div>
              <dt className="text-stone-500">邮箱</dt>
              <dd className="mt-1">{user.email ?? '未绑定'}</dd>
            </div>
            <div>
              <dt className="text-stone-500">状态</dt>
              <dd className="mt-1">{user.status === 1 ? '可用' : String(user.status)}</dd>
            </div>
            <div>
              <dt className="text-stone-500">角色</dt>
              <dd className="mt-1">{user.roles.length > 0 ? user.roles.join('、') : '无'}</dd>
            </div>
            <div>
              <dt className="text-stone-500">用户 ID</dt>
              <dd className="mt-1">{user.id}</dd>
            </div>
          </dl>
        </div>
      ) : null}
      <p className="mt-10 max-w-2xl text-sm leading-6 text-stone-600">
        修改资料、修改密码、查看设备、绑定或解绑第三方身份后仍留在此页。退出当前登录、退出全部设备、撤销当前设备会回到登录页。
      </p>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">资料</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
        只提交改过的字段。头像留空会清空已有头像。生日、简介和所在地当前接口不返回原值，需要清空时点「改为空」。
      </p>
      {profileError ? <Alert className="mt-4 max-w-xl" type="error" showIcon title={profileError} /> : null}
      {profileMessage ? (
        <Alert className="mt-4 max-w-xl" type="success" showIcon title={profileMessage} />
      ) : null}
      <form
        className="mt-5 flex max-w-xl flex-col"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const current = useSession.getState().user
          const token = useSession.getState().accessToken
          if (!current || !token) return
          const body: {
            nickname?: string
            avatar_url?: string | null
            gender?: number
            birthday?: string | null
            bio?: string | null
            location?: string | null
          } = {}
          const nextNickname = nickname.trim()
          if (nextNickname !== current.nickname) {
            if (Array.from(nextNickname).length < 1 || Array.from(nextNickname).length > 50) {
              setProfileError('昵称不合法')
              setProfileMessage(null)
              return
            }
            body.nickname = nextNickname
          }
          const nextAvatar = avatarUrl.trim()
          if (nextAvatar !== (current.avatar_url ?? '')) {
            if (nextAvatar === '') {
              body.avatar_url = null
            } else if (
              !(nextAvatar.startsWith('http://') || nextAvatar.startsWith('https://')) ||
              new TextEncoder().encode(nextAvatar).length > 500
            ) {
              setProfileError('头像地址不合法')
              setProfileMessage(null)
              return
            } else {
              body.avatar_url = nextAvatar
            }
          }
          if (gender !== null) {
            if (gender !== 0 && gender !== 1 && gender !== 2 && gender !== 3) {
              setProfileError('性别不合法')
              setProfileMessage(null)
              return
            }
            body.gender = gender
          }
          if (birthdayClear) {
            body.birthday = null
          } else if (birthday.trim()) {
            const value = birthday.trim()
            const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
            const year = match ? Number(match[1]) : Number.NaN
            const month = match ? Number(match[2]) : Number.NaN
            const day = match ? Number(match[3]) : Number.NaN
            const date = new Date(Date.UTC(year, month - 1, day))
            const real =
              !!match &&
              date.getUTCFullYear() === year &&
              date.getUTCMonth() === month - 1 &&
              date.getUTCDate() === day
            if (!real) {
              setProfileError('生日不合法')
              setProfileMessage(null)
              return
            }
            body.birthday = value
          }
          const nextBio = bio.trim()
          if (bioClear) {
            body.bio = null
          } else if (nextBio) {
            if (Array.from(nextBio).length > 500) {
              setProfileError('个人简介不合法')
              setProfileMessage(null)
              return
            }
            body.bio = nextBio
          }
          const nextLocation = location.trim()
          if (locationClear) {
            body.location = null
          } else if (nextLocation) {
            if (Array.from(nextLocation).length > 100) {
              setProfileError('所在地不合法')
              setProfileMessage(null)
              return
            }
            body.location = nextLocation
          }
          if (Object.keys(body).length === 0) {
            setProfileError('没有要修改的内容')
            setProfileMessage(null)
            return
          }
          setProfileError(null)
          setProfileMessage(null)
          setProfilePending(true)
          void request<{ user: User }>('/v1/users/me/profile', {
            method: 'PUT',
            auth: true,
            body: JSON.stringify(body),
          })
            .then((data) => {
              const nextToken = useSession.getState().accessToken
              if (nextToken) useSession.getState().signIn(nextToken, data.user)
              setNickname(data.user.nickname)
              setAvatarUrl(data.user.avatar_url ?? '')
              setGender(null)
              setBirthday('')
              setBirthdayClear(false)
              setBio('')
              setBioClear(false)
              setLocation('')
              setLocationClear(false)
              setProfileMessage('资料已更新')
            })
            .catch((error: unknown) => {
              setProfileError(getErrorMessage(error))
            })
            .finally(() => {
              setProfilePending(false)
            })
        }}
      >
        <label className="text-sm text-stone-700">
          昵称
          <Input className="mt-2" value={nickname} onChange={(event) => setNickname(event.target.value)} />
        </label>
        <label className="mt-5 text-sm text-stone-700">
          头像地址
          <Input
            className="mt-2"
            value={avatarUrl}
            placeholder="https://"
            onChange={(event) => setAvatarUrl(event.target.value)}
          />
        </label>
        <label className="mt-5 text-sm text-stone-700">
          性别
          <Select
            className="mt-2 w-full"
            allowClear
            placeholder="不修改"
            value={gender ?? undefined}
            onChange={(value) => setGender(value ?? null)}
            options={[
              { value: 0, label: '0 保密' },
              { value: 1, label: '1 男' },
              { value: 2, label: '2 女' },
              { value: 3, label: '3 其他' },
            ]}
          />
        </label>
        <label className="mt-5 text-sm text-stone-700">
          生日
          <Input
            className="mt-2"
            type="date"
            value={birthday}
            disabled={birthdayClear}
            onChange={(event) => {
              setBirthday(event.target.value)
              setBirthdayClear(false)
            }}
          />
        </label>
        <Button
          className="mt-3 self-start"
          htmlType="button"
          onClick={() => {
            setBirthdayClear((current) => !current)
            setBirthday('')
          }}
        >
          {birthdayClear ? '取消清空生日' : '生日改为空'}
        </Button>
        <label className="mt-5 text-sm text-stone-700">
          简介
          <Input.TextArea
            className="mt-2"
            rows={3}
            value={bio}
            disabled={bioClear}
            onChange={(event) => {
              setBio(event.target.value)
              setBioClear(false)
            }}
          />
        </label>
        <Button
          className="mt-3 self-start"
          htmlType="button"
          onClick={() => {
            setBioClear((current) => !current)
            setBio('')
          }}
        >
          {bioClear ? '取消清空简介' : '简介改为空'}
        </Button>
        <label className="mt-5 text-sm text-stone-700">
          所在地
          <Input
            className="mt-2"
            value={location}
            disabled={locationClear}
            onChange={(event) => {
              setLocation(event.target.value)
              setLocationClear(false)
            }}
          />
        </label>
        <Button
          className="mt-3 self-start"
          htmlType="button"
          onClick={() => {
            setLocationClear((current) => !current)
            setLocation('')
          }}
        >
          {locationClear ? '取消清空所在地' : '所在地改为空'}
        </Button>
        <Button
          className="mt-6 self-start"
          type="primary"
          shape="round"
          htmlType="submit"
          loading={profilePending}
        >
          保存资料
        </Button>
      </form>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">密码</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
        修改后当前设备保持登录，其他设备会退出。旧密码错误不会退出登录。
      </p>
      {passwordError ? <Alert className="mt-4 max-w-xl" type="error" showIcon title={passwordError} /> : null}
      {passwordMessage ? (
        <Alert className="mt-4 max-w-xl" type="success" showIcon title={passwordMessage} />
      ) : null}
      <form
        className="mt-5 flex max-w-xl flex-col"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          if (!oldPassword) {
            setPasswordError('旧密码错误')
            setPasswordMessage(null)
            return
          }
          if (
            Array.from(newPassword).length < 8 ||
            new TextEncoder().encode(newPassword).length > 72 ||
            newPassword === oldPassword
          ) {
            setPasswordError('新密码至少 8 个字符，最长 72 字节，且不能与旧密码相同')
            setPasswordMessage(null)
            return
          }
          setPasswordError(null)
          setPasswordMessage(null)
          setPasswordPending(true)
          void request<{ updated: boolean }>('/v1/users/me/password', {
            method: 'PUT',
            auth: true,
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
          })
            .then(() => {
              setOldPassword('')
              setNewPassword('')
              setPasswordMessage('密码已更新。当前设备保持登录，其他设备已退出。')
              void sessions.refetch()
            })
            .catch((error: unknown) => {
              setPasswordError(getErrorMessage(error))
            })
            .finally(() => {
              setPasswordPending(false)
            })
        }}
      >
        <label className="text-sm text-stone-700">
          当前密码
          <Input.Password
            className="mt-2"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
          />
        </label>
        <label className="mt-5 text-sm text-stone-700">
          新密码
          <Input.Password
            className="mt-2"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </label>
        <Button
          className="mt-6 self-start"
          type="primary"
          shape="round"
          htmlType="submit"
          loading={passwordPending}
        >
          修改密码
        </Button>
      </form>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">登录设备</h2>
      {sessionError ? <Alert className="mt-4 max-w-3xl" type="error" showIcon title={sessionError} /> : null}
      {sessionMessage ? (
        <Alert className="mt-4 max-w-3xl" type="success" showIcon title={sessionMessage} />
      ) : null}
      {sessions.isPending ? <p className="mt-4 text-sm text-stone-500">正在读取设备</p> : null}
      {sessions.isError ? (
        <Alert className="mt-4 max-w-3xl" type="error" showIcon title={getErrorMessage(sessions.error)} />
      ) : null}
      {sessions.isSuccess && items.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">当前没有登录设备</p>
      ) : null}
      <ul className="mt-4 max-w-3xl divide-y divide-stone-200 border-y border-stone-200">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-sm leading-6">
              <p className="font-medium">
                {item.device_name ?? '未命名设备'}
                {item.current ? <span className="ml-2 text-stone-500">当前设备</span> : null}
              </p>
              <p className="text-stone-600">
                {(item.device_type ?? '未知类型') + ' · ' + (item.ip_address ?? 'IP 未知')}
              </p>
              <p className="break-all text-stone-500">{item.user_agent ?? '没有浏览器标识'}</p>
              <p className="text-stone-500">最近活跃 {timeLabel(item.last_active_at)}</p>
              <p className="text-stone-500">过期 {timeLabel(item.expires_at)}</p>
            </div>
            <Button
              danger
              loading={revokingId === item.id}
              onClick={() => {
                if (!Number.isInteger(item.id) || item.id <= 0) {
                  setSessionError('会话不存在')
                  return
                }
                setSessionError(null)
                setSessionMessage(null)
                setRevokingId(item.id)
                void request<{ revoked: boolean }>(`/v1/users/me/sessions/${item.id}`, {
                  method: 'DELETE',
                  auth: true,
                })
                  .then(() => {
                    if (item.current) {
                      useSession.getState().signOut(null)
                      return
                    }
                    setSessionMessage('已撤销这台设备')
                    void sessions.refetch()
                  })
                  .catch((error: unknown) => {
                    setSessionError(getErrorMessage(error))
                  })
                  .finally(() => {
                    setRevokingId(null)
                  })
              }}
            >
              {item.current ? '撤销并退出' : '撤销'}
            </Button>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">第三方身份</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
        只提交第三方和授权码。绑定结果会留在下面。更早绑定的身份可以用身份 ID 解绑。
      </p>
      {identityError ? <Alert className="mt-4 max-w-xl" type="error" showIcon title={identityError} /> : null}
      {identityMessage ? (
        <Alert className="mt-4 max-w-xl" type="success" showIcon title={identityMessage} />
      ) : null}
      <form
        className="mt-5 flex max-w-xl flex-col"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const code = authorizationCode.trim()
          if (provider !== 'wechat' && provider !== 'google' && provider !== 'apple') {
            setIdentityError('不支持的第三方')
            setIdentityMessage(null)
            return
          }
          if (!code) {
            setIdentityError('缺少授权码')
            setIdentityMessage(null)
            return
          }
          setIdentityError(null)
          setIdentityMessage(null)
          setBinding(true)
          void request<IdentityItem>('/v1/users/me/identities', {
            method: 'POST',
            auth: true,
            body: JSON.stringify({ provider, authorization_code: code }),
          })
            .then((data) => {
              setIdentities((current) => [data, ...current.filter((item) => item.id !== data.id)])
              setAuthorizationCode('')
              setIdentityMessage('已绑定')
            })
            .catch((error: unknown) => {
              setIdentityError(getErrorMessage(error))
            })
            .finally(() => {
              setBinding(false)
            })
        }}
      >
        <label className="text-sm text-stone-700">
          第三方
          <Select
            className="mt-2 w-full"
            value={provider}
            onChange={(value) => {
              if (value === 'wechat' || value === 'google' || value === 'apple') setProvider(value)
            }}
            options={[
              { value: 'wechat', label: '微信' },
              { value: 'google', label: 'Google' },
              { value: 'apple', label: 'Apple' },
            ]}
          />
        </label>
        <label className="mt-5 text-sm text-stone-700">
          授权码
          <Input
            className="mt-2"
            value={authorizationCode}
            onChange={(event) => setAuthorizationCode(event.target.value)}
          />
        </label>
        <Button className="mt-6 self-start" type="primary" htmlType="submit" loading={binding}>
          绑定
        </Button>
      </form>
      <form
        className="mt-6 flex max-w-xl items-end gap-3"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const id = Number(identityId.trim())
          if (!Number.isInteger(id) || id <= 0) {
            setIdentityError('身份不存在')
            setIdentityMessage(null)
            return
          }
          setIdentityError(null)
          setIdentityMessage(null)
          setUnbindingId(id)
          void request<{ deleted: boolean }>(`/v1/users/me/identities/${id}`, {
            method: 'DELETE',
            auth: true,
          })
            .then(() => {
              setIdentities((current) => current.filter((item) => item.id !== id))
              setIdentityId('')
              setIdentityMessage('已解绑')
            })
            .catch((error: unknown) => {
              setIdentityError(getErrorMessage(error))
            })
            .finally(() => {
              setUnbindingId(null)
            })
        }}
      >
        <label className="flex-1 text-sm text-stone-700">
          身份 ID
          <Input
            className="mt-2"
            inputMode="numeric"
            value={identityId}
            onChange={(event) => setIdentityId(event.target.value)}
          />
        </label>
        <Button htmlType="submit" danger loading={unbindingId !== null && unbindingId === Number(identityId)}>
          解绑
        </Button>
      </form>
      {identities.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">这次还没有绑定身份</p>
      ) : (
        <ul className="mt-4 max-w-xl divide-y divide-stone-200 border-y border-stone-200">
          {identities.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span>
                {item.provider === 'wechat' ? '微信' : item.provider === 'google' ? 'Google' : item.provider === 'apple' ? 'Apple' : item.provider}
                {' · '}
                {item.id}
                {' · '}
                {timeLabel(item.created_at)}
              </span>
              <Button
                danger
                loading={unbindingId === item.id}
                onClick={() => {
                  setIdentityError(null)
                  setIdentityMessage(null)
                  setUnbindingId(item.id)
                  void request<{ deleted: boolean }>(`/v1/users/me/identities/${item.id}`, {
                    method: 'DELETE',
                    auth: true,
                  })
                    .then(() => {
                      setIdentities((current) => current.filter((identity) => identity.id !== item.id))
                      setIdentityMessage('已解绑')
                    })
                    .catch((error: unknown) => {
                      setIdentityError(getErrorMessage(error))
                    })
                    .finally(() => {
                      setUnbindingId(null)
                    })
                }}
              >
                解绑
              </Button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-12 text-xl font-semibold tracking-tight">退出</h2>
      {logoutError ? <Alert className="mt-4 max-w-xl" type="error" showIcon title={logoutError} /> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          loading={leaving}
          onClick={() => {
            setLogoutError(null)
            setLeaving(true)
            void request<{ logged_out: boolean }>('/v1/auth/logout', { method: 'POST' })
              .then(() => {
                useSession.getState().signOut(null)
              })
              .catch((error: unknown) => {
                if (useSession.getState().status === 'anonymous') return
                setLogoutError(getErrorMessage(error))
              })
              .finally(() => {
                setLeaving(false)
              })
          }}
        >
          退出当前登录
        </Button>
        <Button
          danger
          loading={leavingAll}
          onClick={() => {
            setLogoutError(null)
            setLeavingAll(true)
            void request<{ logged_out: boolean }>('/v1/auth/logout-all', { method: 'POST', auth: true })
              .then(() => {
                useSession.getState().signOut(null)
              })
              .catch((error: unknown) => {
                if (useSession.getState().status === 'anonymous') return
                setLogoutError(getErrorMessage(error))
              })
              .finally(() => {
                setLeavingAll(false)
              })
          }}
        >
          退出全部设备
        </Button>
      </div>
    </section>
  )
}
