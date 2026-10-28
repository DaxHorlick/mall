import { useQueryClient } from '@tanstack/react-query'
import { App, Button, Form, Input } from 'antd'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAiDesign } from '../../api/userDesigns.ts'
import { getErrorMessage } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import {
  isRateLimited,
  isSessionEnd,
  validateDesignPrompt,
  validateDesignTitle,
} from '../../utils/userDesign.ts'

type AiDesignForm = {
  title: string
  prompt: string
}

export function CreateAiDesignPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const busyRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null)

  const submit = async (values: AiDesignForm) => {
    if (busyRef.current || rateLimitMessage) {
      return
    }

    const titleError = validateDesignTitle(values.title ?? '')
    if (titleError) {
      message.error(titleError)
      return
    }

    const promptError = validateDesignPrompt(values.prompt ?? '')
    if (promptError) {
      message.error(promptError)
      return
    }

    busyRef.current = true
    setSubmitting(true)

    try {
      const design = await createAiDesign({
        title: values.title.trim(),
        prompt: values.prompt.trim(),
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
      <p className="text-xs font-medium tracking-[0.22em] text-stone-400">AI DESIGN</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">创建 AI 设计</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
        只需要标题和提示词。创建后是私有草稿，还没有成品图。生成会在设计页单独进行。
      </p>
      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <Form<AiDesignForm>
          layout="vertical"
          requiredMark={false}
          autoComplete="off"
          className="max-w-2xl"
          disabled={submitting || Boolean(rateLimitMessage)}
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
            <Input size="large" maxLength={128} placeholder="夏季图案" />
          </Form.Item>
          <Form.Item
            label="提示词"
            name="prompt"
            extra="去掉首尾空白后 1 到 4000 个字符，可以换行。"
            rules={[
              {
                validator: (_, value: string | undefined) => {
                  const error = validateDesignPrompt(value ?? '')
                  return error ? Promise.reject(new Error(error)) : Promise.resolve()
                },
              },
            ]}
          >
            <Input.TextArea rows={6} maxLength={4000} placeholder="白底蓝花衬衫图案" />
          </Form.Item>
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
              创建设计
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
