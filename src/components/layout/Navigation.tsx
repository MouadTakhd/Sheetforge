// src/components/Navigation.tsx
import { useAuth } from '@/stores/auth'
import { Link } from '@tanstack/react-router'
import { 
  Home, 
  Layers, 
  BookOpen, 
  Sparkles, 
  User, 
  FileSpreadsheet 
} from 'lucide-react'

export function Navigation() {
  // Subscribe reactively to store changes so the UI morphs instantly without refreshes
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  const authenticatedUser = useAuth((state) => state.user)

  // 1. Guard Rail: Hide the entire interface tracking track if on the auth screen
  if (!isAuthenticated) {
    return null
  }

  // Extract values safely from state data mapping layers
  const initials = authenticatedUser 
    ? `${authenticatedUser.firstName?.[0] ?? ''}${authenticatedUser.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U'

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-border/40 bg-background/80 p-2 backdrop-blur-md lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-20 lg:flex-col lg:justify-between lg:border-r lg:border-t-0 lg:py-6 lg:px-0">
      
      {/* ─── TOP SECTION: IDENTITY LOGO (HIDDEN ON MOBILE) ─── */}
      <div className="hidden lg:flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm transition-transform hover:scale-105">
        <FileSpreadsheet className="h-5 w-5" />
      </div>
      
      {/* ─── MID SECTION: STRUCTURAL ROUTING HUD PIPELINE ─── */}
      <div className="flex flex-row lg:flex-col items-center justify-around w-full lg:justify-center lg:gap-5 flex-1 lg:flex-initial">
        
        <Link 
          to="/home" 
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
          title="Dashboard Hub"
        >
          <Home className="h-5 w-5" />
        </Link>
        
        <Link 
          to="/convert" 
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
          title="Workspace Engine"
        >
          <Layers className="h-5 w-5" />
        </Link>
        
        <Link 
          to="/features" 
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
          title="Platform Ecosystem"
        >
          <Sparkles className="h-5 w-5" />
        </Link>
        
        <Link 
          to="/docs" 
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all [&.active]:text-primary [&.active]:bg-primary/10"
          title="Core Blueprints"
        >
          <BookOpen className="h-5 w-5" />
        </Link>

        {/* Mobile-Only Avatar Button Redirect Row */}
        <Link 
          to="/about" 
          className="block lg:hidden p-1 rounded-xl transition-all"
          title="Profile Workspace"
        >
          <div className="h-7 w-7 rounded-lg border border-border/60 bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {authenticatedUser?.profilePicture ? (
              <img src={authenticatedUser.profilePicture} alt="User Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] font-black tracking-tight text-muted-foreground">{initials}</span>
            )}
          </div>
        </Link>
      </div>

      {/* ─── BOTTOM SECTION: ACTIVE S3 BUCKET LIVE AVATAR (DESKTOP ONLY) ─── */}
      <div className="hidden lg:block pb-2">
        <Link 
          to="/about"
          className="block group relative focus:outline-none"
          title="Manage Account Architecture"
        >
          {/* Decorative halo ring on link profile focus active paths */}
          <div className="h-9 w-9 rounded-xl border border-border/80 bg-background/50 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:shadow-md shrink-0">
            {authenticatedUser?.profilePicture ? (
              <img 
                src={authenticatedUser.profilePicture} 
                alt={`${authenticatedUser.firstName}'s Avatar`} 
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-primary/5 to-primary/20 flex items-center justify-center">
                <span className="text-xs font-black tracking-tight text-primary">{initials}</span>
              </div>
            )}
          </div>
          
          {/* Subtle Online Floating State Ping Node */}
          <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
        </Link>
      </div>

    </nav>
  )
}