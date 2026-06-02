import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/_app')({
  beforeLoad: () => {
    const token = localStorage.getItem('sheetforge_jwt_token')

    if (!token) {
      throw redirect({
        to: '/auth',
      })
    }
  },

  component: Outlet,
})