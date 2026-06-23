import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, GraduationCap, Search, RefreshCw, Eye,
  Phone, MapPin, Calendar, User, Award,
  UserCheck, UserX, QrCode, Download, Fingerprint,
  CheckCircle, AlertTriangle, X, Loader, AlertCircle,
  ChevronLeft, ChevronRight, Hash, BookOpen, Filter,
} from 'lucide-react'
import { guruApi } from '../../services/guruService'
import { useGuruJabatan } from '../../hooks/useGuruJabatan'
import { confirmDelete } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'

// ─── Avatar ───────────────────────────────────────────────────
function Avatar({ siswa, size = 36 }) {
  const [err, setErr] = useState(false)
  const init = (siswa?.nama_lengkap || 'S').charAt(0).toUpperCase()
  return (
    <div className="flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600"
      style={{ width: size, height: size }}>
      {(siswa?.foto_url || siswa?.foto) && !err
        ? <img src={siswa.foto_url || siswa.foto} alt={siswa.nama_lengkap}
            className="w-full h-full object-cover" onError={() => setErr(true)} />
        : <div className="w-full h-full flex items-center justify-center text-white font-bold"
            style={{ fontSize: Math.round(size * 0.38) }}>{init}</div>
      }
    </div>
  )
}

// ─── Modal wrapper ────────────────────────────────────────────
function ModalBase({ onClose, children, maxW = 'max-w-md' }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(2,6,23,0.72)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className={`bg-white dark:bg-slate-900 w-full ${maxW} rounded-t-[24px] sm:rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl`}
        onClick={e => e.stopPropagation()}>
        {/* drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-8 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

// ─── QR Modal ─────────────────────────────────────────────────
function QrModal({ siswa, onClose, onReset, onDownload }) {
  const [loading, setLoading] = useState(true)
  const [qr, setQr] = useState(null)

  useEffect(() => {
    guruApi.getSiswaQr(siswa.id)
      .then(r => setQr(r.data.data))
      .catch(() => setQr({ qr_code_url: null }))
      .finally(() => setLoading(false))
  }, [siswa.id])

  return (
    <ModalBase onClose={onClose} maxW="max-w-sm">
      {/* header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
            <QrCode size={15} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">QR Code</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{siswa.nama_lengkap}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="px-5 py-5 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-10 gap-3 text-slate-400">
            <Loader size={28} className="animate-spin" />
            <p className="text-sm">Memuat QR Code...</p>
          </div>
        ) : qr?.qr_code_url ? (
          <>
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 dark:bg-slate-800">
                <img src={qr.qr_code_url} alt="QR" className="w-44 h-44 object-contain" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{siswa.nama_lengkap}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">NIS: {siswa.nis}</p>
            </div>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => onDownload(siswa)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                <Download size={13} /> Download
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => { onClose(); onReset(siswa) }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                <RefreshCw size={13} /> Reset QR
              </motion.button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <QrCode size={36} className="text-slate-300 dark:text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">QR Code belum ada</p>
              <p className="text-xs text-slate-400 mt-1">Klik generate untuk membuat baru</p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { onClose(); onReset(siswa) }}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
              <RefreshCw size={14} /> Generate QR
            </motion.button>
          </div>
        )}
      </div>
    </ModalBase>
  )
}

// ─── Fingerprint Modal ────────────────────────────────────────
function FingerprintModal({ siswa, onClose }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    guruApi.checkSiswaFingerprint(siswa.id)
      .then(r => setStatus(r.data.data))
      .catch(() => setStatus({ terdaftar: false }))
  }, [siswa.id])

  const register = async () => {
    setLoading(true)
    try {
      const r = await guruApi.registerSiswaFingerprint(siswa.id)
      setStatus({ terdaftar: true, uid: r.data.data?.uid })
      toast.success(r.data.data?.pesan || 'Berhasil didaftarkan')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal mendaftarkan')
    } finally { setLoading(false) }
  }

  const unregister = async () => {
    setLoading(true)
    try {
      await guruApi.unregisterSiswaFingerprint(siswa.id)
      setStatus({ terdaftar: false })
      toast.success('Sidik jari dihapus dari mesin')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menghapus')
    } finally { setLoading(false) }
  }

  return (
    <ModalBase onClose={onClose}>
      {/* gradient header */}
      <div className="px-5 py-4 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Fingerprint size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Sidik Jari</p>
              <p className="text-[10px] text-white/70">Mesin fingerprint absensi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors text-white/80">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* siswa info */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <Avatar siswa={siswa} size={44} />
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{siswa.nama_lengkap}</p>
            <p className="text-xs text-slate-500">NIS: {siswa.nis}</p>
            <p className="text-[10px] font-mono text-teal-600 dark:text-teal-400 mt-0.5">User ID: {siswa.nis}</p>
          </div>
        </div>

        {/* status */}
        {status === 'checking' ? (
          <div className="flex items-center justify-center gap-2 py-5 text-slate-400">
            <Loader size={16} className="animate-spin" />
            <span className="text-sm">Mengecek mesin...</span>
          </div>
        ) : status?.terdaftar ? (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" />
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Sudah Terdaftar</p>
            </div>
            {status.uid && <p className="text-xs text-emerald-600 dark:text-emerald-400">UID: <span className="font-mono font-bold">{status.uid}</span></p>}
            <p className="text-xs text-slate-500 dark:text-slate-400">Siswa bisa absen fingerprint. Hapus untuk daftar ulang.</p>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-500" />
              <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Belum Terdaftar</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Daftarkan siswa, lalu arahkan ke mesin untuk scan jari.</p>
          </div>
        )}

        {/* panduan */}
        <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800/50">
          <p className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1.5">Cara Daftar</p>
          {['1. Klik "Daftarkan ke Mesin"', '2. Siswa datang ke mesin fingerprint', '3. Ikuti instruksi scan jari (1–10)', '4. Absensi fingerprint langsung aktif'].map((s, i) => (
            <p key={i} className="text-[10px] text-teal-700/80 dark:text-teal-400/80">{s}</p>
          ))}
        </div>

        {/* aksi */}
        <div className="flex gap-2 pt-1">
          {status !== 'checking' && !status?.terdaftar && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={register} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50">
              {loading ? <Loader size={14} className="animate-spin" /> : <Fingerprint size={14} />}
              {loading ? 'Mendaftarkan...' : 'Daftarkan ke Mesin'}
            </motion.button>
          )}
          {status?.terdaftar && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={unregister} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50">
              {loading ? <Loader size={14} className="animate-spin" /> : <X size={14} />}
              {loading ? 'Menghapus...' : 'Hapus dari Mesin'}
            </motion.button>
          )}
          <button onClick={onClose}
            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors border border-slate-200 dark:border-slate-700">
            Tutup
          </button>
        </div>
      </div>
    </ModalBase>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────
function DetailModal({ siswa, onClose, onQr, onFingerprint }) {
  const s   = siswa.statistik_absensi || {}
  const pct = s.persentase_kehadiran || 0
  const pctColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
  const pctLabel = pct >= 80 ? 'Baik' : pct >= 60 ? 'Cukup' : 'Kurang'

  return (
    <ModalBase onClose={onClose} maxW="max-w-lg">
      {/* header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar siswa={siswa} size={40} />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{siswa.nama_lengkap}</p>
            <p className="text-[10px] text-slate-400">{siswa.kelas?.nama_kelas} · NIS {siswa.nis}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'min(70vh, 520px)' }}>
        <div className="px-5 py-4 space-y-4">
          {/* quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { onClose(); onQr(siswa) }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-xs font-bold border border-violet-200 dark:border-violet-800 hover:bg-violet-100 transition-colors">
              <QrCode size={14} /> Lihat QR Code
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { onClose(); onFingerprint(siswa) }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors">
              <Fingerprint size={14} /> Sidik Jari
            </motion.button>
          </div>

          {/* kehadiran */}
          {s.total_hari_kerja > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Kehadiran Bulan Ini</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tabular-nums" style={{ color: pctColor }}>{pct}%</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg" style={{ background: `${pctColor}18`, color: pctColor }}>{pctLabel}</span>
                </div>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ background: pctColor }} />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: 'Hadir',   val: s.hadir,     c: '#10b981' },
                  { label: 'Lambat',  val: s.terlambat, c: '#f59e0b' },
                  { label: 'I/S',     val: (s.izin||0)+(s.sakit||0), c: '#3b82f6' },
                  { label: 'Alpha',   val: s.alpha,     c: '#ef4444' },
                  { label: 'Belum',   val: s.belum_absen, c: '#94a3b8' },
                ].map(item => (
                  <div key={item.label} className="text-center py-2 px-1 rounded-xl" style={{ background: `${item.c}12` }}>
                    <p className="text-base font-black tabular-nums" style={{ color: item.c }}>{item.val ?? 0}</p>
                    <p className="text-[9px] mt-0.5 font-semibold" style={{ color: item.c }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* info */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Hash,     label: 'NIS',          val: siswa.nis },
              { icon: Hash,     label: 'NISN',         val: siswa.nisn || '-' },
              { icon: User,     label: 'Jenis Kelamin', val: siswa.jenis_kelamin === 'L' ? '♂ Laki-laki' : '♀ Perempuan' },
              { icon: Calendar, label: 'Tanggal Lahir', val: siswa.tanggal_lahir ? new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '-' },
              { icon: Phone,    label: 'No. HP',        val: siswa.no_hp || '-' },
              { icon: User,     label: 'Orang Tua',     val: siswa.nama_ortu || '-' },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <item.icon size={9} />{item.label}
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{item.val}</p>
              </div>
            ))}
            {siswa.alamat && siswa.alamat !== '-' && (
              <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={9} />Alamat
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-white">{siswa.alamat}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalBase>
  )
}

// ─── Siswa Card (Mobile) ──────────────────────────────────────
function SiswaCard({ siswa, onDetail, onQr, onFingerprint, onDownloadQr }) {
  const s   = siswa.statistik_absensi || {}
  const pct = s.persentase_kehadiran || 0
  const pctColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* top strip */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${pctColor}, ${pctColor}60)` }} />

      <div className="p-4">
        {/* siswa info row */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar siswa={siswa} size={44} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{siswa.nama_lengkap}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIS: {siswa.nis}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-black tabular-nums" style={{ color: pctColor }}>{pct}%</p>
            <p className="text-[9px] text-slate-400">kehadiran</p>
          </div>
        </div>

        {/* progress bar */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: pctColor }} />
        </div>

        {/* stats row */}
        <div className="grid grid-cols-5 gap-1 mb-3">
          {[
            { label: 'Hadir',  val: s.hadir,    c: '#10b981' },
            { label: 'Lambat', val: s.terlambat, c: '#f59e0b' },
            { label: 'I/S',    val: (s.izin||0)+(s.sakit||0), c: '#3b82f6' },
            { label: 'Alpha',  val: s.alpha,    c: '#ef4444' },
            { label: 'Blm',    val: s.belum_absen, c: '#94a3b8' },
          ].map(item => (
            <div key={item.label} className="text-center py-1.5 rounded-lg" style={{ background: `${item.c}12` }}>
              <p className="text-sm font-black tabular-nums leading-none" style={{ color: item.c }}>{item.val ?? 0}</p>
              <p className="text-[8px] mt-0.5 font-semibold" style={{ color: item.c }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* action buttons */}
        <div className="flex gap-1.5">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDetail(siswa)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Eye size={11} /> Detail
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onQr(siswa)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-[10px] font-bold hover:bg-violet-100 transition-colors border border-violet-200 dark:border-violet-800">
            <QrCode size={11} /> QR
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDownloadQr(siswa)}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-[10px] font-bold hover:bg-teal-100 transition-colors border border-teal-200 dark:border-teal-800">
            <Download size={11} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onFingerprint(siswa)}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800">
            <Fingerprint size={11} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────
export default function DataSiswa() {
  const { isKepsek } = useGuruJabatan()
  const [siswas, setSiswas]         = useState([])
  const [loading, setLoading]       = useState(false)
  const [pagination, setPagination] = useState(null)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [kelasInfo, setKelasInfo]   = useState(null)
  const [stats, setStats]           = useState({ total: 0, laki_laki: 0, perempuan: 0 })
  // Kepsek: daftar semua kelas untuk filter
  const [kelasList, setKelasList]   = useState([])
  const [selectedKelas, setSelectedKelas] = useState('')
  const debRef = useRef(null)

  // modals
  const [detailSiswa, setDetailSiswa]       = useState(null)
  const [qrSiswa, setQrSiswa]               = useState(null)
  const [fpSiswa, setFpSiswa]               = useState(null)

  useEffect(() => { fetchAll() }, [page, search, selectedKelas])

  // Kepsek: fetch daftar kelas saat pertama load
  useEffect(() => {
    if (isKepsek) {
      import('../../services/publicApi').then(({ publicApi }) => {
        publicApi.getKelas().then(r => {
          setKelasList(r.data?.data || [])
        }).catch(() => {})
      })
    }
  }, [isKepsek])

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current)
    debRef.current = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(debRef.current)
  }, [searchInput])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const params = { page, search, per_page: 15 }
      if (isKepsek && selectedKelas) params.kelas_id = selectedKelas

      const [sRes, stRes] = await Promise.all([
        guruApi.getSiswas(params),
        guruApi.getSiswaStats(),
      ])
      const d = sRes.data?.data
      setSiswas(Array.isArray(d?.data) ? d.data : [])
      setPagination(d?.pagination || null)
      setStats(stRes.data.data)
      setKelasInfo(stRes.data.data.kelas_info)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleResetQr = async (siswa) => {
    const ok = await confirmDelete('Reset QR Code', `QR lama ${siswa.nama_lengkap} tidak bisa dipakai lagi. Lanjutkan?`)
    if (!ok) return
    try {
      await guruApi.resetSiswaQr(siswa.id)
      toast.success('QR Code berhasil direset')
      fetchAll()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal reset QR')
    }
  }

  const handleDownloadQr = async (siswa) => {
    try {
      const r = await guruApi.downloadSiswaQr(siswa.id)
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'image/png' }))
      const a = document.createElement('a')
      a.href = url; a.download = `QR-${siswa.nis || siswa.id}.png`
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); window.URL.revokeObjectURL(url)
      toast.success('QR diunduh')
    } catch {
      toast.error('Gagal mengunduh QR Code')
    }
  }

  const pctOverall = stats.total > 0 && siswas.length > 0
    ? Math.round(siswas.reduce((s, x) => s + (x.statistik_absensi?.persentase_kehadiran || 0), 0) / siswas.length)
    : 0

  return (
    <div className="space-y-4 pb-6">

      {/* ── Header ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 p-5 shadow-lg shadow-teal-500/20">
        {/* decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={18} className="text-white/80" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Data Siswa</p>
            </div>
            <h1 className="text-xl font-black text-white leading-tight">
              {isKepsek ? 'Semua Siswa' : (kelasInfo ? `Kelas ${kelasInfo.nama_kelas}` : 'Kelas Anda')}
            </h1>
            {!isKepsek && kelasInfo?.jurusan && (
              <p className="text-white/60 text-[11px] mt-0.5">{kelasInfo.jurusan}</p>
            )}
            {isKepsek && (
              <p className="text-white/60 text-[11px] mt-0.5">👑 Kepala Sekolah — Akses Semua Kelas</p>
            )}
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={fetchAll} disabled={loading}
            className="flex-shrink-0 p-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </motion.button>
        </div>

        {/* mini stats */}
        <div className="relative z-10 grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Total', val: stats.total,     icon: Users },
            { label: 'L',     val: stats.laki_laki, icon: UserCheck },
            { label: 'P',     val: stats.perempuan, icon: UserX },
          ].map(s => (
            <div key={s.label} className="text-center py-2.5 px-2 rounded-xl bg-white/10 border border-white/15">
              <p className="text-xl font-black text-white tabular-nums">{s.val}</p>
              <p className="text-[10px] text-white/60 font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Search ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Cari nama, NIS, NISN..."
            value={searchInput} onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all shadow-sm" />
          {searchInput && (
            <button onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
        {/* Kepsek: filter per kelas */}
        {isKepsek && kelasList.length > 0 && (
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedKelas}
              onChange={e => { setSelectedKelas(e.target.value); setPage(1) }}
              className="pl-8 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all shadow-sm appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="">Semua Kelas</option>
              {kelasList.map(k => (
                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>
        )}
      </motion.div>

      {/* ── Content ────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-[3px] border-t-teal-500 animate-spin" />
          </div>
          <p className="text-sm">Memuat data siswa...</p>
        </div>
      ) : siswas.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap size={28} className="opacity-30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Tidak ada siswa ditemukan</p>
            {search && <p className="text-xs mt-1">Coba ubah kata kunci pencarian</p>}
          </div>
        </motion.div>
      ) : (
        <>
          {/* Mobile: card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
            <AnimatePresence>
              {siswas.map((siswa, i) => (
                <motion.div key={siswa.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}>
                  <SiswaCard siswa={siswa}
                    onDetail={setDetailSiswa}
                    onQr={setQrSiswa}
                    onFingerprint={setFpSiswa}
                    onDownloadQr={handleDownloadQr} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Desktop: table */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                  {['Siswa', 'Hadir', 'Terlambat', 'Izin/Sakit', 'Alpha', 'Belum', 'Kehadiran', 'Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {siswas.map((siswa, i) => {
                  const s   = siswa.statistik_absensi || {}
                  const pct = s.persentase_kehadiran || 0
                  const pc  = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
                  return (
                    <motion.tr key={siswa.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar siswa={siswa} size={34} />
                          <div>
                            <p className="font-semibold text-xs text-slate-800 dark:text-white truncate max-w-[130px]">{siswa.nama_lengkap}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{siswa.nis}</p>
                          </div>
                        </div>
                      </td>
                      {[
                        { v: s.hadir,    c: '#10b981' },
                        { v: s.terlambat, c: '#f59e0b' },
                        { v: (s.izin||0)+(s.sakit||0), c: '#3b82f6' },
                        { v: s.alpha,    c: '#ef4444' },
                        { v: s.belum_absen, c: '#94a3b8' },
                      ].map((cell, ci) => (
                        <td key={ci} className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-9 h-7 rounded-xl text-xs font-black tabular-nums"
                            style={{ background: `${cell.c}14`, color: cell.c }}>
                            {cell.v ?? 0}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[90px]">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pc }} />
                          </div>
                          <span className="text-[10px] font-bold tabular-nums w-8 text-right" style={{ color: pc }}>{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setDetailSiswa(siswa)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all" title="Detail">
                            <Eye size={13} />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setQrSiswa(siswa)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all" title="QR Code">
                            <QrCode size={13} />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.88 }} onClick={() => handleDownloadQr(siswa)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all" title="Download QR">
                            <Download size={13} />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setFpSiswa(siswa)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all" title="Sidik Jari">
                            <Fingerprint size={13} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.from}–{pagination.to}</span> dari{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.total}</span> siswa
              </p>
              <div className="flex items-center gap-1.5">
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                  <ChevronLeft size={14} />
                </motion.button>
                <span className="px-3 h-8 flex items-center rounded-xl text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                  {page} / {pagination.last_page}
                </span>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))} disabled={page >= pagination.last_page}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                  <ChevronRight size={14} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ── Modals ─────────────────────────────────────── */}
      <AnimatePresence>
        {detailSiswa && <DetailModal siswa={detailSiswa} onClose={() => setDetailSiswa(null)} onQr={setQrSiswa} onFingerprint={setFpSiswa} />}
      </AnimatePresence>
      <AnimatePresence>
        {qrSiswa && <QrModal siswa={qrSiswa} onClose={() => setQrSiswa(null)} onReset={handleResetQr} onDownload={handleDownloadQr} />}
      </AnimatePresence>
      <AnimatePresence>
        {fpSiswa && <FingerprintModal siswa={fpSiswa} onClose={() => setFpSiswa(null)} />}
      </AnimatePresence>
    </div>
  )
}
