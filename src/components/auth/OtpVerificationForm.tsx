// src/components/auth/OtpVerificationForm.tsx
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import axios from 'axios'
import api from '@/lib/api'

interface OtpProps {
  email: string
  onVerificationComplete: () => void
}

export function OtpVerificationForm({ email, onVerificationComplete }: OtpProps) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (code.length < 6) {
      setError('Please insert the entire 6-digit verification code token.')
      return
    }

    setIsLoading(true)
    try {
      // Maps to a secure custom confirmation route inside your backend API
      await api.post('/users/verify-otp', {
        email: email,
        token: code,
      })
      
      onVerificationComplete()
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Invalid or expired confirmation token sequence.')
      } else {
        setError('Verification sequence connection crash.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4 animate-in slide-in-from-right-4 duration-200" noValidate>
      <div className="space-y-2 text-center">
        <div className="relative max-w-[240px] mx-auto">
          <Input
            id="otp-code"
            name="otp-code"
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            disabled={isLoading}
            className="h-12 text-center text-xl font-black tracking-[0.4em] bg-muted/30 border-border/80 focus-visible:ring-primary/20"
          />
        </div>
        <p className="text-[10px] text-muted-foreground font-medium">Input the 6-digit digit sequence to validate your profile mapping.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive py-2 px-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertDescription className="text-[11px] font-bold ml-1">{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isLoading || code.length !== 6}
        className="w-full h-10 gap-2 text-xs font-bold bg-primary text-primary-foreground shadow-sm"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        <span>Verify Integrity Token</span>
      </Button>
    </form>
  )
}