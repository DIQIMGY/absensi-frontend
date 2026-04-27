import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, RotateCcw, Play, Pause, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react'

// ── Motif Kawung SVG (batik Jawa klasik) ─────────────────────────────────────
const KawungPattern = ({ color = '#6d28d9', opacity = 0.06 }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="kawung" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
        {/* 4 elips membentuk motif kawung */}
        <ellipse cx="14" cy="7"  rx="5" ry="6" fill="none" stroke={color} strokeWidth="0.7"/>
        <ellipse cx="14" cy="21" rx="5" ry="6" fill="none" stroke={color} strokeWidth="0.7"/>
        <ellipse cx="7"  cy="14" rx="6" ry="5" fill="none" stroke={color} strokeWidth="0.7"/>
        <ellipse cx="21" cy="14" rx="6" ry="5" fill="none" stroke={color} strokeWidth="0.7"/>
        <circle  cx="14" cy="14" r="2" fill={color} opacity="0.4"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#kawung)"/>
  </svg>
)

// ── Motif Parang (diagonal) untuk aksen ──────────────────────────────────────
const ParangAccent = ({ color = '#7c3aed' }) => (
  <svg width="90" height="90" viewBox="0 0 60 60" fill="none" className="opacity-15">
    {[0,1,2,3,4].map(i => (
      <path key={i}
        d={`M${-10+i*15},60 Q${5+i*15},30 ${10+i*15},0`}
        stroke={color} strokeWidth="1.5" fill="none"/>
    ))}
  </svg>
)

export default function BudayaIndonesia({ budayaInfo, budayaFotos = [], budayaVideo = null, budayaVideo2 = null, budayaBg = null }) {
  const [idx, setIdx]               = useState(0)
  const [jawaban, setJawaban]       = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [autoPlay, setAutoPlay]     = useState(true)
  const [videoPaused, setVideoPaused] = useState(false)
  const [videoMuted, setVideoMuted]   = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Canvas blur sync dengan video — jalankan setelah video play
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const draw = () => {
      if (!video.paused && !video.ended && video.readyState >= 2) {
        canvas.width = video.videoWidth || 320
        canvas.height = video.videoHeight || 180
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [isVideoSlide])

  const fotos  = (budayaFotos || []).filter(Boolean)
  const videos = [budayaVideo, budayaVideo2].filter(Boolean)
  const total  = fotos.length + videos.length
  const isVideoSlide = idx >= fotos.length
  const videoSrc     = isVideoSlide ? videos[idx - fotos.length] : null

  useEffect(() => {
    if (!autoPlay || total <= 1 || isVideoSlide) return
    const t = setInterval(() => setIdx(p => (p + 1) % total), 4500)
    return () => clearInterval(t)
  }, [autoPlay, total, isVideoSlide])

  useEffect(() => {
    if (!videoRef.current) return
    if (isVideoSlide) { videoRef.current.play().catch(() => {}); setVideoPaused(false) }
    else videoRef.current.pause()
  }, [isVideoSlide, videoSrc])

  const prev = useCallback(() => { setAutoPlay(false); setIdx(p => (p - 1 + total) % total) }, [total])
  const next = useCallback(() => { setAutoPlay(false); setIdx(p => (p + 1) % total) }, [total])
  const toggleVideo = () => {
    if (!videoRef.current) return
    if (videoPaused) { videoRef.current.play(); setVideoPaused(false) }
    else { videoRef.current.pause(); setVideoPaused(true) }
  }
  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoMuted
    setVideoMuted(m => !m)
  }

  const info    = budayaInfo || {}
  const judul   = info.judul || 'Budaya Indonesia'
  const desk    = info.deskripsi || ''
  const tanya   = info.pertanyaan || ''
  const pil     = Array.isArray(info.pilihan) ? info.pilihan.slice(0, 3) : []
  const benar   = (typeof info.jawaban_benar === 'number' && info.jawaban_benar < pil.length) ? info.jawaban_benar : 0
  const hasKuis = !!(tanya && pil.length >= 2)
  const hasFoto = fotos.length > 0
  const ok      = jawaban === benar

  const DESK_LIMIT = 130
  const deskShort  = desk.length > DESK_LIMIT ? desk.slice(0, DESK_LIMIT) + '...' : desk
  const needExpand = desk.length > DESK_LIMIT

  if (!hasFoto && !videos.length && !desk && !hasKuis) return null

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ type:'spring', stiffness:160, damping:22 }}
      className="relative overflow-hidden rounded-2xl border border-amber-200/60 dark:border-amber-900/40"
      style={{ background: '#fffbeb', minHeight: 260 }}>

      {/* Dark mode base */}
      <div className="absolute inset-0 hidden dark:block"
        style={{ background: '#0f0a00' }}/>

      {/* ── Batik fade: jelas di kanan, pudar ke kiri ── */}
      {/* Batik jelas di kanan, pudar ke kiri — light mode */}
      <div className="absolute inset-0 pointer-events-none dark:hidden"
        style={{
          backgroundImage: `url(${budayaBg || '/image/batik.jpg'})`,
          backgroundSize: '160px auto',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'right center',
          WebkitMaskImage: 'linear-gradient(to left, black 0%, black 30%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1) 100%)',
          maskImage: 'linear-gradient(to left, black 0%, black 30%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1) 100%)',
          opacity: 0.5,
        }}/>

      {/* Dark mode */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: `url(${budayaBg || '/image/batik.jpg'})`,
          backgroundSize: '160px auto',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'right center',
          WebkitMaskImage: 'linear-gradient(to left, black 0%, black 30%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1) 100%)',
          maskImage: 'linear-gradient(to left, black 0%, black 30%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1) 100%)',
          opacity: 0.35,
        }}/>

      {/* Accent bar — warna emas batik */}
      <div className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #92400e, #b45309, #d97706, #b45309, #92400e)' }}/>

      {/* Ornamen parang di pojok kanan atas */}
      <div className="absolute top-0 right-0 opacity-40 dark:opacity-20">
        <ParangAccent color="#92400e"/>
      </div>
      <div className="absolute bottom-0 left-0 opacity-30 dark:opacity-15 pointer-events-none" style={{ transform:"scaleX(-1) scaleY(-1)" }}>
        <ParangAccent color="#b45309"/>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row" style={{ minHeight:258 }}>

        {/* ── KIRI: Foto / Video ── */}
        {(hasFoto || videos.length > 0) && (
          <div className="relative overflow-hidden bg-slate-950 sm:w-[42%] flex-shrink-0 rounded-l-2xl sm:rounded-l-2xl rounded-t-2xl sm:rounded-t-none"
            style={{ minHeight:220 }}>

            <AnimatePresence mode="wait">
              {!isVideoSlide && fotos[idx] && (
                <motion.img key={`f${idx}`} src={fotos[idx]} alt={judul}
                  initial={{ opacity:0, scale:1.05 }} animate={{ opacity:1, scale:1 }}
                  exit={{ opacity:0, scale:0.97 }} transition={{ duration:0.5 }}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { e.target.style.display='none' }}/>
              )}
            </AnimatePresence>

            {videos.length > 0 && (
              <>
                {/* Canvas blur background — sync dengan video */}
                <canvas ref={canvasRef}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-400 ${isVideoSlide ? 'opacity-100' : 'opacity-0'}`}
                  style={{ objectFit: 'cover', filter: 'blur(16px)', transform: 'scale(1.1)', opacity: isVideoSlide ? 0.7 : 0 }}/>
                {/* Video utama — contain agar tidak crop */}
                <video ref={videoRef} src={videoSrc || ''} loop muted playsInline
                  className={`absolute inset-0 w-full h-full transition-opacity duration-400 ${isVideoSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  style={{ objectFit: 'contain' }}/>
              </>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"/>

            {/* Badge dengan nuansa batik */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-400/30"
              style={{ background: 'rgba(146,64,14,0.7)', backdropFilter:'blur(8px)' }}>
              <span className="text-amber-300 text-[8px]">✦</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-amber-100">
                {isVideoSlide ? 'Video' : 'Nusantara'}
              </span>
              <span className="text-amber-300 text-[8px]">✦</span>
            </div>

            {/* Dots */}
            {total > 1 && (
              <div className="absolute top-3 right-3 flex items-center gap-1">
                {Array.from({ length: total }).map((_, i) => (
                  <button key={i} onClick={() => { setAutoPlay(false); setIdx(i) }}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: i === idx ? 14 : 4, height: 4,
                      background: i === idx ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                    }}/>
                ))}
              </div>
            )}

            <div className="absolute bottom-0 inset-x-0 p-3.5 flex items-end justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm leading-tight line-clamp-1 mb-0.5"
                  style={{ textShadow:'0 1px 8px rgba(0,0,0,0.9)' }}>
                  {isVideoSlide ? `Video ${idx - fotos.length + 1}` : judul}
                </p>
                {total > 1 && <p className="text-white/40 text-[9px]">{idx+1} / {total}</p>}
              </div>
              {isVideoSlide && (
                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  {/* Play/Pause */}
                  <button onClick={toggleVideo}
                    className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                    {videoPaused ? <Play size={12}/> : <Pause size={12}/>}
                  </button>
                  {/* Mute/Unmute — selalu terlihat, tidak perlu fullscreen */}
                  <button onClick={toggleMute}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      background: videoMuted ? 'rgba(0,0,0,0.4)' : 'rgba(251,191,36,0.7)',
                      backdropFilter: 'blur(4px)',
                    }}>
                    {videoMuted
                      ? <VolumeX size={12} className="text-white/70"/>
                      : <Volume2 size={12} className="text-white"/>
                    }
                  </button>
                </div>
              )}
            </div>

            {total > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all">
                  <ChevronLeft size={12}/>
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all">
                  <ChevronRight size={12}/>
                </button>
              </>
            )}
          </div>
        )}

        {/* ── KANAN: Info + Kuis ── */}
        <div className={`relative flex flex-col p-4 sm:p-5 min-w-0 ${(hasFoto || videos.length > 0) ? 'flex-1' : 'w-full'}`}>
          {/* Teks area: overlay ringan agar kontras di atas batik */}
          <div className="absolute inset-0 rounded-r-2xl pointer-events-none dark:hidden"
            style={{ background: 'rgba(255,251,235,0.15)' }}/>
          <div className="absolute inset-0 rounded-r-2xl pointer-events-none hidden dark:block"
            style={{ background: 'rgba(15,10,0,0.1)' }}/>

          {/* Header dengan ornamen */}
          <div className="flex items-start gap-2 mb-3 rounded-xl px-3 py-2"
            style={{ background: isDark ? 'rgba(10,8,5,0.7)' : 'rgba(255,253,247,0.85)' }}>
            <div className="flex-shrink-0 mt-0.5">
              {/* Ornamen bunga batik kecil */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="3" fill="#b45309" opacity="0.8"/>
                {[0,45,90,135,180,225,270,315].map((a,i) => (
                  <ellipse key={i} cx="9" cy="9" rx="1.5" ry="4"
                    transform={`rotate(${a} 9 9)`}
                    fill="#d97706" opacity="0.35"/>
                ))}
                <circle cx="9" cy="9" r="1.5" fill="#fbbf24"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] mb-0.5"
                style={{ color:'#92400e' }}>
                Kenali Nusantara
              </p>
              {!hasFoto && !videos.length && (
                <h3 className="text-slate-800 dark:text-slate-100 font-black text-sm leading-tight">{judul}</h3>
              )}
            </div>
          </div>

          {/* Deskripsi — background solid agar terbaca */}
          {desk && (
            <div className="mb-3 flex-shrink-0 rounded-xl px-3 py-2"
              style={{ background: isDark ? 'rgba(10,8,5,0.88)' : 'rgba(255,253,247,0.92)',
                       backdropFilter: 'blur(4px)' }}>
              <p className="text-[11px] leading-relaxed"
                style={{ color: isDark ? '#e7e5e4' : '#1c1917' }}>
                {expanded ? desk : deskShort}
              </p>
              {needExpand && (
                <button onClick={() => setExpanded(p => !p)}
                  className="mt-1 flex items-center gap-1 text-[10px] font-bold transition-colors"
                  style={{ color:'#b45309' }}>
                  {expanded ? <><ChevronUp size={10}/> Sembunyikan</> : <><ChevronDown size={10}/> Baca selengkapnya</>}
                </button>
              )}
            </div>
          )}

          {/* Kuis */}
          {hasKuis && (
            <div className="mt-auto space-y-2">
              {/* Wrapper solid agar kuis selalu terbaca di atas batik */}
              <div className="rounded-xl p-3"
                style={{ background: isDark ? 'rgba(10,8,5,0.92)' : 'rgba(255,253,247,0.95)',
                         backdropFilter: 'blur(4px)' }}>
              {/* Divider batik */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px" style={{ background:'linear-gradient(90deg, transparent, #d97706, transparent)' }}/>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-300/50 dark:border-amber-700/40"
                  style={{ background:'rgba(217,119,6,0.12)' }}>
                  <span className="text-amber-600 dark:text-amber-400 text-[8px]">✦</span>
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] text-amber-700 dark:text-amber-400">Kuis</p>
                  <span className="text-amber-600 dark:text-amber-400 text-[8px]">✦</span>
                </div>
                <div className="flex-1 h-px" style={{ background:'linear-gradient(90deg, #d97706, transparent)' }}/>
              </div>

              {/* Pertanyaan — background solid agar terbaca */}
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{tanya}</p>

              {/* Pilihan — background solid, tidak transparan */}
              <div className="space-y-1.5">
                {pil.map((p, i) => {
                  const sel = jawaban === i
                  const ok2 = i === benar

                  // Warna dinamis berdasarkan isDark
                  let wrapStyle = isDark
                    ? { background:'#1e1b18', border:'1.5px solid rgba(217,119,6,0.35)', color:'#f5f5f4' }
                    : { background:'#ffffff', border:'1.5px solid rgba(180,83,9,0.25)', color:'#1c1917' }
                  let numStyle = isDark
                    ? { background:'rgba(217,119,6,0.25)', color:'#fbbf24' }
                    : { background:'rgba(180,83,9,0.12)', color:'#92400e' }
                  let textCls = 'cursor-pointer'

                  if (showResult) {
                    if (ok2) {
                      wrapStyle = isDark
                        ? { background:'#052e16', border:'1.5px solid #10b981', color:'#6ee7b7' }
                        : { background:'#ecfdf5', border:'1.5px solid #10b981', color:'#065f46' }
                      numStyle  = { background:'#10b981', color:'white' }
                      textCls   = 'cursor-default'
                    } else if (sel) {
                      wrapStyle = isDark
                        ? { background:'#2d0a0a', border:'1.5px solid #ef4444', color:'#fca5a5' }
                        : { background:'#fff1f2', border:'1.5px solid #ef4444', color:'#9f1239' }
                      numStyle  = { background:'#ef4444', color:'white' }
                      textCls   = 'cursor-default'
                    } else {
                      wrapStyle = isDark
                        ? { background:'#111', border:'1.5px solid #333', color:'#555' }
                        : { background:'#f8fafc', border:'1.5px solid #e2e8f0', color:'#94a3b8' }
                      numStyle  = isDark
                        ? { background:'#222', color:'#555' }
                        : { background:'#e2e8f0', color:'#94a3b8' }
                      textCls   = 'cursor-default opacity-60'
                    }
                  }

                  return (
                    <motion.button key={i}
                      onClick={() => { if (!showResult) { setJawaban(i); setShowResult(true) } }}
                      whileTap={!showResult ? { scale:0.98 } : {}}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[11px] font-medium transition-all ${textCls} ${!showResult ? 'hover:border-amber-400/50 dark:hover:border-amber-600/40' : ''}`}
                      style={wrapStyle}>
                      <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                        style={numStyle}>
                        {String.fromCharCode(65+i)}
                      </span>
                      <span className="flex-1 leading-snug">{p}</span>
                      {showResult && ok2 && <CheckCircle size={11} className="text-emerald-500 flex-shrink-0"/>}
                      {showResult && sel && !ok2 && <XCircle size={11} className="text-rose-500 flex-shrink-0"/>}
                    </motion.button>
                  )
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showResult && (
                  <motion.div initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    className="flex items-center justify-between pt-0.5">
                    <p className={`text-[11px] font-bold ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {ok ? '🎉 Benar! Hebat!' : `Jawaban: ${pil[benar] || '-'}`}
                    </p>
                    <button onClick={() => { setJawaban(null); setShowResult(false) }}
                      className="flex items-center gap-1 text-[10px] font-semibold transition-colors"
                      style={{ color:'#b45309' }}>
                      <RotateCcw size={9}/> Ulang
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>{/* end wrapper solid */}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
