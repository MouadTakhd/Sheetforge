import axios from 'axios'

export const TOKEN_KEY = 'sheetforge_jwt_token'

// In dev, VITE_API_BASE_URL is '/api' and the Vite proxy (vite.config.ts) forwards
// to the backend. In prod (Vercel) set it to the full backend URL INCLUDING the
// /api prefix, e.g. https://sheetforge-backend-z4vy.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)

      // This module isn't a React component, so router hooks aren't available here.
      // Hard-redirect for a clean global state eviction (guard SSR / already on /auth).
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.assign('/auth')
      }
    }
    return Promise.reject(error)
  }
)

export default api