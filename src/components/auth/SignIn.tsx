// src/components/auth/SignInForm.tsx
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/stores/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import axios from 'axios'
import api from '@/lib/api'

export function SignInForm() {
  const navigate = useNavigate()
  const login = useAuth((state) => state.login)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', password: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please provide your email and password.')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/login_check', {
        email: form.email,
        password: form.password,
      })
      login(response.data.token)
      navigate({ to: '/' })
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Invalid email or password.')
      } else {
        setError('Could not establish connection with gateway.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-200 w-full">
      {/* Google OAuth Access Row */}
      <Button
        type="button"
        variant="outline"
        onClick={() => { window.location.href = `${import.meta.env.VITE_API_BASE_URL}/connect/google` }}
        disabled={isLoading}
        className="w-full h-10 border-border/80 bg-background hover:bg-muted/50 text-xs font-bold gap-2.5 shadow-sm transition-all"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </Button>

      <div className="relative flex py-1 items-center">
        <div className="grow border-t border-border/60"></div>
        <span className="shrink mx-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Or credentials</span>
        <div className="grow border-t border-border/60"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Clean Email Row */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Email Address
          </Label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={handleChange}
              disabled={isLoading}
              className="pl-9 h-10 bg-background border-border/80 text-xs shadow-sm"
            />
          </div>
        </div>

        {/* Clean Password Row */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Password
            </Label>
            <button type="button" className="text-[11px] font-semibold text-primary hover:underline transition-colors">
              Forgot?
            </button>
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={isLoading}
              className="pl-9 pr-10 h-10 bg-background border-border/80 text-xs shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 py-2 px-3 text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-[11px] font-bold ml-1 leading-none">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 gap-2 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm transition-all"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{isLoading ? 'Authenticating…' : 'Sign In to Workspace'}</span>
        </Button>
      </form>
    </div>
  )
}