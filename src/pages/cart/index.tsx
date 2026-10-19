import { App, Button, Checkbox, Empty, InputNumber } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { SafeImage } from '../../components/common/SafeImage.tsx'
import { useCartStore } from '../../stores/cart.ts'
import { formatPrice } from '../../utils/format.ts'

export function CartPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const selectedIds = useCartStore((state) => state.selectedIds)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const toggleSelect = useCartStore((state) => state.toggleSelect)
  const toggleSelectAll = useCartStore((state) => state.toggleSelectAll)

  const allSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id))
  const selectedItems = items.filter((item) => selectedIds.includes(item.id))
  const selectedQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )
  const selectedAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const goCheckout = () => {
    if (selectedItems.length === 0) {
      message.warning('请先选择要结算的商品')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            CART
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            购物车
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
            可修改数量、勾选结算。购物车数据保存在本地，不会提交到真实后端。
          </p>
        </div>
        <Link
          to="/products"
          className="text-sm text-stone-500 transition-colors hover:text-stone-950"
        >
          继续逛逛
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] bg-white px-6 py-16 shadow-sm">
          <Empty description="购物车还是空的，去挑一件 T 恤吧。">
            <Link to="/products">
              <Button type="primary">浏览商品</Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
            <Checkbox checked={allSelected} onChange={() => toggleSelectAll()}>
              全选
            </Checkbox>
            <p className="text-sm text-stone-500">共 {items.length} 种商品</p>
          </div>

          {items.map((item) => {
            const checked = selectedIds.includes(item.id)
            return (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <Checkbox
                  checked={checked}
                  onChange={() => toggleSelect(item.id)}
                />
                <Link
                  to={`/products/${item.productId}`}
                  className="block w-full shrink-0 overflow-hidden rounded-2xl bg-stone-200 sm:w-28"
                >
                  <div className="aspect-square">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </Link>

                <div className="min-w-0 flex-1 space-y-2">
                  <Link
                    to={`/products/${item.productId}`}
                    className="block truncate text-base font-medium text-stone-950 transition-colors hover:text-stone-700"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-stone-500">
                    颜色 {item.colorLabel}
                    <span className="mx-2 text-stone-300">·</span>
                    尺码 {item.size}
                  </p>
                  <p className="text-base font-semibold text-stone-950">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <InputNumber
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(value) => {
                      const next = typeof value === 'number' ? value : 1
                      updateQuantity(item.id, Math.max(1, next))
                    }}
                  />
                  <Button type="link" danger onClick={() => removeItem(item.id)}>
                    删除
                  </Button>
                </div>
              </article>
            )
          })}

          <div className="sticky bottom-4 flex flex-col gap-4 rounded-[1.5rem] border border-stone-200 bg-white/95 p-5 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Checkbox checked={allSelected} onChange={() => toggleSelectAll()}>
                全选
              </Checkbox>
              <p className="mt-2 text-sm text-stone-600">
                已选 {selectedQuantity} 件 · 合计{' '}
                <span className="text-lg font-semibold text-stone-950">
                  {formatPrice(selectedAmount)}
                </span>
              </p>
            </div>
            <Button type="primary" size="large" onClick={goCheckout}>
              去结算
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
