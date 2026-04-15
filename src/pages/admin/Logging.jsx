import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  User, 
  Calendar, 
  Filter,
  Search,
  Trash2,
  Clock,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Shield,
  LogIn,
  LogOut,
  Edit,
  Plus,
  Database,
  ChevronDown,
  X,
  Sparkles,
  BarChart3,
  Users,
  Server,
  HardDrive,
  Eye
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { adminApi } from '../../services/adminService'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

export default function Logging() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filters, setFilters] = useState({
    action: '',
    model_type: '',
    user_id: '',
    start_date: '',
    end_date: '',
    search: ''
  })

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [currentPage, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {})
      
      const response = await adminApi.getActivityLogs({
        page: currentPage,
        per_page: 15,
        ...cleanFilters
      })
      const res = response.data
      setLogs(Array.isArray(res?.data) ? res.data : [])
      setPagination(res?.pagination || null)
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Gagal memuat activity logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await adminApi.getActivityLogStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Log?',
      text: 'Log yang dihapus tidak dapat dikembalikan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes Delete',
      cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
      try {
        await adminApi.deleteActivityLog(id)
        toast.success('Log berhasil dihapus')
        fetchLogs()
        fetchStats()
      } catch (error) {
        toast.error('Gagal menghapus log')
      }
    }
  }

  const handleClearOldLogs = async () => {
    const { value: days } = await Swal.fire({
      title: 'Hapus Log Lama',
      input: 'number',
      inputLabel: 'Hapus log lebih dari berapa hari?',
      inputPlaceholder: 'Contoh: 30',
      inputAttributes: {
        min: 1,
        max: 365
      },
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value || value < 1) {
          return 'Masukkan jumlah hari yang valid'
        }
      }
    })

    if (days) {
      try {
        const response = await adminApi.clearActivityLogs(days)
        const count = response.data.data.deleted_count
        toast.success(`Berhasil menghapus ${count} log lama`)
        fetchLogs()
        fetchStats()
      } catch (error) {
        toast.error('Gagal menghapus log lama')
      }
    }
  }

  const handleViewDetail = (log) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  const getActionBadge = (action) => {
    const config = {
      login: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-300', border: 'border-blue-200', darkBorder: 'dark:border-blue-800', icon: LogIn, label: 'Login' },
      logout: { bg: 'bg-slate-100', text: 'text-slate-700', darkBg: 'dark:bg-slate-800', darkText: 'dark:text-slate-300', border: 'border-slate-200', darkBorder: 'dark:border-slate-700', icon: LogOut, label: 'Logout' },
      register: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-300', border: 'border-emerald-200', darkBorder: 'dark:border-emerald-800', icon: Plus, label: 'Register' },
      created: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-300', border: 'border-emerald-200', darkBorder: 'dark:border-emerald-800', icon: Plus, label: 'Created' },
      updated: { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-300', border: 'border-amber-200', darkBorder: 'dark:border-amber-800', icon: Edit, label: 'Updated' },
      deleted: { bg: 'bg-rose-100', text: 'text-rose-700', darkBg: 'dark:bg-rose-900/30', darkText: 'dark:text-rose-300', border: 'border-rose-200', darkBorder: 'dark:border-rose-800', icon: Trash2, label: 'Deleted' },
      absen: { bg: 'bg-purple-100', text: 'text-purple-700', darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-300', border: 'border-purple-200', darkBorder: 'dark:border-purple-800', icon: CheckCircle, label: 'Absen' },
    }
    
    const cfg = config[action] || { 
      bg: 'bg-slate-100', 
      text: 'text-slate-700', 
      darkBg: 'dark:bg-slate-800', 
      darkText: 'dark:text-slate-300', 
      border: 'border-slate-200', 
      darkBorder: 'dark:border-slate-700', 
      icon: Activity, 
      label: action 
    }
    const Icon = cfg.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 ${cfg.bg} ${cfg.text} ${cfg.darkBg} ${cfg.darkText} rounded-lg text-xs font-medium border ${cfg.border} ${cfg.darkBorder}`}>
        <Icon size={12} className="mr-1" />
        {cfg.label}
      </span>
    )
  }

  const columns = [
    {
      header: 'Waktu',
      accessor: 'created_at',
      cell: (row) => (
        <div className="min-w-[140px]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <Clock size={14} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'User',
      accessor: 'user',
      cell: (row) => {
        if (row.user && row.user.id) {
          return (
            <div className="min-w-[180px]">
              <div className="flex items-center gap-3">
                {row.user.foto || row.user.foto_url ? (
                  <img 
                    src={row.user.foto_url || row.user.foto} 
                    alt={row.user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextElementSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm border-2 border-white dark:border-slate-700 ${row.user.foto || row.user.foto_url ? 'hidden' : 'flex'}`}>
                  {row.user.name?.charAt(0) || row.user.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {row.user.name || row.user.email || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Shield size={12} className="text-slate-400" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
                      {row.user.role || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        
        if (row.new_values?.siswa_nama) {
          return (
            <div className="min-w-[180px]">
              <div className="flex items-center gap-3">
                {row.new_values?.siswa_foto || row.new_values?.siswa_foto_url ? (
                  <img 
                    src={row.new_values?.siswa_foto_url || row.new_values?.siswa_foto} 
                    alt={row.new_values.siswa_nama}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextElementSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm border-2 border-white dark:border-slate-700 ${row.new_values?.siswa_foto || row.new_values?.siswa_foto_url ? 'hidden' : 'flex'}`}>
                  {row.new_values.siswa_nama.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {row.new_values.siswa_nama}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {row.new_values.siswa_nis ? `NIS: ${row.new_values.siswa_nis}` : 'Siswa'}
                  </p>
                </div>
              </div>
            </div>
          )
        }
        
        return (
          <div className="min-w-[180px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                <Server size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  System
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Auto-generated
                </p>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      header: 'Aksi',
      accessor: 'action',
      cell: (row) => getActionBadge(row.action),
    },
    {
      header: 'Model',
      accessor: 'model_type',
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-medium border border-teal-200 dark:border-teal-800">
          <Database size={12} className="mr-1" />
          {row.model_type ? row.model_type.split('\\').pop() : '-'}
        </span>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
      cell: (row) => (
        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300">
          {row.ip_address || '-'}
        </span>
      ),
    },
    {
      header: 'Detail',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleViewDetail(row)}
            className="p-2 text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
            title="Lihat" Detail
          >
            <Eye size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDelete(row.id)}
            className="p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
            title="Hapus"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      ),
    },
  ]

  const DetailModal = ({ log, onClose }) => {
    if (!log) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <Activity size={24} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Detail Aktivitas
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    ID: {log.id}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Waktu</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {new Date(log.created_at).toLocaleDateString('id-ID', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Aksi</p>
                <div className="flex items-center gap-2">
                  {getActionBadge(log.action)}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">IP Address</p>
                <p className="font-mono text-sm text-slate-900 dark:text-white">{log.ip_address || '-'}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">User Agent</p>
                <p className="text-sm text-slate-900 dark:text-white truncate" title={log.user_agent}>
                  {log.user_agent || '-'}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Model</p>
                <p className="text-sm text-slate-900 dark:text-white">{log.model_type || '-'}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Model ID</p>
                <p className="text-sm text-slate-900 dark:text-white">{log.model_id || '-'}</p>
              </div>
            </div>

            {/* Old Values */}
            {log.old_values && Object.keys(log.old_values).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  Data Sebelumnya
                </h3>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <pre className="text-xs text-amber-800 dark:text-amber-200 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(log.old_values, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* New Values */}
            {log.new_values && Object.keys(log.new_values).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Data Baru
                </h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                  <pre className="text-xs text-emerald-800 dark:text-emerald-200 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(log.new_values, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
            <Activity size={24} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Activity Logs
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Riwayat aktivitas sistem dan pengguna
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClearOldLogs}
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-rose-500/30 transition-all text-sm"
        >
          <Trash2 size={16} />
          Hapus Log Lama
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Logs</p>
              <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <Database size={18} className="text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_logs?.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Sepanjang waktu</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Hari Ini</p>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.today_logs}</p>
            <p className="text-xs text-slate-500 mt-1">Aktivitas terbaru</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Minggu Ini</p>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Calendar size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.week_logs}</p>
            <p className="text-xs text-slate-500 mt-1">7 hari terakhir</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Bulan Ini</p>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <FileText size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.month_logs}</p>
            <p className="text-xs text-slate-500 mt-1">30 hari terakhir</p>
          </div>
        </motion.div>
      )}

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        {/* Filter Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-teal-600 transition-colors"
            >
              <Filter size={18} />
              <span className="font-medium">Filter & Pencarian</span>
              <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => {
                setFilters({
                  action: '',
                  model_type: '',
                  user_id: '',
                  start_date: '',
                  end_date: '',
                  search: ''
                })
                setCurrentPage(1)
              }}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Reset
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 mt-4"
              >
                {/* Search */}
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari user, email, atau aksi..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <select
                    value={filters.action}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    <option value="">Semua Aksi</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="register">Register</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                    <option value="deleted">Deleted</option>
                    <option value="absen">Absen</option>
                  </select>

                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Dari Tanggal"
                  />

                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Sampaitanggal"
                  />

                  <button
                    onClick={() => {
                      setCurrentPage(1)
                      fetchLogs()
                    }}
                    className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Filter size={16} />
                    Terapkan Filter
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <div className="p-5">
          {!loading && logs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-8 inline-block mb-4">
                <Activity size={48} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Belum Ada Log
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Belum ada aktivitas yang tercatat dalam sistem dengan filter yang dipilih
              </p>
            </motion.div>
          ) : (
            <DataTable
              columns={columns}
              data={logs}
              pagination={pagination}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          )}
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <DetailModal
            log={selectedLog}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedLog(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}