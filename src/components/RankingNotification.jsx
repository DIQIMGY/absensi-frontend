import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, TrendingUp } from 'lucide-react'

export default function RankingNotification({ show, ranking, onClose }) {
  // Auto dismiss setelah 6 detik
  useEffect(() => {
    if (!show) return
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [show])

  if (!show || !ranking) return null

  const hasKelasRanking = ranking.kelas?.masuk_ranking?.rajin || ranking.kelas?.masuk_ranking?.terlambat || ranking.kelas?.masuk_ranking?.alpha
  const hasSekolahRanking = ranking.sekolah?.masuk_ranking?.rajin || ranking.sekolah?.masuk_ranking?.terlambat || ranking.sekolah?.masuk_ranking?.alpha

  if (!hasKelasRanking && !hasSekolahRanking) return null

  const items = []
  if (ranking.kelas?.masuk_ranking?.rajin)
    items.push({ label: `#${ranking.kelas.posisi_ranking.rajin} Rajin`, scope: 'Kelas', color: '#f59e0b' })
  if (ranking.kelas?.masuk_ranking?.terlambat)
    items.push({ label: `#${ranking.kelas.posisi_ranking.terlambat} Terlambat`, scope: 'Kelas', color: '#f97316' })
  if (ranking.kelas?.masuk_ranking?.alpha)
    items.push({ label: `#${ranking.kelas.posisi_ranking.alpha} Alpha`, scope: 'Kelas', color: '#ef4444' })
  if (ranking.sekolah?.masuk_ranking?.rajin)
    items.push({ label: `#${ranking.sekolah.posisi_ranking.rajin} Rajin`, scope: 'Sekolah', color: '#f59e0b' })
  if (ranking.sekolah?.masuk_ranking?.terlambat)
    items.push({ label: `#${ranking.sekolah.posisi_ranking.terlambat} Terlambat`, scope: 'Sekolah', color: '#f97316' })
  if (ranking.sekolah?.masuk_ranking?.alpha)
    items.push({ label: `#${ranking.sekolah.posisi_ranking.alpha} Alpha`, scope: 'Sekolah', color: '#ef4444' })

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
            {/* Progress bar auto-dismiss */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 6, ease: 'linear' }}
              className="h-0.5 bg-amber-400"
            />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <Trophy size={17} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">Kamu masuk ranking!</p>
                  <p className="text-xs text-slate-400 mt-0.5 mb-2.5">Posisimu saat ini</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ color: item.color, background: item.color + '15', borderColor: item.color + '30' }}
                      >
                        <TrendingUp size={9} />
                        {item.label} · {item.scope}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={onClose}
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
