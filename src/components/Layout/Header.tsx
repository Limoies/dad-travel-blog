'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/routes', label: '路线' },
  { href: '/gallery', label: '相册' },
]

import ThemeToggle from '@/components/ThemeToggle'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="glass-card rounded-full px-5 py-2.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2.5">
              {/* Logo 翠绿 + 脉冲 */}
              <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-pine text-[10px] font-semibold tracking-wide text-white shadow-sm shadow-pine/20">
                D
                <div className="absolute inset-0 rounded-lg animate-pulse-soft bg-pine/20" />
              </div>
              <span className="text-sm font-medium text-foreground/70 group-hover:text-pine transition-colors duration-300">
                老爸自驾
              </span>
            </Link>

            <nav className="flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-pine bg-pine-light'
                        : 'text-muted hover:bg-surface hover:text-pine'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
