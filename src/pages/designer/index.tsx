import { App, Button, Input, Select, Upload } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client.ts'
import { createDesignTask, fetchDesignTask } from '../../api/designs.ts'
import { uploadImage } from '../../api/upload.ts'
import { DesignPreviewControls } from '../../components/designer/DesignPreviewControls.tsx'
import { TeePreview } from '../../components/designer/TeePreview.tsx'
import { SafeImage } from '../../components/common/SafeImage.tsx'
import { useDesignsStore } from '../../stores/designs.ts'
import {
  DEFAULT_PREVIEW_CONFIG,
  DESIGN_STYLE_OPTIONS,
  TEE_STYLE_OPTIONS,
  type DesignPreviewConfig,
  type DesignStyle,
  type DesignTask,
  type TeeStyle,
} from '../../types/design.ts'

const STATUS_LABEL: Record<DesignTask['status'], string> = {
  idle: '未开始',
  pending: '等待处理',
  processing: '生成中',
  succeeded: '生成成功',
  failed: '生成失败',
}

export function DesignerPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const saveWork = useDesignsStore((state) => state.saveWork)
  const pollTimer = useRef<number | null>(null)

  const [prompt, setPrompt] = useState('黑白几何圆环，简洁街头感')
  const [style, setStyle] = useState<DesignStyle>('minimal')
  const [teeStyle, setTeeStyle] = useState<TeeStyle>('regular')
  const [teeColor, setTeeColor] = useState('#171717')
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>()
  const [task, setTask] = useState<DesignTask | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<DesignPreviewConfig>({
    ...DEFAULT_PREVIEW_CONFIG,
    teeColor: '#171717',
  })
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (pollTimer.current !== null) {
        window.clearTimeout(pollTimer.current)
      }
    }
  }, [])

  const stopPolling = () => {
    if (pollTimer.current !== null) {
      window.clearTimeout(pollTimer.current)
      pollTimer.current = null
    }
  }

  const pollTask = (taskId: string) => {
    stopPolling()
    const tick = async () => {
      try {
        const next = await fetchDesignTask(taskId)
        setTask(next)
        if (next.status === 'succeeded' || next.status === 'failed') {
          setSubmitting(false)
          if (next.status === 'succeeded' && next.resultImageUrl) {
            setPreview((current) => ({
              ...current,
              teeColor,
            }))
            message.success('模拟生成完成（非真实 AI 结果）')
          }
          if (next.status === 'failed') {
            message.error(next.errorMessage ?? '生成失败')
          }
          return
        }
        pollTimer.current = window.setTimeout(() => {
          void tick()
        }, 450)
      } catch (error) {
        setSubmitting(false)
        message.error(getErrorMessage(error, '查询任务失败'))
      }
    }
    void tick()
  }

  const startGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('请先填写文字描述')
      return
    }

    stopPolling()
    setSubmitting(true)
    setSavedId(null)
    setTask(null)

    try {
      let uploadedUrl = referenceImageUrl
      const rawFile = fileList[0]?.originFileObj
      if (rawFile && !uploadedUrl) {
        const uploaded = await uploadImage(rawFile)
        uploadedUrl = uploaded.url
        setReferenceImageUrl(uploaded.url)
        if (uploaded.isMock) {
          message.info('参考图已走本地 Mock 上传（未发送到服务器）')
        }
      }

      const created = await createDesignTask({
        prompt,
        style,
        teeStyle,
        teeColor,
        referenceImageName: fileList[0]?.name,
        referenceImageUrl: uploadedUrl,
      })
      setTask(created)
      pollTask(created.taskId)
    } catch (error) {
      setSubmitting(false)
      message.error(getErrorMessage(error, '提交任务失败'))
    }
  }

  const handleSave = () => {
    if (!task || task.status !== 'succeeded' || !task.resultImageUrl) {
      message.warning('请先成功生成设计')
      return
    }

    const work = saveWork({
      title: prompt.trim().slice(0, 24) || '我的 AI 设计',
      imageUrl: task.resultImageUrl,
      prompt: task.prompt,
      style: task.style,
      teeStyle: task.teeStyle,
      preview,
    })
    setSavedId(work.id)
    message.success('已保存到我的设计（本地 Mock）')
  }

  const goPublish = () => {
    if (!savedId) {
      handleSave()
    }
    navigate('/seller/products?fromDesign=1')
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-stone-400">
            AI DESIGNER
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            AI 设计器
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 md:text-base">
            当前为本地 Mock 模拟生成流程，结果图来自项目内示例资源，不是真实大模型输出。
            描述中包含「失败」可演示失败态。
          </p>
        </div>
        <Link
          to="/my-designs"
          className="text-sm text-stone-500 transition-colors hover:text-stone-950"
        >
          我的设计
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="space-y-5 rounded-[1.5rem] bg-white p-5 shadow-sm md:p-6">
          <div>
            <p className="text-sm font-medium text-stone-950">文字描述</p>
            <Input.TextArea
              className="mt-2"
              rows={4}
              maxLength={200}
              showCount
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="描述你想要的图案，例如：复古太阳花，中心对称"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-stone-950">风格</p>
              <Select
                className="w-full"
                value={style}
                options={DESIGN_STYLE_OPTIONS}
                onChange={setStyle}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-stone-950">T 恤款式</p>
              <Select
                className="w-full"
                value={teeStyle}
                options={TEE_STYLE_OPTIONS}
                onChange={setTeeStyle}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-stone-950">衣服底色</p>
            <Select
              className="w-full"
              value={teeColor}
              onChange={(value) => {
                setTeeColor(value)
                setPreview((current) => ({ ...current, teeColor: value }))
              }}
              options={[
                { value: '#171717', label: '黑色' },
                { value: '#f5f5f4', label: '白色' },
                { value: '#1e293b', label: '藏青' },
                { value: '#3f4f3a', label: '橄榄' },
              ]}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-stone-950">参考图片</p>
            <Upload
              accept="image/*"
              maxCount={1}
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: next }) => {
                setFileList(next)
                setReferenceImageUrl(undefined)
              }}
            >
              <Button>上传参考图（仅本地记录文件名）</Button>
            </Upload>
            <p className="mt-2 text-xs text-stone-400">
              不会上传到服务器，后续接入真实接口时再传文件。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              size="large"
              loading={submitting}
              onClick={() => void startGenerate()}
            >
              {task?.status === 'failed' ? '重新生成' : '生成设计'}
            </Button>
            {task?.status === 'failed' ? (
              <Button
                size="large"
                disabled={submitting}
                onClick={() => void startGenerate()}
              >
                重试
              </Button>
            ) : null}
          </div>

          <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
            <p>
              任务状态：
              <span className="ml-2 font-medium text-stone-950">
                {task ? STATUS_LABEL[task.status] : STATUS_LABEL.idle}
              </span>
            </p>
            {task?.taskId ? (
              <p className="mt-1 text-xs text-stone-400">taskId: {task.taskId}</p>
            ) : null}
            {task?.errorMessage ? (
              <p className="mt-2 text-red-600">{task.errorMessage}</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-5 rounded-[1.5rem] bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-950">效果预览</h2>
            <span className="text-xs text-amber-700">模拟结果 · 非真实 AI</span>
          </div>

          {task?.status === 'succeeded' && task.resultImageUrl ? (
            <>
              <TeePreview
                patternUrl={task.resultImageUrl}
                config={preview}
                teeStyle={teeStyle}
              />
              <DesignPreviewControls value={preview} onChange={setPreview} />
              <div className="overflow-hidden rounded-2xl bg-stone-50 p-3">
                <p className="mb-2 text-xs text-stone-400">生成图案原图</p>
                <SafeImage
                  src={task.resultImageUrl}
                  alt="生成结果"
                  className="mx-auto h-40 w-auto object-contain"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="primary" onClick={handleSave}>
                  保存作品
                </Button>
                <Button onClick={goPublish}>进入商品发布</Button>
                {savedId ? (
                  <Link to="/my-designs" className="self-center text-sm text-stone-500">
                    已保存，去我的设计
                  </Link>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-[1.5rem] bg-stone-50 px-6 text-center">
              <p className="text-sm text-stone-500">
                {submitting
                  ? '正在模拟生成，请稍候…'
                  : '生成成功后可在此调整图案位置、尺寸与衣服颜色'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
