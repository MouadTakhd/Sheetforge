import { Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoaderProps {
  /**
   * The title text displayed in the loader
   * @default 'Loading'
   */
  title?: string

  /**
   * The subtitle/description text
   * @default 'Please wait...'
   */
  subtitle?: string

  /**
   * Size of the loader
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Show success state instead of loading
   * @default false
   */
  isSuccess?: boolean

  /**
   * Custom className for the container
   */
  className?: string

  /**
   * Icon to display instead of the default spinner
   */
  icon?: React.ReactNode

  /**
   * Full-screen loader or inline
   * @default true
   */
  fullScreen?: boolean

  /**
   * Show animated background grid
   * @default true
   */
  showGrid?: boolean
}

const sizeConfig = {
  sm: {
    container: 'w-12 h-12',
    iconSize: 'w-6 h-6',
    titleSize: 'text-base',
    subtitleSize: 'text-xs',
  },
  md: {
    container: 'w-16 h-16',
    iconSize: 'w-8 h-8',
    titleSize: 'text-lg font-semibold',
    subtitleSize: 'text-sm',
  },
  lg: {
    container: 'w-20 h-20',
    iconSize: 'w-10 h-10',
    titleSize: 'text-2xl font-bold',
    subtitleSize: 'text-base',
  },
}

export function Loader({
  title = 'Loading',
  subtitle = 'Please wait...',
  size = 'md',
  isSuccess = false,
  className = '',
  icon,
  fullScreen = true,
  showGrid = true,
}: LoaderProps) {
  const config = sizeConfig[size]

  const containerClasses = fullScreen
    ? 'relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden'
    : 'flex flex-col items-center justify-center gap-6'

  return (
    <main className={cn(containerClasses, className)}>
      {/* Animated background grid - full screen only */}
      {fullScreen && showGrid && (
        <>
          {/* Gradient orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-tl from-accent/15 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Grid pattern */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30" aria-hidden>
            <svg className="absolute inset-0 w-full h-full animated-grid" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path
                    d="M 32 0 L 0 0 0 32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        {/* Icon Container */}
        <div
          className={cn(
            config.container,
            'rounded-2xl flex items-center justify-center',
            'relative overflow-hidden group',
            isSuccess
              ? 'bg-emerald-500/90 dark:bg-emerald-600/80 shadow-lg shadow-emerald-500/25 dark:shadow-emerald-600/25'
              : 'bg-gradient-to-br from-primary via-primary to-primary/80 dark:from-primary/80 dark:via-primary dark:to-primary/70 shadow-lg shadow-primary/30 dark:shadow-primary/20'
          )}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

          {/* Icon */}
          <div className={cn(config.iconSize, 'relative z-10 text-white')}>
            {isSuccess ? (
              <CheckCircle2 className="w-full h-full animate-bounce" />
            ) : icon ? (
              icon
            ) : (
              <Loader2 className="w-full h-full animate-spin" />
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-1.5">
          <h2 className={cn(config.titleSize, 'font-black tracking-tight text-foreground')}>
            {isSuccess ? 'All set!' : title}
          </h2>
          <p className={cn(config.subtitleSize, 'text-muted-foreground leading-relaxed')}>
            {isSuccess ? 'Redirecting to dashboard...' : subtitle}
          </p>
        </div>
      </div>
    </main>
  )
}

/**
 * Preset loading states
 */
export const LoaderStates = {
  SigningOut: (
    <Loader
      title="Signing out"
      subtitle="See you soon..."
      isSuccess={false}
    />
  ),
  SigningIn: (
    <Loader
      title="Signing in"
      subtitle="Authenticating your account..."
      isSuccess={false}
    />
  ),
  Success: (
    <Loader
      title="All set!"
      subtitle="Redirecting to dashboard..."
      isSuccess={true}
    />
  ),
  Processing: (
    <Loader
      title="Processing"
      subtitle="This may take a moment..."
      isSuccess={false}
    />
  ),
  Uploading: (
    <Loader
      title="Uploading"
      subtitle="Please don't close this window..."
      isSuccess={false}
    />
  ),
}

/**
 * Inline loader for use within components
 */
export function InlineLoader({
  title = 'Loading',
  subtitle = 'Please wait...',
  size = 'sm',
}: Omit<LoaderProps, 'fullScreen'>) {
  return (
    <Loader
      title={title}
      subtitle={subtitle}
      size={size}
      fullScreen={false}
    />
  )
}