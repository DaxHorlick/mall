import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function SellerOrdersPage() {
  return (
    <PagePlaceholder
      eyebrow="商家"
      title="订单管理"
      description="商家订单列表和状态会在后续阶段用模拟数据展示。"
      actions={[{ label: '商品管理', to: '/seller/products' }]}
    />
  )
}
