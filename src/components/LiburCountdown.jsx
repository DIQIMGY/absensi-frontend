import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palmtree, Calendar } from 'lucide-react'

const hitungHari = (d) => {
  const a = new Date(); a.setHours(0,0,0,0)
  const b = new Date(d); b.setHours(0,0,0,0)
  return Math.round((b - a) / 86400000)
}
const hitungDurasi = (a, b) => {
  const d1 = new Date(a); d1.setHours(0,0,0,0)
  const d2 = new Date(b); d2.setHours(0,0,0,0)
  return Math.round((d2 - d1) / 86400000) + 1
}
const fmtTgl   = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
const fmtShort = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short' })

const FotoBulat = ({ fotos, size = 28 }) => {
  if (!fotos.length) return null
  return (
    <div className="flex items-center flex-wrap gap-0">
      {fotos.slice(0, 4).map((src, i) => (
        <motion.div key={i}
          initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
          transition={{ delay:0.06*i, type:'spring', stiffness:300, damping:22 }}
          style={{ marginLeft: i===0 ? 0 : -(size*0.3), zIndex: fotos.length - i }}>
          <img src={src} alt=""
            className="rounded-full object-cover flex-shrink-0"
            style={{ width:size, height:size, border:'2px solid white' }}
            onError={e => e.target.style.display='none'}/>
        </motion.div>
      ))}
    </div>
  )
}

export default function LiburCountdown({ pengaturan }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const { keterangan_libur, tanggal_libur_mulai, tanggal_libur_selesai,
    foto_libur, foto_libur_2, foto_libur_3, foto_libur_4, foto_libur_bg,
    status_libur } = pengaturan

  if (!tanggal_libur_mulai || !tanggal_libur_selesai) return null

  const hariMulai   = hitungHari(tanggal_libur_mulai)
  const hariSelesai = hitungHari(tanggal_libur_selesai)
  const durasi      = hitungDurasi(tanggal_libur_mulai, tanggal_libur_selesai)

  if (hariSelesai < 0 || hariMulai > 30) return null

  const sedangLibur = hariMulai <= 0 && hariSelesai >= 0
  if (sedangLibur && !status_libur) return null

  const label     = keterangan_libur || 'Libur Sekolah'
  const fotos     = [foto_libur, foto_libur_2, foto_libur_3, foto_libur_4].filter(Boolean)
  const bannerBg  = foto_libur_bg || null
  const thumbFoto = fotos[0] || null

  // ── SEDANG LIBUR ──────────────────────────────────────────────────────────
  if (sedangLibur) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          transition={{ type:'spring', stiffness:200, damping:22 }}
          className="relative overflow-hidden rounded-2xl w-full"
          style={{ minHeight:150 }}>
          {bannerBg
            ? <img src={bannerBg} alt="" className="absolute inset-0 w-full h-full object-cover"/>
            : <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,#064e3b,#065f46,#0f766e)' }}/>
          }
          <div className="absolute inset-0" style={{
            background:'linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.6) 60%,rgba(0,0,0,0.88) 100%)'
          }}/>
          <div className="relative z-10 flex flex-col justify-between h-full p-3 sm:p-4" style={{ minHeight:150 }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/15 flex-shrink-0">
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"/>
                </span>
                <span className="text-white text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">Sedang Libur</span>
              </div>
              {fotos.length > 0 && <FotoBulat fotos={fotos} size={30}/>}
            </div>
            <div>
              <h2 className="text-white font-black text-base sm:text-xl leading-tight mb-1 line-clamp-2"
                style={{ textShadow:'0 1px 6px rgba(0,0,0,0.7)' }}>{label}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white/60 text-[10px] sm:text-xs">{fmtShort(tanggal_libur_mulai)} — {fmtShort(tanggal_libur_selesai)}</span>
                <span className="bg-white/15 backdrop-blur-sm rounded-full px-2 py-0.5 text-white text-[10px] font-bold border border-white/20 whitespace-nowrap">
                  {hariSelesai+1} hari lagi
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // ── COUNTDOWN — horizontal split ─────────────────────────────────────────
  const pct = Math.max(3, Math.round((1 - hariMulai / 30) * 100))

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
        transition={{ type:'spring', stiffness:200, damping:22 }}
        className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 w-full"
        style={{ minHeight:150 }}>

        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"/>

        <div className="flex h-full" style={{ minHeight:150 }}>

          {/* Foto kiri — lebar adaptif */}
          <div className="relative flex-shrink-0 overflow-hidden rounded-l-2xl"
            style={{ width: 'clamp(80px, 28%, 140px)' }}>
            {thumbFoto
              ? <img src={thumbFoto} alt="" className="absolute inset-0 w-full h-full object-cover"/>
              : <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#ecfdf5,#d1fae5,#a7f3d0)' }}>
                  <Palmtree size={36} className="text-emerald-400 opacity-50"/>
                </div>
            }
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/15 dark:to-slate-900/25"/>
          </div>

          {/* Info tengah */}
          <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                <Palmtree size={9} className="text-emerald-600 dark:text-emerald-400"/>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 truncate">
                Libur Mendatang
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-slate-800 dark:text-slate-100 font-black text-sm sm:text-base leading-tight mb-1 line-clamp-2">
                {label}
              </h2>
              <div className="flex items-center gap-1 mb-2">
                <Calendar size={8} className="text-slate-400 flex-shrink-0"/>
                <p className="text-slate-400 text-[9px] sm:text-[10px] truncate">{fmtTgl(tanggal_libur_mulai)}</p>
              </div>
              {fotos.length > 0 && <FotoBulat fotos={fotos} size={24}/>}
            </div>

            <div className="mt-2">
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                <motion.div
                  initial={{ width:0 }} animate={{ width:`${pct}%` }}
                  transition={{ duration:1.4, ease:'easeOut', delay:0.3 }}
                  className="h-full rounded-full relative overflow-hidden"
                  style={{ background:'linear-gradient(90deg,#10b981,#06b6d4)' }}>
                  <motion.div
                    animate={{ x:['-100%','200%'] }}
                    transition={{ duration:2, repeat:Infinity, ease:'linear', repeatDelay:1 }}
                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"/>
                </motion.div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[8px] sm:text-[9px]">Hari ini</span>
                <span className="text-slate-400 text-[8px] sm:text-[9px] truncate ml-1">{fmtShort(tanggal_libur_mulai)} · {durasi}h</span>
              </div>
            </div>
          </div>

          {/* Badge countdown kanan */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center px-3 sm:px-4 border-l border-slate-100 dark:border-slate-800 min-w-[56px]">
            <motion.p
              key={hariMulai}
              initial={{ scale:1.3, opacity:0 }} animate={{ scale:1, opacity:1 }}
              transition={{ type:'spring', stiffness:300 }}
              className="text-3xl sm:text-4xl font-black tabular-nums leading-none"
              style={{ background:'linear-gradient(135deg,#10b981,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              {hariMulai}
            </motion.p>
            <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1 text-center leading-tight">hari<br/>lagi</p>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}
