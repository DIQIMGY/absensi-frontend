import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Users, TrendingUp, TrendingDown, Minus,
  FileSpreadsheet, RefreshCw, Calendar, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Search, BarChart3, Timer,
  Building2, BookOpen, Heart, Star, CalendarRange,
} from 'lucide-react'
import { adminApi } from '../../services/adminService'
import toast from 'react-hot-toast'

// ── Helpers ───────────────────────────────────────────────────────────
// Format menit → "2j 30m" atau "45m" — simple, tidak pakai desimal
const mntToJam = (m) => {
  const abs = Math.round(Math.abs(m))
  const j = Math.floor(abs / 60)
  const s = abs % 60
  if (j === 0) return `${s}m`
  if (s === 0) return `${j}j`
  return `${j}j ${s}m`
}

// Format jam desimal → "2j 30m"
const jamToStr = (jam) => {
  const totalMenit = Math.round(Number(jam || 0) * 60)
  const j = Math.floor(totalMenit / 60)
  const m = totalMenit % 60
  if (j === 0) return `${m}m`
  if (m === 0) return `${j}j`
  return `${j}j ${m}m`
}

const BULAN_LIST = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]
const TAHUN_LIST = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)

// ── StatusBadge Siswa — warna indigo/violet ───────────────────────────
function StatusBadge({ status, selisihMenit }) {
  const selisihStr = mntToJam(Math.abs(selisihMenit))
  if (status === 'lebih') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
      <TrendingUp size={10} /> LEBIH +{selisihStr}
    </span>
  )
  if (status === 'kurang') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
      <TrendingDown size={10} /> KURANG -{selisihStr}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
      <Minus size={10} /> TEPAT
    </span>
  )
}

// ── MiniBar ───────────────────────────────────────────────────────────
function MiniBar({ persen }) {
  const pct   = Math.min(persen, 100)
  const color = pct >= 90 ? 'bg-violet-500' : pct >= 70 ? 'bg-amber-400' : 'bg-rose-500'
  return (
    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── SiswaAvatar ───────────────────────────────────────────────────────
function SiswaAvatar({ item }) {
  const [imgErr, setImgErr] = useState(false)
  if (item.foto_url && !imgErr) {
    return (
      <img src={item.foto_url} alt={item.nama_lengkap} onError={() => setImgErr(true)}
        className="w-9 h-9 flex-shrink-0 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm" />
    )
  }
  return (
    <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
      {(item.nama_lengkap || '?')[0].toUpperCase()}
    </div>
  )
}

// ── DetailRow ─────────────────────────────────────────────────────────
function DetailRow({ detail }) {
  const statusColor = {
    hadir:    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    terlambat:'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    alpha:    'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
    izin:     'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    sakit:    'text-slate-500 bg-slate-100 dark:bg-slate-800',
  }
  const parts    = (detail.tanggal || '').split('-')
  const tgl      = parts.length === 3 ? new Date(+parts[0], +parts[1]-1, +parts[2]) : new Date()
  const namaHari = tgl.toLocaleDateString('id-ID', { weekday: 'short' })
  const tglFmt   = tgl.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
  const selisih  = detail.selisih_hari ?? 0
  const sign     = selisih > 0 ? '+' : ''

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="py-1.5 px-2 text-[10px] text-slate-500 whitespace-nowrap">{namaHari}, {tglFmt}</td>
      <td className="py-1.5 px-2 text-center">
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${statusColor[detail.status] ?? statusColor.alpha}`}>
          {(detail.status || 'alpha').toUpperCase()}
        </span>
      </td>
      <td className="py-1.5 px-2 text-[10px] text-center font-mono text-slate-700 dark:text-slate-300">{detail.jam_masuk ?? '-'}</td>
      <td className="py-1.5 px-2 text-[10px] text-center font-mono text-slate-700 dark:text-slate-300">{detail.jam_pulang ?? '-'}</td>
      <td className="py-1.5 px-2 text-[10px] text-center font-mono text-slate-600 dark:text-slate-400">
        {detail.menit_aktual > 0 ? mntToJam(detail.menit_aktual) : '-'}
      </td>
      <td className={`py-1.5 px-2 text-[10px] text-center font-bold font-mono ${selisih > 0 ? 'text-violet-600' : selisih < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
        {sign}{mntToJam(selisih)}
      </td>
      {detail.menit_keterlambatan > 0 && (
        <td className="py-1.5 px-2 text-[9px] text-center text-amber-600 dark:text-amber-400">
          +{detail.menit_keterlambatan}m telat
        </td>
      )}
    </tr>
  )
}

// ── SiswaCard ─────────────────────────────────────────────────────────
function SiswaCard({ item, idx }) {
  const [open, setOpen] = useState(false)
  const persen = item.persen_kehadiran ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.025 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
    >
      {/* Row utama */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3">
        {/* Nomor */}
        <div className="w-7 h-7 flex-shrink-0 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
          {idx + 1}
        </div>

        {/* Foto */}
        <SiswaAvatar item={item} />

        {/* Info siswa */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.nama_lengkap}</p>
            <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[9px] font-semibold rounded-full flex-shrink-0">
              {item.kelas}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.nis} · {item.jurusan}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <MiniBar persen={persen} />
            <span className="text-[9px] font-semibold text-slate-500 flex-shrink-0">{persen}%</span>
          </div>
        </div>

        {/* Stats ringkas — hidden xs */}
        <div className="hidden sm:flex items-center gap-3 lg:gap-4 text-center flex-shrink-0">
          {[
            { label:'Hadir', val: item.total_hadir, color:'text-emerald-600' },
            { label:'Telat', val: item.total_terlambat, color:'text-amber-500' },
            { label:'Alpha', val: item.total_alpha, color:'text-rose-500' },
            { label:'Izin/Sakit', val: (item.total_izin ?? 0) + (item.total_sakit ?? 0), color:'text-blue-500' },
            { label:'Aktual', val: jamToStr(item.jam_aktual), color:'text-slate-700 dark:text-white font-mono' },
            { label:'Wajib', val: jamToStr(item.jam_wajib), color:'text-slate-400 font-mono' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-[9px] text-slate-400">{s.label}</p>
              <p className={`text-xs sm:text-sm font-bold ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Badge status */}
        <div className="flex-shrink-0 ml-1">
          <StatusBadge status={item.status_rekap} selisihMenit={item.selisih_menit} />
        </div>

        {/* Toggle */}
        <button onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
          {open
            ? <ChevronUp size={14} className="text-slate-400" />
            : <ChevronDown size={14} className="text-slate-400" />}
        </button>
      </div>

      {/* Stats mobile */}
      <div className="sm:hidden flex items-center gap-2 px-3 pb-2 text-center border-t border-slate-100 dark:border-slate-700/50 pt-2">
        {[
          { label:'Hadir', val: item.total_hadir, color:'text-emerald-600' },
          { label:'Telat', val: item.total_terlambat, color:'text-amber-500' },
          { label:'Alpha', val: item.total_alpha, color:'text-rose-500' },
          { label:'Izin/Skt', val: (item.total_izin??0)+(item.total_sakit??0), color:'text-blue-500' },
          { label:'Aktual', val: jamToStr(item.jam_aktual), color:'text-slate-700 dark:text-white' },
          { label:'Wajib', val: jamToStr(item.jam_wajib), color:'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="flex-1">
            <p className="text-[8px] text-slate-400">{s.label}</p>
            <p className={`text-[10px] font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Detail harian (expand) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200 dark:border-slate-700"
          >
            <div className="p-3 bg-slate-50/80 dark:bg-slate-900/30">
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Detail Harian — {item.nama_lengkap}
              </p>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full min-w-[520px] text-xs">
                  <thead>
                    <tr className="bg-indigo-50 dark:bg-indigo-900/20">
                      {['Tanggal','Status','Masuk','Pulang','Jam Kerja','Selisih'].map(h => (
                        <th key={h} className="py-1.5 px-2 text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(item.detail_harian || []).map((d, i) => <DetailRow key={i} detail={d} />)}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function LaporanLemburSiswa() {
  const today = new Date()

  const [bulan, setBulan]           = useState(today.getMonth() + 1)
  const [tahun, setTahun]           = useState(today.getFullYear())
  const [kelasId, setKelasId]       = useState('')
  const [kelasList, setKelasList]   = useState([])
  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(false)
  const [exporting, setExporting]   = useState(false)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilter]   = useState('semua')
  const [sortBy, setSortBy]         = useState('nama')
  // Date range
  const [useRange, setUseRange]             = useState(false)
  const [tanggalMulai, setTanggalMulai]     = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')

  // Muat daftar kelas sekali saat mount
  useEffect(() => {
    adminApi.getAllKelas().then(r => {
      setKelasList(r.data.data || [])
    }).catch(() => {})
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { bulan, tahun }
      if (kelasId) params.kelas_id = kelasId
      if (useRange && tanggalMulai && tanggalSelesai) {
        params.tanggal_mulai   = tanggalMulai
        params.tanggal_selesai = tanggalSelesai
      }
      const res = await adminApi.getLaporanRekapSiswa(params)
      setData(res.data.data)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [bulan, tahun, kelasId, useRange, tanggalMulai, tanggalSelesai])

  useEffect(() => { loadData() }, [loadData])

  const handleApplyRange = () => {
    if (useRange && (!tanggalMulai || !tanggalSelesai)) {
      toast.error('Isi tanggal mulai dan selesai terlebih dahulu')
      return
    }
    loadData()
  }

  const periodeLabel = useRange && tanggalMulai && tanggalSelesai
    ? `${tanggalMulai} – ${tanggalSelesai}`
    : `${BULAN_LIST[bulan - 1]} ${tahun}`

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = { bulan, tahun }
      if (kelasId) params.kelas_id = kelasId
      if (useRange && tanggalMulai && tanggalSelesai) {
        params.tanggal_mulai   = tanggalMulai
        params.tanggal_selesai = tanggalSelesai
      }
      const res  = await adminApi.exportRekapSiswaExcel(params)
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `Laporan-Kehadiran-Siswa-${periodeLabel}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Excel berhasil diunduh!')
    } catch {
      toast.error('Gagal export Excel')
    } finally {
      setExporting(false)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────
  const rawData   = data?.data ?? []
  const ringkasan = data?.ringkasan_bulan ?? {}
  const peng      = data?.pengaturan ?? {}
  const namaBulan = data?.nama_bulan ?? ''

  const filtered = rawData
    .filter(d => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        d.nama_lengkap?.toLowerCase().includes(q) ||
        d.nis?.toLowerCase().includes(q) ||
        d.kelas?.toLowerCase().includes(q) ||
        d.jurusan?.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'semua' || d.status_rekap === filterStatus
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (sortBy === 'jam_aktual')    return b.jam_aktual - a.jam_aktual
      if (sortBy === 'selisih_jam')   return b.selisih_menit - a.selisih_menit
      if (sortBy === 'persen')        return b.persen_kehadiran - a.persen_kehadiran
      if (sortBy === 'kelas')         return (a.kelas || '').localeCompare(b.kelas || '')
      return (a.nama_lengkap || '').localeCompare(b.nama_lengkap || '')
    })

  const stats = {
    total:          rawData.length,
    lebih:          rawData.filter(d => d.status_rekap === 'lebih').length,
    kurang:         rawData.filter(d => d.status_rekap === 'kurang').length,
    tepat:          rawData.filter(d => d.status_rekap === 'tepat').length,
    totalJamWajib:  rawData.reduce((s, d) => s + (d.jam_wajib  || 0), 0),
    totalJamAktual: rawData.reduce((s, d) => s + (d.jam_aktual || 0), 0),
    rataHadir:      rawData.length > 0
      ? (rawData.reduce((s, d) => s + (d.persen_kehadiran || 0), 0) / rawData.length).toFixed(1)
      : '0',
  }
  const selisihTotal = stats.totalJamAktual - stats.totalJamWajib

  return (
    <div className="w-full space-y-4 sm:space-y-5 px-1 sm:px-0">

      {/* ── HEADER ────────────────────────────────────────────── */}
      <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Laporan Rekap Kehadiran Siswa
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rekap jam hadir efektif vs jam wajib per bulan — berdasarkan pengaturan sekolah
            </p>
          </div>
        </div>
        <button onClick={handleExport} disabled={exporting || !data || rawData.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {exporting
            ? <><RefreshCw size={14} className="animate-spin" /> Exporting...</>
            : <><FileSpreadsheet size={14} /> Export Excel</>}
        </button>
      </motion.div>

      {/* ── FILTER ────────────────────────────────────────────── */}
      <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 sm:p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              <Calendar size={10} className="inline mr-1" />Bulan
            </label>
            <select value={bulan} onChange={e => { setBulan(+e.target.value); setUseRange(false) }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
              {BULAN_LIST.map((b, i) => <option key={i} value={i+1}>{b}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[90px]">
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Tahun</label>
            <select value={tahun} onChange={e => { setTahun(+e.target.value); setUseRange(false) }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
              {TAHUN_LIST.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              <BookOpen size={10} className="inline mr-1" />Kelas
            </label>
            <select value={kelasId} onChange={e => setKelasId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
              <option value="">Semua Kelas</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
            </select>
          </div>
          <button onClick={loadData} disabled={loading}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-500/30 disabled:opacity-50">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Tampilkan
          </button>
        </div>

        {/* ── Date Range Toggle ───────────────────────────────── */}
        <div className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button onClick={() => setUseRange(!useRange)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              useRange
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500'
            }`}>
            <CalendarRange size={12} />
            {useRange ? 'Pakai Date Range ✓' : 'Pakai Date Range'}
          </button>

          {useRange && (
            <>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Dari Tanggal</label>
                <input type="date" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Sampai Tanggal</label>
                <input type="date" value={tanggalSelesai} onChange={e => setTanggalSelesai(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>
              <button onClick={handleApplyRange}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all">
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                Tampilkan
              </button>
            </>
          )}
        </div>

        {/* Pill aktif filter */}
        {useRange && tanggalMulai && tanggalSelesai && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-semibold">
              <CalendarRange size={9} /> {tanggalMulai} – {tanggalSelesai}
              <button onClick={() => { setUseRange(false); setTanggalMulai(''); setTanggalSelesai('') }} className="ml-0.5 hover:text-indigo-900">×</button>
            </span>
            <span className="text-[10px] text-slate-400 self-center">
              · Hari libur & non-hari-aktif tidak dihitung otomatis
            </span>
          </div>
        )}
      </motion.div>

      {/* ── INFO BOX PENGATURAN ──────────────────────────────── */}
      {data && (
        <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
              Pengaturan Jam Sekolah — {namaBulan}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { label:'Jam Masuk',       val: peng.jam_masuk || '-',           icon:'🕐' },
              { label:'Jam Pulang',      val: peng.jam_pulang || '-',          icon:'🕓' },
              { label:'Jam/Hari',        val: jamToStr(peng.jam_per_hari),     icon:'⏱️' },
              { label:'Jam Wajib/Bulan', val: jamToStr(ringkasan.jam_wajib),   icon:'📋' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-indigo-100 dark:border-indigo-900/40">
                <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-medium">{s.icon} {s.label}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{s.val}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2 items-center">
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">📅 Hari Aktif:</span>
            {(peng.hari_aktif || []).map(h => (
              <span key={h} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[9px] font-semibold rounded-full">{h}</span>
            ))}
            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">
              · Efektif: <strong className="text-slate-700 dark:text-slate-200">{ringkasan.total_hari_aktif} hari</strong>
              {ringkasan.total_hari_libur > 0 && (
                <> · Libur: <strong className="text-rose-600">{ringkasan.total_hari_libur} hari</strong></>
              )}
            </span>
          </div>
        </motion.div>
      )}

      {/* ── STAT CARDS ────────────────────────────────────────── */}
      {data && (
        <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          {[
            { label:'Total Siswa', val: stats.total, icon: Users,
              color:'from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800',
              text:'text-slate-700 dark:text-slate-200', border:'border-slate-200 dark:border-slate-700' },
            { label:'Jam Lebih', val: stats.lebih, icon: TrendingUp,
              color:'from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30',
              text:'text-violet-700 dark:text-violet-300', border:'border-violet-200 dark:border-violet-800' },
            { label:'Jam Kurang', val: stats.kurang, icon: TrendingDown,
              color:'from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30',
              text:'text-rose-700 dark:text-rose-300', border:'border-rose-200 dark:border-rose-800' },
            { label:'Tepat', val: stats.tepat, icon: CheckCircle,
              color:'from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30',
              text:'text-blue-700 dark:text-blue-300', border:'border-blue-200 dark:border-blue-800' },
            { label:'Rata² Hadir', val: stats.rataHadir + '%', icon: Star,
              color:'from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30',
              text:'text-amber-700 dark:text-amber-300', border:'border-amber-200 dark:border-amber-800' },
            { label:'Total Jam Wajib', val: jamToStr(stats.totalJamWajib), icon: Timer,
              color:'from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30',
              text:'text-indigo-700 dark:text-indigo-300', border:'border-indigo-200 dark:border-indigo-800' },
            { label:'Total Jam Aktual', val: jamToStr(stats.totalJamAktual), icon: BarChart3,
              color: selisihTotal >= 0
                ? 'from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30'
                : 'from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30',
              text: selisihTotal >= 0 ? 'text-violet-700 dark:text-violet-300' : 'text-rose-700 dark:text-rose-300',
              border: selisihTotal >= 0 ? 'border-violet-200 dark:border-violet-800' : 'border-rose-200 dark:border-rose-800',
              sub: selisihTotal >= 0
                ? `+${jamToStr(selisihTotal)} lebih`
                : `${jamToStr(Math.abs(selisihTotal))} kurang`,
            },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-xl p-3 sm:p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">{s.label}</p>
                <s.icon size={13} className={s.text} />
              </div>
              <p className={`text-lg sm:text-xl font-black ${s.text}`}>{s.val}</p>
              {s.sub && <p className={`text-[9px] font-medium mt-0.5 ${s.text} opacity-80`}>{s.sub}</p>}
            </div>
          ))}
        </motion.div>
      )}

      {/* ── SEARCH + FILTER + SORT ─────────────────────────────── */}
      {data && rawData.length > 0 && (
        <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
          className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari nama, NIS, kelas, jurusan..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { val:'semua',  label:'Semua',  color:'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
              { val:'lebih',  label:'Lebih',  color:'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300' },
              { val:'kurang', label:'Kurang', color:'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300' },
              { val:'tepat',  label:'Tepat',  color:'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
            ].map(f => (
              <button key={f.val} onClick={() => setFilter(f.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === f.val
                    ? f.color + ' ring-2 ring-offset-1 ring-indigo-400'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'
                }`}>
                {f.label}
                {f.val !== 'semua' && (
                  <span className="ml-1 opacity-70">({
                    f.val === 'lebih' ? stats.lebih :
                    f.val === 'kurang' ? stats.kurang : stats.tepat
                  })</span>
                )}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all">
            <option value="nama">Urut: Nama</option>
            <option value="kelas">Urut: Kelas</option>
            <option value="jam_aktual">Urut: Jam Aktual</option>
            <option value="selisih_jam">Urut: Selisih Jam</option>
            <option value="persen">Urut: % Hadir</option>
          </select>
        </motion.div>
      )}

      {/* ── LOADING ───────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
            <GraduationCap size={22} className="absolute inset-0 m-auto text-indigo-500" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Menghitung jam kehadiran siswa...</p>
        </div>
      )}

      {/* ── EMPTY ─────────────────────────────────────────────── */}
      {!loading && data && rawData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <AlertTriangle size={32} className="text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-600 dark:text-slate-300">Tidak ada data absensi siswa</p>
          <p className="text-sm text-slate-400">di periode {namaBulan}</p>
        </div>
      )}

      {/* ── DAFTAR SISWA ──────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15 }}
          className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan <strong className="text-slate-700 dark:text-slate-200">{filtered.length}</strong> dari <strong>{rawData.length}</strong> siswa
            </p>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Klik ↓ untuk lihat detail harian
            </p>
          </div>
          {filtered.map((item, idx) => (
            <SiswaCard key={item.siswa_id} item={item} idx={idx} />
          ))}
        </motion.div>
      )}

      {/* ── NO MATCH ──────────────────────────────────────────── */}
      {!loading && data && rawData.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
          <Search size={28} className="text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500">Tidak ada siswa yang cocok</p>
          <button onClick={() => { setSearch(''); setFilter('semua') }}
            className="text-xs text-indigo-500 hover:text-indigo-600 font-medium mt-1">
            Reset filter
          </button>
        </div>
      )}

    </div>
  )
}
