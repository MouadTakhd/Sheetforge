// src/components/Layout.tsx
import { ReactNode } from 'react'
import { Navigation } from './Navigation'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background overflow-x-hidden antialiased">
      
      {/* Persistent global responsive layout shell tracking bar */}
      <Navigation />

      {/* Primary content view bounds configuration */}
      <main className="flex-1 w-full min-w-0 px-3 sm:px-6 py-4 sm:py-6 pb-24 lg:pb-6 lg:pl-[104px]">
        <div className="h-full w-full rounded-2xl sm:rounded-3xl border border-border/40 bg-card/10 backdrop-blur-sm shadow-xs p-3 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
      
    </div>
  )
}