import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function SellerProductsPage() {
  return (
    <PagePlaceholder
      eyebrow="商家"
      title="商品管理"
      description="商品新增、编辑、上下架和删除会在商家中心阶段实现。"
      actions={[{ label: '订单管理', to: '/seller/orders' }]}
    />
  )
}
