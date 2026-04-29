import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Globe2, MapPin, Camera, Compass, Star } from 'lucide-react'

// ── Particle floating background ─────────────────────────────────────────────
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
    color: i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#06b6d4' : '#f59e0b',
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ── Foto card premium dengan tilt 3D ─────────────────────────────────────────
function FotoCard({ src, label, index, onClick }) {
  const ref  = useRef(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const springX = useSpring(rotX, { stiffness: 300, damping: 30 })
  const springY = useSpring(rotY, { stiffness: 300, damping: 30 })
  const glowX = useTransform(springY, [-15, 15], ['0%', '100%'])

  const onMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    rotX.set(-y * 14)
    rotY.set(x * 14)
  }
  const onLeave = () => { rotX.set(0); rotY.set(0) }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        width: 180,
        height: 120,
        borderRadius: 14,
      }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.06, zIndex: 20 }}
      className="flex-shrink-0 relative overflow-hidden group"
    >
      {/* Foto */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={e => { e.target.parentElement.style.display = 'none' }}
      />

      {/* Shimmer overlay on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top badge */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Camera size={7} className="text-emerald-400" />
          <span className="text-[7px] text-white/70 font-medium">Foto</span>
        </div>
      </div>

      {/* Label nama lokasi */}
      {label && (
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 px-2.5 pb-2.5">
          <div className="flex items-center gap-1">
            <MapPin size={8} className="text-emerald-400 flex-shrink-0" />
            <p className="text-white text-[9px] font-bold truncate leading-tight"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
              {label}
            </p>
          </div>
        </div>
      )}

      {/* Glow border on hover */}
      <div className="absolute inset-0 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(16,185,129,0.4), 0 0 20px rgba(16,185,129,0.15)' }} />
    </motion.button>
  )
}

// ── Infinite strip ────────────────────────────────────────────────────────────
function Strip({ fotos, direction = -1, onOpen, speed = 0.5 }) {
  const items    = fotos.length > 0 ? [...fotos, ...fotos, ...fotos, ...fotos] : []
  const trackRef = useRef(null)
  const animRef  = useRef(null)
  const posRef   = useRef(direction > 0 ? -(fotos.length * 188) : 0)
  const pauseRef = useRef(false)
  const CARD_W   = 180 + 10
  const TOTAL_W  = fotos.length * CARD_W

  useEffect(() => {
    if (!fotos.length) return
    const step = () => {
      if (!pauseRef.current && trackRef.current) {
        posRef.current += direction * speed
        if (direction < 0 && posRef.current <= -TOTAL_W) posRef.current = 0
        if (direction > 0 && posRef.current >= 0) posRef.current = -TOTAL_W
        trackRef.current.style.transform = `translateX(${posRef.current}px)`
      }
      animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRef.current)
  }, [fotos.length, TOTAL_W, direction, speed])

  const drag = useRef(null)
  const dn = (x) => { pauseRef.current = true; drag.current = { x, pos: posRef.current } }
  const mv = (x) => {
    if (!drag.current) return
    posRef.current = drag.current.pos + (x - drag.current.x)
    if (trackRef.current) trackRef.current.style.transform = `translateX(${posRef.current}px)`
  }
  const up = () => { drag.current = null; setTimeout(() => { pauseRef.current = false }, 800) }

  if (!fotos.length) return null

  return (
    <div
      className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ perspective: 1200 }}
      onMouseEnter={() => { pauseRef.current = true }}
      onMouseLeave={() => { drag.current = null; pauseRef.current = false }}
      onMouseDown={e => dn(e.clientX)}
      onMouseMove={e => mv(e.clientX)}
      onMouseUp={up}
      onTouchStart={e => dn(e.touches[0].clientX)}
      onTouchMove={e => mv(e.touches[0].clientX)}
      onTouchEnd={up}
    >
      <div ref={trackRef} className="flex gap-2.5 will-change-transform py-2" style={{ width: 'max-content' }}>
        {items.map((src, i) => (
          <FotoCard
            key={i}
            src={src}
            index={i % fotos.length}
            onClick={() => onOpen(i % fotos.length)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ title, color, icon: Icon }) {
  return (
    <div className="px-5 sm:px-6 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
          <Icon size={11} style={{ color }} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: `${color}99` }}>
          {title}
        </span>
      </div>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg,${color}33,transparent)` }} />
      <div className="flex gap-0.5">
        {[0,1,2].map(i => (
          <div key={i} className="w-1 h-1 rounded-full" style={{ background: `${color}${i === 0 ? 'cc' : i === 1 ? '66' : '33'}` }} />
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AlamIndonesia({ alamInfo, alamFotos = [], alamFotos2 = [], alamBg = null }) {
  const fotos1 = (alamFotos  || []).filter(Boolean)
  const fotos2 = (alamFotos2 || []).filter(Boolean)
  const info   = alamInfo || {}
  const judul1 = info.judul    || 'Alam Indonesia'
  const judul2 = info.judul_2  || 'Pesona Nusantara'
  const desk   = info.deskripsi || 'Jelajahi keindahan alam Indonesia'
  const hasBg  = !!alamBg
  const [lb, setLb] = useState(null)
  const open = useCallback((list, idx) => setLb({ list, idx }), [])

  const lbList = lb?.list || []
  const lbIdx  = lb?.idx  ?? 0

  if (!fotos1.length && !fotos2.length) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="relative overflow-hidden mx-auto w-full max-w-2xl"
        style={{ borderRadius: 20 }}
      >
        {/* ── Background ── */}
        {hasBg ? (
          <>
            <img src={alamBg} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(5,10,20,0.60) 0%,rgba(5,20,15,0.55) 100%)' }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(160deg,#0d1f35 0%,#0f2d1e 50%,#0a1a28 100%)'
          }} />
        )}

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundSize: '128px' }} />

        {/* Radial glows */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 20% 110%, rgba(16,185,129,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 110%, rgba(6,182,212,0.10) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 40% 30% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 50%)' }} />

        {/* Floating particles */}
        <FloatingParticles />

        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg,transparent 0%,#10b981 25%,#06b6d4 50%,#f59e0b 75%,transparent 100%)' }} />

        {/* Bottom accent line */}
        <div className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(16,185,129,0.3),transparent)' }} />

        <div className="relative z-10 pt-5 pb-6 space-y-5">

          {/* ── Header ── */}
          <div className="px-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">

              {/* Kiri */}
              <div className="flex-1 min-w-0">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2.5"
                  style={{
                    background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(6,182,212,0.1))',
                    border: '1px solid rgba(16,185,129,0.25)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Compass size={9} className="text-emerald-400" />
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-emerald-400/80">
                    Explore Indonesia
                  </span>
                  <div className="w-1 h-1 rounded-full bg-emerald-400/60 animate-pulse" />
                </motion.div>

                {/* Judul */}
                <motion.h3
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight"
                >
                  {desk}
                </motion.h3>

                {/* Sub info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-3 mt-2"
                >
                  <div className="flex items-center gap-1">
                    <Star size={9} className="text-amber-400" fill="currentColor" />
                    <span className="text-[9px] text-white/40 font-medium">Keajaiban Nusantara</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="flex items-center gap-1">
                    <Globe2 size={9} className="text-cyan-400" />
                    <span className="text-[9px] text-white/40 font-medium">17.000+ Pulau</span>
                  </div>
                </motion.div>
              </div>


            </div>
          </div>

          {/* ── Divider ── */}
          <div className="px-5 sm:px-6">
            <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)' }} />
          </div>

          {/* ── Strip 1 ── */}
          {fotos1.length > 0 && (
            <div className="space-y-3">
              <SectionLabel title={judul1} color="#10b981" icon={MapPin} />
              <Strip fotos={fotos1} direction={-1} onOpen={idx => open(fotos1, idx)} speed={0.5} />
            </div>
          )}

          {/* ── Strip 2 ── */}
          {fotos2.length > 0 && (
            <div className="space-y-3">
              <SectionLabel title={judul2} color="#06b6d4" icon={Globe2} />
              <Strip fotos={fotos2} direction={1} onOpen={idx => open(fotos2, idx)} speed={0.42} />
            </div>
          )}

          {/* ── Footer hint ── */}
          <div className="px-5 sm:px-6">
            <div className="flex items-center justify-center gap-2 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-0.5 rounded-full bg-white/10" />
              </div>
              <span className="text-[8px] text-white/20 font-medium tracking-widest uppercase">
                Geser untuk menjelajahi · Klik untuk memperbesar
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-0.5 rounded-full bg-white/10" />
                <div className="w-3 h-0.5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* ── Lightbox premium ── */}
      <AnimatePresence>
        {lb && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[99990] flex items-center justify-center p-4 sm:p-8"
            style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(24px)', touchAction: 'none' }}
            onClick={() => setLb(null)}
          >
            {/* Ambient glow behind image */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              onClick={() => setLb(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all hover:scale-110 z-10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
            >
              <X size={15} />
            </motion.button>

            {/* Counter pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full z-10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/60 text-[10px] font-semibold tabular-nums">
                {lbIdx + 1} / {lbList.length}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </motion.div>

            {/* Foto */}
            <motion.div
              key={lbIdx}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -16 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="max-w-4xl w-full relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Glow behind image */}
              <div className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }} />

              <img
                src={lbList[lbIdx]}
                alt=""
                className="w-full object-contain rounded-2xl max-h-[72vh] relative"
                style={{ boxShadow: '0 0 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)' }}
              />
            </motion.div>

            {/* Nav buttons */}
            {lbList.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={e => { e.stopPropagation(); setLb(p => ({ ...p, idx: (p.idx - 1 + lbList.length) % lbList.length })) }}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all hover:scale-110 group"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                >
                  <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={e => { e.stopPropagation(); setLb(p => ({ ...p, idx: (p.idx + 1) % lbList.length })) }}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all hover:scale-110 group"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                >
                  <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </>
            )}

            {/* Progress dots */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
            >
              {lbList.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setLb(p => ({ ...p, idx: i })) }}
                  className="rounded-full transition-all duration-300 hover:scale-125"
                  style={{
                    width: i === lbIdx ? 24 : 5,
                    height: 5,
                    background: i === lbIdx
                      ? 'linear-gradient(90deg,#10b981,#06b6d4)'
                      : 'rgba(255,255,255,0.18)',
                    boxShadow: i === lbIdx ? '0 0 8px rgba(16,185,129,0.5)' : 'none',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
