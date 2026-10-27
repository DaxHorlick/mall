import { Button, Result, Spin } from 'antd'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.ts'

export function RequireAuth() {
  const status = useAuthStore((s) => s.status)
  const statusMessage = useAuthStore((s) => s.statusMessage)
  const retryBootstrap = useAuthStore((s) => s.retryBootstrap)
  const location = useLocation()

  if (status === 'unknown') {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" tip="正在确认登录状态…" />
      </div>
    )
  }

  if (status === 'unavailable') {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Result
          status="warning"
          title={statusMessage || '服务暂时不可用'}
          subTitle="暂时无法确认登录状态，请稍后重试。"
          extra={
            <Button type="primary" onClick={() => retryBootstrap()}>
              重试
            </Button>
          }
        />
      </div>
    )
  }

  if (status !== 'authenticated') {
    const from = `${location.pathname}${location.search}`
    return <Navigate to="/login" replace state={{ from }} />
  }

  return <Outlet />
}
