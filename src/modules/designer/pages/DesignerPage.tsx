import { useGLTF } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { bootstrapSession } from '../../../auth/bootstrap.ts'
import { useSession } from '../../../auth/session.ts'
import { useCopy } from '../../../i18n/index.ts'
import { EditorLayout } from '../components/editor/EditorLayout.tsx'
import { getDesign } from '../services/design.ts'
import { DEFAULT_MODEL_URL } from '../types/index.ts'
import '../designer.css'

useGLTF.preload(DEFAULT_MODEL_URL)

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

  if (status !== 'authenticated') {
    return <p className="bg-[#e6e3dc] px-6 py-16 text-sm text-[#6f685e]">{copy.layout.restoring}</p>
  }

  return (
    <div className="designer-shell flex h-dvh flex-col bg-[#e6e3dc]">
      {missing ? (
        <p className="shrink-0 bg-[#fff4e8] px-4 py-2 text-xs text-[#9a3412]">
          这份设计还没有保存在服务器上，下面是本地设计器。
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <EditorLayout />
      </div>
    </div>
  )
}
