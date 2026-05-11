import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, RefreshCw, Crown, Star,
  ChevronLeft, ChevronRight,
  CheckCircle, Clock, AlertTriangle, X,
  GraduationCap, Shield,
} from 'lucide-react'
import { siswaApi } from '../../services/siswaService'
import { BadgeOverlay } from '../../components/GachaHarian'

const TABS = [
  { key:'hadir',     label:'Rajin',     emoji:'🏆', color:'#10b981', gradFull:'linear-gradient(135deg,#059669,#10b981,#34d399)', text:'text-emerald-600 dark:text-emerald-400', icon:CheckCircle,   desc:'Paling sering hadir' },
  { key:'terlambat', label:'Terlambat', emoji:'⏰', color:'#f59e0b', gradFull:'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)', text:'text-amber-600 dark:text-amber-400',   icon:Clock,         desc:'Paling sering terlambat' },
  { key:'alpha',     label:'Alpha',     emoji:'💀', color:'#ef4444', gradFull:'linear-gradient(135deg,#dc2626,#ef4444,#f87171)', text:'text-rose-600 dark:text-rose-400',     icon:AlertTriangle, desc:'Paling sering alpha' },
]
const PODIUM_CFG = [
  { rank:1, size:60, crown:'👑', ringColor:'#f59e0b', order:'order-2', baseH:'h-20' },
  { rank:2, size:50, crown:'🥈', ringColor:'#94a3b8', order:'order-1', baseH:'h-14' },
  { rank:3, size:44, crown:'🥉', ringColor:'#f97316', order:'order-3', baseH:'h-10' },
]

function SiswaAvatar({ siswa, size=44 }) {
  const [err, setErr] = useState(false)
  // Reset error state saat badge berubah (key prop di parent handle ini)
  const initial = (siswa?.nama_lengkap||'S').charAt(0).toUpperCase()
  const hasBadge = !!siswa?.active_badge
  return (
    <div className="relative flex-shrink-0" style={{ width:size, height:size }}>
      <div className={`w-full h-full overflow-hidden bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center font-black text-white ${hasBadge?'rounded-full':'rounded-2xl'}`}
        style={{ fontSize:Math.round(size*0.38) }}>
        {siswa?.foto_url && !err
          ? <img src={siswa.foto_url} alt={siswa.nama_lengkap} className="w-full h-full object-cover" onError={()=>setErr(true)}/>
          : initial}
      </div>
      {hasBadge && <BadgeOverlay badgeId={siswa.active_badge} badges={[]} size="sm"/>}
    </div>
  )
}

// ─── PROFILE CARD MODAL ───────────────────────────────────────
function ProfileCardModal({ siswa, onClose, myId }) {
  const [coverErr, setCoverErr] = useState(false)
  const [isDark,   setIsDark]   = useState(() => document.documentElement.classList.contains('dark'))
  const isMe = siswa?.id === myId

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes:true, attributeFilter:['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!siswa) return null

  const hasCover  = siswa.foto_cover_url && !coverErr
  const initial   = (siswa.nama_lengkap || 'S').charAt(0).toUpperCase()
  const totalAbsen = (siswa.total_hadir||0)+(siswa.total_terlambat||0)+(siswa.total_alpha||0)
  const pctHadir  = totalAbsen > 0 ? Math.round(((siswa.total_hadir||0)+(siswa.total_terlambat||0))/totalAbsen*100) : 0
  const pctColor  = pctHadir >= 80 ? '#10b981' : pctHadir >= 60 ? '#f59e0b' : '#ef4444'
  const pctLabel  = pctHadir >= 80 ? 'Baik' : pctHadir >= 60 ? 'Cukup' : 'Kurang'
  const rankEmoji = siswa.posisi <= 3 ? ['👑','🥈','🥉'][siswa.posisi-1] : null
  const motivasi  = pctHadir >= 80
    ? '"Konsistensimu luar biasa, terus pertahankan!"'
    : pctHadir >= 60
    ? '"Tetap semangat, konsistensi adalah kunci!"'
    : '"Mulai hari ini, jadikan kehadiran prioritas!"'

  // ── Theme tokens ──
  const card       = isDark ? '#111827' : '#ffffff'
  const cardBd     = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)'
  const cardShadow = isDark ? '0 40px 100px rgba(0,0,0,0.7)' : '0 24px 60px rgba(0,0,0,0.15)'
  const boxBg      = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const boxBd      = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const barTrack   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const handleBg   = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
  const subColor   = isDark ? 'rgba(148,163,184,0.85)' : 'rgba(71,85,105,0.9)'
  const metaColor  = isDark ? 'rgba(100,116,139,0.8)'  : 'rgba(100,116,139,0.9)'
  const labelColor = isDark ? 'rgba(148,163,184,0.55)' : 'rgba(100,116,139,0.7)'
  const quoteColor = isDark ? 'rgba(148,163,184,0.45)' : 'rgba(100,116,139,0.55)'
  const meColor    = isDark ? '#c4b5fd' : '#7c3aed'
  const meBg       = isDark ? 'rgba(124,58,237,0.2)'   : 'rgba(124,58,237,0.1)'
  const meBd       = isDark ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.3)'
  const statBg     = (c) => isDark ? `${c}12` : `${c}10`
  const statBd     = (c) => isDark ? `${c}25` : `${c}28`

  return (
    <AnimatePresence>
      <motion.div key="bd"
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        transition={{ duration:0.2 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
        style={{ background:'rgba(2,6,23,0.75)', backdropFilter:'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div key="card"
          initial={{ opacity:0, y:72, scale:0.94 }}
          animate={{ opacity:1, y:0, scale:1 }}
          exit={{ opacity:0, y:48, scale:0.96 }}
          transition={{ type:'spring', stiffness:360, damping:32 }}
          className="w-full sm:max-w-[340px] rounded-t-[24px] sm:rounded-[24px] overflow-hidden"
          style={{ background:card, border:`1px solid ${cardBd}`, boxShadow:cardShadow }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* drag handle mobile */}
          <div className="flex justify-center pt-2.5 sm:hidden">
            <div className="w-8 h-1 rounded-full" style={{ background:handleBg }}/>
          </div>

          {/* ── COVER 16:9 ── */}
          <div className="relative w-full" style={{ aspectRatio:'16/9' }}>
            {hasCover
              ? <img src={siswa.foto_cover_url} alt="cover" className="w-full h-full object-cover" onError={()=>setCoverErr(true)}/>
              : <div className="w-full h-full relative overflow-hidden"
                  style={{ background: isMe
                    ? 'linear-gradient(135deg,#1e0a3c,#3b0764,#5b21b6)'
                    : 'linear-gradient(135deg,#0c1445,#1e1b4b,#312e81)' }}>
                  <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize:'14px 14px' }}/>
                  <div className="absolute top-3 right-6 w-16 h-16 rounded-full blur-2xl opacity-25"
                    style={{ background: isMe ? '#a78bfa' : '#818cf8' }}/>
                  <div className="absolute bottom-2 left-6 w-12 h-12 rounded-full blur-xl opacity-20"
                    style={{ background: isMe ? '#7c3aed' : '#6366f1' }}/>
                </div>
            }
            {/* scrim menyatu ke card */}
            <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
              style={{ background:`linear-gradient(to top,${card},transparent)` }}/>
            {/* rank pill */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.15)' }}>
                {rankEmoji && <span className="text-sm leading-none">{rankEmoji}</span>}
                <span className="text-white font-black text-[11px]">#{siswa.posisi}</span>
              </div>
            </div>
            {/* close */}
            <motion.button whileTap={{ scale:0.85 }} onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.15)' }}>
              <X size={13} className="text-white"/>
            </motion.button>
          </div>

          {/* ── BODY ── */}
          <div className="px-4 pt-3 pb-5 space-y-3">

            {/* NAMA + INFO — langsung, tanpa foto profil */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[17px] font-black leading-tight" style={{ color:nameColor }}>
                      {siswa.nama_lengkap}
                    </h2>
                    {isMe && (
                      <span className="flex-shrink-0 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black"
                        style={{ background:meBg, border:`1px solid ${meBd}`, color:meColor }}>
                        <Star size={7}/>KAMU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color:subColor }}>
                      <GraduationCap size={10} style={{ color:metaColor }}/>{siswa.kelas || '-'}
                    </span>
                    <span style={{ color:metaColor }}>·</span>
                    <span className="text-[11px] font-mono" style={{ color:metaColor }}>
                      NIS {siswa.nis || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KEHADIRAN */}
            <div className="rounded-2xl px-3.5 py-3" style={{ background:boxBg, border:`1px solid ${boxBd}` }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={11} style={{ color:metaColor }}/>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:metaColor }}>
                    Kehadiran
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-black tabular-nums" style={{ color:pctColor }}>{pctHadir}%</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg"
                    style={{ background:`${pctColor}18`, color:pctColor, border:`1px solid ${pctColor}30` }}>
                    {pctLabel}
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background:barTrack }}>
                <motion.div className="h-full rounded-full"
                  initial={{ width:0 }} animate={{ width:`${pctHadir}%` }}
                  transition={{ duration:0.9, ease:'easeOut', delay:0.15 }}
                  style={{ background: pctHadir>=80
                    ? 'linear-gradient(90deg,#059669,#34d399)'
                    : pctHadir>=60
                    ? 'linear-gradient(90deg,#d97706,#fbbf24)'
                    : 'linear-gradient(90deg,#dc2626,#f87171)' }}/>
              </div>
              <p className="text-[10px] mt-2 leading-relaxed" style={{ color:quoteColor }}>
                {motivasi}
              </p>
            </div>

            {/* STATS 3 KOLOM */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label:'HADIR',     sub:'Total Kehadiran',     val:siswa.total_hadir,     c:'#10b981', icon:'📅' },
                { label:'TERLAMBAT', sub:'Total Keterlambatan', val:siswa.total_terlambat, c:'#f59e0b', icon:'⏰' },
                { label:'ALPHA',     sub:'Total Alpha',         val:siswa.total_alpha,     c:'#ef4444', icon:'🔥' },
              ].map((s,i) => (
                <motion.div key={s.label}
                  initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.1+i*0.07, type:'spring', stiffness:240, damping:20 }}
                  className="rounded-2xl text-center py-3 px-1.5 relative overflow-hidden"
                  style={{ background:statBg(s.c), border:`1px solid ${statBd(s.c)}` }}>
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background:`linear-gradient(90deg,transparent,${s.c},transparent)` }}/>
                  <span className="text-base leading-none">{s.icon}</span>
                  <p className="text-[22px] font-black tabular-nums leading-none mt-1" style={{ color:s.c }}>{s.val}</p>
                  <p className="text-[8px] font-black mt-1 tracking-wide" style={{ color:s.c }}>{s.label}</p>
                  <p className="text-[8px] mt-0.5" style={{ color:labelColor }}>{s.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* QUOTE */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              <span className="text-[10px]">✨</span>
              <p className="text-[10px] italic text-center" style={{ color:quoteColor }}>
                "Disiplin hari ini, sukses hari nanti."
              </p>
              <span className="text-[10px]">✨</span>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── PODIUM TOP 3 ─────────────────────────────────────────────
function PodiumSection({ items, valKey, activeTab, myId, onAvatarClick }) {
  const top3    = items.slice(0, 3)
  if (top3.length === 0) return null
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean)

  return (
    <div className="relative mb-5">
      <div className="absolute inset-0 rounded-3xl opacity-10 blur-2xl pointer-events-none"
        style={{ background: activeTab.gradFull }} />
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10
        bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background:`linear-gradient(90deg,transparent,${activeTab.color},transparent)` }} />
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
          style={{ backgroundImage:'radial-gradient(circle,#000 1px,transparent 1px)', backgroundSize:'18px 18px' }} />

        <div className="relative z-10 pt-5 pb-4 px-4">
          <p className="text-center text-[10px] font-bold uppercase tracking-widest mb-6 text-slate-400 dark:text-white/30">
            {activeTab.emoji} Top 3 — {activeTab.desc}
          </p>
          <div className="flex items-end justify-center gap-6 sm:gap-10">
            {ordered.map((siswa) => {
              const cfg  = PODIUM_CFG.find(c => c.rank === siswa.posisi)
              if (!cfg) return null
              const val  = siswa[valKey]
              const isMe = siswa.id === myId
              return (
                <motion.div key={siswa.id}
                  className={`flex flex-col items-center gap-2 ${cfg.order}`}
                  initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:cfg.rank===1?0:cfg.rank===2?0.1:0.2, type:'spring', stiffness:180 }}>
                  <span className="text-2xl leading-none">{cfg.crown}</span>
                  <motion.div whileTap={{ scale:0.93 }} className="rounded-full p-[3px] cursor-pointer"
                    onClick={() => onAvatarClick(siswa)}
                    style={{
                      background: isMe
                        ? 'linear-gradient(135deg,#7c3aed,#a78bfa)'
                        : `linear-gradient(135deg,${cfg.ringColor}cc,${cfg.ringColor}55)`,
                      boxShadow:`0 0 16px ${isMe?'#7c3aed66':cfg.ringColor+'44'}`,
                    }}>
                    <div className="rounded-full p-[2px] bg-white dark:bg-slate-900">
                      <SiswaAvatar key={`${siswa.id}-${siswa.active_badge}`} siswa={siswa} size={cfg.size}/>
                    </div>
                  </motion.div>
                  {isMe && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-500/40">
                      <Star size={8} className="text-violet-500 dark:text-violet-400"/>
                      <span className="text-[8px] font-black text-violet-600 dark:text-violet-400">KAMU</span>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-black text-[11px] leading-tight max-w-[72px] truncate text-slate-800 dark:text-white">
                      {siswa.nama_lengkap.split(' ')[0]}
                    </p>
                    <p className="text-[9px] truncate max-w-[72px] text-slate-400 dark:text-white/35">{siswa.kelas}</p>
                  </div>
                  <div className={`w-full min-w-[64px] flex flex-col items-center rounded-t-2xl pt-2 pb-1 px-3 ${cfg.baseH}`}
                    style={{ background:`${activeTab.color}18`, borderTop:`2px solid ${activeTab.color}50` }}>
                    <span className="font-black tabular-nums text-sm leading-none" style={{ color:activeTab.color }}>{val}</span>
                    <span className="text-[8px] mt-0.5 text-slate-400 dark:text-white/30">{activeTab.label.toLowerCase()}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PAGINATION ───────────────────────────────────────────────
function Pagination({ page, lastPage, total, perPage, onPage, color }) {
  const from = (page-1)*perPage+1
  const to   = Math.min(page*perPage, total)
  const pages = []
  if (lastPage <= 7) {
    for (let i=1; i<=lastPage; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i=Math.max(2,page-1); i<=Math.min(lastPage-1,page+1); i++) pages.push(i)
    if (page < lastPage-2) pages.push('...')
    pages.push(lastPage)
  }
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] text-slate-400">
          <span className="font-bold text-slate-600 dark:text-slate-300">{from}–{to}</span> dari <span className="font-bold text-slate-600 dark:text-slate-300">{total}</span> siswa
        </span>
        <span className="text-[11px] text-slate-400">
          Hal <span className="font-bold text-slate-600 dark:text-slate-300">{page}</span> / {lastPage}
        </span>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        <motion.button whileTap={{ scale:0.9 }} onClick={() => onPage(page-1)} disabled={page<=1}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm">
          <ChevronLeft size={15}/>
        </motion.button>
        {pages.map((p,i) => p==='...'
          ? <span key={`d${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm font-bold">···</span>
          : <motion.button key={p} whileTap={{ scale:0.88 }} onClick={() => onPage(p)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black transition-all shadow-sm ${
                p===page ? 'text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              style={p===page ? { background:color, boxShadow:`0 4px 14px ${color}55` } : {}}>
              {p}
            </motion.button>
        )}
        <motion.button whileTap={{ scale:0.9 }} onClick={() => onPage(page+1)} disabled={page>=lastPage}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm">
          <ChevronRight size={15}/>
        </motion.button>
      </div>
      <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mx-1">
        <motion.div className="h-full rounded-full" style={{ background:color }}
          initial={{ width:0 }} animate={{ width:`${(page/lastPage)*100}%` }}
          transition={{ duration:0.4, ease:'easeOut' }}/>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function SiswaRankingPage() {
  const [tab, setTab]                     = useState('hadir')
  const [data, setData]                   = useState(null)
  const [loading, setLoading]             = useState(true)
  const [page, setPage]                   = useState(1)
  const [refreshing, setRefreshing]       = useState(false)
  const [selectedSiswa, setSelectedSiswa] = useState(null)
  const listRef = useRef(null)

  const fetchRanking = useCallback(async (pg=1, sort=tab, isRefresh=false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const res = await siswaApi.getRankingSekolah({ page:pg, sort })
      setData(res.data.data)
      setPage(pg)
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [tab])

  useEffect(() => { fetchRanking(1, tab) }, [tab])

  // Badge ganti → update list instan
  useEffect(() => {
    const onBadgeChanged = (e) => {
      const newBadge = e.detail?.activeBadge ?? null
      // 1. Patch list data
      setData(prev => {
        if (!prev) return prev
        const myId = prev.my_id
        const patch = (list) => list?.map(s => s.id===myId ? { ...s, active_badge:newBadge } : s) ?? []
        return { ...prev, data:patch(prev.data) }
      })
      // 2. Patch modal jika sedang terbuka untuk user yang sama
      setSelectedSiswa(prev => {
        if (!prev) return prev
        return { ...prev, active_badge: newBadge }
      })
    }
    window.addEventListener('badge-changed', onBadgeChanged)
    return () => window.removeEventListener('badge-changed', onBadgeChanged)
  }, [])

  const handleTab  = (key) => { setTab(key); setPage(1) }
  const handlePage = (pg) => {
    fetchRanking(pg, tab)
    setTimeout(() => listRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 80)
  }

  const activeTab = TABS.find(t => t.key===tab)
  const items     = data?.data || []
  const total     = data?.total || 0
  const lastPage  = data?.last_page || 1
  const perPage   = data?.per_page || 10
  const myId      = data?.my_id
  const myPosisi  = data?.my_posisi
  const valKey    = tab==='hadir' ? 'total_hadir' : tab==='terlambat' ? 'total_terlambat' : 'total_alpha'
  const maxVal    = items[0]?.[valKey] || 1

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 pb-10">

      {/* MODAL */}
      {selectedSiswa && (
        <ProfileCardModal siswa={selectedSiswa} myId={myId} onClose={() => setSelectedSiswa(null)}/>
      )}

      {/* HEADER */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:activeTab.gradFull }}>
              <Trophy size={15} className="text-white"/>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Ranking Sekolah</h1>
          </div>
          <p className="text-[11px] text-slate-400 ml-10">
            {data?.bulan ? `Bulan ${data.bulan}/${data.tahun} · ` : ''}
            <span className="font-semibold text-slate-500 dark:text-slate-300">{total} siswa</span>
          </p>
        </div>
        <motion.button whileTap={{ scale:0.9 }}
          onClick={() => fetchRanking(page, tab, true)} disabled={refreshing}
          className="mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          <RefreshCw size={14} className={refreshing?'animate-spin':''}/>
        </motion.button>
      </div>

      {/* TABS */}
      <div className="relative flex gap-2 mb-5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
        {TABS.map(t => {
          const Icon = t.icon
          const isActive = tab===t.key
          return (
            <button key={t.key} onClick={() => handleTab(t.key)}
              className="relative flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs font-black transition-all z-10">
              {isActive && (
                <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl shadow-lg"
                  style={{ background:t.gradFull }}
                  transition={{ type:'spring', stiffness:400, damping:30 }}/>
              )}
              <Icon size={13} className={`relative z-10 transition-colors ${isActive?'text-white':t.text}`}/>
              <span className={`relative z-10 transition-colors ${isActive?'text-white':'text-slate-500 dark:text-slate-400'}`}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* POSISI SAYA */}
      <AnimatePresence>
        {myPosisi && (
          <motion.div key="my-pos" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background:`${activeTab.color}12`, border:`1px solid ${activeTab.color}35` }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:`${activeTab.color}25` }}>
              <Crown size={15} style={{ color:activeTab.color }}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">Posisi kamu bulan ini</p>
              <p className="text-sm font-black text-slate-800 dark:text-white">
                <span style={{ color:activeTab.color }}>#{myPosisi}</span>
                <span className="text-slate-400 font-normal text-xs ml-1">dari {total} siswa</span>
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-slate-400">Persentil</p>
              <p className="text-sm font-black" style={{ color:activeTab.color }}>
                {total > 0 ? Math.round(((total-myPosisi)/total)*100) : 0}%
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADING */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"/>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor:`${activeTab.color} transparent transparent transparent` }}/>
          </div>
          <p className="text-sm text-slate-400 font-medium">Memuat ranking...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={`${tab}-${page}`}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            transition={{ duration:0.18 }}>

            {/* PODIUM — page 1 only */}
            {page===1 && items.length > 0 && (
              <PodiumSection items={items} valKey={valKey} activeTab={activeTab} myId={myId}
                onAvatarClick={(s) => setSelectedSiswa(s)}/>
            )}

            {/* LIST */}
            <div ref={listRef} className="space-y-2">
              {items.map((siswa, i) => {
                const isMe   = siswa.id===myId
                const posisi = siswa.posisi
                const val    = siswa[valKey]
                const barW   = maxVal > 0 ? Math.round((val/maxVal)*100) : 0
                const isTop3 = posisi<=3 && page===1
                const medals = ['🥇','🥈','🥉']
                return (
                  <motion.div key={siswa.id}
                    initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay:i*0.025, type:'spring', stiffness:200, damping:20 }}
                    className={`relative flex items-center gap-3 px-3 sm:px-4 py-3 rounded-2xl border overflow-hidden transition-all ${
                      isMe
                        ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700/50 ring-1 ring-violet-300/60 dark:ring-violet-700/40'
                        : isTop3 && posisi===1
                        ? 'bg-amber-50/80 dark:bg-amber-900/15 border-amber-200 dark:border-amber-700/40'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}>
                    <motion.div className="absolute inset-y-0 left-0 pointer-events-none rounded-2xl"
                      initial={{ width:0 }} animate={{ width:`${barW}%` }}
                      transition={{ delay:0.3+i*0.03, duration:0.7, ease:'easeOut' }}
                      style={{ background:isMe?'rgba(139,92,246,0.06)':`${activeTab.color}07` }}/>

                    {/* Rank */}
                    <div className="w-8 sm:w-9 flex-shrink-0 flex items-center justify-center">
                      {isTop3
                        ? <span className="text-xl leading-none">{medals[posisi-1]}</span>
                        : <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black ${
                            isMe ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400'
                                 : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>{posisi}</div>
                      }
                    </div>

                    {/* Avatar clickable */}
                    <motion.div whileTap={{ scale:0.9 }} className="cursor-pointer flex-shrink-0"
                      onClick={() => setSelectedSiswa(siswa)}>
                      <SiswaAvatar key={`${siswa.id}-${siswa.active_badge}`} siswa={siswa} size={42}/>
                    </motion.div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className={`text-sm font-black truncate leading-tight ${
                          isMe ? 'text-violet-700 dark:text-violet-300' : 'text-slate-800 dark:text-white'
                        }`}>{siswa.nama_lengkap}</p>
                        {isMe && (
                          <span className="flex-shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-700/50">
                            KAMU
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        <span className="font-medium">{siswa.kelas}</span>
                        <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
                        {siswa.nis}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/>{siswa.total_hadir}H
                        </span>
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"/>{siswa.total_terlambat}T
                        </span>
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"/>{siswa.total_alpha}A
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                      <span className="text-xl font-black tabular-nums leading-none" style={{ color:activeTab.color }}>{val}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{activeTab.label.toLowerCase()}</span>
                      <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-0.5">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width:`${barW}%`, background:activeTab.color }}/>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {items.length===0 && (
                <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Trophy size={28} className="opacity-30"/>
                  </div>
                  <p className="text-sm font-medium">Belum ada data ranking</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">Data akan muncul setelah ada absensi</p>
                </div>
              )}
            </div>

            {/* PAGINATION */}
            {lastPage > 1 && (
              <Pagination page={page} lastPage={lastPage} total={total} perPage={perPage}
                onPage={handlePage} color={activeTab.color}/>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
