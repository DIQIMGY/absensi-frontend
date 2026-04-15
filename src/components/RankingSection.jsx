import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Award, Clock, AlertTriangle, Crown, Medal, Gem, Star,
  TrendingUp, AlertCircle, Sparkles, Flame, Zap, Target, Shield,
  UserCheck, Timer, AlertOctagon, ChevronUp
} from 'lucide-react'

const PODIUM_COLORS = [
  { bg: 'from-amber-400 to-yellow-500', shadow: 'shadow-amber-400/50', ring: 'ring-amber-400', text: 'text-amber-600', glow: '#f59e0b' },
  { bg: 'from-slate-400 to-slate-500', shadow: 'shadow-slate-400/50', ring: 'ring-slate-400', text: 'text-slate-500', glow: '#94a3b8' },
  { bg: 'from-orange-400 to-amber-600', shadow: 'shadow-orange-400/50', ring: 'ring-orange-400', text: 'text-orange-500', glow: '#f97316' },
]

const RANK_ICONS = [Crown, Medal, Gem]

function PodiumAvatar({ siswa, index, color, type }) {
  const RankIcon = RANK_ICONS[index] || null
  const sizes = index === 0 ? 'w-16 h-16' : index === 1 ? 'w-13 h-13' : 'w-12 h-12'
  const heights = index === 0 ? 'h-20' : index === 1 ? 'h-14' : 'h-10'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center gap-1"
    >
      {/* Crown / Medal */}
      {index === 0 && (
        <motion.div
          animate={{ y: [0, -4, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-amber-400 drop-shadow-lg"
        >
          <Crown size={22} fill="currentColor" />
        </motion.div>
      )}

      {/* Avatar */}
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.08 }}
          className={`relative ${index === 0 ? 'w-16 h-16' : index === 1 ? 'w-13 h-13' : 'w-12 h-12'}`}
          style={{ width: index === 0 ? 64 : index === 1 ? 52 : 48, height: index === 0 ? 64 : index === 1 ? 52 : 48 }}
        >
          {/* Glow ring */}
          <motion.div
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${color.bg} blur-md opacity-60`}
          />
          {siswa.foto_url || siswa.foto ? (
            <img
              src={siswa.foto_url || siswa.foto}
              alt={siswa.nama_lengkap}
              className={`relative z-10 w-full h-full rounded-full object-cover ring-2 ${color.ring} shadow-lg ${color.shadow}`}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.style && (e.target.nextElementSibling.style.display = 'flex') }}
            />
          ) : null}
          <div
            className={`relative z-10 w-full h-full rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center text-white font-bold ring-2 ${color.ring} shadow-lg ${color.shadow} ${siswa.foto_url || siswa.foto ? 'hidden' : 'flex'}`}
            style={{ fontSize: index === 0 ? 22 : 16 }}
          >
            {siswa.nama_lengkap?.charAt(0).toUpperCase()}
          </div>
        </motion.div>

        {/* Rank badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.4, type: 'spring' }}
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-800`}
        >
          <span className="text-white text-[9px] font-black">{index + 1}</span>
        </motion.div>
      </div>

      {/* Name */}
      <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 text-center max-w-[60px] truncate mt-1">
        {siswa.nama_lengkap?.split(' ')[0]}
      </p>

      {/* Score badge */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${color.bg} text-white text-[9px] font-bold shadow-sm`}
      >
        {type === 'rajin' && `${siswa.total_hadir}x`}
        {type === 'terlambat' && `${siswa.total_terlambat}x`}
        {type === 'alpha' && `${siswa.total_alpha}x`}
      </motion.div>

      {/* Podium block */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
        style={{ originY: 1, height: index === 0 ? 56 : index === 1 ? 40 : 28 }}
        className={`w-14 rounded-t-lg bg-gradient-to-b ${color.bg} opacity-80 shadow-inner`}
      />
    </motion.div>
  )
}

function RankingCard({ title, subtitle, data, icon: Icon, type, colorConfig, delay = 0 }) {
  const top3 = data.slice(0, 3)
  const rest = data.slice(3, 5)

  // Reorder for podium: 2nd, 1st, 3rd
  const podiumOrder = top3.length >= 2
    ? [top3[1], top3[0], top3[2]].filter(Boolean)
    : top3

  const podiumIndexMap = top3.length >= 2
    ? [1, 0, 2]
    : [0, 1, 2]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 120 }}
      className="relative group"
    >
      {/* Outer glow */}
      <div className={`absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-br ${colorConfig.glow}`} />

      <div className={`relative rounded-2xl overflow-hidden border ${colorConfig.border} shadow-lg hover:shadow-2xl transition-shadow duration-500`}>
        {/* Header gradient bg */}
        <div className={`relative bg-gradient-to-br ${colorConfig.headerBg} px-5 pt-5 pb-3`}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/10 translate-y-6 -translate-x-6" />

          {/* Animated top bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.6 }}
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorConfig.gradient}`}
          />

          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className={`p-2 rounded-xl ${colorConfig.iconBg} shadow-md`}
              >
                <Icon size={18} className={colorConfig.iconColor} />
              </motion.div>
              <div>
                <h3 className={`font-bold text-sm ${colorConfig.titleColor}`}>{title}</h3>
                <p className="text-[9px] text-white/60 flex items-center gap-1 mt-0.5">
                  <Sparkles size={8} />
                  {subtitle}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className={`px-2 py-1 rounded-full ${colorConfig.badgeBg} text-[9px] font-bold ${colorConfig.badgeText} flex items-center gap-1`}
            >
              <Flame size={9} />
              Top 5
            </motion.div>
          </div>

          {/* Podium */}
          {top3.length > 0 ? (
            <div className="flex items-end justify-center gap-2 pb-2">
              {podiumOrder.map((siswa, i) => (
                <PodiumAvatar
                  key={siswa.id}
                  siswa={siswa}
                  index={podiumIndexMap[i]}
                  color={PODIUM_COLORS[podiumIndexMap[i]]}
                  type={type}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-white/50">
              <AlertCircle size={28} className="mb-2" />
              <p className="text-xs">Belum ada data</p>
            </div>
          )}
        </div>

        {/* Rest list (rank 4 & 5) */}
        {rest.length > 0 && (
          <div className={`${colorConfig.listBg} px-4 py-3 space-y-2`}>
            {rest.map((siswa, i) => (
              <motion.div
                key={siswa.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.5 + i * 0.07 }}
                whileHover={{ x: 4 }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${colorConfig.listItem} transition-all`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black ${colorConfig.rankNumBg} ${colorConfig.rankNumText}`}>
                  {i + 4}
                </div>
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorConfig.avatarGrad} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                  {siswa.nama_lengkap?.charAt(0).toUpperCase()}
                </div>
                <p className={`flex-1 text-xs font-medium truncate ${colorConfig.listText}`}>
                  {siswa.nama_lengkap}
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorConfig.scoreBg} ${colorConfig.scoreText}`}>
                  {type === 'rajin' && `${siswa.total_hadir}x`}
                  {type === 'terlambat' && `${siswa.total_terlambat}x`}
                  {type === 'alpha' && `${siswa.total_alpha}x`}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className={`${colorConfig.footerBg} px-4 py-2 flex items-center justify-between`}>
          <div className={`flex items-center gap-1 text-[9px] ${colorConfig.footerText}`}>
            <UserCheck size={9} />
            <span>{data.length} siswa</span>
          </div>
          <div className={`flex items-center gap-1 text-[9px] ${colorConfig.footerText}`}>
            <Target size={9} />
            <span>Bulan ini</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const colorConfigs = {
  rajin: {
    headerBg: 'from-emerald-600 via-emerald-500 to-teal-500',
    gradient: 'from-emerald-400 to-teal-400',
    glow: 'from-emerald-500/40 to-teal-500/40',
    border: 'border-emerald-200/40 dark:border-emerald-700/40',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    titleColor: 'text-white',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    listBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    listItem: 'hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30',
    listText: 'text-emerald-900 dark:text-emerald-100',
    rankNumBg: 'bg-emerald-200 dark:bg-emerald-800',
    rankNumText: 'text-emerald-700 dark:text-emerald-300',
    avatarGrad: 'from-emerald-500 to-teal-500',
    scoreBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    scoreText: 'text-emerald-700 dark:text-emerald-300',
    footerBg: 'bg-emerald-100/60 dark:bg-emerald-900/30',
    footerText: 'text-emerald-600 dark:text-emerald-400',
  },
  terlambat: {
    headerBg: 'from-amber-500 via-orange-500 to-yellow-500',
    gradient: 'from-amber-400 to-yellow-400',
    glow: 'from-amber-500/40 to-orange-500/40',
    border: 'border-amber-200/40 dark:border-amber-700/40',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    titleColor: 'text-white',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    listBg: 'bg-amber-50 dark:bg-amber-950/40',
    listItem: 'hover:bg-amber-100/80 dark:hover:bg-amber-900/30',
    listText: 'text-amber-900 dark:text-amber-100',
    rankNumBg: 'bg-amber-200 dark:bg-amber-800',
    rankNumText: 'text-amber-700 dark:text-amber-300',
    avatarGrad: 'from-amber-500 to-orange-500',
    scoreBg: 'bg-amber-100 dark:bg-amber-900/50',
    scoreText: 'text-amber-700 dark:text-amber-300',
    footerBg: 'bg-amber-100/60 dark:bg-amber-900/30',
    footerText: 'text-amber-600 dark:text-amber-400',
  },
  alpha: {
    headerBg: 'from-rose-600 via-red-500 to-pink-500',
    gradient: 'from-rose-400 to-pink-400',
    glow: 'from-rose-500/40 to-pink-500/40',
    border: 'border-rose-200/40 dark:border-rose-700/40',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    titleColor: 'text-white',
    badgeBg: 'bg-white/20',
    badgeText: 'text-white',
    listBg: 'bg-rose-50 dark:bg-rose-950/40',
    listItem: 'hover:bg-rose-100/80 dark:hover:bg-rose-900/30',
    listText: 'text-rose-900 dark:text-rose-100',
    rankNumBg: 'bg-rose-200 dark:bg-rose-800',
    rankNumText: 'text-rose-700 dark:text-rose-300',
    avatarGrad: 'from-rose-500 to-pink-500',
    scoreBg: 'bg-rose-100 dark:bg-rose-900/50',
    scoreText: 'text-rose-700 dark:text-rose-300',
    footerBg: 'bg-rose-100/60 dark:bg-rose-900/30',
    footerText: 'text-rose-600 dark:text-rose-400',
  },
}

export default function RankingSection({ ranking, currentSiswaId }) {
  if (!ranking) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 8 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative p-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl shadow-lg shadow-amber-400/40"
          >
            <Trophy size={22} className="text-white" fill="white" />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full border-2 border-white"
            />
          </motion.div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Ranking Siswa{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Bulan Ini
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Sparkles size={10} className="text-amber-400" />
              Berdasarkan data kehadiran 30 hari terakhir
            </p>
          </div>
        </motion.div>

        {/* Legend pills */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:flex items-center gap-2"
        >
          {[
            { label: 'Rajin', color: 'bg-emerald-500' },
            { label: 'Terlambat', color: 'bg-amber-500' },
            { label: 'Alpha', color: 'bg-rose-500' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RankingCard
          title="Paling Rajin"
          subtitle="Kehadiran tertinggi"
          data={ranking.siswa_rajin || []}
          icon={Award}
          type="rajin"
          colorConfig={colorConfigs.rajin}
          delay={0.1}
        />
        <RankingCard
          title="Sering Terlambat"
          subtitle="Keterlambatan terbanyak"
          data={ranking.siswa_terlambat || []}
          icon={Timer}
          type="terlambat"
          colorConfig={colorConfigs.terlambat}
          delay={0.2}
        />
        <RankingCard
          title="Sering Alpha"
          subtitle="Ketidakhadiran terbanyak"
          data={ranking.siswa_alpha || []}
          icon={AlertOctagon}
          type="alpha"
          colorConfig={colorConfigs.alpha}
          delay={0.3}
        />
      </div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50"
      >
        <Shield size={11} className="text-slate-400" />
        <p className="text-[9px] text-slate-500 dark:text-slate-400">
          Ranking diperbarui otomatis setiap hari berdasarkan data absensi
        </p>
      </motion.div>
    </motion.div>
  )
}
