import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function LoginPage() {
  return (
    <PagePlaceholder
      eyebrow="账户"
      title="登录"
      description="登录表单会在后续阶段实现。当前可以从这里前往注册。"
      actions={[{ label: '去注册', to: '/register' }]}
    />
  )
}
