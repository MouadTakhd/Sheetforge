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
  const router = useRouter() //   GAIN DIRECT ACCESS TO THE ROUTER RUNTIME STATE
  const authenticatedUser = useAuth((state) => state.user)
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  const fetchMe = useAuth((state) => state.fetchMe)
  
  const token = localStorage.getItem('sheetforge_jwt_token')
  const [isHydrating, setIsHydrating] = useState(true)

  // ─── THE SYSTEM HYDRATION GUARD ───
  useEffect(() => {
    const syncSessionState = async () => {
      if (token && !authenticatedUser) {
        await fetchMe()
      }
      setIsHydrating(false)
    }
    void syncSessionState()
  }, [token])

  // ─── THE CRITICAL LOGIN BUG FIX ───
  // Whenever the authentication store flips to TRUE, instantly invalidate the 
  // router cache metrics. This forces the navbar to snap onto the screen immediately!
  useEffect(() => {
    if (isAuthenticated && authenticatedUser) {
      void router.invalidate()
    }
  }, [isAuthenticated, authenticatedUser, router])

  if (isHydrating && token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Synchronizing user environment...</p>
        </div>
      </div>
    )
  }

  // Combine store state variables to handle the layout switch safely
  const isUserLoggedIn = !!token && isAuthenticated && !!authenticatedUser

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