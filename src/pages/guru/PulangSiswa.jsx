import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, Clock, Search, Filter, Calendar, CheckCircle,
  AlertCircle, RefreshCw, Sparkles, TrendingDown, TrendingUp,
  Minus, BarChart3, ChevronDown, Users, GraduationCap,
  FileText, Activity, Heart,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { guruApi } from '../../services/guruService'
import toast from 'react-hot-toast'

/* ─── helpers ─────────────────────────────────────────────────────── */
const fmtSelisih = (menit) => {
  if (menit === null || menit === undefined) return null
  const abs = Math.abs(menit)
  const jam = Math.floor(abs / 60), sisa = abs % 60
  const dur = jam > 0 ? (sisa > 0 ? `${jam}j ${sisa}m` : `${jam} jam`) : `${abs} mnt`
  if (menit > 0) return { label: `-${dur} lebih awal`, cls: 'text-amber-600 dark:text-amber-400', Icon: TrendingDown }
  if (menit < 0) return { label: `+${dur} lembur`,     cls: 'text-purple-600 dark:text-purple-400', Icon: TrendingUp }
  return { label: 'Tepat waktu', cls: 'text-blue-600 dark:text-blue-400', Icon: Minus }
}

const statusPulangBadge = (s, menit) => {
  if (!s) return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400">Belum Pulang</span>
  const abs = Math.abs(menit ?? 0), jam = Math.floor(abs/60), sisa = abs%60
  const dur = jam > 0 ? (sisa > 0 ? `${jam}j ${sisa}m` : `${jam} jam`) : `${abs} mnt`
  const cfg = {
    cepat:  { cls:'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',     lbl:`Cepat ${dur}`,  Icon: TrendingDown },
    lembur: { cls:'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', lbl:`Lembur ${dur}`, Icon: TrendingUp },
    tepat:  { cls:'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',         lbl:'Tepat Waktu',   Icon: Minus },
  }
  const c = cfg[s] || cfg.tepat
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${c.cls}`}>
      <c.Icon size={10}/>{c.lbl}
    </span>
  )
}

const statusMasukBadge = (s) => {
  const cfg = {
    hadir:     { cls:'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', lbl:'Hadir',     Icon: CheckCircle },
    terlambat: { cls:'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',         lbl:'Terlambat', Icon: Clock },
    alpha:     { cls:'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',                 lbl:'Alpha',     Icon: AlertCircle },
    izin:      { cls:'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',             lbl:'Izin',      Icon: FileText },
    sakit:     { cls:'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',     lbl:'Sakit',     Icon: Activity },
  }
  const c = cfg[s] || cfg.alpha
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${c.cls}`}>
      <c.Icon size={10}/>{c.lbl}
    </span>
  )
}

export default function GuruPulangSiswa() {
  const [data, setData]           = useState([])
  const [statistik, setStatistik] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [jamPulangSet, setJamPulangSet] = useState('15:00')
  const [kelasList, setKelasList] = useState([])
  const [waktu, setWaktu]         = useState(new Date())
  const [tab, setTab]             = useState('list')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters]     = useState({
    search: '', tanggal: new Date().toISOString().split('T')[0],
    kelas_id: '', status_pulang: '',
  })
  const [pagination, setPagination] = useState({ current_page:1, per_page:20, total:0 })

  useEffect(() => { const t = setInterval(() => setWaktu(new Date()), 1000); return () => clearInterval(t) }, [])
  useEffect(() => { fetchData(); fetchStatistik() }, [filters, pagination.current_page])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = Object.fromEntries(Object.entries({
        ...filters, page: pagination.current_page, per_page: pagination.per_page
      }).filter(([,v]) => v !== '' && v != null))
      const res = await guruApi.getPulangSiswa(params)
      const d   = res.data.data
      setData(d.data || [])
      setPagination(d.pagination || pagination)
      if (d.jam_pulang_set) setJamPulangSet(d.jam_pulang_set)
      if (d.kelas_diampu?.length) setKelasList(d.kelas_diampu)
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false); setRefreshing(false) }
  }

  const fetchStatistik = async () => {
    try {
      const res = await guruApi.getPulangSiswaStatistik()
      setStatistik(res.data.data)
    } catch {}
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchData(), fetchStatistik()])
    toast.success('Data diperbarui')
  }

  const handleFilter = (k, v) => {
    setFilters(p => ({ ...p, [k]: v }))
    setPagination(p => ({ ...p, current_page: 1 }))
  }

  const columns = [
    {
      header: 'Siswa',
      accessor: 'siswa',
      cell: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            {row.siswa.foto
              ? <img src={row.siswa.foto} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow"/>
              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">{row.siswa.nama.charAt(0)}</div>
            }
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-800 ${row.jam_pulang ? 'bg-purple-400' : 'bg-slate-300'}`}/>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{row.siswa.nama}</p>
            <p className="text-[11px] text-slate-400 truncate">NIS: {row.siswa.nis} · {row.siswa.kelas}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Status Masuk',
      accessor: 'status_masuk',
      cell: (row) => statusMasukBadge(row.status_masuk)
    },
    {
      header: 'Jam Masuk',
      accessor: 'jam_masuk',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-blue-400 flex-shrink-0"/>
          <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{row.jam_masuk ?? '—'}</span>
        </div>
      )
    },
    {
      header: `Jam Pulang (${jamPulangSet})`,
      accessor: 'jam_pulang',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <LogOut size={12} className={`flex-shrink-0 ${row.jam_pulang ? 'text-purple-500' : 'text-slate-300'}`}/>
          <span className={`font-mono text-sm font-semibold ${row.jam_pulang ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            {row.jam_pulang ?? '—'}
          </span>
        </div>
      )
    },
    {
      header: 'Selisih',
      accessor: 'menit_pulang_cepat',
      cell: (row) => {
        if (!row.jam_pulang) return <span className="text-slate-400 text-xs">—</span>
        const s = fmtSelisih(row.menit_pulang_cepat)
        if (!s) return <span className="text-slate-400 text-xs">—</span>
        return <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${s.cls}`}><s.Icon size={11}/>{s.label}</span>
      }
    },
    {
      header: 'Status Pulang',
      accessor: 'status_pulang',
      cell: (row) => statusPulangBadge(row.status_pulang, row.menit_pulang_cepat)
    },
    {
      header: 'Metode',
      accessor: 'metode_pulang',
      cell: (row) => <span className="text-xs text-slate-500 dark:text-slate-400">{row.metode_pulang_label ?? '—'}</span>
    },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">

      {/* HEADER */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30">
              <LogOut size={20} className="text-white"/>
            </div>
            <motion.div animate={{scale:[1,1.3,1]}} transition={{duration:2,repeat:Infinity}}
              className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-400 border-2 border-white dark:border-slate-900 rounded-full"/>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Pulang Siswa</h1>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Sparkles size={10} className="text-purple-500"/>
              Jam pulang: <span className="font-bold text-purple-600 dark:text-purple-400 ml-1">{jamPulangSet}</span>
              <span className="mx-1">·</span>
              <Clock size={10}/> {waktu.toLocaleTimeString('id-ID')}
            </p>
          </div>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="self-start sm:self-auto p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          <RefreshCw size={15} className={refreshing ? 'animate-spin text-purple-500' : 'text-slate-500'}/>
        </button>
      </motion.div>

      {/* TABS */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
        {[{key:'list',label:'Daftar'},{key:'statistik',label:'Statistik'}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${tab===t.key ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* STAT CARDS */}
      {statistik && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {label:'Total Siswa',    val:statistik.total_siswa,           icon:Users,        color:'purple', sub:'Kelas diampu'},
            {label:'Sudah Masuk',    val:statistik.sudah_masuk_hari_ini,  icon:CheckCircle,  color:'emerald', sub:'Hari ini'},
            {label:'Sudah Pulang',   val:statistik.sudah_pulang_hari_ini, icon:LogOut,       color:'indigo',  sub:'Hari ini'},
            {label:'Belum Pulang',   val:statistik.belum_pulang_hari_ini, icon:AlertCircle,  color:'amber',   sub:'Hari ini'},
          ].map((s,i) => {
            const cls = {
              purple:  {bg:'bg-purple-50 dark:bg-purple-900/20', border:'border-purple-200 dark:border-purple-800', text:'text-purple-600 dark:text-purple-400', icon:'bg-purple-100 dark:bg-purple-900/40'},
              emerald: {bg:'bg-emerald-50 dark:bg-emerald-900/20',border:'border-emerald-200 dark:border-emerald-800',text:'text-emerald-600 dark:text-emerald-400',icon:'bg-emerald-100 dark:bg-emerald-900/40'},
              indigo:  {bg:'bg-indigo-50 dark:bg-indigo-900/20', border:'border-indigo-200 dark:border-indigo-800', text:'text-indigo-600 dark:text-indigo-400', icon:'bg-indigo-100 dark:bg-indigo-900/40'},
              amber:   {bg:'bg-amber-50 dark:bg-amber-900/20',   border:'border-amber-200 dark:border-amber-800',   text:'text-amber-600 dark:text-amber-400',   icon:'bg-amber-100 dark:bg-amber-900/40'},
            }[s.color]
            return (
              <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
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
          <motion.div key="list" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-4">

            {/* FILTER */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 space-y-3">
                {/* Row 1: search + tanggal */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                    <input type="text" placeholder="Cari nama atau NIS siswa..."
                      value={filters.search} onChange={e => handleFilter('search', e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"/>
                  </div>
                  <input type="date" value={filters.tanggal} onChange={e => handleFilter('tanggal', e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"/>
                  <button onClick={() => setShowFilters(!showFilters)}
                    className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold border transition-all ${showFilters ? 'bg-purple-500 text-white border-purple-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                    <Filter size={13}/><span className="hidden sm:inline">Filter</span>
                  </button>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                      className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Kelas</label>
                          <select value={filters.kelas_id} onChange={e => handleFilter('kelas_id', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                            <option value="">Semua Kelas</option>
                            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Status Pulang</label>
                          <select value={filters.status_pulang} onChange={e => handleFilter('status_pulang', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                            <option value="">Semua</option>
                            <option value="sudah">Sudah Pulang</option>
                            <option value="belum">Belum Pulang</option>
                            <option value="cepat">Pulang Cepat</option>
                            <option value="lembur">Lembur</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button onClick={() => { setFilters(p => ({...p, kelas_id:'', status_pulang:'', tanggal: new Date().toISOString().split('T')[0]})) }}
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all flex items-center gap-1.5">
                            <RefreshCw size={12}/> Reset
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <DataTable columns={columns} data={data} loading={loading}
                pagination={pagination} onPageChange={p => setPagination(prev => ({...prev, current_page:p}))}
                searchPlaceholder="Cari siswa..."/>
            </div>
          </motion.div>
        )}

        {tab === 'statistik' && statistik && (
          <motion.div key="statistik" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-4">

            {/* Grafik */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl"><BarChart3 size={16} className="text-purple-600 dark:text-purple-400"/></div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Grafik 7 Hari Terakhir</p>
                  <p className="text-[11px] text-slate-400">Masuk vs Pulang per hari</p>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {statistik.grafik?.map((item, idx) => {
                  const maxVal = Math.max(...statistik.grafik.map(d => d.total_masuk), 1)
                  const hM = Math.round((item.total_masuk / maxVal) * 100)
                  const hP = Math.round((item.total_pulang / maxVal) * 100)
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div className="w-full h-24 flex items-end gap-0.5">
                        <motion.div initial={{height:0}} animate={{height:`${hM}%`}} transition={{delay:idx*0.05}}
                          className="flex-1 bg-purple-300/60 dark:bg-purple-500/40 rounded-t-md" title={`Masuk: ${item.total_masuk}`}/>
                        <motion.div initial={{height:0}} animate={{height:`${hP}%`}} transition={{delay:idx*0.05+0.1}}
                          className="flex-1 bg-indigo-400/80 dark:bg-indigo-500/60 rounded-t-md" title={`Pulang: ${item.total_pulang}`}/>
                      </div>
                      <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">{item.hari?.substring(0,3)}</p>
                      <p className="text-[9px] text-slate-400">{new Date(item.tanggal).getDate()}</p>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 justify-center">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-purple-300/60"/><span className="text-[11px] text-slate-500">Masuk</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-400/80"/><span className="text-[11px] text-slate-500">Pulang</span></div>
              </div>
            </div>

            {/* Belum pulang */}
            {statistik.siswa_belum_pulang?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl"><AlertCircle size={16} className="text-amber-600 dark:text-amber-400"/></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Belum Absen Pulang</p>
                    <p className="text-[11px] text-slate-400">{statistik.siswa_belum_pulang.length} siswa sudah masuk tapi belum pulang</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {statistik.siswa_belum_pulang.map((s, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                      {s.foto
                        ? <img src={s.foto} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
                        : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{s.nama.charAt(0)}</div>
                      }
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{s.nama}</p>
                        <p className="text-[10px] text-slate-400">{s.kelas} · Masuk: {s.jam_masuk}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
