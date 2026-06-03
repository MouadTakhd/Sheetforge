// src/components/ui/AlertMatrix.tsx
import { 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Info, 
  X 
} from 'lucide-react'

export interface AlertMessage {
  type: 'success' | 'error' | 'pending' | 'info'
  text: string
}

interface AlertMatrixProps {
  message: AlertMessage | null
  onClose?: () => void
}

export function AlertMatrix({ message, onClose }: AlertMatrixProps) {
  if (!message) return null

  // 1. Map configurations natively based on runtime variants
  const configs = {
    success: {
      styles: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
      ping: 'bg-emerald-400'
    },
    error: {
          styles: 'border-red-500/20 bg-red-500/10 text-red-500', // 👈 SOLID RICH RED DEFINED
          icon: <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />,
          ping: 'bg-red-500'
        },
    pending: {
      styles: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
      icon: <Loader2 className="h-4 w-4 text-amber-400 animate-spin shrink-0" />,
      ping: 'bg-amber-400'
    },
    info: {
      styles: 'border-primary/20 bg-primary/10 text-primary',
      icon: <Info className="h-4 w-4 text-primary shrink-0" />,
      ping: 'bg-primary'
    }
  }

  const active = configs[message.type]

  return (
    <div 
      className={`w-full rounded-2xl border p-4 text-xs font-bold flex items-center justify-between gap-3 shadow-lg backdrop-blur-md animate-in slide-in-from-top-3 duration-300 ${active.styles}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Dynamic State Ring Indicator */}
        <div className="relative flex h-2 w-2 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${active.ping}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${active.ping}`} />
        </div>
        
        {/* Render configuration icon block */}
        {active.icon}
        
        <p className="truncate leading-none pr-2">{message.text}</p>
      </div>

      {/* Optional Interactive Close Trigger */}
      {onClose && (
        <button 
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-foreground/5 transition-all shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
