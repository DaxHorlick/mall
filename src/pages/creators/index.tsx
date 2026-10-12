import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function CreatorPage() {
  const { id } = useParams()

  return (
    <PagePlaceholder
      eyebrow="创作者"
      title="创作者主页"
      description="创作者简介和已发布商品会在后续阶段实现。当前页面用来确认创作者路由。"
      notes={id ? [`创作者编号：${id}`] : []}
      actions={[{ label: '返回创作者市场', to: '/marketplace' }]}
    />
  )
}
