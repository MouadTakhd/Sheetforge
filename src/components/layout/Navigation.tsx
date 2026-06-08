import { useAuth } from '@/stores/auth'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  Home, 
  Layers, 
  BookOpen, 
  Sparkles, 
  FileSpreadsheet,
  Sun,
  Moon,
  LogOut,
  Settings,
  Image,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const navigate = useNavigate()
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  const authenticatedUser = useAuth((state) => state.user)
  const logout = useAuth((state) => state.logout)

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    }
    return 'dark'
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  if (!isAuthenticated) {
    return null
  }

  const initials = authenticatedUser 
    ? `${authenticatedUser.firstName?.[0] ?? ''}${authenticatedUser.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 w-full border-b border-border/40 bg-background/75 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-xs shadow-black/5 select-none">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between">
        
        {/* BRAND IDENTITY LOGO */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/home" className="flex items-center gap-2.5 focus:outline-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-transform hover:scale-105">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <span className="hidden sm:block font-black text-sm tracking-tight uppercase bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              SheetForge
            </span>
          </Link>
        </div>

        {/* TOP ROUTING NAVIGATION BAR */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-1 px-4 max-w-xl mx-auto">
          <Link 
            to="/home" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
            title="Dashboard Hub"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          
          <Link 
            to="/convert" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
            title="Spreadsheets Workspace"
          >
            <Layers className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">Sheets</span>
          </Link>

          <Link 
            to="/word" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
            title="Word Processor"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">Docs</span>
          </Link>
          <Link 
            to="/image" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
            title="Image Editor"
          >
            <Image className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">Images</span>
          </Link>

          <Link 
            to="/features" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
            title="Platform Ecosystem Extensions"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">Ecosystem</span>
          </Link>
        </div>

        {/* UTILITY CONTROL HUB DEPLOYMENT NODES */}
        <div className="flex items-center gap-2 shrink-0 pl-2">
          
          {/* THE THEME TOGGLER */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              // ─── GREEN THEME THEME LOGO MARKER FIX ───
              <Moon className="h-4 w-4 text-emerald-500 transition-transform hover:-rotate-12" />
            )}
          </Button>

          {/* DYNAMIC ACCOUNT SHIELD DROPDOWN PORTFOLIO MENU */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none block relative group">
              <div className="h-9 w-9 rounded-xl border border-border/80 bg-background/50 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:shadow-xs shrink-0 cursor-pointer">
                {authenticatedUser?.profilePicture ? (
                  <img 
                    src={authenticatedUser.profilePicture} 
                    alt={`${authenticatedUser.firstName}'s Avatar`} 
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center">
                    <span className="text-xs font-black tracking-tight text-primary">{initials}</span>
                  </div>
                )}
              </div>
              
              <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
            </DropdownMenuTrigger>

            {/* ─── NATIVE DROPDOWN LAYOUT FIX ───
               Removed the missing label primitives to stop context tree crash drops completely */}
            <DropdownMenuContent align="end" className="w-52 rounded-xl mt-2 border border-border/40 p-1.5 shadow-md backdrop-blur-md bg-background/95">
              
              {/* Clean layout node container block replacements */}
              <div className="px-2.5 py-2 flex flex-col gap-0.5 select-none pointer-events-none mb-1">
                <span className="text-xs font-black text-foreground truncate block leading-tight">
                  {authenticatedUser?.fullName || `${authenticatedUser?.firstName} ${authenticatedUser?.lastName}`}
                </span>
                <span className="text-[10px] font-mono font-medium text-muted-foreground/80 truncate block">
                  {authenticatedUser?.email}
                </span>
              </div>
              
              <div className="h-[1px] bg-border/40 my-1 w-full" />
              
              {/* ACCOUNT SETTINGS VIEW ELEMENT */}
              <DropdownMenuItem 
                onClick={() => navigate({ to: '/about' })}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors focus:bg-muted focus:text-foreground"
              >
                <Settings className="h-3.5 w-3.5 shrink-0" />
                <span>Account Settings</span>
              </DropdownMenuItem>

              <div className="h-[1px] bg-border/40 my-1 w-full" />
              
              {/* LOGOUT SIGN OUT CORE MUTATION TERMINATION */}
              <DropdownMenuItem 
                onClick={() => void logout()}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-black text-destructive hover:text-destructive rounded-lg cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span>Sign Out Session</span>
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

        </div>

      </div>
    </nav>
  )
}