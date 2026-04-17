import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, X, Coffee } from 'lucide-react'
import { usePengaturanStore } from '../stores/pengaturanStore'

const SESSION_KEY = 'santai_notif_shown'

export default function SantaiDirumahNotification() {
  const [show, setShow] = useState(false)
  const { pengaturan } = usePengaturanStore()

  useEffect(() => {
    const checkTime = () => {
      if (!pengaturan.jam_pulang || !pengaturan.jam_buka_absen) return

      const now = new Date()
      const [ph, pm] = pengaturan.jam_pulang.split(':')
      const jamPulang = new Date()
      jamPulang.setHours(parseInt(ph), parseInt(pm), 0)

      const [bh, bm] = pengaturan.jam_buka_absen.split(':')
      const jamBuka = new Date()
      jamBuka.setHours(parseInt(bh), parseInt(bm), 0)
      if (jamBuka <= jamPulang) jamBuka.setDate(jamBuka.getDate() + 1)

      const sudahPulang = now >= jamPulang
      const belumBuka = now < jamBuka

      if (sudahPulang && belumBuka) {
        const todayKey = `${SESSION_KEY}_${new Date().toDateString()}`
        if (!sessionStorage.getItem(todayKey)) {
          sessionStorage.setItem(todayKey, '1')
          setShow(true)
        }
      }
    }

    checkTime()
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [pengaturan.jam_pulang, pengaturan.jam_buka_absen])

  // Auto dismiss setelah 8 detik
  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setShow(false), 8000)
    return () => clearTimeout(t)
  }, [show])

  const currentHour = new Date().getHours()
  const isMalam = currentHour >= 18 || currentHour < 6

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="fixed top-20 right-4 z-50 w-72 sm:w-80"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 8, ease: 'linear' }}
              className={`h-0.5 ${isMalam ? 'bg-indigo-400' : 'bg-amber-400'}`}
            />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isMalam ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-amber-50 dark:bg-amber-900/30'
                }`}>
                  {isMalam
                    ? <Moon size={17} className="text-indigo-500" />
                    : <Coffee size={17} className="text-amber-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {isMalam ? 'Selamat beristirahat' : 'Santai dulu di rumah'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sekolah buka besok jam {pengaturan.jam_buka_absen?.substring(0, 5)}
                  </p>
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
