import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
})

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Jika data adalah FormData, hapus Content-Type agar axios set otomatis
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
      // Naikkan timeout untuk upload file (video bisa besar)
      config.timeout = 300000  // 5 menit
      console.log('📦 Sending FormData - Content-Type will be set automatically')
    }
    
    console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`)
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ Response Error:', error.response || error)
    
    const { response } = error
    
    if (!response) {
      toast.error('Koneksi ke server gagal. Pastikan backend berjalan.')
      return Promise.reject(error)
    }
    
    if (response.status === 401) {
      useAuthStore.getState().logout()
      toast.error('Sesi telah berakhir. Silakan login kembali.')
      window.location.href = '/login'
    } else if (response.status === 403) {
      toast.error('Anda tidak memiliki akses ke fitur ini.')
    } else if (response.status === 404) {
      toast.error('Endpoint tidak ditemukan.')
    } else if (response.status === 422) {
      // Validation errors - biarkan component handle
    } else if (response.status >= 500) {
      toast.error('Terjadi kesalahan server. Silakan coba lagi.')
    }

    return Promise.reject(error)
  }
)

export default api