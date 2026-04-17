import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Lock, ChevronRight, Star } from 'lucide-react'
import { siswaApi } from '../services/siswaService'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
// RARITY CONFIG
// ─────────────────────────────────────────────
export const RARITY_CFG = {
  legendary: {
    label: 'Legendary', short: 'LEG',
    text: 'text-amber-300', bg: 'bg-amber-400/15', border: 'border-amber-400/60',
    glow: 'shadow-amber-400/50', ring: 'ring-amber-400/40',
    gradient: 'from-amber-500 via-yellow-400 to-amber-500',
    particle: '#fbbf24', shine: 'rgba(251,191,36,0.35)',
  },
  epic: {
    label: 'Epic', short: 'EPIC',
    text: 'text-fuchsia-300', bg: 'bg-fuchsia-500/15', border: 'border-fuchsia-500/60',
    glow: 'shadow-fuchsia-500/50', ring: 'ring-fuchsia-400/40',
    gradient: 'from-fuchsia-500 via-purple-400 to-fuchsia-500',
    particle: '#d946ef', shine: 'rgba(217,70,239,0.35)',
  },
  rare: {
    label: 'Rare', short: 'RARE',
    text: 'text-sky-300', bg: 'bg-sky-400/15', border: 'border-sky-400/60',
    glow: 'shadow-sky-400/50', ring: 'ring-sky-400/40',
    gradient: 'from-sky-500 via-blue-400 to-sky-500',
    particle: '#38bdf8', shine: 'rgba(56,189,248,0.35)',
  },
  uncommon: {
    label: 'Uncommon', short: 'UNC',
    text: 'text-emerald-300', bg: 'bg-emerald-400/15', border: 'border-emerald-400/60',
    glow: 'shadow-emerald-400/40', ring: 'ring-emerald-400/30',
    gradient: 'from-emerald-500 via-green-400 to-emerald-500',
    particle: '#34d399', shine: 'rgba(52,211,153,0.25)',
  },
  common: {
    label: 'Common', short: 'COM',
    text: 'text-slate-300', bg: 'bg-slate-400/10', border: 'border-slate-400/40',
    glow: 'shadow-slate-400/20', ring: 'ring-slate-400/20',
    gradient: 'from-slate-400 via-slate-300 to-slate-400',
    particle: '#94a3b8', shine: 'rgba(148,163,184,0.15)',
  },
}

// ─────────────────────────────────────────────
// BADGE POOL
// ─────────────────────────────────────────────
export const BADGE_POOL = [
  { id: 'mahkota',      name: 'Mahkota Raja',   emoji: '👑', rarity: 'legendary' },
  { id: 'bintang_emas', name: 'Bintang Emas',   emoji: '⭐', rarity: 'legendary' },
  { id: 'berlian',      name: 'Berlian',         emoji: '💎', rarity: 'epic'      },
  { id: 'petir',        name: 'Petir',           emoji: '⚡', rarity: 'epic'      },
  { id: 'api',          name: 'Api Abadi',       emoji: '🔥', rarity: 'rare'      },
  { id: 'pelangi',      name: 'Pelangi',         emoji: '🌈', rarity: 'rare'      },
  { id: 'roket',        name: 'Roket',           emoji: '🚀', rarity: 'uncommon'  },
  { id: 'daun',         name: 'Semanggi',        emoji: '🍀', rarity: 'uncommon'  },
  { id: 'buku',         name: 'Buku Pintar',     emoji: '📚', rarity: 'common'    },
  { id: 'pensil',       name: 'Pensil Ajaib',    emoji: '✏️', rarity: 'common'    },
]

// ─────────────────────────────────────────────
// PARTICLE BURST (canvas)
// ─────────────────────────────────────────────
function ParticleBurst({ color, active }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = 320
    const H = canvas.height = 320
    const particles = Array.from({ length: 48 }, () => ({
      x: W / 2, y: H / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14,
      r: Math.random() * 5 + 2,
      alpha: 1,
      color,
    }))
    let raf
    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        p.vy += 0.3; p.alpha -= 0.022
        if (p.alpha <= 0) return
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      })
      if (particles.some(p => p.alpha > 0)) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, color])
  return (
    <canvas ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ width: 320, height: 320, left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
  )
}

// ─────────────────────────────────────────────
// BADGE OVERLAY (dipakai di foto profil)
// ─────────────────────────────────────────────
export function BadgeOverlay({ badgeId, badges = [], size = 'md' }) {
  const badge = badges.find(b => b.id === badgeId) || BADGE_POOL.find(b => b.id === badgeId)
  if (!badge) return null
  const cfg = RARITY_CFG[badge.rarity] || RARITY_CFG.common
  const sz = { sm: 'w-5 h-5 text-[11px]', md: 'w-7 h-7 text-sm', lg: 'w-9 h-9 text-base' }
  const pos = { sm: '-bottom-0.5 -right-0.5', md: '-bottom-1 -right-1', lg: '-bottom-1.5 -right-1.5' }
  return (
    <motion.div
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      className={`absolute ${pos[size]} ${sz[size]} rounded-full flex items-center justify-center
        border-2 border-white/70 shadow-lg ${cfg.bg} ring-2 ${cfg.ring} z-10`}
      title={`${badge.name} · ${cfg.label}`}
    >
      <span role="img">{badge.emoji}</span>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// RESULT MODAL — cinematic reveal
// ─────────────────────────────────────────────
function ResultModal({ badge, onClose, onEquip }) {
  const cfg = RARITY_CFG[badge?.rarity] || RARITY_CFG.common
  const [burst, setBurst] = useState(false)
  const [equipped, setEquipped] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setBurst(true), 200)
    return () => clearTimeout(t)
  }, [])

  const handleEquip = async () => {
    try {
      await siswaApi.equipBadge(badge.id)
      setEquipped(true)
      onEquip(badge.id)
      toast.success('Badge terpasang di profil!', { icon: badge.emoji })
    } catch { toast.error('Gagal pasang badge') }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      {/* Ambient glow behind card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 3, opacity: 0.15 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="w-64 h-64 rounded-full"
          style={{ background: cfg.particle }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 60 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.05 }}
        className="relative w-80 mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Card */}
        <div className={`relative rounded-3xl border-2 ${cfg.border} overflow-hidden`}
          style={{ background: 'linear-gradient(145deg, #0f0f1a, #1a1a2e)' }}>

          {/* Shine sweep */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '200%', opacity: [0, 0.6, 0] }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 w-1/2 skew-x-12 pointer-events-none z-10"
            style={{ background: `linear-gradient(90deg, transparent, ${cfg.shine}, transparent)` }}
          />

          {/* Rarity banner top */}
          <div className={`w-full py-2 text-center bg-gradient-to-r ${cfg.gradient}`}>
            <span className="text-xs font-black tracking-[0.25em] text-white/90 uppercase">
              ✦ {cfg.label} ✦
            </span>
          </div>

          {/* Emoji area */}
          <div className="relative flex items-center justify-center py-10">
            <ParticleBurst color={cfg.particle} active={burst} />
            {/* Glow ring */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute w-32 h-32 rounded-full"
              style={{ background: `radial-gradient(circle, ${cfg.shine} 0%, transparent 70%)` }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
              className="relative z-10 text-7xl select-none"
              style={{ filter: `drop-shadow(0 0 20px ${cfg.particle})` }}
            >
              {badge.emoji}
            </motion.div>
          </div>

          {/* Badge info */}
          <div className="px-6 pb-2 text-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-2xl font-black text-white tracking-tight"
            >
              {badge.name}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}
            >
              <Star size={9} fill="currentColor" /> {cfg.label}
            </motion.div>
          </div>

          {/* NEW badge indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="absolute top-10 right-4 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider shadow-lg"
          >
            NEW
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex gap-3 px-6 py-5"
          >
            {!equipped ? (
              <>
                <button onClick={handleEquip}
                  className={`flex-1 py-3 rounded-2xl text-sm font-black text-white bg-gradient-to-r ${cfg.gradient} shadow-lg transition-all active:scale-95`}
                  style={{ boxShadow: `0 4px 20px ${cfg.shine}` }}
                >
                  Pasang Badge
                </button>
                <button onClick={onClose}
                  className="px-4 py-3 rounded-2xl text-sm font-semibold text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  Nanti
                </button>
              </>
            ) : (
              <button onClick={onClose}
                className={`flex-1 py-3 rounded-2xl text-sm font-black text-white bg-gradient-to-r ${cfg.gradient} shadow-lg transition-all active:scale-95`}>
                ✓ Terpasang — Keren!
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// GACHA CARD — main component
// ─────────────────────────────────────────────
export default function GachaHarian({ onBadgeChange }) {
  const [status, setStatus]   = useState(null)
  const [rolling, setRolling] = useState(false)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStatus() }, [])

  // ── fetch & sync ke parent ──────────────────
  const fetchStatus = async () => {
    try {
      const res = await siswaApi.getGachaStatus()
      setStatus(res.data)
      // sync parent setiap kali status fresh
      onBadgeChange?.(res.data.active_badge ?? null, res.data.badges ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  // ── roll ────────────────────────────────────
  const handleRoll = async () => {
    if (rolling || !status?.can_roll) return
    setRolling(true)
    try {
      const res = await siswaApi.rollGacha()
      const badge = res.data.badge
      // update status lokal dulu
      setStatus(prev => ({
        ...prev,
        can_roll: false,
        badges: res.data.badges ?? prev?.badges ?? [],
        active_badge: res.data.active_badge ?? prev?.active_badge ?? null,
      }))
      // sync parent
      onBadgeChange?.(res.data.active_badge ?? null, res.data.badges ?? [])
      setResult(badge)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal roll gacha')
    } finally { setRolling(false) }
  }

  // ── equip dari result modal ─────────────────
  const handleEquipFromModal = (badgeId) => {
    setStatus(prev => ({ ...prev, active_badge: badgeId }))
    onBadgeChange?.(badgeId, status?.badges ?? [])
  }

  // ── equip/unequip dari koleksi ──────────────
  const handleToggleBadge = async (badge) => {
    const isActive = status?.active_badge === badge.id
    try {
      if (isActive) {
        await siswaApi.unequipBadge()
        setStatus(prev => ({ ...prev, active_badge: null }))
        onBadgeChange?.(null, status?.badges ?? [])
        toast.success('Badge dilepas')
      } else {
        await siswaApi.equipBadge(badge.id)
        setStatus(prev => ({ ...prev, active_badge: badge.id }))
        onBadgeChange?.(badge.id, status?.badges ?? [])
        toast.success(`${badge.emoji} ${badge.name} terpasang!`)
      }
    } catch { toast.error('Gagal') }
  }

  if (loading) return null

  const canRoll = status?.can_roll
  let nextLabel = 'besok'
  if (!canRoll && status?.next_roll_at) {
    try {
      nextLabel = new Date(status.next_roll_at)
        .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    } catch { /**/ }
  }

  const badges = status?.badges ?? []
  const activeBadgeId = status?.active_badge ?? null

  return (
    <>
      {/* ── CARD ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5"
        style={{ background: 'linear-gradient(145deg, #0d0d1a 0%, #12122a 50%, #0d0d1a 100%)' }}>

        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

        {/* Header */}
        <div className="relative flex items-center gap-3 px-5 pt-5 pb-4">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles size={16} className="text-violet-300" />
            </div>
            {canRoll && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-[#0d0d1a] animate-pulse" />
            )}
          </div>
          <div>
            <p className="text-sm font-black text-white tracking-tight">Gacha Harian</p>
            <p className="text-[10px] text-white/30 font-medium">
              {canRoll ? 'Roll tersedia sekarang!' : `Refresh pukul ${nextLabel}`}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-white/40">1×</span>
            <span className="text-[10px] text-white/25">/hari</span>
          </div>
        </div>

        {/* Roll button — hero element */}
        <div className="px-5 pb-4">
          <motion.button
            onClick={handleRoll}
            disabled={!canRoll || rolling}
            whileTap={canRoll ? { scale: 0.97 } : {}}
            className="relative w-full overflow-hidden rounded-2xl py-4 font-black text-sm tracking-wide transition-all"
            style={canRoll ? {
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9, #4f46e5)',
              boxShadow: '0 0 30px rgba(124,58,237,0.4), 0 4px 15px rgba(0,0,0,0.3)',
              color: '#fff',
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.25)',
              cursor: 'not-allowed',
            }}
          >
            {/* Shimmer on active */}
            {canRoll && !rolling && (
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1 }}
                className="absolute inset-0 w-1/3 skew-x-12 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2">
              {rolling ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                    className="inline-block">✦</motion.span>
                  Membuka...
                </>
              ) : canRoll ? (
                <><Sparkles size={15} /> Buka Gacha Sekarang <ChevronRight size={14} /></>
              ) : (
                <><Lock size={13} /> Sudah digunakan hari ini</>
              )}
            </span>
          </motion.button>
        </div>

        {/* Badge collection */}
        {badges.length > 0 && (
          <div className="px-5 pb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Koleksi</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => {
                const cfg = RARITY_CFG[badge.rarity] || RARITY_CFG.common
                const isActive = activeBadgeId === badge.id
                return (
                  <motion.button
                    key={badge.id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handleToggleBadge(badge)}
                    title={`${badge.name} · ${cfg.label}${isActive ? ' (aktif)' : ''}`}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all"
                    style={isActive ? {
                      background: cfg.shine,
                      borderColor: cfg.particle,
                      color: '#fff',
                      boxShadow: `0 0 12px ${cfg.shine}`,
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.45)',
                    }}
                  >
                    <span className="text-base leading-none">{badge.emoji}</span>
                    <span className="hidden sm:inline">{badge.name}</span>
                    <span className={`text-[9px] font-black ${cfg.text}`}>{cfg.short}</span>
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0d0d1a] flex items-center justify-center">
                        <span className="text-[7px] text-white font-black">✓</span>
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      </div>

      {/* ── RESULT MODAL ── */}
      <AnimatePresence>
        {result && (
          <ResultModal
            badge={result}
            onClose={() => setResult(null)}
            onEquip={handleEquipFromModal}
          />
        )}
      </AnimatePresence>
    </>
  )
}
