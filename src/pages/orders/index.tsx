import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function OrdersPage() {
  return (
    <PagePlaceholder
      eyebrow="订单"
      title="我的订单"
      description="订单列表会在后续阶段用模拟数据展示。"
      actions={[{ label: '查看示例订单', to: '/orders/demo' }]}
    />
  )
}
