// src/routes/auth._app.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Sun, Moon, FileSpreadsheet, Zap, ShieldCheck, Wand2, ArrowLeft } from 'lucide-react'
import { useTheme } from '@/components/ui/theme-provider'
import { SignInForm } from '@/components/auth/SignIn'
import { SignUpForm } from '@/components/auth/SignUp'
import { OtpVerificationForm } from '@/components/auth/OtpVerificationForm'

export const Route = createFileRoute('/auth/_app')({
  component: AuthPage,
})

const FEATURES = [
  { icon: Zap, label: 'Fast & Reliable Conversion', iconClass: 'text-amber-500' },
  { icon: ShieldCheck, label: 'Bank-Grade Layer Security', iconClass: 'text-emerald-500' },
  { icon: Wand2, label: 'Tailored Native Configs', iconClass: 'text-indigo-500' },
] as const

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify'>('signin')
  const [pendingEmail, setPendingEmail] = useState('')
  const { theme, setTheme } = useTheme()

  function handleSignUpSuccess(email: string) {
    setPendingEmail(email)
    setMode('verify')
  }

  return (
    <main className="min-h-screen w-full flex bg-background text-foreground md:overflow-hidden font-sans">
      
      {/* ─── LEFT SIDE: INTERACTIVE FORM NODE (SCROLLABLE ONLY ON MOBILE) ─── */}
      <section className="w-full md:w-[50%] lg:w-[45%] xl:w-[38%] min-h-screen md:h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-background border-r border-border/60 shrink-0 relative z-10 overflow-y-auto pattern-fallback">
        
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between w-full mb-8 md:mb-0">
          {mode === 'verify' ? (
            <button
              onClick={() => setMode('signup')}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign Up
            </button>
          ) : (
            <div className="flex items-center gap-2 md:opacity-0 pointer-events-none transition-opacity">
              <div className="flex items-center justify-center p-1.5 rounded-lg bg-primary text-primary-foreground">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight">Sheetforge</span>
            </div>
          )}
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-border/80 bg-background hover:bg-muted transition-colors"
            aria-label="Toggle structural interface theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-primary" />}
          </button>
        </div>

        {/* Central Form Wrapper Container */}
        <div className="w-full my-auto space-y-6 max-w-[420px] mx-auto py-4 sm:py-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
              {mode === 'signin' && 'Welcome back 👋'}
              {mode === 'signup' && 'Create an account ✨'}
              {mode === 'verify' && 'Verify your email 🛡️'}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {mode === 'signin' && 'Enter your credentials to manage workspace files.'}
              {mode === 'signup' && 'Get started with automated document mapping layers.'}
              {mode === 'verify' && `We sent a security matrix code sequence to ${pendingEmail}.`}
            </p>
          </div>

          {/* Segmented Controller Mode Switcher */}
          {mode !== 'verify' && (
            <div className="flex p-1 rounded-xl bg-muted/60 border border-border/20 w-full shadow-sm">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${mode === 'signin' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${mode === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Dynamic Content Panel Viewport */}
          <div className="w-full overflow-x-hidden">
            {mode === 'signin' && <SignInForm />}
            {mode === 'signup' && <SignUpForm onSignUpSuccess={handleSignUpSuccess} />}
            {mode === 'verify' && <OtpVerificationForm email={pendingEmail} onVerificationComplete={() => setMode('signin')} />}
          </div>
        </div>

        {/* Unified Bottom Footer Frame */}
        <div className="text-center pt-6 md:pt-4 border-t border-border/30 w-full max-w-[420px] mx-auto mt-8 md:mt-0">
          {mode !== 'verify' ? (
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
          ) : (
            <p className="text-xs text-muted-foreground font-medium">
              Didn't receive code?{' '}
              <button type="button" className="text-primary font-bold hover:underline transition-all">
                Resend security token
              </button>
            </p>
          )}
        </div>
      </section>

      {/* ─── RIGHT SIDE: BRANDING GRID WALL (HIDDEN ON TABLET/MOBILE) ─── */}
      <section className="hidden md:flex flex-1 flex-col justify-between p-12 lg:p-16 bg-muted/10 relative overflow-hidden select-none">
        {/* Decorative Vector Layer Paths */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.12] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Global Structural Identity Branding Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Sheetforge</span>
        </div>

        {/* Corporate Focus Headline Slogan Block */}
        <div className="relative z-10 max-w-xl my-auto space-y-4 pr-4">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-[1.15]">
            Transform complex spreadsheets into structured asset frameworks.
          </h2>
          <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed max-w-sm">
            Automate processing configs, map properties fluidly, and maintain reliable document history records.
          </p>
        </div>

        {/* Grid Infrastructure Capability Feature Cards */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 border-t border-border/40 pt-8 w-full">
          {FEATURES.map(({ icon: Icon, label, iconClass }) => (
            <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl border border-border/40 bg-background/60 backdrop-blur-sm hover:bg-background/90 transition-all">
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