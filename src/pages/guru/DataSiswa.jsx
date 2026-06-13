import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, GraduationCap, Search, RefreshCw, Eye,
  Phone, MapPin, Calendar, User, Award,
  UserCheck, UserX, QrCode, Download, Fingerprint,
  CheckCircle, Clock, AlertTriangle, X, Loader,
  AlertCircle, Hash, BookOpen, FileText,
} from 'lucide-react'
import { guruApi } from '../../services/guruService'
import { confirmDelete } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'

// ─── Avatar ───────────────────────────────────────────────────
function SiswaAvatar({ siswa, size = 36 }) {
  const [err, setErr] = useState(false)
  const initial = (siswa?.nama_lengkap || 'S').charAt(0).toUpperCase()
  return (
    <div className="relative flex-shrink-0 rounded-xl overflow-hidden"
      style={{ width: size, height: size }}>
      {(siswa?.foto_url || siswa?.foto) && !err
        ? <img src={siswa.foto_url || siswa.foto} alt={siswa.nama_lengkap}
            className="w-full h-full object-cover"
            onError={() => setErr(true)} />
        : <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold"
            style={{ fontSize: Math.round(size * 0.38) }}>{initial}</div>
      }
    </div>
  )
}

// ─── Stat Badge ───────────────────────────────────────────────
function StatBadge({ value, color }) {
  const styles = {
    green:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    blue:   'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    red:    'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    slate:  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  }
  return (
    <span className={`inline-flex items-center justify-center w-9 h-6 rounded-lg text-xs font-bold tabular-nums ${styles[color]}`}>
      {value}
    </span>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────
function ProgressBar({ value, color = '#10b981' }) {
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
      <span className="text-[10px] font-bold tabular-nums text-slate-500 dark:text-slate-400 w-8 text-right">
        {value}%
      </span>
    </div>
  )
}

// ─── Modal QR ─────────────────────────────────────────────────
function QrModal({ siswa, onClose, onReset, onDownload }) {
  const [loading, setLoading] = useState(false)
  const [qrData, setQrData] = useState(null)

  useEffect(() => {
    if (!siswa) return
    setLoading(true)
    guruApi.getSiswaQr(siswa.id)
      .then(r => setQrData(r.data.data))
      .catch(() => setQrData({ qr_code_url: null }))
      .finally(() => setLoading(false))
  }, [siswa])

  if (!siswa) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }} transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
              <QrCode size={15} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">QR Code Siswa</p>
              <p className="text-[10px] text-slate-400">{siswa.nama_lengkap} · {siswa.nis}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-3 text-slate-400">
              <Loader size={24} className="animate-spin" />
              <p className="text-sm">Memuat QR Code...</p>
            </div>
          ) : qrData?.qr_code_url ? (
            <>
              <div className="flex justify-center">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                  <img src={qrData.qr_code_url} alt={`QR ${siswa.nama_lengkap}`}
                    className="w-48 h-48 object-contain" />
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => onDownload(siswa)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm">
                  <Download size={13} /> Download
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => onReset(siswa)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm">
                  <RefreshCw size={13} /> Reset QR
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <QrCode size={36} className="text-slate-300 dark:text-slate-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">QR Code belum tersedia</p>
                <p className="text-xs text-slate-400 mt-1">Klik generate untuk membuat QR Code baru</p>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => onReset(siswa)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                <RefreshCw size={14} /> Generate QR Code
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Modal Fingerprint ────────────────────────────────────────
function FingerprintModal({ siswa, onClose }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('checking') // 'checking' | object

  useEffect(() => {
    if (!siswa) return
    setStatus('checking')
    guruApi.checkSiswaFingerprint(siswa.id)
      .then(r => setStatus(r.data.data))
      .catch(() => setStatus({ terdaftar: false, userid: siswa.nis }))
  }, [siswa])

  const handleRegister = async () => {
    setLoading(true)
    try {
      const res = await guruApi.registerSiswaFingerprint(siswa.id)
      setStatus({ terdaftar: true, userid: res.data.data?.userid, uid: res.data.data?.uid })
      toast.success(res.data.data?.pesan || 'Berhasil didaftarkan')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mendaftarkan')
    } finally {
      setLoading(false)
    }
  }

  const handleUnregister = async () => {
    setLoading(true)
    try {
      await guruApi.unregisterSiswaFingerprint(siswa.id)
      setStatus({ terdaftar: false, userid: siswa.nis })
      toast.success('Sidik jari dihapus dari mesin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus')
    } finally {
      setLoading(false)
    }
  }

  if (!siswa) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }} transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header gradient */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-600 to-emerald-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Fingerprint size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Sidik Jari Siswa</p>
                <p className="text-[10px] text-white/70">Mesin fingerprint</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Info siswa */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <SiswaAvatar siswa={siswa} size={44} />
            <div className="min-w-0">
              <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{siswa.nama_lengkap}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">NIS: {siswa.nis}</p>
              <p className="text-[10px] font-mono text-teal-600 dark:text-teal-400 mt-0.5">User ID: {siswa.nis}</p>
            </div>
          </div>

          {/* Status */}
          {status === 'checking' ? (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
              <Loader size={16} className="animate-spin" />
              <span className="text-sm">Mengecek status mesin...</span>
            </div>
          ) : status?.terdaftar ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Sudah Terdaftar di Mesin</p>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">UID: <span className="font-mono font-bold">{status.uid}</span></p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Siswa sudah bisa absen fingerprint. Hapus untuk daftar ulang.</p>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={15} className="text-amber-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Belum Terdaftar</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daftarkan siswa, lalu arahkan ke mesin fingerprint untuk scan jari.</p>
            </div>
          )}

          {/* Panduan */}
          <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800/50 space-y-1">
            <p className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Cara Daftar</p>
            {['1. Klik "Daftarkan ke Mesin"', '2. Siswa datang ke mesin fingerprint', '3. Ikuti instruksi scan jari (1-10)', '4. Absensi fingerprint langsung aktif'].map((s, i) => (
              <p key={i} className="text-[10px] text-teal-700/80 dark:text-teal-400/80">{s}</p>
            ))}
          </div>

          {/* Aksi */}
          <div className="flex gap-2 pt-1">
            {status !== 'checking' && !status?.terdaftar && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleRegister} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50">
                {loading ? <Loader size={14} className="animate-spin" /> : <Fingerprint size={14} />}
                {loading ? 'Mendaftarkan...' : 'Daftarkan ke Mesin'}
              </motion.button>
            )}
            {status?.terdaftar && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleUnregister} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50">
                {loading ? <Loader size={14} className="animate-spin" /> : <X size={14} />}
                {loading ? 'Menghapus...' : 'Hapus dari Mesin'}
              </motion.button>
            )}
            <button onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-colors border border-slate-200 dark:border-slate-700">
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Modal Detail ─────────────────────────────────────────────
function DetailModal({ siswa, onClose, onQr, onFingerprint }) {
  if (!siswa) return null
  const s = siswa.statistik_absensi || {}
  const pct = s.persentase_kehadiran || 0
  const pctColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-[28px] sm:rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Drag handle mobile */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-9 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <SiswaAvatar siswa={siswa} size={40} />
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{siswa.nama_lengkap}</p>
              <p className="text-[10px] text-slate-400">{siswa.kelas?.nama_kelas || '-'} · NIS {siswa.nis}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh] p-5 space-y-4">
          {/* Quick actions */}
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { onClose(); onQr(siswa) }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-semibold border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors">
              <QrCode size={13} /> QR Code
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { onClose(); onFingerprint(siswa) }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors">
              <Fingerprint size={13} /> Sidik Jari
            </motion.button>
          </div>

          {/* Kehadiran bar */}
          {s.total_hari_kerja > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Kehadiran Bulan Ini</p>
                <span className="text-sm font-black tabular-nums" style={{ color: pctColor }}>{pct}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ background: pctColor }} />
              </div>
              <div className="grid grid-cols-5 gap-2 mt-3">
                {[
                  { label: 'Hadir',     val: s.hadir,     c: '#10b981' },
                  { label: 'Terlambat', val: s.terlambat, c: '#f59e0b' },
                  { label: 'Izin/Sakit',val: (s.izin||0)+(s.sakit||0), c: '#3b82f6' },
                  { label: 'Alpha',     val: s.alpha,     c: '#ef4444' },
                  { label: 'Blm Absen', val: s.belum_absen, c: '#94a3b8' },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <p className="text-base font-black tabular-nums" style={{ color: item.c }}>{item.val ?? 0}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Hash,     label: 'NIS',    val: siswa.nis },
              { icon: Hash,     label: 'NISN',   val: siswa.nisn || '-' },
              { icon: User,     label: 'JK',     val: siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' },
              { icon: Calendar, label: 'Lahir',  val: siswa.tanggal_lahir ? new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '-' },
              { icon: Phone,    label: 'HP',     val: siswa.no_hp || '-', span: 1 },
              { icon: User,     label: 'Ortu',   val: siswa.nama_ortu || '-', span: 1 },
            ].map((item, i) => (
              <div key={i} className={`p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 ${item.span === 2 ? 'col-span-2' : ''}`}>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <item.icon size={9} />{item.label}
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{item.val}</p>
              </div>
            ))}
            {siswa.alamat && (
              <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={9} />Alamat
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-white">{siswa.alamat}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function DataSiswa() {
  const [siswas, setSiswas]           = useState([])
  const [loading, setLoading]         = useState(false)
  const [pagination, setPagination]   = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [kelasInfo, setKelasInfo]     = useState(null)
  const [stats, setStats]             = useState({ total: 0, laki_laki: 0, perempuan: 0 })
  const debounceRef = useRef(null)

  // Modals
  const [detailSiswa, setDetailSiswa]       = useState(null)
  const [qrSiswa, setQrSiswa]               = useState(null)
  const [fingerprintSiswa, setFingerprintSiswa] = useState(null)

  useEffect(() => { fetchSiswas(); fetchStats() }, [currentPage, search])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setSearch(searchInput); setCurrentPage(1) }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [searchInput])

  const fetchStats = async () => {
    try {
      const r = await guruApi.getSiswaStats()
      setStats(r.data.data)
      setKelasInfo(r.data.data.kelas_info)
    } catch {}
  }

  const fetchSiswas = async () => {
    try {
      setLoading(true)
      const r = await guruApi.getSiswas({ page: currentPage, search, per_page: 15 })
      const d = r.data?.data
      setSiswas(Array.isArray(d?.data) ? d.data : [])
      setPagination(d?.pagination || null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat data siswa')
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
      // Tutup QR modal dan reload
      setQrSiswa(null)
      fetchSiswas()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal reset QR')
    }
  }

  const handleDownloadQr = async (siswa) => {
    try {
      const r = await guruApi.downloadSiswaQr(siswa.id)
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'image/png' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `QR-${siswa.nis || siswa.id}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('QR Code diunduh')
    } catch {
      toast.error('Gagal mengunduh QR Code')
    }
  }

  // ─── Stat Cards ──────────────────────────────────────────────
  const statCards = [
    { label: 'Total Siswa', val: stats.total,     icon: Users,     color: 'teal' },
    { label: 'Laki-laki',   val: stats.laki_laki, icon: UserCheck, color: 'blue' },
    { label: 'Perempuan',   val: stats.perempuan, icon: UserX,     color: 'pink' },
  ]
  const cardColors = {
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-800/40' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800/40' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-100 dark:border-pink-800/40' },
  }

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
            <GraduationCap size={17} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-white">Data Siswa</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {kelasInfo ? `Kelas ${kelasInfo.nama_kelas}` : 'Kelas yang diampu'}
              {pagination?.total ? ` · ${pagination.total} siswa` : ''}
            </p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => { fetchSiswas(); fetchStats() }} disabled={loading}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </motion.div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((s, i) => {
          const c = cardColors[s.color]
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border ${c.border} shadow-sm`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{s.val}</p>
                </div>
                <div className={`p-2 rounded-xl ${c.bg}`}>
                  <s.icon size={16} className={c.text} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Search + Table ─────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari nama, NIS, atau NISN..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {['Siswa', 'Hadir', 'Terlambat', 'Izin/Sakit', 'Alpha', 'Kehadiran', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader size={24} className="animate-spin" />
                      <p className="text-sm">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : siswas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <GraduationCap size={26} className="opacity-30" />
                      </div>
                      <p className="text-sm font-medium">Tidak ada data siswa</p>
                    </div>
                  </td>
                </tr>
              ) : (
                siswas.map((siswa, i) => {
                  const s = siswa.statistik_absensi || {}
                  const pct = s.persentase_kehadiran || 0
                  const pctColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
                  return (
                    <motion.tr key={siswa.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">

                      {/* Siswa */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SiswaAvatar siswa={siswa} size={34} />
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-slate-800 dark:text-white truncate max-w-[120px]">{siswa.nama_lengkap}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{siswa.nis}</p>
                          </div>
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="px-4 py-3"><StatBadge value={s.hadir ?? 0} color="green" /></td>
                      <td className="px-4 py-3"><StatBadge value={s.terlambat ?? 0} color="yellow" /></td>
                      <td className="px-4 py-3"><StatBadge value={(s.izin??0)+(s.sakit??0)} color="blue" /></td>
                      <td className="px-4 py-3"><StatBadge value={s.alpha ?? 0} color="red" /></td>

                      {/* Progress */}
                      <td className="px-4 py-3">
                        <ProgressBar value={pct} color={pctColor} />
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setDetailSiswa(siswa)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all" title="Detail">
                            <Eye size={13} />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setQrSiswa(siswa)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all" title="QR Code">
                            <QrCode size={13} />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.88 }} onClick={() => handleDownloadQr(siswa)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all hidden sm:block" title="Download QR">
                            <Download size={13} />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setFingerprintSiswa(siswa)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all" title="Sidik Jari">
                            <Fingerprint size={13} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              {pagination.from}–{pagination.to} dari {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                ← Prev
              </button>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30">
                {currentPage} / {pagination.last_page}
              </span>
              <button onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))} disabled={currentPage >= pagination.last_page}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Modals ─────────────────────────────────────────── */}
      <AnimatePresence>
        {detailSiswa && (
          <DetailModal siswa={detailSiswa} onClose={() => setDetailSiswa(null)}
            onQr={setQrSiswa} onFingerprint={setFingerprintSiswa} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {qrSiswa && (
          <QrModal siswa={qrSiswa} onClose={() => setQrSiswa(null)}
            onReset={handleResetQr} onDownload={handleDownloadQr} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fingerprintSiswa && (
          <FingerprintModal siswa={fingerprintSiswa} onClose={() => setFingerprintSiswa(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
