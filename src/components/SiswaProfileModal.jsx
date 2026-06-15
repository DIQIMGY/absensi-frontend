/**
 * SiswaProfileModal — reusable profile card modal for student ranking views.
 * Used in: admin/Ranking, admin/AbsensiGuru (ranking section), guru/Ranking.
 * Identical look & feel to the modal in siswa/Ranking.jsx.
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Medal, Award, Hash, Star,
  CheckCircle, Clock, AlertTriangle,
  TrendingUp, Disc, GraduationCap, X,
  ChevronLeft, UserCircle2,
} from 'lucide-react'

export default function SiswaProfileModal({ siswa, onClose, myId }) {
  const [coverErr, setCoverErr]           = useState(false)
  const [isDark, setIsDark]               = useState(() => document.documentElement.classList.contains('dark'))
  const [musikPlaying, setMusikPlaying]   = useState(false)
  const [showFotoView, setShowFotoView]   = useState(false)
  const [showUserPhoto, setShowUserPhoto] = useState(false)
  const musikRef = useRef(null)

  const isMe       = siswa?.id === myId
  const userFotoUrl = siswa?.foto_user_url || null

  useEffect(() => () => {
    if (musikRef.current) { musikRef.current.pause(); musikRef.current.currentTime = 0 }
  }, [])

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
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

  const hasCover   = (siswa.foto_cover_url) && !coverErr
  const fotoUrl    = siswa.foto_url || siswa.foto
  const nama       = siswa.nama_lengkap || siswa.nama || '-'
  const totalAbsen = (siswa.total_hadir || 0) + (siswa.total_terlambat || 0) + (siswa.total_alpha || 0)
  const pctHadir   = totalAbsen > 0 ? Math.round(((siswa.total_hadir || 0) + (siswa.total_terlambat || 0)) / totalAbsen * 100) : 0
  const pctColor   = pctHadir >= 80 ? '#10b981' : pctHadir >= 60 ? '#f59e0b' : '#ef4444'
  const pctLabel   = pctHadir >= 80 ? 'Baik'    : pctHadir >= 60 ? 'Cukup'   : 'Kurang'
  const RankIcon   = siswa.posisi === 1 ? Trophy : siswa.posisi === 2 ? Medal : siswa.posisi <= 3 ? Award : Hash
  const motivasi   = pctHadir >= 80
    ? '"Konsistensimu luar biasa, terus pertahankan!"'
    : pctHadir >= 60
    ? '"Tetap semangat, konsistensi adalah kunci!"'
    : '"Mulai hari ini, jadikan kehadiran prioritas!"'

  // Theme tokens
  const card       = isDark ? '#111827' : '#ffffff'
  const cardBd     = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)'
  const cardShadow = isDark ? '0 40px 100px rgba(0,0,0,0.7)' : '0 24px 60px rgba(0,0,0,0.15)'
  const boxBg      = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const boxBd      = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'
  const barTrack   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'
  const handleBg   = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
  const nameColor  = isDark ? '#f8fafc'                : '#0f172a'
  const subColor   = isDark ? 'rgba(148,163,184,0.85)' : 'rgba(71,85,105,0.9)'
  const metaColor  = isDark ? 'rgba(100,116,139,0.8)'  : 'rgba(100,116,139,0.9)'
  const labelColor = isDark ? 'rgba(148,163,184,0.55)' : 'rgba(100,116,139,0.7)'
  const quoteColor = isDark ? 'rgba(148,163,184,0.4)'  : 'rgba(100,116,139,0.5)'
  const meColor    = isDark ? '#c4b5fd' : '#7c3aed'
  const meBg       = isDark ? 'rgba(124,58,237,0.2)'   : 'rgba(124,58,237,0.08)'
  const meBd       = isDark ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.25)'
  const statBg     = (c) => isDark ? `${c}10` : `${c}08`
  const statBd     = (c) => isDark ? `${c}22` : `${c}20`

  return (
    <AnimatePresence>
      <motion.div key="bd"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
        style={{ background: 'rgba(2,6,23,0.72)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div key="card"
          initial={{ opacity: 0, y: 72, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 48, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 360, damping: 32 }}
          className="relative w-full sm:max-w-[360px] rounded-t-[28px] sm:rounded-[24px] overflow-hidden"
          style={{ background: card, border: `1px solid ${cardBd}`, boxShadow: cardShadow }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* drag handle — mobile only */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="w-9 h-1 rounded-full" style={{ background: handleBg }} />
          </div>

          {/* ── COVER ─────────────────────────────────────── */}
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            {hasCover
              ? <img src={siswa.foto_cover_url} alt="cover" className="w-full h-full object-cover" onError={() => setCoverErr(true)} />
              : <div className="w-full h-full relative overflow-hidden"
                  style={{ background: isMe ? 'linear-gradient(135deg,#1e0a3c,#3b0764,#5b21b6)' : 'linear-gradient(135deg,#0c1445,#1e1b4b,#312e81)' }}>
                  <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '14px 14px' }} />
                  <div className="absolute top-3 right-6 w-16 h-16 rounded-full blur-2xl opacity-20"
                    style={{ background: isMe ? '#a78bfa' : '#818cf8' }} />
                </div>
            }
            <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
              style={{ background: `linear-gradient(to top,${card},transparent)` }} />

            {/* rank pill */}
            {siswa.posisi && (
              <div className="absolute top-3 left-3">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <RankIcon size={10} className="text-white" />
                  <span className="text-white font-black text-[11px]">#{siswa.posisi}</span>
                </div>
              </div>
            )}

            <motion.button whileTap={{ scale: 0.85 }} onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <X size={13} className="text-white" />
            </motion.button>

            {/* MUSIK */}
            {(siswa.musik_foto_url || siswa.musik_audio_url || siswa.musik_nama) && (
              <div className="absolute bottom-3 right-3 z-10">
                {siswa.musik_audio_url && (
                  <audio ref={musikRef} src={siswa.musik_audio_url} loop onEnded={() => setMusikPlaying(false)} />
                )}
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!musikRef.current || !siswa.musik_audio_url) return
                    if (musikPlaying) { musikRef.current.pause(); setMusikPlaying(false) }
                    else              { musikRef.current.play();  setMusikPlaying(true)  }
                  }}
                  className="flex items-center gap-2.5 rounded-full overflow-hidden"
                  style={{
                    background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    boxShadow: musikPlaying ? '0 4px 20px rgba(167,139,250,0.4)' : '0 4px 16px rgba(0,0,0,0.4)',
                    padding: '5px 12px 5px 5px', maxWidth: 170,
                  }}>
                  <div className="relative flex-shrink-0" style={{ width: 32, height: 32 }}>
                    {musikPlaying && (
                      <motion.div className="absolute inset-0 rounded-full"
                        animate={{ scale: [1,1.5,1], opacity: [0.5,0,0.5] }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                        style={{ background: 'rgba(167,139,250,0.35)' }} />
                    )}
                    <motion.div
                      animate={{ rotate: musikPlaying ? 360 : 0 }}
                      transition={{ repeat: musikPlaying ? Infinity : 0, duration: 3.5, ease: 'linear' }}
                      className="w-full h-full rounded-full overflow-hidden"
                      style={{ border: musikPlaying ? '2px solid rgba(167,139,250,0.7)' : '2px solid rgba(255,255,255,0.3)', background: 'linear-gradient(135deg,#0f0a1e,#1e0a3c)' }}>
                      {siswa.musik_foto_url
                        ? <img src={siswa.musik_foto_url} alt="album" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Disc size={13} className="text-white/40" /></div>}
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: musikPlaying ? 'rgba(167,139,250,0.9)' : 'rgba(255,255,255,0.8)' }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    {siswa.musik_nama && <p className="text-white font-bold leading-tight truncate" style={{ fontSize: 10 }}>{siswa.musik_nama}</p>}
                    {siswa.musik_artis && <p className="truncate leading-tight mt-0.5" style={{ fontSize: 9, color: 'rgba(200,180,255,0.7)' }}>{siswa.musik_artis}</p>}
                    {musikPlaying && (
                      <div className="flex items-end gap-0.5 mt-1" style={{ height: 7 }}>
                        {[0,1,2,3].map(i => (
                          <motion.div key={i} className="w-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.8)' }}
                            animate={{ height: ['30%','100%','50%','80%','30%'] }}
                            transition={{ repeat: Infinity, duration: 0.6 + i * 0.15, ease: 'easeInOut', delay: i * 0.1 }} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.button>
              </div>
            )}
          </div>

          {/* ── BODY ──────────────────────────────────────── */}
          <div className="px-4 pt-3 pb-5 space-y-3">

            {/* Nama + kelas/NIS */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[17px] font-black leading-tight" style={{ color: nameColor }}>{nama}</h2>
                {isMe && (
                  <span className="flex-shrink-0 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black"
                    style={{ background: meBg, border: `1px solid ${meBd}`, color: meColor }}>
                    <Star size={7} />KAMU
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: subColor }}>
                  <GraduationCap size={10} style={{ color: metaColor }} />
                  {siswa.kelas?.nama_kelas || siswa.kelas || '-'}
                </span>
                <span style={{ color: metaColor, fontSize: 10 }}>·</span>
                <span className="text-[11px] font-mono" style={{ color: metaColor }}>NIS {siswa.nis || '-'}</span>
              </div>
            </div>

            {/* Kehadiran bar */}
            <div className="rounded-2xl px-3.5 py-3" style={{ background: boxBg, border: `1px solid ${boxBd}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={11} style={{ color: metaColor }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: metaColor }}>Kehadiran</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-black tabular-nums" style={{ color: pctColor }}>{pctHadir}%</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg"
                    style={{ background: `${pctColor}15`, color: pctColor, border: `1px solid ${pctColor}28` }}>{pctLabel}</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: barTrack }}>
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${pctHadir}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
                  style={{ background: pctHadir >= 80 ? 'linear-gradient(90deg,#059669,#34d399)' : pctHadir >= 60 ? 'linear-gradient(90deg,#d97706,#fbbf24)' : 'linear-gradient(90deg,#dc2626,#f87171)' }} />
              </div>
              <p className="text-[10px] mt-2 leading-relaxed italic" style={{ color: quoteColor }}>{motivasi}</p>
            </div>

            {/* Stats 3 kolom */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'HADIR',     sub: 'Total', val: siswa.total_hadir,     c: '#10b981', Icon: CheckCircle   },
                { label: 'TERLAMBAT', sub: 'Total', val: siswa.total_terlambat, c: '#f59e0b', Icon: Clock         },
                { label: 'ALPHA',     sub: 'Total', val: siswa.total_alpha,     c: '#ef4444', Icon: AlertTriangle },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 240, damping: 20 }}
                  className="rounded-2xl text-center py-3 px-1.5 relative overflow-hidden"
                  style={{ background: statBg(s.c), border: `1px solid ${statBd(s.c)}` }}>
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(90deg,transparent,${s.c}80,transparent)` }} />
                  <s.Icon size={14} style={{ color: s.c }} className="mx-auto" />
                  <p className="text-[22px] font-black tabular-nums leading-none mt-1" style={{ color: s.c }}>{s.val ?? 0}</p>
                  <p className="text-[8px] font-black mt-1 tracking-wide" style={{ color: s.c }}>{s.label}</p>
                  <p className="text-[8px] mt-0.5" style={{ color: labelColor }}>{s.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Lihat foto */}
            {fotoUrl && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowFotoView(true)}
                className="w-full flex flex-col items-center gap-1 pt-1 pb-0.5 opacity-50 hover:opacity-80 transition-opacity">
                <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: metaColor }}>Lihat Foto Profil</p>
                <motion.div animate={{ y: [0,4,0] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                    <path d="M1 1L7 7L13 1" stroke={metaColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </motion.button>
            )}
          </div>

          {/* ── FOTO VIEW SLIDE ───────────────────────────── */}
          <AnimatePresence>
            {showFotoView && (
              <motion.div key="foto-slide"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-t-[28px] sm:rounded-[24px] overflow-hidden"
                style={{ background: isDark ? '#0f172a' : '#f8fafc', zIndex: 10 }}>

                <motion.button whileTap={{ scale: 0.88 }} onClick={() => { setShowFotoView(false); setShowUserPhoto(false) }}
                  className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center z-20"
                  style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}` }}>
                  <ChevronLeft size={16} style={{ color: isDark ? 'white' : '#334155' }} />
                </motion.button>

                <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-20"
                  style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}` }}>
                  <X size={15} style={{ color: isDark ? 'white' : '#334155' }} />
                </motion.button>

                <motion.div key={showUserPhoto ? 'lbl-user' : 'lbl-siswa'}
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold"
                    style={{
                      background: showUserPhoto ? (isDark ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.1)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                      color:      showUserPhoto ? (isDark ? '#c4b5fd' : '#7c3aed') : (isDark ? 'rgba(148,163,184,0.8)' : 'rgba(71,85,105,0.8)'),
                      border: `1px solid ${showUserPhoto ? (isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.2)') : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                    }}>
                    {showUserPhoto ? '👤 Foto Akun' : '🎓 Foto Profil'}
                  </span>
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.div key={showUserPhoto ? 'foto-user' : 'foto-siswa'}
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                    className="relative cursor-pointer"
                    style={{ width: 'min(60vw, 200px)', height: 'min(60vw, 200px)' }}
                    onClick={() => { if (userFotoUrl) setShowUserPhoto(v => !v) }}>
                    <div className="w-full h-full overflow-hidden shadow-xl rounded-3xl"
                      style={{
                        boxShadow:   showUserPhoto ? '0 12px 40px rgba(124,58,237,0.35)' : '0 12px 40px rgba(0,0,0,0.2)',
                        outline:     showUserPhoto ? '3px solid rgba(124,58,237,0.5)' : 'none',
                        outlineOffset: 3,
                      }}>
                      {showUserPhoto && userFotoUrl
                        ? <img src={userFotoUrl} alt="Foto Akun" className="w-full h-full object-cover" />
                        : <img src={fotoUrl} alt={nama} className="w-full h-full object-cover" />
                      }
                    </div>
                    {userFotoUrl && (
                      <div className="absolute -bottom-3 left-0 right-0 flex justify-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold"
                          style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: isDark ? 'rgba(148,163,184,0.6)' : 'rgba(100,116,139,0.7)' }}>
                          ketuk untuk {showUserPhoto ? 'lihat foto siswa' : 'lihat foto kamu'}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="mt-8 text-center px-4">
                  <p className="font-black text-sm" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{nama}</p>
                  <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(148,163,184,0.7)' : 'rgba(100,116,139,0.8)' }}>
                    {showUserPhoto ? 'Foto akun' : 'Foto profil'} &middot; {siswa.kelas?.nama_kelas || siswa.kelas || '-'} &middot; {siswa.nis || '-'}
                  </p>
                </motion.div>

                {userFotoUrl && (
                  <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowUserPhoto(v => !v)}
                    className="mt-5 flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all"
                    style={{
                      background: showUserPhoto ? (isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.08)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                      color:  showUserPhoto ? (isDark ? '#c4b5fd' : '#7c3aed') : (isDark ? 'rgba(148,163,184,0.8)' : 'rgba(71,85,105,0.8)'),
                      border: `1px solid ${showUserPhoto ? (isDark ? 'rgba(167,139,250,0.25)' : 'rgba(124,58,237,0.15)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`,
                    }}>
                    <UserCircle2 size={13} />
                    {showUserPhoto ? 'Lihat foto profil' : 'Lihat foto akun'}
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
