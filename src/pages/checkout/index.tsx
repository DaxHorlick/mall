import { useQuery } from '@tanstack/react-query'
import { App, Button, Form, Input, Result, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createOrder } from '../../api/orders.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { fetchCurrentUser } from '../../api/users.ts'
import { SafeImage } from '../../components/common/SafeImage.tsx'
import { useCartStore } from '../../stores/cart.ts'
import {
  FREE_SHIPPING_THRESHOLD,
  calcShippingFee,
  type OrderAddress,
} from '../../types/order.ts'
import { formatPrice } from '../../utils/format.ts'

type CheckoutForm = OrderAddress

export function CheckoutPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [form] = Form.useForm<CheckoutForm>()
  const [submitting, setSubmitting] = useState(false)
  const [failedMessage, setFailedMessage] = useState<string | null>(null)

  const items = useCartStore((state) => state.items)
  const selectedIds = useCartStore((state) => state.selectedIds)
  const removeSelected = useCartStore((state) => state.removeSelected)

  const userQuery = useQuery({
    queryKey: queryKeys.user.current,
    queryFn: fetchCurrentUser,
  })

  useEffect(() => {
    if (!userQuery.data) {
      return
    }
    form.setFieldsValue({
      receiverName: userQuery.data.name,
      phone: userQuery.data.phone,
      address: '上海市徐汇区示例路 88 号',
    })
  }, [form, userQuery.data])

  const selectedItems = items.filter((item) => selectedIds.includes(item.id))
  const goodsAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const shippingFee = calcShippingFee(goodsAmount)
  const totalAmount = goodsAmount + shippingFee

  const submitOrder = async (forceFail = false) => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      setFailedMessage(null)

      const result = await createOrder({
        items: selectedItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          colorKey: item.colorKey,
          colorLabel: item.colorLabel,
          size: item.size,
          quantity: item.quantity,
        })),
        address: values,
        forceFail,
      })

      if (!result.ok) {
        setFailedMessage(result.message)
        message.error(result.message)
        return
      }

      removeSelected()
      message.success('模拟下单成功（本地数据，非真实支付）')
      navigate(`/orders/${result.order.id}`)
    } catch {
      // 表单校验失败
    } finally {
      setSubmitting(false)
    }
  }

  if (selectedItems.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <Result
          status="info"
          title="没有待结算的商品"
          subTitle="请先在购物车勾选商品，或从商品详情点击「立即购买」。"
          extra={[
            <Link key="cart" to="/cart">
              <Button type="primary">去购物车</Button>
            </Link>,
            <Link key="products" to="/products">
              <Button>浏览商品</Button>
            </Link>,
          ]}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div>
        <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
          CHECKOUT
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          订单确认
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
          本页仅模拟提交订单，不会产生真实支付或发货。提交成功后的订单保存在本地
          Mock 数据中。
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-stone-950">收货信息</h2>
            {userQuery.isPending ? (
              <div className="flex justify-center py-8">
                <Spin tip="加载收货人信息…" />
              </div>
            ) : null}
            <Form form={form} layout="vertical" className="mt-4">
              <Form.Item
                label="收货人"
                name="receiverName"
                rules={[{ required: true, message: '请填写收货人' }]}
              >
                <Input placeholder="收货人姓名" maxLength={20} />
              </Form.Item>
              <Form.Item
                label="联系电话"
                name="phone"
                rules={[
                  { required: true, message: '请填写联系电话' },
                  { pattern: /^1\d{10}$/, message: '请输入 11 位手机号' },
                ]}
              >
                <Input placeholder="手机号" maxLength={11} />
              </Form.Item>
              <Form.Item
                label="收货地址"
                name="address"
                rules={[{ required: true, message: '请填写收货地址' }]}
              >
                <Input.TextArea
                  placeholder="省市区街道门牌号"
                  rows={3}
                  maxLength={120}
                  showCount
                />
              </Form.Item>
            </Form>
          </section>

          <section className="rounded-[1.5rem] bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-stone-950">待购买商品</h2>
            <div className="mt-4 space-y-4">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-200">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-stone-950">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {item.colorLabel} · {item.size} · x{item.quantity}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-stone-950">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-[1.5rem] bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-stone-950">费用明细</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-stone-600">
              <dt>商品金额</dt>
              <dd>{formatPrice(goodsAmount)}</dd>
            </div>
            <div className="flex justify-between text-stone-600">
              <dt>运费</dt>
              <dd>
                {shippingFee === 0 ? '免运费' : formatPrice(shippingFee)}
              </dd>
            </div>
            {shippingFee > 0 ? (
              <p className="text-xs text-stone-400">
                满 {formatPrice(FREE_SHIPPING_THRESHOLD)} 免运费
              </p>
            ) : null}
            <div className="flex justify-between border-t border-stone-100 pt-3 text-base font-semibold text-stone-950">
              <dt>订单总额</dt>
              <dd>{formatPrice(totalAmount)}</dd>
            </div>
          </dl>

          {failedMessage ? (
            <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {failedMessage}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <Button
              type="primary"
              size="large"
              loading={submitting}
              onClick={() => void submitOrder(false)}
            >
              模拟提交订单
            </Button>
            <Button
              size="large"
              loading={submitting}
              onClick={() => void submitOrder(true)}
            >
              模拟提交失败
            </Button>
            <Link to="/cart" className="text-center text-sm text-stone-500">
              返回购物车
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
