import { App, Button, InputNumber } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cart.ts'
import type { Product, ProductColor, ProductSize } from '../../types/product.ts'
import { getTotalStock, getVariantStock } from '../../types/product.ts'

type ProductPurchasePanelProps = {
  product: Product
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const selectOnly = useCartStore((state) => state.selectOnly)

  const [colorKey, setColorKey] = useState<string | null>(null)
  const [size, setSize] = useState<ProductSize | null>(null)
  const [quantity, setQuantity] = useState(1)

  const selectedColor: ProductColor | undefined = product.colors.find(
    (item) => item.key === colorKey,
  )
  const stock =
    colorKey && size ? getVariantStock(product, colorKey, size) : null
  const totalStock = getTotalStock(product)
  const outOfStock = stock === 0
  const canPurchase = Boolean(colorKey && size && stock && stock > 0)
  const safeQuantity =
    stock !== null && stock > 0 ? Math.min(quantity, stock) : Math.max(1, quantity)

  const requireSpecs = () => {
    if (!colorKey) {
      message.warning('请先选择颜色')
      return false
    }
    if (!size) {
      message.warning('请先选择尺码')
      return false
    }
    if (!stock || stock < 1) {
      message.warning('该规格暂时无货，请更换颜色或尺码')
      return false
    }
    if (safeQuantity < 1) {
      message.warning('购买数量不能小于 1')
      return false
    }
    return true
  }

  const addToCart = () => {
    if (!requireSpecs() || !selectedColor || !size || !stock) {
      return null
    }

    return addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      colorKey: selectedColor.key,
      colorLabel: selectedColor.label,
      colorHex: selectedColor.hex,
      size,
      quantity: safeQuantity,
      maxQuantity: stock,
    })
  }

  const handleAddToCart = () => {
    const cartItemId = addToCart()
    if (!cartItemId) {
      return
    }
    message.success('已加入购物车')
  }

  const handleBuyNow = () => {
    const cartItemId = addToCart()
    if (!cartItemId) {
      return
    }
    selectOnly([cartItemId])
    message.success('已加入购物车，正在前往结算')
    navigate('/checkout')
  }

  const selectColor = (nextColorKey: string) => {
    setColorKey(nextColorKey)
    if (size) {
      const nextStock = getVariantStock(product, nextColorKey, size)
      if (nextStock > 0) {
        setQuantity((current) => Math.min(Math.max(1, current), nextStock))
      }
    }
  }

  const selectSize = (nextSize: ProductSize) => {
    setSize(nextSize)
    if (colorKey) {
      const nextStock = getVariantStock(product, colorKey, nextSize)
      if (nextStock > 0) {
        setQuantity((current) => Math.min(Math.max(1, current), nextStock))
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-stone-950">颜色</p>
          {selectedColor ? (
            <p className="text-sm text-stone-500">{selectedColor.label}</p>
          ) : (
            <p className="text-sm text-stone-400">请选择</p>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {product.colors.map((color) => {
            const selected = color.key === colorKey
            return (
              <button
                key={color.key}
                type="button"
                aria-label={color.label}
                aria-pressed={selected}
                title={color.label}
                className={
                  selected
                    ? 'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ring-2 ring-stone-950 ring-offset-2'
                    : 'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ring-1 ring-stone-300 ring-offset-2 transition hover:ring-stone-500'
                }
                onClick={() => selectColor(color.key)}
              >
                <span
                  className="h-8 w-8 rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-stone-950">尺码</p>
          {size ? (
            <p className="text-sm text-stone-500">{size}</p>
          ) : (
            <p className="text-sm text-stone-400">请选择</p>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((item) => {
            const selected = item === size
            const itemStock = colorKey
              ? getVariantStock(product, colorKey, item)
              : null
            const disabled = itemStock === 0
            return (
              <button
                key={item}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                className={
                  disabled
                    ? 'h-10 min-w-14 cursor-not-allowed rounded-xl border border-stone-200 bg-stone-100 px-3 text-sm text-stone-300 line-through'
                    : selected
                      ? 'h-10 min-w-14 cursor-pointer rounded-xl border border-stone-950 bg-stone-950 px-3 text-sm font-medium text-white'
                      : 'h-10 min-w-14 cursor-pointer rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-700 transition hover:border-stone-950'
                }
                onClick={() => selectSize(item)}
              >
                {item}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-stone-950">数量</p>
          <p className="text-sm text-stone-500">
            {stock === null
              ? `总库存 ${totalStock} 件（选定规格后显示可购数量）`
              : outOfStock
                ? '该规格暂无库存'
                : `库存 ${stock} 件`}
          </p>
        </div>
        <div className="mt-3">
          <InputNumber
            min={1}
            max={stock && stock > 0 ? stock : 1}
            value={safeQuantity}
            disabled={stock !== null && stock < 1}
            onChange={(value) => {
              const next = typeof value === 'number' ? value : 1
              const capped =
                stock && stock > 0 ? Math.min(next, stock) : Math.max(1, next)
              setQuantity(Math.max(1, capped))
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="primary"
          size="large"
          className="sm:flex-1"
          disabled={Boolean(colorKey && size && !canPurchase)}
          onClick={handleAddToCart}
        >
          加入购物车
        </Button>
        <Button
          size="large"
          className="sm:flex-1"
          disabled={Boolean(colorKey && size && !canPurchase)}
          onClick={handleBuyNow}
        >
          立即购买
        </Button>
      </div>

      {!colorKey || !size ? (
        <p className="text-xs text-stone-400">
          需先选择颜色和尺码后才能加入购物车。
        </p>
      ) : null}
    </div>
  )
}
