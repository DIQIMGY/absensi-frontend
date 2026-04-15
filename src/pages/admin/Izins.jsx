import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Trash2, 
  Filter, 
  Search, 
  Calendar, 
  User, 
  Image as ImageIcon,
  Sparkles,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  UserCheck,
  Users,
  Download,
  RefreshCw,
  ChevronDown,
  FileSpreadsheet,
  Printer,
  PieChart,
  BarChart3
} from 'lucide-react'
import { adminApi } from '../../services/adminService'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

export default function Izins() {
  const [izins, setIzins] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    jenis: '',
    search: '',
    start_date: '',
    end_date: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIzin, setSelectedIzin] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchIzins()
    fetchStats()
  }, [currentPage, filters])

  const fetchIzins = async () => {
    try {
      setLoading(true)
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {})
      
      const response = await adminApi.getIzins({
        page: currentPage,
        per_page: 15,
        ...cleanFilters
      })
      setIzins(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Gagal memuat data izin')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await adminApi.getIzinStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchIzins()
    await fetchStats()
    toast.success('Data berhasil diperbarui')
  }

  const handleExport = async (format = 'excel') => {
    try {
      toast.loading('Mengunduh data...')
      // Implement export logic here
      toast.dismiss()
      toast.success('Data berhasil diunduh')
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal mengunduh data')
    }
  }

  const handleApprove = async (izin) => {
    const { value: catatan } = await Swal.fire({
      title: 'Setujui Izin?',
      input: 'textarea',
      inputLabel: 'Catatan (Opsional)',
      inputPlaceholder: 'Tambahkan catatan jika perlu...',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Setujui',
      cancelButtonText: 'Batal',
      reverseButtons: true
    })

    if (catatan !== undefined) {
      try {
        await adminApi.approveIzin(izin.id, { catatan_admin: catatan })
        toast.success('Izin berhasil disetujui')
        fetchIzins()
        fetchStats()
      } catch (error) {
        toast.error('Gagal menyetujui izin')
      }
    }
  }

  const handleReject = async (izin) => {
    const { value: catatan } = await Swal.fire({
      title: 'Tolak Izin?',
      input: 'textarea',
      inputLabel: 'Alasan Penolakan',
      inputPlaceholder: 'Jelaskan alasan penolakan...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Tolak',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value) {
          return 'Alasan penolakan wajib diisi'
        }
      }
    })

    if (catatan) {
      try {
        await adminApi.rejectIzin(izin.id, { catatan_admin: catatan })
        toast.success('Izin berhasil ditolak')
        fetchIzins()
        fetchStats()
      } catch (error) {
        toast.error('Gagal menolak izin')
      }
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Izin?',
      text: 'Data izin akan dihapus permanen',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
      try {
        await adminApi.deleteIzin(id)
        toast.success('Izin berhasil dihapus')
        fetchIzins()
        fetchStats()
      } catch (error) {
        toast.error('Gagal menghapus izin')
      }
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      pending: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-700', 
        darkBg: 'dark:bg-amber-500/10', 
        darkText: 'dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/30',
        icon: Clock,
        label: 'Menunggu' 
      },
      approved: { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-700', 
        darkBg: 'dark:bg-emerald-500/10', 
        darkText: 'dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/30',
        icon: CheckCircle,
        label: 'Disetujui' 
      },
      rejected: { 
        bg: 'bg-rose-100', 
        text: 'text-rose-700', 
        darkBg: 'dark:bg-rose-500/10', 
        darkText: 'dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/30',
        icon: XCircle,
        label: 'Ditolak' 
      },
    }
    const cfg = config[status] || config.pending
    const Icon = cfg.icon
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${cfg.bg} ${cfg.text} ${cfg.darkBg} ${cfg.darkText} rounded-lg text-xs font-medium border ${cfg.border} shadow-sm`}>
        <Icon size={12} />
        {cfg.label}
      </span>
    )
  }

  const getJenisBadge = (jenis) => {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-sm ${
        jenis === 'sakit' 
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800/30'
          : 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-800/30'
      }`}>
        {jenis === 'sakit' ? '🏥 Sakit' : '📝 Izin'}
      </span>
    )
  }

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
    const colors = {
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-500/10',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800/30',
        gradient: 'from-purple-500 to-purple-600'
      },
      amber: {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/30',
        gradient: 'from-amber-500 to-amber-600'
      },
      emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/30',
        gradient: 'from-emerald-500 to-emerald-600'
      },
      rose: {
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/30',
        gradient: 'from-rose-500 to-rose-600'
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800/30',
        gradient: 'from-blue-500 to-blue-600'
      }
    }

    const classes = colors[color]

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`relative overflow-hidden ${classes.bg} rounded-2xl border ${classes.border} p-5 shadow-sm hover:shadow-lg transition-all duration-300`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.05)_0%,transparent_50%)]" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 bg-white dark:bg-slate-800 rounded-xl border ${classes.border} shadow-sm`}>
              <Icon size={18} className={classes.text} />
            </div>
            
            {trend && (
              <div className="flex items-center gap-1 text-xs font-medium">
                <span className={trend === 'up' ? 'text-emerald-600' : 'text-amber-600'}>
                  {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </span>
                <span className={trend === 'up' ? 'text-emerald-600' : 'text-amber-600'}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {title}
              </p>
              <p className={`text-2xl font-bold ${classes.text}`}>
                {value}
              </p>
            </div>
            
            {/* Mini Chart */}
            <div className="w-16 h-8">
              <svg width="60" height="30" viewBox="0 0 60 30" className="opacity-50">
                <defs>
                  <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={`var(--${color}-500)`} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={`var(--${color}-500)`} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,25 L10,20 L20,22 L30,15 L40,18 L50,10 L60,5 L60,30 L0,30 Z"
                  fill={`url(#grad-${color})`}
                />
                <path
                  d="M0,25 L10,20 L20,22 L30,15 L40,18 L50,10 L60,5"
                  fill="none"
                  stroke={`var(--${color}-500)`}
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${classes.gradient} opacity-30`} />
      </motion.div>
    )
  }

  const columns = [
    {
      header: 'Tanggal',
      accessor: 'tanggal_formatted',
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
            <Calendar size={14} className="text-slate-600 dark:text-slate-400" />
          </div>
          <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {row.tanggal_formatted}
          </span>
        </div>
      ),
    },
    {
      header: 'Siswa',
      accessor: 'nama_lengkap',
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            {row.siswa?.foto || row.siswa?.foto_url ? (
              <img
                src={row.siswa?.foto_url || row.siswa?.foto}
                alt={row.nama_lengkap}
                className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm border-2 border-white dark:border-slate-700 ${row.siswa?.foto || row.siswa?.foto_url ? 'hidden' : 'flex'}`}>
              {row.nama_lengkap?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{row.nama_lengkap}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">NIS: {row.nis}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Jenis',
      accessor: 'jenis',
      cell: (row) => getJenisBadge(row.jenis),
    },
    {
      header: 'Alasan',
      accessor: 'alasan',
      cell: (row) => (
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
          {row.alasan}
        </p>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Aksi',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedIzin(row)
              setShowDetailModal(true)
            }}
            className="p-1.5 bg-blue-100/80 hover:bg-blue-200/80 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 dark:text-blue-400 rounded-lg transition-all border border-blue-200/60 dark:border-blue-800/50 shadow-sm hover:shadow-md"
            title="Detail"
          >
            <Eye size={16} />
          </motion.button>
          
          {row.status === 'pending' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleApprove(row)}
                className="p-1.5 bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-700 dark:bg-emerald-900/20 dark:hover:bg-emerald-800/30 dark:text-emerald-400 rounded-lg transition-all border border-emerald-200/60 dark:border-emerald-800/50 shadow-sm hover:shadow-md"
                title="Setujui"
              >
                <CheckCircle size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReject(row)}
                className="p-1.5 bg-rose-100/80 hover:bg-rose-200/80 text-rose-700 dark:bg-rose-900/20 dark:hover:bg-rose-800/30 dark:text-rose-400 rounded-lg transition-all border border-rose-200/60 dark:border-rose-800/50 shadow-sm hover:shadow-md"
                title="Tolak"
              >
                <XCircle size={16} />
              </motion.button>
            </>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDelete(row.id)}
            className="p-1.5 bg-slate-100/80 hover:bg-rose-100/80 text-slate-600 hover:text-rose-700 dark:bg-slate-800/50 dark:hover:bg-rose-900/20 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg transition-all border border-slate-200/60 dark:border-slate-700/50 hover:border-rose-200/60 dark:hover:border-rose-800/50 shadow-sm hover:shadow-md"
            title="Hapus"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30"
            >
              <FileText size={24} className="text-white" />
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 border-2 border-white dark:border-slate-800 rounded-full"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Manajemen Izin
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-500" />
              Kelola pengajuan izin dan sakit siswa
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin text-purple-500' : 'text-slate-600 dark:text-slate-400'} />
          </motion.button>
          
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </motion.button>
            
            {/* Export Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => handleExport('excel')}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                <FileSpreadsheet size={16} className="text-emerald-600" />
                Excel (.xlsx)
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                <Printer size={16} className="text-rose-600" />
                PDF (.pdf)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            title="Total Izin"
            value={stats.total_izin}
            icon={FileText}
            color="purple"
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            title="Menunggu"
            value={stats.pending}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Disetujui"
            value={stats.approved}
            icon={CheckCircle}
            color="emerald"
          />
          <StatCard
            title="Ditolak"
            value={stats.rejected}
            icon={XCircle}
            color="rose"
          />
          <StatCard
            title="Hari Ini"
            value={stats.today_izin}
            icon={Calendar}
            color="blue"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-lg overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Cari nama atau NIS..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm text-slate-900 dark:text-white appearance-none"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>

              <select
                value={filters.jenis}
                onChange={(e) => setFilters({ ...filters, jenis: e.target.value })}
                className="px-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm text-slate-900 dark:text-white"
              >
                <option value="">Semua Jenis</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all text-sm font-medium border ${
                  showFilters 
                    ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/30' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800'
                }`}
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filter</span>
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={filters.start_date}
                      onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={filters.end_date}
                      onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xl overflow-hidden"
      >
        <div className="p-4 sm:p-6">
          <DataTable
            columns={columns}
            data={izins}
            pagination={pagination}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <Modal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            title={
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg shadow-purple-500/30"
                >
                  <FileText size={18} className="text-white" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Detail Izin</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Informasi lengkap pengajuan izin
                  </p>
                </div>
              </div>
            }
          >
            {selectedIzin && (
              <div className="space-y-6 p-6">
                {/* Header Info */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-100 mb-1">ID Izin</p>
                      <p className="text-lg font-semibold">#{selectedIzin.id}</p>
                    </div>
                    {getStatusBadge(selectedIzin.status)}
                  </div>
                </div>

                {/* Data Siswa */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <User size={12} className="text-purple-500" />
                      Nama Siswa
                    </p>
                    <p className="font-medium text-base text-slate-900 dark:text-white">
                      {selectedIzin.nama_lengkap}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">NIS: {selectedIzin.nis}</p>
                    {selectedIzin.siswa && (
                      <p className="text-xs text-slate-500">Kelas: {selectedIzin.siswa.kelas}</p>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Calendar size={12} className="text-purple-500" />
                      Tanggal & Jenis
                    </p>
                    <p className="font-medium text-base text-slate-900 dark:text-white">
                      {selectedIzin.tanggal_formatted}
                    </p>
                    <div className="mt-2">
                      {getJenisBadge(selectedIzin.jenis)}
                    </div>
                  </div>
                </div>

                {/* Alasan */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <FileText size={12} className="text-purple-500" />
                    Alasan
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedIzin.alasan}
                  </p>
                </div>

                {/* Admin Notes */}
                {selectedIzin.catatan_admin && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <FileText size={12} className="text-purple-500" />
                      Catatan Admin
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedIzin.catatan_admin}
                    </p>
                  </div>
                )}

                {/* Bukti Foto */}
                {selectedIzin.bukti_foto && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <ImageIcon size={12} className="text-purple-500" />
                      Bukti Foto
                    </p>
                    <motion.img 
                      whileHover={{ scale: 1.02 }}
                      src={selectedIzin.bukti_foto} 
                      alt="Bukti" 
                      className="w-full h-48 object-cover rounded-xl cursor-pointer shadow-lg border-2 border-slate-200 dark:border-slate-700"
                      onClick={() => {
                        setSelectedImage(selectedIzin.bukti_foto)
                        setShowImageModal(true)
                      }}
                    />
                  </div>
                )}

                {/* Actions */}
                {selectedIzin.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowDetailModal(false)
                        handleApprove(selectedIzin)
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all text-sm font-medium"
                    >
                      <CheckCircle size={16} />
                      Setujui Izin
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowDetailModal(false)
                        handleReject(selectedIzin)
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 transition-all text-sm font-medium"
                    >
                      <XCircle size={16} />
                      Tolak Izin
                    </motion.button>
                  </div>
                )}
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <Modal
            isOpen={showImageModal}
            onClose={() => setShowImageModal(false)}
            title="Bukti Foto"
          >
            {selectedImage && (
              <div className="p-6">
                <img 
                  src={selectedImage} 
                  alt="Bukti" 
                  className="w-full h-auto rounded-xl shadow-2xl" 
                />
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}