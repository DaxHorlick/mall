import { ApiError, request } from './client.ts'
import { isMockMode, mockDelay } from './config.ts'
import { getLatestDesigns, mockDesigns } from '../mocks/designs.ts'
import { useDesignsStore } from '../stores/designs.ts'
import type {
  DesignStyle,
  DesignTask,
  DesignWork,
  TeeStyle,
} from '../types/design.ts'

const tasks = new Map<string, DesignTask & { startedAt: number }>()

const RESULT_IMAGES = [
  '/images/designs/design-01.svg',
  '/images/designs/design-02.svg',
  '/images/designs/design-03.svg',
  '/images/designs/design-04.svg',
]

export type CreateDesignTaskInput = {
  prompt: string
  style: DesignStyle
  teeStyle: TeeStyle
  teeColor: string
  referenceImageName?: string
  /** 参考图已上传后的 URL（真实模式使用） */
  referenceImageUrl?: string
}

function createTaskId() {
  return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function toPublicTask(task: DesignTask & { startedAt: number }): DesignTask {
  return {
    taskId: task.taskId,
    status: task.status,
    prompt: task.prompt,
    style: task.style,
    teeStyle: task.teeStyle,
    teeColor: task.teeColor,
    referenceImageName: task.referenceImageName,
    resultImageUrl: task.resultImageUrl,
    errorMessage: task.errorMessage,
    isMock: task.isMock,
    createdAt: task.createdAt,
  }
}

/** 设计作品列表（含本地已保存作品） */
export async function fetchDesignWorks(): Promise<DesignWork[]> {
  if (isMockMode()) {
    await mockDelay(200)
    const local = useDesignsStore.getState().works
    return local.length > 0 ? local : mockDesigns
  }

  // TODO(backend): Go 设计作品列表接口尚未实现
  return request<DesignWork[]>('/designs')
}

export async function fetchLatestDesigns(limit = 4): Promise<DesignWork[]> {
  if (isMockMode()) {
    await mockDelay(180)
    const local = useDesignsStore.getState().works
    if (local.length > 0) {
      return [...local]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit)
    }
    return getLatestDesigns(limit)
  }

  // TODO(backend): Go 最新设计接口尚未实现
  return request<DesignWork[]>(`/designs/latest?limit=${limit}`)
}

/**
 * 提交 AI 设计任务。
 * Mock：内存任务机；真实：POST `/ai/tasks`（Python AI 服务尚未实现）
 */
export async function createDesignTask(
  input: CreateDesignTaskInput,
): Promise<DesignTask> {
  const prompt = input.prompt.trim()
  if (!prompt) {
    throw new ApiError(400, '请填写设计描述')
  }

  if (isMockMode()) {
    await mockDelay(320)
    const taskId = createTaskId()
    const task: DesignTask & { startedAt: number } = {
      taskId,
      status: 'pending',
      prompt,
      style: input.style,
      teeStyle: input.teeStyle,
      teeColor: input.teeColor,
      referenceImageName: input.referenceImageName,
      isMock: true,
      createdAt: new Date().toISOString(),
      startedAt: Date.now(),
    }
    tasks.set(taskId, task)
    return toPublicTask(task)
  }

  // TODO(backend): Python AI 任务提交接口尚未实现
  return request<DesignTask>('/ai/tasks', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      style: input.style,
      teeStyle: input.teeStyle,
      teeColor: input.teeColor,
      referenceImageUrl: input.referenceImageUrl,
      referenceImageName: input.referenceImageName,
    }),
  })
}

/**
 * 查询 AI 设计任务状态（轮询）。
 * 真实模式：GET `/ai/tasks/:taskId`
 */
export async function fetchDesignTask(taskId: string): Promise<DesignTask> {
  if (isMockMode()) {
    await mockDelay(220)

    const task = tasks.get(taskId)
    if (!task) {
      throw new ApiError(404, '设计任务不存在')
    }

    const elapsed = Date.now() - task.startedAt
    const shouldFail =
      /失败|fail/i.test(task.prompt) || task.prompt.includes('error')

    let next: DesignTask & { startedAt: number }

    if (elapsed < 700) {
      next = { ...task, status: 'pending' }
    } else if (elapsed < 1600) {
      next = { ...task, status: 'processing' }
    } else if (shouldFail) {
      next = {
        ...task,
        status: 'failed',
        errorMessage:
          '模拟生成失败：可修改描述后重试（提示：描述中含「失败」会触发失败态）',
      }
    } else {
      const imageIndex = Math.abs(task.prompt.length) % RESULT_IMAGES.length
      next = {
        ...task,
        status: 'succeeded',
        resultImageUrl: RESULT_IMAGES[imageIndex],
        errorMessage: undefined,
      }
    }

    tasks.set(taskId, next)
    return toPublicTask(next)
  }

  // TODO(backend): Python AI 任务查询接口尚未实现
  return request<DesignTask>(`/ai/tasks/${taskId}`)
}
