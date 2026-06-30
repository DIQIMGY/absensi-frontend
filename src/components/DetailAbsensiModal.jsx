/**
 * DetailAbsensiModal
 * Modal detail absensi per siswa atau guru — responsif mobile/tablet/desktop
 * Filter: date range | bulan + tahun
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Calendar, ChevronLeft, ChevronRight,
  CheckCircle, Clock, FileText, AlertCircle, XCircle,
  User, BookOpen, Hash, GraduationCap,
  CalendarDays, LayoutList, RefreshCw, SlidersHorizontal,
} from 'lucide-react'
import { adminApi } from '../services/adminService'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

/* ─── konstanta ─── */
const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]

const STATUS_CFG = {
  hadir:     { label:'Hadir',     bg:'bg-emerald-100 dark:bg-emerald-900/30', text:'text-emerald-700 dark:text-emerald-300', dot:'bg-emerald-500', Icon: CheckCircle },
  terlambat: { label:'Terlambat', bg:'bg-amber-100 dark:bg-amber-900/30',     text:'text-amber-700 dark:text-amber-300',     dot:'bg-amber-500',   Icon: Clock },
  izin:      { label:'Izin',      bg:'bg-blue-100 dark:bg-blue-900/30',       text:'text-blue-700 dark:text-blue-300',       dot:'bg-blue-500',    Icon: FileText },
  sakit:     { label:'Sakit',     bg:'bg-purple-100 dark:bg-purple-900/30',   text:'text-purple-700 dark:text-purple-300',   dot:'bg-purple-500',  Icon: AlertCircle },
  alpha:     { label:'Alpha',     bg:'bg-rose-100 dark:bg-rose-900/30',       text:'text-rose-700 dark:text-rose-300',       dot:'bg-rose-500',    Icon: XCircle },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.alpha
  const { Icon } = cfg
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  )
}

/* ─── stat mini card ─── */
function StatMini({ label, value, color }) {
  const colors = {
    slate:   'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    amber:   'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    blue:    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    purple:  'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    rose:    'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
  }
  return (
    <div className={`rounded-xl border p-3 text-center ${colors[color]}`}>
      <p className="text-xl font-black leading-none">{value}</p>
      <p className="text-[10px] font-medium mt-1 opacity-80">{label}</p>
    </div>
  )
}

/* ─── Main component ─── */
export default function DetailAbsensiModal({ isOpen, onClose, type = 'siswa', id, nama }) {
  const isSiswa = type === 'siswa'

  /* filter state */
  const [filterMode, setFilterMode] = useState('bulan')           // 'bulan' | 'range'
  const [bulan, setBulan]           = useState(new Date().getMonth() + 1)
  const [tahun, setTahun]           = useState(new Date().getFullYear())
  const [startDate, setStartDate]   = useState(new Date(new Date().setDate(1)))
  const [endDate, setEndDate]       = useState(new Date())

  /* data state */
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  /* Escape key & scroll lock */
  useEffect(() => {
    if (!isOpen) return
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', fn)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  /* fetch saat modal dibuka atau filter berubah */
  const fetchDetail = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const params = { mode: filterMode }
      if (filterMode === 'range') {
        params.start_date = startDate.toISOString().split('T')[0]
        params.end_date   = endDate.toISOString().split('T')[0]
      } else {
        params.bulan = bulan
        params.tahun = tahun
      }
      const res = isSiswa
        ? await adminApi.getLaporanPerSiswa(id, params)
        : await adminApi.getLaporanDetailGuru(id, params)
      setData(res.data.data)
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [id, isSiswa, filterMode, bulan, tahun, startDate, endDate])

  useEffect(() => { if (isOpen && id) fetchDetail() }, [isOpen, id, fetchDetail])

  /* navigasi bulan */
  const prevMonth = () => {
    if (bulan === 1) { setBulan(12); setTahun(y => y - 1) }
    else setBulan(b => b - 1)
  }
  const nextMonth = () => {
    if (bulan === 12) { setBulan(1); setTahun(y => y + 1) }
    else setBulan(b => b + 1)
  }

  const person  = data?.siswa ?? data?.guru
  const records = data?.records ?? []
  const stat    = data?.statistik ?? {}

  const periodLabel = filterMode === 'range'
    ? `${startDate.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})} – ${endDate.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}`
    : `${MONTHS[bulan-1]} ${tahun}`

  const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 4 + i)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}>

          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Panel — bottom sheet di mobile, centered di desktop */}
          <motion.div
            className="relative flex flex-col bg-white dark:bg-slate-900 w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 z-10 max-h-[92dvh] sm:max-h-[88vh]"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={e => e.stopPropagation()}>

            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>

            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 py-3 sm:px-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              {/* Avatar */}
              {person?.foto ? (
                <img src={person.foto} alt={person.nama}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0" />
              ) : (
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${isSiswa ? 'bg-gradient-to-br from-teal-400 to-teal-600' : 'bg-gradient-to-br from-indigo-400 to-indigo-600'}`}>
                  {(person?.nama ?? nama ?? 'X')[0].toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {person?.nama ?? nama ?? '—'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {isSiswa ? (
                    <>
                      <span className="flex items-center gap-1 text-xs text-slate-500"><Hash size={10}/>{person?.nis ?? '-'}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500"><GraduationCap size={10}/>{person?.kelas ?? '-'}</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1 text-xs text-slate-500"><Hash size={10}/>{person?.nip ?? '-'}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500"><BookOpen size={10}/>{person?.mata_pelajaran ?? '-'}</span>
                    </>
                  )}
                </div>
              </div>

              <button onClick={onClose}
                className="flex-shrink-0 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* ── Filter Bar ── */}
            <div className="px-4 py-3 sm:px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex-shrink-0 space-y-3">

              {/* Mode toggle */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={13} className="text-slate-400 flex-shrink-0" />
                <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 gap-0.5">
                  {[
                    { key: 'bulan', icon: Calendar,    label: 'Bulan' },
                    { key: 'range', icon: CalendarDays, label: 'Rentang' },
                  ].map(({ key, icon: Icon, label }) => (
                    <button key={key} onClick={() => setFilterMode(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterMode === key ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                      <Icon size={12} /> {label}
                    </button>
                  ))}
                </div>
                <button onClick={fetchDetail} disabled={loading}
                  className="ml-auto p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0">
                  <RefreshCw size={13} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Filter controls */}
              {filterMode === 'bulan' ? (
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
                    <ChevronLeft size={14} className="text-slate-500" />
                  </button>
                  <div className="flex-1 flex items-center gap-2">
                    <select value={bulan} onChange={e => setBulan(+e.target.value)}
                      className="flex-1 py-1.5 px-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                      {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                    </select>
                    <select value={tahun} onChange={e => setTahun(+e.target.value)}
                      className="w-20 py-1.5 px-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <button onClick={nextMonth}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
                    <ChevronRight size={14} className="text-slate-500" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] font-medium text-slate-500 mb-1">Dari</p>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={11} />
                      <DatePicker selected={startDate} onChange={d => setStartDate(d)}
                        className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        dateFormat="dd/MM/yy" maxDate={endDate} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-500 mb-1">Sampai</p>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={11} />
                      <DatePicker selected={endDate} onChange={d => setEndDate(d)}
                        className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        dateFormat="dd/MM/yy" minDate={startDate} maxDate={new Date()} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Stat strip ── */}
            {data && !loading && (
              <div className={`grid gap-2 px-4 py-3 sm:px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 flex-shrink-0 ${isSiswa ? 'grid-cols-6' : 'grid-cols-4'}`}>
                <StatMini label="Total" value={stat.total ?? 0} color="slate" />
                <StatMini label="Hadir" value={stat.hadir ?? 0} color="emerald" />
                <StatMini label="Telat" value={stat.terlambat ?? 0} color="amber" />
                {isSiswa && <StatMini label="Izin" value={stat.izin ?? 0} color="blue" />}
                {isSiswa && <StatMini label="Sakit" value={stat.sakit ?? 0} color="purple" />}
                <StatMini label="Alpha" value={stat.alpha ?? 0} color="rose" />
              </div>
            )}

            {/* ── Records List ── */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="relative w-12 h-12">
                    <div className={`absolute inset-0 rounded-xl flex items-center justify-center ${isSiswa ? 'bg-teal-100 dark:bg-teal-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                      <LayoutList size={20} className={isSiswa ? 'text-teal-500' : 'text-indigo-500'} />
                    </div>
                    <div className={`absolute -inset-1 rounded-xl border-2 border-t-transparent animate-spin ${isSiswa ? 'border-teal-400/60' : 'border-indigo-400/60'}`} />
                  </div>
                  <p className="text-sm text-slate-500">Memuat data absensi...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <XCircle size={22} className="text-rose-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Gagal memuat data</p>
                  <p className="text-xs text-slate-400">{error}</p>
                  <button onClick={fetchDetail}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-medium transition-colors">
                    <RefreshCw size={12} /> Coba Lagi
                  </button>
                </div>
              ) : records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <CalendarDays size={22} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tidak ada data</p>
                  <p className="text-xs text-slate-400">Belum ada absensi pada {periodLabel}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Period label */}
                  <div className="px-4 sm:px-5 py-2 bg-slate-50 dark:bg-slate-800/40">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {periodLabel} &mdash; {records.length} hari
                    </p>
                  </div>

                  {records.map((rec, i) => {
                    const cfg = STATUS_CFG[rec.status] || STATUS_CFG.alpha
                    return (
                      <div key={rec.id ?? i}
                        className="flex items-start gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">

                        {/* Status dot */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 ${cfg.dot}`} />
                          {i < records.length - 1 && (
                            <div className="w-px flex-1 bg-slate-100 dark:bg-slate-800 min-h-[16px]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                                {rec.tanggal_label}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{rec.hari}</p>
                            </div>
                            <StatusBadge status={rec.status} />
                          </div>

                          {/* Detail row */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                            {rec.jam_masuk && (
                              <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                                <Clock size={10} className="text-teal-500" />
                                Masuk: <strong className="text-slate-700 dark:text-slate-300">{rec.jam_masuk}</strong>
                              </span>
                            )}
                            {rec.jam_pulang && (
                              <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                                <Clock size={10} className="text-slate-400" />
                                Pulang: <strong className="text-slate-700 dark:text-slate-300">{rec.jam_pulang}</strong>
                              </span>
                            )}
                            {rec.menit_keterlambatan > 0 && (
                              <span className="text-[10px] text-amber-600 font-medium">
                                +{rec.menit_keterlambatan} mnt telat
                              </span>
                            )}
                            {rec.metode && rec.metode !== '-' && (
                              <span className="text-[10px] text-slate-400 capitalize">{rec.metode.replace('_', ' ')}</span>
                            )}
                            {rec.keterangan && rec.keterangan !== '-' && (
                              <span className="text-[10px] text-slate-500 italic truncate max-w-[200px]">&ldquo;{rec.keterangan}&rdquo;</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-3 sm:px-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex-shrink-0 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                {data ? `${records.length} record • ${periodLabel}` : 'Detail Absensi'}
              </p>
              <button onClick={onClose}
                className="px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                Tutup
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
