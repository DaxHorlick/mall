import { Button, InputNumber, Select } from 'antd'
import { productCategories } from '../../constants/navigation.ts'
import type { ProductCategoryKey, ProductSort } from '../../types/product.ts'

export type ProductFilterDraft = {
  category: ProductCategoryKey | ''
  minPrice: number | null
  maxPrice: number | null
  sort: ProductSort
}

type ProductListFiltersProps = {
  value: ProductFilterDraft
  onChange: (next: ProductFilterDraft) => void
  onReset: () => void
  resultCount?: number
  loading?: boolean
}

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: '最新发布' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
]

export function ProductListFilters({
  value,
  onChange,
  onReset,
  resultCount,
  loading = false,
}: ProductListFiltersProps) {
  return (
    <section className="rounded-[1.5rem] bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            FILTERS
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">筛选与排序</h2>
        </div>
        {typeof resultCount === 'number' ? (
          <p className="text-sm text-stone-500">
            {loading ? '查询中…' : `共 ${resultCount} 件`}
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block space-y-2">
          <span className="text-xs tracking-[0.14em] text-stone-400">分类</span>
          <Select
            className="w-full"
            value={value.category || 'all'}
            options={[
              { value: 'all', label: '全部商品' },
              ...productCategories.map((item) => ({
                value: item.key,
                label: item.label,
              })),
            ]}
            onChange={(next) =>
              onChange({
                ...value,
                category: next === 'all' ? '' : (next as ProductCategoryKey),
              })
            }
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs tracking-[0.14em] text-stone-400">最低价</span>
          <InputNumber
            className="w-full"
            min={0}
            step={10}
            placeholder="¥0"
            value={value.minPrice}
            onChange={(next) =>
              onChange({
                ...value,
                minPrice: typeof next === 'number' ? next : null,
              })
            }
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs tracking-[0.14em] text-stone-400">最高价</span>
          <InputNumber
            className="w-full"
            min={0}
            step={10}
            placeholder="不限"
            value={value.maxPrice}
            onChange={(next) =>
              onChange({
                ...value,
                maxPrice: typeof next === 'number' ? next : null,
              })
            }
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs tracking-[0.14em] text-stone-400">排序</span>
          <Select
            className="w-full"
            value={value.sort}
            options={sortOptions}
            onChange={(next) => onChange({ ...value, sort: next })}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={onReset}>重置筛选</Button>
      </div>
    </section>
  )
}
