import { App, Button } from 'antd'

const upcoming = [
  {
    index: '01',
    title: '选购成衣',
    text: '浏览 T 恤、搜索筛选，并管理购物车和订单。',
  },
  {
    index: '02',
    title: 'AI 图案设计',
    text: '输入描述或上传参考图，预览图案印在衣服上的效果。',
  },
  {
    index: '03',
    title: '创作者市场',
    text: '发布自己的设计，浏览其他创作者的作品。',
  },
] as const

function ShirtMark() {
  return (
    <svg viewBox="0 0 240 280" className="h-64 w-56" aria-hidden="true">
      <path
        d="M78 28c8 14 22 22 42 22s34-8 42-22l28 14-16 36h-18v150H84V78H66L50 42l28-14z"
        fill="#ffffff"
      />
      <circle cx="120" cy="132" r="22" fill="#111111" />
    </svg>
  )
}

export function HomePage() {
  const { message } = App.useApp()
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  const showPending = () => {
    message.info('这个入口会在后续阶段开放')
  }

  return (
    <div className="min-h-screen bg-[#f6f4f1] text-stone-950">
      <header className="border-b border-stone-200/80 bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="text-sm font-semibold tracking-[0.28em]">INKTEE</div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
            阶段 1 · 项目初始化
          </span>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-stone-500">
              AI PERSONALIZED T-SHIRT
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
              把一句描述，做成一件 T 恤
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-stone-600">
              这是商城前端的起始页。商品、设计和订单还没有接入，当前只确认项目可以启动，路由和界面基础已经就位。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button type="primary" size="large" onClick={showPending}>
                开始设计
              </Button>
              <Button size="large" onClick={showPending}>
                浏览商品
              </Button>
            </div>
          </div>

          <div className="flex min-h-80 items-center justify-center rounded-[2rem] bg-stone-950">
            <ShirtMark />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-3 md:px-8">
          {upcoming.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl bg-white p-6 shadow-sm"
            >
              <p className="text-xs tracking-[0.18em] text-stone-400">
                {item.index}
              </p>
              <h2 className="mt-3 text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">{item.text}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-stone-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-stone-500 md:flex-row md:items-center md:justify-between md:px-8">
          <span>INKTEE · Web 前端</span>
          <span>API 基础地址：{apiBaseUrl || '未配置'}</span>
        </div>
      </footer>
    </div>
  )
}
