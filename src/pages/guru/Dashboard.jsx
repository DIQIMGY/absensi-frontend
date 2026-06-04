import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Cell,
} from 'recharts'
import {
  Users, CheckCircle, Clock, XCircle, RefreshCw, ChevronRight,
  BookOpen, ClipboardList, BarChart2, Star, FileText,
  AlertTriangle, TrendingUp, Award, Calendar, Activity, Crown,
  Zap, GraduationCap, UserCheck, Bell, ArrowUpRight,
  Target, Sparkles, Shield,
} from 'lucide-react'
import { guruApi } from '../../services/guruService'
import { publicApi } from '../../services/publicApi'
import { usePengaturanStore } from '../../stores/pengaturanStore'
import LiburCountdown from '../../components/LiburCountdown'
import EventCountdown from '../../components/EventCountdown'
import DashboardVideo from '../../components/DashboardVideo'
import SiswaBerprestasi from '../../components/SiswaBerprestasi'

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0)
const fmtTime = (d) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const fmtDate = (d) => d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// ΓöÇΓöÇΓöÇ DayDot: absensi guru 7 hari ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const DayDot = ({ item }) => {
  const s = item?.status?.toLowerCase() || 'belum'
  const cfg = {
    hadir:     { bg: 'bg-emerald-500', letter: 'H', tc: 'text-emerald-600' },
    terlambat: { bg: 'bg-amber-500',   letter: 'T', tc: 'text-amber-600' },
    alpha:     { bg: 'bg-rose-500',    letter: 'A', tc: 'text-rose-600' },
    izin:      { bg: 'bg-blue-500',    letter: 'I', tc: 'text-blue-600' },
    belum:     { bg: 'bg-slate-200 dark:bg-slate-700', letter: '┬╖', tc: 'text-slate-400' },
  }[s] || { bg: 'bg-slate-200 dark:bg-slate-700', letter: '┬╖', tc: 'text-slate-400' }
  const isToday = item?.tanggal === new Date().toISOString().split('T')[0]
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">
        {item?.hari?.slice(0,3) || '---'}
      </span>
      <motion.div whileHover={{ scale: 1.15, y: -2 }}
        className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-sm ${cfg.bg} ${isToday ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-indigo-400' : ''}`}>
        {cfg.letter}
      </motion.div>
      {item?.jam_masuk
        ? <span className="text-[8px] text-slate-400 font-mono">{item.jam_masuk.slice(0,5)}</span>
        : <span className="text-[8px] text-slate-300 dark:text-slate-600">ΓÇö</span>
      }
    </div>
  )
}

// ΓöÇΓöÇΓöÇ RankRow ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const RANK_COLORS = {
  rajin: [
    { numC:'#92400e', rowBg:'bg-amber-50 dark:bg-amber-900/20', rowBorder:'border-amber-200 dark:border-amber-800/40', barC:'#fde68a', countBg:'bg-amber-100 dark:bg-amber-900/40', countC:'text-amber-700 dark:text-amber-300', ring:'#f59e0b' },
    { numC:'#475569', rowBg:'bg-slate-50 dark:bg-slate-800/60', rowBorder:'border-slate-200 dark:border-slate-700/50', barC:'#e2e8f0', countBg:'bg-slate-100 dark:bg-slate-700', countC:'text-slate-600 dark:text-slate-300', ring:'#94a3b8' },
    { numC:'#9a3412', rowBg:'bg-orange-50 dark:bg-orange-900/20', rowBorder:'border-orange-100 dark:border-orange-800/40', barC:'#fed7aa', countBg:'bg-orange-100 dark:bg-orange-900/40', countC:'text-orange-700 dark:text-orange-300', ring:'#fb923c' },
    { numC:'#64748b', rowBg:'bg-slate-50 dark:bg-slate-800/60', rowBorder:'border-slate-100 dark:border-slate-700/50', barC:'#cbd5e1', countBg:'bg-slate-100 dark:bg-slate-700', countC:'text-slate-500 dark:text-slate-400', ring:'#cbd5e1' },
  ],
  terlambat: [
    { numC:'#92400e', rowBg:'bg-amber-50 dark:bg-amber-900/20', rowBorder:'border-amber-200 dark:border-amber-800/40', barC:'#fde68a', countBg:'bg-amber-100 dark:bg-amber-900/40', countC:'text-amber-700 dark:text-amber-300', ring:'#f59e0b' },
    { numC:'#b45309', rowBg:'bg-orange-50 dark:bg-orange-900/20', rowBorder:'border-orange-100 dark:border-orange-800/40', barC:'#fed7aa', countBg:'bg-orange-100 dark:bg-orange-900/40', countC:'text-orange-700 dark:text-orange-300', ring:'#fb923c' },
    { numC:'#a16207', rowBg:'bg-yellow-50 dark:bg-yellow-900/20', rowBorder:'border-yellow-100 dark:border-yellow-800/40', barC:'#fef08a', countBg:'bg-yellow-100 dark:bg-yellow-900/40', countC:'text-yellow-700 dark:text-yellow-300', ring:'#eab308' },
    { numC:'#64748b', rowBg:'bg-slate-50 dark:bg-slate-800/60', rowBorder:'border-slate-100 dark:border-slate-700/50', barC:'#cbd5e1', countBg:'bg-slate-100 dark:bg-slate-700', countC:'text-slate-500 dark:text-slate-400', ring:'#cbd5e1' },
  ],
  alpha: [
    { numC:'#be123c', rowBg:'bg-rose-50 dark:bg-rose-900/20', rowBorder:'border-rose-100 dark:border-rose-800/40', barC:'#fda4af', countBg:'bg-rose-100 dark:bg-rose-900/40', countC:'text-rose-700 dark:text-rose-300', ring:'#fda4af' },
    { numC:'#c2410c', rowBg:'bg-orange-50 dark:bg-orange-900/20', rowBorder:'border-orange-100 dark:border-orange-800/40', barC:'#fdba74', countBg:'bg-orange-100 dark:bg-orange-900/40', countC:'text-orange-700 dark:text-orange-300', ring:'#fdba74' },
    { numC:'#b45309', rowBg:'bg-amber-50 dark:bg-amber-900/20', rowBorder:'border-amber-100 dark:border-amber-800/40', barC:'#fcd34d', countBg:'bg-amber-100 dark:bg-amber-900/40', countC:'text-amber-700 dark:text-amber-300', ring:'#fcd34d' },
    { numC:'#64748b', rowBg:'bg-slate-50 dark:bg-slate-800/60', rowBorder:'border-slate-100 dark:border-slate-700/50', barC:'#cbd5e1', countBg:'bg-slate-100 dark:bg-slate-700', countC:'text-slate-500 dark:text-slate-400', ring:'#cbd5e1' },
  ],
}

const RankRow = ({ s, i, valKey, colors }) => {
  const a = colors[Math.min(i, colors.length - 1)]
  return (
    <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.06 }}
      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl overflow-hidden border ${a.rowBg} ${a.rowBorder}`}>
      <motion.div initial={{ width:0 }} animate={{ width:'100%' }}
        transition={{ delay:0.3+i*0.08, duration:0.9, ease:'easeOut' }}
        className="absolute inset-y-0 left-0 rounded-xl pointer-events-none opacity-20"
        style={{ background: a.barC }} />
      <span className="relative z-10 text-xs font-black w-4 text-center flex-shrink-0 tabular-nums" style={{ color:a.numC }}>{i+1}</span>
      <div className="relative z-10 flex-shrink-0">
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold bg-white dark:bg-slate-700 text-slate-500"
          style={{ boxShadow:`0 0 0 2px ${a.ring}` }}>
          {s.foto_url
            ? <img src={s.foto_url} alt={s.nama_lengkap} className="w-full h-full object-cover" onError={e=>e.target.style.display='none'} />
            : s.nama_lengkap?.charAt(0)}
        </div>
        {i===0 && <div className="absolute -top-1.5 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center"><Crown size={8} className="text-amber-900"/></div>}
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{s.nama_lengkap}</p>
        <p className="text-[10px] text-slate-400 truncate">{s.kelas?.nama_kelas || s.kelas || '-'}</p>
      </div>
      <div className={`relative z-10 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums flex-shrink-0 ${a.countBg} ${a.countC}`}>{s[valKey]}├ù</div>
    </motion.div>
  )
}

export default function GuruDashboard() {
  const navigate = useNavigate()
  const { pengaturan, fetchPengaturan } = usePengaturanStore()
  const [data, setData] = useState(null)
  const [statistik, setStatistik] = useState(null)
  const [izinPending, setIzinPending] = useState([])
  const [absensiTerbaru, setAbsensiTerbaru] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [now, setNow] = useState(new Date())
  const [activeTab, setActiveTab] = useState('alpha')
  const [events, setEvents] = useState([])
  const [eventFotos, setEventFotos] = useState([])
  const clockRef = useRef(null)

  useEffect(() => {
    clockRef.current = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(clockRef.current)
  }, [])

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    fetchPengaturan(true)
    try {
      // Fetch events langsung dari public API
      try {
        const pRes = await publicApi.getPengaturan()
        const evts  = pRes?.data?.data?.events
        const fotos = pRes?.data?.data?.event_fotos
        if (Array.isArray(evts))  setEvents(evts)
        if (Array.isArray(fotos)) setEventFotos(fotos)
      } catch(e) { /* ignore */ }
      const [dashRes, rankingRes, izinRes, absensiRes] = await Promise.allSettled([
        guruApi.getDashboard(),
        guruApi.getRankingSiswa(),
        guruApi.getIzins({ status: 'pending', per_page: 5 }),
        guruApi.getAbsensis({ per_page: 8 }),
      ])
      if (dashRes.status === 'fulfilled') setData(dashRes.value.data?.data || dashRes.value.data)
      if (rankingRes.status === 'fulfilled') setStatistik(rankingRes.value.data?.data || null)
      if (izinRes.status === 'fulfilled') {
        const d = izinRes.value.data?.data
        setIzinPending(Array.isArray(d) ? d : (d?.data || []))
      }
      if (absensiRes.status === 'fulfilled') {
        const d = absensiRes.value.data?.data
        setAbsensiTerbaru(Array.isArray(d) ? d : (d?.data || []))
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Memuat dashboard...</p>
      </div>
    </div>
  )

  const guru = data?.guru || {}
  const absensiHariIni = data?.absensi_guru_hari_ini || {}
  const statGuru = data?.statistik_absensi_guru || {}
  const rekapKelas = data?.rekap_per_kelas || []
  const grafikMingguan = data?.grafik_mingguan || []
  const grafikGuru = data?.grafik_absensi_guru || []
  const statusHariIni = absensiHariIni?.status?.toLowerCase() || 'belum'
  const fotoUrl = guru.foto || null
  const totalSiswa = data?.total_siswa || 0
  const totalHadir = data?.total_hadir || 0
  const totalTerlambat = data?.total_terlambat || 0
  const totalAlpha = data?.total_alpha || 0
  const totalIzin = data?.total_izin || 0
  const pctHadir = pct(totalHadir + totalTerlambat, totalSiswa)

  const statusMap = {
    hadir:     { label:'Hadir',    bg:'bg-emerald-500', ring:'ring-emerald-400/50', dot:'bg-emerald-400', hex:'#10b981' },
    terlambat: { label:'Terlambat',bg:'bg-amber-500',   ring:'ring-amber-400/50',   dot:'bg-amber-400',   hex:'#f59e0b' },
    alpha:     { label:'Alpha',    bg:'bg-rose-500',    ring:'ring-rose-400/50',    dot:'bg-rose-400',    hex:'#ef4444' },
    izin:      { label:'Izin',     bg:'bg-blue-500',    ring:'ring-blue-400/50',    dot:'bg-blue-400',    hex:'#3b82f6' },
    belum:     { label:'Belum',    bg:'bg-slate-400',   ring:'ring-slate-400/50',   dot:'bg-slate-400',   hex:'#94a3b8' },
  }
  const cfgStatus = statusMap[statusHariIni] || statusMap.belum

  const kelasDistribusi = rekapKelas.map(k => ({
    name: k.nama_kelas?.replace(/\s/g,'') || '-',
    hadir: k.hadir||0, terlambat: k.terlambat||0, izin: k.izin||0, alpha: k.alpha||0,
  }))

  const STATS = [
    { label:'Total Siswa', val:totalSiswa,     icon:Users,     color:'#6366f1', bg:'bg-indigo-50 dark:bg-indigo-900/20',  border:'border-indigo-100 dark:border-indigo-800/40',  tc:'text-indigo-600 dark:text-indigo-400',  iconBg:'bg-indigo-100 dark:bg-indigo-900/40',  dataKey:'hadir',     chartType:'area' },
    { label:'Hadir',       val:totalHadir,     icon:UserCheck, color:'#10b981', bg:'bg-emerald-50 dark:bg-emerald-900/20', border:'border-emerald-100 dark:border-emerald-800/40', tc:'text-emerald-600 dark:text-emerald-400', iconBg:'bg-emerald-100 dark:bg-emerald-900/40', dataKey:'hadir',     chartType:'bar' },
    { label:'Terlambat',   val:totalTerlambat, icon:Clock,     color:'#f59e0b', bg:'bg-amber-50 dark:bg-amber-900/20',    border:'border-amber-100 dark:border-amber-800/40',    tc:'text-amber-600 dark:text-amber-400',    iconBg:'bg-amber-100 dark:bg-amber-900/40',    dataKey:'terlambat', chartType:'line' },
    { label:'Alpha',       val:totalAlpha,     icon:XCircle,   color:'#ef4444', bg:'bg-rose-50 dark:bg-rose-900/20',      border:'border-rose-100 dark:border-rose-800/40',      tc:'text-rose-600 dark:text-rose-400',      iconBg:'bg-rose-100 dark:bg-rose-900/40',      dataKey:'alpha',     chartType:'bar' },
  ]

  return (
    <div className="pb-8">

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
          WELCOME BANNER ΓÇö inspirasi referensi: banner besar dengan gradient
          dan dekorasi, info guru + status + quick stats
      ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div className="relative overflow-hidden mx-4 sm:mx-6 mt-4 rounded-3xl shadow-xl"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B73FF 100%)' }}>
        {/* Dekorasi blob */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }} />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize:'18px 18px' }} />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative z-10 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">

            {/* Kiri: Avatar + info */}
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-2xl bg-white/20">
                  {fotoUrl
                    ? <img src={fotoUrl} alt={guru.nama} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-black text-white/80">{guru.nama?.charAt(0) || 'G'}</div>}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm ${cfgStatus.dot}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white/60 text-xs font-medium">{fmtDate(now)}</span>
                </div>
                <h1 className="text-white font-black text-lg sm:text-2xl leading-tight truncate">{guru.nama || 'Guru'}</h1>
                <p className="text-white/50 text-xs truncate mb-2">{guru.nip || '-'}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => navigate('/guru/profil')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white ring-2 ring-white/30 ${cfgStatus.bg} hover:opacity-90 transition-opacity shadow-sm`}>
                    {cfgStatus.label}
                    {absensiHariIni?.jam_masuk && <span className="opacity-70">┬╖ {absensiHariIni.jam_masuk}</span>}
                  </button>
                  {rekapKelas.slice(0,3).map(k => (
                    <span key={k.kelas_id} className="inline-flex items-center gap-1 bg-white/15 text-white/80 text-[10px] px-2 py-0.5 rounded-full border border-white/20">
                      <GraduationCap size={9}/>{k.nama_kelas}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Kanan: Jam + refresh + kehadiran % */}
            <div className="hidden sm:flex flex-col items-end gap-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  <span className="text-white/70 text-[11px] font-mono">{fmtTime(now)}</span>
                </div>
                <button onClick={() => fetchData(true)} disabled={refreshing}
                  className="p-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition-colors">
                  <RefreshCw size={13} className={`text-white/70 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {/* Kehadiran % besar */}
              <div className="text-right">
                <p className="text-white/50 text-xs mb-0.5">Kehadiran Siswa Hari Ini</p>
                <div className="flex items-end gap-1 justify-end">
                  <span className="text-4xl font-black text-white tabular-nums leading-none">{pctHadir}</span>
                  <span className="text-white/60 text-lg mb-0.5">%</span>
                </div>
                <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden mt-1.5">
                  <motion.div initial={{ width:0 }} animate={{ width:`${pctHadir}%` }}
                    transition={{ duration:1.2, ease:'easeOut' }}
                    className="h-full rounded-full bg-white" />
                </div>
                <p className="text-white/40 text-[10px] mt-1">{totalHadir+totalTerlambat} / {totalSiswa} siswa</p>
              </div>
            </div>
          </div>

          {/* Mobile: jam + kehadiran */}
          <div className="flex items-center justify-between mt-4 sm:hidden">
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 border border-white/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="text-white/70 text-[11px] font-mono">{fmtTime(now)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-2xl tabular-nums">{pctHadir}%</span>
              <span className="text-white/50 text-xs">hadir</span>
              <button onClick={() => fetchData(true)} disabled={refreshing}
                className="p-1.5 rounded-full bg-white/15 border border-white/20">
                <RefreshCw size={12} className={`text-white/70 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick stat pills di bawah banner */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label:'Hadir',     val:totalHadir,     color:'text-emerald-200', bg:'bg-emerald-500/20 border-emerald-400/30' },
              { label:'Terlambat', val:totalTerlambat, color:'text-amber-200',   bg:'bg-amber-500/20 border-amber-400/30' },
              { label:'Izin',      val:totalIzin,      color:'text-blue-200',    bg:'bg-blue-500/20 border-blue-400/30' },
              { label:'Alpha',     val:totalAlpha,     color:'text-rose-200',    bg:'bg-rose-500/20 border-rose-400/30' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-2xl p-2.5 text-center backdrop-blur-sm`}>
                <p className={`text-xl font-black ${s.color} tabular-nums leading-none`}>{s.val}</p>
                <p className="text-white/50 text-[9px] mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
          SECTION 2 ΓÇö STAT CARDS (4 col) + ABSENSI GURU + STATISTIK
      ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div className="px-4 sm:px-6 mt-5 space-y-4">

        {/* Libur + Event Countdown */}
        {Array.isArray(events) && events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
            <LiburCountdown pengaturan={pengaturan}/>
            <EventCountdown events={events} eventFotos={eventFotos}/>
          </div>
        ) : (
          <LiburCountdown pengaturan={pengaturan}/>
        )}


        {/* Video + Stat Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-stretch">
          <DashboardVideo className="aspect-video w-full lg:h-auto lg:aspect-auto lg:col-span-1"/>
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map((s, i) => {
            const sparkData = grafikMingguan.length > 0
              ? grafikMingguan.map(d => ({ v: d[s.dataKey] || 0 }))
              : Array(7).fill({ v: 0 })
            return (
              <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.07, type:'spring', stiffness:120 }}
                className={`relative overflow-hidden bg-white dark:bg-slate-900 border ${s.border} rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 group cursor-default`}>
                <div className="absolute inset-x-0 top-0 h-0.5" style={{ background:`linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.iconBg} group-hover:scale-110 transition-transform`}>
                      <s.icon size={18} style={{ color: s.color }} />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums leading-none">{s.val}</p>
                    </div>
                  </div>
                  <p className={`text-xs font-semibold ${s.tc} mb-2`}>{s.label}</p>
                  <div className="h-8 -mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      {s.chartType === 'bar' ? (
                        <BarChart data={sparkData} margin={{top:0,right:0,left:0,bottom:0}} barCategoryGap="20%">
                          <defs><linearGradient id={`gb-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={s.color} stopOpacity={0.8}/><stop offset="100%" stopColor={s.color} stopOpacity={0.2}/>
                          </linearGradient></defs>
                          <Bar dataKey="v" fill={`url(#gb-${i})`} radius={[2,2,0,0]} maxBarSize={8} />
                        </BarChart>
                      ) : s.chartType === 'line' ? (
                        <ComposedChart data={sparkData} margin={{top:2,right:0,left:0,bottom:0}}>
                          <Line type="monotone" dataKey="v" stroke={s.color} strokeWidth={2}
                            dot={{ r:2, fill:s.color, strokeWidth:0 }} activeDot={false} />
                        </ComposedChart>
                      ) : (
                        <AreaChart data={sparkData} margin={{top:0,right:0,left:0,bottom:0}}>
                          <defs><linearGradient id={`ga-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={s.color} stopOpacity={0.35}/><stop offset="95%" stopColor={s.color} stopOpacity={0}/>
                          </linearGradient></defs>
                          <Area type="monotone" dataKey="v" stroke={s.color} strokeWidth={1.5} fill={`url(#ga-${i})`} dot={false} />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )
          })}
          </div>
        </div>

        {/* Row 2: Absensi Guru 7 Hari + Statistik + Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* Absensi Guru 7 Hari */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Calendar size={15} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Absensi Saya</p>
                  <p className="text-[10px] text-slate-400">7 hari terakhir</p>
                </div>
              </div>
              <button onClick={() => navigate('/guru/profil')}
                className="text-[10px] text-indigo-500 hover:text-indigo-600 font-semibold flex items-center gap-0.5 transition-colors">
                Profil <ChevronRight size={10}/>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {(grafikGuru.length > 0 ? grafikGuru.slice(-7) : Array(7).fill(null)).map((item, i) => (
                <DayDot key={i} item={item} />
              ))}
            </div>
            <div className="flex gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              {[['bg-emerald-500','Hadir'],['bg-amber-500','Terlambat'],['bg-rose-500','Alpha']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-sm ${c}`} />
                  <span className="text-[10px] text-slate-400 font-medium">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Statistik Guru */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <Activity size={15} className="text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Statistik Saya</p>
            </div>
            {/* Kehadiran % highlight */}
            <div className="relative overflow-hidden rounded-2xl p-4 mb-4"
              style={{ background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wide">Kehadiran Saya</p>
              <div className="flex items-end gap-1 mt-0.5">
                <span className="text-3xl font-black text-white tabular-nums leading-none">{statGuru.persentase_kehadiran || 0}</span>
                <span className="text-white/60 text-sm mb-0.5">%</span>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${(statGuru.persentase_kehadiran||0) >= 80 ? 'bg-emerald-400/25 text-emerald-200' : 'bg-rose-400/25 text-rose-200'}`}>
                  {(statGuru.persentase_kehadiran||0) >= 80 ? 'Γ£ô Baik' : 'ΓÜá Perlu'}
                </span>
              </div>
              <div className="mt-2.5 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div initial={{ width:0 }} animate={{ width:`${statGuru.persentase_kehadiran||0}%` }}
                  transition={{ duration:1, ease:'easeOut' }} className="h-full bg-white rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label:'Hadir',    val:statGuru.total_hadir||0,                  color:'text-emerald-600 dark:text-emerald-400', bg:'bg-emerald-50 dark:bg-emerald-900/20', border:'border-emerald-100 dark:border-emerald-800/40', dot:'bg-emerald-500' },
                { label:'Terlambat',val:statGuru.total_terlambat||0,             color:'text-amber-600 dark:text-amber-400',   bg:'bg-amber-50 dark:bg-amber-900/20',   border:'border-amber-100 dark:border-amber-800/40',   dot:'bg-amber-500' },
                { label:'Menit ┬▒',  val:`${statGuru.total_menit_terlambat||0}m`, color:'text-rose-600 dark:text-rose-400',     bg:'bg-rose-50 dark:bg-rose-900/20',     border:'border-rose-100 dark:border-rose-800/40',     dot:'bg-rose-500' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} ${s.border} border rounded-2xl p-3 text-center`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${s.dot} mx-auto mb-1.5`} />
                  <p className={`text-base font-black tabular-nums leading-none ${s.color}`}>{s.val}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3">
            <motion.button whileHover={{ y:-2, scale:1.01 }} whileTap={{ scale:0.97 }}
              onClick={() => navigate('/guru/izins')}
              className="relative overflow-hidden rounded-2xl p-4 text-left flex-1 shadow-lg"
              style={{ background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-white tabular-nums leading-none">{totalIzin}</p>
                  <p className="text-amber-100 text-[11px] font-semibold mt-1">Izin Pending</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Bell size={20} className="text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-amber-100/70 text-[10px] font-medium">
                <span>Kelola izin</span><ArrowUpRight size={10}/>
              </div>
            </motion.button>
            <motion.button whileHover={{ y:-2, scale:1.01 }} whileTap={{ scale:0.97 }}
              onClick={() => navigate('/guru/absensi')}
              className="relative overflow-hidden rounded-2xl p-4 text-left flex-1 shadow-lg"
              style={{ background:'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-white tabular-nums leading-none">{totalAlpha}</p>
                  <p className="text-red-100 text-[11px] font-semibold mt-1">Alpha Hari Ini</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-red-100/70 text-[10px] font-medium">
                <span>Lihat detail</span><ArrowUpRight size={10}/>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Row 3: Kelas Diampu + Distribusi Chart */}
        {rekapKelas.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Kelas cards */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                    <BookOpen size={15} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Kelas Diampu</p>
                    <p className="text-[10px] text-slate-400">Kehadiran hari ini</p>
                  </div>
                  <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{rekapKelas.length}</span>
                </div>
                <button onClick={() => navigate('/guru/rekap-harian')}
                  className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5 transition-colors">
                  Rekap <ChevronRight size={12}/>
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rekapKelas.map((k, i) => {
                  const hadir = k.hadir||0, terlambat = k.terlambat||0, total = k.total_siswa||0
                  const p = pct(hadir+terlambat, total)
                  const accentColor = p >= 80 ? '#10b981' : p >= 60 ? '#f59e0b' : '#ef4444'
                  const statItems = [
                    { label:'Hadir', val:hadir, c:'text-emerald-600 dark:text-emerald-400', bg:'bg-emerald-50 dark:bg-emerald-900/20', color:'#10b981' },
                    { label:'Terlambat', val:terlambat, c:'text-amber-600 dark:text-amber-400', bg:'bg-amber-50 dark:bg-amber-900/20', color:'#f59e0b' },
                    { label:'Izin', val:k.izin||0, c:'text-blue-600 dark:text-blue-400', bg:'bg-blue-50 dark:bg-blue-900/20', color:'#3b82f6' },
                    { label:'Alpha', val:k.alpha||0, c:'text-rose-600 dark:text-rose-400', bg:'bg-rose-50 dark:bg-rose-900/20', color:'#ef4444' },
                  ]
                  return (
                    <motion.div key={k.kelas_id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:i*0.05 }}
                      className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-4">
                      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl" style={{ background:accentColor }} />
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{k.nama_kelas}</p>
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full"
                          style={{ background:accentColor+'18', color:accentColor }}>{p}%</span>
                      </div>
                      {/* Stacked bar */}
                      <div className="w-full h-2 rounded-full overflow-hidden flex gap-0.5 mb-3">
                        {statItems.filter(x=>x.val>0).map((x,xi) => (
                          <div key={xi} className="h-full rounded-full" style={{ width:`${pct(x.val,total)}%`, backgroundColor:x.color, minWidth:pct(x.val,total)>0?'4px':0 }} />
                        ))}
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {statItems.map(s => (
                          <div key={s.label} className={`${s.bg} rounded-xl py-2 text-center`}>
                            <p className={`text-sm font-black ${s.c}`}>{s.val}</p>
                            <p className="text-[8px] text-slate-400 font-medium mt-0.5">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Distribusi stacked bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                  <BarChart2 size={15} className="text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Distribusi Kelas</p>
                  <p className="text-[10px] text-slate-400">Perbandingan kehadiran</p>
                </div>
              </div>
              <div className="p-4">
                {kelasDistribusi.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={kelasDistribusi} margin={{ top:5, right:5, left:-20, bottom:5 }} barCategoryGap="25%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                        <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} tick={{ fill:'#94a3b8' }} />
                        <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{ fill:'#94a3b8' }} />
                        <Tooltip contentStyle={{ backgroundColor:'#0f172a', border:'none', borderRadius:'10px', fontSize:'11px', color:'#fff', padding:'8px 12px' }}
                          labelStyle={{ fontWeight:700, marginBottom:'4px' }} />
                        <Bar dataKey="hadir"     fill="#10b981" maxBarSize={20} name="Hadir"     stackId="a" />
                        <Bar dataKey="terlambat" fill="#f59e0b" maxBarSize={20} name="Terlambat" stackId="a" />
                        <Bar dataKey="izin"      fill="#3b82f6" maxBarSize={20} name="Izin"      stackId="a" />
                        <Bar dataKey="alpha"     fill="#ef4444" radius={[3,3,0,0]} maxBarSize={20} name="Alpha" stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
                      {[['#10b981','Hadir'],['#f59e0b','Terlambat'],['#3b82f6','Izin'],['#ef4444','Alpha']].map(([c,l]) => (
                        <div key={l} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm" style={{ background:c }} />
                          <span className="text-[9px] text-slate-400">{l}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[180px] text-slate-400 text-xs">Belum ada data</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
          SECTION 3 ΓÇö GRAFIK TREN + RANKING SISWA
      ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div className="px-4 sm:px-6 mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Grafik Tren Kehadiran */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
          <div className="relative overflow-hidden px-5 pt-4 pb-3"
            style={{ background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm">Tren Kehadiran Siswa</h2>
                  <p className="text-[11px] text-white/60">7 hari terakhir</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                {[
                  { label:'Hadir',     val:grafikMingguan.reduce((a,d)=>a+(d.hadir||0),0),     c:'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' },
                  { label:'Terlambat', val:grafikMingguan.reduce((a,d)=>a+(d.terlambat||0),0), c:'bg-amber-500/20 text-amber-200 border-amber-400/30' },
                  { label:'Alpha',     val:grafikMingguan.reduce((a,d)=>a+(d.alpha||0),0),     c:'bg-rose-500/20 text-rose-200 border-rose-400/30' },
                ].map(b => (
                  <span key={b.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.c}`}>
                    {b.label}: {b.val}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="px-4 pt-4 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={grafikMingguan.length > 0 ? grafikMingguan : Array.from({length:7},(_,i)=>({hari:`H-${i+1}`,hadir:0,terlambat:0,alpha:0}))}
                margin={{ top:8, right:8, left:-12, bottom:0 }}>
                <defs>
                  <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="100%" stopColor="#10b981" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25}/><stop offset="100%" stopColor="#ef4444" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="hari" tickFormatter={v => typeof v==='string' ? v.slice(0,3) : String(v)}
                  tick={{ fill:'#94a3b8', fontSize:10, fontWeight:500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#94a3b8', fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl px-3.5 py-2.5 text-xs min-w-[130px]">
                        <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
                        {payload.map(p => (
                          <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-1 last:mb-0">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ background:p.color }} />
                              <span className="text-slate-500 dark:text-slate-400">{p.name}</span>
                            </div>
                            <span className="font-bold tabular-nums" style={{ color:p.color }}>{p.value ?? 0}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                  cursor={{ stroke:'rgba(102,126,234,0.15)', strokeWidth:1, strokeDasharray:'4 3' }}
                />
                <Area type="monotone" dataKey="hadir"     name="Hadir"     stroke="#10b981" strokeWidth={2.5} fill="url(#gH)" dot={false} activeDot={{ r:5, fill:'#10b981', strokeWidth:2, stroke:'#fff' }} animationDuration={1000} />
                <Area type="monotone" dataKey="terlambat" name="Terlambat" stroke="#f59e0b" strokeWidth={2}   fill="url(#gT)" dot={false} activeDot={{ r:4, fill:'#f59e0b', strokeWidth:2, stroke:'#fff' }} animationDuration={1100} />
                <Area type="monotone" dataKey="alpha"     name="Alpha"     stroke="#ef4444" strokeWidth={2}   fill="url(#gA)" dot={false} activeDot={{ r:4, fill:'#ef4444', strokeWidth:2, stroke:'#fff' }} animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-4 flex items-center justify-center gap-5">
            {[['#10b981','Hadir'],['#f59e0b','Terlambat'],['#ef4444','Alpha']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background:c }} />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
          <div className="h-0.5 transition-all duration-500"
            style={{ background: activeTab==='rajin'
              ? 'linear-gradient(90deg, transparent, #667eea, transparent)'
              : activeTab==='terlambat'
              ? 'linear-gradient(90deg, transparent, #f59e0b, transparent)'
              : 'linear-gradient(90deg, transparent, #f43f5e, transparent)' }} />
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            {[
              { key:'rajin',     label:'Terbaik',   icon:Award,         at:'text-indigo-600 dark:text-indigo-400', ab:'border-indigo-500' },
              { key:'terlambat', label:'Terlambat', icon:Clock,         at:'text-amber-500 dark:text-amber-400',   ab:'border-amber-500' },
              { key:'alpha',     label:'Alpha',     icon:AlertTriangle, at:'text-rose-500 dark:text-rose-400',     ab:'border-rose-500' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold transition-all border-b-2 ${
                  activeTab===tab.key
                    ? `${tab.at} ${tab.ab} bg-slate-50/80 dark:bg-slate-800/50`
                    : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'}`}>
                <tab.icon size={11}/>{tab.label}
              </button>
            ))}
          </div>
          <div className="p-4">
            <AnimatePresence mode="wait">
              {activeTab==='rajin' && (
                <motion.div key="rajin" initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} transition={{ duration:0.18 }}>
                  {!(statistik?.siswa_rajin?.length) ? (
                    <div className="flex flex-col items-center py-10 gap-2 text-slate-400"><Award size={24}/><p className="text-xs">Belum ada data</p></div>
                  ) : (
                    <div className="space-y-2">
                      {statistik.siswa_rajin.slice(0,5).map((s,i) => <RankRow key={i} s={s} i={i} valKey="total_hadir" colors={RANK_COLORS.rajin} />)}
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab==='terlambat' && (
                <motion.div key="terlambat" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:0.18 }}>
                  {!(statistik?.siswa_sering_terlambat?.length) ? (
                    <div className="flex flex-col items-center py-10 gap-2"><div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><CheckCircle size={18} className="text-emerald-500"/></div><p className="text-xs text-slate-400">Tidak ada siswa terlambat</p></div>
                  ) : (
                    <div className="space-y-2">
                      {statistik.siswa_sering_terlambat.slice(0,5).map((s,i) => <RankRow key={i} s={s} i={i} valKey="total_terlambat" colors={RANK_COLORS.terlambat} />)}
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab==='alpha' && (
                <motion.div key="alpha" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }} transition={{ duration:0.18 }}>
                  {!(statistik?.siswa_sering_alpha?.length) ? (
                    <div className="flex flex-col items-center py-10 gap-2"><div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><CheckCircle size={18} className="text-emerald-500"/></div><p className="text-xs text-slate-400">Tidak ada siswa alpha</p></div>
                  ) : (
                    <div className="space-y-2">
                      {statistik.siswa_sering_alpha.slice(0,5).map((s,i) => <RankRow key={i} s={s} i={i} valKey="total_alpha" colors={RANK_COLORS.alpha} />)}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => navigate('/guru/ranking')}
              className="mt-3 w-full text-xs font-semibold flex items-center justify-center gap-1 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
              Lihat Ranking Lengkap <ChevronRight size={12}/>
            </button>
          </div>
        </div>
      </div>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
          SECTION 4 ΓÇö IZIN PENDING + ABSENSI TERBARU + RINGKASAN BULAN
      ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div className="px-4 sm:px-6 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Izin Pending */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <FileText size={15} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Izin Pending</p>
                <p className="text-[10px] text-slate-400">Menunggu persetujuan</p>
              </div>
              {izinPending.length > 0 && (
                <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{izinPending.length}</span>
              )}
            </div>
            <button onClick={() => navigate('/guru/izins')}
              className="text-xs font-semibold text-amber-500 hover:text-amber-600 flex items-center gap-0.5 transition-colors">
              Kelola <ChevronRight size={12}/>
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {izinPending.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <CheckCircle size={18} className="text-emerald-500" />
                </div>
                <p className="text-xs text-slate-400">Tidak ada izin pending</p>
              </div>
            ) : izinPending.slice(0,5).map((izin, i) => (
              <motion.div key={izin.id || i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i*0.05 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-600">
                  {izin.siswa?.foto_url
                    ? <img src={izin.siswa.foto_url} alt="" className="w-full h-full object-cover" onError={e=>e.target.style.display='none'} />
                    : (izin.siswa?.nama_lengkap || izin.nama_siswa || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{izin.siswa?.nama_lengkap || izin.nama_siswa || '-'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{izin.keterangan || izin.jenis_izin || 'Izin'}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[9px] text-slate-400">{izin.tanggal ? new Date(izin.tanggal).toLocaleDateString('id-ID',{day:'numeric',month:'short'}) : '-'}</span>
                  <button onClick={() => navigate('/guru/izins')}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-200 transition-colors">
                    Review
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Absensi Terbaru Siswa */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <Activity size={15} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Aktivitas Terbaru</p>
                <p className="text-[10px] text-slate-400">Absensi siswa hari ini</p>
              </div>
            </div>
            <button onClick={() => navigate('/guru/absensi')}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5 transition-colors">
              Semua <ChevronRight size={12}/>
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {absensiTerbaru.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Activity size={18} className="text-slate-400" />
                </div>
                <p className="text-xs text-slate-400">Belum ada aktivitas</p>
              </div>
            ) : absensiTerbaru.slice(0,6).map((a, i) => {
              const statusColor = {
                hadir:'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
                terlambat:'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
                izin:'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                alpha:'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
              }
              const dotColor = { hadir:'bg-emerald-500', terlambat:'bg-amber-500', izin:'bg-blue-500', alpha:'bg-rose-500' }
              return (
                <motion.div key={a.id || i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i*0.04 }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor[a.status] || 'bg-slate-400'}`} />
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500">
                    {a.siswa?.foto_url
                      ? <img src={a.siswa.foto_url} alt="" className="w-full h-full object-cover" onError={e=>e.target.style.display='none'} />
                      : (a.siswa?.nama_lengkap || a.nama_siswa || '?').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{a.siswa?.nama_lengkap || a.nama_siswa || '-'}</p>
                    {a.jam_masuk && <p className="text-[9px] text-slate-400 font-mono">{a.jam_masuk}</p>}
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${statusColor[a.status] || statusColor.alpha}`}>
                    {a.status}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Ringkasan Bulan Ini */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Target size={15} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Ringkasan Bulan Ini</p>
              <p className="text-[10px] text-slate-400">{new Date().toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {/* Kehadiran siswa bulan ini */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Total Absensi Siswa</p>
                <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums">{data?.bulan_ini || 0}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(100, ((data?.bulan_ini||0)/Math.max(totalSiswa*20,1))*100)}%` }}
                  transition={{ duration:1, ease:'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              </div>
            </div>
            {/* Distribusi status bulan ini dari ranking */}
            {statistik && (
              <div className="space-y-2.5">
                {[
                  { label:'Siswa Rajin', val:statistik.siswa_rajin?.length||0, color:'text-emerald-600 dark:text-emerald-400', bg:'bg-emerald-50 dark:bg-emerald-900/20', border:'border-emerald-100 dark:border-emerald-800/40', icon:Award },
                  { label:'Sering Terlambat', val:statistik.siswa_sering_terlambat?.filter(s=>s.total_terlambat>0).length||0, color:'text-amber-600 dark:text-amber-400', bg:'bg-amber-50 dark:bg-amber-900/20', border:'border-amber-100 dark:border-amber-800/40', icon:Clock },
                  { label:'Sering Alpha', val:statistik.siswa_sering_alpha?.filter(s=>s.total_alpha>0).length||0, color:'text-rose-600 dark:text-rose-400', bg:'bg-rose-50 dark:bg-rose-900/20', border:'border-rose-100 dark:border-rose-800/40', icon:AlertTriangle },
                ].map(s => (
                  <div key={s.label} className={`flex items-center gap-3 p-3 ${s.bg} ${s.border} border rounded-xl`}>
                    <div className={`w-7 h-7 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center flex-shrink-0`}>
                      <s.icon size={13} className={s.color} />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex-1">{s.label}</span>
                    <span className={`text-sm font-black tabular-nums ${s.color}`}>{s.val}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Kehadiran guru bulan ini */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Kehadiran Saya Bulan Ini</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${statGuru.persentase_kehadiran||0}%` }}
                    transition={{ duration:1, ease:'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background:'linear-gradient(90deg, #667eea, #764ba2)' }} />
                </div>
                <span className="text-sm font-black tabular-nums text-slate-800 dark:text-white">{statGuru.persentase_kehadiran||0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
          SECTION 5 ΓÇö MENU CEPAT
      ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div className="px-4 sm:px-6 mt-4">
        {(pengaturan?.prestasi_siswa || []).some(s => s?.nama) && (
          <div className="mb-4">
            <SiswaBerprestasi
              judul={pengaturan.prestasi_judul}
              deskripsi={pengaturan.prestasi_deskripsi}
              siswaList={pengaturan.prestasi_siswa || []}
            />
          </div>
        )}
      </div>
      <div className="px-4 sm:px-6 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={13} className="text-slate-400" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu Cepat</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {[
            { icon:ClipboardList, label:'Absensi',      to:'/guru/absensi',        color:'#667eea', bg:'bg-indigo-50 dark:bg-indigo-900/20',   border:'border-indigo-100 dark:border-indigo-800/40',   tc:'text-indigo-600 dark:text-indigo-400' },
            { icon:FileText,      label:'Izin Siswa',   to:'/guru/izins',           color:'#f59e0b', bg:'bg-amber-50 dark:bg-amber-900/20',     border:'border-amber-100 dark:border-amber-800/40',     tc:'text-amber-600 dark:text-amber-400' },
            { icon:BarChart2,     label:'Rekap Harian', to:'/guru/rekap-harian',    color:'#10b981', bg:'bg-emerald-50 dark:bg-emerald-900/20', border:'border-emerald-100 dark:border-emerald-800/40', tc:'text-emerald-600 dark:text-emerald-400' },
            { icon:Star,          label:'Ranking',      to:'/guru/ranking',         color:'#8b5cf6', bg:'bg-violet-50 dark:bg-violet-900/20',   border:'border-violet-100 dark:border-violet-800/40',   tc:'text-violet-600 dark:text-violet-400' },
            { icon:Users,         label:'Data Siswa',   to:'/guru/data-siswa',      color:'#3b82f6', bg:'bg-blue-50 dark:bg-blue-900/20',       border:'border-blue-100 dark:border-blue-800/40',       tc:'text-blue-600 dark:text-blue-400' },
            { icon:Activity,      label:'Statistik',    to:'/guru/statistik-kelas', color:'#64748b', bg:'bg-slate-100 dark:bg-slate-800',       border:'border-slate-200 dark:border-slate-700',        tc:'text-slate-600 dark:text-slate-400' },
          ].map((item, i) => (
            <motion.button key={item.to}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.05 }}
              whileHover={{ y:-3, scale:1.02 }} whileTap={{ scale:0.97 }}
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center gap-2.5 p-4 ${item.bg} ${item.border} border rounded-2xl hover:shadow-md transition-all group`}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
                style={{ background:`${item.color}18` }}>
                <item.icon size={18} style={{ color:item.color }} />
              </div>
              <span className={`text-[11px] font-semibold ${item.tc} text-center leading-tight`}>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

    </div>
  )
}
