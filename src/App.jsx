import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { usePengaturanStore } from './stores/pengaturanStore'
import { router } from './routes'
import { School } from 'lucide-react'
import { motion } from 'framer-motion'

function AppLoadingScreen() {
  const { pengaturan } = usePengaturanStore()
  const [logoErr, setLogoErr] = useState(false)
  const logo = pengaturan?.logo_sekolah || null
  const nama = pengaturan?.nama_sekolah || 'Sistem Absensi'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col items-center gap-5"
      >
        {/* Spinner dengan logo di tengah */}
        <div className="relative w-24 h-24">
          {/* Ring berputar */}
          <svg className="absolute inset-0 w-full h-full animate-spin" viewBox="0 0 96 96" fill="none">
            <circle cx="48" cy="48" r="44" stroke="#e2e8f0" strokeWidth="4" className="dark:stroke-slate-800"/>
            <circle cx="48" cy="48" r="44"
              stroke="url(#loadGrad)" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="276"
              strokeDashoffset="210"
            />
            <defs>
              <linearGradient id="loadGrad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#10b981"/>
              </linearGradient>
            </defs>
          </svg>

          {/* Logo sekolah di tengah spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 22 }}
            >
              {logo && !logoErr ? (
                <img
                  src={logo}
                  alt={nama}
                  className="w-12 h-12 object-contain rounded-xl"
                  onError={() => setLogoErr(true)}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#10b981)' }}>
                  <School size={24} className="text-white"/>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Nama sekolah */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide">{nama}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Memuat aplikasi...</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function App() {
  const { checkAuth, isLoading } = useAuthStore()
  const { fetchPengaturan } = usePengaturanStore()

  useEffect(() => {
    // Fetch paralel — auth + pengaturan (untuk logo di loading screen)
    checkAuth()
    fetchPengaturan(true)
  }, [checkAuth, fetchPengaturan])

  if (isLoading) {
    return <AppLoadingScreen />
  }

  return <RouterProvider router={router} />
}
