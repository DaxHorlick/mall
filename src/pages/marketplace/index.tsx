import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function MarketplacePage() {
  return (
    <PagePlaceholder
      eyebrow="市场"
      title="创作者市场"
      description="最新作品、热门作品和创作者列表会在后续阶段实现。"
      actions={[{ label: '查看示例创作者', to: '/creators/demo' }]}
    />
  )
}
