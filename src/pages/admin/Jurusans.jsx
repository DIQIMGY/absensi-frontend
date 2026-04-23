import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Hash,
  FileText,
  CheckCircle,
  XCircle,
  Layers,
  BookMarked,
  Briefcase,
  ChevronDown,
  Info,
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
  Sparkles,
  Users,
  Award
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import AdminStatCard from '../../components/AdminStatCard'
import { adminApi } from '../../services/adminService'
import { confirmDelete, showSuccess } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'
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

// ============= 3 VARIASI CHART UNTUK 3 CARD JURUSAN - EMERALD =============

// 1. Wave Chart - Gelombang (untuk Total Jurusan)
const WaveChart = ({ data, color = '#10B981' }) => {
  const chartData = data.map((value, index) => ({ name: index, value }))
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`waveJurusan-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#waveJurusan-${color.replace('#', '')})`}
          dot={false}
          animationDuration={1000}
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// 2. Bar Chart - Batang (untuk Jurusan Aktif)
const BarChartMini = ({ data, color = '#10B981' }) => {
  const chartData = data.map((value, index) => ({ name: index, value }))
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`barJurusan-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <Bar
          dataKey="value"
          fill={`url(#barJurusan-${color.replace('#', '')})`}
          radius={[4, 4, 0, 0]}
          maxBarSize={8}
          animationDuration={1000}
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// 3. Sparkline Chart - Garis (untuk Jurusan Nonaktif)
const SparklineChart = ({ data, color = '#F59E0B' }) => {
  const chartData = data.map((value, index) => ({ name: index, value }))
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`lineJurusan-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          strokeDasharray="3 3"
          animationDuration={1000}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ============= MAIN STAT CARD COMPONENT - PREMIUM EMERALD =============

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
      chart: '#10B981',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30 dark:border-purple-500/30',
      chart: '#8B5CF6',
      gradient: 'from-purple-500 to-purple-600'
    },
    orange: {
      bg: 'bg-orange-500/10 dark:bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/30 dark:border-orange-500/30',
      chart: '#F59E0B',
      gradient: 'from-orange-500 to-orange-600'
    }
  }

  const classes = colorClasses[color]
  const chartColor = classes.chart

  // Render chart berdasarkan tipe
  const renderChart = () => {
    switch (chartType) {
      case 'wave':
        return <WaveChart data={chartData} color={chartColor} />
      case 'bar':
        return <BarChartMini data={chartData} color={chartColor} />
      case 'sparkline':
        return <SparklineChart data={chartData} color={chartColor} />
      default:
        return <WaveChart data={chartData} color={chartColor} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden ${classes.bg} rounded-2xl border ${classes.border} p-5 shadow-sm hover:shadow-md transition-all duration-200 group`}
    >
      {/* Animated Gradient Border - Emerald */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.03)_0%,transparent_50%)]" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className={`p-2.5 bg-white dark:bg-slate-800 rounded-xl border ${classes.border} shadow-sm transition-all group-hover:shadow-md`}
          >
            <Icon size={18} className={classes.text} />
          </motion.div>
          
          {trend && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-xs font-medium"
            >
              <span className={trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}>
                {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </span>
              <span className={trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}>
                {trendValue}
              </span>
            </motion.div>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              {label}
            </p>
            <motion.p 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-2xl sm:text-3xl font-bold ${classes.text}`}
            >
              {value}
            </motion.p>
          </div>
          
          {/* Chart Area - Consistent size for all cards */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
            {renderChart()}
          </div>
        </div>

        {/* Animated Bottom Indicator - Emerald */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-40"
        />
      </div>
    </motion.div>
  )
}

// Badge Components - Premium Emerald
const StatusBadge = ({ isActive }) => {
  return isActive ? (
    <motion.span 
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center px-2.5 py-1 bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm"
    >
      <CheckCircle size={12} className="mr-1.5" />
      <span>Aktif</span>
    </motion.span>
  ) : (
    <motion.span 
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center px-2.5 py-1 bg-orange-500/20 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-medium border border-orange-500/30 dark:border-orange-500/30 shadow-sm"
    >
      <XCircle size={12} className="mr-1.5" />
      <span>Nonaktif</span>
    </motion.span>
  )
}

// Action Buttons - Premium Emerald
const ActionButtons = ({ row, onView, onEdit, onDelete }) => (
  <div className="flex items-center gap-1.5">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onView(row)}
      className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-400 rounded-lg transition-all border border-purple-500/30 dark:border-purple-500/30 shadow-sm hover:shadow-md"
      title="Lihat Detail"
    >
      <Eye size={16} />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onEdit(row)}
      className="p-1.5 bg-slate-100/80 hover:bg-emerald-500/20 text-slate-600 hover:text-emerald-600 dark:bg-slate-800/50 dark:hover:bg-emerald-500/20 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg transition-all border border-slate-200/60 dark:border-slate-700/50 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 shadow-sm hover:shadow-md"
      title="Edit"
    >
      <Edit2 size={16} />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onDelete(row)}
      className="p-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 dark:text-orange-400 rounded-lg transition-all border border-orange-500/30 dark:border-orange-500/30 shadow-sm hover:shadow-md"
      title="Hapus"
    >
      <Trash2 size={16} />
    </motion.button>
  </div>
)

export default function Jurusans() {
  const [jurusans, setJurusans] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingJurusan, setViewingJurusan] = useState(null)
  const [editingJurusan, setEditingJurusan] = useState(null)
  const [formData, setFormData] = useState({
    kode_jurusan: '',
    nama_jurusan: '',
    deskripsi: '',
    is_active: true,
  })

  // Data untuk chart (simulasi - masing-masing berbeda polanya)
  const [totalJurusanData] = useState([4, 5, 6, 7, 8, 9, 10]) // wave - tren naik
  const [aktifJurusanData] = useState([3, 4, 5, 6, 7, 8, 8]) // bar - meningkat
  const [nonaktifJurusanData] = useState([1, 1, 1, 1, 1, 1, 2]) // sparkline - stabil

  useEffect(() => {
    fetchJurusans()
  }, [currentPage, search])

  const fetchJurusans = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getJurusans({
        page: currentPage,
        search: search,
        per_page: 10,
      })
      const res = response.data
      setJurusans(Array.isArray(res?.data) ? res.data : [])
      setPagination(res?.pagination || null)
    } catch (error) {
      toast.error('Gagal memuat data jurusan')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingJurusan) {
        await adminApi.updateJurusan(editingJurusan.id, formData)
        toast.success('Jurusan berhasil diperbarui')
      } else {
        await adminApi.createJurusan(formData)
        toast.success('Jurusan berhasil ditambahkan')
      }
      setIsModalOpen(false)
      resetForm()
      fetchJurusans()
    } catch (error) {
      const message = error.response?.data?.message || 'Terjadi kesalahan'
      toast.error(message)
    }
  }

  const handleDelete = async (item) => {
    if (await confirmDelete('Hapus jurusan ini?', 'Jurusan akan dihapus dari sistem')) {
      try {
        await adminApi.deleteJurusan(item.id)
        showSuccess('Jurusan berhasil dihapus')
        fetchJurusans()
      } catch (error) {
        toast.error('Gagal menghapus jurusan')
      }
    }
  }

  const handleViewDetail = (jurusan) => {
    setViewingJurusan(jurusan)
    setIsDetailModalOpen(true)
  }

  const openModal = (item = null) => {
    if (item) {
      setEditingJurusan(item)
      setFormData({
        kode_jurusan: item.kode_jurusan || '',
        nama_jurusan: item.nama_jurusan || '',
        deskripsi: item.deskripsi || '',
        is_active: item.is_active,
      })
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingJurusan(null)
    setFormData({
      kode_jurusan: '',
      nama_jurusan: '',
      deskripsi: '',
      is_active: true,
    })
  }

  const columns = [
    { 
      header: 'Kode', 
      accessor: 'kode_jurusan',
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-purple-500/20 dark:bg-purple-500/20 rounded-lg border border-purple-500/30 dark:border-purple-500/30 flex-shrink-0">
            <Hash size={14} className="text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            {row.kode_jurusan}
          </span>
        </div>
      )
    },
    { 
      header: 'Nama Jurusan', 
      accessor: 'nama_jurusan',
      cell: (row) => (
        <div className="font-medium text-sm text-slate-900 dark:text-white truncate max-w-[180px]">
          {row.nama_jurusan}
        </div>
      )
    },
    { 
      header: 'Deskripsi', 
      accessor: 'deskripsi',
      cell: (row) => (
        <div className="hidden lg:flex items-start gap-2 max-w-xs">
          <FileText size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 truncate">
            {row.deskripsi || '-'}
          </p>
        </div>
      )
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
    { label:'Total Jurusan',    value:jurusans.length,                          icon:Briefcase,  color:'#10b981', border:'border-emerald-100 dark:border-emerald-800/40', tc:'text-emerald-600 dark:text-emerald-400', iconBg:'bg-emerald-50 dark:bg-emerald-900/30', delay:0,    sparkType:'area' },
    { label:'Jurusan Aktif',    value:jurusans.filter(j=>j.is_active).length,   icon:CheckCircle,color:'#3b82f6', border:'border-blue-100 dark:border-blue-800/40',       tc:'text-blue-600 dark:text-blue-400',       iconBg:'bg-blue-50 dark:bg-blue-900/30',       delay:0.05, sparkType:'bar' },
    { label:'Jurusan Nonaktif', value:jurusans.filter(j=>!j.is_active).length,  icon:XCircle,    color:'#f59e0b', border:'border-amber-100 dark:border-amber-800/40',     tc:'text-amber-600 dark:text-amber-400',     iconBg:'bg-amber-50 dark:bg-amber-900/30',     delay:0.1,  sparkType:'bar' },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">

      {/* Page Header */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <Briefcase size={17} className="text-emerald-600 dark:text-emerald-400"/>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Jurusan</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{jurusans.length} jurusan · {jurusans.filter(j=>j.is_active).length} aktif</p>
          </div>
        </div>
        <button onClick={() => openModal()}
          className="px-3 py-1.5 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold" style={{ background:'#10b981' }}>
          <Plus size={12}/><span className="hidden sm:inline">Tambah Jurusan</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statsCards.map(s => <AdminStatCard key={s.label} {...s}/>)}
      </div>

      {/* Table */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4">
          <DataTable
            columns={columns}
            data={jurusans}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onSearch={setSearch}
            loading={loading}
            searchPlaceholder="Cari kode atau nama jurusan..."
          />
        </div>
      </motion.div>

      {/* Modal Detail - Premium Emerald */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false)
              setViewingJurusan(null)
            }}
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30">
                  <Info size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Detail Jurusan</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Informasi lengkap jurusan</p>
                </div>
              </div>
            }
            size="md"
          >
            {viewingJurusan && (
              <div className="space-y-6 p-6">
                {/* Header Info - Gradient */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 text-center shadow-lg">
                  <p className="text-sm text-white/80 mb-1">Kode Jurusan</p>
                  <h2 className="text-2xl font-bold text-white truncate">
                    {viewingJurusan.kode_jurusan}
                  </h2>
                </div>

                {/* Data Detail */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-inner">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-1">
                      <Award size={12} className="text-emerald-500" />
                      Nama Jurusan
                    </p>
                    <p className="font-medium text-base text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingJurusan.nama_jurusan}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-1">
                      <FileText size={12} className="text-emerald-500" />
                      Deskripsi
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 leading-relaxed min-h-[80px]">
                      {viewingJurusan.deskripsi || 'Tidak ada deskripsi'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-1">
                      <CheckCircle size={12} className="text-emerald-500" />
                      Status
                    </p>
                    <StatusBadge isActive={viewingJurusan.is_active} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      openModal(viewingJurusan)
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all text-sm font-medium"
                  >
                    <Edit2 size={16} />
                    Edit Data
                  </motion.button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Form - Premium Emerald */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              resetForm()
            }}
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30">
                  {editingJurusan ? <Edit2 size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {editingJurusan ? 'Edit Jurusan' : 'Tambah Jurusan Baru'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingJurusan ? 'Ubah data jurusan yang sudah ada' : 'Isi form untuk menambah jurusan baru'}
                  </p>
                </div>
              </div>
            }
            maxWidth="max-w-md"
          >
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Kode Jurusan */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Kode Jurusan <span className="text-emerald-500">*</span>
                </label>
                <div className="relative group">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <input
                    type="text"
                    required
                    value={formData.kode_jurusan}
                    onChange={(e) => setFormData({ ...formData, kode_jurusan: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="Contoh: RPL"
                  />
                </div>
              </div>

              {/* Nama Jurusan */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Jurusan <span className="text-emerald-500">*</span>
                </label>
                <div className="relative group">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <input
                    type="text"
                    required
                    value={formData.nama_jurusan}
                    onChange={(e) => setFormData({ ...formData, nama_jurusan: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="Contoh: Rekayasa Perangkat Lunak"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Deskripsi
                </label>
                <div className="relative group">
                  <FileText className="absolute left-3 top-3 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    rows="3"
                    placeholder="Deskripsi jurusan (opsional)"
                  />
                </div>
              </div>

              {/* Active Status - Premium Toggle */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="peer w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-emerald-500 checked:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  />
                  <CheckCircle size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Jurusan aktif (dapat digunakan)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    resetForm()
                  }}
                  className="px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
                >
                  {editingJurusan ? 'Simpan Perubahan' : 'Tambah Jurusan'}
                </motion.button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

    </div>
  )
}