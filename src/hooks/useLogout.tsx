// src/hooks/useAuth.ts
import { Navigate } from '@tanstack/react-router'
import { useAuth } from '@/stores/auth'

export function useLogout() {
  const clearAuth = useAuth(s => s.logout)

  return async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})

    localStorage.removeItem('sheetforge_jwt_token')
    clearAuth()

    Navigate({ to: '/auth' })
  }
}