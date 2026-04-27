import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  timeout: 30000,
})

// Request interceptor — import authStore secara lazy di dalam fungsi
api.interceptors.request.use(
  async (config) => {
    // Lazy import untuk hindari circular dependency
    const { useAuthStore } = await import('../stores/authStore')
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
      config.timeout = 300000
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error

    if (config?.skipErrorToast) return Promise.reject(error)

    if (!response) {
      toast.error('Koneksi ke server gagal. Pastikan backend berjalan.')
      return Promise.reject(error)
    }

    if (response.status === 401) {
      const { useAuthStore } = await import('../stores/authStore')
      useAuthStore.getState().logout()
      toast.error('Sesi telah berakhir. Silakan login kembali.')
      window.location.href = '/login'
    } else if (response.status === 403) {
      toast.error('Anda tidak memiliki akses ke fitur ini.')
    } else if (response.status >= 500) {
      if (!config?.silent) {
        toast.error('Terjadi kesalahan server. Silakan coba lagi.')
      }
    }

    return Promise.reject(error)
  }
)

export default api
