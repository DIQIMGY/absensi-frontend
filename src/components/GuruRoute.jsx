/**
 * GuruRoute — wrapper proteksi halaman guru berdasarkan jabatan.
 *
 * Props:
 *   requireFullAccess (default true) — block guru_mapel & karyawan
 *   kepsekOnly (default false)       — hanya kepsek yang boleh masuk
 */
import { useGuruJabatan } from '../hooks/useGuruJabatan'
import { motion } from 'framer-motion'
import { ShieldOff, ArrowLeft, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function GuruRoute({ children, requireFullAccess = true, kepsekOnly = false }) {
  const { isAbsensiOnly, isKepsek, jabatanLabel } = useGuruJabatan()
  const navigate = useNavigate()

  // Halaman khusus kepsek — wali kelas pun tidak boleh
  if (kepsekOnly && !isKepsek) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <Lock size={28} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Khusus Kepala Sekolah</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Halaman ini hanya dapat diakses oleh <span className="font-semibold text-slate-700 dark:text-slate-200">Kepala Sekolah</span>.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Anda login sebagai <span className="font-medium">{jabatanLabel}</span>.
          </p>
          <button
            onClick={() => navigate('/guru/dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft size={15} />
            Kembali ke Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  // Halaman butuh full access — block guru_mapel & karyawan
  if (requireFullAccess && isAbsensiOnly) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-5">
            <ShieldOff size={28} className="text-rose-500" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Akses Terbatas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Halaman ini tidak tersedia untuk <span className="font-semibold text-slate-700 dark:text-slate-200">{jabatanLabel}</span>.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Fitur ini hanya dapat diakses oleh Kepala Sekolah dan Wali Kelas.
          </p>
          <button
            onClick={() => navigate('/guru/dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft size={15} />
            Kembali ke Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  return children
}
