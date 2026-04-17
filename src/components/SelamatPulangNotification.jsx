import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Home, Award, Clock, Heart, FileText, XCircle } from 'lucide-react'
import { usePengaturanStore } from '../stores/pengaturanStore'

const SESSION_KEY = 'selamat_pulang_notif'

export default function SelamatPulangNotification({ statusKehadiran = null, dataAbsensi = null }) {
  const [show, setShow] = useState(false)
  const { pengaturan } = usePengaturanStore()

  useEffect(() => {
    const checkTime = () => {
      if (!pengaturan.jam_pulang || !pengaturan.jam_masuk) return
      const now = new Date()
      const [ph, pm] = pengaturan.jam_pulang.split(':')
      const jamPulang = new Date(); jamPulang.setHours(+ph, +pm, 0)
      const [mh, mm] = pengaturan.jam_masuk.split(':')
      const jamMasuk = new Date(); jamMasuk.setHours(+mh, +mm, 0)
      if (jamMasuk <= jamPulang) jamMasuk.setDate(jamMasuk.getDate() + 1)

      if (now >= jamPulang && now < jamMasuk) {
        const todayKey = `${SESSION_KEY}_${new Date().toDateString()}`
        if (!sessionStorage.getItem(todayKey)) {
          sessionStorage.setItem(todayKey, '1')
          setShow(true)
        }
      }
    }
    checkTime()
    const t = setInterval(checkTime, 60000)
    return () => clearInterval(t)
  }, [pengaturan.jam_pulang, pengaturan.jam_masuk])

  // Auto dismiss setelah 8 detik
  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setShow(false), 8000)
    return () => clearTimeout(t)
  }, [show])

  const cfg = {
    hadir:     { icon: Award,    color: '#10b981', title: 'Selamat Pulang!', sub: 'Hadir tepat waktu hari ini 🌟' },
    terlambat: { icon: Clock,    color: '#f59e0b', title: 'Selamat Pulang!', sub: 'Besok datang lebih awal ya ⏰' },
    izin:      { icon: FileText, color: '#8b5cf6', title: 'Selamat Pulang!', sub: 'Semoga urusan lancar 📝' },
    sakit:     { icon: Heart,    color: '#ec4899', title: 'Cepat Sembuh!',   sub: 'Istirahat yang cukup ya 💊' },
    alpha:     { icon: XCircle,  color: '#ef4444', title: 'Selamat Pulang!', sub: 'Jangan lupa kejar materi ya 📚' },
  }
  const c = cfg[statusKehadiran?.toLowerCase()] || {
    icon: Home, color: '#10b981', title: 'Selamat Pulang!', sub: 'Istirahat yang cukup ya 🏠'
  }
  const Icon = c.icon

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-72 sm:w-80"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            {/* Progress bar auto-dismiss */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 8, ease: 'linear' }}
              className="h-0.5"
              style={{ background: c.color }}
            />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: c.color + '18' }}>
                  <Icon size={17} style={{ color: c.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{c.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
                  {pengaturan.jam_masuk && (
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1.5">
                      Sampai jumpa besok jam {pengaturan.jam_masuk?.substring(0, 5)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShow(false)}
                  className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
