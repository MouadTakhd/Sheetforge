import { useState, useRef, useEffect } from 'react'
import { Link, Navigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/ui/theme-provider'
import { useAuth } from '@/stores/auth'
import {
  Home, FileSpreadsheet, Sparkles, BookOpen,
  User, Sun, Moon, LogOut, Settings, Loader2, HelpCircle,
} from 'lucide-react'

import img_dark  from '@/public/logo-icon-dark-transparent.png'
import img_light from '@/public/logo-icon-light-transparent.png'

const navItems = [
  { to: '/home',     label: 'Dashboard',    icon: <Home            className="h-5 w-5" /> },
  { to: '/convert',  label: 'Convert',       icon: <FileSpreadsheet className="h-5 w-5" /> },
  { to: '/features', label: 'Features',      icon: <Sparkles        className="h-5 w-5" /> },
  { to: '/docs',     label: 'Documentation', icon: <BookOpen        className="h-5 w-5" /> },
  { to: '/about',  label: 'Profile',       icon: <User            className="h-5 w-5" /> },
]

// ─── logout hook ─────────────────────────────────────────────────────────────
function useLogout() {
  const storeLogout   = useAuth((s:any) => s.logout)

  return async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    storeLogout()                              // clears localStorage + Zustand state
    Navigate({ to: '/auth' })
  }
}

// ─── account popover ─────────────────────────────────────────────────────────
function AccountPopover({ onClose }: { onClose: () => void }) {
  const logout      = useLogout()
  const [busy, setBusy] = useState(false)

  const handleLogout = async () => {
    setBusy(true)
    await logout()
    setBusy(false)
  }

  return (
    <div className="absolute bottom-14 left-0 z-50 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">

      {/* sign out */}
      <Link
        to="/about"
        onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted"
      >
        <Settings className="h-4 w-4 text-muted-foreground" />
        Account settings
      </Link>

      <Link
        to="/docs"
        onClick={onClose}
        className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-sm transition-colors hover:bg-muted"
      >
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
        Help & support
      </Link>

      <button
        onClick={handleLogout}
        disabled={busy}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
      >
        {busy
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <LogOut  className="h-4 w-4" />
        }
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}

// ─── mobile logout ────────────────────────────────────────────────────────────
function MobileLogout() {
  const logout      = useLogout()
  const [busy, setBusy] = useState(false)

  const handle = async () => {
    setBusy(true)
    await logout()
    setBusy(false)
  }

  return (
    <button
      onClick={handle}
      disabled={busy}
      className="flex h-12 w-12 items-center justify-center rounded-2xl text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      {busy
        ? <Loader2 className="h-5 w-5 animate-spin" />
        : <LogOut  className="h-5 w-5 ml-0.5" />
      }
    </button>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export function Navigation() {
  const { theme, setTheme } = useTheme()
  const logoSrc             = theme === 'dark' ? img_light : img_dark
  const [accountOpen, setAccountOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!popoverRef.current?.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      {/* ── DESKTOP FLOATING ISLAND ──────────────────────────────────────── */}
      <aside className="fixed bottom-4 left-4 top-4 z-50 hidden w-[80px] flex-col items-center rounded-[2rem] border border-border/40 bg-background/60 shadow-2xl backdrop-blur-xl lg:flex">

        {/* logo */}
        <div className="flex h-20 w-full items-center justify-center pt-4">
          <Link
            to="/"
            className="group flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 hover:scale-110"
          >
            <img src={logoSrc} alt="ExcelFlow" className="h-7 w-7" />
          </Link>
        </div>

        {/* nav links */}
        <nav className="flex flex-1 flex-col items-center justify-center gap-4 w-full">
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              title={label}
              className={cn(
                'group relative flex h-12 w-12 items-center justify-center rounded-2xl',
                'text-muted-foreground transition-all duration-300',
                'hover:bg-muted hover:text-foreground',
                '[&.active]:bg-gradient-to-tr [&.active]:from-blue-500 [&.active]:to-purple-500',
                '[&.active]:text-white [&.active]:shadow-lg [&.active]:shadow-purple-500/25',
              )}
            >
              {icon}
              <span className="pointer-events-none absolute left-14 whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground opacity-0 shadow-xl transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
                {label}
              </span>
            </Link>
          ))}
        </nav>

        {/* bottom actions */}
        <div className="flex w-full flex-col items-center gap-4 pb-6">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border/50 bg-background/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setAccountOpen(v => !v)}
              title="Account"
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                'border border-border/50 bg-background/50 text-muted-foreground',
                'hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive',
                accountOpen && 'border-destructive/40 bg-destructive/10 text-destructive',
              )}
            >
              <LogOut className="h-5 w-5 ml-0.5" />
            </button>

            {accountOpen && <AccountPopover onClose={() => setAccountOpen(false)} />}
          </div>
        </div>
      </aside>

      {/* ── MOBILE FLOATING DOCK ─────────────────────────────────────────── */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 flex h-16 items-center justify-around rounded-3xl border border-border/40 bg-background/70 px-2 shadow-2xl backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 4).map(({ to, icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl',
              'text-muted-foreground transition-all duration-300',
              '[&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:shadow-md',
            )}
          >
            {icon}
          </Link>
        ))}
        <MobileLogout />
      </nav>
    </>
  )
}