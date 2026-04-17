import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Star, Zap } from 'lucide-react'
import { siswaApi } from '../services/siswaService'
import { useThemeStore } from '../stores/themeStore'
import toast from 'react-hot-toast'

// helper: pilih warna berdasarkan dark/light
const t = (isDark, dark, light) => isDark ? dark : light

/* ─────────────────────────────────────────────
   RARITY CONFIG
───────────────────────────────────────────── */
export const RARITY_CFG = {
  legendary: {
    label: 'Legendary', short: 'LEG', stars: 5,
    text: 'text-amber-400', particle: '#f59e0b',
    glow: 'rgba(245,158,11,0.8)', glow2: 'rgba(251,191,36,0.4)',
    grad: 'linear-gradient(135deg,#92400e,#f59e0b,#fde68a,#f97316)',
    gradBtn: 'linear-gradient(135deg,#f59e0b,#fbbf24,#f97316)',
    cardBg: 'linear-gradient(160deg,#1c0900,#2d1200,#1c0900)',
    beam: 'rgba(251,191,36,0.25)',
    frameGrad: ['#f59e0b','#fde68a','#f97316','#fbbf24'],
    ribbonColor: '#fde68a', boxColor: '#78350f',
  },
  epic: {
    label: 'Epic', short: 'EPIC', stars: 4,
    text: 'text-fuchsia-300', particle: '#d946ef',
    glow: 'rgba(217,70,239,0.8)', glow2: 'rgba(192,38,211,0.4)',
    grad: 'linear-gradient(135deg,#4a044e,#a21caf,#d946ef,#7c3aed)',
    gradBtn: 'linear-gradient(135deg,#a21caf,#d946ef,#7c3aed)',
    cardBg: 'linear-gradient(160deg,#1a0020,#2d0045,#1a0020)',
    beam: 'rgba(217,70,239,0.25)',
    frameGrad: ['#a21caf','#d946ef','#7c3aed','#c026d3'],
    ribbonColor: '#f0abfc', boxColor: '#701a75',
  },
  rare: {
    label: 'Rare', short: 'RARE', stars: 3,
    text: 'text-sky-300', particle: '#38bdf8',
    glow: 'rgba(56,189,248,0.8)', glow2: 'rgba(14,165,233,0.4)',
    grad: 'linear-gradient(135deg,#0c2a4a,#0369a1,#38bdf8,#06b6d4)',
    gradBtn: 'linear-gradient(135deg,#0369a1,#38bdf8,#06b6d4)',
    cardBg: 'linear-gradient(160deg,#00101a,#001e35,#00101a)',
    beam: 'rgba(56,189,248,0.25)',
    frameGrad: ['#0369a1','#38bdf8','#06b6d4','#0ea5e9'],
    ribbonColor: '#bae6fd', boxColor: '#0e3a6e',
  },
  uncommon: {
    label: 'Uncommon', short: 'UNC', stars: 2,
    text: 'text-emerald-300', particle: '#34d399',
    glow: 'rgba(52,211,153,0.7)', glow2: 'rgba(16,185,129,0.35)',
    grad: 'linear-gradient(135deg,#052e16,#065f46,#34d399,#0d9488)',
    gradBtn: 'linear-gradient(135deg,#065f46,#34d399,#0d9488)',
    cardBg: 'linear-gradient(160deg,#001a0e,#002d1a,#001a0e)',
    beam: 'rgba(52,211,153,0.2)',
    frameGrad: ['#065f46','#34d399','#0d9488','#10b981'],
    ribbonColor: '#a7f3d0', boxColor: '#064e3b',
  },
  common: {
    label: 'Common', short: 'COM', stars: 1,
    text: 'text-slate-300', particle: '#94a3b8',
    glow: 'rgba(148,163,184,0.6)', glow2: 'rgba(100,116,139,0.3)',
    grad: 'linear-gradient(135deg,#1e293b,#475569,#94a3b8,#64748b)',
    gradBtn: 'linear-gradient(135deg,#475569,#94a3b8,#64748b)',
    cardBg: 'linear-gradient(160deg,#0a0f1a,#111827,#0a0f1a)',
    beam: 'rgba(148,163,184,0.15)',
    frameGrad: ['#475569','#94a3b8','#64748b','#cbd5e1'],
    ribbonColor: '#e2e8f0', boxColor: '#334155',
  },
}

/* ─────────────────────────────────────────────
   BADGE POOL
───────────────────────────────────────────── */
export const BADGE_POOL = [
  { id: 'mahkota',      name: 'Mahkota Raja',  emoji: '👑', rarity: 'legendary' },
  { id: 'bintang_emas', name: 'Bintang Emas',  emoji: '⭐', rarity: 'legendary' },
  { id: 'berlian',      name: 'Berlian',        emoji: '💎', rarity: 'epic'      },
  { id: 'petir',        name: 'Petir',          emoji: '⚡', rarity: 'epic'      },
  { id: 'api',          name: 'Api Abadi',      emoji: '🔥', rarity: 'rare'      },
  { id: 'pelangi',      name: 'Pelangi',        emoji: '🌈', rarity: 'rare'      },
  { id: 'roket',        name: 'Roket',          emoji: '🚀', rarity: 'uncommon'  },
  { id: 'daun',         name: 'Semanggi',       emoji: '🍀', rarity: 'uncommon'  },
  { id: 'buku',         name: 'Buku Pintar',    emoji: '📚', rarity: 'common'    },
  { id: 'pensil',       name: 'Pensil Ajaib',   emoji: '✏️', rarity: 'common'    },
]

/* ─────────────────────────────────────────────
   CANVAS CONFETTI
───────────────────────────────────────────── */
function Confetti({ color, run }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!run) return
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    c.width = 480; c.height = 480
    const pts = Array.from({ length: 90 }, () => ({
      x: 240, y: 240,
      vx: (Math.random() - 0.5) * 24,
      vy: (Math.random() - 0.5) * 24 - 6,
      r: Math.random() * 7 + 2,
      a: 1, rot: Math.random() * 6.28,
      rv: (Math.random() - 0.5) * 0.25,
      col: Math.random() > 0.45 ? color : '#fff',
      shape: ['circle','rect','tri'][Math.floor(Math.random() * 3)],
    }))
    let raf
    const tick = () => {
      ctx.clearRect(0, 0, 480, 480)
      let alive = false
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.38
        p.a -= 0.015; p.rot += p.rv
        if (p.a <= 0) return; alive = true
        ctx.save(); ctx.globalAlpha = p.a; ctx.fillStyle = p.col
        ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.beginPath()
        if (p.shape === 'circle') { ctx.arc(0, 0, p.r, 0, 6.28) }
        else if (p.shape === 'rect') { ctx.rect(-p.r, -p.r * 0.5, p.r * 2, p.r) }
        else { ctx.moveTo(0, -p.r); ctx.lineTo(p.r, p.r); ctx.lineTo(-p.r, p.r) }
        ctx.closePath(); ctx.fill(); ctx.restore()
      })
      if (alive) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, color])
  return <canvas ref={ref} className="absolute pointer-events-none"
    style={{ width: 480, height: 480, left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 2 }} />
}

/* ─────────────────────────────────────────────
   BADGE OVERLAY — gradient ring solid + glow
   Tidak pakai SVG muter, pakai pseudo-border
───────────────────────────────────────────── */
export function BadgeOverlay({ badgeId, badges = [], size = 'md' }) {
  const badge = badges.find(b => b.id === badgeId) || BADGE_POOL.find(b => b.id === badgeId)
  if (!badge) return null
  const cfg = RARITY_CFG[badge.rarity] || RARITY_CFG.common

  const pad   = { sm: 3, md: 4, lg: 5 }[size] ?? 4
  const eSize = { sm: 'w-5 h-5 text-xs', md: 'w-7 h-7 text-sm', lg: 'w-9 h-9 text-base' }[size]
  const ePos  = { sm: '-bottom-1 -right-1', md: '-bottom-1.5 -right-1.5', lg: '-bottom-2 -right-2' }[size]

  return (
    <>
      {/* Gradient border ring — solid, no rotation */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none z-10"
        style={{
          padding: pad,
          background: `linear-gradient(135deg,${cfg.frameGrad.join(',')})`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          borderRadius: 'inherit',
        }}
      />
      {/* Animated shimmer on the ring */}
      <motion.div className="absolute inset-0 rounded-2xl pointer-events-none z-10 overflow-hidden"
        style={{ borderRadius: 'inherit' }}>
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1.5 }}
          className="absolute inset-0 w-1/2 skew-x-12"
          style={{ background: `linear-gradient(90deg,transparent,${cfg.glow2},transparent)` }}
        />
      </motion.div>
      {/* Outer glow */}
      <div className="absolute pointer-events-none z-10"
        style={{ inset: -pad - 2, borderRadius: 'inherit', boxShadow: `0 0 18px 4px ${cfg.glow2}` }} />
      {/* Corner ornaments */}
      {[
        { top: -2, left: -2 }, { top: -2, right: -2 },
        { bottom: -2, left: -2 }, { bottom: -2, right: -2 },
      ].map((pos, i) => (
        <motion.div key={i}
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
          className="absolute w-2 h-2 rounded-full pointer-events-none z-20"
          style={{ ...pos, background: cfg.particle, boxShadow: `0 0 6px ${cfg.glow}` }}
        />
      ))}
      {/* Badge emoji */}
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 14 }}
        className={`absolute ${ePos} ${eSize} rounded-full flex items-center justify-center z-30
          border-2 border-white dark:border-slate-900 shadow-xl`}
        style={{ background: cfg.gradBtn, boxShadow: `0 2px 14px ${cfg.glow}` }}
        title={`${badge.name} · ${cfg.label}`}
      >
        <span className="leading-none select-none">{badge.emoji}</span>
      </motion.div>
    </>
  )
}

/* ─────────────────────────────────────────────
   GIFT BOX — 3D dengan depth, ribbon nyata,
   sparkle terbang keluar, lid flip on open
───────────────────────────────────────────── */
function GiftBox({ canRoll, rolling, onClick, isDark }) {
  return (
    <div className="flex flex-col items-center gap-4 select-none w-full">
      <div className="relative flex justify-center items-end" style={{ height: 180 }}>

        {/* Ground glow */}
        <motion.div
          animate={canRoll ? { scaleX: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] } : {}}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-4 rounded-full blur-2xl pointer-events-none"
          style={{ background: canRoll ? 'rgba(124,58,237,0.6)' : 'rgba(71,85,105,0.3)' }}
        />

        {/* Orbiting sparkles */}
        {canRoll && !rolling && [0,1,2,3,4,5].map(i => {
          const angle = (i / 6) * 360
          const r = 72
          const x = Math.cos((angle * Math.PI) / 180) * r
          const y = Math.sin((angle * Math.PI) / 180) * r * 0.45
          return (
            <motion.div key={i}
              className="absolute text-violet-300 pointer-events-none font-bold"
              style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, fontSize: i % 2 === 0 ? 10 : 7 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5], y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 + i * 0.25, delay: i * 0.28 }}
            >✦</motion.div>
          )
        })}

        {/* Box wrapper — idle float */}
        <motion.button
          onClick={onClick}
          disabled={!canRoll || rolling}
          className="relative focus:outline-none"
          style={{ cursor: canRoll && !rolling ? 'pointer' : 'not-allowed' }}
          animate={canRoll && !rolling
            ? { y: [0, -10, 0], rotate: [0, -1, 1, -1, 0] }
            : { y: 0, rotate: 0 }}
          transition={canRoll && !rolling
            ? { y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut' },
                rotate: { repeat: Infinity, duration: 2.6, ease: 'easeInOut' } }
            : { duration: 0.2 }}
          whileTap={canRoll && !rolling ? { scale: 0.88, rotate: -3 } : {}}
        >
          <div className="relative" style={{ width: 140, height: 150 }}>

            {/* ── BOX BODY ── */}
            <div className="absolute left-0 right-0 bottom-0 rounded-2xl overflow-hidden"
              style={{
                height: 100,
                background: canRoll
                  ? t(isDark,'linear-gradient(160deg,#3b0764 0%,#5b21b6 45%,#4c1d95 100%)','linear-gradient(160deg,#ede9fe 0%,#ddd6fe 45%,#c4b5fd 100%)')
                  : t(isDark,'linear-gradient(160deg,#1e293b 0%,#334155 45%,#1e293b 100%)','linear-gradient(160deg,#e2e8f0 0%,#cbd5e1 45%,#e2e8f0 100%)'),
                boxShadow: canRoll
                  ? t(isDark,'0 16px 48px rgba(109,40,217,0.55), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.35)','0 16px 48px rgba(109,40,217,0.25), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -2px 0 rgba(0,0,0,0.1)')
                  : t(isDark,'0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)','0 8px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'),
              }}>
              {/* Ribbon vertical */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2"
                style={{ width: 28, background: canRoll ? t(isDark,'rgba(196,181,253,0.22)','rgba(139,92,246,0.2)') : t(isDark,'rgba(148,163,184,0.12)','rgba(148,163,184,0.25)') }} />
              {/* Shine sweep */}
              {canRoll && (
                <motion.div
                  animate={{ x: ['-140%', '240%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatDelay: 2.5 }}
                  className="absolute inset-0 w-2/5 skew-x-12 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent)' }}
                />
              )}
              {/* Tiny stars on body */}
              {canRoll && (
                <>
                  <motion.span className={`absolute top-2 left-3 text-[9px] ${t(isDark,'text-violet-300/50','text-violet-500/40')}`}
                    animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ repeat: Infinity, duration: 1.7 }}>✦</motion.span>
                  <motion.span className={`absolute bottom-3 right-4 text-[9px] ${t(isDark,'text-violet-300/40','text-violet-500/30')}`}
                    animate={{ opacity: [0.1, 0.6, 0.1] }} transition={{ repeat: Infinity, duration: 2.2, delay: 0.9 }}>✦</motion.span>
                  <motion.span className={`absolute top-4 right-3 text-[8px] ${t(isDark,'text-indigo-300/30','text-indigo-500/25')}`}
                    animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ repeat: Infinity, duration: 1.9, delay: 0.4 }}>★</motion.span>
                </>
              )}
              {/* Side depth shadow */}
              <div className="absolute right-0 top-0 bottom-0 w-4 rounded-r-2xl"
                style={{ background: t(isDark,'rgba(0,0,0,0.2)','rgba(0,0,0,0.08)') }} />
            </div>

            {/* ── BOX LID ── */}
            <motion.div
              animate={rolling
                ? { rotateX: -130, y: -30, opacity: 0, scale: 0.8 }
                : { rotateX: 0, y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d',
                position: 'absolute', top: 44, left: -6, right: -6, height: 36 }}
            >
              <div className="w-full h-full rounded-xl overflow-hidden"
                style={{
                  background: canRoll
                    ? t(isDark,'linear-gradient(160deg,#6d28d9 0%,#7c3aed 50%,#5b21b6 100%)','linear-gradient(160deg,#c4b5fd 0%,#a78bfa 50%,#8b5cf6 100%)')
                    : t(isDark,'linear-gradient(160deg,#334155 0%,#475569 50%,#334155 100%)','linear-gradient(160deg,#cbd5e1 0%,#94a3b8 50%,#cbd5e1 100%)'),
                  boxShadow: canRoll
                    ? t(isDark,'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.4)','inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 12px rgba(109,40,217,0.2)')
                    : t(isDark,'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)','inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.08)'),
                }}>
                {/* Ribbon on lid */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2"
                  style={{ width: 28, background: canRoll ? t(isDark,'rgba(196,181,253,0.22)','rgba(139,92,246,0.2)') : t(isDark,'rgba(148,163,184,0.12)','rgba(148,163,184,0.25)') }} />
                {/* Side depth */}
                <div className="absolute right-0 top-0 bottom-0 w-3 rounded-r-xl"
                  style={{ background: t(isDark,'rgba(0,0,0,0.18)','rgba(0,0,0,0.07)') }} />
              </div>

              {/* ── BOW ── */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-0.5 z-10">
                {/* Left petal */}
                <div className="w-7 h-7 rounded-full -rotate-[20deg]"
                  style={{
                    border: `3px solid ${canRoll ? t(isDark,'#c4b5fd','#7c3aed') : t(isDark,'#94a3b8','#94a3b8')}`,
                    background: canRoll ? t(isDark,'rgba(124,58,237,0.4)','rgba(139,92,246,0.2)') : t(isDark,'rgba(100,116,139,0.25)','rgba(148,163,184,0.2)'),
                    boxShadow: canRoll ? t(isDark,'0 0 8px rgba(196,181,253,0.4)','0 0 8px rgba(124,58,237,0.3)') : 'none',
                  }} />
                {/* Center knot */}
                <div className="w-3.5 h-3.5 rounded-full z-10 -mx-1"
                  style={{
                    background: canRoll ? t(isDark,'#7c3aed','#6d28d9') : t(isDark,'#475569','#94a3b8'),
                    border: `2px solid ${canRoll ? t(isDark,'#c4b5fd','#a78bfa') : t(isDark,'#94a3b8','#cbd5e1')}`,
                    boxShadow: canRoll ? t(isDark,'0 0 10px rgba(124,58,237,0.7)','0 0 10px rgba(109,40,217,0.4)') : 'none',
                  }} />
                {/* Right petal */}
                <div className="w-7 h-7 rounded-full rotate-[20deg]"
                  style={{
                    border: `3px solid ${canRoll ? t(isDark,'#c4b5fd','#7c3aed') : t(isDark,'#94a3b8','#94a3b8')}`,
                    background: canRoll ? t(isDark,'rgba(124,58,237,0.4)','rgba(139,92,246,0.2)') : t(isDark,'rgba(100,116,139,0.25)','rgba(148,163,184,0.2)'),
                    boxShadow: canRoll ? t(isDark,'0 0 8px rgba(196,181,253,0.4)','0 0 8px rgba(124,58,237,0.3)') : 'none',
                  }} />
              </div>
            </motion.div>

            {/* Rolling spinner */}
            {rolling && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.4, 1] }}
                  transition={{ rotate: { repeat: Infinity, duration: 0.45, ease: 'linear' }, scale: { repeat: Infinity, duration: 0.9 } }}
                  className="text-4xl text-violet-300">✦</motion.div>
              </div>
            )}

            {/* Locked overlay */}
            {!canRoll && !rolling && (
              <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-1.5"
                style={{ background: t(isDark,'rgba(0,0,0,0.55)','rgba(255,255,255,0.6)') }}>
                <Lock size={22} className={t(isDark,'text-slate-400','text-slate-400')} />
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide">Besok lagi</span>
              </div>
            )}
          </div>
        </motion.button>
      </div>

      {/* CTA */}
      {canRoll ? (
        <motion.div
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="flex items-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-300"
        >
          <Zap size={14} fill="currentColor" /> Ketuk kotak untuk membuka!
        </motion.div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Sudah dibuka hari ini</p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   REVEAL MODAL — 3 fase sinematik
   box → ? → badge muncul dari bawah + beam
───────────────────────────────────────────── */
function RevealModal({ badge, onClose, onEquip }) {
  const cfg = RARITY_CFG[badge?.rarity] || RARITY_CFG.common
  const [phase, setPhase] = useState('box')   // box → question → reveal
  const [burst, setBurst] = useState(false)
  const [equipped, setEquipped] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('question'), 750)
    const t2 = setTimeout(() => { setPhase('reveal'); setBurst(true) }, 1700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleEquip = async () => {
    try {
      await siswaApi.equipBadge(badge.id)
      setEquipped(true); onEquip(badge.id)
    } catch { toast.error('Gagal memasang badge') }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(2,2,10,0.96)', backdropFilter: 'blur(20px)' }}
    >
      {/* Ambient bloom */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 6, opacity: phase === 'reveal' ? 0.08 : 0.03 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute w-40 h-40 rounded-full pointer-events-none"
        style={{ background: cfg.particle }}
      />

      {/* Light beam — only on reveal */}
      <AnimatePresence>
        {phase === 'reveal' && (
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              width: 200, height: '55%',
              transformOrigin: 'top center',
              background: `linear-gradient(to bottom, ${cfg.beam} 0%, transparent 100%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <Confetti color={cfg.particle} run={burst} />
      </div>

      {/* ── CARD ── */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 120 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -30 }}
        transition={{ type: 'spring', stiffness: 140, damping: 17, delay: 0.06 }}
        className="relative w-full max-w-xs mx-auto overflow-hidden rounded-3xl"
        onClick={e => e.stopPropagation()}
        style={{
          background: cfg.cardBg,
          boxShadow: `0 0 0 1.5px ${cfg.particle}55, 0 0 80px ${cfg.glow2}, 0 32px 80px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Rarity banner */}
        <div className="relative overflow-hidden py-4 text-center"
          style={{ background: cfg.grad }}>
          {/* Shine */}
          <motion.div
            animate={{ x: ['-100%', '220%'] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'linear', repeatDelay: 1 }}
            className="absolute inset-0 w-1/2 skew-x-12 pointer-events-none"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)' }}
          />
          {/* Stars */}
          <div className="flex items-center justify-center gap-1 mb-1">
            {Array.from({ length: cfg.stars }).map((_, i) => (
              <motion.span key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.08 * i, type: 'spring', stiffness: 350 }}
                className="text-white text-sm drop-shadow">★</motion.span>
            ))}
          </div>
          <p className="text-[11px] font-black tracking-[0.35em] text-white/90 uppercase">{cfg.label}</p>
        </div>

        {/* Emoji stage */}
        <div className="relative flex items-center justify-center" style={{ height: 210 }}>
          {/* Rotating conic halo */}
          <motion.div animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="absolute w-48 h-48 rounded-full pointer-events-none"
            style={{ background: `conic-gradient(${cfg.particle}33, transparent 55%, ${cfg.particle}33)` }}
          />
          {/* Pulse glow */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="absolute w-40 h-40 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)` }}
          />

          {/* Phase: box */}
          {phase === 'box' && (
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.95, 1.05, 1], rotate: [0, -5, 5, -3, 0] }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="relative z-10 text-8xl select-none"
              style={{ filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.6))' }}
            >🎁</motion.div>
          )}

          {/* Phase: question */}
          {phase === 'question' && (
            <motion.div
              initial={{ scale: 0, y: 30 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
              className="relative z-10 text-9xl select-none"
              style={{ filter: 'drop-shadow(0 0 24px rgba(255,255,255,0.4))' }}
            >❓</motion.div>
          )}

          {/* Phase: reveal — badge rises from bottom */}
          {phase === 'reveal' && (
            <motion.div
              initial={{ scale: 0.2, y: 80, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 13 }}
              className="relative z-10 select-none"
              style={{
                fontSize: 100,
                filter: `drop-shadow(0 0 40px ${cfg.particle}) drop-shadow(0 0 20px ${cfg.particle})`,
              }}
            >{badge.emoji}</motion.div>
          )}
        </div>

        {/* Info */}
        <AnimatePresence>
          {phase === 'reveal' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-6 pb-2 text-center"
            >
              <p className="text-[22px] font-black text-white tracking-tight leading-tight">{badge.name}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black text-white"
                  style={{ background: cfg.gradBtn, boxShadow: `0 2px 16px ${cfg.glow2}` }}>
                  <Star size={10} fill="white" /> {cfg.label}
                </span>
              </div>
              <p className="text-[11px] mt-2.5 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Ditambahkan ke koleksi badge kamu
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NEW pill */}
        <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: 'spring', stiffness: 320 }}
          className="absolute top-14 right-3 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest text-white"
          style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 2px 10px rgba(239,68,68,0.5)' }}
        >NEW</motion.div>

        {/* Actions */}
        <AnimatePresence>
          {phase === 'reveal' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="px-5 py-5"
            >
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl text-sm font-black text-white transition-all"
                style={{ background: cfg.gradBtn, boxShadow: `0 6px 28px ${cfg.glow2}` }}
              >
                Lihat Hadiah ✨
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   EQUIP DIALOG — muncul setelah reveal ditutup
   tanpa pasang badge, nampilin hadiah + konfirmasi
───────────────────────────────────────────── */
function EquipDialog({ badge, onEquip, onSkip, isDark }) {
  const cfg = RARITY_CFG[badge?.rarity] || RARITY_CFG.common
  const [loading, setLoading] = useState(false)

  const handleEquip = async () => {
    setLoading(true)
    try {
      await siswaApi.equipBadge(badge.id)
      onEquip(badge.id)
      toast.success(`${badge.emoji} ${badge.name} terpasang di profil!`)
    } catch { toast.error('Gagal memasang badge') }
    finally { setLoading(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
      onClick={onSkip}
    >
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{
          background: t(isDark,
            'linear-gradient(160deg,#0f0a1e,#1a1035)',
            'linear-gradient(160deg,#ffffff,#f5f3ff)'
          ),
          boxShadow: `0 0 0 1px ${cfg.particle}44, 0 24px 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Top gradient strip */}
        <div className="h-1 w-full" style={{ background: cfg.gradBtn }} />

        {/* Content */}
        <div className="p-6">
          {/* Badge showcase */}
          <div className="flex items-center gap-4 mb-5">
            {/* Emoji dengan glow */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                style={{
                  background: cfg.gradBtn,
                  boxShadow: `0 8px 24px ${cfg.glow2}`,
                }}>
                {badge.emoji}
              </div>
              {/* Pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ border: `2px solid ${cfg.particle}` }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full text-white"
                  style={{ background: cfg.gradBtn }}>
                  {cfg.label}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: t(isDark,'rgba(239,68,68,0.2)','rgba(239,68,68,0.1)'),
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.3)',
                  }}>NEW</span>
              </div>
              <p className={`text-lg font-black leading-tight ${t(isDark,'text-white','text-slate-800')}`}>
                {badge.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: t(isDark,'rgba(255,255,255,0.35)','rgba(0,0,0,0.4)') }}>
                {Array.from({ length: cfg.stars }).map(() => '★').join('')}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mb-4" style={{ background: t(isDark,'rgba(255,255,255,0.06)','rgba(0,0,0,0.06)') }} />

          {/* Question */}
          <p className={`text-sm font-semibold mb-4 text-center ${t(isDark,'text-white/60','text-slate-500')}`}>
            Pasang badge ini ke foto profilmu?
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleEquip}
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-60"
              style={{
                background: cfg.gradBtn,
                boxShadow: `0 4px 20px ${cfg.glow2}`,
              }}
            >
              {loading ? '...' : `Pasang ${badge.emoji}`}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onSkip}
              className="px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all"
              style={{
                background: t(isDark,'rgba(255,255,255,0.06)','rgba(0,0,0,0.05)'),
                color: t(isDark,'rgba(255,255,255,0.4)','rgba(0,0,0,0.4)'),
                border: `1px solid ${t(isDark,'rgba(255,255,255,0.1)','rgba(0,0,0,0.08)')}`,
              }}
            >
              Lewati
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   GACHA HARIAN — main card
───────────────────────────────────────────── */
export default function GachaHarian({ onBadgeChange }) {
  const [status, setStatus]   = useState(null)
  const [rolling, setRolling] = useState(false)
  const [result, setResult]   = useState(null)
  const [equipDialog, setEquipDialog] = useState(null) // badge yang perlu dikonfirmasi
  const [loading, setLoading] = useState(true)
  const { isDark } = useThemeStore()

  useEffect(() => { fetchStatus() }, [])

  const fetchStatus = async () => {
    try {
      const res = await siswaApi.getGachaStatus()
      setStatus(res.data)
      onBadgeChange?.(res.data.active_badge ?? null, res.data.badges ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const handleRoll = async () => {
    if (rolling || !status?.can_roll) return
    setRolling(true)
    try {
      const res = await siswaApi.rollGacha()
      setStatus(prev => ({
        ...prev, can_roll: false,
        badges: res.data.badges ?? prev?.badges ?? [],
        active_badge: res.data.active_badge ?? prev?.active_badge ?? null,
      }))
      onBadgeChange?.(res.data.active_badge ?? null, res.data.badges ?? [])
      setResult(res.data.badge)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal membuka kotak')
    } finally { setRolling(false) }
  }

  const handleEquipFromModal = (badgeId) => {
    setStatus(prev => ({ ...prev, active_badge: badgeId }))
    onBadgeChange?.(badgeId, status?.badges ?? [])
  }

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

  const canRoll  = !!status?.can_roll
  const badges   = status?.badges ?? []
  const activeId = status?.active_badge ?? null

  let nextLabel = 'besok'
  if (!canRoll && status?.next_roll_at) {
    try { nextLabel = new Date(status.next_roll_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
    catch { /**/ }
  }

  return (
    <>
      {/* ══ CARD ══ */}
      <div className="relative overflow-hidden rounded-2xl"
        style={{
          background: canRoll
            ? t(isDark,'linear-gradient(160deg,#0d0820 0%,#160d35 50%,#0d0820 100%)','linear-gradient(160deg,#f5f3ff 0%,#ede9fe 50%,#f5f3ff 100%)')
            : t(isDark,'linear-gradient(160deg,#0c1018 0%,#141c28 50%,#0c1018 100%)','linear-gradient(160deg,#f8fafc 0%,#f1f5f9 50%,#f8fafc 100%)'),
          boxShadow: canRoll
            ? t(isDark,'0 0 0 1px rgba(124,58,237,0.25), 0 20px 60px rgba(109,40,217,0.2)','0 0 0 1px rgba(139,92,246,0.2), 0 20px 60px rgba(109,40,217,0.1)')
            : t(isDark,'0 0 0 1px rgba(71,85,105,0.2), 0 8px 32px rgba(0,0,0,0.3)','0 0 0 1px rgba(203,213,225,0.8), 0 8px 32px rgba(0,0,0,0.06)'),
        }}
      >
        {/* Animated top glow line */}
        <motion.div
          animate={canRoll ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.2 }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute top-0 inset-x-0 h-px pointer-events-none"
          style={{ background: canRoll
            ? 'linear-gradient(90deg,transparent,rgba(139,92,246,0.9),transparent)'
            : 'linear-gradient(90deg,transparent,rgba(71,85,105,0.5),transparent)' }}
        />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: canRoll ? t(isDark,'rgba(124,58,237,0.2)','rgba(124,58,237,0.1)') : t(isDark,'rgba(71,85,105,0.15)','rgba(203,213,225,0.5)'),
                border: `1px solid ${canRoll ? t(isDark,'rgba(139,92,246,0.4)','rgba(139,92,246,0.3)') : t(isDark,'rgba(71,85,105,0.25)','rgba(203,213,225,0.8)')}`,
              }}>
              <span className="text-lg">{canRoll ? '🎁' : '🔒'}</span>
            </div>
            {canRoll && (
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 1.1 }}
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500"
                style={{ border: `2px solid ${t(isDark,'#0d0820','#f5f3ff')}` }}
              />
            )}
          </div>
          <div>
            <p className={`text-sm font-black ${t(isDark,'text-white','text-slate-800')}`}>Gacha Harian</p>
            <p className="text-[10px] font-medium"
              style={{ color: canRoll ? t(isDark,'rgba(167,139,250,0.85)','rgba(109,40,217,0.8)') : t(isDark,'rgba(100,116,139,0.7)','rgba(100,116,139,0.8)') }}>
              {canRoll ? '✨ Hadiahmu menunggu hari ini!' : `Tersedia lagi pukul ${nextLabel}`}
            </p>
          </div>
          <div className="ml-auto px-2.5 py-1 rounded-full"
            style={{ background: t(isDark,'rgba(255,255,255,0.04)','rgba(0,0,0,0.04)'), border: `1px solid ${t(isDark,'rgba(255,255,255,0.07)','rgba(0,0,0,0.08)')}` }}>
            <span className="text-[10px] font-bold" style={{ color: t(isDark,'rgba(255,255,255,0.25)','rgba(0,0,0,0.3)') }}>1× / hari</span>
          </div>
        </div>

        {/* Gift box */}
        <div className="flex justify-center px-5 py-4">
          <GiftBox canRoll={canRoll} rolling={rolling} onClick={handleRoll} isDark={isDark} />
        </div>

        {/* Badge collection */}
        {badges.length > 0 && (
          <div className="px-5 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1" style={{ background: t(isDark,'rgba(255,255,255,0.05)','rgba(0,0,0,0.06)') }} />
              <span className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: t(isDark,'rgba(255,255,255,0.18)','rgba(0,0,0,0.3)') }}>Koleksi Badge</span>
              <div className="h-px flex-1" style={{ background: t(isDark,'rgba(255,255,255,0.05)','rgba(0,0,0,0.06)') }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => {
                const cfg = RARITY_CFG[badge.rarity] || RARITY_CFG.common
                const isActive = activeId === badge.id
                return (
                  <motion.button key={badge.id} whileTap={{ scale: 0.88 }}
                    onClick={() => handleToggleBadge(badge)}
                    title={`${badge.name} · ${cfg.label}${isActive ? ' (aktif)' : ''}`}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={isActive ? {
                      background: cfg.gradBtn,
                      border: `1px solid ${cfg.particle}`,
                      color: '#fff',
                      boxShadow: `0 0 18px ${cfg.glow2}`,
                    } : {
                      background: t(isDark,'rgba(255,255,255,0.04)','rgba(0,0,0,0.04)'),
                      border: `1px solid ${t(isDark,'rgba(255,255,255,0.09)','rgba(0,0,0,0.1)')}`,
                      color: t(isDark,'rgba(255,255,255,0.45)','rgba(0,0,0,0.5)'),
                    }}
                  >
                    <span className="text-base leading-none">{badge.emoji}</span>
                    <span className="hidden sm:inline">{badge.name}</span>
                    <span className={`text-[9px] font-black ${isActive ? 'text-white/75' : cfg.text}`}>{cfg.short}</span>
                    {isActive && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
                        style={{ border: `2px solid ${t(isDark,'#0d0820','#f5f3ff')}` }}>
                        <span className="text-[8px] text-white font-black">✓</span>
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* Bottom glow line */}
        <div className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.35),transparent)' }} />
      </div>

      {/* ══ REVEAL MODAL ══ */}
      <AnimatePresence>
        {result && (
          <RevealModal
            badge={result}
            onClose={() => {
              setEquipDialog(result)
              setResult(null)
            }}
            onEquip={(badgeId) => {
              handleEquipFromModal(badgeId)
              setResult(null)
              setEquipDialog(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* ══ EQUIP DIALOG ══ */}
      <AnimatePresence>
        {equipDialog && (
          <EquipDialog
            badge={equipDialog}
            isDark={isDark}
            onEquip={(badgeId) => {
              handleEquipFromModal(badgeId)
              setEquipDialog(null)
            }}
            onSkip={() => setEquipDialog(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
