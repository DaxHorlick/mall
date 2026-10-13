import { AiDesignEntry } from '../../components/home/AiDesignEntry.tsx'
import { CategorySection } from '../../components/home/CategorySection.tsx'
import { HeroBanner } from '../../components/home/HeroBanner.tsx'
import { HotCreatorsSection } from '../../components/home/HotCreatorsSection.tsx'
import { LatestDesignsSection } from '../../components/home/LatestDesignsSection.tsx'
import { ProductSection } from '../../components/home/ProductSection.tsx'
import { getHotCreators } from '../../mocks/creators.ts'
import { getLatestDesigns } from '../../mocks/designs.ts'
import {
  getHotProducts,
  getRecommendedProducts,
} from '../../mocks/products.ts'

export function HomePage() {
  const hotProducts = getHotProducts()
  const recommendedProducts = getRecommendedProducts()
  const latestDesigns = getLatestDesigns()
  const hotCreators = getHotCreators()

  return (
    <div>
      <HeroBanner />
      <AiDesignEntry />
      <CategorySection />
      <ProductSection
        eyebrow="HOT PRODUCTS"
        title="热门商品"
        products={hotProducts}
      />
      <LatestDesignsSection designs={latestDesigns} />
      <ProductSection
        eyebrow="RECOMMENDED"
        title="推荐商品"
        products={recommendedProducts}
      />
      <HotCreatorsSection creators={hotCreators} />
    </div>
  )
}
