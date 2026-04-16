import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Home, Award, Clock, Heart, FileText, XCircle } from 'lucide-react'
import { usePengaturanStore } from '../stores/pengaturanStore'

export default function SelamatPulangNotification({ statusKehadiran = null, dataAbsensi = null }) {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
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
      setShow(now >= jamPulang && now < jamMasuk)
    }
    checkTime()
    const t = setInterval(checkTime, 60000)
    return () => clearInterval(t)
  }, [pengaturan.jam_pulang, pengaturan.jam_masuk])

  // Auto dismiss setelah 8 detik
  useEffect(() => {
    if (show && !dismissed) {
      const t = setTimeout(() => setDismissed(true), 8000)
      return () => clearTimeout(t)
    }
  }, [show])

  const cfg = {
    hadir:     { icon: Award,    color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-700/50', title: 'Selamat Pulang! 🌟', sub: 'Hadir tepat waktu hari ini' },
    terlambat: { icon: Clock,    color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/30',   border: 'border-amber-200 dark:border-amber-700/50',   title: 'Selamat Pulang! ⏰', sub: 'Besok datang lebih awal ya' },
    izin:      { icon: FileText, color: '#8b5cf6', bg: 'bg-violet-50 dark:bg-violet-900/30', border: 'border-violet-200 dark:border-violet-700/50', title: 'Selamat Pulang! 📝', sub: 'Semoga urusan lancar' },
    sakit:     { icon: Heart,    color: '#ec4899', bg: 'bg-pink-50 dark:bg-pink-900/30',     border: 'border-pink-200 dark:border-pink-700/50',     title: 'Cepat Sembuh! 💊',  sub: 'Istirahat yang cukup ya' },
    alpha:     { icon: XCircle,  color: '#ef4444', bg: 'bg-rose-50 dark:bg-rose-900/30',     border: 'border-rose-200 dark:border-rose-700/50',     title: 'Selamat Pulang! 📚', sub: 'Tanyakan materi ke teman' },
  }
  const c = cfg[statusKehadiran?.toLowerCase()] || { icon: Home, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-700/50', title: 'Selamat Pulang! 🏠', sub: 'Istirahat yang cukup ya' }
  const Icon = c.icon

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ opacity:0, x:80, scale:0.9 }}
          animate={{ opacity:1, x:0, scale:1 }}
          exit={{ opacity:0, x:80, scale:0.9 }}
          transition={{ type:'spring', stiffness:300, damping:28 }}
          className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 w-72 sm:w-80 rounded-2xl border shadow-xl backdrop-blur-sm ${c.bg} ${c.border}`}
        >
          {/* Progress bar auto-dismiss */}
          <motion.div
            initial={{ width:'100%' }}
            animate={{ width:'0%' }}
            transition={{ duration:8, ease:'linear' }}
            className="absolute top-0 left-0 h-0.5 rounded-t-2xl"
            style={{ background: c.color }}
          />

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${c.color}20` }}>
                <Icon size={18} style={{ color: c.color }}/>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{c.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.sub}</p>
                {pengaturan.jam_masuk && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                    Sampai jumpa besok jam {pengaturan.jam_masuk?.substring(0,5)}
                  </p>
                )}
              </div>

              {/* Close */}
              <button onClick={() => setDismissed(true)}
                className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 transition-colors">
                <X size={13}/>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
