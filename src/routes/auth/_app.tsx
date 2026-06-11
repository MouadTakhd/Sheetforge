import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Sun, Moon, FileSpreadsheet, Zap, ShieldCheck, Wand2 } from 'lucide-react'
import { useTheme } from '@/components/ui/theme-provider'
import { SignInForm } from '@/components/auth/SignIn'
import { SignUpForm } from '@/components/auth/SignUp'

export const Route = createFileRoute('/auth/_app')({
  // ─── PURE ANTI-GLITCH LIFECYCLE ROUTE GUARD ───
  beforeLoad: () => {
    const activeSessionToken = localStorage.getItem('sheetforge_jwt_token')
    
    // If an active session payload exists, abort the mount phase 
    // immediately and forward the user to their workspace natively
    if (activeSessionToken) {
      throw redirect({ to: '/home' })
    }
  },
  component: AuthPage,
})

const FEATURES = [
  { icon: Zap, label: 'Fast & Reliable Conversion', iconClass: 'text-amber-500' },
  { icon: ShieldCheck, label: 'Bank-Grade Layer Security', iconClass: 'text-emerald-500' },
  { icon: Wand2, label: 'Tailored Native Configs', iconClass: 'text-indigo-500' },
] as const

export function AuthPage() {
  // ─── SYNCHRONOUS RENDER SEO TITLE SETTER ───
  if (typeof document !== 'undefined') {
    document.title = 'Secure Infrastructure Access Gateway | Sheetforge'
  }

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const handleAuthPipelineSuccess = () => {
    void navigate({ to: '/home' })
  }

  return (
    <main className="min-h-screen w-full flex bg-background text-foreground md:overflow-hidden font-sans relative">
      
      {/* ─── LEFT SIDE: INTERACTIVE FORM CONTAINER NODE ─── */}
      <section className="w-full md:w-[50%] lg:w-[45%] xl:w-[38%] min-h-screen md:h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-background border-r border-border/40 shrink-0 relative z-10 overflow-y-auto">
        
        {/* Top Header Row Identity Components */}
        <div className="flex items-center justify-between w-full mb-8 md:mb-0 select-none">
          <div className="flex items-center gap-2 md:opacity-0 pointer-events-none transition-opacity">
            <div className="flex items-center justify-center p-1.5 rounded-lg bg-primary text-primary-foreground">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight">Sheetforge</span>
          </div>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-border/60 bg-background hover:bg-muted/50 transition-colors"
            aria-label="Toggle structural interface theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-primary" />}
          </button>
        </div>

        {/* Central Authorization Interaction Viewport */}
        <div className="w-full my-auto space-y-6 max-w-[420px] mx-auto py-4 sm:py-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
              {mode === 'signin' ? 'Welcome back 👋' : 'Create an account ✨'}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {mode === 'signin' 
                ? 'Enter your credentials to manage workspace files.' 
                : 'Get started with automated document mapping layers.'}
            </p>
          </div>

          {/* Segmented Controller Mode Switcher */}
          <div className="flex p-1 rounded-xl bg-muted/50 border border-border/30 w-full shadow-xs select-none">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${mode === 'signin' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${mode === 'signup' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Dynamic Core Form Mounting Target */}
          <div className="w-full overflow-x-hidden">
            {mode === 'signin' ? (
              <SignInForm />
            ) : (
              <SignUpForm onSignUpSuccess={handleAuthPipelineSuccess} />
            )}
          </div>
        </div>

        {/* Bottom Navigation Toggle Row Footer */}
        <div className="text-center pt-6 md:pt-4 border-t border-border/30 w-full max-w-[420px] mx-auto mt-8 md:mt-0 select-none">
          <p className="text-xs text-muted-foreground font-medium">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary font-bold hover:underline underline-offset-4 ml-0.5 transition-all"
            >
              {mode === 'signin' ? 'Sign up here' : 'Log in here'}
            </button>
          </p>
        </div>
      </section>

      {/* ─── RIGHT SIDE: BRANDING GRID WALL (DESKTOP ONLY) ─── */}
      <section className="hidden md:flex flex-1 flex-col justify-between p-12 lg:p-16 bg-muted/10 relative overflow-hidden select-none">
        
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.12] dark:opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-sm">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Sheetforge</span>
        </div>

        <div className="relative z-10 max-w-xl my-auto space-y-4 pr-4">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-[1.15]">
            Transform complex spreadsheets into structured asset frameworks.
          </h2>
          <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed max-w-sm">
            Automate processing configs, map properties fluidly, and maintain reliable document history records.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 border-t border-border/40 pt-8 w-full">
          {FEATURES.map(({ icon: Icon, label, iconClass }) => (
            <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl border border-border/40 bg-background/60 backdrop-blur-xs hover:bg-background/90 transition-all shadow-2xs">
              <div className="p-1.5 rounded-md bg-muted border border-border/40 shrink-0">
                <Icon className={`h-4 w-4 ${iconClass}`} />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground leading-snug mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}