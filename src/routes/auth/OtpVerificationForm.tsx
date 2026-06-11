import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react'
import axios from 'axios'
import api from '@/lib/api'

// ─── ALIGNED TS TYPE DEFINITIONS ───
export interface OtpProps {
  email: string
  onVerificationSuccess: () => void
}

export function OtpVerificationForm({ email, onVerificationSuccess }: OtpProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [resendTimer, setResendTimer] = useState(60)
  
  const inputRefs = useRef<HTMLInputElement[]>([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  function handleOtpChange(element: HTMLInputElement, index: number) {
    const value = element.value.replace(/[^0-9]/g, '')
    if (!value) return

    const nextOtp = [...otp]
    nextOtp[index] = value.substring(value.length - 1)
    setOtp(nextOtp)
    setError(null)

    // Move to next input block automatically
    if (index < 5 && element.value) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function handleResendCode() {
    if (resendTimer > 0) return
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await api.post('/auth/resend-otp', { email })
      setSuccess('A fresh cryptographic validation token has been routed to your inbox.')
      setResendTimer(60)
    } catch (err: unknown) {
      setError('Failed to dispatch alternative verification vector tokens.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const verificationCode = otp.join('')
    if (verificationCode.length !== 6) {
      setError('Complete your 6-digit confirmation key layout block.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await api.post<{ token: string }>('/auth/verify-otp', {
        email,
        code: verificationCode
      })

      // Commit the token safely to the app local storage pool
      const jwtToken = response.data.token
      localStorage.setItem('sheetforge_jwt_token', jwtToken)
      
      // Execute router level redirect handshake safely
      onVerificationSuccess()
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || err.response.data.message || 'Invalid or expired entry token validation hash.')
      } else {
        setError('Network interface tracking failure.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in-40 duration-200">
      <div className="space-y-1.5 text-center">
        <p className="text-xs text-muted-foreground leading-normal">
          Security checkpoint active. Enter the 6-digit compilation string pushed directly to <span className="text-foreground font-bold font-mono">{email}</span>.
        </p>
      </div>

      <div className="flex justify-center gap-2 select-none">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            ref={(el) => { if (el) inputRefs.current[index] = el }}
            value={data}
            onChange={(e) => handleOtpChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={isLoading}
            className="w-10 h-12 text-center text-sm font-mono font-black border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase"
          />
        ))}
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive py-2 px-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertDescription className="text-[11px] font-bold ml-1">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-emerald-500/5 border-emerald-500/20 text-emerald-500 py-2 px-3">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <AlertDescription className="text-[11px] font-bold ml-1">{success}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading || otp.includes('')} className="w-full h-10 gap-2 text-xs font-bold bg-primary text-primary-foreground shadow-sm">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        <span>Verify Core Credentials</span>
      </Button>

      <div className="text-center select-none">
        <button
          type="button"
          disabled={resendTimer > 0 || isLoading}
          onClick={handleResendCode}
          className="text-[10px] font-mono uppercase font-black tracking-wider text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 inline-flex items-center gap-1.5"
        >
          <RefreshCw className="h-3 w-3" />
          {resendTimer > 0 ? `Resend Token Block in (${resendTimer}s)` : 'Request Token Transmission'}
        </button>
      </div>
    </form>
  )
}