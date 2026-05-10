import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, RefreshCw, Crown, Star,
  ChevronLeft, ChevronRight,
  CheckCircle, Clock, AlertTriangle, X,
  GraduationCap, Shield, UserCheck,
} from 'lucide-react'
import { siswaApi } from '../../services/siswaService'
import { BadgeOverlay } from '../../components/GachaHarian'

// ─── CONFIG ───────────────────────────────────────────────────
const TABS = [
  {
    key: 'hadir', label: 'Rajin', emoji: '🏆',
    color: '#10b981',
    gradFull: 'linear-gradient(135deg,#059669,#10b981,#34d399)',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle,
    desc: 'Paling sering hadir',
  },
  {
    key: 'terlambat', label: 'Terlambat', emoji: '⏰',
    color: '#f59e0b',
    gradFull: 'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)',
    text: 'text-amber-600 dark:text-amber-400',
    icon: Clock,
    desc: 'Paling sering terlambat',
  },
  {
    key: 'alpha', label: 'Alpha', emoji: '💀',
    color: '#ef4444',
    gradFull: 'linear-gradient(135deg,#dc2626,#ef4444,#f87171)',
    text: 'text-rose-600 dark:text-rose-400',
    icon: AlertTriangle,
    desc: 'Paling sering alpha',
  },
]

const PODIUM_CFG = [
  { rank: 1, size: 60, crown: '👑', ringColor: '#f59e0b', label: '#1', order: 'order-2', baseH: 'h-20', textColor: 'text-amber-500' },
  { rank: 2, size: 50, crown: '🥈', ringColor: '#94a3b8', label: '#2', order: 'order-1', baseH: 'h-14', textColor: 'text-slate-400' },
  { rank: 3, size: 44, crown: '🥉', ringColor: '#f97316', label: '#3', order: 'order-3', baseH: 'h-10', textColor: 'text-orange-400' },
]

// ─── AVATAR ───────────────────────────────────────────────────
function SiswaAvatar({ siswa, size = 44 }) {
  const [err, setErr] = useState(false)
  const initial = (siswa?.nama_lengkap || 'S').charAt(0).toUpperCase()
  const hasBadge = !!siswa?.active_badge
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className={`w-full h-full overflow-hidden bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center font-black text-white ${hasBadge ? 'rounded-full' : 'rounded-2xl'}`}
        style={{ fontSize: Math.round(size * 0.38) }}
      >
        {siswa?.foto_url && !err
          ? <img src={siswa.foto_url} alt={siswa.nama_lengkap} className="w-full h-full object-cover" onError={() => setErr(true)} />
          : initial}
      </div>
      {hasBadge && <BadgeOverlay badgeId={siswa.active_badge} badges={[]} size="sm" />}
    </div>
  )
}

// ─── PROFILE CARD MODAL ───────────────────────────────────────
function ProfileCardModal({ siswa, onClose, myId }) {
  const [coverErr, setCoverErr] = useState(false)
  const [fotoErr,  setFotoErr]  = useState(false)
  const isMe = siswa?.id === myId

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

  const hasCover = siswa.foto_cover_url && !coverErr
  const hasFoto  = siswa.foto_url && !fotoErr
  const initial  = (siswa.nama_lengkap || 'S').charAt(0).toUpperCase()
  const hasBadge = !!siswa.active_badge

  const totalAbsen = (siswa.total_hadir||0) + (siswa.total_terlambat||0) + (siswa.total_alpha||0)
  const pctHadir   = totalAbsen > 0 ? Math.round(((siswa.total_hadir||0)+(siswa.total_terlambat||0))/totalAbsen*100) : 0
  const pctColor   = pctHadir >= 80 ? '#10b981' : pctHadir >= 60 ? '#f59e0b' : '#ef4444'
  const pctLabel   = pctHadir >= 80 ? 'Baik' : pctHadir >= 60 ? 'Cukup' : 'Kurang'
  const rankEmoji  = siswa.posisi <= 3 ? ['👑','🥈','🥉'][siswa.posisi-1] : null

  return (
    <AnimatePresence>
      {/* ── BACKDROP ── */}
      <motion.div
        key="bd"
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        transition={{ duration:0.2 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
        style={{ background:'rgba(2,6,23,0.82)', backdropFilter:'blur(10px)' }}
        onClick={onClose}
      >
        {/* ── CARD ── */}
        <motion.div
          key="card"
          initial={{ opacity:0, y:72, scale:0.94 }}
          animate={{ opacity:1, y:0, scale:1 }}
          exit={{ opacity:0, y:48, scale:0.96 }}
          transition={{ type:'spring', stiffness:360, damping:32 }}
          className="w-full sm:max-w-[340px] rounded-t-[24px] sm:rounded-[24px] overflow-hidden"
          style={{ background:'#111827', boxShadow:'0 40px 100px rgba(0,0,0,0.7)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* drag handle mobile */}
          <div className="flex justify-center pt-2.5 sm:hidden">
            <div className="w-8 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/>
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
            {/* rank pill */}
            <div className="absolute top-2.5 left-2.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.12)' }}>
                {rankEmoji && <span className="text-sm leading-none">{rankEmoji}</span>}
                <span className="text-white font-black text-[11px]">#{siswa.posisi}</span>
              </div>
            </div>
            {/* close */}
            <motion.button whileTap={{ scale:0.85 }} onClick={onClose}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.12)' }}>
              <X size={13} className="text-white/80"/>
            </motion.button>
          </div>

          {/* ── INFO SECTION — bersih, tidak overlap ── */}
          <div className="px-4 pt-4 pb-5">

            {/* ── ROW: avatar kecil + nama ── */}
            <div className="flex items-center gap-3 mb-4">
              {/* Avatar kecil — 48px, badge scale kecil jadi tidak nabrak */}
              <div className="relative flex-shrink-0" style={{ width:56, height:56 }}>
                {/* ring */}
                <div className="absolute inset-0 rounded-full"
                  style={{
                    padding:2,
                    background: isMe
                      ? 'linear-gradient(135deg,#7c3aed,#c4b5fd)'
                      : 'linear-gradient(135deg,#6366f1,#a5b4fc)',
                    boxShadow: isMe ? '0 0 14px rgba(124,58,237,0.5)' : '0 0 10px rgba(99,102,241,0.35)',
                  }}>
                  <div className="w-full h-full rounded-full"
                    style={{ background:'#111827', padding:2 }}>
                    <div
                      className={`w-full h-full overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-black text-white ${hasBadge?'rounded-full':'rounded-xl'}`}
                      style={{ fontSize:18 }}>
                      {hasFoto
                        ? <img src={siswa.foto_url} alt={siswa.nama_lengkap} className="w-full h-full object-cover" onError={()=>setFotoErr(true)}/>
                        : initial}
                    </div>
                  </div>
                </div>
                {/* badge — size xs, scale lebih kecil */}
                {hasBadge && (
                  <div className="absolute pointer-events-none" style={{ inset:-8 }}>
                    <div className="relative w-full h-full">
                      <BadgeOverlay badgeId={siswa.active_badge} badges={[]} size="sm"/>
                    </div>
                  </div>
                )}
              </div>

              {/* nama + info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-[15px] font-black text-white leading-tight truncate">
                    {siswa.nama_lengkap}
                  </h2>
                  {isMe && (
                    <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-black"
                      style={{ background:'rgba(124,58,237,0.2)', border:'1px solid rgba(167,139,250,0.35)', color:'#c4b5fd' }}>
                      <Star size={6}/>KAMU
                    </span>
                  )}
                </div>
                <p className="text-[11px] mt-0.5 font-medium truncate"
                  style={{ color:'rgba(148,163,184,0.85)' }}>
                  {siswa.kelas || '-'}
                </p>
                <p className="text-[10px] mt-0.5"
                  style={{ color:'rgba(71,85,105,0.9)' }}>
                  NIS {siswa.nis || '-'}
                </p>
              </div>
            </div>

            {/* ── KEHADIRAN BAR ── */}
            <div className="mb-4 px-3 py-3 rounded-2xl"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color:'rgba(100,116,139,0.8)' }}>Kehadiran</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-black tabular-nums" style={{ color:pctColor }}>{pctHadir}%</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background:`${pctColor}18`, color:pctColor, border:`1px solid ${pctColor}28` }}>
                    {pctLabel}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                <motion.div className="h-full rounded-full"
                  initial={{ width:0 }}
                  animate={{ width:`${pctHadir}%` }}
                  transition={{ duration:0.9, ease:'easeOut', delay:0.15 }}
                  style={{ background: pctHadir>=80
                    ? 'linear-gradient(90deg,#059669,#34d399)'
                    : pctHadir>=60
                    ? 'linear-gradient(90deg,#d97706,#fbbf24)'
                    : 'linear-gradient(90deg,#dc2626,#f87171)' }}/>
              </div>
            </div>

            {/* ── STATS 3 KOLOM ── */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label:'Hadir',     val:siswa.total_hadir,     c:'#10b981', bg:'rgba(16,185,129,0.08)',  bd:'rgba(16,185,129,0.18)' },
                { label:'Terlambat', val:siswa.total_terlambat, c:'#f59e0b', bg:'rgba(245,158,11,0.08)', bd:'rgba(245,158,11,0.18)' },
                { label:'Alpha',     val:siswa.total_alpha,     c:'#ef4444', bg:'rgba(239,68,68,0.08)',  bd:'rgba(239,68,68,0.18)'  },
              ].map((s,i) => (
                <motion.div key={s.label}
                  initial={{ opacity:0, y:12 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.1+i*0.06, type:'spring', stiffness:240, damping:20 }}
                  className="rounded-2xl text-center py-3.5 px-2 relative overflow-hidden"
                  style={{ background:s.bg, border:`1px solid ${s.bd}` }}>
                  {/* top line */}
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background:`linear-gradient(90deg,transparent,${s.c},transparent)` }}/>
                  <p className="text-[22px] font-black tabular-nums leading-none" style={{ color:s.c }}>{s.val}</p>
                  <p className="text-[9px] font-semibold mt-1.5 uppercase tracking-wider"
                    style={{ color:'rgba(148,163,184,0.6)' }}>{s.label}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── PODIUM TOP 3 ─────────────────────────────────────────────
function PodiumSection({ items, valKey, activeTab, myId, onAvatarClick }) {
  const top3 = items.slice(0, 3)
  if (top3.length === 0) return null
  // order: 2nd, 1st, 3rd
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean)

  return (
    <div className="relative mb-5">
      <div className="absolute inset-0 rounded-3xl opacity-15 blur-2xl pointer-events-none"
        style={{ background: activeTab.gradFull }} />
      <div className="relative rounded-3xl overflow-hidden border border-white/10"
        style={{ background: 'linear-gradient(160deg,rgba(15,23,42,0.97) 0%,rgba(30,27,75,0.97) 100%)' }}>
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg,transparent,${activeTab.color},transparent)` }} />

        <div className="relative z-10 pt-5 pb-4 px-4">
          <p className="text-center text-[10px] font-bold text-white/30 uppercase tracking-widest mb-6">
            {activeTab.emoji} Top 3 — {activeTab.desc}
          </p>

          <div className="flex items-end justify-center gap-6 sm:gap-10">
            {ordered.map((siswa) => {
              const cfg = PODIUM_CFG.find(c => c.rank === siswa.posisi)
              if (!cfg) return null
              const val = siswa[valKey]
              const isMe = siswa.id === myId
              return (
                <motion.div
                  key={siswa.id}
                  className={`flex flex-col items-center gap-2 ${cfg.order}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: cfg.rank === 1 ? 0 : cfg.rank === 2 ? 0.1 : 0.2, type: 'spring', stiffness: 180 }}
                >
                  <span className="text-2xl leading-none">{cfg.crown}</span>

                  {/* Avatar — padding biar border nggak nempel, clickable */}
                  <motion.div
                    whileTap={{ scale: 0.93 }}
                    className="rounded-full p-[3px] cursor-pointer"
                    onClick={() => onAvatarClick(siswa)}
                    style={{
                      background: isMe
                        ? 'linear-gradient(135deg,#7c3aed,#a78bfa)'
                        : `linear-gradient(135deg,${cfg.ringColor}cc,${cfg.ringColor}55)`,
                      boxShadow: `0 0 16px ${isMe ? '#7c3aed66' : cfg.ringColor + '44'}`,
                    }}
                  >
                    <div className="rounded-full p-[2px] bg-slate-900">
                      <SiswaAvatar siswa={siswa} size={cfg.size} />
                    </div>
                  </motion.div>

                  {isMe && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/40">
                      <Star size={8} className="text-violet-400" />
                      <span className="text-[8px] font-black text-violet-400">KAMU</span>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-white font-black text-[11px] leading-tight max-w-[72px] truncate">
                      {siswa.nama_lengkap.split(' ')[0]}
                    </p>
                    <p className="text-white/35 text-[9px] truncate max-w-[72px]">{siswa.kelas}</p>
                  </div>

                  {/* Podium base */}
                  <div className={`w-full min-w-[64px] flex flex-col items-center rounded-t-2xl pt-2 pb-1 px-3 ${cfg.baseH}`}
                    style={{ background: `${activeTab.color}20`, borderTop: `2px solid ${activeTab.color}50` }}>
                    <span className="font-black tabular-nums text-sm leading-none" style={{ color: activeTab.color }}>{val}</span>
                    <span className="text-white/30 text-[8px] mt-0.5">{activeTab.label.toLowerCase()}</span>
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
  const from = (page - 1) * perPage + 1
  const to   = Math.min(page * perPage, total)

  const pages = []
  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(lastPage - 1, page + 1); i++) pages.push(i)
    if (page < lastPage - 2) pages.push('...')
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
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onPage(page - 1)} disabled={page <= 1}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm">
          <ChevronLeft size={15} />
        </motion.button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm font-bold">···</span>
          ) : (
            <motion.button key={p} whileTap={{ scale: 0.88 }} onClick={() => onPage(p)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black transition-all shadow-sm ${
                p === page ? 'text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              style={p === page ? { background: color, boxShadow: `0 4px 14px ${color}55` } : {}}>
              {p}
            </motion.button>
          )
        )}

        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onPage(page + 1)} disabled={page >= lastPage}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm">
          <ChevronRight size={15} />
        </motion.button>
      </div>

      <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mx-1">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${(page / lastPage) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }} />
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function SiswaRankingPage() {
  const [tab, setTab]               = useState('hadir')
  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSiswa, setSelectedSiswa] = useState(null)
  const listRef = useRef(null)

  const fetchRanking = useCallback(async (pg = 1, sort = tab, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const res = await siswaApi.getRankingSekolah({ page: pg, sort })
      setData(res.data.data)
      setPage(pg)
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [tab])

  useEffect(() => { fetchRanking(1, tab) }, [tab])

  // Listen badge-changed — update active_badge untuk user ini di list secara instan
  useEffect(() => {
    const onBadgeChanged = (e) => {
      const newBadge = e.detail?.activeBadge ?? null
      setData(prev => {
        if (!prev) return prev
        const myId = prev.my_id
        const patch = (list) => list?.map(s => s.id === myId ? { ...s, active_badge: newBadge } : s) ?? []
        return { ...prev, data: patch(prev.data) }
      })
    }
    window.addEventListener('badge-changed', onBadgeChanged)
    return () => window.removeEventListener('badge-changed', onBadgeChanged)
  }, [])

  const handleTab  = (key) => { setTab(key); setPage(1) }
  const handlePage = (pg) => {
    fetchRanking(pg, tab)
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  const activeTab = TABS.find(t => t.key === tab)
  const items     = data?.data || []
  const total     = data?.total || 0
  const lastPage  = data?.last_page || 1
  const perPage   = data?.per_page || 10
  const myId      = data?.my_id
  const myPosisi  = data?.my_posisi
  const valKey    = tab === 'hadir' ? 'total_hadir' : tab === 'terlambat' ? 'total_terlambat' : 'total_alpha'
  const maxVal    = items[0]?.[valKey] || 1

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 pb-10">

      {/* ── PROFILE CARD MODAL ── */}
      {selectedSiswa && (
        <ProfileCardModal
          siswa={selectedSiswa}
          myId={myId}
          onClose={() => setSelectedSiswa(null)}
        />
      )}

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: activeTab.gradFull }}>
              <Trophy size={15} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Ranking Sekolah</h1>
          </div>
          <p className="text-[11px] text-slate-400 ml-10">
            {data?.bulan ? `Bulan ${data.bulan}/${data.tahun} · ` : ''}
            <span className="font-semibold text-slate-500 dark:text-slate-300">{total} siswa</span>
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => fetchRanking(page, tab, true)} disabled={refreshing}
          className="mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {/* ── TABS ── */}
      <div className="relative flex gap-2 mb-5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
        {TABS.map(t => {
          const Icon = t.icon
          const isActive = tab === t.key
          return (
            <button key={t.key} onClick={() => handleTab(t.key)}
              className="relative flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs font-black transition-all z-10">
              {isActive && (
                <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl shadow-lg"
                  style={{ background: t.gradFull }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <Icon size={13} className={`relative z-10 transition-colors ${isActive ? 'text-white' : t.text}`} />
              <span className={`relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── MY POSITION BANNER ── */}
      <AnimatePresence>
        {myPosisi && (
          <motion.div key="my-pos" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: `${activeTab.color}12`, border: `1px solid ${activeTab.color}35` }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${activeTab.color}25` }}>
              <Crown size={15} style={{ color: activeTab.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">Posisi kamu bulan ini</p>
              <p className="text-sm font-black text-slate-800 dark:text-white">
                <span style={{ color: activeTab.color }}>#{myPosisi}</span>
                <span className="text-slate-400 font-normal text-xs ml-1">dari {total} siswa</span>
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-slate-400">Persentil</p>
              <p className="text-sm font-black" style={{ color: activeTab.color }}>
                {total > 0 ? Math.round(((total - myPosisi) / total) * 100) : 0}%
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LOADING ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: `${activeTab.color} transparent transparent transparent` }} />
          </div>
          <p className="text-sm text-slate-400 font-medium">Memuat ranking...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={`${tab}-${page}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}>

            {/* Podium top 3 — page 1 only */}
            {page === 1 && items.length > 0 && (
              <PodiumSection items={items} valKey={valKey} activeTab={activeTab} myId={myId}
                onAvatarClick={(s) => setSelectedSiswa(s)} />
            )}

            {/* ── LIST ── */}
            <div ref={listRef} className="space-y-2">
              {items.map((siswa, i) => {
                const isMe   = siswa.id === myId
                const posisi = siswa.posisi
                const val    = siswa[valKey]
                const barW   = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0
                const isTop3 = posisi <= 3 && page === 1
                const medals = ['🥇', '🥈', '🥉']

                return (
                  <motion.div key={siswa.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025, type: 'spring', stiffness: 200, damping: 20 }}
                    className={`relative flex items-center gap-3 px-3 sm:px-4 py-3 rounded-2xl border overflow-hidden transition-all ${
                      isMe
                        ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700/50 ring-1 ring-violet-300/60 dark:ring-violet-700/40'
                        : isTop3 && posisi === 1
                        ? 'bg-amber-50/80 dark:bg-amber-900/15 border-amber-200 dark:border-amber-700/40'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}>

                    {/* Progress bar bg */}
                    <motion.div className="absolute inset-y-0 left-0 pointer-events-none rounded-2xl"
                      initial={{ width: 0 }} animate={{ width: `${barW}%` }}
                      transition={{ delay: 0.3 + i * 0.03, duration: 0.7, ease: 'easeOut' }}
                      style={{ background: isMe ? 'rgba(139,92,246,0.06)' : `${activeTab.color}07` }} />

                    {/* Rank */}
                    <div className="w-8 sm:w-9 flex-shrink-0 flex items-center justify-center">
                      {isTop3 ? (
                        <span className="text-xl leading-none">{medals[posisi - 1]}</span>
                      ) : (
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black ${
                          isMe ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400'
                               : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>{posisi}</div>
                      )}
                    </div>

                    {/* Avatar — clickable */}
                    <motion.div whileTap={{ scale: 0.9 }} className="cursor-pointer flex-shrink-0"
                      onClick={() => setSelectedSiswa(siswa)}>
                      <SiswaAvatar siswa={siswa} size={42} />
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
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />{siswa.total_hadir}H
                        </span>
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />{siswa.total_terlambat}T
                        </span>
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />{siswa.total_alpha}A
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                      <span className="text-xl font-black tabular-nums leading-none" style={{ color: activeTab.color }}>{val}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{activeTab.label.toLowerCase()}</span>
                      <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-0.5">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${barW}%`, background: activeTab.color }} />
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {items.length === 0 && (
                <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Trophy size={28} className="opacity-30" />
                  </div>
                  <p className="text-sm font-medium">Belum ada data ranking</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">Data akan muncul setelah ada absensi</p>
                </div>
              )}
            </div>

            {/* ── PAGINATION ── */}
            {lastPage > 1 && (
              <Pagination page={page} lastPage={lastPage} total={total} perPage={perPage}
                onPage={handlePage} color={activeTab.color} />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
