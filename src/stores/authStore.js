import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (credentials) => {
        try {
          const response = await api.post('/login', credentials)
          const { user, token } = response.data.data
          set({ user, token, isAuthenticated: true, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          toast.success('Login berhasil!')
          return { success: true, user }
        } catch (error) {
          const message = error.response?.data?.message || 'Login gagal'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      register: async (data) => {
        try {
          const response = await api.post('/register', data)
          const { user, token } = response.data.data
          set({ user, token, isAuthenticated: true, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          toast.success('Registrasi berhasil!')
          return { success: true, user: response.data.data.user }
        } catch (error) {
          const message = error.response?.data?.message || 'Registrasi gagal'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      logout: async () => {
        try {
          await api.post('/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          delete api.defaults.headers.common['Authorization']
          toast.success('Logout berhasil')
        }
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) { set({ isLoading: false }); return }
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/me')
          set({ user: response.data.data, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          delete api.defaults.headers.common['Authorization']
        }
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      getDashboardRoute: () => {
        const { user } = get()
        if (!user) return '/login'
        switch (user.role) {
          case 'admin': return '/admin/dashboard'
          case 'guru': return '/guru/dashboard'
          case 'siswa': return '/siswa/dashboard'
          default: return '/login'
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
