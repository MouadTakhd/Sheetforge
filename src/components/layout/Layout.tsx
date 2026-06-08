import { ReactNode } from 'react'
import { Navigation } from './Navigation'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background overflow-x-hidden antialiased">
      
      <Navigation />
      <main className="flex-1 pt-24 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-6xl h-full w-full rounded-2xl sm:rounded-3xl border border-border/40 bg-card/10 backdrop-blur-sm shadow-xs p-4 sm:p-6 lg:p-8 animate-in fade-in-50 duration-200">
          {children}
        </div>
      </main>
      
    </div>
  )
}