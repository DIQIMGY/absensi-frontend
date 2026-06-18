import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  Crown, Medal, Trophy,
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  School,
  RefreshCw,
  ChevronRight,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  FileText,
  Heart,
  CheckCircle,
  XCircle,
  Star,
  Users2,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Zap,
  Gauge,
  Target,
  Waves,
  CircleDot,
  TrendingDown,
  BookOpen,
  GraduationCap,
  Bell,
  MapPin,
  Percent,
  Hash,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  LineChart as ReLineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Treemap,
  ScatterChart,
  Scatter,
  ZAxis,
  Funnel,
  FunnelChart,
  LabelList,
  ComposedChart,
  Legend,
} from 'recharts'
import { adminApi } from '../../services/adminService'
import DashboardVideo from '../../components/DashboardVideo'
import { useThemeStore } from '../../stores/themeStore'

// -- Avatar component · handles broken images gracefully ----------------------
const Avatar = ({ src, name, size = 36, className = '', style = {} }) => {
  const [imgError, setImgError] = useState(false)
  const initial = (name || '?').charAt(0).toUpperCase()
  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size > 48 ? Math.round(size * 0.35) : Math.round(size * 0.4), ...style }}
    >
      {src && !imgError
        ? <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        : <span>{initial}</span>
      }
    </div>
  )
}

// Color palette EMERALD + Accents
const COLORS = {
  hadir: '#10B981',
  terlambat: '#F59E0B',
  izin: '#8B5CF6',
  sakit: '#A855F7',
  alpha: '#EF4444',
  pending: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
  chart: {
    hadir: '#10B981',
    terlambat: '#F59E0B',
    izin: '#8B5CF6',
    sakit: '#A855F7',
    alpha: '#EF4444'
  }
}

const gradientColors = {
  hadir: 'from-[#10B981] to-[#059669]',
  terlambat: 'from-[#F59E0B] to-[#D97706]',
  izin: 'from-[#8B5CF6] to-[#7C3AED]',
  sakit: 'from-[#A855F7] to-[#9333EA]',
  alpha: 'from-[#EF4444] to-[#DC2626]',
  pending: 'from-[#F59E0B] to-[#D97706]',
  approved: 'from-[#10B981] to-[#059669]'
}

// Modern Gauge Chart dengan EMERALD
const ModernGaugeChart = ({ percentage, color = '#10B981', size = 'md' }) => {
  const data = [
    { name: 'Progress', value: percentage, fill: color },
    { name: 'Remaining', value: 100 - percentage, fill: 'transparent' }
  ]
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }
  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          barSize={8}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <defs>
            <filter id={`gauge-glow-${color.replace('#', '')}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <RadialBar
            background={{ fill: '#E2E8F0', opacity: 0.15 }}
            dataKey="value"
            cornerRadius={4}
            animationDuration={1200}
            animationEasing="ease-in-out"
            filter={`url(#gauge-glow-${color.replace('#', '')})`}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="text-[9px] sm:text-[10px] font-bold"
          style={{ color }}
        >
          {percentage}%
        </motion.span>
      </div>
    </div>
  )
}

// Modern Wave Chart dengan EMERALD
const ModernWaveChart = ({ data, color = '#10B981' }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`waveGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
          <stop offset="70%" stopColor={color} stopOpacity={0.05}/>
        </linearGradient>
        <filter id={`wave-glow-${color.replace('#', '')}`}>
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <Area
        type="monotone"
        dataKey="value"
        stroke={color}
        strokeWidth={2}
        fill={`url(#waveGradient-${color.replace('#', '')})`}
        dot={false}
        animationDuration={1000}
        animationEasing="ease-in-out"
        filter={`url(#wave-glow-${color.replace('#', '')})`}
      />
    </AreaChart>
  </ResponsiveContainer>
)

// Modern Bar Sparkline dengan EMERALD
const ModernBarSparkline = ({ data, color = '#10B981' }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
      <defs>
        <linearGradient id={`barGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
          <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
        </linearGradient>
      </defs>
      <Bar
        dataKey="value"
        fill={`url(#barGradient-${color.replace('#', '')})`}
        radius={[2, 2, 0, 0]}
        animationDuration={800}
        animationEasing="ease-out"
        maxBarSize={6}
      />
    </BarChart>
  </ResponsiveContainer>
)

// Modern Scatter Dots dengan EMERALD
const ModernScatterDots = ({ data, color = '#10B981' }) => {
  const scatterData = data.map((item, index) => ({
    x: index,
    y: item.value,
    z: item.value
  }))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`dotGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
            <stop offset="100%" stopColor={color} stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <Scatter
          data={scatterData}
          fill={`url(#dotGradient-${color.replace('#', '')})`}
          shape="circle"
          animationDuration={800}
        >
          {scatterData.map((entry, index) => (
            <Cell key={`cell-${index}`} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// Modern Funnel Chart dengan EMERALD
const ModernFunnelChart = ({ data, color = '#10B981' }) => {
  const funnelData = data.map((item, index) => ({
    value: item.value,
    name: `level-${index}`,
    fill: color
  })).reverse()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <filter id={`funnel-glow-${color.replace('#', '')}`}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <Funnel
          dataKey="value"
          data={funnelData}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
          shape="rectangle"
          filter={`url(#funnel-glow-${color.replace('#', '')})`}
        >
          {funnelData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={color} opacity={0.9 - index * 0.15} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  )
}

// Enhanced StatCard · tiap card punya chart type berbeda
const EnhancedStatCard = ({
  title, value, icon: Icon, gradient,
  subtitle, trend, trendUp, delay,
  chartType = 'bar', chartData = [],
  glowColor = '#10B981',
}) => {
  const { isDark } = useThemeStore()
  const fallback = [{value:2},{value:5},{value:3},{value:7},{value:4},{value:6},{value:5},{value:8}]
  const d = chartData.length ? chartData : fallback
  const uid = glowColor.replace('#','')
  const color = glowColor

  const renderMiniChart = () => {
    if (chartType === 'area') return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={d} margin={{top:2,right:0,left:0,bottom:0}}>
          <defs>
            <linearGradient id={`mc-a-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5}
            fill={`url(#mc-a-${uid})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    )
    if (chartType === 'line') return (
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={d} margin={{top:2,right:0,left:0,bottom:0}}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2}
            dot={{ r: 2, fill: color, strokeWidth: 0 }}
            activeDot={false} />
        </ReLineChart>
      </ResponsiveContainer>
    )
    if (chartType === 'step') return (
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={d} margin={{top:2,right:0,left:0,bottom:0}}>
          <Line type="stepAfter" dataKey="value" stroke={color} strokeWidth={2}
            dot={false} activeDot={false} />
        </ReLineChart>
      </ResponsiveContainer>
    )
    if (chartType === 'bar') return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={d} margin={{top:2,right:0,left:0,bottom:0}} barCategoryGap="20%">
          <defs>
            <linearGradient id={`mc-b-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <Bar dataKey="value" fill={`url(#mc-b-${uid})`} radius={[2,2,0,0]} maxBarSize={8} />
        </BarChart>
      </ResponsiveContainer>
    )
    // 'dot' · scatter-like dots
    return (
      <div className="flex items-end justify-between h-full w-full gap-[3px]">
        {d.slice(-8).map((item, i) => {
          const max = Math.max(...d.map(x => x.value), 1)
          const size = Math.max(3, Math.round((item.value / max) * 10))
          return (
            <div key={i} className="flex-1 flex items-end justify-center">
              <div className="rounded-full" style={{ width: size, height: size, backgroundColor: color, opacity: 0.5 + (i / d.length) * 0.5 }} />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.15 } }}
    >
      <div
        className="relative overflow-hidden rounded-2xl backdrop-blur-md border shadow-lg hover:shadow-xl transition-all"
        style={{
          height: 114,
          background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)',
          boxShadow: `0 4px 20px ${color}15, inset 0 1px 0 rgba(255,255,255,0.15)`
        }}>
        {/* Top color accent */}
        <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${gradient}`} />
        {/* Subtle glow bg */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.06] pointer-events-none`} />
        {/* Corner glow */}
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)` }} />

        <div className="relative z-10 flex items-center justify-between h-full px-4">
          {/* Left: icon + mini chart */}
          <div className="flex flex-col justify-between h-full py-3.5 w-[62px]">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} w-fit shadow-md`}
              style={{ boxShadow: `0 4px 12px ${color}40` }}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="h-[30px] w-full">
              {renderMiniChart()}
            </div>
          </div>

          {/* Right: value + label */}
          <div className="text-right flex-1 pl-2">
            <p className={`text-3xl font-black tabular-nums leading-none drop-shadow-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{title}</p>
            {subtitle && <p className={`text-[10px] mt-0.5 ${isDark ? 'text-white/45' : 'text-slate-400'}`}>{subtitle}</p>}
            {trend && (
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-black mt-0.5 ${trendUp ? 'text-emerald-500' : 'text-rose-400'}`}>
                {trendUp ? <ArrowUpRight size={9}/> : <ArrowDownRight size={9}/>}{trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { isDark } = useThemeStore()
  const [data, setData] = useState(null)
  const [periodData, setPeriodData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [periodLoading, setPeriodLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showStats, setShowStats] = useState(true)
  const [selectedView, setSelectedView] = useState('overview')
  const [timeRange, setTimeRange] = useState('today')
  const [initialLoad, setInitialLoad] = useState(true)
  const [activeRankingTab, setActiveRankingTab] = useState('terlambat')

  useEffect(() => {
    fetchDashboard()
  }, [])

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false)
      return
    }
    fetchPeriodData(timeRange)
  }, [timeRange])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const [dashRes, periodRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getDashboardStatistik('today')
      ])
      setData(dashRes.data?.data || {})
      setPeriodData(periodRes.data?.data || null)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      setError(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const fetchPeriodData = async (period) => {
    try {
      setPeriodLoading(true)
      const res = await adminApi.getDashboardStatistik(period)
      setPeriodData(res.data?.data || null)
    } catch (error) {
      console.error('Error fetching period data:', error)
    } finally {
      setPeriodLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          </motion.div>
          <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
            Memuat dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/10 rounded-2xl flex items-center justify-center"
          >
            <AlertTriangle className="text-emerald-500" size={36} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            !
          </motion.div>
        </div>
        <div className="text-center max-w-md">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Gagal Memuat Data
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all text-sm sm:text-base"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Coba Lagi
          </motion.button>
        </div>
      </div>
    )
  }

  const statistik = periodData?.statistik || data?.statistik_hari_ini || {}
  const izinStats = data?.izin_stats || {}
  const totalSiswa = statistik.total_siswa || 0
  const siswaHadir = statistik.total_hadir || 0
  const siswaTerlambat = statistik.total_terlambat || 0
  const siswaIzin = statistik.total_izin || 0
  const siswaSakit = statistik.total_sakit || 0
  const siswaAlpha = statistik.total_alpha || 0

  const totalIzinHariIni = izinStats.total_izin_hari_ini || 0
  const izinPending = izinStats.izin_pending || 0
  const izinApproved = izinStats.izin_approved || 0
  const izinRejected = izinStats.izin_rejected || 0
  const izinSakit = izinStats.izin_sakit || 0
  const izinBiasa = izinStats.izin_biasa || 0

  const grafikSource = periodData?.grafik || data?.grafik_mingguan || []
  const chartData = Array.isArray(grafikSource)
    ? grafikSource.map(item => ({
        hari: item.hari || item.day || item.tanggal,
        hadir: item.hadir || 0,
        terlambat: item.terlambat || 0,
        izin: item.izin || 0,
        sakit: item.sakit || 0,
        alpha: item.alpha || 0,
        total: (item.hadir || 0) + (item.terlambat || 0) + (item.izin || 0) + (item.sakit || 0) + (item.alpha || 0)
      }))
    : []

  const grafikPerKelas = periodData?.grafik_per_kelas || data?.grafik_per_kelas || []

  const statusLabels = { hadir: 'Hadir', terlambat: 'Terlambat', izin: 'Izin', sakit: 'Sakit', alpha: 'Alpha' }
  const absensiTerbaru = (periodData?.absensi_terbaru || data?.absensi_terbaru || []).map(a => ({
    ...a,
    status_label: a.status_label || statusLabels[a.status] || a.status
  }))

  const pieData = [
    { name: 'Hadir', value: siswaHadir, color: COLORS.chart.hadir },
    { name: 'Terlambat', value: siswaTerlambat, color: COLORS.chart.terlambat },
    { name: 'Izin', value: siswaIzin, color: COLORS.chart.izin },
    { name: 'Sakit', value: siswaSakit, color: COLORS.chart.sakit },
    { name: 'Alpha', value: siswaAlpha, color: COLORS.chart.alpha },
  ].filter(item => item.value > 0)

  const izinPieData = [
    { name: 'Pending', value: izinPending, color: COLORS.pending },
    { name: 'Disetujui', value: izinApproved, color: COLORS.approved },
    { name: 'Ditolak', value: izinRejected, color: COLORS.rejected },
  ].filter(item => item.value > 0)

  const rankingAlpha = data?.ranking_alpha || []
  const rankingRajin = data?.ranking_rajin || []
  const rankingTerlambat = data?.ranking_terlambat || []
  
  const kehadiranRate = totalSiswa > 0
    ? Math.round(((siswaHadir + siswaTerlambat) / totalSiswa) * 100)
    : 0

  const totalSiswaChartData = chartData.map(item => ({ value: item.total }))
  const hadirChartData = chartData.map(item => ({ value: item.hadir }))
  const terlambatChartData = chartData.map(item => ({ value: item.terlambat }))
  const izinChartData = chartData.map(item => ({ value: item.izin }))
  const sakitChartData = chartData.map(item => ({ value: item.sakit }))
  const alphaChartData = chartData.map(item => ({ value: item.alpha }))

  const calculateTrend = (chartData) => {
    if (chartData.length < 2) return null
    const lastValue = chartData[chartData.length - 1]?.value || 0
    const previousValue = chartData[chartData.length - 2]?.value || 0
    if (previousValue === 0) return null
    const change = ((lastValue - previousValue) / previousValue) * 100
    return {
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      isUp: change > 0
    }
  }

  const totalSiswaTrend = calculateTrend(totalSiswaChartData)
  const terlambatTrend = calculateTrend(terlambatChartData)
  const alphaTrend = calculateTrend(alphaChartData)

  const periodLabel = timeRange === 'today' ? 'hari ini' : timeRange === 'week' ? '7 hari' : timeRange === 'month' ? 'bulan ini' : 'tahun ini'

  const stats = [
    {
      title: 'Total Siswa', periodLabel, value: totalSiswa, icon: Users2,
      gradient: 'from-pink-500 to-fuchsia-600', glowColor: '#ec4899',
      delay: 0, chartType: 'bar', chartData: totalSiswaChartData,
      trend: totalSiswaTrend?.value, trendUp: totalSiswaTrend?.isUp,
      lightBg:'', iconColor:'', borderColor:''
    },
    {
      title: 'Hadir', periodLabel, value: siswaHadir, icon: UserCheck,
      gradient: 'from-violet-500 to-purple-600', glowColor: '#8b5cf6',
      subtitle: `${kehadiranRate}% kehadiran`,
      delay: 0.05, chartType: 'area', chartData: hadirChartData,
      lightBg:'', iconColor:'', borderColor:''
    },
    {
      title: 'Terlambat', periodLabel, value: siswaTerlambat, icon: Clock,
      gradient: 'from-sky-400 to-blue-500', glowColor: '#38bdf8',
      delay: 0.1, chartType: 'step', chartData: terlambatChartData,
      trend: terlambatTrend?.value, trendUp: terlambatTrend?.isUp,
      lightBg:'', iconColor:'', borderColor:''
    },
    {
      title: 'Izin', periodLabel, value: siswaIzin, icon: FileText,
      gradient: 'from-amber-400 to-orange-500', glowColor: '#f59e0b',
      subtitle: `${izinBiasa} biasa`,
      delay: 0.15, chartType: 'line', chartData: izinChartData,
      lightBg:'', iconColor:'', borderColor:''
    },
    {
      title: 'Sakit', periodLabel, value: siswaSakit, icon: Heart,
      gradient: 'from-emerald-400 to-teal-500', glowColor: '#b310b9',
      subtitle: `${izinSakit} sakit`,
      delay: 0.2, chartType: 'dot', chartData: sakitChartData,
      lightBg:'', iconColor:'', borderColor:''
    },
    {
      title: 'Alpha', periodLabel, value: siswaAlpha, icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-600', glowColor: '#ef4444',
      delay: 0.25, chartType: 'bar', chartData: alphaChartData,
      trend: alphaTrend?.value, trendUp: alphaTrend?.isUp,
      lightBg:'', iconColor:'', borderColor:''
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-full overflow-x-hidden space-y-3 sm:space-y-4 px-2 sm:px-3 lg:px-4"
    >
      {/* -- WELCOME BANNER -------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 35%, #0f766e 65%, #0e7490 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.25) 0%, transparent 70%)' }}/>
        <div className="absolute -bottom-12 left-1/3 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)' }}/>
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}/>
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]">
          <defs><pattern id="wb-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="white"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#wb-dots)"/>
        </svg>
        {/* Top shine */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"/>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="relative flex-shrink-0"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-4 ring-white/25 overflow-hidden shadow-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              {(user?.foto_url || user?.foto) ? (
                <Avatar src={user.foto_url || user.foto} name={user?.name} size={80} className="w-full h-full" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-white">{(user?.name || 'A').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
              <Shield size={9} className="text-white"/>
            </div>
          </motion.div>

          {/* Welcome text */}
          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-0.5">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1">
                Selamat datang, <span className="text-emerald-300">{user?.name?.split(' ')[0] || 'Admin'}</span> 👋
              </h2>
              <p className="text-white/50 text-xs">Administrator · Sistem Absensi Digital</p>
            </motion.div>
          </div>

          {/* Center: kehadiran rate big */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
            className="hidden sm:flex flex-col items-center gap-1 px-3 sm:px-6 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
            <p className="text-4xl font-black text-white tabular-nums leading-none">{kehadiranRate}%</p>
            <p className="text-emerald-300 text-[10px] font-semibold uppercase tracking-wider">Kehadiran Hari Ini</p>
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1">
              <motion.div initial={{ width: 0 }} animate={{ width: `${kehadiranRate}%` }} transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full"/>
            </div>
            <p className="text-white/40 text-[9px]">{siswaHadir + siswaTerlambat} / {totalSiswa} siswa</p>
          </motion.div>

          {/* Right: featured member avatars (ranking rajin) */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="hidden sm:flex flex-col gap-2">
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Siswa Terbaik Bulan Ini</p>
            <div className="flex items-center gap-1">
              {rankingRajin.slice(0, 5).map((s, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.35 + i * 0.06, type: 'spring', stiffness: 300 }}
                  className="relative group cursor-default"
                  style={{ zIndex: 5 - i }}>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-white/30 overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-lg ${i === 0 ? 'ring-yellow-400 ring-2' : ''}`}>
                    <Avatar src={s.foto_url} name={s.nama_lengkap} size={36}
                      className="bg-transparent text-white" />
                  </div>
                  {i === 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"><Crown size={8} className="text-yellow-900"/></div>}
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                    {s.nama_lengkap?.split(' ')[0]} · {s.absensis_count}x hadir
                  </div>
                </motion.div>
              ))}
              {rankingRajin.length > 5 && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white text-[10px] font-bold">
                  +{rankingRajin.length - 5}
                </div>
              )}
              {rankingRajin.length === 0 && (
                <p className="text-white/30 text-[10px]">Belum ada data</p>
              )}
            </div>
            {/* Alpha warning row */}
            {rankingAlpha.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Perlu Perhatian</p>
                <div className="flex items-center gap-1">
                  {rankingAlpha.slice(0, 5).map((s, i) => (
                    <div key={i} className="w-6 h-6 rounded-full ring-1 ring-red-400/50 overflow-hidden bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white text-[9px] font-bold">
                      <Avatar src={s.foto_url} name={s.nama_lengkap} size={24} className="bg-transparent text-white" />
                    </div>
                  ))}
                  <span className="text-red-300 text-[9px] font-semibold ml-1">{rankingAlpha.length} siswa alpha</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick mini stats row (mobile: kehadiran rate) */}
          <div className="sm:hidden w-full flex items-center gap-3">
            <div className="flex-1 text-center p-2.5 rounded-xl bg-white/10 border border-white/15">
              <p className="text-2xl font-black text-white">{kehadiranRate}%</p>
              <p className="text-emerald-300 text-[9px] font-semibold">Kehadiran</p>
            </div>
            <div className="flex-1 text-center p-2.5 rounded-xl bg-white/10 border border-white/15">
              <p className="text-2xl font-black text-white">{siswaHadir}</p>
              <p className="text-emerald-300 text-[9px] font-semibold">Hadir</p>
            </div>
            <div className="flex-1 text-center p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/20">
              <p className="text-2xl font-black text-amber-300">{izinPending}</p>
              <p className="text-amber-300 text-[9px] font-semibold">Pending</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* -- CONTROL BAR --------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        {/* Left: view tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-emerald-500/20 shadow-sm">
            {[
              { key: 'overview', label: 'Ringkasan', icon: BarChart3 },
              { key: 'details', label: 'Detail', icon: Eye },
              { key: 'analytics', label: 'Analitik', icon: Activity },
            ].map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedView(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedView === key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-600'
                }`}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{label}</span>
              </motion.button>
            ))}
          </div>

          {/* Status badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
          </div>
        </div>

        {/* Right: period + actions */}
        <div className="flex items-center gap-2">
          {/* Period selector desktop */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-emerald-500/20 shadow-sm">
            {[
              { key: 'today', label: 'Hari Ini' },
              { key: 'week', label: '7 Hari' },
              { key: 'month', label: 'Bulan' },
              { key: 'year', label: 'Tahun' },
            ].map(({ key, label }) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeRange(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timeRange === key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-emerald-500/10'
                }`}
              >
                {label}
                {periodLoading && timeRange === key && <RefreshCw size={9} className="animate-spin" />}
              </motion.button>
            ))}
          </div>

          {/* Period selector mobile */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="sm:hidden px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-emerald-500/20 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm"
          >
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari</option>
            <option value="month">Bulan</option>
            <option value="year">Tahun</option>
          </select>

          {/* Toggle stats visibility */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowStats(!showStats)}
            className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-emerald-500/20 text-slate-500 hover:text-emerald-500 transition-all shadow-sm"
            title={showStats ? 'Sembunyikan statistik' : 'Tampilkan statistik'}
          >
            {showStats ? <Eye size={16} /> : <EyeOff size={16} />}
          </motion.button>

          {/* Refresh */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 text-xs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>
        </div>
      </motion.div>

      {/* -- ATTENDANCE RATE + QUICK ACTIONS + NAV SHORTCUTS dalam satu section -- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Attendance Rate · spans 1 col */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tingkat Kehadiran {periodLabel}</p>
              <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full
                ${kehadiranRate >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                {kehadiranRate >= 80 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {kehadiranRate >= 80 ? 'Baik' : 'Perlu Perhatian'}
              </span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tabular-nums">{kehadiranRate}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${kehadiranRate}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-1.5">{siswaHadir + siswaTerlambat} dari {totalSiswa} siswa hadir</p>
          </div>
        </motion.div>

        {/* Quick Actions: Izin Pending + Alpha · spans 1 col */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 p-4 shadow-sm cursor-pointer group hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/izins')}
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 flex items-center justify-center">
                  <Bell size={13} className="text-amber-500" />
                </div>
                <span className="text-[9px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold border border-amber-100 dark:border-amber-800/40">Aksi</span>
              </div>
              <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{izinPending}</p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">Izin Pending</p>
              <div className="mt-1.5 flex items-center gap-1 text-[9px] text-amber-500 group-hover:text-amber-600 font-semibold transition-colors">
                <span>Kelola</span>
                <ChevronRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 p-4 shadow-sm cursor-pointer group hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/absensis')}
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-rose-400 to-red-400" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 flex items-center justify-center">
                  <AlertTriangle size={13} className="text-rose-500" />
                </div>
                <span className="text-[9px] bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-semibold border border-rose-100 dark:border-rose-800/40">Hari ini</span>
              </div>
              <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{siswaAlpha}</p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">Siswa Alpha</p>
              <div className="mt-1.5 flex items-center gap-1 text-[9px] text-rose-500 group-hover:text-rose-600 font-semibold transition-colors">
                <span>Detail</span>
                <ChevronRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Nav Shortcuts · spans 1 col, 2x4 grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-4 gap-2"
        >
          {[
            { label: 'Absensi', icon: CheckCircle, to: '/admin/absensis', color: 'emerald' },
            { label: 'Siswa', icon: Users2, to: '/admin/siswas', color: 'blue' },
            { label: 'Guru', icon: UserCheck, to: '/admin/gurus', color: 'violet' },
            { label: 'Izin', icon: FileText, to: '/admin/izins', color: 'amber' },
            { label: 'Kelas', icon: School, to: '/admin/kelas', color: 'cyan' },
            { label: 'Laporan', icon: BarChart3, to: '/admin/laporan', color: 'pink' },
            { label: 'Ranking', icon: Award, to: '/admin/ranking', color: 'orange' },
            { label: 'Setting', icon: Gauge, to: '/admin/pengaturan', color: 'slate' },
          ].map((item, i) => {
            const colorMap = {
              emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
              blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
              violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/20',
              amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
              cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20',
              pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20 hover:bg-pink-500/20',
              orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/20',
              slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 hover:bg-slate-500/20',
            }
            return (
              <motion.div key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.03 }}
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={item.to}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border ${colorMap[item.color]} transition-all duration-200`}
                >
                  <item.icon size={16} />
                  <span className="text-[9px] font-semibold leading-tight text-center">{item.label}</span>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Quick Stats Cards dengan Variasi Chart */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Outer container · galaxy — dark = deep space, light = soft cosmic */}
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-2xl"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #0d0929 0%, #130a2e 20%, #0e1a3d 40%, #071e35 60%, #0a1628 80%, #080e1e 100%)'
                  : 'linear-gradient(135deg, #e8e4f8 0%, #dde8f8 20%, #d6f0ef 40%, #dcf0e8 60%, #e4e8f8 80%, #ede4f8 100%)',
              }}>

              {/* Aurora blobs */}
              <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: isDark
                  ? 'radial-gradient(circle, rgba(139,92,246,0.55) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(139,92,246,0.30) 0%, transparent 70%)' }} />
              <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: isDark
                  ? 'radial-gradient(circle, rgba(59,130,246,0.45) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)' }} />
              <div className="absolute -top-10 right-1/4 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: isDark
                  ? 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)' }} />
              <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: isDark
                  ? 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }} />
              <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: isDark
                  ? 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)' }} />

              {/* Hex grid */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ opacity: isDark ? 0.07 : 0.12 }}>
                <defs>
                  <pattern id="stats-hex" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z" fill="none"
                      stroke={isDark ? 'white' : '#6366f1'} strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#stats-hex)"/>
              </svg>
              {/* Top shine */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"/>
              <div className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
                style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}/>

              <div className="relative grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {stats.map((stat) => (
                  <EnhancedStatCard key={stat.title} {...stat} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State Warning */}
      <AnimatePresence>
        {totalSiswa === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4 sm:p-6 shadow-lg"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1)_0%,transparent_50%)]" />
            <div className="relative flex flex-col sm:flex-row items-start gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <AlertTriangle className="text-emerald-500" size={24} />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-500 text-base sm:text-lg mb-2">
                  Belum Ada Data Siswa
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 max-w-2xl">
                  Dashboard akan menampilkan data lengkap setelah Anda menambahkan siswa dan melakukan absensi.
                  Mulai dengan menambahkan data siswa terlebih dahulu.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/admin/siswas"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Users size={14} />
                    Tambah Siswa
                  </Link>
                  <Link
                    to="/admin/absensis"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-emerald-600 border border-emerald-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-emerald-500/10 transition-all"
                  >
                    <BarChart3 size={14} />
                    Lihat Absensi
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LIVE DASHBOARD BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
          boxShadow: isDark ? '0 4px 32px rgba(0,0,0,0.4)' : '0 4px 32px rgba(0,0,0,0.07)'
        }}
      >
        {/* Subtle emerald glow top-left */}
        <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: isDark
            ? 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)' }} />
        {/* Top accent line — emerald */}
        <div className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, #10b981, #34d399, #06b6d4)' }} />

        <div className="relative z-10 flex flex-col md:flex-row">

          {/* LEFT — text */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center gap-5">

            {/* Live badge + date */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold tracking-wide">Live Dashboard</span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Heading */}
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white leading-snug mb-2"
                style={{ fontSize: 'clamp(1.35rem, 3vw, 2rem)' }}>
                Pantau Aktivitas Sekolah{' '}
                <span className="text-emerald-500">Real-time</span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                Data absensi diperbarui otomatis setiap hari. Monitor kehadiran siswa, keterlambatan, dan pengajuan izin langsung dari sini.
              </p>
            </div>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Auto Update', icon: RefreshCw },
                { label: 'Multi Periode', icon: Calendar },
                { label: 'Semua Kelas', icon: GraduationCap },
              ].map(({ label, icon: Ic }) => (
                <span key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <Ic size={11} className="text-emerald-500 flex-shrink-0" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — video 16:9 */}
          <div className="w-full md:w-[44%] lg:w-[42%] flex-shrink-0 p-3 md:pl-0 md:py-3 md:pr-3">
            <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <div className="absolute inset-0">
                <DashboardVideo className="w-full h-full" rounded={false} />
                {/* left fade — desktop */}
                <div className="absolute inset-y-0 left-0 w-8 pointer-events-none hidden md:block"
                  style={{ background: isDark
                    ? 'linear-gradient(to right, #0f172a, transparent)'
                    : 'linear-gradient(to right, #f8fafc, transparent)' }}
                />
                {/* emerald glow overlay on video */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, transparent 50%, rgba(6,182,212,0.10) 100%)' }}
                />
                {/* bottom label */}
                <div className="absolute bottom-0 inset-x-0 px-3 py-2 flex items-center justify-between"
                  style={{ background: 'linear-gradient(to top, rgba(4,47,46,0.75), rgba(6,78,59,0.3), transparent)' }}>
                  <span className="text-emerald-100/80 text-[10px] font-medium">Sistem Absensi Digital</span>
                  <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>


      {/* Charts Section - Overview View */}
      {selectedView === 'overview' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* -- GRAFIK KEHADIRAN: Line + Area Chart -- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">Grafik Kehadiran</h3>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                {timeRange === 'today' ? 'Hari ini' : timeRange === 'week' ? '7 hari terakhir' : timeRange === 'month' ? 'Bulan ini' : 'Tahun ini'}
                {periodLoading && <RefreshCw size={10} className="animate-spin text-emerald-500" />}
              </p>
            </div>
            <div className="hidden sm:flex flex-wrap gap-1.5">
              {[
                { key: 'hadir', label: 'Hadir', color: COLORS.chart.hadir },
                { key: 'terlambat', label: 'Terlambat', color: COLORS.chart.terlambat },
                { key: 'izin', label: 'Izin', color: COLORS.chart.izin },
                { key: 'alpha', label: 'Alpha', color: COLORS.chart.alpha },
              ].map(item => (
                <span key={item.key} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
          {chartData.length > 0 ? (
            <div className="w-full h-[250px] sm:h-[280px] lg:h-[300px]">
              {chartData.length === 1 ? (
                <div className="h-full flex flex-col justify-center gap-4 px-2">
                  {[
                    { key: 'hadir', label: 'Hadir', color: COLORS.chart.hadir },
                    { key: 'terlambat', label: 'Terlambat', color: COLORS.chart.terlambat },
                    { key: 'izin', label: 'Izin', color: COLORS.chart.izin },
                    { key: 'sakit', label: 'Sakit', color: COLORS.chart.sakit },
                    { key: 'alpha', label: 'Alpha', color: COLORS.chart.alpha },
                  ].map((item) => {
                    const val = chartData[0]?.[item.key] || 0
                    const total = chartData[0]?.total || 1
                    const pct = total > 0 ? Math.round((val / total) * 100) : 0
                    return (
                      <div key={item.key} className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">{item.label}</span>
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            className="h-full rounded-full" style={{ backgroundColor: item.color, minWidth: val > 0 ? '20px' : '0' }} />
                        </div>
                        <div className="flex items-center gap-1.5 w-16 flex-shrink-0">
                          <span className="text-xs font-black tabular-nums" style={{ color: item.color }}>{val}</span>
                          <span className="text-[10px] text-slate-400">({pct}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="25%">
                    <defs>
                      <linearGradient id="barHadir" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.chart.hadir} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={COLORS.chart.hadir} stopOpacity={0.5}/>
                      </linearGradient>
                      <linearGradient id="barTerlambat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.chart.terlambat} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={COLORS.chart.terlambat} stopOpacity={0.5}/>
                      </linearGradient>
                      <linearGradient id="barAlpha" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.chart.alpha} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={COLORS.chart.alpha} stopOpacity={0.5}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} vertical={false} />
                    <XAxis dataKey="hari" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontWeight: 500 }} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} width={28} tick={{ fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                      labelStyle={{ fontWeight: 700, marginBottom: '6px', color: '#e2e8f0' }}
                      cursor={{ fill: 'rgba(148,163,184,0.06)' }}
                    />
                    {/* Bars: hadir, terlambat, alpha */}
                    <Bar dataKey="hadir" fill="url(#barHadir)" radius={[4, 4, 0, 0]} maxBarSize={22} name="Hadir" />
                    <Bar dataKey="terlambat" fill="url(#barTerlambat)" radius={[4, 4, 0, 0]} maxBarSize={22} name="Terlambat" />
                    <Bar dataKey="alpha" fill="url(#barAlpha)" radius={[4, 4, 0, 0]} maxBarSize={22} name="Alpha" />
                    {/* Line overlay: izin + sakit */}
                    <Line type="monotone" dataKey="izin" stroke={COLORS.chart.izin} strokeWidth={2}
                      dot={{ r: 3, fill: COLORS.chart.izin, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }} name="Izin" />
                    <Line type="monotone" dataKey="sakit" stroke={COLORS.chart.sakit} strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={{ r: 3, fill: COLORS.chart.sakit, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }} name="Sakit" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] sm:h-[280px] lg:h-[300px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <BarChart3 size={36} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">Belum ada data untuk periode ini</p>
              <p className="text-xs mt-1 opacity-60">Coba pilih periode lain</p>
            </div>
          )}
          <div className="flex sm:hidden flex-wrap items-center gap-2 mt-3">
            {[
              { key: 'hadir', label: 'Hadir', color: COLORS.chart.hadir },
              { key: 'terlambat', label: 'Terlambat', color: COLORS.chart.terlambat },
              { key: 'izin', label: 'Izin', color: COLORS.chart.izin },
              { key: 'sakit', label: 'Sakit', color: COLORS.chart.sakit },
              { key: 'alpha', label: 'Alpha', color: COLORS.chart.alpha },
            ].map(item => (
              <span key={item.key} className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* -- DISTRIBUSI: Stacked horizontal bar -- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Distribusi Kehadiran</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {timeRange === 'today' ? 'Hari ini' : timeRange === 'week' ? '7 hari terakhir' : timeRange === 'month' ? 'Bulan ini' : 'Tahun ini'}
                {periodLoading && <RefreshCw size={9} className="animate-spin inline ml-1 text-emerald-500" />}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              {totalSiswa} siswa
            </span>
          </div>

          {pieData.length > 0 ? (() => {
            const items = [
              { name: 'Hadir',     value: siswaHadir,     color: COLORS.chart.hadir,     icon: UserCheck },
              { name: 'Terlambat', value: siswaTerlambat, color: COLORS.chart.terlambat, icon: Clock },
              { name: 'Izin',      value: siswaIzin,      color: COLORS.chart.izin,      icon: FileText },
              { name: 'Sakit',     value: siswaSakit,     color: COLORS.chart.sakit,     icon: Heart },
              { name: 'Alpha',     value: siswaAlpha,     color: COLORS.chart.alpha,     icon: AlertTriangle },
            ]
            const total = items.reduce((s, i) => s + i.value, 0) || 1
            return (
              <div className="space-y-4">
                {/* Stacked bar */}
                <div className="w-full h-7 rounded-xl overflow-hidden flex gap-0.5">
                  {items.filter(i => i.value > 0).map((item, idx) => {
                    const w = Math.round((item.value / total) * 100)
                    return (
                      <motion.div key={item.name}
                        initial={{ width: 0 }} animate={{ width: `${w}%` }}
                        transition={{ duration: 0.9, delay: 0.4 + idx * 0.08, ease: 'easeOut' }}
                        className="h-full relative group cursor-default flex items-center justify-center"
                        style={{ backgroundColor: item.color, minWidth: w > 5 ? undefined : '4px' }}>
                        {w >= 8 && (
                          <span className="text-[10px] font-black text-white drop-shadow-sm select-none">{w}%</span>
                        )}
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
                          {item.name}: {item.value} ({w}%)
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Stat rows */}
                <div className="space-y-2.5">
                  {items.map((item, i) => {
                    const p = Math.round((item.value / total) * 100)
                    return (
                      <motion.div key={item.name}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.06 }}
                        className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: item.color + '20' }}>
                          <item.icon size={11} style={{ color: item.color }} />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 w-14 flex-shrink-0">{item.name}</span>
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }}
                            transition={{ duration: 0.8, delay: 0.6 + i * 0.08, ease: 'easeOut' }}
                            className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                        </div>
                        <span className="text-[11px] font-black tabular-nums w-8 text-right flex-shrink-0"
                          style={{ color: item.color }}>{item.value}</span>
                        <span className="text-[10px] text-slate-400 w-7 text-right flex-shrink-0">{p}%</span>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Kehadiran rate badge */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400">Tingkat kehadiran</span>
                  <span className={`text-sm font-black tabular-nums ${kehadiranRate >= 80 ? 'text-emerald-500' : kehadiranRate >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {kehadiranRate}%
                  </span>
                </div>
              </div>
            )
          })() : (
            <div className="flex flex-col items-center justify-center h-[280px] text-slate-400">
              <CircleDot size={32} className="mb-2 opacity-20" />
              <p className="text-xs">Belum ada data</p>
            </div>
          )}
        </motion.div>
      </div>
      )}

      {/* Izin Statistics - Premium Redesign */}
      <AnimatePresence>
        {totalIzinHariIni > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.6 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-white/60 dark:border-slate-700/60 shadow-xl"
          >
            {/* Decorative bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-900/10 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-emerald-500 to-purple-500" />

            <div className="relative p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <FileText className="text-white" size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Pengajuan Izin Hari Ini</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {totalIzinHariIni} total pengajuan
                    </p>
                  </div>
                </div>
                <Link to="/admin/izins"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-emerald-500/20 group">
                  Kelola <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { label: 'Pending', value: izinPending, icon: Clock, from: 'from-orange-500', to: 'to-amber-500', shadow: 'shadow-orange-500/20', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', desc: 'Menunggu' },
                  { label: 'Disetujui', value: izinApproved, icon: CheckCircle, from: 'from-emerald-500', to: 'to-teal-500', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', desc: 'Approved' },
                  { label: 'Ditolak', value: izinRejected, icon: XCircle, from: 'from-red-500', to: 'to-rose-500', shadow: 'shadow-red-500/20', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', desc: 'Rejected' },
                  { label: 'Sakit', value: izinSakit, icon: Heart, from: 'from-pink-500', to: 'to-rose-400', shadow: 'shadow-pink-500/20', bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800', desc: 'Jenis sakit' },
                  { label: 'Izin', value: izinBiasa, icon: FileText, from: 'from-violet-500', to: 'to-purple-500', shadow: 'shadow-violet-500/20', bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800', desc: 'Jenis izin' },
                ].map((item, i) => (
                  <motion.div key={item.label}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.07 }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className={`relative overflow-hidden rounded-xl border ${item.border} ${item.bg} p-3 sm:p-4 ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
                    {/* Mini gradient bar top */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.from} ${item.to}`} />
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-7 h-7 rounded-lg ${item.bg} border ${item.border} flex items-center justify-center`}>
                        <item.icon size={13} className={item.text} />
                      </div>
                      <span className={`text-[10px] font-semibold ${item.text} opacity-70`}>{item.label}</span>
                    </div>
                    <p className={`text-2xl sm:text-3xl font-black ${item.text}`}>{item.value}</p>
                    <p className={`text-[10px] ${item.text} opacity-60 mt-0.5`}>{item.desc}</p>
                    {/* Progress bar relative to total */}
                    <div className="mt-2 h-1 bg-white/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totalIzinHariIni > 0 ? Math.round(item.value / totalIzinHariIni * 100) : 0}%` }}
                        transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                        className={`h-full bg-gradient-to-r ${item.from} ${item.to} rounded-full`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View: Detail - Absensi Terbaru */}
      <AnimatePresence>
        {selectedView === 'details' && (
          <motion.div key="details" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Activity size={14} className="text-slate-500 dark:text-slate-400"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Absensi Terbaru</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
                    {timeRange==='today'?'Hari ini':timeRange==='week'?'Minggu ini':timeRange==='month'?'Bulan ini':'Tahun ini'}
                    {periodLoading && <RefreshCw size={9} className="animate-spin text-emerald-500"/>}
                  </p>
                </div>
              </div>
              <Link to="/admin/absensis"
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                Lihat semua <ChevronRight size={11}/>
              </Link>
            </div>

            {absensiTerbaru.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {absensiTerbaru.map((absensi, idx) => {
                  const nama = absensi.siswa?.nama_lengkap || absensi.nama_lengkap || '-'
                  const kelas = absensi.siswa?.kelas?.nama_kelas || absensi.kelas?.nama_kelas || '-'
                  const nis = absensi.siswa?.nis || absensi.nis || null
                  const foto = absensi.siswa?.foto_url || absensi.siswa?.foto || null
                  const jam = absensi.jam_masuk?.substring(0,5) || null
                  const tgl = absensi.tanggal
                    ? new Date(absensi.tanggal).toLocaleDateString('id-ID',{day:'2-digit',month:'short'})
                    : null
                  const SC = {
                    hadir:     { hex:'#10b981', label:'Hadir',     textCls:'text-emerald-600 dark:text-emerald-400', bgCls:'bg-emerald-50 dark:bg-emerald-900/20' },
                    terlambat: { hex:'#f59e0b', label:'Terlambat', textCls:'text-amber-600 dark:text-amber-400',   bgCls:'bg-amber-50 dark:bg-amber-900/20' },
                    izin:      { hex:'#8b5cf6', label:'Izin',      textCls:'text-violet-600 dark:text-violet-400', bgCls:'bg-violet-50 dark:bg-violet-900/20' },
                    sakit:     { hex:'#ec4899', label:'Sakit',     textCls:'text-pink-600 dark:text-pink-400',     bgCls:'bg-pink-50 dark:bg-pink-900/20' },
                    alpha:     { hex:'#ef4444', label:'Alpha',     textCls:'text-rose-600 dark:text-rose-400',     bgCls:'bg-rose-50 dark:bg-rose-900/20' },
                  }
                  const sc = SC[absensi.status] || SC.alpha
                  const isLastRow = idx >= absensiTerbaru.length - (absensiTerbaru.length % 2 === 0 ? 2 : 1)
                  const isRightCol = idx % 2 === 1
                  return (
                    <motion.div key={absensi.id||idx}
                      initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: idx*0.02 }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      style={{
                        borderBottom: isLastRow ? 'none' : '1px solid rgba(148,163,184,0.1)',
                        borderRight: isRightCol ? 'none' : '1px solid rgba(148,163,184,0.1)',
                      }}
                    >
                      {/* rank */}
                      <span className="w-4 text-[10px] font-medium text-slate-300 dark:text-slate-600 tabular-nums text-center flex-shrink-0">{idx+1}</span>

                      {/* avatar */}
                      <div className="flex-shrink-0">
                        {foto
                          ? <img src={foto} alt={nama}
                              className="w-9 h-9 rounded-full object-cover"
                              style={{ boxShadow: `0 0 0 2px ${sc.hex}50` }}
                              onError={e=>{e.target.style.display='none';e.target.nextElementSibling.style.display='flex'}}/>
                          : null}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${foto?'hidden':'flex'}`}
                          style={{ background:`linear-gradient(135deg,${sc.hex}bb,${sc.hex})`, boxShadow:`0 0 0 2px ${sc.hex}40` }}>
                          {nama.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">{nama}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 truncate">{kelas}</span>
                          {nis && <span className="text-[9px] text-slate-300 dark:text-slate-600 hidden sm:inline">· {nis}</span>}
                        </div>
                      </div>

                      {/* right side: jam + status */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bgCls} ${sc.textCls}`}>
                          {sc.label}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 tabular-nums">
                          {jam ? jam : tgl ? tgl : '·'}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 gap-2">
                <Activity size={22} className="text-slate-200 dark:text-slate-700"/>
                <p className="text-xs text-slate-400">Belum ada data absensi</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

              {/* View: Analitik */}
      <AnimatePresence>
        {selectedView === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-3">

            {/* -- LEFT col (3/5): stacked charts -- */}
            <div className="lg:col-span-3 flex flex-col gap-3">

              {/* Tren area chart */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                      <TrendingUp size={13} className="text-violet-500"/>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Tren Kehadiran</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {[['#10b981','Hadir'],['#f59e0b','Terlambat'],['#8b5cf6','Izin'],['#ef4444','Alpha']].map(([c,l])=>(
                      <div key={l} className="hidden sm:flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{background:c}}/>
                        <span className="text-[9px] text-slate-400 font-medium">{l}</span>
                      </div>
                    ))}
                    {periodLoading && <RefreshCw size={9} className="animate-spin text-emerald-500"/>}
                  </div>
                </div>
                <div className="px-2 pt-3 pb-2">
                  <div className="h-[180px] sm:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{top:4,right:4,left:-28,bottom:0}}>
                        <defs>
                          {[['hadir','#10b981'],['terlambat','#f59e0b'],['izin','#8b5cf6'],['alpha','#ef4444']].map(([k,c])=>(
                            <linearGradient key={k} id={`ag2-${k}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={c} stopOpacity={0.3}/>
                              <stop offset="100%" stopColor={c} stopOpacity={0}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="2 4" stroke="#e2e8f0" strokeOpacity={0.6} vertical={false}/>
                        <XAxis dataKey="hari" tick={{fontSize:9,fill:'#94a3b8'}} tickLine={false} axisLine={false}/>
                        <YAxis tick={{fontSize:9,fill:'#94a3b8'}} tickLine={false} axisLine={false} width={28}/>
                        <Tooltip contentStyle={{background:'#0f172a',border:'1px solid #1e293b',borderRadius:10,fontSize:11,color:'#f1f5f9',padding:'6px 10px'}}
                          cursor={{stroke:'rgba(148,163,184,0.2)',strokeWidth:1}}/>
                        <Area type="monotone" dataKey="hadir"     stroke="#10b981" strokeWidth={2}   fill="url(#ag2-hadir)"     dot={false} name="Hadir"/>
                        <Area type="monotone" dataKey="terlambat" stroke="#f59e0b" strokeWidth={1.5} fill="url(#ag2-terlambat)" dot={false} name="Terlambat"/>
                        <Area type="monotone" dataKey="izin"      stroke="#8b5cf6" strokeWidth={1.5} fill="url(#ag2-izin)"      dot={false} name="Izin"/>
                        <Area type="monotone" dataKey="alpha"     stroke="#ef4444" strokeWidth={1.5} fill="url(#ag2-alpha)"     dot={false} name="Alpha"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Kehadiran per kelas · ComposedChart */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                      <BarChart3 size={13} className="text-emerald-600"/>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Per Kelas</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {[['#94a3b8','Total'],['#10b981','Hadir'],['#f59e0b','%']].map(([c,l])=>(
                      <div key={l} className="hidden sm:flex items-center gap-1">
                        <div className="w-2 h-2 rounded-sm" style={{background:c}}/>
                        <span className="text-[9px] text-slate-400 font-medium">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-2 pt-3 pb-2">
                  {grafikPerKelas.length > 0 ? (
                    <div className="h-[180px] sm:h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={grafikPerKelas} margin={{top:4,right:32,left:-28,bottom:28}}>
                          <defs>
                            <linearGradient id="bH2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                              <stop offset="100%" stopColor="#059669" stopOpacity={0.5}/>
                            </linearGradient>
                            <linearGradient id="bT2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.5}/>
                              <stop offset="100%" stopColor="#64748b" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="2 4" stroke="#e2e8f0" strokeOpacity={0.6} vertical={false}/>
                          <XAxis dataKey="kelas" tick={{fontSize:8,fill:'#94a3b8'}} tickLine={false} axisLine={false} angle={-25} textAnchor="end" interval={0}/>
                          <YAxis yAxisId="left" tick={{fontSize:9,fill:'#94a3b8'}} tickLine={false} axisLine={false} width={28}/>
                          <YAxis yAxisId="right" orientation="right" tick={{fontSize:9,fill:'#f59e0b'}} tickLine={false} axisLine={false} width={30} unit="%"/>
                          <Tooltip contentStyle={{background:'#0f172a',border:'1px solid #1e293b',borderRadius:10,fontSize:11,color:'#f1f5f9',padding:'6px 10px'}}
                            cursor={{fill:'rgba(16,185,129,0.04)'}}
                            formatter={(v,n)=>[v, n==='total_siswa'?'Total':n==='hadir'?'Hadir':n==='persentase'?'Kehadiran %':n]}/>
                          <Bar yAxisId="left" dataKey="total_siswa" fill="url(#bT2)" radius={[3,3,0,0]} maxBarSize={20} name="total_siswa"/>
                          <Bar yAxisId="left" dataKey="hadir" fill="url(#bH2)" radius={[3,3,0,0]} maxBarSize={20} name="hadir"/>
                          <Line yAxisId="right" type="monotone" dataKey="persentase" stroke="#f59e0b" strokeWidth={2}
                            dot={{r:3,fill:'#f59e0b',strokeWidth:0}} activeDot={{r:4,fill:'#f59e0b'}} name="persentase"/>
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center">
                      <p className="text-xs text-slate-400">Belum ada data per kelas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* -- RIGHT col (2/5): donut + kelas list -- */}
            <div className="lg:col-span-2 flex flex-col gap-3">

              {/* Donut distribusi */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center">
                    <PieChartIcon size={13} className="text-pink-500"/>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Distribusi</p>
                </div>
                <div className="p-4">
                  <div className="relative w-full h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {pieData.map((e,i)=>(
                            <linearGradient key={i} id={`pd-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={e.color} stopOpacity={1}/>
                              <stop offset="100%" stopColor={e.color} stopOpacity={0.75}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62}
                          paddingAngle={2} dataKey="value" animationBegin={0} animationDuration={800}>
                          {pieData.map((_,i)=><Cell key={i} fill={`url(#pd-${i})`} stroke="none"/>)}
                        </Pie>
                        <Tooltip contentStyle={{background:'#0f172a',border:'1px solid #1e293b',borderRadius:8,fontSize:10,color:'#f1f5f9',padding:'4px 8px'}}
                          formatter={(v,n)=>[`${v} siswa`,n]}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{totalSiswa}</span>
                      <span className="text-[9px] text-slate-400">siswa</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    {pieData.map((e,i)=>{
                      const pct = totalSiswa>0?Math.round((e.value/totalSiswa)*100):0
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:e.color}}/>
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 flex-1 truncate">{e.name}</span>
                          <div className="w-14 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                            <motion.div initial={{width:0}} animate={{width:`${pct}%`}}
                              transition={{duration:0.7,delay:0.08*i}}
                              className="h-full rounded-full" style={{background:e.color}}/>
                          </div>
                          <span className="text-[10px] font-bold tabular-nums w-6 text-right flex-shrink-0" style={{color:e.color}}>{e.value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Kelas list compact */}
              {grafikPerKelas.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                      <GraduationCap size={13} className="text-sky-500"/>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Kelas</p>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-800/80">
                    {grafikPerKelas.map((k,i)=>{
                      const pct = k.persentase||0
                      const c = pct>=80?'#10b981':pct>=60?'#f59e0b':'#ef4444'
                      return (
                        <motion.div key={i} initial={{opacity:0,x:6}} animate={{opacity:1,x:0}}
                          transition={{delay:0.04*i}}
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <div className="w-1.5 h-6 rounded-full flex-shrink-0" style={{background:c}}/>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex-1 truncate">{k.kelas}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div initial={{width:0}} animate={{width:`${pct}%`}}
                                transition={{duration:0.7,delay:0.06*i}}
                                className="h-full rounded-full" style={{background:c}}/>
                            </div>
                            <span className="text-[10px] font-black tabular-nums w-8 text-right" style={{color:c}}>{pct}%</span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* -- RANKINGS SECTION ---------------------------------------------- */}
      {selectedView === 'overview' && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* -- SISWA TERBAIK -- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.45 }}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60"
          style={{ boxShadow: '0 2px 16px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.06)' }}
        >
          {/* soft indigo tint top */}
          <div className="absolute inset-x-0 top-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.05) 0%, transparent 100%)' }} />
          <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #6366f1, transparent)' }} />

          <div className="relative z-10 p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-700/40">
                  <Trophy size={16} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-indigo-400 dark:text-indigo-400">Bulan Ini</p>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">Siswa Terbaik</h3>
                </div>
              </div>
              <Link to="/admin/ranking"
                className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                Semua <ChevronRight size={11} />
              </Link>
            </div>

            {rankingRajin.length > 0 ? (
              <>
                {/* -- PODIUM TOP 3 -- */}
                <div className="flex items-end justify-center gap-3 mb-5 px-2">
                  {[
                    { s: rankingRajin[1], rank: 2, podiumH: 48, avatarSize: 52 },
                    { s: rankingRajin[0], rank: 1, podiumH: 68, avatarSize: 68 },
                    { s: rankingRajin[2], rank: 3, podiumH: 36, avatarSize: 48 },
                  ].filter(p => p.s).map(({ s, rank, podiumH, avatarSize }) => {
                    const cfg = {
                      1: {
                        ring: '#f59e0b', ringOpacity: '1',
                        podiumBg: 'linear-gradient(180deg, #fef3c7, #fde68a)',
                        podiumBorder: '#f59e0b',
                        numColor: '#92400e',
                        countBg: '#fef3c7', countColor: '#b45309', countBorder: '#f59e0b',
                        avatarBg: '#fffbeb',
                        shadow: '0 0 0 3px #f59e0b, 0 4px 16px rgba(245,158,11,0.25)',
                      },
                      2: {
                        ring: '#94a3b8', ringOpacity: '0.8',
                        podiumBg: 'linear-gradient(180deg, #f1f5f9, #e2e8f0)',
                        podiumBorder: '#cbd5e1',
                        numColor: '#475569',
                        countBg: '#f1f5f9', countColor: '#475569', countBorder: '#cbd5e1',
                        avatarBg: '#f8fafc',
                        shadow: '0 0 0 2.5px #94a3b8, 0 4px 12px rgba(0,0,0,0.1)',
                      },
                      3: {
                        ring: '#f97316', ringOpacity: '0.8',
                        podiumBg: 'linear-gradient(180deg, #fff7ed, #fed7aa)',
                        podiumBorder: '#fb923c',
                        numColor: '#9a3412',
                        countBg: '#fff7ed', countColor: '#c2410c', countBorder: '#fb923c',
                        avatarBg: '#fff7ed',
                        shadow: '0 0 0 2.5px #f97316, 0 4px 12px rgba(249,115,22,0.2)',
                      },
                    }[rank]
                    return (
                      <motion.div key={rank}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + rank * 0.07, type: 'spring', stiffness: 160, damping: 18 }}
                        className="flex flex-col items-center gap-1.5 flex-1"
                      >
                        {rank === 1 ? (
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                            <Crown size={18} className="text-amber-400" fill="#fbbf24" />
                          </motion.div>
                        ) : <div style={{ height: 22 }} />}

                        {/* Avatar */}
                        <Avatar
                          src={s.foto_url} name={s.nama_lengkap} size={avatarSize}
                          className="font-bold text-slate-600 dark:text-slate-300"
                          style={{ background: cfg.avatarBg, boxShadow: cfg.shadow }}
                        />

                        {/* Name */}
                        <p className="text-[11px] font-semibold text-center text-slate-700 dark:text-slate-300 leading-tight truncate" style={{ maxWidth: avatarSize + 12 }} title={s.nama_lengkap}>
                          {s.nama_lengkap?.split(' ')[0] || '-'}
                        </p>

                        {/* Count badge */}
                        <div className="px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums"
                          style={{ background: cfg.countBg, color: cfg.countColor, border: `1px solid ${cfg.countBorder}` }}>
                          {s.absensis_count}·
                        </div>

                        {/* Podium block */}
                        <motion.div
                          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                          transition={{ delay: 0.75 + rank * 0.07, duration: 0.5, ease: 'easeOut', originY: 1 }}
                          className="w-full rounded-t-xl flex items-start justify-center pt-2"
                          style={{ height: podiumH, background: cfg.podiumBg, border: `1px solid ${cfg.podiumBorder}`, borderBottom: 'none' }}
                        >
                          <span className="text-[11px] font-black" style={{ color: cfg.numColor }}>{rank}</span>
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* -- RANK 4 & 5 -- */}
                <div className="space-y-1.5">
                  {rankingRajin.slice(3, 5).map((s, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.07 }}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:border-indigo-100 transition-colors cursor-default"
                    >
                      <span className="text-xs font-bold w-5 text-center flex-shrink-0 text-slate-400 dark:text-slate-500 tabular-nums">{i + 4}</span>
                      <Avatar src={s.foto_url} name={s.nama_lengkap} size={32}
                        className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400" />
                      <p className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{s.nama_lengkap}</p>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tabular-nums">{s.absensis_count}·</span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-12 gap-2 text-slate-300 dark:text-slate-600">
                <Trophy size={28} />
                <p className="text-xs">Belum ada data</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* -- PERLU PERHATIAN (Alpha + Terlambat) -- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68, duration: 0.45 }}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60"
          style={{ boxShadow: '0 2px 16px rgba(244,63,94,0.07), 0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="absolute inset-x-0 top-0 h-[2px] transition-all duration-500"
            style={{ background: activeRankingTab === 'terlambat'
              ? 'linear-gradient(90deg, transparent, #f59e0b, transparent)'
              : 'linear-gradient(90deg, transparent, #f43f5e, transparent)' }} />

          {/* Tab header */}
          <div className="relative flex border-b border-slate-100 dark:border-slate-700/60">
            {[
              { key: 'terlambat', label: 'Terlambat',      icon: Clock,         activeText: 'text-amber-500 dark:text-amber-400',   activeBorder: 'border-amber-500' },
              { key: 'alpha',     label: 'Perlu Perhatian', icon: AlertTriangle, activeText: 'text-rose-500 dark:text-rose-400',     activeBorder: 'border-rose-500'  },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => setActiveRankingTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold transition-all border-b-2 ${
                  activeRankingTab === tab.key
                    ? `${tab.activeText} ${tab.activeBorder} bg-slate-50/80 dark:bg-slate-800/50`
                    : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
                }`}>
                <tab.icon size={11} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-6">
            <AnimatePresence mode="wait">

              {/* -- TERLAMBAT -- */}
              {activeRankingTab === 'terlambat' && (
                <motion.div key="terlambat" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                  {rankingTerlambat.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center">
                        <CheckCircle size={20} className="text-emerald-500" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tidak ada siswa terlambat</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {rankingTerlambat.slice(0, 5).map((s, i) => {
                        const maxVal = rankingTerlambat[0]?.absensis_count || 1
                        const pct = Math.round((s.absensis_count / maxVal) * 100)
                        const accent = i === 0
                          ? { numC: '#92400e', rowBg: 'bg-amber-50 dark:bg-amber-900/20', rowBorder: 'border-amber-200 dark:border-amber-800/40', barC: '#fde68a', countBg: 'bg-amber-100 dark:bg-amber-900/40', countC: 'text-amber-700 dark:text-amber-300', ring: '#f59e0b' }
                          : i === 1
                          ? { numC: '#b45309', rowBg: 'bg-orange-50 dark:bg-orange-900/20', rowBorder: 'border-orange-100 dark:border-orange-800/40', barC: '#fed7aa', countBg: 'bg-orange-100 dark:bg-orange-900/40', countC: 'text-orange-700 dark:text-orange-300', ring: '#fb923c' }
                          : i === 2
                          ? { numC: '#a16207', rowBg: 'bg-yellow-50 dark:bg-yellow-900/20', rowBorder: 'border-yellow-100 dark:border-yellow-800/40', barC: '#fef08a', countBg: 'bg-yellow-100 dark:bg-yellow-900/40', countC: 'text-yellow-700 dark:text-yellow-300', ring: '#eab308' }
                          : { numC: '#64748b', rowBg: 'bg-slate-50 dark:bg-slate-800/60', rowBorder: 'border-slate-100 dark:border-slate-700/50', barC: '#cbd5e1', countBg: 'bg-slate-100 dark:bg-slate-700', countC: 'text-slate-500 dark:text-slate-400', ring: '#cbd5e1' }
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.07 }}
                            className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl overflow-hidden border ${accent.rowBg} ${accent.rowBorder} cursor-default`}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.2 + i * 0.08, duration: 1, ease: 'easeOut' }}
                              className="absolute inset-y-0 left-0 rounded-xl pointer-events-none opacity-25" style={{ background: accent.barC }} />
                            <span className="relative z-10 text-xs font-black w-5 text-center flex-shrink-0 tabular-nums" style={{ color: accent.numC }}>{i + 1}</span>
                            <Avatar src={s.foto_url} name={s.nama_lengkap} size={36}
                              className="relative z-10 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                              style={{ boxShadow: `0 0 0 2px ${accent.ring}` }} />
                            <div className="relative z-10 flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{s.nama_lengkap}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{s.kelas?.nama_kelas || '-'}</p>
                            </div>
                            <div className={`relative z-10 flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${accent.countBg} ${accent.countC}`}>
                              {s.absensis_count}·
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* -- ALPHA -- */}
              {activeRankingTab === 'alpha' && (
                <motion.div key="alpha" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.18 }}>
                  {rankingAlpha.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center">
                        <CheckCircle size={20} className="text-emerald-500" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Semua siswa hadir</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Tidak ada siswa alpha bulan ini</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {rankingAlpha.slice(0, 5).map((s, i) => {
                          const maxAlpha = rankingAlpha[0]?.absensis_count || 1
                          const pct = Math.round((s.absensis_count / maxAlpha) * 100)
                          const accent = i === 0
                            ? { numC: '#be123c', rowBg: 'bg-rose-50 dark:bg-rose-900/20', rowBorder: 'border-rose-100 dark:border-rose-800/40', barC: '#fda4af', countBg: 'bg-rose-100 dark:bg-rose-900/40', countC: 'text-rose-700 dark:text-rose-300', ring: '#fda4af' }
                            : i === 1
                            ? { numC: '#c2410c', rowBg: 'bg-orange-50 dark:bg-orange-900/20', rowBorder: 'border-orange-100 dark:border-orange-800/40', barC: '#fdba74', countBg: 'bg-orange-100 dark:bg-orange-900/40', countC: 'text-orange-700 dark:text-orange-300', ring: '#fdba74' }
                            : i === 2
                            ? { numC: '#b45309', rowBg: 'bg-amber-50 dark:bg-amber-900/20', rowBorder: 'border-amber-100 dark:border-amber-800/40', barC: '#fcd34d', countBg: 'bg-amber-100 dark:bg-amber-900/40', countC: 'text-amber-700 dark:text-amber-300', ring: '#fcd34d' }
                            : { numC: '#64748b', rowBg: 'bg-slate-50 dark:bg-slate-800/60', rowBorder: 'border-slate-100 dark:border-slate-700/50', barC: '#cbd5e1', countBg: 'bg-slate-100 dark:bg-slate-700', countC: 'text-slate-500 dark:text-slate-400', ring: '#cbd5e1' }
                          return (
                            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.07 }}
                              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl overflow-hidden border ${accent.rowBg} ${accent.rowBorder} cursor-default`}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.2 + i * 0.08, duration: 1, ease: 'easeOut' }}
                                className="absolute inset-y-0 left-0 rounded-xl pointer-events-none opacity-25" style={{ background: accent.barC }} />
                              <span className="relative z-10 text-xs font-black w-5 text-center flex-shrink-0 tabular-nums" style={{ color: accent.numC }}>{i + 1}</span>
                              <Avatar src={s.foto_url} name={s.nama_lengkap} size={36}
                                className="relative z-10 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                                style={{ boxShadow: `0 0 0 2px ${accent.ring}` }} />
                              <div className="relative z-10 flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{s.nama_lengkap}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{s.kelas?.nama_kelas || '-'}</p>
                              </div>
                              <div className={`relative z-10 flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${accent.countBg} ${accent.countC}`}>
                                {s.absensis_count}·
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0 animate-pulse" />
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{rankingAlpha.length} siswa perlu perhatian bulan ini</p>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

      </motion.div>
      )}
      {/* -- KELAS TERBAIK + ABSENSI GURU -- */}
      {selectedView === 'overview' && grafikPerKelas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-xl overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <School className="text-white" size={16} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Kehadiran Per Kelas</h3>
                <p className="text-[10px] text-slate-400">{periodLabel} · {grafikPerKelas.length} kelas aktif</p>
              </div>
            </div>
            <Link to="/admin/kelas" className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Kelola <ChevronRight size={12} />
            </Link>
          </div>
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {grafikPerKelas.slice(0, 8).map((kelas, i) => {
                const pct = kelas.persentase || 0
                const color = pct >= 80 ? { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
                  : pct >= 60 ? { bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
                  : { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/20' }
                return (
                  <motion.div
                    key={kelas.kelas || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.04 }}
                    whileHover={{ y: -2 }}
                    className={`rounded-xl border ${color.border} ${color.bg} p-3 cursor-default`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate flex-1">{kelas.kelas}</p>
                      <span className={`text-sm font-black ${color.text} ml-2`}>{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/60 dark:bg-slate-700/60 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                        className={`h-full ${color.bar} rounded-full`}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{kelas.hadir} / {kelas.total_siswa} hadir</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* -- LIVE ACTIVITY + SUMMARY METRICS -- */}
      {selectedView === 'overview' && absensiTerbaru.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Live Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Header · gradient emerald */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 sm:px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <Activity className="text-white" size={15} />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-white rounded-full border-2 border-emerald-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Aktivitas Terkini</h3>
                  <p className="text-[10px] text-emerald-100">Live absensi {periodLabel}</p>
                </div>
              </div>
              <Link to="/admin/absensis" className="text-[10px] text-white/80 font-semibold flex items-center gap-1 hover:text-white hover:gap-2 transition-all bg-white/15 px-2.5 py-1 rounded-lg">
                Semua <ChevronRight size={11} />
              </Link>
            </div>
            {/* Body */}
            <div className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700/40 max-h-[300px] overflow-y-auto">
              {absensiTerbaru.slice(0, 8).map((a, i) => {
                const statusConfig = {
                  hadir:     { pill: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-500', row: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10', icon: CheckCircle },
                  terlambat: { pill: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',         bar: 'bg-amber-500',   row: 'hover:bg-amber-50 dark:hover:bg-amber-900/10',   icon: Clock },
                  izin:      { pill: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',             bar: 'bg-blue-500',    row: 'hover:bg-blue-50 dark:hover:bg-blue-900/10',     icon: FileText },
                  sakit:     { pill: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',     bar: 'bg-purple-500',  row: 'hover:bg-purple-50 dark:hover:bg-purple-900/10', icon: Heart },
                  alpha:     { pill: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',                 bar: 'bg-red-500',     row: 'hover:bg-red-50 dark:hover:bg-red-900/10',       icon: AlertTriangle },
                }
                const cfg = statusConfig[a.status] || statusConfig.alpha
                const StatusIcon = cfg.icon
                return (
                  <motion.div
                    key={a.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`relative flex items-center gap-3 px-4 py-2.5 ${cfg.row} transition-colors`}
                  >
                    {/* Left status bar */}
                    <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full ${cfg.bar}`}/>
                    <Avatar src={a.siswa?.foto_url} name={a.siswa?.nama_lengkap || a.nama_lengkap}
                      size={32} className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                        {a.siswa?.nama_lengkap || a.nama_lengkap || '-'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {a.siswa?.kelas?.nama_kelas || '-'} · {a.tanggal ? new Date(a.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.pill}`}>
                      <StatusIcon size={9}/>
                      {a.status_label || a.status}
                    </div>
                    {a.jam_masuk && (
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 hidden sm:block">{a.jam_masuk?.substring(0, 5)}</span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Summary Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Header · gradient violet */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 sm:px-5 py-3.5 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="text-white" size={15} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Ringkasan Cepat</h3>
                <p className="text-[10px] text-violet-100">{periodLabel}</p>
              </div>
            </div>
            {/* Body */}
            <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/90 p-3 space-y-1.5">
              {[
                { label: 'Total Absensi', value: siswaHadir + siswaTerlambat + siswaIzin + siswaSakit + siswaAlpha, icon: Hash, color: 'text-slate-700 dark:text-slate-100', bg: 'bg-slate-100 dark:bg-slate-700', bar: 'bg-slate-500', border: 'border-l-4 border-slate-400' },
                { label: 'Tepat Waktu', value: siswaHadir, icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-100 dark:bg-emerald-900/40', bar: 'bg-emerald-500', border: 'border-l-4 border-emerald-500' },
                { label: 'Terlambat', value: siswaTerlambat, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-100 dark:bg-amber-900/40', bar: 'bg-amber-500', border: 'border-l-4 border-amber-500' },
                { label: 'Tidak Hadir', value: siswaIzin + siswaSakit + siswaAlpha, icon: XCircle, color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-900/40', bar: 'bg-red-500', border: 'border-l-4 border-red-500' },
                { label: 'Izin Pending', value: izinPending, icon: Bell, color: 'text-orange-700', bg: 'bg-orange-100 dark:bg-orange-900/40', bar: 'bg-orange-500', border: 'border-l-4 border-orange-500' },
                { label: 'Izin Disetujui', value: izinApproved, icon: Shield, color: 'text-blue-700', bg: 'bg-blue-100 dark:bg-blue-900/40', bar: 'bg-blue-500', border: 'border-l-4 border-blue-500' },
              ].map((item, i) => {
                const total = Math.max(totalSiswa, 1)
                const pct = Math.min(100, Math.round((item.value / total) * 100))
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${item.bg} ${item.border} transition-colors`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <item.icon size={13} className={`${item.color} flex-shrink-0`} />
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold ${item.color} truncate`}>{item.label}</p>
                        <div className="w-16 h-1 bg-black/10 rounded-full mt-0.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                            className={`h-full rounded-full ${item.bar}`}
                          />
                        </div>
                      </div>
                    </div>
                    <span className={`text-lg font-black ${item.color} flex-shrink-0 ml-2`}>{item.value}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* -- TREND AREA CHART + DONUT BREAKDOWN -- */}
      {selectedView === 'overview' && chartData.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Area trend chart · 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 sm:px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp size={13} className="text-white"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Tren Kehadiran</p>
                  <p className="text-[10px] text-indigo-100">{periodLabel}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendHadir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="trendAlpha" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="trendTerlambat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.1} vertical={false}/>
                  <XAxis dataKey="hari" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }}/>
                  <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} width={25}/>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', fontSize: '11px', color: '#fff' }}/>
                  <Area type="monotone" dataKey="hadir" stroke="#10B981" strokeWidth={2} fill="url(#trendHadir)" name="Hadir" dot={false}/>
                  <Area type="monotone" dataKey="terlambat" stroke="#F59E0B" strokeWidth={1.5} fill="url(#trendTerlambat)" name="Terlambat" dot={false}/>
                  <Area type="monotone" dataKey="alpha" stroke="#EF4444" strokeWidth={1.5} fill="url(#trendAlpha)" name="Alpha" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 justify-center">
                {[{c:'#10B981',l:'Hadir'},{c:'#F59E0B',l:'Terlambat'},{c:'#EF4444',l:'Alpha'}].map(i => (
                  <div key={i.l} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{background:i.c}}/>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{i.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Donut breakdown · 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-4 sm:px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <PieChartIcon size={13} className="text-white"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Komposisi Status</p>
                  <p className="text-[10px] text-rose-100">{periodLabel}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 flex flex-col items-center">
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                        paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2}/>
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', fontSize: '11px', color: '#fff' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full space-y-1.5 mt-1">
                    {pieData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:item.color}}/>
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{width:`${totalSiswa>0?Math.round(item.value/totalSiswa*100):0}%`, background:item.color}}/>
                          </div>
                          <span className="text-[10px] font-bold w-6 text-right" style={{color:item.color}}>{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-40 text-slate-400">
                  <p className="text-sm">Belum ada data</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* -- IZIN PENDING ALERT -- */}
      {selectedView === 'overview' && izinPending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 sm:p-5 text-white shadow-xl shadow-amber-500/20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.div animate={{ scale: [1,1.1,1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="text-white" size={20} />
              </motion.div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  {izinPending} Izin Menunggu Persetujuan
                </h3>
                <p className="text-amber-100 text-xs mt-0.5">
                  Disetujui: {izinApproved} · Ditolak: {izinRejected} · Sakit: {izinSakit} · Biasa: {izinBiasa}
                </p>
              </div>
            </div>
            <Link to="/admin/izins"
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-xl font-semibold text-xs hover:bg-amber-50 transition-all shadow-lg flex-shrink-0">
              Kelola Izin <ChevronRight size={13} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Inline styles */}
      <style jsx>{`
        .bg-radial-gradient {
          background: radial-gradient(circle at center, transparent 0%, rgba(16,185,129,0.1) 100%);
        }
        .dark .bg-radial-gradient {
          background: radial-gradient(circle at center, transparent 0%, rgba(52,211,153,0.1) 100%);
        }
      `}</style>
    </motion.div>
  )
}