// src/stores/auth.ts
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
  fetchMe: () => Promise<UserProfile | null>
  logout: () => Promise<void>
}

const STORAGE_KEY = 'sheetforge_jwt_token'

// 🛡️ Apply quote-stripping sanitization to ensure static mode triggers accurately on hard refresh
const isStaticMode = typeof window !== 'undefined' && 
  import.meta.env.VITE_API_BASE_URL?.replace(/['"]/g, '') === 'NO'

const MOCK_PROFILE: UserProfile = {
  id: 'static-demo-id',
  email: 'sandbox@sheetforge.app',
  firstName: 'Demo',
  lastName: 'Operator',
  fullName: 'Demo Operator',
  role: 'ROLE_USER',
  status: 'ACTIVE',
  profilePicture: null
}

export const useAuth = create<AuthState>((set) => ({
  // Initialize with the mock variables instantly to prevent component mounting delays
  token: isStaticMode ? 'static_mock_session_key_prod' : (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null),
  isAuthenticated: isStaticMode ? true : (typeof window !== 'undefined' ? !!localStorage.getItem(STORAGE_KEY) : false),
  user: isStaticMode ? MOCK_PROFILE : null,

  login: (token: string, user: UserProfile | null = null) => {
    localStorage.setItem(STORAGE_KEY, token)
    set({ token, isAuthenticated: true, ...(user ? { user } : {}) })
  },

  setUser: (user: UserProfile) => set({ user }),

  fetchMe: async () => {
    if (isStaticMode) return MOCK_PROFILE
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) return null

    try {
      const response = await api.get<UserProfile>('/me')
      set({ user: response.data, isAuthenticated: true })
      return response.data
    } catch (err) {
      localStorage.removeItem(STORAGE_KEY)
      set({ token: null, isAuthenticated: false, user: null })
      return null
    }
  },
  
  logout: async () => {
    if (!isStaticMode) {
      try { await api.post('/logout') } catch (e) { console.warn(e) }
    }
    localStorage.removeItem(STORAGE_KEY)
    set({ 
      token: null, 
      isAuthenticated: isStaticMode ? true : false, 
      user: isStaticMode ? MOCK_PROFILE : null 
    })
  }
}))