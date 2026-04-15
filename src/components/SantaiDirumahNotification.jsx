import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, X, Moon, Sun, Heart, Coffee, Book, Monitor, Music, Sparkles, Flower2, Star, Smile, Coffee as CoffeeIcon, Bed, Gamepad2 } from 'lucide-react'
import { usePengaturanStore } from '../stores/pengaturanStore'

export default function SantaiDirumahNotification() {
  const [show, setShow] = useState(false)
  const { pengaturan } = usePengaturanStore()

  useEffect(() => {
    const checkTime = () => {
      if (!pengaturan.jam_pulang || !pengaturan.jam_buka_absen) return

      const now = new Date()
      
      // Parse jam pulang
      const [pulangHours, pulangMinutes] = pengaturan.jam_pulang.split(':')
      const jamPulang = new Date()
      jamPulang.setHours(parseInt(pulangHours), parseInt(pulangMinutes), 0)
      
      // Parse jam buka absen
      const [bukaHours, bukaMinutes] = pengaturan.jam_buka_absen.split(':')
      const jamBuka = new Date()
      jamBuka.setHours(parseInt(bukaHours), parseInt(bukaMinutes), 0)
      
      // Jika jam buka besok (misal jam 6 pagi), tambah 1 hari
      if (jamBuka <= jamPulang) {
        jamBuka.setDate(jamBuka.getDate() + 1)
      }
      
      // Tampilkan notifikasi dari jam pulang sampai jam buka besok
      const sudahPulang = now >= jamPulang
      const belumBuka = now < jamBuka
      
      setShow(sudahPulang && belumBuka)
    }

    // Cek setiap menit
    checkTime()
    const interval = setInterval(checkTime, 60000)

    return () => clearInterval(interval)
  }, [pengaturan.jam_pulang, pengaturan.jam_buka_absen])

  if (!show) return null

  // Tentukan waktu (siang/malam) untuk icon dan pesan
  const currentHour = new Date().getHours()
  const isMalam = currentHour >= 18 || currentHour < 6
  const isSore = currentHour >= 15 && currentHour < 18
  const isPagi = currentHour >= 6 && currentHour < 12
  const isSiang = currentHour >= 12 && currentHour < 15

  const getTimeIcon = () => {
    if (isMalam) return <Moon size={24} className="text-emerald-300" />
    if (isSore) return <Sun size={24} className="text-amber-400" />
    if (isPagi) return <Sun size={24} className="text-yellow-400" />
    return <Sun size={24} className="text-orange-400" />
  }

  const getTimeMessage = () => {
    if (isMalam) return "Selamat beristirahat malam! 🌙"
    if (isSore) return "Selamat menikmati sore hari! 🌅"
    if (isPagi) return "Selamat pagi! Nikmati waktu santai sebelum sekolah! ☀️"
    return "Selamat siang! Waktu istirahat yang menyenangkan! 🌞"
  }

  const getActivities = () => {
    if (isMalam) return [
      { icon: <Book size={16} />, text: "Baca buku favorit", color: "text-emerald-300" },
      { icon: <Music size={16} />, text: "Dengarkan musik", color: "text-emerald-300" },
      { icon: <Bed size={16} />, text: "Tidur yang cukup", color: "text-emerald-300" }
    ]
    if (isSore) return [
      { icon: <CoffeeIcon size={16} />, text: "Minum teh hangat", color: "text-amber-300" },
      { icon: <Gamepad2 size={16} />, text: "Main game sebentar", color: "text-amber-300" },
      { icon: <Heart size={16} />, text: "Quality time keluarga", color: "text-amber-300" }
    ]
    if (isPagi) return [
      { icon: <CoffeeIcon size={16} />, text: "Sarapan yang sehat", color: "text-emerald-300" },
      { icon: <Book size={16} />, text: "Baca buku ringan", color: "text-emerald-300" },
      { icon: <Flower2 size={16} />, text: "Olahraga ringan", color: "text-emerald-300" }
    ]
    return [
      { icon: <CoffeeIcon size={16} />, text: "Minum yang hangat", color: "text-orange-300" },
      { icon: <Monitor size={16} />, text: "Nonton film", color: "text-orange-300" },
      { icon: <Heart size={16} />, text: "Istirahat sejenak", color: "text-orange-300" }
    ]
  }

  // Get gradient based on time
  const getGradient = () => {
    if (isMalam) return {
      from: '#059669',
      to: '#065F46',
      accent: '#10B981',
      light: '#34D399'
    }
    if (isSore) return {
      from: '#F59E0B',
      to: '#D97706',
      accent: '#FBBF24',
      light: '#FCD34D'
    }
    if (isPagi) return {
      from: '#10B981',
      to: '#059669',
      accent: '#34D399',
      light: '#6EE7B7'
    }
    return {
      from: '#10B981',
      to: '#059669',
      accent: '#34D399',
      light: '#6EE7B7'
    }
  }

  const gradient = getGradient()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 28,
            mass: 0.8
          }
        }}
        exit={{ opacity: 0, y: -80, scale: 0.95 }}
        className="fixed top-20 right-4 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto"
      >
        <motion.div
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative overflow-hidden"
        >
          {/* Main Card with Premium Emerald Gradient */}
          <div className="relative rounded-2xl shadow-2xl overflow-hidden">
            {/* Animated Gradient Background */}
            <motion.div
              animate={{
                background: [
                  `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                  `linear-gradient(135deg, ${gradient.accent} 0%, ${gradient.from} 100%)`,
                  `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0"
            />
            
            {/* Decorative Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:20px_20px]" />
            
            {/* Floating Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  x: [0, 20, -10, 0],
                  y: [0, -15, 10, 0],
                  scale: [1, 1.1, 0.9, 1]
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 blur-2xl"
              />
              <motion.div
                animate={{
                  x: [0, -15, 20, 0],
                  y: [0, 10, -5, 0],
                  scale: [1, 0.9, 1.1, 1]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 blur-2xl"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 p-5 sm:p-6">
              {/* Header with Icon and Close */}
              <div className="flex justify-between items-start mb-4">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg"
                >
                  <Home size={28} className="text-white" />
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShow(false)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm border border-white/30"
                >
                  <X size={16} className="text-white" />
                </motion.button>
              </div>

              {/* Main Title */}
              <motion.div
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-center mb-4"
              >
                <h2 className="text-xl sm:text-2xl font-black text-white mb-1 drop-shadow-lg">
                  🏠 Santai di Rumah
                </h2>
                <div className="w-12 h-0.5 bg-white/40 mx-auto rounded-full" />
              </motion.div>

              {/* Time-based Message Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/20 backdrop-blur-md rounded-xl p-4 mb-4 border border-white/30 shadow-lg"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {getTimeIcon()}
                  </motion.div>
                  <p className="text-white text-center text-sm font-bold">
                    {getTimeMessage()}
                  </p>
                </div>
                <p className="text-white/90 text-center text-xs leading-relaxed">
                  Selamat menikmati waktu bersantai di rumah. Kembali besok dengan semangat baru! 💪✨
                </p>
              </motion.div>

              {/* Activities Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/15 backdrop-blur-md rounded-xl p-3 mb-4 border border-white/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-white" />
                  <p className="text-white font-semibold text-xs">Aktivitas Santai:</p>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs text-white/90">
                  {getActivities().map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-all"
                    >
                      <div className={activity.color}>{activity.icon}</div>
                      <span>{activity.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Time Info Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 text-white/90 text-xs bg-white/10 backdrop-blur-sm rounded-lg py-2 px-3"
              >
                {getTimeIcon()}
                <span className="font-medium">
                  Sekolah buka besok jam {pengaturan.jam_buka_absen?.substring(0, 5)}
                </span>
                <Sparkles size={10} className="text-white/70" />
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute bottom-2 left-2 opacity-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Star size={12} className="text-white" />
                </motion.div>
              </div>
              <div className="absolute top-2 right-12 opacity-20">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Flower2 size={10} className="text-white" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}