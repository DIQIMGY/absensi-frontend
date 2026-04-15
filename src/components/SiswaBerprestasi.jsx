import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, ChevronLeft, ChevronRight } from 'lucide-react'

/* ─── extract badge label dari prestasi ──────────────────────────────────── */
const getBadge = (prestasi) => {
  if (!prestasi) return 'Berprestasi'
  const p = prestasi.trim()
  // ambil kata-kata kunci yang meaningful
  const keywords = ['OSN', 'O2SN', 'FLS2N', 'FLSSN', 'LKS', 'PORSENI', 'OLIMPIADE', 'LOMBA', 'JUARA', 'HAFIDZ', 'TAHFIDZ', 'SENI', 'OLAHRAGA', 'AKADEMIK', 'SAINS', 'TEKNOLOGI', 'DEBAT', 'PIDATO', 'PUISI', 'KARYA', 'INOVASI']
  const upper = p.toUpperCase()
  for (const kw of keywords) {
    if (upper.includes(kw)) return kw.charAt(0) + kw.slice(1).toLowerCase()
  }
  // ambil 2 kata pertama, maks 14 karakter
  const words = p.split(' ').slice(0, 2).join(' ')
  return words.length > 14 ? words.slice(0, 13) + '…' : words
}

/* ─── rank config ─────────────────────────────────────────────────────────── */
const RANKS = [
  { color: '#f59e0b', glow: 'rgba(245,158,11,0.35)', grad: 'from-amber-900/80 to-amber-600/60' },
  { color: '#94a3b8', glow: 'rgba(148,163,184,0.25)', grad: 'from-slate-800/80 to-slate-600/60' },
  { color: '#f97316', glow: 'rgba(249,115,22,0.25)', grad: 'from-orange-900/80 to-orange-600/60' },
  { color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)',  grad: 'from-violet-900/80 to-violet-600/60' },
  { color: '#10b981', glow: 'rgba(16,185,129,0.2)',  grad: 'from-emerald-900/80 to-emerald-600/60' },
  { color: '#6366f1', glow: 'rgba(99,102,241,0.2)',  grad: 'from-indigo-900/80 to-indigo-600/60' },
  { color: '#ec4899', glow: 'rgba(236,72,153,0.2)',  grad: 'from-pink-900/80 to-pink-600/60' },
  { color: '#14b8a6', glow: 'rgba(20,184,166,0.2)',  grad: 'from-teal-900/80 to-teal-600/60' },
  { color: '#f43f5e', glow: 'rgba(244,63,94,0.2)',   grad: 'from-rose-900/80 to-rose-600/60' },
  { color: '#a78bfa', glow: 'rgba(167,139,250,0.2)', grad: 'from-purple-900/80 to-purple-600/60' },
]

/* ─── single card ─────────────────────────────────────────────────────────── */
function Card({ siswa, rank, onClick }) {
  const r = RANKS[rank] || RANKS[5]
  const [err, setErr] = useState(false)
  const isTop = rank === 0

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      onClick={() => onClick(siswa, rank)}
      className="relative flex-shrink-0 cursor-pointer"
      style={{ width: isTop ? 'clamp(140px, 36vw, 180px)' : 'clamp(120px, 30vw, 155px)' }}>

      <div className="relative rounded-2xl overflow-hidden shadow-xl"
        style={{
          aspectRatio: '2/3',
          boxShadow: isTop ? `0 8px 32px ${r.glow}` : `0 4px 16px rgba(0,0,0,0.25)`
        }}>

        {/* foto or gradient placeholder */}
        {siswa.foto_url && !err
          ? <img src={siswa.foto_url} alt={siswa.nama} className="w-full h-full object-cover"
              onError={() => setErr(true)}/>
          : <div className={`w-full h-full bg-gradient-to-br ${r.grad}`}/>}

        {/* cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"/>

        {/* top: badge dari prestasi */}
        <div className="absolute top-2.5 left-2.5">
          <div className="px-2 py-0.5 rounded-full text-[10px] font-black backdrop-blur-sm"
            style={{ background: `${r.color}25`, color: r.color, border: `1px solid ${r.color}40` }}>
            {getBadge(siswa.prestasi)}
          </div>
        </div>

        {/* top-right: gold dot for #1 */}
        {isTop && (
          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: r.color, boxShadow: `0 0 8px ${r.glow}` }}>
            <Trophy size={9} className="text-white"/>
          </div>
        )}

        {/* bottom info */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <p className="text-white font-black text-xs leading-tight truncate">{siswa.nama}</p>
          {siswa.kelas && (
            <p className="text-white/50 text-[10px] font-medium truncate mt-0.5">{siswa.kelas}</p>
          )}
          {siswa.prestasi && (
            <p className="text-[10px] font-semibold mt-1.5 leading-snug line-clamp-2"
              style={{ color: r.color }}>{siswa.prestasi}</p>
          )}
        </div>

        {/* bottom color line */}
        <div className="absolute bottom-0 inset-x-0 h-0.5" style={{ background: r.color }}/>
      </div>
    </motion.div>
  )
}

/* ─── detail modal ────────────────────────────────────────────────────────── */
function Modal({ siswa, rank, onClose }) {
  const r = RANKS[rank] || RANKS[5]
  const [err, setErr] = useState(false)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose}/>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">

        {/* hero */}
        <div className="relative h-56">
          {siswa.foto_url && !err
            ? <img src={siswa.foto_url} alt={siswa.nama} className="w-full h-full object-cover"
                onError={() => setErr(true)}/>
            : <div className={`w-full h-full bg-gradient-to-br ${r.grad}`}/>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>

          {/* close */}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
            <X size={14} className="text-white"/>
          </button>

          {/* rank badge */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-black backdrop-blur-sm"
            style={{ background: `${r.color}30`, color: r.color, border: `1px solid ${r.color}50` }}>
            {getBadge(siswa.prestasi)}
          </div>
        </div>

        {/* info */}
        <div className="p-5">
          <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">{siswa.nama}</h3>
          {siswa.kelas && (
            <p className="text-sm font-semibold mt-0.5" style={{ color: r.color }}>{siswa.kelas}</p>
          )}
          {siswa.prestasi && (
            <div className="mt-4 p-3.5 rounded-2xl border"
              style={{ background: `${r.color}08`, borderColor: `${r.color}20` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: r.color }}>Prestasi</p>
              <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{siswa.prestasi}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* ─── main ────────────────────────────────────────────────────────────────── */
export default function SiswaBerprestasi({ judul, deskripsi, siswaList = [] }) {
  const [selected, setSelected] = useState(null)
  const [selectedRank, setSelectedRank] = useState(0)
  const scrollRef = useRef()
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const valid = siswaList.filter(s => s?.nama)
  if (!valid.length) return null

  const checkScroll = () => {
    const el = scrollRef.current; if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    el?.addEventListener('scroll', checkScroll, { passive: true })
    return () => el?.removeEventListener('scroll', checkScroll)
  }, [valid.length])

  const scroll = dir => scrollRef.current?.scrollBy({ left: dir * 180, behavior: 'smooth' })

  return (
    <>
      <AnimatePresence>
        {selected && <Modal siswa={selected} rank={selectedRank} onClose={() => setSelected(null)}/>}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">

        {/* top accent */}
        <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"/>

        {/* header */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              {judul || 'Siswa Berprestasi'}
            </h3>
            {deskripsi && (
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{deskripsi}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => scroll(-1)} disabled={!canLeft}
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center disabled:opacity-25 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <ChevronLeft size={12} className="text-slate-500"/>
            </button>
            <button onClick={() => scroll(1)} disabled={!canRight}
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center disabled:opacity-25 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <ChevronRight size={12} className="text-slate-500"/>
            </button>
          </div>
        </div>

        {/* scroll cards */}
        <div ref={scrollRef} onScroll={checkScroll}
          className="flex items-end gap-2.5 px-4 pb-4 overflow-x-auto"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {valid.map((siswa, i) => (
            <div key={i} style={{ scrollSnapAlign: 'start' }}>
              <Card siswa={siswa} rank={i} onClick={(s, r) => { setSelected(s); setSelectedRank(r) }}/>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  )
}
