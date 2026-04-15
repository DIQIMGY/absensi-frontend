import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, TrendingUp } from 'lucide-react'
import { siswaApi } from '../services/siswaService'

function Logo({ src, nama, size, glow = false }) {
  const [err, setErr] = useState(false)
  return (
    <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-white dark:bg-slate-800"
      style={{
        width: size, height: size,
        boxShadow: glow
          ? '0 0 0 2.5px #6366f1, 0 6px 20px rgba(99,102,241,0.3)'
          : '0 0 0 1.5px rgba(99,102,241,0.15)',
      }}>
      {src && !err
        ? <img src={src} alt={nama} className="w-full h-full object-contain p-0.5" onError={() => setErr(true)} />
        : <GraduationCap size={Math.round(size * 0.38)} className="text-slate-300 dark:text-slate-600" />}
    </div>
  )
}

export default function TopKampus({ refreshKey = 0 }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    setLoading(true)
    siswaApi.getTopKampus()
      .then(r => setList(r.data.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse" style={{ height: 240 }} />
  )
  if (!list.length) return null

  const maxTotal = list[0]?.total || 1
  const totalSiswa = list.reduce((s, i) => s + i.total, 0)
  const BAR_MAX_H = 100
  // circle sizes: rank 1 biggest, decreasing
  const circleSize = (i) => Math.max(16, 32 - i * 1.6)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

      {/* accent */}
      <div className="h-0.5 bg-gradient-to-r from-violet-500 via-indigo-400 to-blue-400" />

      {/* subtle dot grid bg */}
      <div className="absolute inset-0 opacity-[0.018] dark:opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative px-5 pt-4 pb-5">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <TrendingUp size={12} className="text-violet-500" />
              <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Top Kampus</span>
              {/* 5 foto bulat kecil */}
              <div className="flex items-center">
                {list.slice(0, 5).map((item, i) => (
                  <motion.div key={item.nama_kampus}
                    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ marginLeft: i === 0 ? 4 : -5, zIndex: 5 - i }}>
                    <Logo src={item.foto_url} nama={item.nama_kampus} size={18} glow={i === 0} />
                  </motion.div>
                ))}
              </div>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Kampus Terpopuler</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              <span className="font-bold text-slate-600 dark:text-slate-300">{totalSiswa}</span> siswa telah memilih kampus impian
            </p>
          </div>

          {/* #1 highlight card */}
          {list[0] && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-2xl border"
              style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.2)' }}>
              <Logo src={list[0].foto_url} nama={list[0].nama_kampus} size={32} glow />
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-violet-500 uppercase tracking-widest leading-none mb-0.5">Terpopuler</p>
                <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[90px] leading-tight">{list[0].nama_kampus}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{list[0].total} siswa</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── BAR CHART: circle di atas + bar vertikal ── */}
        <div className="flex items-end gap-1.5" style={{ height: BAR_MAX_H + circleSize(0) + 8 }}>
          {list.map((item, i) => {
            const barH  = Math.max(4, Math.round((item.total / maxTotal) * BAR_MAX_H))
            const cSize = circleSize(i)
            const isTop = i === 0
            const isHov = hovered === i
            const barAlpha = Math.max(0.12, 0.65 - i * 0.055)

            return (
              <motion.div key={item.nama_kampus}
                className="flex flex-col items-center flex-1 min-w-0 cursor-default relative"
                style={{ gap: 4 }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.08 + i * 0.04 }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}>

                {/* tooltip */}
                <AnimatePresence>
                  {isHov && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute z-30 pointer-events-none"
                      style={{ bottom: '100%', marginBottom: 6 }}>
                      <div className="bg-slate-900 dark:bg-slate-700 text-white rounded-xl px-2.5 py-1.5 shadow-xl whitespace-nowrap text-center">
                        <p className="text-[10px] font-bold truncate max-w-[100px]">{item.nama_kampus}</p>
                        <p className="text-[11px] font-black text-violet-300">{item.total} siswa</p>
                      </div>
                      <div className="w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45 mx-auto -mt-1" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* circle */}
                <motion.div animate={{ scale: isHov ? 1.12 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                  <Logo src={item.foto_url} nama={item.nama_kampus} size={cSize} glow={isTop} />
                </motion.div>

                {/* bar */}
                <div className="w-full flex items-end rounded-t-lg overflow-hidden" style={{ height: BAR_MAX_H }}>
                  <motion.div className="w-full rounded-t-lg"
                    initial={{ height: 0 }}
                    animate={{ height: isHov ? Math.min(barH + 4, BAR_MAX_H) : barH }}
                    transition={{ duration: isHov ? 0.15 : 0.85, ease: isHov ? 'easeOut' : [0.25, 0.46, 0.45, 0.94], delay: isHov ? 0 : 0.2 + i * 0.04 }}
                    style={{
                      background: isTop
                        ? 'linear-gradient(to top, #4338ca, #818cf8)'
                        : isHov
                          ? `rgba(99,102,241,${Math.min(barAlpha + 0.2, 0.7)})`
                          : `rgba(99,102,241,${barAlpha})`,
                    }} />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── FOOTER: top 3 names ── */}
        <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/80 flex items-center gap-3 overflow-hidden">
          {list.slice(0, 3).map((item, i) => (
            <div key={item.nama_kampus} className="flex items-center gap-1.5 min-w-0 flex-1">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: i === 0 ? '#6366f1' : i === 1 ? '#a5b4fc' : '#c7d2fe' }} />
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">{item.nama_kampus}</p>
              <span className="text-[10px] font-black flex-shrink-0"
                style={{ color: i === 0 ? '#6366f1' : '#a5b4fc' }}>{item.total}</span>
            </div>
          ))}
        </div>

      </div>
    </motion.div>
  )
}
