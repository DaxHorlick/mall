import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'

export function ProductDetailPage() {
  const { id } = useParams()

  return (
    <PagePlaceholder
      eyebrow="商品"
      title="商品详情"
      description="颜色、尺码、库存和购买会在后续阶段实现。当前页面用来确认商品详情路由。"
      notes={id ? [`商品编号：${id}`] : []}
      actions={[{ label: '返回商品列表', to: '/products' }]}
    />
  )
}
