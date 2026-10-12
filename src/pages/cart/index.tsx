import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function CartPage() {
  return (
    <PagePlaceholder
      eyebrow="购买"
      title="购物车"
      description="商品数量、选择结算和金额计算会在后续阶段实现。"
      actions={[{ label: '去确认订单', to: '/checkout' }]}
    />
  )
}
