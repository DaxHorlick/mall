import { Link } from 'react-router-dom'
import { footerGroups } from '../../constants/navigation.ts'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.28em]">INKTEE</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-stone-500">
            用一句话生成图案，或浏览已经公开的设计。
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-medium text-stone-950">{group.title}</h2>
            <ul className="mt-4 space-y-2">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-stone-500 transition-colors hover:text-stone-950"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-100">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-stone-400 md:px-8">
          © 2026 INKTEE
        </p>
      </div>
    </footer>
  )
}
