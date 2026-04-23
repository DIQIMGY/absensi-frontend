import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trash2, 
  Filter, 
  Calendar,
  CalendarDays,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock3,
  Activity,
  ChevronDown,
  RefreshCw,
  FileText,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Search,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  GraduationCap,
  BookOpen
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { adminApi } from '../../services/adminService'
import { confirmDelete, showSuccess } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select'

export default function Absensis() {
  const [absensis, setAbsensis] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [statistik, setStatistik] = useState({
    total: 0,
    hadir: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    date: new Date(),
    kelas_id: '',
    status: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const [selectedAbsensi, setSelectedAbsensi] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Helper untuk format tanggal ke YYYY-MM-DD
  const formatDateToAPI = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    fetchAbsensis()
    fetchKelas()
  }, [currentPage, filters])

  const fetchAbsensis = async () => {
    try {
      setLoading(true)
      
      const dateStr = formatDateToAPI(filters.date)
      
      const params = {
        page: currentPage,
        per_page: 15,
        date: dateStr,
      }
      
      if (filters.search) params.search = filters.search
      if (filters.kelas_id) params.kelas_id = filters.kelas_id
      if (filters.status) params.status = filters.status

      console.log('=== FETCHING ABSENSIS ===')
      console.log('Date string (YYYY-MM-DD):', dateStr)
      console.log('Params:', params)

      const response = await adminApi.getAbsensis(params)
      console.log('Absensi Response:', response.data)
      
      const res = response.data
      const data = Array.isArray(res?.data) ? res.data : []
      
      console.log('Absensi records:', data.length)
      console.log('Pagination total:', res?.pagination?.total)
      
      setAbsensis(data)
      setPagination(res?.pagination || null)
      
      // Fetch statistik REAL from endpoint khusus
      console.log('=== FETCHING STATISTIK ===')
      console.log('Date for stats:', dateStr)
      
      try {
        const statsResponse = await adminApi.getStatistikByDate({ date: dateStr })
        console.log('Statistik Response:', statsResponse.data)
        
        const statsData = statsResponse.data?.data || {}
        console.log('Statistik Data:', statsData)
        
        const stats = {
          total: statsData.total_siswa || 0,
          hadir: statsData.total_hadir || 0,
          terlambat: statsData.total_terlambat || 0,
          izin: statsData.total_izin || 0,
          sakit: statsData.total_sakit || 0,
          alpha: statsData.total_alpha || 0,
        }
        
        console.log('=== STATISTIK FINAL ===')
        console.log('Total Siswa:', stats.total)
        console.log('Hadir:', stats.hadir)
        console.log('Terlambat:', stats.terlambat)
        console.log('Izin:', stats.izin)
        console.log('Sakit:', stats.sakit)
        console.log('Alpha:', stats.alpha)
        
        setStatistik(stats)
      } catch (statsError) {
        console.error('Error fetching statistik:', statsError)
        console.error('Stats error response:', statsError.response?.data)
        
        const fallbackStats = {
          total: 0,
          hadir: data.filter(a => a.status === 'hadir').length,
          terlambat: data.filter(a => a.status === 'terlambat').length,
          izin: data.filter(a => a.status === 'izin').length,
          sakit: data.filter(a => a.status === 'sakit').length,
          alpha: data.filter(a => a.status === 'alpha').length,
        }
        console.log('Using fallback stats:', fallbackStats)
        setStatistik(fallbackStats)
        
        toast.error('Gagal memuat statistik, menggunakan data fallback')
      }
    } catch (error) {
      console.error('Error fetching absensis:', error)
      console.error('Error response:', error.response?.data)
      toast.error('Gagal memuat data absensi: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const fetchKelas = async () => {
    try {
      const response = await adminApi.getAllKelas()
      setKelasList(response.data.data.map(k => ({
        value: k.id,
        label: k.nama_kelas
      })))
    } catch (error) {
      console.error('Error fetching kelas:', error)
    }
  }

  const handleDelete = async (item) => {
    if (await confirmDelete('Hapus data absensi?', 'Data absensi akan dihapus permanen')) {
      try {
        await adminApi.deleteAbsensi(item.id)
        showSuccess('Data absensi berhasil dihapus')
        fetchAbsensis()
      } catch (error) {
        toast.error('Gagal menghapus data absensi')
      }
    }
  }

  const setQuickDate = (type) => {
    const today = new Date()
    let newDate = new Date()
    
    switch(type) {
      case 'today':
        newDate = today
        break
      case 'yesterday':
        newDate.setDate(today.getDate() - 1)
        break
      case 'week':
        newDate.setDate(today.getDate() - 7)
        break
      default:
        newDate = today
    }
    
    setFilters({ ...filters, date: newDate })
    setCurrentPage(1)
  }

  const isToday = () => {
    const today = new Date()
    return filters.date.toDateString() === today.toDateString()
  }

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getStatusBadge = (status) => {
    const config = {
      hadir: { bg: 'bg-[#10B981]/20', text: 'text-[#10B981]', darkBg: 'dark:bg-[#34D399]/20', darkText: 'dark:text-[#34D399]', border: 'border-[#10B981]/30', darkBorder: 'dark:border-[#34D399]/30', icon: CheckCircle, label: 'Hadir' },
      terlambat: { bg: 'bg-[#F59E0B]/20', text: 'text-[#F59E0B]', darkBg: 'dark:bg-[#FBBF24]/20', darkText: 'dark:text-[#FBBF24]', border: 'border-[#F59E0B]/30', darkBorder: 'dark:border-[#FBBF24]/30', icon: Clock3, label: 'Terlambat' },
      izin: { bg: 'bg-[#8B5CF6]/20', text: 'text-[#8B5CF6]', darkBg: 'dark:bg-[#C084FC]/20', darkText: 'dark:text-[#C084FC]', border: 'border-[#8B5CF6]/30', darkBorder: 'dark:border-[#C084FC]/30', icon: FileText, label: 'Izin' },
      sakit: { bg: 'bg-[#A855F7]/20', text: 'text-[#A855F7]', darkBg: 'dark:bg-[#C084FC]/20', darkText: 'dark:text-[#C084FC]', border: 'border-[#A855F7]/30', darkBorder: 'dark:border-[#C084FC]/30', icon: Activity, label: 'Sakit' },
      alpha: { bg: 'bg-[#EF4444]/20', text: 'text-[#EF4444]', darkBg: 'dark:bg-[#EF4444]/20', darkText: 'dark:text-[#F87171]', border: 'border-[#EF4444]/30', darkBorder: 'dark:border-[#EF4444]/30', icon: XCircle, label: 'Alpha' },
    }
    
    const cfg = config[status] || config.alpha
    const Icon = cfg.icon
    
    return (
      <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 ${cfg.bg} ${cfg.text} ${cfg.darkBg} ${cfg.darkText} rounded-lg text-[10px] sm:text-xs font-medium border ${cfg.border} ${cfg.darkBorder} whitespace-nowrap shadow-sm`}>
        <Icon size={12} className="mr-1 flex-shrink-0" />
        <span className="truncate max-w-[60px] sm:max-w-none">{cfg.label}</span>
      </span>
    )
  }

  const columns = [
    {
      header: 'Siswa',
      accessor: 'siswa',
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          {row.siswa?.foto_url || row.siswa?.foto ? (
            <img 
              src={row.siswa?.foto_url || row.siswa?.foto} 
              alt={row.siswa?.nama_lengkap}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white dark:border-[#1F3A44] shadow-md flex-shrink-0"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md flex-shrink-0 border-2 border-white dark:border-[#1F3A44] ${row.siswa?.foto_url || row.siswa?.foto ? 'hidden' : 'flex'}`}>
            {row.siswa?.nama_lengkap?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{row.siswa?.nama_lengkap}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
              <GraduationCap size={10} className="text-[#8B5CF6]" />
              {row.siswa?.nis}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Kelas',
      accessor: 'kelas',
      cell: (row) => (
        <span className="hidden md:inline-flex items-center px-2 py-1 bg-[#8B5CF6]/20 dark:bg-[#C084FC]/20 text-[#8B5CF6] dark:text-[#C084FC] rounded-lg text-xs font-medium border border-[#8B5CF6]/30 dark:border-[#C084FC]/30 shadow-sm">
          <BookOpen size={12} className="mr-1 flex-shrink-0" />
          <span className="truncate max-w-[80px]">{row.kelas?.nama_kelas || '-'}</span>
        </span>
      ),
    },
    {
      header: 'Jam',
      accessor: 'jam_masuk',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <Clock size={14} className="text-[#8B5CF6] flex-shrink-0" />
          <span className="font-medium">{row.jam_masuk || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Telat',
      accessor: 'menit_keterlambatan',
      cell: (row) => (
        row.menit_keterlambatan > 0 ? (
          <span className="hidden lg:inline-flex items-center px-2 py-1 bg-[#F59E0B]/20 text-[#F59E0B] dark:bg-[#FBBF24]/20 dark:text-[#FBBF24] rounded-lg text-xs font-medium border border-[#F59E0B]/30 dark:border-[#FBBF24]/30 shadow-sm">
            <Clock3 size={12} className="mr-1 flex-shrink-0" />
            <span>{row.menit_keterlambatan} menit</span>
          </span>
        ) : (
          <span className="hidden lg:block text-slate-400 text-xs sm:text-sm">-</span>
        )
      ),
    },
    {
      header: 'Metode',
      accessor: 'metode',
      cell: (row) => (
        <span className="hidden xl:inline-block text-xs sm:text-sm text-slate-600 dark:text-slate-300 capitalize truncate px-2 py-1 bg-slate-100 dark:bg-[#1F3A44]/60 rounded-lg">
          {row.metode === 'qr_code' ? 'QR Code' : row.metode}
        </span>
      ),
    },
    {
      header: 'Tanggal',
      accessor: 'tanggal',
      cell: (row) => (
        <div className="hidden lg:flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <CalendarDays size={14} className="text-[#8B5CF6] flex-shrink-0" />
          <span className="font-medium">{new Date(row.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
        </div>
      ),
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setSelectedAbsensi(row); setShowDetailModal(true) }}
            className="p-1.5 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 dark:text-[#C084FC] dark:hover:bg-[#C084FC]/20 rounded-lg transition-colors"
            title="Detail"
          >
            <Eye size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDelete(row)}
            className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/20 dark:text-[#F87171] dark:hover:bg-[#EF4444]/20 rounded-lg transition-colors"
            title="Hapus"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      ),
    },
  ]

  const activeFilters = [
    filters.kelas_id && kelasList.find(k => k.value === filters.kelas_id)?.label,
    filters.status && (filters.status.charAt(0).toUpperCase() + filters.status.slice(1)),
    !isToday() && formatDateDisplay(filters.date),
  ].filter(Boolean)

  const getPresentPercentage = () => {
    if (statistik.total === 0) return 0
    return Math.round(((statistik.hadir + statistik.terlambat) / statistik.total) * 100)
  }

  const getStatistikItems = [
    { 
      label: 'Total Siswa', 
      value: statistik.total, 
      icon: Users, 
      color: 'text-slate-600', 
      bg: 'bg-slate-100', 
      darkBg: 'dark:bg-[#1F3A44]',
      iconBg: 'bg-slate-200',
      darkIconBg: 'dark:bg-[#2F4F5A]',
      border: 'border-slate-200',
      darkBorder: 'dark:border-slate-700'
    },
    { 
      label: 'Hadir', 
      value: statistik.hadir, 
      icon: CheckCircle, 
      color: 'text-[#10B981]', 
      bg: 'bg-[#10B981]/20', 
      darkBg: 'dark:bg-[#34D399]/20',
      iconBg: 'bg-[#10B981]/30',
      darkIconBg: 'dark:bg-[#34D399]/30',
      border: 'border-[#10B981]/30',
      darkBorder: 'dark:border-[#34D399]/30'
    },
    { 
      label: 'Terlambat', 
      value: statistik.terlambat, 
      icon: Clock3, 
      color: 'text-[#F59E0B]', 
      bg: 'bg-[#F59E0B]/20', 
      darkBg: 'dark:bg-[#FBBF24]/20',
      iconBg: 'bg-[#F59E0B]/30',
      darkIconBg: 'dark:bg-[#FBBF24]/30',
      border: 'border-[#F59E0B]/30',
      darkBorder: 'dark:border-[#FBBF24]/30'
    },
    { 
      label: 'Izin', 
      value: statistik.izin, 
      icon: FileText, 
      color: 'text-[#8B5CF6]', 
      bg: 'bg-[#8B5CF6]/20', 
      darkBg: 'dark:bg-[#C084FC]/20',
      iconBg: 'bg-[#8B5CF6]/30',
      darkIconBg: 'dark:bg-[#C084FC]/30',
      border: 'border-[#8B5CF6]/30',
      darkBorder: 'dark:border-[#C084FC]/30'
    },
    { 
      label: 'Sakit', 
      value: statistik.sakit, 
      icon: Activity, 
      color: 'text-[#A855F7]', 
      bg: 'bg-[#A855F7]/20', 
      darkBg: 'dark:bg-[#C084FC]/20',
      iconBg: 'bg-[#A855F7]/30',
      darkIconBg: 'dark:bg-[#C084FC]/30',
      border: 'border-[#A855F7]/30',
      darkBorder: 'dark:border-[#C084FC]/30'
    },
    { 
      label: 'Alpha', 
      value: statistik.alpha, 
      icon: XCircle, 
      color: 'text-[#EF4444]', 
      bg: 'bg-[#EF4444]/20', 
      darkBg: 'dark:bg-[#EF4444]/20',
      iconBg: 'bg-[#EF4444]/30',
      darkIconBg: 'dark:bg-[#EF4444]/30',
      border: 'border-[#EF4444]/30',
      darkBorder: 'dark:border-[#EF4444]/30'
    },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">
      {/* Page Header */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
            <CalendarDays size={17} className="text-violet-600 dark:text-violet-400"/>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Data Absensi</h1>
              {isToday() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 rounded-lg text-[10px] font-bold">
                  Hari Ini
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isToday() ? 'Menampilkan data absensi hari ini' : `Data untuk: ${formatDateDisplay(filters.date)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700">
            <Printer size={12}/><span className="hidden sm:inline">Cetak</span>
          </button>
          <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700">
            <Download size={12}/><span className="hidden sm:inline">Ekspor</span>
          </button>
          {!isToday() && (
            <button onClick={() => setQuickDate('today')}
              className="px-3 py-1.5 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold" style={{ background:'#8b5cf6' }}>
              <Calendar size={12}/><span className="hidden sm:inline">Hari Ini</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Debug Info (Development Only) - Made less intrusive */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-50 dark:bg-[#1F3A44]/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3"
        >
          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            <span className="font-semibold">Debug:</span> {filters.date.toISOString().split('T')[0]} | 
            Data: {absensis.length} | Total: {pagination?.total || 0}
          </p>
        </motion.div>
      )}

      {/* Statistik Cards */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 size={13} className="text-violet-500"/>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Rekapitulasi Absensi</p>
          </div>
          <button onClick={() => setShowStats(!showStats)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${showStats ? 'rotate-180' : ''}`}/>
          </button>
        </div>
        <AnimatePresence>
          {showStats && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {getStatistikItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`${item.bg} ${item.darkBg} rounded-xl p-3 border ${item.border} ${item.darkBorder}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`p-1.5 ${item.iconBg} ${item.darkIconBg} rounded-lg`}>
                          <Icon size={13} className={item.color}/>
                        </div>
                        <span className="text-[9px] font-medium text-slate-400">{item.label}</span>
                      </div>
                      <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
                    </motion.div>
                  )
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tingkat Kehadiran</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{getPresentPercentage()}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${getPresentPercentage()}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: getPresentPercentage() > 75 ? '#10b981' : getPresentPercentage() > 50 ? '#f59e0b' : '#ef4444' }}/>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Filter Section */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-violet-500 dark:hover:text-violet-400 transition-colors text-sm font-medium w-full">
            <Filter size={14}/>
            <span>Filter Data Absensi</span>
            <ChevronDown size={13} className={`ml-auto transition-transform ${showFilters ? 'rotate-180' : ''}`}/>
          </button>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="text-[10px] text-slate-400">Filter aktif:</span>
              {filters.kelas_id && (
                <span className="inline-flex items-center px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg text-[10px] font-medium border border-violet-100 dark:border-violet-800/40">
                  Kelas: {kelasList.find(k => k.value === filters.kelas_id)?.label}
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg text-[10px] font-medium border border-violet-100 dark:border-violet-800/40">
                  Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                </span>
              )}
              {!isToday() && (
                <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-medium border border-amber-100 dark:border-amber-800/40">
                  Tanggal: {formatDateDisplay(filters.date)}
                </span>
              )}
              <button onClick={() => { setFilters({ search: '', date: new Date(), kelas_id: '', status: '' }); setCurrentPage(1) }}
                className="text-[10px] text-rose-500 hover:text-rose-600 flex items-center gap-1 px-1.5 py-0.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                <XCircle size={10}/> Reset
              </button>
            </div>
          )}
        </div>

        {/* Filter Content */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="p-4 sm:p-5 space-y-4">
                {/* Quick Date Filters */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Quick Filter Tanggal
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setQuickDate('today')}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        isToday()
                          ? 'bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white shadow-lg shadow-[#8B5CF6]/30'
                          : 'bg-slate-100 dark:bg-[#2F4F5A] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1F3A44] border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      Hari Ini
                    </button>
                    <button
                      onClick={() => setQuickDate('yesterday')}
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-[#2F4F5A] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1F3A44] transition-all border border-slate-200 dark:border-slate-600"
                    >
                      Kemarin
                    </button>
                    <button
                      onClick={() => setQuickDate('week')}
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-[#2F4F5A] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1F3A44] transition-all border border-slate-200 dark:border-slate-600"
                    >
                      7 Hari Lalu
                    </button>
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Pilih Tanggal
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={14} />
                      <DatePicker
                        selected={filters.date}
                        onChange={(date) => {
                          setFilters({ ...filters, date })
                          setCurrentPage(1)
                        }}
                        className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#1F3A44] border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all"
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Filter Kelas
                    </label>
                    <Select
                      options={kelasList}
                      value={kelasList.find(k => k.value === filters.kelas_id)}
                      onChange={(option) => {
                        setFilters({ ...filters, kelas_id: option?.value || '' })
                        setCurrentPage(1)
                      }}
                      placeholder="Semua Kelas"
                      className="react-select-container text-xs"
                      classNamePrefix="react-select"
                      isClearable
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: '0.75rem',
                          borderColor: '#e2e8f0',
                          minHeight: '38px',
                          boxShadow: 'none',
                          fontSize: '0.75rem',
                          '&:hover': {
                            borderColor: '#8B5CF6'
                          }
                        }),
                        menu: (base) => ({
                          ...base,
                          borderRadius: '0.75rem',
                          overflow: 'hidden',
                          zIndex: 50
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected ? '#8B5CF6' : state.isFocused ? '#F1F5F9' : 'white',
                          color: state.isSelected ? 'white' : '#1e293b',
                          fontSize: '12px',
                        })
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Filter Status
                    </label>
                    <Select
                      options={[
                        { value: 'hadir', label: 'Hadir' },
                        { value: 'terlambat', label: 'Terlambat' },
                        { value: 'izin', label: 'Izin' },
                        { value: 'sakit', label: 'Sakit' },
                        { value: 'alpha', label: 'Alpha' },
                      ]}
                      value={filters.status ? { value: filters.status, label: filters.status.charAt(0).toUpperCase() + filters.status.slice(1) } : null}
                      onChange={(option) => {
                        setFilters({ ...filters, status: option?.value || '' })
                        setCurrentPage(1)
                      }}
                      placeholder="Semua Status"
                      className="react-select-container text-xs"
                      classNamePrefix="react-select"
                      isClearable
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: '0.75rem',
                          borderColor: '#e2e8f0',
                          minHeight: '38px',
                          boxShadow: 'none',
                          fontSize: '0.75rem',
                          '&:hover': {
                            borderColor: '#8B5CF6'
                          }
                        }),
                        menu: (base) => ({
                          ...base,
                          borderRadius: '0.75rem',
                          overflow: 'hidden',
                          zIndex: 50
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected ? '#8B5CF6' : state.isFocused ? '#F1F5F9' : 'white',
                          color: state.isSelected ? 'white' : '#1e293b',
                          fontSize: '12px',
                        })
                      }}
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilters({ search: '', date: new Date(), kelas_id: '', status: '' })
                        setCurrentPage(1)
                      }}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-[#2F4F5A] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-200 dark:hover:bg-[#1F3A44] transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-600"
                    >
                      <RefreshCw size={12} />
                      Reset Filter
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Table Section */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-700">
          {!loading && absensis.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-16"
            >
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 dark:bg-[#1F3A44]/60 rounded-2xl flex items-center justify-center mx-auto">
                  <CalendarDays size={40} className="text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#F59E0B]/20 dark:bg-[#FBBF24]/20 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1F3A44]">
                  <AlertCircle size={16} className="text-[#F59E0B] dark:text-[#FBBF24]" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                Tidak Ada Data Absensi
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Belum ada data absensi untuk tanggal {formatDateDisplay(filters.date)}. 
                Coba pilih tanggal lain atau reset filter untuk melihat data.
              </p>
              {!isToday() && (
                <button
                  onClick={() => setQuickDate('today')}
                  className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white rounded-xl font-medium text-sm shadow-lg shadow-[#8B5CF6]/30 transition-all inline-flex items-center gap-2"
                >
                  <Calendar size={16} />
                  Lihat Data Hari Ini
                </button>
              )}
            </motion.div>
          ) : (
            <DataTable
              columns={columns}
              data={absensis}
              pagination={pagination}
              onPageChange={setCurrentPage}
              onSearch={(search) => {
                setFilters({ ...filters, search })
                setCurrentPage(1)
              }}
              loading={loading}
              searchPlaceholder="Cari berdasarkan nama atau NIS siswa..."
            />
          )}
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedAbsensi && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowDetailModal(false)} onTouchEnd={() => setShowDetailModal(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-slate-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <Eye size={16} className="text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Detail Absensi</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(selectedAbsensi.tanggal).toLocaleDateString('id-ID', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/60 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <XCircle size={18} className="text-slate-400" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Siswa Info */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  {selectedAbsensi.siswa?.foto_url
                    ? <img src={selectedAbsensi.siswa.foto_url} alt={selectedAbsensi.siswa?.nama_lengkap} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0" />
                    : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {(selectedAbsensi.siswa?.nama_lengkap || '?').charAt(0)}
                      </div>
                  }
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{selectedAbsensi.siswa?.nama_lengkap || '-'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">NIS: {selectedAbsensi.siswa?.nis || '-'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedAbsensi.siswa?.kelas?.nama_kelas || '-'}</p>
                  </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Status', val: selectedAbsensi.status, badge: true },
                    { label: 'Metode', val: selectedAbsensi.metode || '-' },
                    { label: 'Jam Masuk', val: selectedAbsensi.jam_masuk ? selectedAbsensi.jam_masuk.substring(0,5) : '-' },
                    { label: 'Keterlambatan', val: selectedAbsensi.menit_terlambat ? `${selectedAbsensi.menit_terlambat} menit` : '-' },
                    { label: 'Keterangan', val: selectedAbsensi.keterangan || '-', full: true },
                  ].map(({ label, val, badge, full }) => (
                    <div key={label} className={`bg-slate-50 dark:bg-slate-800 rounded-xl p-3 ${full ? 'col-span-2' : ''}`}>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                      {badge ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${
                          val === 'hadir'     ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          val === 'terlambat' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                          val === 'izin'      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          val === 'sakit'     ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                        }`}>{val?.charAt(0).toUpperCase() + val?.slice(1)}</span>
                      ) : (
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{val}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}