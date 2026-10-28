import { Form, Input, Select } from 'antd'
import {
  validateBytes,
  validateContentType,
  validateDimension,
  validateImageUrl,
  validateObjectKey,
} from '../../utils/userDesign.ts'

type ImageRefFieldsProps = {
  prefix: 'original' | 'result' | 'preview'
  legend: string
  optional?: boolean
}

const CONTENT_OPTIONS = [
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' },
]

function reject(message: string | null) {
  return message ? Promise.reject(new Error(message)) : Promise.resolve()
}

export function ImageRefFields({ prefix, legend, optional = false }: ImageRefFieldsProps) {
  const form = Form.useFormInstance()
  const kind = prefix === 'preview' ? 'preview' : 'image'
  const skipped = () => {
    if (!optional) {
      return false
    }

    const key = String(form.getFieldValue([prefix, 'object_key']) ?? '')
    const url = String(form.getFieldValue([prefix, 'url']) ?? '')
    return !key.trim() && !url.trim()
  }

  return (
    <fieldset className="space-y-3 rounded-2xl border border-stone-200 p-4">
      <legend className="px-1 text-sm font-medium text-stone-800">{legend}</legend>
      <Form.Item
        label="对象键"
        name={[prefix, 'object_key']}
        dependencies={[[prefix, 'url']]}
        rules={[
          {
            validator: (_, value: string | undefined) => {
              if (skipped()) {
                return Promise.resolve()
              }
              return reject(validateObjectKey(value ?? '', kind))
            },
          },
        ]}
      >
        <Input placeholder="uploads/image.png" autoComplete="off" />
      </Form.Item>
      <Form.Item
        label="地址"
        name={[prefix, 'url']}
        dependencies={[[prefix, 'object_key']]}
        extra="使用对象存储里的稳定地址，不要填写带临时签名的链接。"
        rules={[
          {
            validator: (_, value: string | undefined) => {
              if (skipped()) {
                return Promise.resolve()
              }
              return reject(validateImageUrl(value ?? '', kind))
            },
          },
        ]}
      >
        <Input placeholder="https://cdn.example.com/uploads/image.png" autoComplete="off" />
      </Form.Item>
      {prefix === 'preview' ? null : (
        <>
          <Form.Item
            label="类型"
            name={[prefix, 'content_type']}
            rules={[
              {
                validator: (_, value: string | undefined) => reject(validateContentType(value ?? '')),
              },
            ]}
          >
            <Select options={CONTENT_OPTIONS} />
          </Form.Item>
          <Form.Item
            label="大小（字节）"
            name={[prefix, 'bytes']}
            rules={[
              {
                validator: (_, value: string | undefined) => reject(validateBytes(value ?? '')),
              },
            ]}
          >
            <Input inputMode="numeric" placeholder="1024" autoComplete="off" />
          </Form.Item>
          <div className="grid gap-3 sm:grid-cols-2">
            <Form.Item
              label="宽度"
              name={[prefix, 'width']}
              extra="可以留空"
              rules={[
                {
                  validator: (_, value: string | undefined) =>
                    reject(validateDimension(value ?? '')),
                },
              ]}
            >
              <Input inputMode="numeric" placeholder="800" autoComplete="off" />
            </Form.Item>
            <Form.Item
              label="高度"
              name={[prefix, 'height']}
              extra="可以留空"
              rules={[
                {
                  validator: (_, value: string | undefined) =>
                    reject(validateDimension(value ?? '')),
                },
              ]}
            >
              <Input inputMode="numeric" placeholder="800" autoComplete="off" />
            </Form.Item>
          </div>
        </>
      )}
    </fieldset>
  )
}
