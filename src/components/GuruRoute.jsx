/**
 * GuruRoute — wrapper untuk halaman guru yang membutuhkan akses penuh.
 * Guru mapel & karyawan (isAbsensiOnly) akan di-redirect ke /guru/dashboard
 * dengan pesan "Akses terbatas".
 */
import { Navigate } from 'react-router-dom'
import { useGuruJabatan } from '../hooks/useGuruJabatan'
import { motion } from 'framer-motion'
import { ShieldOff, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function GuruRoute({ children, requireFullAccess = true }) {
  const { isAbsensiOnly, jabatanLabel } = useGuruJabatan()
  const navigate = useNavigate()

  // Kalau halaman ini butuh full access dan user hanya punya aksensi only → tampil halaman blocked
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
