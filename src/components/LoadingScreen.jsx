import { motion } from 'framer-motion'
import { usePengaturanStore } from '../stores/pengaturanStore'
import { School } from 'lucide-react'

export default function LoadingScreen() {
  const { pengaturan } = usePengaturanStore()
  const logo = pengaturan?.logo_sekolah || null
  const nama = pengaturan?.nama_sekolah || 'Sistem Absensi'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center gap-5"
      >
        {/* Spinner + logo di tengah */}
        <div className="relative w-20 h-20">
          {/* Ring luar berputar */}
          <svg className="absolute inset-0 w-full h-full animate-spin" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="#e2e8f0" strokeWidth="4"/>
            <circle cx="40" cy="40" r="36"
              stroke="url(#grad)" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="226"
              strokeDashoffset="170"
            />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#10b981"/>
              </linearGradient>
            </defs>
          </svg>

          {/* Logo / ikon di tengah */}
          <div className="absolute inset-0 flex items-center justify-center">
            {logo ? (
              <motion.img
                src={logo}
                alt={nama}
                className="w-10 h-10 object-contain rounded-xl"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
              />
            ) : (
              <motion.div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#6366f1,#10b981)' }}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
              >
                <School size={20} className="text-white"/>
              </motion.div>
            )}
          </div>
        </div>

        {/* Nama sekolah */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{nama}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Memuat aplikasi...</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
