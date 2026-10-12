import { Button } from 'antd'
import { Link, useNavigate } from 'react-router-dom'

const entries = [
  {
    index: '01',
    title: '选购成衣',
    text: '浏览 T 恤，按分类和关键词找到想要的款式。',
    to: '/products',
  },
  {
    index: '02',
    title: 'AI 图案设计',
    text: '输入描述或上传参考图，预览图案印在衣服上的效果。',
    to: '/designer',
  },
  {
    index: '03',
    title: '创作者市场',
    text: '发布自己的设计，也可以逛其他创作者的作品。',
    to: '/marketplace',
  },
] as const

function ShirtMark() {
  return (
    <svg viewBox="0 0 240 280" className="h-64 w-56" aria-hidden="true">
      <path
        d="M78 28c8 18 22 22 45 22s34-8 42-22l28 14-16 36h-18v150H84V78H66L50 42l28-14z"
        fill="#ffffff"
      />
      <circle cx="120" cy="132" r="22" fill="#111111" />
    </svg>
  )
}

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-2 md:px-8 md:py-20">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-500">
            AI PERSONALIZED T-SHIRT
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
            把一句描述，做成一件 T 恤
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-stone-600">
            从这里进入商品、AI 设计和创作者市场。具体商品和生成能力会在后续阶段接上。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="primary" size="large" onClick={() => navigate('/designer')}>
              开始设计
            </Button>
            <Button size="large" onClick={() => navigate('/products')}>
              浏览商品
            </Button>
          </div>
        </div>

        <div className="flex min-h-80 items-center justify-center rounded-[2rem] bg-stone-950">
          <ShirtMark />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-3 md:px-8">
        {entries.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-3xl bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs tracking-[0.18em] text-stone-400">{item.index}</p>
            <h2 className="mt-3 text-xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">{item.text}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
