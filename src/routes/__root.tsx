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
  const router = useRouter() // Gain direct access to the router runtime state
  const authenticatedUser = useAuth((state) => state.user)
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  const fetchMe = useAuth((state) => state.fetchMe)
  
  const token = localStorage.getItem('sheetforge_jwt_token')
  const [isHydrating, setIsHydrating] = useState(true)

  const isStaticMode = import.meta.env.VITE_API_BASE_URL === 'NO'

  // ─── THE SYSTEM HYDRATION GUARD ───
  useEffect(() => {
    const syncSessionState = async () => {
      // If running the offline static sandbox, bypass server handshake pipelines instantly
      if (isStaticMode) {
        setIsHydrating(false)
        return
      }

      if (token && !authenticatedUser) {
        await fetchMe()
      }
      setIsHydrating(false)
    }
    void syncSessionState()
  }, [token, isStaticMode])

  // ─── THE CRITICAL NAV FLICKER BUG FIX ───
  useEffect(() => {
    if ((isStaticMode || (isAuthenticated && authenticatedUser))) {
      void router.invalidate()
    }
  }, [isAuthenticated, authenticatedUser, router, isStaticMode])

  // Only display the loading blackout spinner if we are hitting a live server environment
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

  // ─── DYNAMIC CORE LAYOUT VIEWPORT MATRIX SWITCH ───
  // In static mode, we bypass authentication checks to lock the core interface shell open from launch
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