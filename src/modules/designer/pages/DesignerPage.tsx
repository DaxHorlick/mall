import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { bootstrapSession } from '../../../auth/bootstrap.ts'
import { useSession } from '../../../auth/session.ts'
import { SiteFooter } from '../../../components/SiteFooter.tsx'
import { SiteHeader } from '../../../components/SiteHeader.tsx'
import { useCopy } from '../../../i18n/index.ts'
import { EditorLayout } from '../components/editor/EditorLayout.tsx'
import { getDesign } from '../services/design.ts'
import '../designer.css'

export function DesignerPage() {
  const copy = useCopy()
  const navigate = useNavigate()
  const { designId } = useParams()
  const status = useSession((state) => state.status)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    void bootstrapSession()
  }, [])

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true })
  }, [status, navigate])

  useEffect(() => {
    if (!designId) {
      setMissing(false)
      return
    }
    setMissing(getDesign(designId) === null)
  }, [designId])

  return (
    <div className="designer-shell flex h-dvh flex-col bg-[#f7f6f0] text-[#191919]">
      <SiteHeader />

      {status !== 'authenticated' ? (
        <p className="flex-1 px-6 py-16 text-sm text-[#696b61]">{copy.layout.restoring}</p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#eef0f3]">
          {missing ? (
            <p className="shrink-0 bg-[#fff4e8] px-4 py-2 text-xs text-[#9a3412]">
              这份设计还没有保存在服务器上，下面是本地设计器。
            </p>
          ) : null}
          <div className="min-h-0 flex-1">
            <EditorLayout />
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  )
}
