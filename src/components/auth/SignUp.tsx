// src/components/auth/SignUpForm.tsx
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Check, X } from 'lucide-react'
import axios from 'axios'
import api from '@/lib/api'
import { useAuth } from '@/stores/auth'

interface SignUpProps {
  onSignUpSuccess: (email: string) => void
}

export function SignUpForm({ onSignUpSuccess }: SignUpProps) {
  const login = useAuth((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })

  // Live password strength checks shown under the field.
  const passwordRules = {
    length: form.password.length >= 8,
    hasUpper: /[A-Z]/.test(form.password),
    hasNumber: /[0-9]/.test(form.password),
    hasSpecial: /[^A-Za-z0-9]/.test(form.password),
  }

  const isPasswordValid = Object.values(passwordRules).every(Boolean)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setError('Please fill in all fields.')
      return
    }

    if (!isPasswordValid) {
      setError("Your password doesn't meet the requirements below.")
      return
    }

    setIsLoading(true)

    // Step 1: create the account.
    try {
      await api.post('/users', {
        email: form.email,
        plainPassword: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      })
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        // API Platform sends detailed validation errors inside `violations`.
        const violations = err.response.data.violations
        if (violations && violations.length > 0) {
          setError(`${violations[0].propertyPath}: ${violations[0].message}`)
        } else {
          setError(err.response.data.detail || err.response.data.message || 'Could not create your account.')
        }
      } else {
        setError("Couldn't reach the server. Please try again.")
      }
      setIsLoading(false)
      return
    }

    // Step 2: account created — log in automatically so the user lands in the app.
    try {
      const { data } = await api.post('/login_check', {
        email: form.email,
        password: form.password,
      })
      login(data.token)
      onSignUpSuccess(form.email)
    } catch {
      // Account exists but auto-login failed; ask them to sign in manually.
      setError('Account created! Please sign in with your new credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in-40 duration-200" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
          <Input id="firstName" name="firstName" type="text" placeholder="John" value={form.firstName} onChange={handleChange} disabled={isLoading} className="h-10 bg-background text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
          <Input id="lastName" name="lastName" type="text" placeholder="Doe" value={form.lastName} onChange={handleChange} disabled={isLoading} className="h-10 bg-background text-xs" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" /> Email Address
        </Label>
        <Input id="email" name="email" type="email" placeholder="name@company.com" value={form.email} onChange={handleChange} disabled={isLoading} className="h-10 bg-background text-xs" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" /> Password
        </Label>
        <div className="relative flex items-center">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            disabled={isLoading}
            className="pr-10 h-10 bg-background text-xs"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-muted-foreground hover:text-foreground">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {form.password.length > 0 && (
        <div className="p-3 bg-muted/40 rounded-lg border border-border/40 text-[11px] space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          <p className="font-bold text-muted-foreground uppercase tracking-wide text-[9px]">Password must include:</p>
          <div className="grid grid-cols-2 gap-2 font-medium">
            <div className={`flex items-center gap-1.5 ${passwordRules.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
              {passwordRules.length ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} At least 8 characters
            </div>
            <div className={`flex items-center gap-1.5 ${passwordRules.hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
              {passwordRules.hasUpper ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} 1 Uppercase character
            </div>
            <div className={`flex items-center gap-1.5 ${passwordRules.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
              {passwordRules.hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} 1 Numeric digit
            </div>
            <div className={`flex items-center gap-1.5 ${passwordRules.hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
              {passwordRules.hasSpecial ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} 1 Special symbol
            </div>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive py-2 px-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertDescription className="text-[11px] font-bold ml-1">{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading || !isPasswordValid} className="w-full h-10 gap-2 text-xs font-bold bg-primary text-primary-foreground shadow-sm">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{isLoading ? 'Creating account…' : 'Create account'}</span>
      </Button>
    </form>
  )
}