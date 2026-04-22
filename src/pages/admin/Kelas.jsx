import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  School, 
  BookOpen, 
  Calendar,
  Layers,
  Hash,
  CheckCircle,
  XCircle,
  ChevronDown,
  Archive,
  Users,
  GraduationCap,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Hexagon,
  CircleDot,
  Gauge,
  Sparkles
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import AdminStatCard from '../../components/AdminStatCard'
import { adminApi } from '../../services/adminService'
import { confirmDelete, showSuccess } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'
import Select from 'react-select'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'

// ============= 4 VARIASI CHART UNTUK 4 CARD KELAS - EMERALD =============

// 1. Wave Chart - Gelombang (untuk Total Kelas)
const WaveChart = ({ data, color = '#10B981' }) => {
  const chartData = data.map((value, index) => ({ name: index, value }))
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`waveKelas-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#waveKelas-${color.replace('#', '')})`}
          dot={false}
          animationDuration={1000}
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// 2. Gauge Chart - Lingkaran Progress (untuk Kelas Aktif)
const GaugeChart = ({ percentage = 85, color = '#10B981' }) => {
  const data = [
    { name: 'Progress', value: percentage, fill: color },
    { name: 'Remaining', value: 100 - percentage, fill: 'transparent' }
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="60%"
        outerRadius="90%"
        barSize={6}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar
          background={{ fill: '#E2E8F0', opacity: 0.2 }}
          dataKey="value"
          cornerRadius={3}
          animationDuration={1200}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}

// 3. Bar Chart - Batang (untuk Total Jurusan)
const BarChartMini = ({ data, color = '#8B5CF6' }) => {
  const chartData = data.map((value, index) => ({ name: index, value }))
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`barKelas-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
            <stop offset="100%" stopColor={color} stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <Bar
          dataKey="value"
          fill={`url(#barKelas-${color.replace('#', '')})`}
          radius={[3, 3, 0, 0]}
          maxBarSize={6}
          animationDuration={1000}
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// 4. Sparkline Chart - Garis (untuk Tahun Ajaran)
const SparklineChart = ({ data, color = '#10B981' }) => {
  const chartData = data.map((value, index) => ({ name: index, value }))
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          animationDuration={1000}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ============= MAIN STAT CARD COMPONENT - EMERALD =============

const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color = 'emerald', 
  trend, 
  trendValue,
  chartType = 'wave',
  chartData = [20, 35, 25, 40, 30, 45, 35],
  percentage
}) => {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30 dark:border-emerald-500/30',
      chart: '#10B981'
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30 dark:border-purple-500/30',
      chart: '#8B5CF6'
    },
    orange: {
      bg: 'bg-orange-500/10 dark:bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/30 dark:border-orange-500/30',
      chart: '#F59E0B'
    },
    pink: {
      bg: 'bg-pink-500/10 dark:bg-pink-500/10',
      text: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-500/30 dark:border-pink-500/30',
      chart: '#A855F7'
    }
  }

  const classes = colorClasses[color] || colorClasses.emerald
  const chartColor = classes.chart

  // Render chart berdasarkan tipe
  const renderChart = () => {
    switch (chartType) {
      case 'wave':
        return <WaveChart data={chartData} color={chartColor} />
      case 'gauge':
        return <GaugeChart percentage={percentage || 85} color={chartColor} />
      case 'bar':
        return <BarChartMini data={chartData} color={chartColor} />
      case 'sparkline':
        return <SparklineChart data={chartData} color={chartColor} />
      default:
        return <WaveChart data={chartData} color={chartColor} />
    }
  }

  return (
    <div
      className={`relative overflow-hidden ${classes.bg} rounded-xl border ${classes.border} p-4 shadow-sm hover:shadow-md transition-all duration-200`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.03)_0%,transparent_50%)]" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 bg-white dark:bg-slate-800 rounded-lg border ${classes.border} shadow-sm`}>
            <Icon size={16} className={classes.text} />
          </div>
          
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-medium">
              <span className={trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}>
                {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </span>
              <span className={trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}>
                {trendValue}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
              {label}
            </p>
            <p className={`text-lg sm:text-xl font-bold ${classes.text}`}>
              {value}
            </p>
          </div>
          
          {/* Chart Area - Sama ukuran untuk semua card */}
          <div className="w-14 h-14 flex-shrink-0">
            {renderChart()}
          </div>
        </div>

        {/* Bottom Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-20" />
      </div>
    </div>
  )
}

// Badge Components - EMERALD
const StatusBadge = ({ isActive }) => {
  return isActive ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-medium border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm">
      <CheckCircle size={10} className="mr-0.5" />
      <span>Aktif</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg text-[10px] font-medium border border-orange-500/30 dark:border-orange-500/30 shadow-sm">
      <XCircle size={10} className="mr-0.5" />
      <span>Nonaktif</span>
    </span>
  )
}

const TingkatBadge = ({ tingkat }) => {
  const labels = {
    10: 'Kelas 10',
    11: 'Kelas 11', 
    12: 'Kelas 12'
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-medium border border-purple-500/30 dark:border-purple-500/30 shadow-sm">
      <Layers size={10} className="mr-0.5" />
      <span>{labels[tingkat] || `Kelas ${tingkat}`}</span>
    </span>
  )
}

// Action Buttons - EMERALD
const ActionButtons = ({ row, onView, onEdit, onDelete }) => (
  <div className="flex items-center gap-0.5">
    <button
      onClick={() => onView(row)}
      className="p-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-400 rounded-lg transition-all border border-purple-500/30 dark:border-purple-500/30 shadow-sm hover:shadow-md"
      title="Lihat Detail"
    >
      <Eye size={14} />
    </button>
    <button
      onClick={() => onEdit(row)}
      className="p-1 bg-slate-100/80 hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-600 dark:bg-slate-800/50 dark:hover:bg-emerald-500/20 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg transition-all border border-slate-200/60 dark:border-slate-700/50 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 shadow-sm hover:shadow-md"
      title="Edit"
    >
      <Edit2 size={14} />
    </button>
    <button
      onClick={() => onDelete(row)}
      className="p-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 dark:text-orange-400 rounded-lg transition-all border border-orange-500/30 dark:border-orange-500/30 shadow-sm hover:shadow-md"
      title="Hapus"
    >
      <Trash2 size={14} />
    </button>
  </div>
)

export default function Kelas() {
  const [kelas, setKelas] = useState([])
  const [jurusans, setJurusans] = useState([])
  const [tahunAjarans, setTahunAjarans] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingKelas, setViewingKelas] = useState(null)
  const [editingKelas, setEditingKelas] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    aktif: 0,
    total_jurusan: 0,
    total_tahun_ajaran: 0,
  })
  const [formData, setFormData] = useState({
    kode_kelas: '',
    nama_kelas: '',
    jurusan_id: '',
    tahun_ajaran_id: '',
    tingkat: 10,
    is_active: true,
  })

  // Data untuk chart (simulasi - masing-masing berbeda polanya)
  const [totalKelasData] = useState([12, 15, 18, 22, 25, 28, 32]) // wave - tren naik
  const [jurusanData] = useState([4, 5, 6, 6, 7, 7, 8]) // bar - meningkat bertahap
  const [tahunAjaranData] = useState([1, 1, 2, 2, 3, 3, 4]) // sparkline - step

  useEffect(() => {
    fetchKelas()
    fetchJurusans()
    fetchTahunAjarans()
    fetchStats()
  }, [currentPage, search])

  const fetchStats = async () => {
    try {
      const response = await adminApi.getKelasStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchKelas = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getKelas({
        page: currentPage,
        search: search,
        per_page: 48,
      })
      const res = response.data
      setKelas(Array.isArray(res?.data) ? res.data : [])
      setPagination(res?.pagination || null)
    } catch (error) {
      toast.error('Gagal memuat data kelas')
    } finally {
      setLoading(false)
    }
  }

  const fetchJurusans = async () => {
    try {
      const response = await adminApi.getAllJurusans()
      const jurusanData = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : [])
      setJurusans(jurusanData.map(j => ({
        value: j.id,
        label: j.nama_jurusan
      })))
    } catch (error) {
      console.error('Error fetching jurusans:', error)
    }
  }

  const fetchTahunAjarans = async () => {
    try {
      const response = await adminApi.getAllTahunAjarans()
      const tahunData = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : [])
      setTahunAjarans(tahunData.map(t => ({
        value: t.id,
        label: `${t.tahun_ajaran} - Semester ${t.semester}`
      })))
    } catch (error) {
      console.error('Error fetching tahun ajarans:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingKelas) {
        await adminApi.updateKelas(editingKelas.id, formData)
        toast.success('Kelas berhasil diperbarui')
      } else {
        await adminApi.createKelas(formData)
        toast.success('Kelas berhasil ditambahkan')
      }
      setIsModalOpen(false)
      resetForm()
      fetchKelas()
      fetchStats()
    } catch (error) {
      const message = error.response?.data?.message || 'Terjadi kesalahan'
      toast.error(message)
    }
  }

  const handleDelete = async (item) => {
    if (await confirmDelete('Hapus kelas ini?', 'Kelas akan dihapus dari sistem')) {
      try {
        await adminApi.deleteKelas(item.id)
        showSuccess('Kelas berhasil dihapus')
        fetchKelas()
        fetchStats()
      } catch (error) {
        const msg = error.response?.data?.message || 'Gagal menghapus kelas'
        toast.error(msg)
      }
    }
  }

  const handleViewDetail = (kelas) => {
    setViewingKelas(kelas)
    setIsDetailModalOpen(true)
  }

  const openModal = (item = null) => {
    if (item) {
      setEditingKelas(item)
      setFormData({
        kode_kelas: item.kode_kelas || '',
        nama_kelas: item.nama_kelas || '',
        jurusan_id: item.jurusan?.id || '',
        tahun_ajaran_id: item.tahun_ajaran?.id || '',
        tingkat: item.tingkat || 10,
        is_active: item.is_active,
      })
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingKelas(null)
    setFormData({
      kode_kelas: '',
      nama_kelas: '',
      jurusan_id: '',
      tahun_ajaran_id: '',
      tingkat: 10,
      is_active: true,
    })
  }

  const getTingkatLabel = (tingkat) => {
    const labels = {
      10: 'Kelas 10',
      11: 'Kelas 11',
      12: 'Kelas 12'
    }
    return labels[tingkat] || `Kelas ${tingkat}`
  }

  const columns = [
    { 
      header: 'Kode', 
      accessor: 'kode_kelas',
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 bg-purple-500/20 dark:bg-purple-500/20 rounded-lg border border-purple-500/30 dark:border-purple-500/30 flex-shrink-0">
            <Hash size={12} className="text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-mono text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            {row.kode_kelas}
          </span>
        </div>
      )
    },
    { 
      header: 'Nama Kelas', 
      accessor: 'nama_kelas',
      cell: (row) => (
        <div className="font-medium text-xs text-slate-900 dark:text-white truncate max-w-[120px]">
          {row.nama_kelas}
        </div>
      )
    },
    {
      header: 'Jurusan',
      accessor: 'jurusan',
      cell: (row) => (
        <div className="hidden md:flex items-center gap-1">
          <BookOpen size={12} className="text-purple-500 flex-shrink-0" />
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
            {row.jurusan?.nama_jurusan || '-'}
          </span>
        </div>
      ),
    },
    {
      header: 'Tingkat',
      accessor: 'tingkat',
      cell: (row) => <TingkatBadge tingkat={row.tingkat} />,
    },
    {
      header: 'Tahun Ajaran',
      accessor: 'tahun_ajaran',
      cell: (row) => (
        <div className="hidden lg:flex items-center gap-1">
          <Calendar size={12} className="text-purple-500 flex-shrink-0" />
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
            {row.tahun_ajaran?.tahun_ajaran || '-'}
          </span>
          {row.tahun_ajaran?.semester && (
            <span className="text-[8px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/60 px-1 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
              SMT {row.tahun_ajaran.semester}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      cell: (row) => <StatusBadge isActive={row.is_active} />,
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <ActionButtons 
          row={row}
          onView={handleViewDetail}
          onEdit={openModal}
          onDelete={handleDelete}
        />
      ),
    },
  ]

  // Stats cards
  const statsCards = [
    { label:'Total Kelas',    value:stats.total,             icon:School,       color:'#10b981', border:'border-emerald-100 dark:border-emerald-800/40', tc:'text-emerald-600 dark:text-emerald-400', iconBg:'bg-emerald-50 dark:bg-emerald-900/30', delay:0,    sparkType:'area' },
    { label:'Kelas Aktif',    value:stats.aktif,             icon:CheckCircle,  color:'#3b82f6', border:'border-blue-100 dark:border-blue-800/40',       tc:'text-blue-600 dark:text-blue-400',       iconBg:'bg-blue-50 dark:bg-blue-900/30',       delay:0.05, sparkType:'bar' },
    { label:'Total Jurusan',  value:stats.total_jurusan,     icon:BookOpen,     color:'#8b5cf6', border:'border-violet-100 dark:border-violet-800/40',   tc:'text-violet-600 dark:text-violet-400',   iconBg:'bg-violet-50 dark:bg-violet-900/30',   delay:0.1,  sparkType:'bar' },
    { label:'Tahun Ajaran',   value:stats.total_tahun_ajaran,icon:Calendar,     color:'#f59e0b', border:'border-amber-100 dark:border-amber-800/40',     tc:'text-amber-600 dark:text-amber-400',     iconBg:'bg-amber-50 dark:bg-amber-900/30',     delay:0.15, sparkType:'area' },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 px-3 sm:px-4 lg:px-6 py-4">
      {/* Page Header */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <School size={17} className="text-emerald-600 dark:text-emerald-400"/>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Kelas</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{stats.total} kelas Â· {stats.aktif} aktif Â· {stats.total_jurusan} jurusan</p>
          </div>
        </div>
        <button onClick={() => openModal()}
          className="px-3 py-1.5 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold" style={{ background:'#10b981' }}>
          <Plus size={12}/><span className="hidden sm:inline">Tambah Kelas</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map(s => <AdminStatCard key={s.label} {...s}/>)}
      </div>

      {/* Table */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-6 h-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <School size={12} className="text-emerald-500"/>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Daftar Kelas</p>
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-bold">{pagination?.total || kelas.length}</span>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={kelas}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onSearch={setSearch}
            loading={loading}
            searchPlaceholder="Cari kode atau nama kelas..."
          />
        </div>
      </motion.div>

      {/* Modal Detail - EMERALD */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false)
              setViewingKelas(null)
            }}
            title={
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30">
                  <Eye size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Detail Kelas</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Informasi lengkap kelas</p>
                </div>
              </div>
            }
            size="md"
          >
            {viewingKelas && (
              <div className="space-y-5 p-5">
                {/* Header Info */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 text-center shadow-md">
                  <h2 className="text-lg font-semibold text-white truncate">
                    {viewingKelas.nama_kelas}
                  </h2>
                  <p className="text-xs text-white/80 mt-0.5 font-mono">
                    {viewingKelas.kode_kelas}
                  </p>
                </div>

                {/* Data Detail */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50 shadow-inner">
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <BookOpen size={10} className="text-emerald-500" />
                      Jurusan
                    </p>
                    <p className="font-medium text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingKelas.jurusan?.nama_jurusan || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <Layers size={10} className="text-emerald-500" />
                      Tingkat
                    </p>
                    <p className="font-medium text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {getTingkatLabel(viewingKelas.tingkat)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <CheckCircle size={10} className="text-emerald-500" />
                      Status
                    </p>
                    <StatusBadge isActive={viewingKelas.is_active} />
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <Calendar size={10} className="text-emerald-500" />
                      Tahun Ajaran
                    </p>
                    <p className="font-medium text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingKelas.tahun_ajaran?.tahun_ajaran || '-'} - Semester {viewingKelas.tahun_ajaran?.semester || '-'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      openModal(viewingKelas)
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all text-xs font-medium"
                  >
                    <Edit2 size={14} />
                    Edit Data
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Form - EMERALD */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              resetForm()
            }}
            title={
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30">
                  {editingKelas ? <Edit2 size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    {editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingKelas ? 'Ubah data kelas yang sudah ada' : 'Isi form untuk menambah kelas baru'}
                  </p>
                </div>
              </div>
            }
            maxWidth="max-w-md"
          >
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {/* Kode Kelas */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kode Kelas <span className="text-emerald-500">*</span>
                </label>
                <div className="relative group">
                  <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                  <input
                    type="text"
                    required
                    value={formData.kode_kelas}
                    onChange={(e) => setFormData({ ...formData, kode_kelas: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="Contoh: X-RPL-1"
                  />
                </div>
              </div>

              {/* Nama Kelas */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kelas <span className="text-emerald-500">*</span>
                </label>
                <div className="relative group">
                  <School className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                  <input
                    type="text"
                    required
                    value={formData.nama_kelas}
                    onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="Contoh: X RPL 1"
                  />
                </div>
              </div>

              {/* Jurusan */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Jurusan <span className="text-emerald-500">*</span>
                </label>
                <Select
                  options={jurusans}
                  value={jurusans.find(j => j.value === formData.jurusan_id)}
                  onChange={(option) => setFormData({ ...formData, jurusan_id: option?.value })}
                  placeholder="Pilih jurusan"
                  className="react-select-container text-xs"
                  classNamePrefix="react-select"
                  required
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.5rem',
                      borderWidth: '1px',
                      borderColor: '#e2e8f0',
                      padding: '0.125rem 0',
                      boxShadow: 'none',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      minHeight: '36px',
                      '&:hover': {
                        borderColor: '#10B981'
                      }
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#10B981' : state.isFocused ? '#D1FAE5' : 'white',
                      color: state.isSelected ? 'white' : '#1e293b',
                      fontSize: '12px',
                    })
                  }}
                />
              </div>

              {/* Tahun Ajaran */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tahun Ajaran <span className="text-emerald-500">*</span>
                </label>
                <Select
                  options={tahunAjarans}
                  value={tahunAjarans.find(t => t.value === formData.tahun_ajaran_id)}
                  onChange={(option) => setFormData({ ...formData, tahun_ajaran_id: option?.value })}
                  placeholder="Pilih tahun ajaran"
                  className="react-select-container text-xs"
                  classNamePrefix="react-select"
                  required
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.5rem',
                      borderWidth: '1px',
                      borderColor: '#e2e8f0',
                      padding: '0.125rem 0',
                      boxShadow: 'none',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      minHeight: '36px',
                      '&:hover': {
                        borderColor: '#10B981'
                      }
                    })
                  }}
                />
              </div>

              {/* Tingkat */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tingkat <span className="text-emerald-500">*</span>
                </label>
                <div className="relative group">
                  <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                  <select
                    value={formData.tingkat}
                    onChange={(e) => setFormData({ ...formData, tingkat: parseInt(e.target.value) })}
                    className="w-full pl-8 pr-8 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white appearance-none hover:border-slate-300 dark:hover:border-slate-600"
                    required
                  >
                    <option value={10}>Kelas 10</option>
                    <option value={11}>Kelas 11</option>
                    <option value={12}>Kelas 12</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Active Status - Custom Checkbox */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                <label className="checkbox-custom flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span className="checkmark" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Kelas aktif (dapat digunakan)
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-lg shadow-emerald-500/30 transition-all"
                >
                  {editingKelas ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Inline styles */}
      <style jsx>{`
        .text-gradient-emerald {
          background: linear-gradient(135deg, #10B981 0%, #059669 50%, #10B981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dark .text-gradient-emerald {
          background: linear-gradient(135deg, #34D399 0%, #10B981 50%, #34D399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .checkbox-custom {
          display: inline-flex;
          align-items: center;
          position: relative;
        }
        .checkbox-custom input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        .checkbox-custom .checkmark {
          display: inline-block;
          width: 16px;
          height: 16px;
          background: white;
          border: 2px solid #10B981;
          border-radius: 4px;
          position: relative;
          transition: all 0.2s;
        }
        .dark .checkbox-custom .checkmark {
          background: #1F3A44;
          border-color: #34D399;
        }
        .checkbox-custom input:checked ~ .checkmark {
          background: #10B981;
          border-color: #10B981;
        }
        .checkbox-custom input:checked ~ .checkmark:after {
          content: '';
          position: absolute;
          left: 4px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .checkbox-custom:hover .checkmark {
          border-color: #34D399;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
      `}</style>
    </div>
  )
}
