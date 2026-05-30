import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/ui/theme-provider'
import {
  Home,
  FileSpreadsheet,
  Sparkles,
  BookOpen,
  User,
  Sun,
  Moon,
  LogOut
} from 'lucide-react'

import img_dark from '@/public/logo-icon-dark-transparent.png'
import img_light from '@/public/logo-icon-light-transparent.png'

const navItems = [
  { to: '/home', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { to: '/convert', label: 'Convert', icon: <FileSpreadsheet className="h-5 w-5" /> },
  { to: '/features', label: 'Features', icon: <Sparkles className="h-5 w-5" /> },
  { to: '/docs', label: 'Documentation', icon: <BookOpen className="h-5 w-5" /> },
  { to: '/about', label: 'Profile', icon: <User className="h-5 w-5" /> },
]

export function Navigation() {
  const { theme, setTheme } = useTheme()
  const logoSrc = theme === 'dark' ? img_light : img_dark

  return (
    <>
      {/* DESKTOP FLOATING ISLAND 
        Sits 16px off the left edge, pill-shaped, pure glassmorphism.
      */}
      <aside className="fixed left-4 top-4 bottom-4 z-50 hidden w-[80px] flex-col items-center rounded-[2rem] border border-border/40 bg-background/60 shadow-2xl backdrop-blur-xl lg:flex">
        
        {/* LOGO */}
        <div className="flex h-20 w-full items-center justify-center pt-4">
          <Link to="/" className="group flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 hover:scale-110">
            <img src={logoSrc} alt="ExcelFlow" className="h-7 w-7" />
          </Link>
        </div>

        {/* NAV LINKS */}
        <nav className="flex flex-1 flex-col items-center justify-center gap-4 w-full">
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              title={label}
              className={cn(
                'group relative flex h-12 w-12 items-center justify-center rounded-2xl text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-foreground',
                '[&.active]:bg-gradient-to-tr [&.active]:from-blue-500 [&.active]:to-purple-500 [&.active]:text-white [&.active]:shadow-lg [&.active]:shadow-purple-500/25'
              )}
            >
              {icon}
              
              {/* Custom Tooltip that slides out on hover */}
              <span className="absolute left-14 rounded-lg border border-border bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground opacity-0 shadow-xl transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100 pointer-events-none">
                {label}
              </span>
            </Link>
          ))}
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="flex w-full flex-col items-center gap-4 pb-6">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border/50 bg-background/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button 
            className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
            title="Log out"
            onClick={() => {
              localStorage.removeItem('auth_token')
              window.location.reload()
            }}
          >
            <LogOut className="h-5 w-5 ml-1" />
          </button>
        </div>
      </aside>

      {/* MOBILE FLOATING DOCK
        Sits at the bottom of the screen like iOS.
      */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 flex h-16 items-center justify-around rounded-3xl border border-border/40 bg-background/70 px-2 shadow-2xl backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 4).map(({ to, icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl text-muted-foreground transition-all duration-300',
              '[&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:shadow-md'
            )}
          >
            {icon}
          </Link>
        ))}
      </nav>
    </>
  )
}