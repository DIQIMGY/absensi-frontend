import { motion, AnimatePresence } from 'framer-motion'
import { Award, XCircle, Trophy } from 'lucide-react'

export default function RankingNotification({ show, ranking, onClose }) {
  if (!show || !ranking) return null

  const hasKelasRanking = ranking.kelas?.masuk_ranking.rajin || ranking.kelas?.masuk_ranking.terlambat || ranking.kelas?.masuk_ranking.alpha
  const hasSekolahRanking = ranking.sekolah?.masuk_ranking.rajin || ranking.sekolah?.masuk_ranking.terlambat || ranking.sekolah?.masuk_ranking.alpha

  if (!hasKelasRanking && !hasSekolahRanking) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50 max-w-md"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-xl shadow-2xl border border-amber-400">
            <div className="flex items-start gap-3">
              <Award className="flex-shrink-0 mt-0.5" size={24} />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">🎉 Selamat!</h3>
                
                {/* Ranking Kelas */}
                {hasKelasRanking && (
                  <div className="mb-2">
                    <p className="font-semibold text-sm mb-1 flex items-center gap-1">
                      <Trophy size={14} />
                      Ranking Kelas:
                    </p>
                    <div className="text-sm space-y-1 ml-5">
                      {ranking.kelas.masuk_ranking.rajin && (
                        <p>• Top {ranking.kelas.posisi_ranking.rajin} Siswa Paling Rajin</p>
                      )}
                      {ranking.kelas.masuk_ranking.terlambat && (
                        <p>• Top {ranking.kelas.posisi_ranking.terlambat} Sering Terlambat</p>
                      )}
                      {ranking.kelas.masuk_ranking.alpha && (
                        <p>• Top {ranking.kelas.posisi_ranking.alpha} Sering Alpha</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Ranking Sekolah */}
                {hasSekolahRanking && (
                  <div>
                    <p className="font-semibold text-sm mb-1 flex items-center gap-1">
                      <Trophy size={14} />
                      Ranking Sekolah:
                    </p>
                    <div className="text-sm space-y-1 ml-5">
                      {ranking.sekolah.masuk_ranking.rajin && (
                        <p>• Top {ranking.sekolah.posisi_ranking.rajin} Siswa Paling Rajin</p>
                      )}
                      {ranking.sekolah.masuk_ranking.terlambat && (
                        <p>• Top {ranking.sekolah.posisi_ranking.terlambat} Sering Terlambat</p>
                      )}
                      {ranking.sekolah.masuk_ranking.alpha && (
                        <p>• Top {ranking.sekolah.posisi_ranking.alpha} Sering Alpha</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
