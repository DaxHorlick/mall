import { Button, Empty, Result, Spin } from 'antd'
import { Link } from 'react-router-dom'

export function ProductDetailLoading() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-[1.5rem] bg-white py-16 shadow-sm">
      <Spin size="large" />
      <p className="mt-4 text-sm text-stone-500">正在加载商品详情…</p>
    </div>
  )
}

type ProductDetailErrorProps = {
  message?: string
  onRetry: () => void
}

export function ProductDetailError({
  message = '商品详情加载失败',
  onRetry,
}: ProductDetailErrorProps) {
  return (
    <div className="rounded-[1.5rem] bg-white px-6 py-10 shadow-sm">
      <Result
        status="error"
        title={message}
        subTitle="当前为本地 Mock 数据，可重试或返回商品列表。"
        extra={[
          <Button key="retry" type="primary" onClick={onRetry}>
            重新加载
          </Button>,
          <Link key="list" to="/products">
            <Button>返回列表</Button>
          </Link>,
        ]}
      />
    </div>
  )
}

export function ProductDetailNotFound() {
  return (
    <div className="rounded-[1.5rem] bg-white px-6 py-16 shadow-sm">
      <Empty description="找不到这件商品，可能已下架或链接有误。">
        <Link to="/products">
          <Button type="primary">浏览全部商品</Button>
        </Link>
      </Empty>
    </div>
  )
}
