import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'antd'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productCategories } from '../../constants/navigation.ts'
import {
  useSellerProductsStore,
  type SellerProduct,
  type SellerProductFormValues,
} from '../../stores/sellerProducts.ts'
import type { ProductColor, ProductSize } from '../../types/product.ts'
import { getTotalStock } from '../../types/product.ts'
import { formatPrice } from '../../utils/format.ts'

const COLOR_OPTIONS: ProductColor[] = [
  { key: 'black', label: '黑色', hex: '#171717' },
  { key: 'white', label: '白色', hex: '#f5f5f4' },
  { key: 'stone', label: '石灰', hex: '#a8a29e' },
  { key: 'navy', label: '藏青', hex: '#1e293b' },
  { key: 'olive', label: '橄榄绿', hex: '#3f4f3a' },
]

const SIZE_OPTIONS: ProductSize[] = ['S', 'M', 'L', 'XL']

const IMAGE_OPTIONS = [
  '/images/products/tee-ink.svg',
  '/images/products/tee-wave.svg',
  '/images/products/tee-bloom.svg',
  '/images/products/tee-grid.svg',
  '/images/products/tee-plain.svg',
  '/images/products/tee-oversized.svg',
  '/images/products/tee-limited.svg',
  '/images/products/tee-neon.svg',
]

function toFormValues(product?: SellerProduct): SellerProductFormValues {
  if (!product) {
    return {
      name: '',
      price: 129,
      category: 'graphic',
      description: '',
      imageUrl: IMAGE_OPTIONS[0],
      colors: [COLOR_OPTIONS[0], COLOR_OPTIONS[1]],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 40,
      status: 'on_sale',
    }
  }

  return {
    name: product.name,
    price: product.price,
    category: product.category,
    description: product.description,
    imageUrl: product.imageUrl,
    colors: product.colors,
    sizes: product.sizes,
    stock: getTotalStock(product),
    status: product.status,
  }
}

export function SellerProductsPage() {
  const { message, modal } = App.useApp()
  const [searchParams] = useSearchParams()
  const fromDesign = searchParams.get('fromDesign') === '1'

  const products = useSellerProductsStore((state) => state.products)
  const createProduct = useSellerProductsStore((state) => state.createProduct)
  const updateProduct = useSellerProductsStore((state) => state.updateProduct)
  const toggleStatus = useSellerProductsStore((state) => state.toggleStatus)
  const removeProduct = useSellerProductsStore((state) => state.removeProduct)

  const [open, setOpen] = useState(fromDesign)
  const [editing, setEditing] = useState<SellerProduct | null>(null)
  const [form] = Form.useForm<SellerProductFormValues>()

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(toFormValues())
    setOpen(true)
  }

  const openEdit = (product: SellerProduct) => {
    setEditing(product)
    form.setFieldsValue(toFormValues(product))
    setOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (values.colors.length === 0 || values.sizes.length === 0) {
      message.warning('请至少选择一种颜色和一种尺码')
      return
    }

    if (editing) {
      updateProduct(editing.id, values)
      message.success('商品已更新（本地 Mock）')
    } else {
      createProduct(values)
      message.success('商品已新增（本地 Mock）')
    }
    setOpen(false)
  }

  const columns = [
    {
      title: '商品',
      dataIndex: 'name',
      render: (_: string, record: SellerProduct) => (
        <div>
          <p className="font-medium text-stone-950">{record.name}</p>
          <p className="text-xs text-stone-400">{record.id}</p>
        </div>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (price: number) => formatPrice(price),
    },
    {
      title: '库存',
      key: 'stock',
      width: 90,
      render: (_: unknown, record: SellerProduct) => getTotalStock(record),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: SellerProduct['status']) =>
        status === 'on_sale' ? (
          <Tag color="success">在售</Tag>
        ) : (
          <Tag>已下架</Tag>
        ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 260,
      render: (_: unknown, record: SellerProduct) => (
        <Space wrap>
          <Button type="link" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => toggleStatus(record.id)}>
            {record.status === 'on_sale' ? '下架' : '上架'}
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              modal.confirm({
                title: '删除商品？',
                content: '仅从本地 Mock 数据移除，不会影响真实后端。',
                okText: '删除',
                okButtonProps: { danger: true },
                onOk: () => {
                  removeProduct(record.id)
                  message.success('已删除')
                },
              })
            }}
          >
            删除
          </Button>
          <Link to={`/products/${record.id}`}>前台</Link>
        </Space>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            SELLER PRODUCTS
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            商品管理
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
            本地模拟新增、编辑、上下架与删除。不包含真实权限与发货。
            {fromDesign ? ' 你可以从 AI 设计进入发布流程。' : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/seller/orders">
            <Button>订单管理</Button>
          </Link>
          <Button type="primary" onClick={openCreate}>
            新增商品
          </Button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[1.5rem] bg-white p-2 shadow-sm md:p-4">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={products}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 720 }}
        />
      </div>

      <Modal
        title={editing ? '编辑商品' : '新增商品'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okText="保存"
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="商品名称"
            name="name"
            rules={[{ required: true, message: '请填写商品名称' }]}
          >
            <Input maxLength={40} />
          </Form.Item>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item
              label="价格"
              name="price"
              rules={[{ required: true, message: '请填写价格' }]}
            >
              <InputNumber min={1} max={9999} className="w-full" />
            </Form.Item>
            <Form.Item
              label="总库存"
              name="stock"
              rules={[{ required: true, message: '请填写库存' }]}
            >
              <InputNumber min={0} max={9999} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              options={productCategories.map((item) => ({
                value: item.key,
                label: item.label,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="封面图"
            name="imageUrl"
            rules={[{ required: true, message: '请选择封面图' }]}
          >
            <Select
              options={IMAGE_OPTIONS.map((url) => ({
                value: url,
                label: url.split('/').pop(),
              }))}
            />
          </Form.Item>
          <Form.Item
            label="颜色"
            name="colors"
            rules={[{ required: true, message: '请选择颜色' }]}
            getValueFromEvent={(keys: string[]) =>
              COLOR_OPTIONS.filter((item) => keys.includes(item.key))
            }
            getValueProps={(colors: ProductColor[] = []) => ({
              value: colors.map((item) => item.key),
            })}
          >
            <Select
              mode="multiple"
              options={COLOR_OPTIONS.map((item) => ({
                value: item.key,
                label: item.label,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="尺码"
            name="sizes"
            rules={[{ required: true, message: '请选择尺码' }]}
          >
            <Select
              mode="multiple"
              options={SIZE_OPTIONS.map((size) => ({
                value: size,
                label: size,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select
              options={[
                { value: 'on_sale', label: '在售' },
                { value: 'off_sale', label: '下架' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="介绍"
            name="description"
            rules={[{ required: true, message: '请填写介绍' }]}
          >
            <Input.TextArea rows={3} maxLength={160} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
