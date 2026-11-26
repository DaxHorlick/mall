import { NavLink, useLocation } from 'react-router-dom'
import { useCopy } from '../i18n/index.ts'

export function SiteFooter() {
  const copy = useCopy()
  const home = useLocation().pathname === '/'

  if (home) {
    return (
      <footer className="mt-auto bg-[#191919] text-[#f7f6f0]">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-10 md:px-14 md:py-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="text-[40px] font-black leading-none">hlstudio</p>
            <p className="mt-4 text-sm text-[#b4b6ab]">{copy.footer.tagline}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-normal text-[#929788]">{copy.footer.discover}</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium">
              <NavLink to="/explore">{copy.footer.allDesigns}</NavLink>
              <NavLink to="/explore">{copy.footer.newArrivals}</NavLink>
              <NavLink to="/community">{copy.footer.community}</NavLink>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-normal text-[#929788]">{copy.footer.forCreators}</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium">
              <NavLink to="/designer">{copy.footer.start}</NavLink>
              <NavLink to="/how-it-works">{copy.footer.how}</NavLink>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1440px] px-5 md:px-14">
          <div className="h-px bg-[#3e4137]" />
          <div className="flex flex-col gap-3 py-6 text-xs text-[#a9ad9e] md:flex-row md:items-center md:justify-between">
            <p>{copy.footer.copyright}</p>
            <p className="flex flex-wrap gap-x-5 gap-y-2">
              <span>{copy.footer.about}</span>
              <span>{copy.footer.contact}</span>
              <span>{copy.footer.shipping}</span>
              <span>{copy.footer.privacy}</span>
              <span>{copy.footer.terms}</span>
            </p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="mt-auto bg-[#191919] text-[#f7f6f0]">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-7 md:grid-cols-2 md:px-14 md:py-8">
        <div>
          <p className="text-[30px] font-black leading-none">hlstudio</p>
          <p className="mt-4 text-sm text-[#b4b6ab]">{copy.footer.tagline}</p>
        </div>
        <div className="md:pt-2">
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm font-medium">
            <NavLink to="/explore">{copy.footer.explore}</NavLink>
            <NavLink to="/community">{copy.footer.meet}</NavLink>
          </div>
          <p className="mt-6 text-xs text-[#b4b6ab]">{copy.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
