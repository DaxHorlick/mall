import { useQueryClient } from '@tanstack/react-query'
import { App, Button, Form, Input } from 'antd'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUploadDesign } from '../../api/userDesigns.ts'
import { getErrorMessage } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { ImageRefFields } from '../../components/designs/ImageRefFields.tsx'
import {
  emptyImageFields,
  isPreviewBlank,
  isRateLimited,
  isSessionEnd,
  parseImageFields,
  parsePreviewFields,
  validateDesignTitle,
  type ImageFieldValues,
  type PreviewFieldValues,
} from '../../utils/userDesign.ts'

type UploadDesignForm = {
  title: string
  original: ImageFieldValues
  result: ImageFieldValues
  preview: PreviewFieldValues
}

export function CreateUploadDesignPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const busyRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null)

  const submit = async (values: UploadDesignForm) => {
    if (busyRef.current || rateLimitMessage) {
      return
    }

    const titleError = validateDesignTitle(values.title ?? '')
    if (titleError) {
      message.error(titleError)
      return
    }

    const original = parseImageFields(values.original)
    if (!original.ok) {
      message.error(original.message)
      return
    }

    const result = parseImageFields(values.result)
    if (!result.ok) {
      message.error(result.message)
      return
    }

    let preview: { object_key: string; url: string } | undefined
    if (!isPreviewBlank(values.preview)) {
      const parsed = parsePreviewFields(values.preview)
      if (!parsed.ok) {
        message.error(parsed.message)
        return
      }
      preview = parsed.value
    }

    busyRef.current = true
    setSubmitting(true)

    try {
      const design = await createUploadDesign({
        title: values.title.trim(),
        original: original.value,
        result: result.value,
        preview,
      })
      queryClient.setQueryData(queryKeys.designs.record(String(design.id)), design)
      void queryClient.invalidateQueries({ queryKey: ['designs', 'mine'] })
      message.success('设计已创建')
      navigate(`/designs/${design.id}`)
    } catch (error) {
      if (isSessionEnd(error)) {
        return
      }
      if (isRateLimited(error)) {
        setRateLimitMessage(getErrorMessage(error))
      }
      message.error(getErrorMessage(error))
    } finally {
      busyRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <p className="text-xs font-medium tracking-[0.22em] text-stone-400">UPLOAD</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">上传设计</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
        填写已经放在对象存储里的对象键和稳定地址。这里不接收图片文件。上传作品不能生成，也不会填写提示词。
      </p>
      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <Form<UploadDesignForm>
          layout="vertical"
          requiredMark={false}
          autoComplete="off"
          className="max-w-2xl"
          disabled={submitting || Boolean(rateLimitMessage)}
          initialValues={{
            title: '',
            original: emptyImageFields(),
            result: emptyImageFields(),
            preview: { object_key: '', url: '' },
          }}
          onFinish={(values) => void submit(values)}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[
              {
                validator: (_, value: string | undefined) => {
                  const error = validateDesignTitle(value ?? '')
                  return error ? Promise.reject(new Error(error)) : Promise.resolve()
                },
              },
            ]}
          >
            <Input size="large" maxLength={128} placeholder="手绘" />
          </Form.Item>
          <div className="mb-6 space-y-4">
            <ImageRefFields prefix="original" legend="原图" />
            <ImageRefFields prefix="result" legend="成品图" />
            <ImageRefFields prefix="preview" legend="预览图（可选）" optional />
          </div>
          {rateLimitMessage ? (
            <p className="mb-4 text-sm text-amber-700">{rateLimitMessage}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={Boolean(rateLimitMessage)}
            >
              创建上传设计
            </Button>
            <Link to="/my-designs" className="text-sm text-stone-500 hover:text-stone-950">
              返回我的设计
            </Link>
          </div>
        </Form>
      </section>
    </div>
  )
}
