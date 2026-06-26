// src/hooks/useAuth.ts
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/stores/auth'

export function useLogout() {
  const clearAuth = useAuth(s => s.logout)
  const navigate = useNavigate()

  return async () => {
    // clearAuth (store logout) already POSTs /logout via the axios client
    // (baseURL `${VITE_API_BASE_URL}` -> .../api/logout) and clears the token.
    await clearAuth()

    void navigate({ to: '/auth' })
  }
}