import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays } from 'lucide-react'

const IKON_MAP = {
  ujian: '📝', ulangan: '📋', lomba: '🏆', wisuda: '🎓',
  libur: '🏖️', rapat: '📅', olahraga: '⚽', seni: '🎨', default: '📌',
}

const GRAD = {
  merah:  ['#ff6b6b','#ee0979'], oranye: ['#f97316','#ea580c'],
  kuning: ['#fbbf24','#f59e0b'], hijau:  ['#10b981','#059669'],
  biru:   ['#60a5fa','#3b82f6'], ungu:   ['#a78bfa','#7c3aed'],
  pink:   ['#f472b6','#db2777'], default:['#818cf8','#6366f1'],
}

function hitungHari(t) {
  const a = new Date(); a.setHours(0,0,0,0)
  const b = new Date(t); b.setHours(0,0,0,0)
  return Math.round((b - a) / 86400000)
}
function fmtTgl(d) {
  return new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
}

export default function EventCountdown({ events = [], eventFotos = [] }) {
  const [active, setActive] = useState(0)

  const list = useMemo(() => {
    if (!Array.isArray(events)) return []
    return events
      .map((e, i) => ({ ...e, _foto: eventFotos[i] || null }))
      .filter(e => e.tanggal && hitungHari(e.tanggal) >= 0)
      .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
      .slice(0, 5)
  }, [events, eventFotos])

  if (list.length === 0) return null

  const cur   = list[Math.min(active, list.length - 1)]
  const hari  = hitungHari(cur.tanggal)
  const today = hari === 0
  const ikon  = IKON_MAP[cur.ikon] || IKON_MAP.default
  const [c1, c2] = GRAD[cur.warna] || GRAD.default
  const hasFoto = !!cur._foto

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className="relative overflow-hidden rounded-2xl group w-full"
      style={{ minHeight: 150 }}
    >
      {/* ── Background ── */}
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          transition={{ duration: 0.3 }} className="absolute inset-0">
          {hasFoto
            ? <img src={cur._foto} alt="" className="w-full h-full object-cover"/>
            : <div className="w-full h-full"
                style={{ background: `linear-gradient(135deg, ${c1}30 0%, ${c2}60 100%)` }}/>
          }
        </motion.div>
      </AnimatePresence>

      {/* Full overlay — gelap merata agar semua teks terbaca */}
      <div className="absolute inset-0"
        style={{ background: hasFoto
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.82) 100%)'
          : `linear-gradient(135deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 100%)`
        }}/>

      {/* ── Content — full height flex ── */}
      <div className="relative z-10 flex flex-col justify-between h-full p-3 sm:p-4" style={{ minHeight: 150 }}>

        {/* Top: badge + dot nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{ background: hasFoto ? 'rgba(0,0,0,0.35)' : `${c1}25`,
                     backdropFilter: hasFoto ? 'blur(6px)' : 'none' }}>
            <div className="w-4 h-4 rounded flex items-center justify-center"
              style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
              <CalendarDays size={9} className="text-white"/>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white">
              Event Mendatang
            </span>
          </div>

          {list.length > 1 && (
            <div className="flex items-center gap-1">
              {list.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className="transition-all duration-200 rounded-full"
                  style={{
                    width: i === active ? 14 : 4, height: 4,
                    background: i === active
                      ? `linear-gradient(90deg,${c1},${c2})`
                      : 'rgba(255,255,255,0.4)',
                  }}/>
              ))}
            </div>
          )}
        </div>

        {/* Bottom: countdown + info */}
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-5 }} transition={{ duration: 0.18 }}>

            {/* Angka countdown */}
            <div className="flex items-end gap-2 mb-2">
              {today ? (
                <span className="text-4xl leading-none">🎯</span>
              ) : (
                <>
                  <motion.span key={hari}
                    initial={{ scale:1.2, opacity:0 }} animate={{ scale:1, opacity:1 }}
                    className="text-4xl sm:text-5xl font-black tabular-nums leading-none"
                    style={hasFoto
                      ? { color:'#fff', textShadow:'0 2px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' }
                      : { background:`linear-gradient(135deg,${c1},${c2})`,
                          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }
                    }>
                    {hari}
                  </motion.span>
                  <div className="mb-1.5">
                    <p className={`text-xs font-bold leading-none ${hasFoto ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}
                      style={hasFoto ? { textShadow:'0 1px 4px rgba(0,0,0,0.8)' } : {}}>hari</p>
                    <p className={`text-[9px] font-semibold uppercase tracking-widest ${hasFoto ? 'text-white/80' : 'text-slate-400'}`}
                      style={hasFoto ? { textShadow:'0 1px 4px rgba(0,0,0,0.8)' } : {}}>lagi</p>
                  </div>
                </>
              )}
              {/* Ikon dekoratif saat tidak ada foto */}
              {!hasFoto && (
                <span className="ml-auto text-3xl opacity-20 select-none leading-none">{ikon}</span>
              )}
            </div>

            {/* Nama event */}
            <p className={`text-xs sm:text-sm font-black leading-tight mb-1 line-clamp-2 ${hasFoto ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}
              style={hasFoto ? { textShadow:'0 1px 6px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.7)' } : {}}>
              {cur.nama}
            </p>

            {/* Tanggal + progress */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background:`linear-gradient(135deg,${c1},${c2})` }}/>
              <p className={`text-[9px] sm:text-[10px] flex-1 font-medium truncate ${hasFoto ? 'text-white/85' : 'text-slate-400'}`}
                style={hasFoto ? { textShadow:'0 1px 4px rgba(0,0,0,0.8)' } : {}}>
                {fmtTgl(cur.tanggal)}
              </p>
            </div>

            {/* Progress bar */}
            {!today && hari <= 30 && (
              <div className={`mt-2.5 w-full h-1 rounded-full overflow-hidden ${hasFoto ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <motion.div key={active}
                  initial={{ width:0 }}
                  animate={{ width:`${Math.max(4, Math.round((1 - hari/30)*100))}%` }}
                  transition={{ duration:1.2, ease:'easeOut', delay:0.2 }}
                  className="h-full rounded-full"
                  style={{ background: hasFoto
                    ? 'rgba(255,255,255,0.75)'
                    : `linear-gradient(90deg,${c1},${c2})` }}/>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
