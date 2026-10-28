import { useQuery } from '@tanstack/react-query'
import { getErrorMessage } from '../../api/client.ts'
import { queryKeys } from '../../api/queryKeys.ts'
import { fetchPublicDesigns } from '../../api/userDesigns.ts'
import { AiDesignEntry } from '../../components/home/AiDesignEntry.tsx'
import { HeroBanner } from '../../components/home/HeroBanner.tsx'
import { LatestDesignsSection } from '../../components/home/LatestDesignsSection.tsx'
import { isSessionEnd } from '../../utils/userDesign.ts'

const HOME_PUBLIC_LIMIT = 8

export function HomePage() {
  const designsQuery = useQuery({
    queryKey: queryKeys.designs.publicList(HOME_PUBLIC_LIMIT),
    queryFn: () => fetchPublicDesigns(HOME_PUBLIC_LIMIT),
    retry: false,
  })

  const items = Array.isArray(designsQuery.data?.items) ? designsQuery.data.items : []

  return (
    <div>
      <HeroBanner />
      <AiDesignEntry />
      <LatestDesignsSection
        designs={items}
        loading={designsQuery.isPending}
        error={designsQuery.isError ? getErrorMessage(designsQuery.error) : null}
        sessionEnded={designsQuery.isError && isSessionEnd(designsQuery.error)}
        onRetry={() => void designsQuery.refetch()}
      />
    </div>
  )
}
