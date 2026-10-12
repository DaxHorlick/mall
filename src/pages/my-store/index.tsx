import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function MyStorePage() {
  return (
    <PagePlaceholder
      eyebrow="店铺"
      title="我的店铺"
      description="店铺信息和销售数据会在后续阶段实现。"
      actions={[
        { label: '管理商品', to: '/seller/products' },
        { label: '查看订单', to: '/seller/orders' },
      ]}
    />
  )
}
