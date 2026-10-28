import { useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Form, Input, Radio, Switch } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  adoptGeneration,
  createGeneration,
  fetchDesign,
  fetchGeneration,
  fetchGenerations,
  retryGeneration,
  submitDesign,
  updateDesign,
} from '../../api/userDesigns.ts'
import { ApiError, getErrorMessage } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { isOwnedDesign, type DesignGeneration, type OwnedDesign } from '../../types/userDesign.ts'
import {
  GENERATION_STATUS_LABEL,
  ORIGIN_LABEL,
  REVIEW_STATUS_LABEL,
  VISIBILITY_LABEL,
  buildDesignPatch,
  formatDesignTime,
  isGenerationActive,
  isPreviewBlank,
  isRateLimited,
  isSessionEnd,
  sameResultImage,
  toEditorValues,
  validateDesignPrompt,
  validateDesignTitle,
  type DesignEditorValues,
} from '../../utils/userDesign.ts'
import { BoundImage } from './BoundImage.tsx'
import { ImageRefFields } from './ImageRefFields.tsx'

type OwnedDesignEditorProps = {
  design: OwnedDesign
}

export function OwnedDesignEditor({ design }: OwnedDesignEditorProps) {
  const { message, modal } = App.useApp()
  const queryClient = useQueryClient()
  const formKey = [
    design.updated_at,
    design.review_status,
    design.visibility,
    String(design.allow_sale),
    design.prompt ?? '',
    design.result?.object_key ?? '',
    design.result?.url ?? '',
    design.preview?.object_key ?? '',
  ].join('|')
  const [form] = Form.useForm<DesignEditorValues>()
  const busyRef = useRef(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null)
  const [regeneratePrompt, setRegeneratePrompt] = useState(design.prompt ?? '')
  const [promptEpoch, setPromptEpoch] = useState(formKey)
  const messageRef = useRef(message)

  if (promptEpoch !== formKey) {
    setPromptEpoch(formKey)
    setRegeneratePrompt(design.prompt ?? '')
  }

  const recordKey = queryKeys.designs.record(String(design.id))
  const generationsKey = queryKeys.designs.generations(String(design.id))

  const tasksQuery = useQuery({
    queryKey: generationsKey,
    queryFn: () => fetchGenerations(design.id),
    enabled: design.origin === 'ai',
    retry: false,
  })

  const tasks = useMemo(() => {
    const items = tasksQuery.data?.items ?? []
    return [...items].sort((a, b) => a.attempt_no - b.attempt_no)
  }, [tasksQuery.data])

  const activeTask = tasks.find((task) => isGenerationActive(task.status)) ?? null
  const locked = pendingAction !== null || Boolean(rateLimitMessage)
  const reviewing = design.review_status === 'pending'
  const promptEditable =
    design.origin === 'ai' &&
    (design.review_status === 'draft' || design.review_status === 'rejected')
  const imagesEditable =
    design.origin === 'upload' &&
    (design.review_status === 'draft' || design.review_status === 'rejected')
  const canSubmit = design.review_status === 'draft' || design.review_status === 'rejected'
  const previewKey = Form.useWatch(['preview', 'object_key'], form)
  const previewUrl = Form.useWatch(['preview', 'url'], form)
  const previewReady =
    Boolean(design.preview) ||
    (!isPreviewBlank({ object_key: previewKey ?? '', url: previewUrl ?? '' }) &&
      Boolean(previewKey?.trim()) &&
      Boolean(previewUrl?.trim()))

  const activeTaskId = activeTask?.id ?? null

  useEffect(() => {
    messageRef.current = message
  }, [message])

  useEffect(() => {
    form.setFieldsValue(toEditorValues(design))
  }, [design, form, formKey])

  useEffect(() => {
    if (activeTaskId == null || design.origin !== 'ai') {
      return
    }

    let stopped = false
    let timer = 0
    let announcedError = false
    const designId = design.id
    const taskId = activeTaskId
    const taskKey = queryKeys.designs.generations(String(designId))
    const designKey = queryKeys.designs.record(String(designId))

    const remember = (task: DesignGeneration) => {
      queryClient.setQueryData<{ items: DesignGeneration[] }>(taskKey, (current) => {
        const items = current?.items ? [...current.items] : []
        const index = items.findIndex((item) => item.id === task.id)
        if (index >= 0) {
          items[index] = task
        } else {
          items.push(task)
        }
        items.sort((a, b) => a.attempt_no - b.attempt_no)
        return { items }
      })
    }

    const tick = async () => {
      try {
        const task = await fetchGeneration(designId, taskId)

        if (task.status === 'pending' || task.status === 'running') {
          if (stopped) {
            return
          }
          remember(task)
          timer = window.setTimeout(() => {
            void tick()
          }, 2000)
          return
        }

        if (task.status === 'succeeded') {
          messageRef.current.success('生成完成')
        } else {
          messageRef.current.error(task.error_message || '生成失败')
        }

        remember(task)

        if (task.status !== 'succeeded') {
          return
        }

        const next = await fetchDesign(designId)
        if (isOwnedDesign(next)) {
          queryClient.setQueryData(designKey, next)
        }
        const history = await fetchGenerations(designId)
        queryClient.setQueryData(taskKey, history)
        void queryClient.invalidateQueries({ queryKey: ['designs', 'mine'] })
        void queryClient.invalidateQueries({ queryKey: ['designs', 'public'] })
      } catch (error) {
        if (stopped || isSessionEnd(error)) {
          return
        }

        if (!announcedError) {
          announcedError = true
          messageRef.current.error(getErrorMessage(error, '查询生成任务失败'))
        }

        const stopForGood =
          error instanceof ApiError &&
          (error.status === 400 || error.status === 403 || error.status === 404)

        if (stopForGood) {
          return
        }

        timer = window.setTimeout(() => {
          void tick()
        }, 2000)
      }
    }

    timer = window.setTimeout(() => {
      void tick()
    }, 2000)

    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [activeTaskId, design.id, design.origin, queryClient])

  const report = (error: unknown) => {
    if (isSessionEnd(error)) {
      return
    }

    if (isRateLimited(error)) {
      setRateLimitMessage(getErrorMessage(error))
    }

    message.error(getErrorMessage(error))
  }

  const applyDesign = (next: OwnedDesign) => {
    queryClient.setQueryData(recordKey, next)
    void queryClient.invalidateQueries({ queryKey: ['designs', 'mine'] })
    void queryClient.invalidateQueries({ queryKey: ['designs', 'public'] })
  }

  const rememberTask = (task: DesignGeneration) => {
    queryClient.setQueryData<{ items: DesignGeneration[] }>(generationsKey, (current) => {
      const items = current?.items ? [...current.items] : []
      const index = items.findIndex((item) => item.id === task.id)
      if (index >= 0) {
        items[index] = task
      } else {
        items.push(task)
      }
      items.sort((a, b) => a.attempt_no - b.attempt_no)
      return { items }
    })
  }

  const ask = (title: string, content: string, okText: string) => {
    return new Promise<boolean>((resolve) => {
      let settled = false
      const finish = (value: boolean) => {
        if (settled) {
          return
        }
        settled = true
        resolve(value)
      }

      modal.confirm({
        title,
        content,
        okText,
        cancelText: '取消',
        onOk: () => finish(true),
        onCancel: () => finish(false),
      })
    })
  }

  const confirmRegenerate = () =>
    ask(
      '重新生成会使审核失效',
      '生成成功后，作品会回到草稿、变为私有，出售许可会变为 0，拒绝原因会被清空。',
      '开始生成',
    )

  const save = async (values: DesignEditorValues) => {
    if (busyRef.current || rateLimitMessage || reviewing) {
      return
    }

    const built = buildDesignPatch(design, values)
    if (!built.ok) {
      message.error(built.message)
      return
    }

    if (!built.patch) {
      message.info('没有需要保存的修改')
      return
    }

    busyRef.current = true
    setPendingAction('save')

    try {
      const next = await updateDesign(design.id, built.patch)
      applyDesign(next)
      message.success('设计已更新')
    } catch (error) {
      report(error)
    } finally {
      busyRef.current = false
      setPendingAction(null)
    }
  }

  const startGeneration = async () => {
    if (busyRef.current || rateLimitMessage) {
      return
    }

    if (design.origin !== 'ai') {
      message.error('上传作品不能生成')
      return
    }

    if (activeTask) {
      message.warning('已有进行中的生成任务')
      return
    }

    const raw =
      design.review_status === 'approved'
        ? regeneratePrompt
        : String(form.getFieldValue('prompt') ?? '')
    const trimmed = raw.trim()
    const current = (design.prompt ?? '').trim()
    let prompt: string | undefined

    if (trimmed !== current) {
      const error = validateDesignPrompt(raw)
      if (error) {
        message.error(error)
        return
      }
      prompt = trimmed
    } else if (!current) {
      const error = validateDesignPrompt(raw)
      if (error) {
        message.error(error)
        return
      }
    }

    if (design.review_status !== 'draft') {
      const confirmed = await confirmRegenerate()
      if (!confirmed) {
        return
      }
    }

    busyRef.current = true
    setPendingAction('generate')

    try {
      const task = await createGeneration(design.id, prompt)
      rememberTask(task)
      message.success('已开始生成，正在排队')
    } catch (error) {
      report(error)
    } finally {
      busyRef.current = false
      setPendingAction(null)
    }
  }

  const retryTask = async (taskId: number) => {
    if (busyRef.current || rateLimitMessage) {
      return
    }

    if (activeTask) {
      message.warning('已有进行中的生成任务')
      return
    }

    if (design.review_status !== 'draft') {
      const confirmed = await confirmRegenerate()
      if (!confirmed) {
        return
      }
    }

    busyRef.current = true
    setPendingAction(`retry:${taskId}`)

    try {
      const task = await retryGeneration(design.id, taskId)
      rememberTask(task)
      message.success('已重新开始生成')
    } catch (error) {
      report(error)
    } finally {
      busyRef.current = false
      setPendingAction(null)
    }
  }

  const adoptTask = async (task: DesignGeneration) => {
    if (busyRef.current || rateLimitMessage || reviewing) {
      return
    }

    const replacing = !sameResultImage(design.result, task.result)
    if (replacing && design.review_status !== 'draft') {
      const confirmed = await ask(
        '采用这张图会使审核失效',
        '换成另一张成品图后，作品会回到草稿、变为私有，出售许可会变为 0，拒绝原因会被清空。',
        '采用',
      )
      if (!confirmed) {
        return
      }
    }

    busyRef.current = true
    setPendingAction(`adopt:${task.id}`)

    try {
      const next = await adoptGeneration(design.id, task.id)
      applyDesign(next)
      message.success('已采用这张成品图')
    } catch (error) {
      report(error)
    } finally {
      busyRef.current = false
      setPendingAction(null)
    }
  }

  const submitReview = async () => {
    if (busyRef.current || rateLimitMessage || !canSubmit) {
      return
    }

    if (activeTask) {
      return
    }

    busyRef.current = true
    setPendingAction('submit')

    try {
      const next = await submitDesign(design.id)
      applyDesign(next)
      message.success('已提交审核')
    } catch (error) {
      report(error)
    } finally {
      busyRef.current = false
      setPendingAction(null)
    }
  }

  const updatedAt = formatDesignTime(design.updated_at)

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">MY DESIGN</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{design.title}</h1>
          <p className="mt-3 text-sm text-stone-500">
            {ORIGIN_LABEL[design.origin]} · {REVIEW_STATUS_LABEL[design.review_status]} ·{' '}
            {VISIBILITY_LABEL[design.visibility]}
            {design.allow_sale === 1 ? ' · 允许出售' : ''}
            {updatedAt ? ` · 更新于 ${updatedAt}` : ''}
          </p>
        </div>
        <Link to="/my-designs" className="text-sm text-stone-500 hover:text-stone-950">
          返回我的设计
        </Link>
      </div>

      {design.review_status === 'rejected' ? (
        <p className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-stone-700 shadow-sm">
          拒绝原因：{design.reject_reason || '未填写'}
        </p>
      ) : null}

      {reviewing ? (
        <p className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-stone-600 shadow-sm">
          设计正在审核。审核结束前不能修改、生成、重试、采用或再次提交。
        </p>
      ) : null}

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <section>
          <h2 className="mb-3 text-sm font-medium text-stone-700">成品图</h2>
          {design.result?.url ? (
            <BoundImage url={design.result.url} alt={design.title} />
          ) : (
            <p className="rounded-2xl bg-white px-4 py-8 text-sm text-stone-500">尚未生成</p>
          )}
        </section>
        <section>
          <h2 className="mb-3 text-sm font-medium text-stone-700">预览图</h2>
          {design.preview?.url ? (
            <BoundImage url={design.preview.url} alt={`${design.title}预览`} />
          ) : (
            <p className="rounded-2xl bg-white px-4 py-8 text-sm text-stone-500">还没有预览图</p>
          )}
        </section>
        {design.origin === 'upload' ? (
          <section>
            <h2 className="mb-3 text-sm font-medium text-stone-700">原图</h2>
            {design.original?.url ? (
              <BoundImage url={design.original.url} alt={`${design.title}原图`} />
            ) : (
              <p className="rounded-2xl bg-white px-4 py-8 text-sm text-stone-500">还没有原图</p>
            )}
          </section>
        ) : (
          <section>
            <h2 className="mb-3 text-sm font-medium text-stone-700">提示词</h2>
            <p className="rounded-2xl bg-white px-4 py-4 text-sm leading-6 whitespace-pre-wrap text-stone-700">
              {design.prompt || '没有提示词'}
            </p>
          </section>
        )}
      </div>

      {rateLimitMessage ? (
        <p className="mt-6 text-sm text-amber-700">{rateLimitMessage}</p>
      ) : null}

      {reviewing ? null : (
        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-stone-950">修改设计</h2>
          <Form<DesignEditorValues>
            key={formKey}
            form={form}
            layout="vertical"
            requiredMark={false}
            autoComplete="off"
            className="mt-6 max-w-2xl"
            initialValues={toEditorValues(design)}
            onFinish={(values) => void save(values)}
            disabled={locked}
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
              <Input maxLength={128} />
            </Form.Item>

            {promptEditable ? (
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
                <Input.TextArea rows={5} maxLength={4000} />
              </Form.Item>
            ) : null}

            {imagesEditable ? (
              <div className="mb-6 space-y-4">
                <ImageRefFields prefix="original" legend="原图" />
                <ImageRefFields prefix="result" legend="成品图" />
              </div>
            ) : null}

            <div className="mb-6">
              <ImageRefFields prefix="preview" legend="预览图（可选）" optional />
            </div>

            {design.review_status === 'approved' ? (
              <>
                <Form.Item
                  label="可见性"
                  name="visibility"
                  extra={
                    previewReady
                      ? '设为公开后，未登录的访客可以打开这件设计。'
                      : '公开设计必须已通过审核并有预览图。预览图可以和公开一起保存。'
                  }
                >
                  <Radio.Group>
                    <Radio value="private">私有</Radio>
                    <Radio value="public" disabled={!previewReady}>
                      公开
                    </Radio>
                  </Radio.Group>
                </Form.Item>
                {design.result ? (
                  <Form.Item
                    label="允许出售"
                    name="allow_sale"
                    valuePropName="checked"
                    extra="这只是一个标志，不会因此创建商品。"
                  >
                    <Switch checkedChildren="允许" unCheckedChildren="关闭" />
                  </Form.Item>
                ) : null}
              </>
            ) : null}

            <Button type="primary" htmlType="submit" loading={pendingAction === 'save'}>
              保存修改
            </Button>
          </Form>
        </section>
      )}

      {design.origin === 'ai' && !reviewing ? (
        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-stone-950">
            {design.review_status === 'approved' ? '重新生成' : '生成'}
          </h2>
          {design.review_status === 'approved' ? (
            <>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                重新生成并成功后，审核会失效：作品回到草稿、变为私有，出售许可变为 0。
              </p>
              <Input.TextArea
                className="mt-4 max-w-2xl"
                rows={4}
                maxLength={4000}
                value={regeneratePrompt}
                disabled={locked || Boolean(activeTask)}
                onChange={(event) => setRegeneratePrompt(event.target.value)}
              />
            </>
          ) : (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              使用上面的提示词开始生成。生成完成前状态是排队中，页面会每 2 秒查询一次。
            </p>
          )}
          {activeTask ? (
            <div className="mt-4 max-w-2xl text-sm leading-6 text-amber-800">
              <p>已有进行中的生成任务</p>
              <p className="text-stone-600">
                {GENERATION_STATUS_LABEL[activeTask.status]}。离开页面会停止查询。长时间停留在排队中，通常是生成服务没有在运行。
              </p>
            </div>
          ) : null}
          <Button
            className="mt-4"
            type="primary"
            disabled={locked || Boolean(activeTask)}
            loading={pendingAction === 'generate'}
            onClick={() => void startGeneration()}
          >
            {design.review_status === 'approved' ? '重新生成' : '开始生成'}
          </Button>
        </section>
      ) : null}

      {canSubmit ? (
        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-stone-950">提交审核</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            {design.result
              ? '提交后进入审核中，不能再修改或生成。'
              : '还没有成品图时不能通过审核。'}
          </p>
          {activeTask ? (
            <p className="mt-3 text-sm text-amber-800">已有进行中的生成任务</p>
          ) : null}
          <Button
            className="mt-4"
            type="primary"
            disabled={locked || Boolean(activeTask)}
            loading={pendingAction === 'submit'}
            onClick={() => void submitReview()}
          >
            {design.review_status === 'rejected' ? '重新提交审核' : '提交审核'}
          </Button>
        </section>
      ) : null}

      {design.origin === 'ai' ? (
        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-stone-950">生成历史</h2>
          {tasksQuery.isPending ? (
            <p className="mt-4 text-sm text-stone-500">正在加载生成历史…</p>
          ) : null}
          {tasksQuery.isError && !isSessionEnd(tasksQuery.error) ? (
            <p className="mt-4 text-sm text-stone-600">{getErrorMessage(tasksQuery.error)}</p>
          ) : null}
          {tasksQuery.isSuccess && tasks.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">还没有生成记录</p>
          ) : null}
          <div className="mt-4 space-y-4">
            {tasks.map((task) => {
              const current = sameResultImage(design.result, task.result)
              const createdAt = formatDesignTime(task.created_at)
              return (
                <article key={task.id} className="rounded-2xl bg-stone-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-stone-900">
                      第 {task.attempt_no} 次 · {GENERATION_STATUS_LABEL[task.status]}
                    </h3>
                    <p className="text-xs text-stone-400">
                      {createdAt}
                      {task.provider ? ` · ${task.provider}` : ''}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-stone-600">
                    {task.prompt}
                  </p>
                  {task.retry_of_task_id ? (
                    <p className="mt-1 text-xs text-stone-400">重试自任务 {task.retry_of_task_id}</p>
                  ) : null}
                  {task.status === 'failed' && task.error_message ? (
                    <p className="mt-2 text-sm text-stone-700">{task.error_message}</p>
                  ) : null}
                  {task.result?.url ? (
                    <div className="mt-3 max-w-xs">
                      <BoundImage url={task.result.url} alt={`第 ${task.attempt_no} 次结果`} />
                    </div>
                  ) : null}
                  {reviewing ? null : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.status === 'failed' ? (
                        <Button
                          disabled={locked || Boolean(activeTask)}
                          loading={pendingAction === `retry:${task.id}`}
                          onClick={() => void retryTask(task.id)}
                        >
                          重试
                        </Button>
                      ) : null}
                      {task.status === 'succeeded' && task.result ? (
                        current ? (
                          <span className="text-sm text-stone-500">当前成品</span>
                        ) : (
                          <Button
                            disabled={locked}
                            loading={pendingAction === `adopt:${task.id}`}
                            onClick={() => void adoptTask(task)}
                          >
                            采用
                          </Button>
                        )
                      ) : null}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
