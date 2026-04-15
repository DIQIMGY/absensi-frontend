import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Maximize2 } from 'lucide-react'
import { usePengaturanStore } from '../stores/pengaturanStore'

/**
 * Video dashboard — admin bisa upload via Pengaturan > tab Sekolah
 * Fallback ke /video/videodash.mp4 jika belum diset
 */
export default function DashboardVideo({ className = '' }) {
  const { pengaturan } = usePengaturanStore()
  const videoRef  = useRef(null)
  const [muted, setMuted]     = useState(true)
  const [hovered, setHovered] = useState(false)

  // Pakai video dari pengaturan admin, fallback ke file lokal
  const videoSrc = pengaturan?.video_dashboard || '/video/videodash.mp4'

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !muted
    setMuted(m => !m)
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl bg-slate-900 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <video
        ref={videoRef}
        key={videoSrc}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none"/>

      {/* Live badge */}
      <div className="absolute top-2.5 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"/>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"/>
        </span>
        <span className="text-white text-[9px] font-bold uppercase tracking-widest">Live</span>
      </div>

      {/* Controls */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5"
      >
        <button onClick={toggleMute}
          className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
          {muted ? <VolumeX size={11}/> : <Volume2 size={11}/>}
        </button>
        <button onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
          <Maximize2 size={11}/>
        </button>
      </motion.div>
    </motion.div>
  )
}
