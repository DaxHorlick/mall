import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto flex max-w-6xl flex-col px-5 py-20 md:px-8 md:py-28">
      <p className="text-6xl font-semibold tracking-tight text-stone-300 md:text-8xl">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">没有找到这个页面</h1>
      <p className="mt-4 max-w-md text-base leading-7 text-stone-600">
        这个地址没有对应页面。可以回到首页，或从导航继续浏览商品和设计。
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="primary" size="large" onClick={() => navigate('/')}>
          回到首页
        </Button>
        <Button size="large" onClick={() => navigate('/products')}>
          看看商品
        </Button>
      </div>
    </section>
  )
}
