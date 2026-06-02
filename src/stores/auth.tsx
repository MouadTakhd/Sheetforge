import api from '@/lib/api'
import { create } from 'zustand'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: string
  status: string
  profilePicture: string | null | undefined
}

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  user: UserProfile | null
  login: (token: string, user?: UserProfile) => void
  setUser: (user: UserProfile) => void
  logout: () => Promise<void>
}

const STORAGE_KEY = 'sheetforge_jwt_token'

export const useAuth = create<AuthState>((set) => ({
  // Initialize cleanly from storage context on load
  token: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem(STORAGE_KEY) : false,
  user: null,
  
  // Triggers smoothly on successful authentication validation
  login: (token: string, user: UserProfile | null = null) => {
    localStorage.setItem(STORAGE_KEY, token)
    set({ 
      token, 
      isAuthenticated: true,
      ...(user ? { user } : {})
    })
  },

  // Dynamic setter to update user state changes independently (e.g., after profile patch updates)
  setUser: (user: UserProfile) => {
    set({ user })
  },
  
  // Clean, unified, async session termination pipeline
  logout: async () => {
    try {
      // 1. Fire a background request to let Symfony revoke the active Refresh Token row
      await api.post('/logout')
    } catch (err) {
      console.warn('Database active session revocation bypassed or backend offline.', err)
    } finally {
      // 2. ALWAYS clear local trace indicators regardless of connection success
      localStorage.removeItem(STORAGE_KEY)
      
      set({ 
        token: null, 
        isAuthenticated: false, 
        user: null 
      })

      // 3. Clean routing handoff back to your widescreen layout auth interface
      window.location.href = '/auth'
    }
  }
}))