import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck, LogOut, Search, Filter, Calendar, RefreshCw,
  Clock, CheckCircle, AlertCircle, XCircle, ChevronDown,
  Users, TrendingUp, TrendingDown, Minus, Fingerprint,
  QrCode, Pencil, Settings, ArrowUpDown, Activity,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { guruApi } from '../../services/guruService'
import toast from 'react-hot-toast'

/* ─────────────── helpers ────────────────────────────────────────── */
const BULAN = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]
const TAHUN = [2024, 2025, 2026, 2027]

const statusBadge = (status) => {
  const cfg = {
    hadir:     { cls:'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', label:'Hadir',     Icon:CheckCircle },
    terlambat: { cls:'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',         label:'Terlambat', Icon:Clock },
    alpha:     { cls:'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',             label:'Alpha',     Icon:XCircle },
    izin:      { cls:'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',             label:'Izin',      Icon:AlertCircle },
    sakit:     { cls:'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',     label:'Sakit',     Icon:Activity },
  }
  const c = cfg[status] || cfg.hadir
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${c.cls}`}>
      <c.Icon size={9}/>{c.label}
    </span>
  )
}

const metodeBadge = (m) => {
  const cfg = {
    fingerprint: { label:'Sidik Jari', Icon:Fingerprint, cls:'text-cyan-600 dark:text-cyan-400' },
    qr_code:     { label:'QR Code',    Icon:QrCode,      cls:'text-blue-600 dark:text-blue-400' },
    manual:      { label:'Manual',     Icon:Pencil,      cls:'text-slate-600 dark:text-slate-400' },
    sistem:      { label:'Sistem',     Icon:Settings,    cls:'text-slate-500 dark:text-slate-500' },
  }
  const c = cfg[m] || cfg.manual
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${c.cls}`}>
      <c.Icon size={10}/>{c.label}
    </span>
  )
}

const pulangBadge = (status, menit) => {
  if (!status) return <span className="text-[10px] text-slate-400">Belum Pulang</span>
  const abs = Math.abs(menit ?? 0)
  const jam = Math.floor(abs/60), sisa = abs%60
  const dur = jam > 0 ? (sisa > 0 ? `${jam}j ${sisa}m` : `${jam} jam`) : `${abs} mnt`
  const cfg = {
    cepat:  { cls:'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',       lbl:`Cepat ${dur}`,  Icon:TrendingDown },
    lembur: { cls:'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', lbl:`Lembur ${dur}`, Icon:TrendingUp },
    tepat:  { cls:'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',           lbl:'Tepat Waktu',   Icon:Minus },
  }
  const c = cfg[status] || cfg.tepat
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${c.cls}`}>
      <c.Icon size={9}/>{c.lbl}
    </span>
  )
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '-'

/* ─────────────── StatCard ───────────────────────────────────────── */
const StatCard = ({ label, val, Icon, color, bg }) => (
  <div className={`${bg} rounded-2xl p-4 border border-white/10`}>
    <div className="flex items-center justify-between mb-1">
      <p className="text-xs font-semibold text-white/70">{label}</p>
      <Icon size={15} className="text-white/60" />
    </div>
    <p className="text-2xl font-black text-white tabular-nums">{val ?? 0}</p>
  </div>
)

/* ─────────────── Tabel Masuk ────────────────────────────────────── */
function TabelMasuk({ data, loading, pagination, onPageChange }) {
  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin"/>
      <span className="text-sm">Memuat data...</span>
    </div>
  )
  if (!data.length) return (
    <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
      <UserCheck size={32} className="opacity-30"/>
      <p className="text-sm">Tidak ada data absensi</p>
    </div>
  )
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              {['Guru','Tanggal','Jam Masuk','Status','Terlambat','Metode'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {data.map((row, i) => (
              <motion.tr key={row.id || i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.02}}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
                      {row.guru?.foto_url
                        ? <img src={row.guru.foto_url} alt="" className="w-full h-full object-cover"/>
                        : (row.guru?.nama_lengkap || '?').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-[130px]">{row.guru?.nama_lengkap || '-'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{row.guru?.nip || '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{fmtDate(row.tanggal)}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-200">{row.jam_masuk ? row.jam_masuk.slice(0,5) : '-'}</td>
                <td className="px-4 py-3">{statusBadge(row.status)}</td>
                <td className="px-4 py-3 text-xs">
                  {row.menit_keterlambatan > 0
                    ? <span className="text-amber-600 dark:text-amber-400 font-semibold">{row.menit_keterlambatan} mnt</span>
                    : <span className="text-slate-400">-</span>}
                </td>
                <td className="px-4 py-3">{metodeBadge(row.metode)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pagination={pagination} onPageChange={onPageChange}/>
    </>
  )
}

/* ─────────────── Tabel Pulang ───────────────────────────────────── */
function TabelPulang({ data, loading, pagination, onPageChange }) {
  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-violet-500 animate-spin"/>
      <span className="text-sm">Memuat data...</span>
    </div>
  )
  if (!data.length) return (
    <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
      <LogOut size={32} className="opacity-30"/>
      <p className="text-sm">Tidak ada data pulang guru</p>
    </div>
  )
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              {['Guru','Tanggal','Jam Masuk','Jam Pulang','Status Masuk','Status Pulang','Metode Pulang'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {data.map((row, i) => (
              <motion.tr key={row.id || i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.02}}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
                      {row.guru?.foto_url
                        ? <img src={row.guru.foto_url} alt="" className="w-full h-full object-cover"/>
                        : (row.guru?.nama_lengkap || '?').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-[130px]">{row.guru?.nama_lengkap || '-'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{row.guru?.nip || '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{fmtDate(row.tanggal)}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{row.jam_masuk ? row.jam_masuk.slice(0,5) : '-'}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-100">{row.jam_pulang ? row.jam_pulang.slice(0,5) : <span className="text-slate-400">Belum</span>}</td>
                <td className="px-4 py-3">{statusBadge(row.status)}</td>
                <td className="px-4 py-3">{pulangBadge(row.status_pulang, row.menit_pulang_cepat)}</td>
                <td className="px-4 py-3">{row.metode_pulang ? metodeBadge(row.metode_pulang) : <span className="text-[10px] text-slate-400">-</span>}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pagination={pagination} onPageChange={onPageChange}/>
    </>
  )
}

/* ─────────────── Pagination ─────────────────────────────────────── */
function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.last_page <= 1) return null
  const { current_page, last_page, from, to, total } = pagination
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{from}–{to}</span> dari{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span> data
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onPageChange(current_page - 1)} disabled={current_page <= 1}
          className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
          <ChevronLeft size={14}/>
        </button>
        <span className="px-3 h-8 flex items-center rounded-xl text-xs font-bold text-white bg-indigo-600">
          {current_page} / {last_page}
        </span>
        <button onClick={() => onPageChange(current_page + 1)} disabled={current_page >= last_page}
          className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
          <ChevronRight size={14}/>
        </button>
      </div>
    </div>
  )
}

/* ─────────────── MAIN COMPONENT ────────────────────────────────── */
export default function AbsensiGuruKepsek() {
  const [tab, setTab] = useState('masuk') // 'masuk' | 'pulang'

  // Filter bersama
  const [search, setSearch]       = useState('')
  const [bulan, setBulan]         = useState(new Date().getMonth() + 1)
  const [tahun, setTahun]         = useState(new Date().getFullYear())
  const [tanggal, setTanggal]     = useState('')
  const [filterMode, setFilterMode] = useState('bulan') // 'bulan' | 'tanggal'
  const [showFilter, setShowFilter] = useState(false)

  // State tab masuk
  const [dataMasuk, setDataMasuk]           = useState([])
  const [loadingMasuk, setLoadingMasuk]     = useState(false)
  const [paginationMasuk, setPaginationMasuk] = useState(null)
  const [pageMasuk, setPageMasuk]           = useState(1)
  const [statistikMasuk, setStatistikMasuk] = useState(null)

  // State tab pulang
  const [dataPulang, setDataPulang]           = useState([])
  const [loadingPulang, setLoadingPulang]     = useState(false)
  const [paginationPulang, setPaginationPulang] = useState(null)
  const [pagePulang, setPagePulang]           = useState(1)
  const [statistikPulang, setStatistikPulang] = useState(null)

  // Build shared params
  const buildParams = useCallback((page) => {
    const p = { page, per_page: 15 }
    if (search.trim()) p.search = search.trim()
    if (filterMode === 'tanggal' && tanggal) {
      p.tanggal = tanggal
    } else {
      p.bulan = bulan
      p.tahun = tahun
    }
    return p
  }, [search, filterMode, tanggal, bulan, tahun])

  // Fetch masuk
  const fetchMasuk = useCallback(async (page = pageMasuk) => {
    setLoadingMasuk(true)
    try {
      const [dataRes, statRes] = await Promise.allSettled([
        guruApi.kepsekGetAbsensiMasukGuru(buildParams(page)),
        guruApi.kepsekGetAbsensiMasukStatistik({ bulan, tahun }),
      ])
      if (dataRes.status === 'fulfilled') {
        const d = dataRes.value.data?.data
        setDataMasuk(Array.isArray(d?.data) ? d.data : (Array.isArray(d) ? d : []))
        setPaginationMasuk(dataRes.value.data?.data?.pagination || null)
      }
      if (statRes.status === 'fulfilled') setStatistikMasuk(statRes.value.data?.data || null)
    } catch (e) { toast.error('Gagal memuat data absensi masuk') }
    finally { setLoadingMasuk(false) }
  }, [buildParams, pageMasuk, bulan, tahun])

  // Fetch pulang
  const fetchPulang = useCallback(async (page = pagePulang) => {
    setLoadingPulang(true)
    try {
      const [dataRes, statRes] = await Promise.allSettled([
        guruApi.kepsekGetAbsensiPulangGuru(buildParams(page)),
        guruApi.kepsekGetAbsensiPulangStatistik({ bulan, tahun }),
      ])
      if (dataRes.status === 'fulfilled') {
        const d = dataRes.value.data?.data
        setDataPulang(Array.isArray(d?.data) ? d.data : (Array.isArray(d) ? d : []))
        setPaginationPulang(dataRes.value.data?.data?.pagination || null)
      }
      if (statRes.status === 'fulfilled') setStatistikPulang(statRes.value.data?.data || null)
    } catch (e) { toast.error('Gagal memuat data absensi pulang') }
    finally { setLoadingPulang(false) }
  }, [buildParams, pagePulang, bulan, tahun])

  // Initial load & refetch on filter change
  useEffect(() => { setPageMasuk(1); fetchMasuk(1) }, [bulan, tahun, tanggal, filterMode, search])
  useEffect(() => { setPagePulang(1); fetchPulang(1) }, [bulan, tahun, tanggal, filterMode, search])

  const handleRefresh = () => {
    if (tab === 'masuk') fetchMasuk(pageMasuk)
    else fetchPulang(pagePulang)
  }

  const statM = statistikMasuk?.statistik || statistikMasuk || {}
  const statP = statistikPulang?.statistik || statistikPulang || {}

  return (
    <div className="space-y-4 pb-8">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
          className="relative overflow-hidden rounded-2xl p-5 shadow-lg"
          style={{background:'linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#6d28d9 100%)'}}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5"/>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',backgroundSize:'16px 16px'}}/>
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-white/70"/>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Pantau Absensi Guru</p>
              </div>
              <h1 className="text-xl font-black text-white">Riwayat Absensi Semua Guru</h1>
              <p className="text-white/50 text-[11px] mt-0.5">Hanya dapat diakses oleh Kepala Sekolah</p>
            </div>
            <button onClick={handleRefresh}
              className="flex-shrink-0 p-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-colors">
              <RefreshCw size={15} className={(loadingMasuk || loadingPulang) ? 'animate-spin' : ''}/>
            </button>
          </div>

          {/* Stat pills */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {tab === 'masuk' ? [
              { label:'Hadir',     val:statM.total_hadir,     bg:'bg-emerald-500/25' },
              { label:'Terlambat', val:statM.total_terlambat, bg:'bg-amber-500/25' },
              { label:'Alpha',     val:statM.total_alpha,     bg:'bg-rose-500/25' },
              { label:'Total',     val:statM.total_absensi,   bg:'bg-white/15' },
            ] : [
              { label:'Sudah Pulang', val:statP.total_sudah_pulang ?? statP.sudah_pulang, bg:'bg-emerald-500/25' },
              { label:'Belum Pulang', val:statP.total_belum_pulang ?? statP.belum_pulang, bg:'bg-rose-500/25' },
              { label:'Lembur',       val:statP.total_lembur,  bg:'bg-violet-500/25' },
              { label:'Pulang Cepat', val:statP.total_cepat,   bg:'bg-amber-500/25' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm`}>
                <p className="text-lg font-black text-white tabular-nums leading-none">{s.val ?? 0}</p>
                <p className="text-white/50 text-[9px] mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── TABS ───────────────────────────────────────────────── */}
        <div className="flex gap-2">
          {[
            { key:'masuk',  label:'Absensi Masuk',  Icon:UserCheck, color:'text-indigo-600 dark:text-indigo-400',  activeBg:'bg-indigo-600' },
            { key:'pulang', label:'Absensi Pulang', Icon:LogOut,    color:'text-violet-600 dark:text-violet-400', activeBg:'bg-violet-600' },
          ].map(t => (
            <motion.button key={t.key} whileTap={{scale:0.97}}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? `${t.activeBg} text-white shadow-sm`
                  : `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ${t.color} hover:border-indigo-300`
              }`}>
              <t.Icon size={15}/>{t.label}
            </motion.button>
          ))}
        </div>

        {/* ── FILTER BAR ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="text" placeholder="Cari nama atau NIP guru..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"/>
            </div>
            <button onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showFilter ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 text-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
              <Filter size={13}/> Filter
              <ChevronDown size={12} className={`transition-transform ${showFilter ? 'rotate-180' : ''}`}/>
            </button>
          </div>

          <AnimatePresence>
            {showFilter && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                className="overflow-hidden">
                <div className="px-4 py-3 flex flex-wrap items-center gap-3">
                  {/* Mode toggle */}
                  <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    {[{k:'bulan',l:'Per Bulan'},{k:'tanggal',l:'Per Tanggal'}].map(m => (
                      <button key={m.k} onClick={() => setFilterMode(m.k)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filterMode === m.k ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'
                        }`}>{m.l}</button>
                    ))}
                  </div>

                  {filterMode === 'bulan' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400"/>
                        <select value={bulan} onChange={e => setBulan(+e.target.value)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500">
                          {BULAN.map((b,i) => <option key={i+1} value={i+1}>{b}</option>)}
                        </select>
                      </div>
                      <select value={tahun} onChange={e => setTahun(+e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500">
                        {TAHUN.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400"/>
                      <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"/>
                      {tanggal && (
                        <button onClick={() => setTanggal('')}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <XCircle size={13}/>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Active filter label */}
                  <span className="text-[10px] text-slate-400 font-medium">
                    {filterMode === 'tanggal' && tanggal
                      ? `Tanggal: ${new Date(tanggal).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}`
                      : `${BULAN[bulan-1]} ${tahun}`}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── TABLE ──────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                tab === 'masuk' ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-violet-100 dark:bg-violet-900/40'
              }`}>
                {tab === 'masuk'
                  ? <UserCheck size={15} className="text-indigo-600 dark:text-indigo-400"/>
                  : <LogOut size={15} className="text-violet-600 dark:text-violet-400"/>}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {tab === 'masuk' ? 'Rekap Absensi Masuk' : 'Rekap Absensi Pulang'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {filterMode === 'tanggal' && tanggal
                    ? new Date(tanggal).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
                    : `${BULAN[bulan-1]} ${tahun}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                tab === 'masuk' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
              }`}>
                {tab === 'masuk' ? (paginationMasuk?.total ?? dataMasuk.length) : (paginationPulang?.total ?? dataPulang.length)} data
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {tab === 'masuk' ? (
              <motion.div key="masuk" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.15}}>
                <TabelMasuk
                  data={dataMasuk}
                  loading={loadingMasuk}
                  pagination={paginationMasuk}
                  onPageChange={(p) => { setPageMasuk(p); fetchMasuk(p) }}
                />
              </motion.div>
            ) : (
              <motion.div key="pulang" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.15}}>
                <TabelPulang
                  data={dataPulang}
                  loading={loadingPulang}
                  pagination={paginationPulang}
                  onPageChange={(p) => { setPagePulang(p); fetchPulang(p) }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
  )
}
