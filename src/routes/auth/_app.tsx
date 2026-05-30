import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, Loader2, Sun, Moon, Check, Sparkles } from 'lucide-react'
import { useTheme } from '@/components/ui/theme-provider'
import { generateToken, storeToken } from '@/utils/token'
import { Loader } from '@/components/ui/loader'

export const Route = createFileRoute('/auth/_app')({
  component: AuthPage,
})

/* ─── Data ─── */
const FEATURES = [
  { icon: '⚡', label: 'Fast & Reliable' },
  { icon: '🔒', label: 'Secure' },
  { icon: '✨', label: 'Modern UI' },
] as const

/* ─── Page ─── */
export function AuthPage() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [iconKey, setIconKey] = useState(0)

  const [form, setForm] = useState({ email: '', password: '', name: '' })

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    setIconKey(k => k + 1)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  function switchMode(next: 'signin' | 'signup') {
    setMode(next)
    setError(null)
    setForm({ email: '', password: '', name: '' })
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    await new Promise(res => setTimeout(res, 1200))
    setIsSigningOut(false)
    switchMode('signin')
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (mode === 'signup' && !form.name) {
      setError('Please enter your full name.')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(res => setTimeout(res, 1400))

      // Generate token
      const newToken = generateToken()
      storeToken(newToken)

      setSuccess(true)
      await new Promise(res => setTimeout(res, 800))
      navigate({ to: '/' })
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
      console.error(err)
    }
  }

  // Show signing out loader
  if (isSigningOut) {
    return <Loader title="Signing out" subtitle="See you soon..." size="md" />
  }

  // Show success loader
  if (success) {
    return <Loader title="All set!" subtitle="Redirecting..." isSuccess={true} size="lg" />
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-tl from-accent/15 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30" aria-hidden>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Theme toggle pill — top right */}
      <div className="absolute top-5 right-5 anim-fade" style={{ animationDelay: '0.05s' }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-background/80 backdrop-blur-sm text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-all duration-200"
        >
          <span key={iconKey} className="anim-theme-pop">
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-primary/60" />
            )}
          </span>
          <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center space-y-4 anim-fade-slide" style={{ animationDelay: '0s' }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 dark:from-primary/80 dark:via-primary dark:to-primary/70 shadow-lg shadow-primary/30 dark:shadow-primary/20 mb-2">
            <span className="text-white text-2xl font-black">E</span>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
              Sheetforge
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === 'signin'
                ? 'Welcome back to your workspace'
                : 'Start converting your files today'}
            </p>
          </div>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-3 gap-3 px-2 anim-fade-slide" style={{ animationDelay: '0.08s' }}>
          {FEATURES.map(({ icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border/30 bg-card/50 hover:bg-card/80 hover:border-border/50 transition-all duration-200"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-medium text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Auth card */}
        <Card
          className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm anim-fade-slide bg-card/40"
          style={{ animationDelay: '0.16s' }}
        >
          <CardHeader className="pb-4 space-y-4">
            {/* Segmented tab switcher */}
            <div className="flex gap-1 p-1.5 rounded-lg bg-muted/40 w-full">
              {(['signin', 'signup'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => switchMode(tab)}
                  className={`
                    flex-1 px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200
                    ${
                      mode === tab
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {tab === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <div>
              <CardTitle className="text-lg">
                {mode === 'signin' ? 'Welcome back 👋' : 'Join us ✨'}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {mode === 'signin'
                  ? 'Enter your credentials to access your account.'
                  : 'Create your account to get started.'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name — signup only */}
              {mode === 'signup' && (
                <div className="space-y-2 anim-fade-slide" style={{ animationDelay: '0s' }}>
                  <Label htmlFor="name" className="text-xs font-semibold flex items-center gap-1">
                    <span className="text-sm">👤</span>
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-10 text-sm border-border/50 bg-background/50 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all focus-visible:bg-background"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1">
                  <span className="text-sm">📧</span>
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-accent/0 group-focus-within:from-primary/5 group-focus-within:to-accent/5 rounded-lg blur transition-all" />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="relative pl-10 h-10 text-sm border-border/50 bg-background/50 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all focus-visible:bg-background"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold flex items-center gap-1">
                    <span className="text-sm">🔐</span>
                    Password
                  </Label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      tabIndex={-1}
                      className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-accent/0 group-focus-within:from-primary/5 group-focus-within:to-accent/5 rounded-lg blur transition-all" />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    value={form.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="relative pl-10 pr-10 h-10 text-sm border-border/50 bg-background/50 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all focus-visible:bg-background"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div role="alert" className="anim-fade text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5 flex items-start gap-2">
                  <span className="text-base mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full h-10 gap-2 text-sm font-semibold rounded-lg transition-all duration-200 mt-2
                  bg-gradient-to-r from-primary via-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 text-white disabled:opacity-50
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{mode === 'signin' ? 'Signing in…' : 'Creating account…'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground anim-fade" style={{ animationDelay: '0.24s' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline underline-offset-2"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  )
}