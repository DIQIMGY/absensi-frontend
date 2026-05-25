import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Pause, Play, Disc, Loader } from 'lucide-react'
import { useMusicPlayer } from './MusicPlayerContext'

export default function MusicPlayerButton({ accentColor = '#8b5cf6' }) {
  const { musikData, isPlaying, isLoading, loaded, toggle, fetchMusik } = useMusicPlayer()
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef(null)

  // Fetch saat pertama kali diklik kalau belum loaded
  const handleClick = async () => {
    if (!loaded) {
      await fetchMusik()
    }
    toggle()
  }

  // Tutup tooltip saat klik di luar
  useEffect(() => {
    if (!showTooltip) return
    const fn = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setShowTooltip(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [showTooltip])

  const hasMusik = musikData?.audio_url || musikData?.nama

  return (
    <div className="relative" ref={tooltipRef}>
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative p-2 rounded-xl transition-colors"
        style={{
          color: isPlaying ? accentColor : undefined,
          background: isPlaying ? `${accentColor}18` : undefined,
        }}
        title={isPlaying ? 'Pause musik' : 'Play musik favorit'}
      >
        {isLoading ? (
          <Loader size={15} className="animate-spin text-slate-400" />
        ) : isPlaying ? (
          <>
            {/* Equalizer animation saat playing */}
            <div className="flex items-end gap-[2px]" style={{ width: 15, height: 15 }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{ background: accentColor }}
                  animate={{ height: ['30%', '100%', '50%', '80%', '30%'] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.55 + i * 0.15,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <Music
            size={15}
            className={hasMusik ? 'text-slate-500 dark:text-slate-400' : 'text-slate-300 dark:text-slate-600'}
          />
        )}

        {/* Dot indicator kalau ada musik */}
        {hasMusik && !isPlaying && !isLoading && (
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: accentColor }}
          />
        )}
      </motion.button>

      {/* Tooltip popup */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 pointer-events-none"
            style={{ minWidth: 180 }}
          >
            <div
              className="rounded-2xl overflow-hidden shadow-xl border border-white/10"
              style={{
                background: 'rgba(15,10,30,0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {!hasMusik ? (
                <div className="px-4 py-3 flex items-center gap-2">
                  <Music size={13} className="text-white/40 flex-shrink-0" />
                  <p className="text-[11px] text-white/50">Belum ada musik favorit</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3 py-2.5">
                  {/* Vinyl disc */}
                  <div className="relative flex-shrink-0" style={{ width: 36, height: 36 }}>
                    {isPlaying && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                        style={{ background: `${accentColor}66` }}
                      />
                    )}
                    <motion.div
                      animate={{ rotate: isPlaying ? 360 : 0 }}
                      transition={{ repeat: isPlaying ? Infinity : 0, duration: 3.5, ease: 'linear' }}
                      className="w-full h-full rounded-full overflow-hidden"
                      style={{
                        border: isPlaying ? `2px solid ${accentColor}99` : '2px solid rgba(255,255,255,0.2)',
                        background: 'linear-gradient(135deg,#0f0a1e,#1e0a3c)',
                      }}
                    >
                      {musikData?.foto_url ? (
                        <img src={musikData.foto_url} alt="album" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Disc size={14} className="text-white/30" />
                        </div>
                      )}
                    </motion.div>
                    {/* Center hole */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: isPlaying ? accentColor : 'rgba(255,255,255,0.7)' }}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {musikData?.nama && (
                      <p className="text-white font-bold truncate leading-tight" style={{ fontSize: 11 }}>
                        {musikData.nama}
                      </p>
                    )}
                    {musikData?.artis && (
                      <p className="truncate leading-tight mt-0.5" style={{ fontSize: 10, color: 'rgba(200,180,255,0.7)' }}>
                        {musikData.artis}
                      </p>
                    )}
                    <p className="mt-1" style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                      {isPlaying ? 'Sedang diputar ▶' : 'Klik untuk play'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
