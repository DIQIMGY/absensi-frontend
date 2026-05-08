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
  const navigate = useNavigate()

  // Poll status setiap 30 detik
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

  // Countdown lokal setiap detik
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

  // Reset dismissed saat window baru dibuka
  useEffect(() => {
    if (status?.border_window_aktif) setDismissed(false)
  }, [status?.border_window_aktif])

  const aktif      = status?.border_window_aktif
  const sudahPilih = status?.sudah_pilih
  const show       = aktif && !dismissed

  // Warna berdasarkan sisa waktu
  const urgent = sisaDetik <= 300 // < 5 menit
  const danger = sisaDetik <= 60  // < 1 menit

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed top-4 left-1/2 z-[300] w-full max-w-sm"
          style={{ transform: 'translateX(-50%)' }}>

          <motion.div
            animate={danger ? { scale: [1, 1.02, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="mx-4 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: danger
                ? 'linear-gradient(135deg, #1a0000, #2d0000)'
                : urgent
                ? 'linear-gradient(135deg, #1a0d00, #2d1800)'
                : 'linear-gradient(135deg, #06050d, #0f0d1a)',
              border: danger
                ? '1px solid rgba(220,30,30,0.5)'
                : urgent
                ? '1px solid rgba(220,120,30,0.4)'
                : '1px solid rgba(120,60,200,0.3)',
              boxShadow: danger
                ? '0 8px 40px rgba(220,30,30,0.4)'
                : urgent
                ? '0 8px 40px rgba(220,120,30,0.3)'
                : '0 8px 40px rgba(80,40,160,0.4)',
            }}>

            {/* Garis atas */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-[2px]"
              style={{
                background: danger
                  ? 'linear-gradient(90deg,transparent,rgba(220,30,30,0.9),transparent)'
                  : urgent
                  ? 'linear-gradient(90deg,transparent,rgba(220,120,30,0.8),transparent)'
                  : 'linear-gradient(90deg,transparent,rgba(160,100,255,0.8),transparent)',
              }}/>

            <div className="px-4 py-3 flex items-center gap-3">
              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: danger
                    ? 'rgba(220,30,30,0.2)'
                    : urgent
                    ? 'rgba(220,120,30,0.2)'
                    : 'rgba(120,60,200,0.2)',
                }}>
                {danger
                  ? <Clock size={18} style={{ color: 'rgba(255,80,80,0.9)' }}/>
                  : <Sparkles size={18} style={{ color: danger ? 'rgba(255,80,80,0.9)' : urgent ? 'rgba(255,160,60,0.9)' : 'rgba(180,120,255,0.9)' }}/>
                }
              </motion.div>

              {/* Teks */}
              <div className="flex-1 min-w-0">
                {sudahPilih ? (
                  <>
                    <p className="text-xs font-black text-white leading-tight">Border sudah dipilih ✓</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Window tutup dalam <span className="font-black" style={{ color: danger ? 'rgba(255,80,80,0.9)' : urgent ? 'rgba(255,160,60,0.9)' : 'rgba(180,120,255,0.9)' }}>{formatSisa(sisaDetik)}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-black text-white leading-tight">
                      {danger ? '⚠️ Segera pilih border!' : '✨ Border bebas pilih aktif!'}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Waktu tersisa{' '}
                      <motion.span
                        animate={urgent ? { opacity: [1, 0.4, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="font-black"
                        style={{ color: danger ? 'rgba(255,80,80,0.9)' : urgent ? 'rgba(255,160,60,0.9)' : 'rgba(180,120,255,0.9)' }}>
                        {formatSisa(sisaDetik)}
                      </motion.span>
                      {' '}— segera ditutup!
                    </p>
                  </>
                )}
              </div>

              {/* Tombol pilih / tutup */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!sudahPilih && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/siswa/profil')}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-black text-white"
                    style={{
                      background: danger
                        ? 'linear-gradient(135deg,rgba(220,30,30,0.8),rgba(180,20,20,0.8))'
                        : urgent
                        ? 'linear-gradient(135deg,rgba(220,120,30,0.8),rgba(180,80,20,0.8))'
                        : 'linear-gradient(135deg,rgba(120,60,200,0.8),rgba(80,40,160,0.8))',
                    }}>
                    Pilih
                  </motion.button>
                )}
                <button
                  onClick={() => setDismissed(true)}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                  <X size={11}/>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
