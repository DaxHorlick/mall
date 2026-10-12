import { useSearchParams } from 'react-router-dom'
import { PagePlaceholder } from '../../components/common/PagePlaceholder.tsx'
import { getCategoryLabel } from '../../constants/navigation.ts'

export function ProductsPage() {
  const [params] = useSearchParams()
  const keyword = params.get('keyword')?.trim() ?? ''
  const categoryLabel = getCategoryLabel(params.get('category'))
  const notes = [
    keyword ? `搜索关键词：${keyword}` : '',
    categoryLabel ? `当前分类：${categoryLabel}` : '',
  ].filter((note) => note.length > 0)

  return (
    <PagePlaceholder
      eyebrow="商品"
      title="商品列表"
      description="商品网格、筛选、排序和分页会在后续阶段实现。搜索框和分类入口已经可以把条件带到这里。"
      notes={notes}
      actions={[{ label: '查看示例商品', to: '/products/demo' }]}
    />
  )
}
