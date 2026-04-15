import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, LogOut, Bell, Sparkles, Home, PartyPopper, Zap, Heart, Star } from 'lucide-react'
import { usePengaturanStore } from '../stores/pengaturanStore'

export default function PulangNotification() {
  const [show, setShow] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [isPulangTime, setIsPulangTime] = useState(false)
  const { pengaturan } = usePengaturanStore()

  useEffect(() => {
    const checkTime = () => {
      if (!pengaturan.jam_pulang) return

      const now = new Date()
      const [hours, minutes] = pengaturan.jam_pulang.split(':')
      const pulangTime = new Date()
      pulangTime.setHours(parseInt(hours), parseInt(minutes), 0)

      // Hitung selisih waktu dalam menit
      const diffMs = pulangTime - now
      const diffMins = Math.floor(diffMs / 60000)

      // Tampilkan notifikasi 30 menit sebelum jam pulang
      if (diffMins > 0 && diffMins <= 30) {
        setShow(true)
        setIsPulangTime(false)
        const hours = Math.floor(diffMins / 60)
        const mins = diffMins % 60
        if (hours > 0) {
          setTimeLeft(`${hours} jam ${mins} menit`)
        } else {
          setTimeLeft(`${mins} menit`)
        }
      } else if (diffMins <= 0 && diffMins >= -5) {
        // Tampilkan "Waktunya pulang!" selama 5 menit setelah jam pulang
        setShow(true)
        setIsPulangTime(true)
        setTimeLeft('Sekarang!')
      } else {
        setShow(false)
      }
    }

    // Cek setiap menit
    checkTime()
    const interval = setInterval(checkTime, 60000)

    return () => clearInterval(interval)
  }, [pengaturan.jam_pulang])

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8, rotate: -10 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          rotate: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
          }
        }}
        exit={{ opacity: 0, y: -100, scale: 0.8, rotate: 10 }}
        className="fixed top-20 right-4 z-50 max-w-md"
      >
        {isPulangTime ? (
          // NOTIFIKASI WAKTUNYA PULANG - SUPER HEBOH!
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative overflow-hidden"
          >
            {/* Background dengan gradient animasi */}
            <motion.div
              animate={{
                background: [
                  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
                  'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="rounded-3xl shadow-2xl p-6 border-4 border-white/30"
            >
              {/* Sparkles animasi */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      x: [0, Math.random() * 100 - 50],
                      y: [0, Math.random() * 100 - 50],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut"
                    }}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  >
                    <Sparkles size={20} className="text-white" />
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10">
                {/* Header dengan icon besar */}
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                  >
                    <PartyPopper size={40} className="text-white" />
                  </motion.div>
                </div>

                {/* Judul HEBOH */}
                <motion.h2
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-3xl font-black text-white text-center mb-3 drop-shadow-lg"
                >
                  🎉 WAKTUNYA PULANG! 🎉
                </motion.h2>

                {/* Pesan semangat */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                  <p className="text-white text-center text-lg font-bold mb-2">
                    Yeay! Hari ini sudah selesai!
                  </p>
                  <p className="text-white/90 text-center text-sm">
                    Kamu sudah belajar dengan baik hari ini. Saatnya istirahat dan pulang dengan selamat! 💪✨
                  </p>
                </div>

                {/* Checklist pulang */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-4">
                  <p className="text-white font-semibold text-xs mb-2 flex items-center gap-2">
                    <Zap size={14} />
                    Checklist Sebelum Pulang:
                  </p>
                  <div className="space-y-1.5 text-xs text-white/90">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      <span>✅ Rapikan meja dan kursi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      <span>✅ Bawa semua barang bawaan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      <span>✅ Jangan lupa senyum! 😊</span>
                    </div>
                  </div>
                </div>

                {/* Jam pulang */}
                <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                  <Clock size={16} />
                  <span className="font-semibold">Jam Pulang: {pengaturan.jam_pulang?.substring(0, 5)}</span>
                </div>

                {/* Tombol close */}
                <button
                  onClick={() => setShow(false)}
                  className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          // NOTIFIKASI COUNTDOWN - MENARIK
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white rounded-2xl shadow-2xl p-5 border-2 border-white/20 relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-start gap-4">
                {/* Icon dengan animasi pulse */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex-shrink-0"
                >
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Home size={28} className="text-white" />
                  </div>
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Bell size={18} className="text-white" />
                    </motion.div>
                    <h3 className="font-bold text-lg">Sebentar Lagi Pulang!</h3>
                  </div>
                  
                  {/* Countdown */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-3">
                    <p className="text-white/90 text-sm mb-1">
                      Waktu pulang dalam:
                    </p>
                    <motion.p
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-2xl font-black text-white"
                    >
                      ⏰ {timeLeft}
                    </motion.p>
                  </div>

                  {/* Pesan motivasi */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 mb-2">
                    <p className="text-xs text-white/90 flex items-center gap-1.5">
                      <Star size={14} className="text-yellow-300" />
                      <span>Semangat! Sebentar lagi waktunya istirahat 💪</span>
                    </p>
                  </div>
                  
                  {/* Info jam */}
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Clock size={14} />
                    <span>Jam pulang: {pengaturan.jam_pulang?.substring(0, 5)}</span>
                  </div>
                </div>

                {/* Tombol close */}
                <button
                  onClick={() => setShow(false)}
                  className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
