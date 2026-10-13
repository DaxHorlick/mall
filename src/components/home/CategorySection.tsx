import { Link } from 'react-router-dom'
import { productCategories } from '../../constants/navigation.ts'

const categoryHints: Record<string, string> = {
  graphic: '图案印花',
  plain: '日常基础',
  oversized: '宽松版型',
  limited: '少量发售',
}

export function CategorySection() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-6 md:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            CATEGORIES
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            商品分类
          </h2>
        </div>
        <Link
          to="/products"
          className="text-sm text-stone-500 transition-colors hover:text-stone-950"
        >
          查看全部
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {productCategories.map((item) => (
          <Link
            key={item.key}
            to={`/products?category=${item.key}`}
            className="rounded-3xl bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs tracking-[0.16em] text-stone-400">
              {item.key.toUpperCase()}
            </p>
            <h3 className="mt-3 text-lg font-medium text-stone-950">
              {item.label}
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              {categoryHints[item.key]}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
