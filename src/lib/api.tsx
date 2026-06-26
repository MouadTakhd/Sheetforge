import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sheetforge_jwt_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sheetforge_jwt_token')

      // This module isn't a React component, so router hooks aren't available here.
      // Hard-redirect for a clean global state eviction (guard SSR / already on /auth).
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
        window.location.assign('/auth')
      }
    }
    return Promise.reject(error)
  }
)

export default api