import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, Clock, Search, Filter, Download, Calendar, Users,
  CheckCircle, AlertCircle, RefreshCw, Sparkles, ChevronDown,
  FileSpreadsheet, Hash, QrCode, Fingerprint, ArrowRight,
  TrendingDown, TrendingUp, Minus, Timer, UserCheck, BarChart3,
  ScanLine, X, Loader
} from 'lucide-react'
import { adminApi } from '../../services/adminService'
import { publicApi } from '../../services/publicApi'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'
import { Html5Qrcode } from 'html5-qrcode'

/* ─── helpers ─────────────────────────────────────────────────────── */
const metodeLabel = (m) => ({ fingerprint:'🖐 Sidik Jari', qr_code:'📷 QR Code', manual:'✍️ Manual' }[m] ?? m ?? '-')
const fmtSelisih = (menit) => {
  if (menit === null || menit === undefined) return '-'
  const abs = Math.abs(menit)
  if (menit > 0)  return <span className="text-amber-600 dark:text-amber-400 font-semibold">-{abs} mnt lebih awal</span>
  if (menit < 0)  return <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{abs} mnt lembur</span>
  return <span className="text-slate-500 font-semibold">Tepat waktu</span>
}
const statusPulangBadge = (s) => {
  if (!s) return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400">Belum Pulang</span>
  const cfg = {
    cepat:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    lembur: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    tepat:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  }
  const lbl = { cepat:'⏩ Cepat', lembur:'🌙 Lembur', tepat:'✅ Tepat' }
  return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${cfg[s]}`}>{lbl[s]}</span>
}

export default function PulangGuru() {
  /* ── state ── */
  const [data, setData]           = useState([])
  const [statistik, setStatistik] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [jamPulangSet, setJamPulangSet] = useState('15:00')
  const [filters, setFilters]     = useState({
    search: '', tanggal: '', bulan: new Date().getMonth()+1,
    tahun: new Date().getFullYear(), status_pulang: '',
  })
  const [pagination, setPagination] = useState({ current_page:1, per_page:15, total:0 })
  const [showFilters, setShowFilters] = useState(false)
  const [tab, setTab]             = useState('list') // list | statistik
  const [waktu, setWaktu]         = useState(new Date())

  /* absen pulang form */
  const [absenMode, setAbsenMode] = useState('manual') // manual | qr
  const [nipInput, setNipInput]   = useState('')
  const [absenLoading, setAbsenLoading] = useState(false)
  const [absenResult, setAbsenResult]   = useState(null)
  const [scanning, setScanning]   = useState(false)
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)

  /* ── clock ── */
  useEffect(() => { const t = setInterval(() => setWaktu(new Date()), 1000); return () => clearInterval(t) }, [])

  /* ── fetch ── */
  useEffect(() => { fetchData(); fetchStatistik() }, [filters.bulan, filters.tahun, pagination.current_page])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = Object.fromEntries(Object.entries({ ...filters, page: pagination.current_page, per_page: pagination.per_page }).filter(([,v]) => v !== '' && v != null))
      const res = await adminApi.getAbsensiGuruPulang(params)
      const d   = res.data.data
      setData(d.data || [])
      setPagination(d.pagination || pagination)
      if (d.jam_pulang_set) setJamPulangSet(d.jam_pulang_set)
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false); setRefreshing(false) }
  }

  const fetchStatistik = async () => {
    try {
      const res = await adminApi.getAbsensiGuruPulangStatistik({ bulan: filters.bulan, tahun: filters.tahun })
      setStatistik(res.data.data)
    } catch {}
  }

  const handleRefresh = async () => { setRefreshing(true); await fetchData(); await fetchStatistik(); toast.success('Data diperbarui') }
  const handleFilter  = (k, v) => setFilters(p => ({ ...p, [k]: v }))
  const handleSearch  = (e) => { e.preventDefault(); setPagination(p => ({ ...p, current_page:1 })); fetchData() }

  /* ── absen pulang manual ── */
  const handleAbsenManual = async (e) => {
    e.preventDefault()
    if (!nipInput.trim()) { toast.error('Masukkan NIP guru'); return }
    setAbsenLoading(true); setAbsenResult(null)
    try {
      const res = await adminApi.absenGuruPulangManual({ nip: nipInput.trim() })
      const d   = res.data.data
      setAbsenResult({ success: true, data: d, message: res.data.message })
      setNipInput('')
      toast.success(res.data.message)
      fetchData(); fetchStatistik()
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal absen pulang'
      setAbsenResult({ success: false, message: msg })
      toast.error(msg)
    } finally { setAbsenLoading(false) }
  }

  /* ── QR scanner ── */
  const startScanner = async () => {
    setScanning(true)
    await new Promise(r => setTimeout(r, 200))
    try {
      const qr = new Html5Qrcode('qr-pulang-guru')
      html5QrRef.current = qr
      await qr.start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 }, async (decoded) => {
        await stopScanner()
        setAbsenLoading(true); setAbsenResult(null)
        try {
          const res = await adminApi.absenGuruPulangQr({ qr_code: decoded })
          const d   = res.data.data
          setAbsenResult({ success: true, data: d, message: res.data.message })
          toast.success(res.data.message)
          fetchData(); fetchStatistik()
        } catch (err) {
          const msg = err.response?.data?.message || 'QR tidak valid'
          setAbsenResult({ success: false, message: msg })
          toast.error(msg)
        } finally { setAbsenLoading(false) }
      }, () => {})
    } catch { setScanning(false) }
  }

  const stopScanner = async () => {
    try { if (html5QrRef.current) { await html5QrRef.current.stop(); html5QrRef.current = null } } catch {}
    setScanning(false)
  }

  useEffect(() => { return () => { stopScanner() } }, [])

  /* ── export ── */
  const handleExport = async () => {
    try {
      toast.loading('Mengunduh...')
      const res = await adminApi.exportAbsensiGuruPulang({ bulan: filters.bulan, tahun: filters.tahun })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a   = document.createElement('a')
      a.href = url; a.download = `pulang-guru-${filters.bulan}-${filters.tahun}.csv`
      a.click(); URL.revokeObjectURL(url)
      toast.dismiss(); toast.success('Berhasil diunduh')
    } catch { toast.dismiss(); toast.error('Gagal mengunduh') }
  }

  /* ── columns ── */
  const columns = [
    {
      header: 'Guru',
      accessor: 'guru',
      cell: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            {row.guru.foto
              ? <img src={row.guru.foto} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow"/>
              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow">{row.guru.nama.charAt(0)}</div>
            }
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-800 ${row.jam_pulang ? 'bg-emerald-400' : 'bg-slate-300'}`}/>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{row.guru.nama}</p>
            <p className="text-[11px] text-slate-400 truncate">NIP: {row.guru.nip}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Tanggal',
      accessor: 'tanggal',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Calendar size={13} className="text-violet-500 flex-shrink-0"/>
          <span className="text-slate-700 dark:text-slate-300">
            {row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'2-digit' }) : '-'}
          </span>
        </div>
      )
    },
    {
      header: 'Jam Masuk',
      accessor: 'jam_masuk',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-blue-400 flex-shrink-0"/>
          <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{row.jam_masuk ?? '-'}</span>
        </div>
      )
    },
    {
      header: `Jam Pulang (Set: ${jamPulangSet})`,
      accessor: 'jam_pulang',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <LogOut size={13} className={`flex-shrink-0 ${row.jam_pulang ? 'text-emerald-500' : 'text-slate-300'}`}/>
          <span className={`font-mono text-sm font-semibold ${row.jam_pulang ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            {row.jam_pulang ?? '—'}
          </span>
        </div>
      )
    },
    {
      header: 'Selisih',
      accessor: 'menit_pulang_cepat',
      cell: (row) => row.jam_pulang ? fmtSelisih(row.menit_pulang_cepat) : <span className="text-slate-400 text-xs">-</span>
    },
    {
      header: 'Status Pulang',
      accessor: 'status_pulang',
      cell: (row) => statusPulangBadge(row.status_pulang)
    },
    {
      header: 'Metode Pulang',
      accessor: 'metode_pulang',
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">{row.metode_pulang_label ?? '-'}</span>
      )
    },
  ]

  /* ── render ── */
  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-xl shadow-lg shadow-violet-500/30">
              <LogOut size={20} className="text-white"/>
            </div>
            <motion.div animate={{ scale:[1,1.3,1] }} transition={{ duration:2, repeat:Infinity }}
              className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full"/>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Absensi Pulang Guru</h1>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Sparkles size={10} className="text-violet-500"/>
              Jam pulang sekolah: <span className="font-bold text-violet-600 dark:text-violet-400 ml-1">{jamPulangSet}</span>
              <span className="mx-1">·</span>
              <Clock size={10}/> {waktu.toLocaleTimeString('id-ID')}
            </p>
          </div>
        </motion.div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={refreshing}
            className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-violet-500' : 'text-slate-500'}/>
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-500 to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all">
            <FileSpreadsheet size={13}/><span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
        {[{ key:'list', label:'Daftar Pulang' }, { key:'statistik', label:'Statistik' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${tab === t.key ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── STAT CARDS ── */}
      {statistik && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:'Sudah Pulang', val: statistik.sudah_pulang_hari_ini, icon: CheckCircle, color:'emerald', sub:'Hari ini' },
            { label:'Belum Pulang', val: statistik.belum_pulang_hari_ini, icon: AlertCircle, color:'amber',   sub:'Hari ini' },
            { label:'Pulang Cepat', val: statistik.total_pulang_cepat,    icon: TrendingDown, color:'orange', sub:`Rata ${statistik.rata_cepat} mnt` },
            { label:'Lembur',       val: statistik.total_lembur,          icon: TrendingUp,  color:'violet', sub:`Rata ${statistik.rata_lembur} mnt` },
          ].map((s, i) => {
            const cls = {
              emerald: { bg:'bg-emerald-50 dark:bg-emerald-900/20', border:'border-emerald-200 dark:border-emerald-800', text:'text-emerald-600 dark:text-emerald-400', icon:'bg-emerald-100 dark:bg-emerald-900/40' },
              amber:   { bg:'bg-amber-50 dark:bg-amber-900/20',     border:'border-amber-200 dark:border-amber-800',     text:'text-amber-600 dark:text-amber-400',     icon:'bg-amber-100 dark:bg-amber-900/40' },
              orange:  { bg:'bg-orange-50 dark:bg-orange-900/20',   border:'border-orange-200 dark:border-orange-800',   text:'text-orange-600 dark:text-orange-400',   icon:'bg-orange-100 dark:bg-orange-900/40' },
              violet:  { bg:'bg-violet-50 dark:bg-violet-900/20',   border:'border-violet-200 dark:border-violet-800',   text:'text-violet-600 dark:text-violet-400',   icon:'bg-violet-100 dark:bg-violet-900/40' },
            }[s.color]
            return (
              <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
                className={`${cls.bg} rounded-2xl border ${cls.border} p-4 shadow-sm`}>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 ${cls.icon} rounded-xl`}><s.icon size={16} className={cls.text}/></div>
                </div>
                <p className={`text-2xl font-black ${cls.text}`}>{s.val ?? 0}</p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{s.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {tab === 'list' && (
          <motion.div key="list" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-4">

            {/* ── FORM ABSEN PULANG ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-violet-50 to-emerald-50 dark:from-violet-900/10 dark:to-emerald-900/10">
                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <LogOut size={14} className="text-violet-600 dark:text-violet-400"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Input Absen Pulang</p>
                  <p className="text-[11px] text-slate-400">Manual (NIP) atau scan QR Code guru</p>
                </div>
              </div>
              <div className="p-5">
                {/* Mode tabs */}
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mb-4">
                  {[{ key:'manual', label:'✍️ Manual NIP', icon: Hash }, { key:'qr', label:'📷 QR Code', icon: QrCode }].map(m => (
                    <button key={m.key} onClick={() => { setAbsenMode(m.key); if (scanning) stopScanner(); setAbsenResult(null) }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${absenMode === m.key ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>

                {absenMode === 'manual' ? (
                  <form onSubmit={handleAbsenManual} className="flex gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                      <input type="text" value={nipInput} onChange={e => setNipInput(e.target.value)}
                        placeholder="Masukkan NIP guru..."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 font-mono"/>
                    </div>
                    <button type="submit" disabled={absenLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 hover:opacity-90 disabled:opacity-60 transition-all">
                      {absenLoading ? <Loader size={14} className="animate-spin"/> : <LogOut size={14}/>}
                      {absenLoading ? 'Memproses...' : 'Absen Pulang'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {!scanning ? (
                      <button onClick={startScanner}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all">
                        <ScanLine size={14}/> Mulai Scan QR
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div id="qr-pulang-guru" className="w-full max-w-xs rounded-2xl overflow-hidden border-2 border-violet-300 dark:border-violet-700"/>
                        <button onClick={stopScanner}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all">
                          <X size={12}/> Batal Scan
                        </button>
                      </div>
                    )}
                    {absenLoading && (
                      <div className="flex items-center gap-2 text-sm text-violet-600">
                        <Loader size={14} className="animate-spin"/> Memproses QR...
                      </div>
                    )}
                  </div>
                )}

                {/* Result */}
                <AnimatePresence>
                  {absenResult && (
                    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 ${
                        absenResult.success
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                      }`}>
                      {absenResult.success
                        ? <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
                        : <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5"/>}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${absenResult.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                          {absenResult.success ? '✅ ' : '❌ '}{absenResult.message}
                        </p>
                        {absenResult.success && absenResult.data && (
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { label:'Nama', val: absenResult.data.guru?.nama },
                              { label:'Jam Pulang', val: absenResult.data.absensi?.jam_pulang ? String(absenResult.data.absensi.jam_pulang).substring(0,5) : '-' },
                              { label:'Jam Sekolah', val: absenResult.data.jam_pulang_sekolah },
                              { label:'Selisih', val: (() => {
                                const m = absenResult.data.menit_pulang_cepat
                                if (m > 0) return `${m} mnt lebih awal`
                                if (m < 0) return `Lembur ${Math.abs(m)} mnt`
                                return 'Tepat waktu'
                              })() },
                            ].map((item, i) => (
                              <div key={i} className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-2">
                                <p className="text-[10px] text-slate-400">{item.label}</p>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{item.val ?? '-'}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => setAbsenResult(null)} className="text-slate-400 hover:text-slate-600 flex-shrink-0"><X size={14}/></button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── FILTER ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                    <input type="text" placeholder="Cari nama guru atau NIP..."
                      value={filters.search} onChange={e => handleFilter('search', e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"/>
                  </form>
                  <div className="flex gap-2 flex-wrap">
                    <select value={filters.bulan} onChange={e => handleFilter('bulan', e.target.value)}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                      {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>{new Date(2000,i).toLocaleDateString('id-ID',{month:'long'})}</option>)}
                    </select>
                    <select value={filters.tahun} onChange={e => handleFilter('tahun', e.target.value)}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                      {Array.from({length:5},(_,i) => { const y = new Date().getFullYear()-i; return <option key={y} value={y}>{y}</option> })}
                    </select>
                    <button onClick={() => setShowFilters(!showFilters)}
                      className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold border transition-all ${showFilters ? 'bg-violet-500 text-white border-violet-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                      <Filter size={13}/><span className="hidden sm:inline">Filter</span>
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                      className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Status Pulang</label>
                          <select value={filters.status_pulang} onChange={e => handleFilter('status_pulang', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                            <option value="">Semua</option>
                            <option value="sudah">Sudah Pulang</option>
                            <option value="belum">Belum Pulang</option>
                            <option value="cepat">Pulang Cepat</option>
                            <option value="lembur">Lembur</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tanggal Spesifik</label>
                          <input type="date" value={filters.tanggal} onChange={e => handleFilter('tanggal', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"/>
                        </div>
                        <div className="flex items-end">
                          <button onClick={() => { setFilters(p => ({ ...p, status_pulang:'', tanggal:'' })); fetchData() }}
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all flex items-center gap-1.5">
                            <RefreshCw size={12}/> Reset Filter
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── TABLE ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <DataTable columns={columns} data={data} loading={loading}
                pagination={pagination} onPageChange={p => setPagination(prev => ({ ...prev, current_page: p }))}
                searchPlaceholder="Cari guru..."/>
            </div>
          </motion.div>
        )}

        {tab === 'statistik' && statistik && (
          <motion.div key="statistik" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-4">

            {/* Grafik 7 hari */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-xl"><BarChart3 size={16} className="text-violet-600 dark:text-violet-400"/></div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Grafik Pulang 7 Hari Terakhir</p>
                  <p className="text-[11px] text-slate-400">Perbandingan masuk vs pulang per hari</p>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {statistik.grafik?.map((item, idx) => {
                  const maxVal = Math.max(...statistik.grafik.map(d => d.total_masuk), 1)
                  const hMasuk  = Math.round((item.total_masuk / maxVal) * 100)
                  const hPulang = Math.round((item.total_pulang / maxVal) * 100)
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div className="w-full h-24 flex items-end gap-0.5">
                        <motion.div initial={{ height:0 }} animate={{ height:`${hMasuk}%` }} transition={{ delay: idx*0.05 }}
                          className="flex-1 bg-violet-400/60 dark:bg-violet-500/40 rounded-t-md" title={`Masuk: ${item.total_masuk}`}/>
                        <motion.div initial={{ height:0 }} animate={{ height:`${hPulang}%` }} transition={{ delay: idx*0.05+0.1 }}
                          className="flex-1 bg-emerald-400/80 dark:bg-emerald-500/60 rounded-t-md" title={`Pulang: ${item.total_pulang}`}/>
                      </div>
                      <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">{item.hari?.substring(0,3)}</p>
                      <p className="text-[9px] text-slate-400">{new Date(item.tanggal).getDate()}</p>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 justify-center">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-violet-400/60"/><span className="text-[11px] text-slate-500">Masuk</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-400/80"/><span className="text-[11px] text-slate-500">Pulang</span></div>
              </div>
            </div>

            {/* Guru belum pulang hari ini */}
            {statistik.guru_belum_pulang?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl"><AlertCircle size={16} className="text-amber-600 dark:text-amber-400"/></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Belum Absen Pulang Hari Ini</p>
                    <p className="text-[11px] text-slate-400">{statistik.guru_belum_pulang.length} guru sudah masuk tapi belum absen pulang</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {statistik.guru_belum_pulang.map((g, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                      {g.foto
                        ? <img src={g.foto} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
                        : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{g.nama.charAt(0)}</div>
                      }
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{g.nama}</p>
                        <p className="text-[10px] text-slate-400">Masuk: {g.jam_masuk}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary bulan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label:'Total Sudah Pulang', val: statistik.total_sudah_pulang, sub:'Bulan ini', color:'emerald' },
                { label:'Rata-rata Pulang Cepat', val: `${statistik.rata_cepat} mnt`, sub:'Lebih awal dari jadwal', color:'amber' },
                { label:'Rata-rata Lembur', val: `${statistik.rata_lembur} mnt`, sub:'Setelah jam pulang', color:'violet' },
              ].map((s, i) => {
                const cls = {
                  emerald: 'from-emerald-500 to-teal-500',
                  amber:   'from-amber-500 to-orange-500',
                  violet:  'from-violet-500 to-purple-500',
                }[s.color]
                return (
                  <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}
                    className={`bg-gradient-to-br ${cls} rounded-2xl p-5 text-white shadow-lg`}>
                    <p className="text-3xl font-black">{s.val}</p>
                    <p className="text-sm font-bold mt-1 opacity-90">{s.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{s.sub}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
