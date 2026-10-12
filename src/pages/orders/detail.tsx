import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function OrderDetailPage() {
  const { id } = useParams()

  return (
    <PagePlaceholder
      eyebrow="订单"
      title="订单详情"
      description="订单状态和商品明细会在后续阶段实现。当前页面用来确认订单详情路由。"
      notes={id ? [`订单编号：${id}`] : []}
      actions={[{ label: '返回我的订单', to: '/orders' }]}
    />
  )
}
