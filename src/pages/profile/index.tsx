import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function ProfilePage() {
  return (
    <PagePlaceholder
      eyebrow="账户"
      title="个人中心"
      description="个人资料、收藏和店铺入口会在后续阶段实现。"
      actions={[
        { label: '我的订单', to: '/orders' },
        { label: '我的设计', to: '/my-designs' },
      ]}
    />
  )
}
