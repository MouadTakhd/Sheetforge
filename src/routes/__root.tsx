// src/routes/__root.tsx
import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { useAuth } from '@/stores/auth'
import { Loader2 } from 'lucide-react'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const router = useRouter()
  const authenticatedUser = useAuth((state) => state.user)
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  const fetchMe = useAuth((state) => state.fetchMe)
  
  const token = localStorage.getItem('sheetforge_jwt_token')
  const [isHydrating, setIsHydrating] = useState(true)

  // 🛡️ Safe Environmental String Sanitization (Strips unexpected outer quote wrappers)
  const isStaticMode = import.meta.env.VITE_API_BASE_URL?.replace(/['"]/g, '') === 'NO'

  // ─── SYSTEM HYDRATION PIPELINE ───
  useEffect(() => {
    const syncSessionState = async () => {
      if (isStaticMode) {
        setIsHydrating(false)
        return
      }

      if (token && !authenticatedUser) {
        try {
          await fetchMe()
        } catch (e) {
          console.error(e)
        }
      }
      setIsHydrating(false)
    }
    void syncSessionState()
  }, [token, isStaticMode])

  // ─── SAFE TRANSITION INVALIDATION ───
  // This ONLY fires when a user actively changes their login state, preventing rendering freezes
  useEffect(() => {
    if (!isStaticMode && isAuthenticated && authenticatedUser) {
      void router.invalidate()
    }
  }, [isAuthenticated, authenticatedUser, isStaticMode])

  // Display loader ONLY in connected cloud execution modes
  if (!isStaticMode && isHydrating && token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground select-none">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Synchronizing cloud user environment...</p>
        </div>
      </div>
    )
  }

  // Determine layout mount parameters
  const isUserLoggedIn = isStaticMode || (!!token && isAuthenticated && !!authenticatedUser)

  return (
    <>
      {isUserLoggedIn ? (
        <Layout>
          <Outlet />
        </Layout>
      ) : (
        <Outlet />
      )}
      <TanStackRouterDevtools />
    </>
  )
}