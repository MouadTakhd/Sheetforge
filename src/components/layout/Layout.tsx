// src/components/Layout.tsx
import { ReactNode } from 'react'
import { Navigation } from './Navigation'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
      
      {/* 1. Global Platform Side-Navigation / Floating Dock Bar System */}
      <Navigation />

      {/* 2. Main content area adapts seamlessly across all screens */}
      {/* - Mobile: pb-24 leaves room for the bottom bar dock, zero horizontal margins */}
      {/* - Desktop: lg:pl-[100px] pushes past the side-bar island cleanly */}
      <main className="flex-1 w-full min-w-0 px-3 sm:px-6 py-4 sm:py-6 pb-24 lg:pb-6 lg:pl-25">
        
        {/* Uniform Canvas Shield Card */}
        {/* - Removed hard internal padding rules to allow child components to breathe freely */}
        <div className="h-full w-full rounded-2xl sm:rounded-3xl border border-border/40 bg-card/10 backdrop-blur-sm shadow-sm p-3 sm:p-6 lg:p-8">
          {children}
        </div>

      </main>
      
    </div>
  )
}