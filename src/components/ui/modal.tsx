import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (open) window.addEventListener('keydown', handleEsc)

    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full rounded-3xl bg-card p-6 shadow-2xl',
          'transition-all duration-300 animate-in fade-in zoom-in',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-lg',
          size === 'lg' && 'max-w-2xl'
        )}
      >
        {/* HEADER */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold">{title}</h2>
            )}

            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="
              rounded-xl p-2
              hover:bg-muted
              transition-colors
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div>{children}</div>
      </div>
    </div>
  )
}