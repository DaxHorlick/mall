import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getDesign } from '../../designer/design.ts'
import { EditorLayout } from './editor.tsx'
import './designer.css'

export function DesignerPage() {
  const { designId } = useParams()
  const [missing, setMissing] = useState(false)

  // 地址里带了设计编号时，看这台浏览器有没有这份设计。

  useEffect(() => {
    if (!designId) {
      setMissing(false)
      return
    }
    setMissing(getDesign(designId) === null)
  }, [designId])

  // 顶栏、底栏和登录检查在商城外壳里，这里只放设计器。

  return (
    <div className="designer-shell flex min-h-0 flex-1 flex-col overflow-hidden bg-[#eef0f3]">
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
