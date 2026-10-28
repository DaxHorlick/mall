import { Button } from 'antd'
import { Link, useNavigate } from 'react-router-dom'

export function AiDesignEntry() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-10">
            <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
              AI DESIGNER
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              用文字描述生成专属图案
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-stone-600 md:text-base md:leading-7">
              填写标题和提示词。生成不会立刻完成，创建任务后会在设计页里轮询结果。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/my-designs/new')}
              >
                打开设计器
              </Button>
              <Link
                to="/my-designs"
                className="inline-flex h-10 items-center text-sm text-stone-500 transition-colors hover:text-stone-950"
              >
                查看我的设计
              </Link>
            </div>
          </div>
          <div className="relative min-h-56 bg-stone-950 md:min-h-full">
            <div
              className="absolute inset-0 opacity-70"
              aria-hidden="true"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.16), transparent 35%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.1), transparent 40%)',
              }}
            />
            <div className="relative flex h-full items-center justify-center p-8">
              <img
                src="/images/designs/design-01.svg"
                alt="AI 图案示例"
                className="h-40 w-40 rounded-3xl object-cover shadow-xl md:h-52 md:w-52"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
