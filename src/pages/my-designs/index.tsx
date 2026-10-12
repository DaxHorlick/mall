import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function MyDesignsPage() {
  return (
    <PagePlaceholder
      eyebrow="创作"
      title="我的设计"
      description="保存下来的设计作品会在后续阶段展示。"
      actions={[{ label: '去 AI 设计器', to: '/designer' }]}
    />
  )
}
