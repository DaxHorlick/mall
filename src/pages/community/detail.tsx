import { useQuery } from '@tanstack/react-query'
import { Button, Empty, Result, Spin } from 'antd'
import { useParams } from 'react-router-dom'
import { fetchPost } from '../../api/community.ts'
import { ApiError, getErrorMessage } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { OwnedPostView } from '../../components/community/OwnedPostView.tsx'
import { PublicPostView } from '../../components/community/PublicPostView.tsx'
import { isOwnedPost } from '../../types/community.ts'
import { parsePostId } from '../../utils/community.ts'
import { isSessionEnd } from '../../utils/userDesign.ts'

export function PostDetailPage() {
  const params = useParams()
  const postId = parsePostId(params.id)

  const postQuery = useQuery({
    queryKey: queryKeys.community.post(String(postId ?? 0)),
    queryFn: () => fetchPost(postId as number),
    enabled: postId != null,
    retry: false,
  })

  if (postId == null) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Empty description="手记 ID 不正确" />
      </div>
    )
  }

  if (postQuery.isPending) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
        <Spin size="large" tip="加载手记…" />
      </div>
    )
  }

  if (postQuery.isError || !postQuery.data) {
    if (isSessionEnd(postQuery.error)) {
      return (
        <div className="mx-auto flex max-w-6xl justify-center px-5 py-20">
          <Spin size="large" tip="正在前往登录…" />
        </div>
      )
    }

    if (postQuery.error instanceof ApiError && postQuery.error.status === 404) {
      return (
        <div className="mx-auto max-w-6xl px-5 py-16">
          <Empty description="手记不存在" />
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Result
          status="warning"
          title={getErrorMessage(postQuery.error)}
          extra={
            <Button type="primary" onClick={() => void postQuery.refetch()}>
              重试
            </Button>
          }
        />
      </div>
    )
  }

  if (isOwnedPost(postQuery.data)) {
    return <OwnedPostView post={postQuery.data} />
  }

  return <PublicPostView post={postQuery.data} />
}
