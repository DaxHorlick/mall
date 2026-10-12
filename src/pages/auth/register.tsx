import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function RegisterPage() {
  return (
    <PagePlaceholder
      eyebrow="账户"
      title="注册"
      description="注册表单会在后续阶段实现。当前可以从这里返回登录。"
      actions={[{ label: '去登录', to: '/login' }]}
    />
  )
}
