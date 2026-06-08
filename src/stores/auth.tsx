import api from '@/lib/api'
import { Navigate } from '@tanstack/react-router'
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

export const useAuth = create<AuthState>((set, get) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem(STORAGE_KEY) : false,
  user: null, // Starts null on fresh reloads, which is normal

  login: (token: string, user: UserProfile | null = null) => {
    localStorage.setItem(STORAGE_KEY, token)
    set({ 
      token, 
      isAuthenticated: true,
      ...(user ? { user } : {})
    })
  },

  setUser: (user: UserProfile) => {
    set({ user })
  },

  // ─── THE SYSTEM REHYDRATION PIECE ───
  // A clean runtime method to re-populate user state dynamically on reload
  fetchMe: async () => {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) return null

    try {
      const response = await api.get<UserProfile>('/me')
      set({ user: response.data, isAuthenticated: true })
      return response.data
    } catch (err) {
      console.error('Session verification signature faded or timed out on re-hydration loop.', err)
      localStorage.removeItem(STORAGE_KEY)
      set({ token: null, isAuthenticated: false, user: null })
      return null
    }
  },
  
  logout: async () => {
    try {
      await api.post('/logout')
    } catch (err) {
      console.warn('Database active session revocation bypassed or backend offline.', err)
    } finally {
      localStorage.removeItem(STORAGE_KEY)
      set({ token: null, isAuthenticated: false, user: null })
      window.location.href = '/auth' // Hard redirect works best for clearing route state layout memory
    }
  }
}))