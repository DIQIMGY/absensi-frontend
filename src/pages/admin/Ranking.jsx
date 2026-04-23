import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, TrendingDown, Award, Calendar,
  Crown, Clock, Users, CheckCircle, XCircle,
  RefreshCw, ChevronDown, GraduationCap, Info,
} from 'lucide-react'
import { adminApi } from '../../services/adminService'
import toast from 'react-hot-toast'

const BULAN = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]

const TAHUN = [2024, 2025, 2026]

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ src, name, size = 36, gradient = 'from-indigo-500 to-violet-600' }) => {
  const [err, setErr] = useState(false)
  const initial = (name || '?').charAt(0).toUpperCase()
  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center font-bold text-white flex-shrink-0 bg-gradient-to-br ${gradient}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {src && !err
        ? <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} />
        : initial}
    </div>
  )
}

// ── Podium top-3 ──────────────────────────────────────────────────────────────
const PODIUM_CFG = [
  { rank: 1, icon: Crown,  ring: 'ring-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20',   num: 'text-amber-600 dark:text-amber-400',   bar: 'h-20 bg-gradient-to-t from-amber-400 to-amber-300',   label: 'bg-amber-400',   gradient: 'from-amber-500 to-orange-400' },
  { rank: 2, icon: Award,  ring: 'ring-slate-400',   bg: 'bg-slate-50 dark:bg-slate-800/60',   num: 'text-slate-500 dark:text-slate-400',   bar: 'h-14 bg-gradient-to-t from-slate-400 to-slate-300',   label: 'bg-slate-400',   gradient: 'from-slate-500 to-slate-400' },
  { rank: 3, icon: Trophy, ring: 'ring-orange-400',  bg: 'bg-orange-50 dark:bg-orange-900/20', num: 'text-orange-600 dark:text-orange-400', bar: 'h-10 bg-gradient-to-t from-orange-400 to-orange-300', label: 'bg-orange-400',  gradient: 'from-orange-500 to-amber-400' },
]

const PodiumBlock = ({ siswa, cfg, type }) => {
  const Icon = cfg.icon
  const val = type === 'rajin'
    ? `${siswa.total_hadir}× · ${siswa.persentase_kehadiran}%`
    : type === 'terlambat'
    ? `${siswa.total_terlambat}×`
    : `${siswa.total_alpha}×`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: cfg.rank * 0.08, type: 'spring', stiffness: 120 }}
      className="flex flex-col items-center gap-2"
    >
      {/* Avatar + icon */}
      <div className="relative">
        <div className={`ring-2 ${cfg.ring} ring-offset-2 ring-offset-white dark:ring-offset-slate-900 rounded-full`}>
          <Avatar src={siswa.foto_url || siswa.foto} name={siswa.nama_lengkap} size={cfg.rank === 1 ? 52 : 44} gradient={cfg.gradient} />
        </div>
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${cfg.label} flex items-center justify-center shadow-sm`}>
          <Icon size={10} className="text-white" />
        </div>
      </div>
      {/* Name */}
      <div className="text-center max-w-[80px]">
        <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">{siswa.nama_lengkap}</p>
        <p className="text-[9px] text-slate-400 truncate">{siswa.kelas?.nama_kelas || '-'}</p>
      </div>
      {/* Value */}
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.num} border border-current/20`}>{val}</span>
      {/* Podium bar */}
      <div className={`w-16 rounded-t-lg ${cfg.bar} flex items-end justify-center pb-1`}>
        <span className="text-white font-black text-sm">{cfg.rank}</span>
      </div>
    </motion.div>
  )
}

// ── Row item rank 4+ ──────────────────────────────────────────────────────────
const RankRow = ({ siswa, index, type }) => {
  const val = type === 'rajin'
    ? { text: `${siswa.total_hadir}×`, sub: `${siswa.persentase_kehadiran}% hadir`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
    : type === 'terlambat'
    ? { text: `${siswa.total_terlambat}×`, sub: 'terlambat', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' }
    : { text: `${siswa.total_alpha}×`, sub: 'alpha', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
    >
      <span className="w-5 text-center text-xs font-bold text-slate-400 tabular-nums flex-shrink-0">{index + 4}</span>
      <Avatar src={siswa.foto_url || siswa.foto} name={siswa.nama_lengkap} size={32} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{siswa.nama_lengkap}</p>
        <p className="text-[10px] text-slate-400 truncate">{siswa.kelas?.nama_kelas || '-'}</p>
      </div>
      <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${val.bg} ${val.color}`}>
        {val.text}
      </div>
    </motion.div>
  )
}

// ── Ranking Card ──────────────────────────────────────────────────────────────
const CARD_CFG = {
  rajin:     { title: 'Paling Rajin',    icon: CheckCircle, accent: '#10b981', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800/40', topBar: 'bg-emerald-500' },
  terlambat: { title: 'Sering Terlambat', icon: Clock,       accent: '#f59e0b', iconBg: 'bg-amber-50 dark:bg-amber-900/30',   iconColor: 'text-amber-600 dark:text-amber-400',   border: 'border-amber-100 dark:border-amber-800/40',   topBar: 'bg-amber-500' },
  alpha:     { title: 'Sering Alpha',    icon: XCircle,     accent: '#ef4444', iconBg: 'bg-rose-50 dark:bg-rose-900/30',     iconColor: 'text-rose-600 dark:text-rose-400',     border: 'border-rose-100 dark:border-rose-800/40',     topBar: 'bg-rose-500' },
}

// ── Warning Row (untuk terlambat & alpha) ────────────────────────────────────
const WarningRow = ({ siswa, index, type, maxVal }) => {
  const isTerlambat = type === 'terlambat'
  const val = isTerlambat ? siswa.total_terlambat : siswa.total_alpha
  const pct = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0

  const numCfg = index === 0
    ? 'text-slate-800 dark:text-slate-100 font-black'
    : index === 1
    ? 'text-slate-600 dark:text-slate-300 font-bold'
    : 'text-slate-400 font-semibold'

  const barColor  = isTerlambat ? 'bg-amber-400' : 'bg-rose-400'
  const badgeCfg  = isTerlambat
    ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/40'
    : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700/40'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
    >
      {/* rank */}
      <span className={`w-5 text-center text-xs tabular-nums flex-shrink-0 ${numCfg}`}>{index + 1}</span>

      {/* avatar */}
      <Avatar
        src={siswa.foto_url || siswa.foto}
        name={siswa.nama_lengkap}
        size={36}
        gradient={isTerlambat ? 'from-amber-400 to-orange-500' : 'from-rose-400 to-red-500'}
      />

      {/* name + bar */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">{siswa.nama_lengkap}</p>
        <p className="text-[10px] text-slate-400 truncate mb-1.5">{siswa.kelas?.nama_kelas || '-'}</p>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.2 + index * 0.05, duration: 0.7, ease: 'easeOut' }}
            className={`h-full rounded-full ${barColor}`}
          />
        </div>
      </div>

      {/* count */}
      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums flex-shrink-0 ${badgeCfg}`}>
        {val}×
      </span>
    </motion.div>
  )
}

const RankingCard = ({ data = [], type, delay = 0 }) => {
  const cfg = CARD_CFG[type]
  const Icon = cfg.icon
  const isPodium = type === 'rajin'

  const top3 = data.slice(0, 3)
  const rest = data.slice(3)
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumCfgs  = [PODIUM_CFG[1], PODIUM_CFG[0], PODIUM_CFG[2]]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 110 }}
      className={`relative overflow-hidden bg-white dark:bg-slate-900 border ${cfg.border} rounded-2xl shadow-sm flex flex-col`}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${cfg.topBar}`} />

      {/* header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
          <Icon size={17} className={cfg.iconColor} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{cfg.title}</p>
          <p className="text-[10px] text-slate-400">{data.length} siswa tercatat</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-5 gap-3 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Users size={20} className="text-slate-400" />
          </div>
          <p className="text-xs text-slate-400">Belum ada data periode ini</p>
        </div>
      ) : isPodium ? (
        <>
          {/* Podium top 3 — hanya untuk "rajin" */}
          <div className="px-5 pb-4">
            <div className="flex items-end justify-center gap-3">
              {podiumOrder.map((siswa, i) => siswa && (
                <PodiumBlock key={siswa.id} siswa={siswa} cfg={podiumCfgs[i]} type={type} />
              ))}
            </div>
          </div>
          {rest.length > 0 && <div className="mx-5 border-t border-slate-100 dark:border-slate-800 mb-1" />}
          {rest.length > 0 && (
            <div className="px-2 pb-3">
              {rest.map((siswa, i) => <RankRow key={siswa.id} siswa={siswa} index={i} type={type} />)}
            </div>
          )}
        </>
      ) : (
        /* Warning list — untuk terlambat & alpha */
        <div className="px-2 pb-3">
          {data.map((siswa, i) => {
            const maxVal = data[0]
              ? (type === 'terlambat' ? data[0].total_terlambat : data[0].total_alpha)
              : 1
            return <WarningRow key={siswa.id} siswa={siswa} index={i} type={type} maxVal={maxVal} />
          })}
        </div>
      )}
    </motion.div>
  )
}

// ── Stat mini card ────────────────────────────────────────────────────────────
const MiniStat = ({ label, value, color, bg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`${bg} rounded-2xl p-4 flex flex-col gap-1`}
  >
    <p className={`text-2xl font-black tabular-nums leading-none ${color}`}>{value}</p>
    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{label}</p>
  </motion.div>
)

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Ranking() {
  const [loading, setLoading] = useState(false)
  const [rankingData, setRankingData] = useState(null)
  const [bulan, setBulan] = useState(new Date().getMonth() + 1)
  const [tahun, setTahun] = useState(new Date().getFullYear())

  useEffect(() => { fetchRanking() }, [bulan, tahun])

  const fetchRanking = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getRankingSiswa({ bulan, tahun })
      setRankingData(res.data.data)
    } catch {
      toast.error('Gagal memuat data ranking')
    } finally {
      setLoading(false)
    }
  }

  const bulanLabel = BULAN[bulan - 1]

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
            <Trophy size={17} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Ranking Siswa</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Peringkat kehadiran & kedisiplinan · {bulanLabel} {tahun}</p>
          </div>
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
            <Calendar size={13} className="text-slate-400 flex-shrink-0" />
            <select
              value={bulan}
              onChange={e => setBulan(Number(e.target.value))}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 border-none focus:ring-0 py-0 pr-1 cursor-pointer"
            >
              {BULAN.map((b, i) => <option key={i} value={i + 1}>{b}</option>)}
            </select>
            <select
              value={tahun}
              onChange={e => setTahun(Number(e.target.value))}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 border-none focus:ring-0 py-0 pr-1 cursor-pointer"
            >
              {TAHUN.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={fetchRanking} disabled={loading}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw size={13} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Memuat ranking...</p>
          </div>
        </div>
      )}

      {!loading && rankingData && (
        <>
          {/* ── Mini Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Total Siswa"   value={rankingData.total_siswa || 0}                        color="text-slate-800 dark:text-slate-100"          bg="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl" delay={0} />
            <MiniStat label="Siswa Rajin"   value={rankingData.siswa_rajin?.length || 0}                color="text-emerald-600 dark:text-emerald-400"       bg="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl" delay={0.05} />
            <MiniStat label="Sering Terlambat" value={rankingData.siswa_sering_terlambat?.length || 0} color="text-amber-600 dark:text-amber-400"           bg="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-2xl" delay={0.1} />
            <MiniStat label="Sering Alpha"  value={rankingData.siswa_sering_alpha?.length || 0}         color="text-rose-600 dark:text-rose-400"             bg="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 rounded-2xl" delay={0.15} />
          </div>

          {/* ── Ranking Cards ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <RankingCard data={rankingData.siswa_rajin?.slice(0, 8) || []}                                                                                                    type="rajin"     delay={0.1} />
            <RankingCard data={[...(rankingData.siswa_sering_terlambat || [])].sort((a,b) => b.total_terlambat - a.total_terlambat).slice(0, 8)} type="terlambat" delay={0.15} />
            <RankingCard data={[...(rankingData.siswa_sering_alpha || [])].sort((a,b) => b.total_alpha - a.total_alpha).slice(0, 8)}             type="alpha"     delay={0.2} />
          </div>

          {/* ── Info note ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info size={13} className="text-violet-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Data ranking dihitung berdasarkan rekap kehadiran siswa pada periode <span className="font-semibold text-slate-700 dark:text-slate-300">{bulanLabel} {tahun}</span>.
              Penilaian meliputi total kehadiran, keterlambatan, dan ketidakhadiran tanpa keterangan (alpha).
            </p>
          </motion.div>
        </>
      )}

      {!loading && !rankingData && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap size={28} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada data untuk periode ini</p>
        </div>
      )}
    </div>
  )
}
