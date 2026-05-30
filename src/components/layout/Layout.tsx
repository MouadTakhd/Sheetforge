import { ReactNode } from 'react'
import { Navigation } from './Navigation' // Adjust path if needed

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      
      {/* 1. Render Navigation without any props */}
      <Navigation />

      {/* 2. Main content area adjusts for the Island on desktop and Dock on mobile */}
      <main className="flex-1 px-4 pb-24 pt-6 lg:pb-6 lg:pl-[112px] lg:pr-6">
        
        {/* Optional: Wrapping your content in a subtle card makes the Island pop even more */}
        <div className="h-full w-full rounded-3xl border border-border/40 bg-card/30 p-4 shadow-sm backdrop-blur-sm sm:p-6">
          {children}
        </div>

      </main>
      
    </div>
  )
}