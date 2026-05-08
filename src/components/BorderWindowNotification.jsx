import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Clock } from 'lucide-react'
import { siswaApi } from '../services/siswaService'
import { useNavigate } from 'react-router-dom'

function formatSisa(detik) {
  if (detik <= 0) return '00:00'
  const m = Math.floor(detik / 60)
  const s = detik % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function BorderWindowNotification() {
  const [status, setStatus]       = useState(null)
  const [sisaDetik, setSisaDetik] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [autoHide, setAutoHide]   = useState(false)
  const [shownWindowId, setShownWindowId] = useState(null)
  const navigate = useNavigate()

  const fetchStatus = useCallback(async () => {
    try {
      const res = await siswaApi.getBorderWindowStatus()
      setStatus(res.data)
      setSisaDetik(res.data.sisa_detik || 0)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  useEffect(() => {
    if (!status?.border_window_aktif || sisaDetik <= 0) return
    const t = setInterval(() => {
      setSisaDetik(prev => {
        if (prev <= 1) { fetchStatus(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [status?.border_window_aktif, sisaDetik, fetchStatus])

  useEffect(() => {
    if (!status?.border_window_aktif) return
    const windowId = status?.border_window_selesai
    if (windowId && windowId !== shownWindowId) {
      setShownWindowId(windowId)
      setDismissed(false)
      setAutoHide(false)
    }
  }, [status?.border_window_aktif, status?.border_window_selesai])

  useEffect(() => {
    if (!status?.border_window_aktif || dismissed || autoHide) return
    const t = setTimeout(() => setAutoHide(true), 5000)
    return () => clearTimeout(t)
  }, [status?.border_window_aktif, dismissed, autoHide])

  const aktif      = status?.border_window_aktif
  const sudahPilih = status?.sudah_pilih
  const show       = aktif && !dismissed && !autoHide
  const urgent     = sisaDetik <= 300
  const danger     = sisaDetik <= 60

  const accentColor = danger
    ? 'rgba(220,30,30,0.9)'
    : urgent
    ? 'rgba(255,160,60,0.9)'
    : 'rgba(180,120,255,0.9)'

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -70, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="fixed top-3 left-0 right-0 z-[300] px-3 sm:px-0 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-96"
        >
          <motion.div
            animate={danger ? { scale: [1, 1.015, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.9 }}
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: danger
                ? 'linear-gradient(135deg,#1a0000,#2d0000)'
                : urgent
                ? 'linear-gradient(135deg,#1a0d00,#2d1800)'
                : 'linear-gradient(135deg,#06050d,#0f0d1a)',
              border: `1px solid ${danger ? 'rgba(220,30,30,0.45)' : urgent ? 'rgba(220,120,30,0.35)' : 'rgba(120,60,200,0.3)'}`,
              boxShadow: `0 8px 32px ${danger ? 'rgba(220,30,30,0.35)' : urgent ? 'rgba(220,120,30,0.25)' : 'rgba(80,40,160,0.35)'}`,
            }}>

            {/* Garis atas */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-[2px]"
              style={{ background: `linear-gradient(90deg,transparent,${accentColor},transparent)` }}/>

            <div className="px-3 py-2.5 flex items-center gap-2.5">
              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, -8, 8, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1.5 }}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: danger ? 'rgba(220,30,30,0.18)' : urgent ? 'rgba(220,120,30,0.18)' : 'rgba(120,60,200,0.18)' }}>
                {danger
                  ? <Clock size={15} style={{ color: accentColor }}/>
                  : <Sparkles size={15} style={{ color: accentColor }}/>
                }
              </motion.div>

              {/* Teks */}
              <div className="flex-1 min-w-0">
                {sudahPilih ? (
                  <>
                    <p className="text-[11px] font-black text-white leading-tight">Border dipilih ✓</p>
                    <p className="text-[9px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Berlaku 1 hari · tutup{' '}
                      <span className="font-black" style={{ color: accentColor }}>{formatSisa(sisaDetik)}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-black text-white leading-tight truncate">
                      {danger ? '⚠️ Segera pilih border!' : '✨ Border bebas pilih aktif!'}
                    </p>
                    <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Sisa{' '}
                      <motion.span
                        animate={urgent ? { opacity: [1, 0.3, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.7 }}
                        className="font-black"
                        style={{ color: accentColor }}>
                        {formatSisa(sisaDetik)}
                      </motion.span>
                      {' '}— segera ditutup!
                    </p>
                  </>
                )}
              </div>

              {/* Tombol */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!sudahPilih && (
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => navigate('/siswa/profil')}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-black text-white whitespace-nowrap"
                    style={{ background: danger ? 'rgba(220,30,30,0.75)' : urgent ? 'rgba(220,120,30,0.75)' : 'rgba(120,60,200,0.75)' }}>
                    Pilih
                  </motion.button>
                )}
                <button
                  onClick={() => setDismissed(true)}
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}>
                  <X size={10}/>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
