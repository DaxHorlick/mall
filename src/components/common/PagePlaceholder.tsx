import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'

type PageAction = {
  label: string
  to: string
}

type PagePlaceholderProps = {
  eyebrow: string
  title: string
  description: string
  notes?: string[]
  actions?: PageAction[]
}

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  notes = [],
  actions = [],
}: PagePlaceholderProps) {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
      <p className="text-xs font-medium tracking-[0.22em] text-stone-500">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600">
        {description}
      </p>
      {notes.length > 0 && (
        <div className="mt-8 max-w-xl rounded-3xl bg-white p-6 shadow-sm">
          <ul className="space-y-2 text-sm leading-6 text-stone-700">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}
      {actions.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {actions.map((action, index) => (
            <Button
              key={action.to}
              type={index === 0 ? 'primary' : 'default'}
              size="large"
              onClick={() => navigate(action.to)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </section>
  )
}
