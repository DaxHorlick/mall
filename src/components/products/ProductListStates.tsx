import { Button, Empty, Result, Spin } from 'antd'
import type { ReactNode } from 'react'

type ProductListLoadingProps = {
  label?: string
}

export function ProductListLoading({
  label = '正在加载商品…',
}: ProductListLoadingProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.5rem] bg-white py-16 shadow-sm">
      <Spin size="large" />
      <p className="mt-4 text-sm text-stone-500">{label}</p>
    </div>
  )
}

type ProductListEmptyProps = {
  description?: string
  action?: ReactNode
}

export function ProductListEmpty({
  description = '没有符合条件的商品，试试调整关键词或筛选。',
  action,
}: ProductListEmptyProps) {
  return (
    <div className="rounded-[1.5rem] bg-white px-6 py-16 shadow-sm">
      <Empty description={description}>{action}</Empty>
    </div>
  )
}

type ProductListErrorProps = {
  message?: string
  onRetry: () => void
}

export function ProductListError({
  message = '商品列表加载失败',
  onRetry,
}: ProductListErrorProps) {
  return (
    <div className="rounded-[1.5rem] bg-white px-6 py-10 shadow-sm">
      <Result
        status="error"
        title={message}
        subTitle="当前为本地 Mock 模拟的错误状态，可重试或清除错误参数。"
        extra={
          <Button type="primary" onClick={onRetry}>
            重新加载
          </Button>
        }
      />
    </div>
  )
}
