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
      
      // Hard reload if you want an absolute clean global state eviction,
      // or let TanStack Router's beforeLoad handle the next navigation block safely
    navigate({to:'/auth'})
    }
    return Promise.reject(error)
  }
)

export default api