import { useQuery } from '@tanstack/react-query'
import { Button, Empty, Result, Spin } from 'antd'
import { useParams } from 'react-router-dom'
import { fetchDesign } from '../../api/userDesigns.ts'
import { ApiError, getErrorMessage } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { OwnedDesignEditor } from '../../components/designs/OwnedDesignEditor.tsx'
import { PublicDesignView } from '../../components/designs/PublicDesignView.tsx'
import { isOwnedDesign } from '../../types/userDesign.ts'
import { isSessionEnd, parseDesignId } from '../../utils/userDesign.ts'

export function DesignDetailPage() {
  const params = useParams()
  const designId = parseDesignId(params.id)

  const designQuery = useQuery({
    queryKey: queryKeys.designs.record(String(designId ?? 0)),
    queryFn: () => fetchDesign(designId as number),
    enabled: designId != null,
    retry: false,
  })

  if (designId == null) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Empty description="设计 ID 不正确" />
      </div>
    )
  }

  if (designQuery.isPending) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" tip="加载设计…" />
      </div>
    )
  }

  if (designQuery.isError || !designQuery.data) {
    if (isSessionEnd(designQuery.error)) {
      return (
        <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
          <Spin size="large" tip="正在前往登录…" />
        </div>
      )
    }

    const missing = designQuery.error instanceof ApiError && designQuery.error.status === 404

    if (missing) {
      return (
        <div className="mx-auto max-w-6xl px-5 py-16">
          <Empty description="设计不存在" />
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Result
          status="warning"
          title={getErrorMessage(designQuery.error)}
          extra={
            <Button type="primary" onClick={() => void designQuery.refetch()}>
              重试
            </Button>
          }
        />
      </div>
    )
  }

  if (isOwnedDesign(designQuery.data)) {
    return <OwnedDesignEditor key={designQuery.data.id} design={designQuery.data} />
  }

  return <PublicDesignView design={designQuery.data} />
}
