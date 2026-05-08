import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, Home } from 'lucide-react'
import { usePengaturanStore } from '../stores/pengaturanStore'

const SESSION_KEY = 'pulang_notif_shown'

export default function PulangNotification() {
  const [show, setShow] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [isPulangTime, setIsPulangTime] = useState(false)
  const { pengaturan } = usePengaturanStore()

  useEffect(() => {
    const checkTime = () => {
      if (!pengaturan.jam_pulang) return

      const now = new Date()
      const [h, m] = pengaturan.jam_pulang.split(':')
      const pulangTime = new Date()
      pulangTime.setHours(parseInt(h), parseInt(m), 0)

      const diffMs = pulangTime - now
      const diffMins = Math.floor(diffMs / 60000)

      const todayKey = `${SESSION_KEY}_${new Date().toDateString()}`

      if (diffMins > 0 && diffMins <= 30) {
        // Hanya tampilkan sekali per hari
        if (!sessionStorage.getItem(todayKey + '_countdown')) {
          sessionStorage.setItem(todayKey + '_countdown', '1')
          setIsPulangTime(false)
          setTimeLeft(`${diffMins} menit`)
          setShow(true)
        }
      } else if (diffMins <= 0 && diffMins >= -5) {
        if (!sessionStorage.getItem(todayKey + '_pulang')) {
          sessionStorage.setItem(todayKey + '_pulang', '1')
          setIsPulangTime(true)
          setShow(true)
        }
      }
    }

    checkTime()
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [pengaturan.jam_pulang])

  // Auto dismiss setelah 8 detik
  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setShow(false), 8000)
    return () => clearTimeout(t)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="fixed top-16 left-0 right-0 z-50 px-3 sm:px-0 sm:top-20 sm:right-4 sm:left-auto sm:w-80"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 8, ease: 'linear' }}
              className={`h-0.5 ${isPulangTime ? 'bg-emerald-400' : 'bg-violet-400'}`}
            />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isPulangTime ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-violet-50 dark:bg-violet-900/30'
                }`}>
                  {isPulangTime
                    ? <Home size={17} className="text-emerald-500" />
                    : <Clock size={17} className="text-violet-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {isPulangTime ? 'Waktunya pulang!' : 'Sebentar lagi pulang'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isPulangTime
                      ? `Jam pulang: ${pengaturan.jam_pulang?.substring(0, 5)}`
                      : `${timeLeft} lagi · jam ${pengaturan.jam_pulang?.substring(0, 5)}`
                    }
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
