import { useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'
import { fetchHotCreators } from '../../api/creators.ts'
import { fetchLatestDesigns } from '../../api/designs.ts'
import {
  fetchHotProducts,
  fetchRecommendedProducts,
} from '../../api/products.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { AiDesignEntry } from '../../components/home/AiDesignEntry.tsx'
import { CategorySection } from '../../components/home/CategorySection.tsx'
import { HeroBanner } from '../../components/home/HeroBanner.tsx'
import { HotCreatorsSection } from '../../components/home/HotCreatorsSection.tsx'
import { LatestDesignsSection } from '../../components/home/LatestDesignsSection.tsx'
import { ProductSection } from '../../components/home/ProductSection.tsx'

export function HomePage() {
  const hotProductsQuery = useQuery({
    queryKey: queryKeys.products.hot,
    queryFn: fetchHotProducts,
  })
  const recommendedQuery = useQuery({
    queryKey: queryKeys.products.recommended,
    queryFn: fetchRecommendedProducts,
  })
  const designsQuery = useQuery({
    queryKey: queryKeys.designs.latest(4),
    queryFn: () => fetchLatestDesigns(4),
  })
  const creatorsQuery = useQuery({
    queryKey: queryKeys.creators.hot,
    queryFn: fetchHotCreators,
  })

  const loading =
    hotProductsQuery.isPending ||
    recommendedQuery.isPending ||
    designsQuery.isPending ||
    creatorsQuery.isPending

  return (
    <div>
      <HeroBanner />
      <AiDesignEntry />
      <CategorySection />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" tip="加载首页数据…" />
        </div>
      ) : null}

      {hotProductsQuery.data ? (
        <ProductSection
          eyebrow="HOT PRODUCTS"
          title="热门商品"
          products={hotProductsQuery.data}
        />
      ) : null}

      {designsQuery.data ? (
        <LatestDesignsSection designs={designsQuery.data} />
      ) : null}

      {recommendedQuery.data ? (
        <ProductSection
          eyebrow="RECOMMENDED"
          title="推荐商品"
          products={recommendedQuery.data}
        />
      ) : null}

      {creatorsQuery.data ? (
        <HotCreatorsSection creators={creatorsQuery.data} />
      ) : null}
    </div>
  )
}
