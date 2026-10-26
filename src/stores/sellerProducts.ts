import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockCurrentUser } from '../mocks/user.ts'
import { mockProducts } from '../mocks/products.ts'
import type { Product, ProductCategoryKey, ProductColor, ProductSize } from '../types/product.ts'
import { variantStockKey } from '../types/product.ts'

export type SellerProductStatus = 'on_sale' | 'off_sale'

export type SellerProduct = Product & {
  status: SellerProductStatus
}

export type SellerProductFormValues = {
  name: string
  price: number
  category: ProductCategoryKey
  description: string
  imageUrl: string
  colors: ProductColor[]
  sizes: ProductSize[]
  stock: number
  status: SellerProductStatus
}

type SellerProductsState = {
  products: SellerProduct[]
  createProduct: (values: SellerProductFormValues) => SellerProduct
  updateProduct: (id: string, values: SellerProductFormValues) => void
  toggleStatus: (id: string) => void
  removeProduct: (id: string) => void
  getById: (id: string) => SellerProduct | undefined
}

function toSellerProducts(): SellerProduct[] {
  return mockProducts
    .filter((item) => item.creatorId === mockCurrentUser.creatorId)
    .map((item) => ({
      ...item,
      status: 'on_sale' as const,
    }))
}

function buildStockMap(
  colors: ProductColor[],
  sizes: ProductSize[],
  stock: number,
) {
  const map: Record<string, number> = {}
  const perSku = Math.max(0, Math.floor(stock / Math.max(1, colors.length * sizes.length)))
  colors.forEach((color) => {
    sizes.forEach((size) => {
      map[variantStockKey(color.key, size)] = perSku
    })
  })
  return map
}

function createProductId() {
  return `p-seller-${Date.now().toString(36)}`
}

export const useSellerProductsStore = create<SellerProductsState>()(
  persist(
    (set, get) => ({
      products: toSellerProducts(),
      createProduct: (values) => {
        const product: SellerProduct = {
          id: createProductId(),
          name: values.name.trim(),
          price: values.price,
          imageUrl: values.imageUrl,
          category: values.category,
          creatorId: mockCurrentUser.creatorId,
          creatorName: mockCurrentUser.creatorName,
          isHot: false,
          isRecommended: false,
          createdAt: new Date().toISOString().slice(0, 10),
          description: values.description.trim(),
          colors: values.colors,
          sizes: values.sizes,
          stockMap: buildStockMap(values.colors, values.sizes, values.stock),
          status: values.status,
        }
        set({ products: [product, ...get().products] })
        return product
      },
      updateProduct: (id, values) => {
        set({
          products: get().products.map((item) =>
            item.id === id
              ? {
                  ...item,
                  name: values.name.trim(),
                  price: values.price,
                  imageUrl: values.imageUrl,
                  category: values.category,
                  description: values.description.trim(),
                  colors: values.colors,
                  sizes: values.sizes,
                  stockMap: buildStockMap(
                    values.colors,
                    values.sizes,
                    values.stock,
                  ),
                  status: values.status,
                }
              : item,
          ),
        })
      },
      toggleStatus: (id) => {
        set({
          products: get().products.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: item.status === 'on_sale' ? 'off_sale' : 'on_sale',
                }
              : item,
          ),
        })
      },
      removeProduct: (id) => {
        set({ products: get().products.filter((item) => item.id !== id) })
      },
      getById: (id) => get().products.find((item) => item.id === id),
    }),
    {
      name: 'inktee-seller-products',
    },
  ),
)
