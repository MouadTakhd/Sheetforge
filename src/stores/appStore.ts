import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: Array<{ id: string; message: string; type: 'success' | 'error' }>
  
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  addNotification: (message: string, type: 'success' | 'error') => void
  removeNotification: (id: string) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        sidebarOpen: true,
        notifications: [],
        
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        addNotification: (message, type) => set((state) => ({
          notifications: [...state.notifications, { id: Date.now().toString(), message, type }]
        })),
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
      }),
      { name: 'app-store' }
    )
  )
)
