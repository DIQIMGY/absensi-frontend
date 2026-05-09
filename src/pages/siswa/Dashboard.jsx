import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck, Clock, FileText, AlertTriangle, Calendar,
  CheckCircle, XCircle, AlertCircle, History, GraduationCap,
  ChevronRight, Trophy, Crown, RefreshCw, Coffee, Sun, Moon,
  Smile, QrCode, Shield, Flame, User, TrendingUp, Award,
  Target, BookOpen, Zap, BarChart2, Star, Sparkles,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { siswaApi } from '../../services/siswaService'
import { publicApi } from '../../services/publicApi'
import { useAuthStore } from '../../stores/authStore'
import { usePengaturanStore } from '../../stores/pengaturanStore'
import RankingNotification from '../../components/RankingNotification'
import PulangNotification from '../../components/PulangNotification'
import SantaiDirumahNotification from '../../components/SantaiDirumahNotification'
import SelamatPulangNotification from '../../components/SelamatPulangNotification'
import LiburCountdown from '../../components/LiburCountdown'
import DashboardVideo from '../../components/DashboardVideo'
import EventCountdown from '../../components/EventCountdown'
import BudayaIndonesia from '../../components/BudayaIndonesia'
import AlamIndonesia from '../../components/AlamIndonesia'
import KampusImpian from '../../components/KampusImpian'
import TopKampus from '../../components/TopKampus'
import SiswaBerprestasi from '../../components/SiswaBerprestasi'
import GachaHarian, { BadgeOverlay } from '../../components/GachaHarian'
import BorderWindowNotification from '../../components/BorderWindowNotification'
import toast from 'react-hot-toast'

const STATUS_CFG = {
  hadir:     { label:'Hadir',     icon:<CheckCircle size={12}/>,  dot:'bg-emerald-500', hex:'#10b981', pill:'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' },
  terlambat: { label:'Terlambat', icon:<Clock size={12}/>,        dot:'bg-amber-500',   hex:'#f59e0b', pill:'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40' },
  izin:      { label:'Izin',      icon:<FileText size={12}/>,     dot:'bg-violet-500',  hex:'#8b5cf6', pill:'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/40' },
  alpha:     { label:'Alpha',     icon:<XCircle size={12}/>,      dot:'bg-rose-500',    hex:'#f43f5e', pill:'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40' },
}

const getStreakTier = (s) => {
  if (s >= 75) return { accent:'#7c3aed', soft:'rgba(124,58,237,0.12)', label:'Legenda',   emoji:'🔮', next:null }
  if (s >= 50) return { accent:'#dc2626', soft:'rgba(220,38,38,0.10)',  label:'Membara',   emoji:'🔥', next:`${75-s} hari ke Legenda` }
  if (s >= 20) return { accent:'#ea580c', soft:'rgba(234,88,12,0.10)',  label:'Konsisten', emoji:'⚡',    next:`${50-s} hari ke Membara` }
  if (s >= 1)  return { accent:'#d97706', soft:'rgba(217,119,6,0.10)',  label:'Semangat',  emoji:'🌟', next:`${20-s} hari ke Konsisten` }
  return         { accent:'#6366f1', soft:'rgba(99,102,241,0.08)',  label:'Mulai',     emoji:'🚀', next:'Hadir hari ini untuk mulai' }
}

const Avatar = ({ src, name, size = 32, className = '' }) => {
  const [err, setErr] = useState(false)
  return (
    <div className={`rounded-full overflow-hidden flex items-center justify-center font-bold flex-shrink-0 bg-gradient-to-br from-violet-400 to-indigo-500 text-white ${className}`}
      style={{ width:size, height:size, fontSize:Math.round(size*0.38) }}>
      {src && !err
        ? <img src={src} alt={name} className="w-full h-full object-cover" onError={()=>setErr(true)}/>
        : (name||'?').charAt(0).toUpperCase()}
    </div>
  )
}

export default function SiswaDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [ranking, setRanking] = useState(null)
  const [izinToday, setIzinToday] = useState(null)
  const [izinList, setIzinList] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showRankingNotif, setShowRankingNotif] = useState(false)
  const [now, setNow] = useState(new Date())
  const [rankTab, setRankTab] = useState('rajin')
  const [isDark, setIsDark] = useState(false)
  const [events, setEvents] = useState([])
  const [eventFotos, setEventFotos] = useState([])
  const [topKey, setTopKey] = useState(0)
  const [activeBadge, setActiveBadge] = useState(null)
  const [ownedBadges, setOwnedBadges] = useState([])
  const { pengaturan, fetchPengaturan } = usePengaturanStore()

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes:true, attributeFilter:['class'] })
    return () => obs.disconnect()
  }, [])

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      await fetchPengaturan(true)
      // Ambil events dari public API langsung
      try {
        const pRes = await publicApi.getPengaturan()
        const evts = pRes?.data?.data?.events
        if (Array.isArray(evts)) setEvents(evts)
        const fotos = pRes?.data?.data?.event_fotos
        if (Array.isArray(fotos)) setEventFotos(fotos)
      } catch(e) { /* ignore */ }
      const [dashRes, rankRes, izinRes, izinListRes] = await Promise.allSettled([
        siswaApi.getDashboard(), siswaApi.getRanking(), siswaApi.getIzinToday(),
        siswaApi.getIzins({ per_page: 5 }),
      ])
      if (dashRes.status === 'fulfilled') setData(dashRes.value.data.data)
      if (rankRes.status === 'fulfilled') {
        const rd = rankRes.value.data.data; setRanking(rd)
        const masuk = rd.kelas?.masuk_ranking?.rajin || rd.kelas?.masuk_ranking?.terlambat || rd.kelas?.masuk_ranking?.alpha
          || rd.sekolah?.masuk_ranking?.rajin || rd.sekolah?.masuk_ranking?.terlambat || rd.sekolah?.masuk_ranking?.alpha
        // Hanya tampilkan sekali per hari
        const rankKey = `ranking_notif_${new Date().toDateString()}`
        if (masuk && !sessionStorage.getItem(rankKey)) {
          sessionStorage.setItem(rankKey, '1')
          setShowRankingNotif(true)
        }
      }
      if (izinRes.status === 'fulfilled' && izinRes.value.data.data) setIzinToday(izinRes.value.data.data)
      if (izinListRes.status === 'fulfilled') {
        const d = izinListRes.value.data
        setIzinList(Array.isArray(d) ? d : (d?.data || []))
      }
      // Gacha status (silent)
      try {
        const gRes = await siswaApi.getGachaStatus()
        // Cek juga border window — border window override gacha jika aktif
        let activeBadgeId = gRes.data.active_badge
        let badges = gRes.data.badges || []
        try {
          const bwRes = await siswaApi.getBorderWindowStatus()
          // Border window override HANYA kalau ada active_badge (tidak null)
          // dan border_expires_at masih valid (border_sisa_detik > 0)
          if (bwRes.data.active_badge && bwRes.data.border_sisa_detik > 0) {
            activeBadgeId = bwRes.data.active_badge
          }
        } catch { /* ignore */ }
        setActiveBadge(activeBadgeId)
        setOwnedBadges(badges)
      } catch { /* ignore */ }
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Auto-polling setiap 30 detik � supaya dashboard update otomatis setelah sync fingerprint
  useEffect(() => {
    const poll = setInterval(() => fetchAll(true), 30000)
    return () => clearInterval(poll)
  }, [fetchAll])

  const getGreeting = () => {
    const h = now.getHours()
    if (h < 12) return { text:'Pagi', icon:<Coffee size={11} className="text-amber-400"/> }
    if (h < 15) return { text:'Siang', icon:<Sun size={11} className="text-yellow-400"/> }
    if (h < 18) return { text:'Sore', icon:<Smile size={11} className="text-orange-400"/> }
    return { text:'Malam', icon:<Moon size={11} className="text-indigo-400"/> }
  }

  const isHariAktif = () => (pengaturan?.hari_aktif || []).includes(new Date().toLocaleDateString('id-ID',{weekday:'long'}))
  const isLibur = () => {
    if (!pengaturan?.status_libur || !pengaturan?.tanggal_libur_mulai || !pengaturan?.tanggal_libur_selesai) return false
    const today = new Date(); today.setHours(0,0,0,0)
    const mulai = new Date(pengaturan.tanggal_libur_mulai); mulai.setHours(0,0,0,0)
    const selesai = new Date(pengaturan.tanggal_libur_selesai); selesai.setHours(0,0,0,0)
    return today >= mulai && today <= selesai
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
      <p className="text-sm text-slate-400">Memuat dashboard...</p>
    </div>
  )

  const totalAbsensi = (data?.total_hadir||0)+(data?.total_terlambat||0)+(data?.total_izin||0)+(data?.total_alpha||0)
  const pctHadir = totalAbsensi > 0 ? Math.round(((data?.total_hadir||0)+(data?.total_terlambat||0))/totalAbsensi*100) : 0
  const pctBulan = data?.bulan_ini > 0 ? Math.round(((data?.total_hadir_bulan||0)+(data?.total_terlambat_bulan||0))/data.bulan_ini*100) : 0
  const pctMinggu = data?.minggu_ini > 0 ? Math.round(((data?.total_hadir_minggu||0)+(data?.total_terlambat_minggu||0))/data.minggu_ini*100) : 0
  const riwayat = data?.riwayat_terakhir || []
  const absenHariIni = data?.absensi_hari_ini
  const streak = data?.streak_hadir || 0
  const greeting = getGreeting()
  const tier = getStreakTier(streak)

  const statusHariIni = izinToday ? 'izin' : absenHariIni?.status || 'belum'
  const cfgHariIni = STATUS_CFG[statusHariIni]

  const mkSpark = (key) => riwayat.slice().reverse().map(r => ({ v: r.status === key ? 1 : 0 }))
  const riwayatChart = riwayat.slice().reverse().map(r => ({
    name: r.tanggal ? r.tanggal.split(' ')[0] : '-',
    hadir: r.status==='hadir'?1:0, terlambat: r.status==='terlambat'?1:0,
    alpha: r.status==='alpha'?1:0, izin: r.status==='izin'?1:0,
  }))

  const myId = data?.siswa?.id
  const rankData = {
    rajin:     { list:ranking?.kelas?.siswa_rajin||[],     valKey:'total_hadir',     label:'Hadir',     color:'#f59e0b', posisi:ranking?.kelas?.posisi_ranking?.rajin },
    terlambat: { list:ranking?.kelas?.siswa_terlambat||[], valKey:'total_terlambat', label:'Terlambat', color:'#f97316', posisi:ranking?.kelas?.posisi_ranking?.terlambat },
    alpha:     { list:ranking?.kelas?.siswa_alpha||[],     valKey:'total_alpha',     label:'Alpha',     color:'#ef4444', posisi:ranking?.kelas?.posisi_ranking?.alpha },
  }
  const activeRank = rankData[rankTab]

  const streakMilestones = [1, 20, 50, 75]
  const nextMilestone = streakMilestones.find(m => streak < m) || 75
  const prevMilestone = streakMilestones.filter(m => streak >= m).pop() || 0
  const streakPct = nextMilestone === prevMilestone ? 100 : Math.round(((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)

  const statusGradient = {
    hadir:     'from-emerald-600 via-emerald-500 to-teal-500',
    terlambat: 'from-amber-600 via-amber-500 to-orange-400',
    izin:      'from-violet-700 via-violet-600 to-purple-500',
    alpha:     'from-rose-700 via-rose-600 to-pink-500',
    belum:     'from-indigo-800 via-indigo-700 to-violet-700',
  }
  const heroBg = statusGradient[statusHariIni] || statusGradient.belum

  return (
    <>
      <RankingNotification show={showRankingNotif} ranking={ranking} onClose={() => setShowRankingNotif(false)}/>
      <PulangNotification/>
      <SantaiDirumahNotification/>
      <BorderWindowNotification/>
      {absenHariIni && <SelamatPulangNotification statusKehadiran={absenHariIni.status} dataAbsensi={absenHariIni}/>}

      <div className="pb-12">

        {/* ══ HERO BANNER ══ */}
        <div className="relative mx-3 sm:mx-4 mt-4 rounded-2xl"
          style={{ background: statusHariIni==='hadir' ? 'linear-gradient(135deg,#064e3b 0%,#065f46 40%,#0f766e 100%)'
            : statusHariIni==='terlambat' ? 'linear-gradient(135deg,#78350f 0%,#92400e 40%,#b45309 100%)'
            : statusHariIni==='izin'      ? 'linear-gradient(135deg,#2e1065 0%,#4c1d95 40%,#5b21b6 100%)'
            : statusHariIni==='alpha'     ? 'linear-gradient(135deg,#4c0519 0%,#881337 40%,#9f1239 100%)'
            : 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#312e81 100%)' }}>

          {/* Decorative */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/8 pointer-events-none"/>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-black/15 pointer-events-none"/>
          <div className="absolute inset-0 opacity-[0.035]"
            style={{backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',backgroundSize:'20px 20px'}}/>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"/>

          <div className="relative z-10 p-4 sm:p-5">

            {/* ── ROW 1: Avatar + Info + Refresh ── */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 overflow-hidden shadow-lg bg-white/15 ${
                  activeBadge
                    ? 'rounded-full ring-0'
                    : 'rounded-2xl ring-2 ring-white/25'
                }`}>
                  {data?.siswa?.foto
                    ? <img src={data.siswa.foto} alt="foto" className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-xl font-black text-white/80">
                        {(data?.siswa?.nama||user?.name||'S').charAt(0).toUpperCase()}
                      </div>}
                </div>
                {/* Badge overlay di foto profil */}
                {activeBadge && <BadgeOverlay badgeId={activeBadge} badges={ownedBadges} size="md" />}
                {!activeBadge && <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white/40 shadow-sm ${
                  statusHariIni==='hadir'?'bg-emerald-400':statusHariIni==='terlambat'?'bg-amber-400':
                  statusHariIni==='izin'?'bg-violet-400':statusHariIni==='alpha'?'bg-rose-400':'bg-white/30'}`}/>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {greeting.icon}
                  <span className="text-white/55 text-[11px]">Selamat {greeting.text}</span>
                  <span className="text-white/25 text-[11px]">�</span>
                  <span className="text-white/45 text-[11px] font-mono">{now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span>
                </div>
                <h1 className="text-base sm:text-lg font-black text-white leading-tight truncate">{data?.siswa?.nama||user?.name||'Siswa'}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white/40 text-[10px] flex items-center gap-1"><Shield size={8}/>{data?.siswa?.nis||'-'}</span>
                  <span className="text-white/25 text-[10px]">�</span>
                  <span className="text-white/40 text-[10px] flex items-center gap-1"><GraduationCap size={8}/>{data?.siswa?.kelas||'-'}</span>
                </div>
              </div>

              {/* Streak + Refresh */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-col items-center bg-white/10 rounded-xl px-2.5 py-1.5 border border-white/10">
                  <span className="text-lg font-black text-white tabular-nums leading-none">{streak}</span>
                  <span className="text-white/45 text-[9px] font-semibold">{tier.emoji} streak</span>
                </div>
                <button onClick={()=>fetchAll(true)} disabled={refreshing}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
                  <RefreshCw size={12} className={`text-white/60 ${refreshing?'animate-spin':''}`}/>
                </button>
              </div>
            </div>

            {/* ── ROW 2: Status + Absen button ── */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 border border-white/10">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  statusHariIni==='hadir'?'bg-emerald-400 shadow-[0_0_6px_#34d399]':
                  statusHariIni==='terlambat'?'bg-amber-400 shadow-[0_0_6px_#fbbf24]':
                  statusHariIni==='izin'?'bg-violet-400':statusHariIni==='alpha'?'bg-rose-400':'bg-white/40 animate-pulse'}`}/>
                <div className="flex-1 min-w-0">
                  <span className="text-white/45 text-[9px] uppercase tracking-widest font-semibold">Status </span>
                  <span className="text-white font-black text-sm capitalize">
                    {statusHariIni==='belum'?'Belum Absen':cfgHariIni?.label||statusHariIni}
                  </span>
                  {absenHariIni?.jam_masuk && absenHariIni.jam_masuk!=='-' &&
                    <span className="text-white/45 font-mono text-xs ml-1.5">⏰ {absenHariIni.jam_masuk}</span>}
                </div>
              </div>
              {statusHariIni==='belum' && (
                <button onClick={()=>navigate('/siswa/absen')}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/20 transition-colors">
                  <QrCode size={11}/> Absen
                </button>
              )}
              {ranking?.kelas?.posisi_ranking?.rajin && (
                <div className="flex-shrink-0 flex items-center gap-1 bg-amber-400/20 rounded-xl px-2.5 py-2 border border-amber-400/30">
                  <Trophy size={10} className="text-amber-300"/>
                  <span className="text-amber-300 text-xs font-black">#{ranking.kelas.posisi_ranking.rajin}</span>
                </div>
              )}
            </div>

            {/* ── ROW 3: 4 stat pills + kehadiran % ── */}
            <div className="mt-2.5 flex items-center gap-2">
              {/* 4 stats */}
              <div className="flex-1 grid grid-cols-4 gap-1.5">
                {[
                  {label:'Hadir',     val:data?.total_hadir||0,     c:'text-emerald-200', bg:'bg-emerald-500/20 border-emerald-400/20'},
                  {label:'Terlambat', val:data?.total_terlambat||0, c:'text-amber-200',   bg:'bg-amber-500/20 border-amber-400/20'},
                  {label:'Izin',      val:data?.total_izin||0,      c:'text-violet-200',  bg:'bg-violet-500/20 border-violet-400/20'},
                  {label:'Alpha',     val:data?.total_alpha||0,     c:'text-rose-200',    bg:'bg-rose-500/20 border-rose-400/20'},
                ].map(s=>(
                  <div key={s.label} className={`${s.bg} border rounded-xl py-2 text-center`}>
                    <p className={`text-sm sm:text-base font-black ${s.c} tabular-nums leading-none`}>{s.val}</p>
                    <p className="text-white/35 text-[9px] mt-0.5 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Kehadiran % */}
              <div className="flex-shrink-0 flex flex-col items-center bg-white/10 rounded-xl px-3 py-2 border border-white/10 min-w-[52px]">
                <span className="text-white font-black text-base tabular-nums leading-none">{pctHadir}%</span>
                <span className="text-white/40 text-[9px] mt-0.5">hadir</span>
              </div>
            </div>

            {/* ── Progress bar ── */}
            <div className="mt-2.5 h-1 bg-black/20 rounded-full overflow-hidden">
              <motion.div initial={{width:0}} animate={{width:`${pctHadir}%`}}
                transition={{duration:1.2,ease:'easeOut',delay:0.3}}
                className="h-full rounded-full"
                style={{background: pctHadir>=80?'rgba(52,211,153,0.8)':pctHadir>=60?'rgba(251,191,36,0.8)':'rgba(248,113,113,0.8)'}}/>
            </div>
          </div>
        </div>

        {/* ══ MAIN CONTENT ══ */}
        <div className="px-3 sm:px-4 mt-3 space-y-3">

          {/* Alert hari tidak aktif */}
          <AnimatePresence>
            {!isLibur() && !isHariAktif() && (
              <motion.div key="nonaktif" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                <span className="text-xl">🏖️</span>
                <div>
                  <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">Hari Tidak Aktif</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Hari ini bukan hari sekolah.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Libur + Event Countdown */}
          {Array.isArray(events) && events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-stretch">
              <LiburCountdown pengaturan={pengaturan}/>
              <EventCountdown events={events} eventFotos={eventFotos}/>
            </div>
          ) : (
            <LiburCountdown pengaturan={pengaturan}/>
          )}
          {/* Video + Stat Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5 items-stretch">
            <DashboardVideo className="aspect-video w-full lg:h-auto lg:aspect-auto lg:col-span-1"/>
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              {label:'Total Hadir', val:data?.total_hadir||0,     icon:UserCheck,     color:'#10b981', grad:'from-emerald-500 to-teal-600',   border:'border-emerald-200 dark:border-emerald-700/50', tc:'text-emerald-700 dark:text-emerald-300', iconBg:'bg-emerald-100 dark:bg-emerald-900/50', bg:'bg-emerald-50 dark:bg-emerald-950/40', key:'hadir',     chartType:'area'},
              {label:'Terlambat',   val:data?.total_terlambat||0, icon:Clock,         color:'#f59e0b', grad:'from-amber-500 to-orange-500',    border:'border-amber-200 dark:border-amber-700/50',   tc:'text-amber-700 dark:text-amber-300',   iconBg:'bg-amber-100 dark:bg-amber-900/50',   bg:'bg-amber-50 dark:bg-amber-950/40',   key:'terlambat', chartType:'bar'},
              {label:'Izin',        val:data?.total_izin||0,      icon:FileText,      color:'#8b5cf6', grad:'from-violet-500 to-purple-600',   border:'border-violet-200 dark:border-violet-700/50', tc:'text-violet-700 dark:text-violet-300', iconBg:'bg-violet-100 dark:bg-violet-900/50', bg:'bg-violet-50 dark:bg-violet-950/40', key:'izin',      chartType:'line'},
              {label:'Alpha',       val:data?.total_alpha||0,     icon:AlertTriangle, color:'#f43f5e', grad:'from-rose-500 to-pink-600',       border:'border-rose-200 dark:border-rose-700/50',     tc:'text-rose-700 dark:text-rose-300',     iconBg:'bg-rose-100 dark:bg-rose-900/50',     bg:'bg-rose-50 dark:bg-rose-950/40',     key:'alpha',     chartType:'bar'},
            ].map((card,ci)=>{
              const sparkData = mkSpark(card.key)
              return (
                <motion.div key={card.label} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}
                  transition={{delay:ci*0.06,type:'spring',stiffness:130}}
                  className={`relative overflow-hidden ${card.bg} border ${card.border} rounded-2xl hover:shadow-lg transition-all group`}>
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.grad}`}/>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg} group-hover:scale-110 transition-transform`}>
                        <card.icon size={15} style={{color:card.color}}/>
                      </div>
                      <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{card.val}</span>
                    </div>
                    <p className={`text-xs font-bold ${card.tc} mb-2`}>{card.label}</p>
                    {sparkData.length > 1 && (
                      <div className="h-7 -mx-1">
                        <ResponsiveContainer width="100%" height="100%">
                          {card.chartType==='bar' ? (
                            <BarChart data={sparkData} margin={{top:0,right:0,left:0,bottom:0}} barCategoryGap="20%">
                              <Bar dataKey="v" fill={card.color} fillOpacity={0.7} radius={[2,2,0,0]} maxBarSize={7}/>
                            </BarChart>
                          ) : card.chartType==='line' ? (
                            <ComposedChart data={sparkData} margin={{top:2,right:0,left:0,bottom:0}}>
                              <Line type="monotone" dataKey="v" stroke={card.color} strokeWidth={2} dot={false} activeDot={false}/>
                            </ComposedChart>
                          ) : (
                            <AreaChart data={sparkData} margin={{top:0,right:0,left:0,bottom:0}}>
                              <defs><linearGradient id={`sa-${card.label}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={card.color} stopOpacity={0.4}/><stop offset="95%" stopColor={card.color} stopOpacity={0}/>
                              </linearGradient></defs>
                              <Area type="monotone" dataKey="v" stroke={card.color} strokeWidth={2} fill={`url(#sa-${card.label})`} dot={false}/>
                            </AreaChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
            </div>
          </div>

          {/* ── ROW 2: ABSENSI HARI INI + STREAK ── */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {/* Absensi Hari Ini */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
              className="sm:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-0.5" style={{background:
                statusHariIni==='hadir'?'linear-gradient(90deg,#10b981,#34d399)':
                statusHariIni==='terlambat'?'linear-gradient(90deg,#f59e0b,#fbbf24)':
                statusHariIni==='izin'?'linear-gradient(90deg,#8b5cf6,#a78bfa)':
                statusHariIni==='alpha'?'linear-gradient(90deg,#ef4444,#f87171)':
                'linear-gradient(90deg,#6366f1,#818cf8)'}}/>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-slate-400"/>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Absensi Hari Ini</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'short'})}
                  </span>
                </div>

                {izinToday ? (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-violet-500"/>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                      <p className="text-xl font-black text-violet-600 dark:text-violet-400 leading-none">Izin</p>
                      <p className="text-slate-400 text-xs mt-0.5">{izinToday.keterangan||'Izin disetujui'}</p>
                    </div>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800/40">
                      <CheckCircle size={9}/> OK
                    </span>
                  </div>
                ) : absenHariIni ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        absenHariIni.status==='hadir'?'bg-emerald-50 dark:bg-emerald-900/20':
                        absenHariIni.status==='terlambat'?'bg-amber-100 dark:bg-amber-900/40':'bg-rose-50 dark:bg-rose-900/20'}`}>
                        <span className={absenHariIni.status==='hadir'?'text-emerald-500':absenHariIni.status==='terlambat'?'text-amber-500':'text-rose-500'}>
                          {STATUS_CFG[absenHariIni.status]?.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                        <p className={`text-xl font-black leading-none capitalize ${
                          absenHariIni.status==='hadir'?'text-emerald-600 dark:text-emerald-400':
                          absenHariIni.status==='terlambat'?'text-amber-600 dark:text-amber-400':'text-rose-600 dark:text-rose-400'}`}>
                          {absenHariIni.status}
                        </p>
                        {absenHariIni.menit_keterlambatan > 0 &&
                          <p className="text-amber-500 text-xs">+{absenHariIni.menit_keterlambatan} menit terlambat</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`rounded-xl border px-3 py-2 ${
                        absenHariIni.status==='hadir'?'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40':
                        absenHariIni.status==='terlambat'?'bg-amber-100 dark:bg-amber-900/40 border-amber-100 dark:border-amber-800/40':
                        'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-0.5">Masuk</p>
                        <p className="text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">
                          {absenHariIni.jam_masuk && absenHariIni.jam_masuk!=='-' ? absenHariIni.jam_masuk : '�'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-0.5">Pulang</p>
                        <p className="text-sm font-black tabular-nums text-slate-700 dark:text-slate-300">
                          {pengaturan?.jam_pulang?.substring(0,5) || '�'}
                        </p>
                      </div>
                    </div>
                    {/* Metode absen */}
                    {absenHariIni.metode && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          absenHariIni.metode === 'fingerprint'
                            ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40'
                            : absenHariIni.metode === 'qr_code'
                            ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {absenHariIni.metode === 'fingerprint' ? '👆 Sidik Jari'
                            : absenHariIni.metode === 'qr_code' ? '📷 QR Code'
                            : absenHariIni.metode === 'manual' ? '✍️ Manual'
                            : absenHariIni.metode}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                      <motion.div animate={{rotate:[0,10,-10,0]}} transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}>
                        <QrCode size={18} className="text-indigo-600 dark:text-indigo-400"/>
                      </motion.div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                      <p className="text-xl font-black text-slate-700 dark:text-slate-200 leading-none mb-1">Belum Absen</p>
                      <p className="text-slate-400 text-xs">Scan QR untuk mencatat kehadiran</p>
                    </div>
                    <button onClick={()=>navigate('/siswa/absen')}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">
                      <QrCode size={11}/> Absen
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Streak Card */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
              className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden relative">
              <div className="absolute left-0 inset-y-0 w-1 rounded-l-2xl" style={{background:tier.accent}}/>
              <div className="absolute left-0 top-0 bottom-0 w-1/2 pointer-events-none" style={{background:`linear-gradient(to right,${tier.soft},transparent)`}}/>
              <div className="relative z-10 flex h-full">
                <div className="flex flex-col justify-center items-start pl-5 pr-3 py-4 w-[45%] flex-shrink-0">
                  <div className="flex items-end gap-1 leading-none mb-1">
                    <motion.span key={streak} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                      transition={{type:'spring',stiffness:200,delay:0.1}}
                      className="font-black tabular-nums"
                      style={{fontSize:streak>=100?44:56,lineHeight:1,color:tier.accent}}>
                      {streak}
                    </motion.span>
                    <span className="text-xs font-semibold text-slate-400 mb-1.5">hr</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2.5">
                    <span className="text-sm leading-none">{tier.emoji}</span>
                    <span className="text-[10px] font-bold tracking-wide" style={{color:tier.accent}}>{tier.label}</span>
                  </div>
                  <svg width="52" height="28" viewBox="0 0 52 28" fill="none">
                    <path d="M3 26 A23 23 0 0 1 49 26" stroke={isDark?'#1e293b':'#e2e8f0'} strokeWidth="3.5" strokeLinecap="round"/>
                    <motion.path d="M3 26 A23 23 0 0 1 49 26"
                      stroke={tier.accent} strokeWidth="3.5" strokeLinecap="round"
                      strokeDasharray="72" initial={{strokeDashoffset:72}}
                      animate={{strokeDashoffset:72*(1-streakPct/100)}}
                      transition={{duration:1.3,ease:'easeOut',delay:0.4}}/>
                  </svg>
                  <span className="text-[9px] text-slate-400 mt-0.5 tabular-nums">{streakPct}%</span>
                </div>
                <div className="w-px self-stretch my-4 bg-slate-100 dark:bg-slate-800 flex-shrink-0"/>
                <div className="flex-1 flex flex-col justify-between py-4 pl-3 pr-4 min-w-0">
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">
                      {streak===0 ? 'Mulai streak-mu' : `${streak} hari berturut`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{tier.next || 'Level tertinggi 🏆'}</p>
                  </div>
                  <div className="mt-3 flex items-center">
                    {[{d:1,e:'🌟'},{d:20,e:'⚡'},{d:50,e:'🔥'},{d:75,e:'🔮'}].map((m,i,arr)=>{
                      const done = streak >= m.d
                      const active = done && (i===arr.length-1 || streak < arr[i+1].d)
                      return (
                        <div key={m.d} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-0.5">
                            <motion.div animate={active?{scale:[1,1.12,1]}:{}} transition={{duration:2,repeat:active?Infinity:0}}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 transition-all"
                              style={done?{background:tier.soft,borderColor:tier.accent}:{background:isDark?'#1e293b':'#f8fafc',borderColor:isDark?'#334155':'#e2e8f0',opacity:0.5}}>
                              {done ? m.e : <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 block"/>}
                            </motion.div>
                            <span className="text-[7px] font-bold tabular-nums" style={{color:done?tier.accent:isDark?'#475569':'#cbd5e1'}}>{m.d}</span>
                          </div>
                          {i<arr.length-1 && (
                            <div className="flex-1 h-0.5 mx-0.5 rounded-full overflow-hidden mb-3" style={{background:isDark?'#1e293b':'#f1f5f9'}}>
                              <motion.div className="h-full rounded-full" style={{background:tier.accent}}
                                initial={{width:0}}
                                animate={{width:streak>=arr[i+1].d?'100%':streak>=m.d?`${((streak-m.d)/(arr[i+1].d-m.d))*100}%`:'0%'}}
                                transition={{duration:1,ease:'easeOut',delay:0.5+i*0.1}}/>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── ROW 3: TREN + RINGKASAN ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <TrendingUp size={13} className="text-indigo-600 dark:text-indigo-400"/>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Tren Kehadiran</p>
                    <p className="text-[10px] text-slate-400">7 hari terakhir</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  {[['#10b981','Hadir'],['#f59e0b','Terlambat'],['#ef4444','Alpha']].map(([c,l])=>(
                    <span key={l} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                      style={{background:c+'15',color:c,borderColor:c+'30'}}>{l}</span>
                  ))}
                </div>
              </div>
              <div className="px-3 pt-3 pb-2">
                {riwayatChart.length > 1 ? (
                  <ResponsiveContainer width="100%" height={140}>
                    <ComposedChart data={riwayatChart} margin={{top:4,right:4,left:-24,bottom:0}} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark?'#1e293b':'#f1f5f9'} vertical={false}/>
                      <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} tick={{fill:isDark?'#475569':'#94a3b8'}}/>
                      <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{fill:isDark?'#475569':'#94a3b8'}} allowDecimals={false}/>
                      <Tooltip contentStyle={{backgroundColor:isDark?'#0f172a':'#fff',border:`1px solid ${isDark?'#1e293b':'#e2e8f0'}`,borderRadius:'10px',fontSize:'11px',color:isDark?'#e2e8f0':'#1e293b',padding:'8px 12px'}}/>
                      <Bar dataKey="hadir"     fill="#10b981" fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={14} name="Hadir"/>
                      <Bar dataKey="terlambat" fill="#f59e0b" fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={14} name="Terlambat"/>
                      <Bar dataKey="alpha"     fill="#ef4444" fillOpacity={0.85} radius={[3,3,0,0]} maxBarSize={14} name="Alpha"/>
                      <Line type="monotone" dataKey="izin" stroke="#8b5cf6" strokeWidth={1.5} dot={{r:2,fill:'#8b5cf6',strokeWidth:0}} name="Izin"/>
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[140px] text-slate-400 text-xs">Belum ada data</div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <Target size={13} className="text-violet-600 dark:text-violet-400"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Ringkasan</p>
                  <p className="text-[10px] text-slate-400">{new Date().toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {[
                  {label:'Bulan Ini', pct:pctBulan, hadir:(data?.total_hadir_bulan||0)+(data?.total_terlambat_bulan||0), total:data?.bulan_ini||0, color:'#8b5cf6'},
                  {label:'Minggu Ini', pct:pctMinggu, hadir:(data?.total_hadir_minggu||0)+(data?.total_terlambat_minggu||0), total:data?.minggu_ini||0, color:'#10b981'},
                ].map(s=>(
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{s.label}</p>
                      <span className="text-xs font-black text-slate-800 dark:text-white">{s.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{width:0}} animate={{width:`${s.pct}%`}} transition={{duration:1,ease:'easeOut'}}
                        className="h-full rounded-full" style={{background:s.color}}/>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">{s.hadir} hadir dari {s.total} hari</p>
                  </div>
                ))}
                {totalAbsensi > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Distribusi Total</p>
                    <div className="w-full h-2.5 rounded-full overflow-hidden flex gap-0.5">
                      {[{val:data?.total_hadir||0,color:'#10b981'},{val:data?.total_terlambat||0,color:'#f59e0b'},{val:data?.total_izin||0,color:'#8b5cf6'},{val:data?.total_alpha||0,color:'#ef4444'}]
                        .filter(x=>x.val>0).map((x,i)=>(
                          <div key={i} className="h-full rounded-full" style={{width:`${Math.round((x.val/totalAbsensi)*100)}%`,backgroundColor:x.color,minWidth:'4px'}}/>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-1.5">
                      {[['#10b981','H',data?.total_hadir||0],['#f59e0b','T',data?.total_terlambat||0],['#8b5cf6','I',data?.total_izin||0],['#ef4444','A',data?.total_alpha||0]].map(([c,l,v])=>(
                        <div key={l} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm" style={{background:c}}/>
                          <span className="text-[9px] text-slate-400">{l}: {v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Total</p>
                  <span className={`text-sm font-black ${pctHadir>=80?'text-emerald-600 dark:text-emerald-400':pctHadir>=60?'text-amber-600 dark:text-amber-400':'text-rose-600 dark:text-rose-400'}`}>{pctHadir}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 4: MOTIVASI + TARGET ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Motivasi */}
            <div className="relative overflow-hidden rounded-2xl p-4"
              style={{background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%)'}}>
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none"/>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={12} className="text-amber-300"/>
                  <p className="text-white font-bold text-xs">Motivasi Hari Ini</p>
                  <span className="ml-auto text-white/40 text-[10px] font-bold">{pctHadir}%</span>
                </div>
                <p className="text-white/70 text-xs leading-relaxed mb-3">
                  {pctHadir>=90?'"Konsistensimu luar biasa! Terus pertahankan." 🌟'
                  :pctHadir>=75?'"Kamu di jalur yang benar! Sedikit lagi." 💪'
                  :pctHadir>=60?'"Setiap hari hadir adalah investasi masa depan." 📚'
                  :'"Mulai hari ini, jadikan kehadiran prioritas!" 🚀'}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/15 rounded-full overflow-hidden">
                    <motion.div initial={{width:0}} animate={{width:`${pctHadir}%`}}
                      transition={{duration:1.2,ease:'easeOut'}} className="h-full bg-white/60 rounded-full"/>
                  </div>
                </div>
              </div>
            </div>

            {/* Target */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Target size={13} className="text-emerald-500"/>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Target Kehadiran</p>
              </div>
              {[{target:75,label:'Cukup',color:'#f59e0b'},{target:85,label:'Baik',color:'#10b981'},{target:95,label:'Sempurna',color:'#8b5cf6'}].map(t=>(
                <div key={t.target} className="mb-2 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{t.label} ({t.target}%)</span>
                    <span className="text-[10px] font-bold" style={{color:pctHadir>=t.target?t.color:'#94a3b8'}}>
                      {pctHadir>=t.target?'✓':`${t.target-pctHadir}% lagi`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{width:0}} animate={{width:`${Math.min(100,(pctHadir/t.target)*100)}%`}}
                      transition={{duration:1,ease:'easeOut'}}
                      className="h-full rounded-full" style={{backgroundColor:pctHadir>=t.target?t.color:'#cbd5e1'}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>




          {/* ── ROW 5: KALENDER 7 HARI ── */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Calendar size={13} className="text-indigo-600 dark:text-indigo-400"/>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Kalender Kehadiran</p>
                <p className="text-[10px] text-slate-400">7 hari terakhir</p>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1.5 mb-3">
                {riwayat.slice().reverse().map((r,i)=>{
                  const cfg = {
                    hadir:     {bg:'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700/50',tc:'text-emerald-700 dark:text-emerald-300',l:'H'},
                    terlambat: {bg:'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700/50',tc:'text-amber-700 dark:text-amber-300',l:'T'},
                    izin:      {bg:'bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-700/50',tc:'text-violet-700 dark:text-violet-300',l:'I'},
                    alpha:     {bg:'bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-700/50',tc:'text-rose-700 dark:text-rose-300',l:'A'},
                  }[r.status] || {bg:'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',tc:'text-slate-500',l:'�'}
                  const day = r.tanggal ? r.tanggal.split(' ')[0] : `H${i+1}`
                  return (
                    <motion.div key={i} initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}}
                      transition={{delay:i*0.04,type:'spring',stiffness:220}}
                      className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl border ${cfg.bg}`}>
                      <span className="text-[7px] text-slate-400">{day.slice(0,2)}</span>
                      <span className={`text-xs font-black ${cfg.tc}`}>{cfg.l}</span>
                    </motion.div>
                  )
                })}
                {Array.from({length:Math.max(0,7-riwayat.length)}).map((_,i)=>(
                  <div key={`e${i}`} className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <span className="text-[7px] text-slate-300 dark:text-slate-600">�</span>
                    <span className="text-xs text-slate-300 dark:text-slate-600">�</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[{color:'bg-emerald-500',label:'Hadir'},{color:'bg-amber-500',label:'Terlambat'},{color:'bg-violet-500',label:'Izin'},{color:'bg-rose-500',label:'Alpha'}].map(s=>(
                  <div key={s.label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-sm ${s.color}`}/>
                    <span className="text-[10px] text-slate-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── ROW 6: RANKING + RIWAYAT ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            {ranking && (
              <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <Trophy size={13} className="text-amber-500"/>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Ranking Kelas</p>
                      <p className="text-[10px] text-slate-400">Bulan ini</p>
                    </div>
                  </div>
                  <Link to="/siswa/riwayat" className="text-[11px] text-slate-400 hover:text-violet-500 flex items-center gap-0.5 transition-colors">
                    Detail <ChevronRight size={10}/>
                  </Link>
                </div>
                <div className="flex border-b border-slate-100 dark:border-slate-700/50">
                  {[{key:'rajin',label:'Terbaik',icon:Award,at:'text-amber-600 dark:text-amber-400',ab:'border-amber-500'},
                    {key:'terlambat',label:'Terlambat',icon:Clock,at:'text-orange-500 dark:text-orange-400',ab:'border-orange-500'},
                    {key:'alpha',label:'Alpha',icon:AlertTriangle,at:'text-rose-500 dark:text-rose-400',ab:'border-rose-500'}].map(tab=>(
                    <button key={tab.key} onClick={()=>setRankTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-semibold transition-all border-b-2 ${
                        rankTab===tab.key?`${tab.at} ${tab.ab} bg-slate-50/80 dark:bg-slate-800/50`:'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'}`}>
                      <tab.icon size={10}/>{tab.label}
                    </button>
                  ))}
                </div>
                <div className="p-3">
                  <AnimatePresence mode="wait">
                    <motion.div key={rankTab} initial={{opacity:0,x:6}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-6}} transition={{duration:0.15}}>
                      {activeRank.list.length===0 ? (
                        <div className="flex flex-col items-center py-8 gap-2 text-slate-400"><Trophy size={20}/><p className="text-xs">Belum ada data</p></div>
                      ) : (
                        <div className="space-y-1.5">
                          {activeRank.list.slice(0,5).map((s,i)=>{
                            const isMe = s.id===myId
                            const medals = ['🥇','🥈','🥉']
                            const maxVal = activeRank.list[0]?.[activeRank.valKey]||1
                            const barW = Math.round((s[activeRank.valKey]/maxVal)*100)
                            return (
                              <motion.div key={s.id||i} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                                className={`relative flex items-center gap-2 px-3 py-2 rounded-xl overflow-hidden border transition-all ${
                                  isMe?'bg-violet-100 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700/50 ring-1 ring-violet-300 dark:ring-violet-700/50'
                                  :i===0?'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/40'
                                  :'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50'}`}>
                                <motion.div initial={{width:0}} animate={{width:`${barW}%`}}
                                  transition={{delay:0.3+i*0.07,duration:0.8,ease:'easeOut'}}
                                  className="absolute inset-y-0 left-0 rounded-xl pointer-events-none opacity-10"
                                  style={{backgroundColor:activeRank.color}}/>
                                <span className="relative z-10 text-sm w-5 text-center flex-shrink-0 font-black">
                                  {i<3?medals[i]:<span className="text-xs text-slate-400">{i+1}</span>}
                                </span>
                                <div className="relative z-10 flex-shrink-0">
                                  <Avatar src={s.foto_url} name={s.nama_lengkap} size={28}
                                    className={isMe?'ring-2 ring-violet-400':i===0?'ring-2 ring-amber-400':''}/>
                                </div>
                                <div className="relative z-10 flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{s.nama_lengkap}</p>
                                    {isMe && <span className="text-[8px] font-black px-1 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex-shrink-0">Kamu</span>}
                                  </div>
                                  <p className="text-[9px] text-slate-400 truncate">{s.kelas||'-'}</p>
                                </div>
                                <span className={`relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums flex-shrink-0 ${
                                  isMe?'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                                  :i===0?'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                                  :'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                  {s[activeRank.valKey]}x
                                </span>
                              </motion.div>
                            )
                          })}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  {activeRank.posisi && activeRank.posisi>5 && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40">
                      <span className="text-xs text-violet-500 font-semibold">Posisi kamu:</span>
                      <span className="text-sm font-black text-violet-700 dark:text-violet-300">#{activeRank.posisi}</span>
                    </div>
                  )}
                  {ranking && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Ranking Sekolah</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[{label:'Hadir',pos:ranking.sekolah?.posisi_ranking?.rajin,color:'text-amber-600 dark:text-amber-400',bg:'bg-amber-100 dark:bg-amber-900/40',border:'border-amber-100 dark:border-amber-800/40'},
                          {label:'Terlambat',pos:ranking.sekolah?.posisi_ranking?.terlambat,color:'text-orange-600 dark:text-orange-400',bg:'bg-orange-50 dark:bg-orange-900/20',border:'border-orange-100 dark:border-orange-800/40'},
                          {label:'Alpha',pos:ranking.sekolah?.posisi_ranking?.alpha,color:'text-rose-600 dark:text-rose-400',bg:'bg-rose-50 dark:bg-rose-900/20',border:'border-rose-100 dark:border-rose-800/40'}].map((item,i)=>(
                          <div key={i} className={`rounded-xl px-2 py-1.5 ${item.bg} border ${item.border} text-center`}>
                            <p className="text-[8px] text-slate-400 mb-0.5">{item.label}</p>
                            <p className={`text-sm font-black ${item.color}`}>{item.pos?`#${item.pos}`:'�'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Riwayat */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <History size={13} className="text-teal-600 dark:text-teal-400"/>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Riwayat Terakhir</p>
                    <p className="text-[10px] text-slate-400">7 hari terakhir</p>
                  </div>
                </div>
                <button onClick={()=>navigate('/siswa/riwayat')} className="text-[11px] text-slate-400 hover:text-violet-500 flex items-center gap-0.5 transition-colors">
                  Semua <ChevronRight size={10}/>
                </button>
              </div>
              <div>
                {riwayat.length===0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">Belum ada riwayat</div>
                ) : riwayat.slice(0,7).map((r,i)=>{
                  const sc = STATUS_CFG[r.status]
                  return (
                    <motion.div key={i} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      style={{borderBottom:i<riwayat.slice(0,7).length-1?'1px solid rgba(148,163,184,0.08)':'none'}}>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc?.dot||'bg-slate-400'}`}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{r.tanggal}</p>
                        {r.jam_masuk && r.jam_masuk!=='-' && <p className="text-[10px] text-slate-400 font-mono">{r.jam_masuk}</p>}
                      </div>
                      {r.menit_keterlambatan>0 && <span className="text-[9px] text-amber-500 font-semibold flex-shrink-0">+{r.menit_keterlambatan}m</span>}
                      <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 border ${sc?.pill||'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                        {sc?.icon}{r.status}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* ── ROW 7: RIWAYAT IZIN ── */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                  <FileText size={13} className="text-violet-500"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Riwayat Izin</p>
                  <p className="text-[10px] text-slate-400">Pengajuan terakhir</p>
                </div>
              </div>
              <button onClick={()=>navigate('/siswa/riwayat')} className="text-[11px] text-slate-400 hover:text-violet-500 flex items-center gap-0.5 transition-colors">
                Semua <ChevronRight size={10}/>
              </button>
            </div>
            {izinList.length===0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <CheckCircle size={16} className="text-emerald-500"/>
                </div>
                <p className="text-xs text-slate-400">Belum ada riwayat izin</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-50 dark:divide-slate-800">
                {izinList.slice(0,3).map((izin,i)=>{
                  const statusColor = {
                    pending:'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800/40',
                    approved:'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/40',
                    rejected:'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-800/40',
                  }
                  return (
                    <motion.div key={izin.id||i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${izin.jenis==='sakit'?'bg-rose-50 dark:bg-rose-900/20':'bg-violet-50 dark:bg-violet-900/20'}`}>
                        <FileText size={14} className={izin.jenis==='sakit'?'text-rose-500':'text-violet-500'}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate capitalize">{izin.jenis_label||izin.jenis||'Izin'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{izin.tanggal_formatted||izin.tanggal}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border ${statusColor[izin.status]||statusColor.pending}`}>
                        {izin.status_label||izin.status}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>


          {/* Gacha Harian � floating di pojok kanan atas */}
          <GachaHarian floating onBadgeChange={(newBadgeId, newBadges) => {
            setActiveBadge(newBadgeId)
            setOwnedBadges(newBadges || [])
          }} />

          {/* Kampus Impian */}
          <KampusImpian pctHadir={pctHadir} totalAlpha={data?.total_alpha||0} totalTerlambat={data?.total_terlambat||0} streak={streak}
            onSaved={() => setTopKey(k => k + 1)} onDeleted={() => setTopKey(k => k + 1)}/>

          {/* Top Kampus Terpopuler */}
          <TopKampus refreshKey={topKey}/>

          {/* Siswa Berprestasi */}
          {(pengaturan?.prestasi_siswa || []).some(s => s?.nama) && (
            <SiswaBerprestasi
              judul={pengaturan.prestasi_judul}
              deskripsi={pengaturan.prestasi_deskripsi}
              siswaList={pengaturan.prestasi_siswa || []}
            />
          )}

          {/* Budaya Indonesia */}
          {(pengaturan?.budaya_info || (pengaturan?.budaya_fotos || []).some(Boolean) || pengaturan?.budaya_video) && (
            <BudayaIndonesia
              budayaInfo={pengaturan.budaya_info}
              budayaFotos={pengaturan.budaya_fotos || []}
              budayaVideo={null}      {/* NONAKTIF sementara — kembalikan: pengaturan.budaya_video || null */}
              budayaVideo2={null}     {/* NONAKTIF sementara — kembalikan: pengaturan.budaya_video_2 || null */}
              budayaBg={pengaturan.budaya_bg || null}
            />
          )}
          {(pengaturan?.alam_info || (pengaturan?.alam_fotos || []).some(Boolean)) && (
            <AlamIndonesia
              alamInfo={pengaturan.alam_info}
              alamFotos={pengaturan.alam_fotos || []}
              alamFotos2={pengaturan.alam_fotos_2 || []}
              alamBg={pengaturan.alam_bg || null}
            />
          )}
          {/* ── ROW 8: MENU CEPAT ── */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={11} className="text-slate-400"/>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Menu Cepat</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {label:'Absen QR',icon:QrCode,to:'/siswa/absen',color:'#7c3aed',iconBg:'bg-violet-100 dark:bg-violet-900/50',border:'border-violet-100 dark:border-violet-800/40',tc:'text-violet-600 dark:text-violet-400'},
                {label:'Riwayat',icon:History,to:'/siswa/riwayat',color:'#0d9488',iconBg:'bg-teal-100 dark:bg-teal-900/50',border:'border-teal-100 dark:border-teal-800/40',tc:'text-teal-600 dark:text-teal-400'},
                {label:'Izin',icon:FileText,to:'/siswa/riwayat',color:'#8b5cf6',iconBg:'bg-purple-50 dark:bg-purple-900/30',border:'border-purple-100 dark:border-purple-800/40',tc:'text-purple-600 dark:text-purple-400'},
                {label:'Profil',icon:User,to:'/siswa/profil',color:'#3b82f6',iconBg:'bg-blue-50 dark:bg-blue-900/30',border:'border-blue-100 dark:border-blue-800/40',tc:'text-blue-600 dark:text-blue-400'},
              ].map((nav,i)=>(
                <motion.div key={nav.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                  whileHover={{y:-2}} whileTap={{scale:0.97}}>
                  <Link to={nav.to}
                    className={`flex items-center gap-3 bg-white dark:bg-slate-900 ${nav.border} border rounded-xl p-3.5 hover:shadow-sm dark:hover:shadow-slate-900 transition-all group`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${nav.iconBg} group-hover:scale-105 transition-transform`}>
                      <nav.icon size={16} style={{color:nav.color}}/>
                    </div>
                    <span className={`font-semibold text-sm ${nav.tc}`}>{nav.label}</span>
                    <ChevronRight size={13} className="ml-auto text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform"/>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

