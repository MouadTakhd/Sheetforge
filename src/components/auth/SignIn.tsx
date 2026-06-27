// src/components/auth/SignInForm.tsx
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/stores/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
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
        setError("Couldn't reach the server. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-200 w-full">
      

      <div className="relative flex py-1 items-center">
        <div className="grow border-t border-border/60"></div>
        <span className="shrink mx-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">or sign in with email</span>
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
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{isLoading ? 'Signing in…' : 'Sign in'}</span>
        </Button>
      </form>
    </div>
  )
}