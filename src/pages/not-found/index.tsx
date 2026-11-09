import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../auth/session.ts'

export function NotFoundPage() {
  const navigate = useNavigate()
  const authed = useSession((s) => s.status === 'authenticated')

  return (
    <section className="mx-auto flex max-w-6xl flex-col px-5 py-20 md:px-8 md:py-28">
      <p className="text-6xl font-normal tracking-tight text-stone-300 md:text-8xl">404</p>
      <h1 className="mt-4 text-4xl font-normal tracking-tight">没有找到这个页面</h1>
      <p className="mt-4 max-w-md text-base leading-7 text-stone-600">
        这个地址没有对应页面。
      </p>
      <div className="mt-8">
        <Button
          type="primary"
          shape="round"
          size="large"
          onClick={() => navigate(authed ? '/account' : '/login')}
        >
          {authed ? '回到账号' : '去登录'}
        </Button>
      </div>
    </section>
  )
}
