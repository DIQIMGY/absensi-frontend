import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Globe2 } from 'lucide-react'

// ── Foto card dengan tilt 3D ──────────────────────────────────────────────────
function FotoCard({ src, label, onClick }) {
  const ref  = useRef(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const shadowX = useTransform(rotY, [-15, 15], ['-8px', '8px'])
  const shadowY = useTransform(rotX, [-15, 15], ['8px', '-8px'])

  const onMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    rotX.set(-y * 12)
    rotY.set(x * 12)
  }
  const onLeave = () => { rotX.set(0); rotY.set(0) }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', perspective: 800, width: 160, height: 100, borderRadius: 10 }}
      whileHover={{ scale: 1.04, zIndex: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex-shrink-0 relative overflow-hidden group"
    >
      <img src={src} alt="" draggable={false}
        className="w-full h-full object-cover"
        onError={e => { e.target.parentElement.style.display = 'none' }}/>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

      {/* Label nama lokasi — slide up saat hover */}
      {label && (
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 px-2 pb-2">
          <p className="text-white text-[9px] font-bold truncate leading-tight"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {label}
          </p>
        </div>
      )}

      {/* Corner accent */}
      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"/>
    </motion.button>
  )
}

// ── Infinite strip ────────────────────────────────────────────────────────────
function Strip({ fotos, direction = -1, onOpen, speed = 0.45 }) {
  const items    = fotos.length > 0 ? [...fotos, ...fotos, ...fotos, ...fotos] : []
  const trackRef = useRef(null)
  const animRef  = useRef(null)
  const posRef   = useRef(direction > 0 ? -(fotos.length * 168) : 0)
  const pauseRef = useRef(false)
  const CARD_W   = 160 + 8
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
    <div className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ perspective: 1000 }}
      onMouseDown={e => dn(e.clientX)} onMouseMove={e => mv(e.clientX)} onMouseUp={up} onMouseLeave={up}
      onTouchStart={e => dn(e.touches[0].clientX)} onTouchMove={e => mv(e.touches[0].clientX)} onTouchEnd={up}>
      <div ref={trackRef} className="flex gap-2 will-change-transform" style={{ width: 'max-content' }}>
        {items.map((src, i) => (
          <FotoCard key={i} src={src} onClick={() => onOpen(i % fotos.length)}/>
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 22 }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* ── Background ── */}
        {hasBg ? (
          <>
            <img src={alamBg} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none"/>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }}/>
          </>
        ) : (
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(160deg,#0c1a2e 0%,#0d2137 45%,#071a10 100%)'
          }}/>
        )}

        {/* Radial glow di tengah */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(16,185,129,0.08) 0%, transparent 70%)' }}/>

        {/* Accent top */}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,#10b981 30%,#06b6d4 70%,transparent)' }}/>

        <div className="relative z-10 pt-4 pb-5 space-y-4">

          {/* ── Header editorial ── */}
          <div className="px-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              {/* Kiri: judul besar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
                    <Globe2 size={11} className="text-white"/>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-emerald-400/70">
                    Explore Indonesia
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-none tracking-tight">
                  {desk}
                </h3>
              </div>

              {/* Kanan: counter visual */}
              <div className="flex-shrink-0 text-right">
                <p className="text-3xl font-black tabular-nums leading-none"
                  style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {fotos1.length + fotos2.length}
                </p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-white/30 mt-0.5">foto</p>
              </div>
            </div>
          </div>

          {/* ── Strip 1 ── */}
          {fotos1.length > 0 && (
            <div className="space-y-2">
              <div className="px-4 sm:px-5 flex items-center gap-2">
                <div className="w-px h-3 bg-emerald-400/50"/>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400/60">{judul1}</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(16,185,129,0.15),transparent)' }}/>
                {/* Arah indicator */}
                <span className="text-[8px] text-white/20">← →</span>
              </div>
              <Strip fotos={fotos1} direction={-1} onOpen={idx => open(fotos1, idx)}/>
            </div>
          )}

          {/* ── Strip 2 ── */}
          {fotos2.length > 0 && (
            <div className="space-y-2">
              <div className="px-4 sm:px-5 flex items-center gap-2">
                <div className="w-px h-3 bg-cyan-400/50"/>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/60">{judul2}</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(6,182,212,0.15),transparent)' }}/>
                <span className="text-[8px] text-white/20">→ ←</span>
              </div>
              <Strip fotos={fotos2} direction={1} onOpen={idx => open(fotos2, idx)} speed={0.4}/>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lb && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99990] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(16px)' }}
            onClick={() => setLb(null)}>

            <button onClick={() => setLb(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors z-10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <X size={14}/>
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-400"/>
              <span className="text-white/40 text-[10px] font-medium">{lbIdx+1} / {lbList.length}</span>
              <div className="w-1 h-1 rounded-full bg-cyan-400"/>
            </div>

            {/* Foto */}
            <motion.div key={lbIdx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
              <img src={lbList[lbIdx]} alt="" className="w-full object-contain rounded-xl max-h-[75vh]"
                style={{ boxShadow: '0 0 100px rgba(0,0,0,0.9), 0 0 40px rgba(16,185,129,0.1)' }}/>
            </motion.div>

            {/* Nav */}
            {lbList.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); setLb(p => ({...p,idx:(p.idx-1+lbList.length)%lbList.length})) }}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <ChevronLeft size={18}/>
                </button>
                <button onClick={e => { e.stopPropagation(); setLb(p => ({...p,idx:(p.idx+1)%lbList.length})) }}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <ChevronRight size={18}/>
                </button>
              </>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {lbList.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLb(p => ({...p,idx:i})) }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === lbIdx ? 20 : 4, height: 4,
                    background: i === lbIdx
                      ? 'linear-gradient(90deg,#10b981,#06b6d4)'
                      : 'rgba(255,255,255,0.2)',
                  }}/>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
