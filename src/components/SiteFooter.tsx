import { NavLink, useLocation } from 'react-router-dom'

export function SiteFooter() {
  const home = useLocation().pathname === '/'

  if (home) {
    return (
      <footer className="mt-auto bg-[#191919] text-[#f7f6f0]">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-10 md:px-14 md:py-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="text-[40px] font-black leading-none">dezajn®</p>
            <p className="mt-4 text-sm text-[#b4b6ab]">Good ideas look better on you.</p>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-normal text-[#929788]">DISCOVER</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium">
              <NavLink to="/explore">All designs</NavLink>
              <NavLink to="/explore">New arrivals</NavLink>
              <NavLink to="/community">Community</NavLink>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-normal text-[#929788]">FOR CREATORS</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium">
              <NavLink to="/studio">Start creating</NavLink>
              <NavLink to="/how-it-works">How it works</NavLink>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1440px] px-5 md:px-14">
          <div className="h-px bg-[#3e4137]" />
          <div className="flex flex-col gap-3 py-6 text-xs text-[#a9ad9e] md:flex-row md:items-center md:justify-between">
            <p>© 2026 Dezajn. Made for self-expression.</p>
            <p className="flex flex-wrap gap-x-5 gap-y-2">
              <span>About</span>
              <span>Contact</span>
              <span>Shipping & returns</span>
              <span>Privacy</span>
              <span>Terms</span>
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
          <p className="text-[30px] font-black leading-none">dezajn®</p>
          <p className="mt-4 text-sm text-[#b4b6ab]">Good ideas look better on you.</p>
        </div>
        <div className="md:pt-2">
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm font-medium">
            <NavLink to="/explore">Explore designs ↗</NavLink>
            <NavLink to="/community">Meet the community ↗</NavLink>
          </div>
          <p className="mt-6 text-xs text-[#b4b6ab]">© 2026 Dezajn. Made for self-expression.</p>
        </div>
      </div>
    </footer>
  )
}
