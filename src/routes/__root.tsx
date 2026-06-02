import { createRootRoute, Outlet, 
// useLocation
 } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Layout } from '@/components/layout/Layout'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
 // const location = useLocation()
  const token = localStorage.getItem('sheetforge_jwt_token')

  return (
    <>
      {token ? (
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