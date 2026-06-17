import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck,
  Clock,
  Search,
  Filter,
  Download,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  BarChart3,
  Award,
  Target,
  Activity,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Printer,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  List,
  PieChart,
  LineChart
} from 'lucide-react'
import { adminApi } from '../../services/adminService'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'
import GuruProfileModal from '../../components/GuruProfileModal'

export default function AbsensiGuru() {
  const [data, setData] = useState([])
  const [statistik, setStatistik] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    tanggal: '',
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    status: '',
    metode: '',
    guru_id: ''
  })
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTab, setSelectedTab] = useState('list') // 'list', 'statistik', 'rekap'
  const [viewMode, setViewMode] = useState('grid') // 'grid', 'list'
  const [expandedStats, setExpandedStats] = useState({})
  const [rekapData, setRekapData] = useState([])
  const [loadingRekap, setLoadingRekap] = useState(false)
  const [rekapSearch, setRekapSearch] = useState('')
  const [selectedSiswaRanking, setSelectedSiswaRanking] = useState(null)

  useEffect(() => {
    fetchData()
    fetchStatistik()
  }, [filters.bulan, filters.tahun, pagination.current_page])

  useEffect(() => {
    if (selectedTab === 'rekap') fetchRekap()
  }, [selectedTab, filters.bulan, filters.tahun])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const params = Object.entries({
        ...filters,
        page: pagination.current_page,
        per_page: pagination.per_page
      }).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {})
      
      const response = await adminApi.getAbsensiGuru(params)
      const responseData = response.data.data
      
      if (!responseData) {
        setData([])
        return
      }
      
      const dataArray = responseData.data || []
      const paginationData = responseData.pagination || pagination
      
      setData(dataArray)
      setPagination(paginationData)
    } catch (error) {
      console.error('Error fetching absensi guru:', error)
      toast.error('Gagal memuat data absensi guru')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchStatistik = async () => {
    try {
      const response = await adminApi.getAbsensiGuruStatistik({
        bulan: filters.bulan,
        tahun: filters.tahun
      })
      setStatistik(response.data.data)
    } catch (error) {
      console.error('Gagal memuat statistik:', error)
    }
  }

  const fetchRekap = async (search = rekapSearch) => {
    try {
      setLoadingRekap(true)
      const response = await adminApi.getAbsensiGuruRekapPerGuru({
        bulan: filters.bulan,
        tahun: filters.tahun,
        search
      })
      setRekapData(response.data.data?.data || [])
    } catch (error) {
      console.error('Gagal memuat rekap:', error)
      toast.error('Gagal memuat rekap per guru')
    } finally {
      setLoadingRekap(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    await fetchStatistik()
    toast.success('Data berhasil diperbarui')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination({ ...pagination, current_page: 1 })
    fetchData()
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
  }

  const handlePageChange = (page) => {
    setPagination({ ...pagination, current_page: page })
  }

  const handleExport = async (format = 'excel') => {
    try {
      toast.loading('Mengunduh data...')
      const response = await adminApi.exportAbsensiGuru({ ...filters, format })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `absensi-guru-${filters.bulan}-${filters.tahun}.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.dismiss()
      toast.success('Data berhasil diunduh')
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal mengunduh data')
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, description, trend, trendValue, subStats }) => {
    const colors = {
      purple: {
        bg: 'bg-[#8B5CF6]/20 dark:bg-[#C084FC]/20',
        text: 'text-[#8B5CF6] dark:text-[#C084FC]',
        border: 'border-[#8B5CF6]/30 dark:border-[#C084FC]/30',
        gradient: 'from-[#8B5CF6] to-[#A855F7]',
        light: 'bg-[#8B5CF6]/30 dark:bg-[#C084FC]/30'
      },
      green: {
        bg: 'bg-[#10B981]/20 dark:bg-[#34D399]/20',
        text: 'text-[#10B981] dark:text-[#34D399]',
        border: 'border-[#10B981]/30 dark:border-[#34D399]/30',
        gradient: 'from-[#10B981] to-[#34D399]',
        light: 'bg-[#10B981]/30 dark:bg-[#34D399]/30'
      },
      orange: {
        bg: 'bg-[#F59E0B]/20 dark:bg-[#FBBF24]/20',
        text: 'text-[#F59E0B] dark:text-[#FBBF24]',
        border: 'border-[#F59E0B]/30 dark:border-[#FBBF24]/30',
        gradient: 'from-[#F59E0B] to-[#FBBF24]',
        light: 'bg-[#F59E0B]/30 dark:bg-[#FBBF24]/30'
      },
      red: {
        bg: 'bg-[#EF4444]/20 dark:bg-[#EF4444]/20',
        text: 'text-[#EF4444] dark:text-[#F87171]',
        border: 'border-[#EF4444]/30 dark:border-[#EF4444]/30',
        gradient: 'from-[#EF4444] to-[#F87171]',
        light: 'bg-[#EF4444]/30 dark:bg-[#EF4444]/30'
      },
      pink: {
        bg: 'bg-[#A855F7]/20 dark:bg-[#C084FC]/20',
        text: 'text-[#A855F7] dark:text-[#C084FC]',
        border: 'border-[#A855F7]/30 dark:border-[#C084FC]/30',
        gradient: 'from-[#A855F7] to-[#C084FC]',
        light: 'bg-[#A855F7]/30 dark:bg-[#C084FC]/30'
      }
    }

    const isExpanded = expandedStats[title]

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`relative overflow-hidden ${colors[color].bg} rounded-2xl border ${colors[color].border} p-5 shadow-sm hover:shadow-lg transition-all duration-300`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.05)_0%,transparent_50%)]" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 bg-white dark:bg-[#1F3A44] rounded-xl border ${colors[color].border} shadow-sm`}>
              <Icon size={18} className={colors[color].text} />
            </div>
            
            {trend && (
              <div className="flex items-center gap-1 text-xs font-medium">
                <span className={trend === 'up' ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
                  {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </span>
                <span className={trend === 'up' ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
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
              <p className={`text-2xl font-bold ${colors[color].text}`}>
                {value}
              </p>
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {description}
                </p>
              )}
            </div>
            
            {/* Mini Chart Indicator */}
            <div className="w-16 h-8">
              <svg width="60" height="30" viewBox="0 0 60 30" className="opacity-50">
                <defs>
                  <linearGradient id={`grad-${color}-${title.replace(/\s/g,'')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,25 L10,20 L20,22 L30,15 L40,18 L50,10 L60,5 L60,30 L0,30 Z"
                  fill={`url(#grad-${color}-${title.replace(/\s/g,'')})`}
                  className={colors[color].text}
                />
                <path
                  d="M0,25 L10,20 L20,22 L30,15 L40,18 L50,10 L60,5"
                  fill="none"
                  className={colors[color].text}
                  strokeWidth="2"
                  stroke="currentColor"
                />
              </svg>
            </div>
          </div>

          {/* Sub Stats */}
          {subStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="grid grid-cols-2 gap-2">
                {subStats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className={`text-sm font-bold ${colors[color].text}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Indicator */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colors[color].gradient} opacity-30`} />
      </motion.div>
    )
  }

  const columns = [
    {
      header: 'Guru',
      accessor: 'guru',
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            {row.guru.foto ? (
              <img 
                src={row.guru.foto} 
                alt={row.guru.nama} 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-[#1F3A44] shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white dark:ring-[#1F3A44]">
                {row.guru.nama.charAt(0)}
              </div>
            )}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-[#1F3A44] ${
              row.status === 'hadir' ? 'bg-[#10B981]' : row.status === 'terlambat' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
            }`} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{row.guru.nama}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">NIP: {row.guru.nip}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Kelas',
      accessor: 'guru.kelas',
      cell: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
          {row.guru.kelas || '-'}
        </span>
      )
    },
    {
      header: 'Tanggal',
      accessor: 'tanggal',
      cell: (row) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-[#8B5CF6] flex-shrink-0" />
          <span className="text-slate-900 dark:text-white truncate max-w-[120px]">
            {new Date(row.tanggal).toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'short' 
            })}
          </span>
        </div>
      )
    },
    {
      header: 'Jam Masuk',
      accessor: 'jam_masuk',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#8B5CF6] flex-shrink-0" />
          <span className="text-sm font-mono text-slate-900 dark:text-white">
            {row.jam_masuk?.substring(0, 5) || '-'}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
          row.status === 'hadir'
            ? 'bg-[#10B981]/20 text-[#10B981] dark:bg-[#34D399]/20 dark:text-[#34D399] border border-[#10B981]/30 dark:border-[#34D399]/30'
            : row.status === 'terlambat'
            ? 'bg-[#F59E0B]/20 text-[#F59E0B] dark:bg-[#FBBF24]/20 dark:text-[#FBBF24] border border-[#F59E0B]/30 dark:border-[#FBBF24]/30'
            : 'bg-[#EF4444]/20 text-[#EF4444] dark:bg-[#EF4444]/20 dark:text-[#F87171] border border-[#EF4444]/30 dark:border-[#EF4444]/30'
        }`}>
          {row.status === 'hadir' ? (
            <CheckCircle size={12} />
          ) : row.status === 'terlambat' ? (
            <Clock size={12} />
          ) : (
            <XCircle size={12} />
          )}
          <span>{row.status_label}</span>
          {row.menit_keterlambatan > 0 && (
            <span className="ml-1 text-[9px] opacity-75">({row.menit_keterlambatan}m)</span>
          )}
        </span>
      )
    },
    {
      header: 'Metode',
      accessor: 'metode',
      cell: (row) => {
        const metodeMap = {
          fingerprint: { label: '🖐 Sidik Jari', cls: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' },
          qr_code:     { label: '📷 QR Code',    cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
          manual:      { label: '✍️ Manual',      cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
          sistem:      { label: '⚙️ Sistem',      cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
        }
        const m = metodeMap[row.metode] || { label: row.metode_label || row.metode, cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' }
        return (
          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${m.cls}`}>
            {m.label}
          </span>
        )
      }
    }
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">

      {/* MODAL PROFIL GURU (dari ranking) */}
      {selectedSiswaRanking && (
        <GuruProfileModal guru={selectedSiswaRanking} onClose={() => setSelectedSiswaRanking(null)} />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-xl shadow-lg shadow-violet-500/30">
              <UserCheck size={20} className="text-white" />
            </div>
            <motion.div animate={{ scale: [1,1.3,1] }} transition={{ duration:2, repeat:Infinity }}
              className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full"/>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Absensi Guru</h1>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Sparkles size={10} className="text-violet-500"/>Kelola dan pantau kehadiran guru
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={refreshing}
            className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-violet-500' : 'text-slate-500'}/>
          </button>
          <div className="relative group">
            <button className="px-3 py-2 bg-gradient-to-r from-violet-500 to-emerald-500 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-lg shadow-violet-500/25">
              <Download size={13}/><span className="hidden sm:inline">Export</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button onClick={() => handleExport('excel')}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs rounded-t-xl">
                <FileSpreadsheet size={14} className="text-emerald-500"/>Excel (.xlsx)
              </button>
              <button onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs rounded-b-xl">
                <FileText size={14} className="text-red-500"/>PDF (.pdf)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
        {[
          { key:'list', label:'Daftar Absensi' },
          { key:'statistik', label:'Statistik' },
          { key:'rekap', label:'Rekap Per Guru' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setSelectedTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedTab === tab.key
                ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      {statistik && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard title="Total Guru"      value={statistik.total_guru}             icon={Users}      color="purple" description="Terdaftar"
            subStats={[{label:'Sudah Absen',value:statistik.total_guru_absen||0},{label:'Belum',value:statistik.total_guru_belum_absen||0}]}/>
          <StatCard title="Sudah Absen"     value={statistik.total_guru_absen}        icon={CheckCircle} color="green"  description="Hari ini"
            trend="up" trendValue={`${statistik.total_guru>0?Math.round((statistik.total_guru_absen/statistik.total_guru)*100):0}%`}/>
          <StatCard title="Belum Absen"     value={statistik.total_guru_belum_absen}  icon={AlertCircle} color="orange" description="Hari ini"
            trend="down" trendValue={`${statistik.total_guru>0?Math.round((statistik.total_guru_belum_absen/statistik.total_guru)*100):0}%`}/>
          <StatCard title="Total Hadir"     value={statistik.total_hadir}             icon={UserCheck}   color="green"  description="Bulan ini"
            trend="up" trendValue={`${statistik.persentase_kehadiran||0}%`}/>
          <StatCard title="Total Terlambat" value={statistik.total_terlambat}         icon={Clock}       color="orange" description={`Rata-rata ${statistik.rata_rata_terlambat||0} menit`}/>
        </div>
      )}

      {/* Content based on selected tab */}
      <AnimatePresence mode="wait">
        {selectedTab === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                    <input type="text" placeholder="Cari nama guru atau NIP..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400"/>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <select value={filters.bulan} onChange={(e) => handleFilterChange('bulan', e.target.value)}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                      {Array.from({length:12},(_,i)=>(
                        <option key={i+1} value={i+1}>{new Date(2000,i).toLocaleDateString('id-ID',{month:'long'})}</option>
                      ))}
                    </select>
                    <select value={filters.tahun} onChange={(e) => handleFilterChange('tahun', e.target.value)}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                      {Array.from({length:5},(_,i)=>{const y=new Date().getFullYear()-i;return <option key={y} value={y}>{y}</option>})}
                    </select>
                    <button onClick={() => setShowFilters(!showFilters)}
                      className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold border transition-all ${
                        showFilters ? 'bg-violet-500 text-white border-violet-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                      <Filter size={13}/><span className="hidden sm:inline">Filter</span>
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                      className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Status</label>
                          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                            <option value="">Semua Status</option>
                            <option value="hadir">Hadir</option>
                            <option value="terlambat">Terlambat</option>
                            <option value="alpha">Alpha</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Metode</label>
                          <select value={filters.metode} onChange={(e) => handleFilterChange('metode', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                            <option value="">Semua Metode</option>
                            <option value="manual">Manual</option>
                            <option value="qr_code">QR Code</option>
                            <option value="fingerprint">Sidik Jari</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tanggal</label>
                          <input type="date" value={filters.tanggal} onChange={(e) => handleFilterChange('tanggal', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"/>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                searchPlaceholder="Cari guru..."
              />
            </div>
          </motion.div>
        )}

        {selectedTab === 'statistik' && statistik && (
          <motion.div
            key="statistik"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Grafik Mingguan */}
            <div className="bg-white/90 dark:bg-[#1F3A44]/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/60 p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#8B5CF6]/20 dark:bg-[#C084FC]/20 rounded-lg">
                    <BarChart3 size={18} className="text-[#8B5CF6] dark:text-[#C084FC]" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Grafik Kehadiran 7 Hari Terakhir
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {statistik.grafik_mingguan?.map((item, idx) => {
                  const maxValue = Math.max(...statistik.grafik_mingguan.map(d => d.total))
                  const heightPercentage = maxValue > 0 ? (item.total / maxValue) * 100 : 0
                  
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-full h-28 sm:h-32 flex flex-col justify-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercentage}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="relative group"
                        >
                          <div className={`absolute inset-0 rounded-t-lg ${
                            item.total === maxValue 
                              ? 'bg-gradient-to-t from-[#8B5CF6] to-[#10B981]' 
                              : 'bg-gradient-to-t from-[#8B5CF6]/70 to-[#10B981]/70 dark:from-[#C084FC]/50 dark:to-[#34D399]/50'
                          }`}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg z-10">
                              {item.total} guru
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {item.hari?.substring(0, 3) || '-'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500">
                          {new Date(item.tanggal).getDate()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Guru Belum Absen Hari Ini */}
            {statistik.guru_belum_absen_hari_ini?.length > 0 && (
              <div className="bg-white/90 dark:bg-[#1F3A44]/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/60 p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-[#F59E0B]/20 dark:bg-[#FBBF24]/20 rounded-lg">
                    <AlertCircle size={18} className="text-[#F59E0B] dark:text-[#FBBF24]" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Guru Belum Absen Hari Ini
                  </h3>
                  <span className="px-2 py-0.5 bg-[#F59E0B]/20 dark:bg-[#FBBF24]/20 text-[#F59E0B] dark:text-[#FBBF24] text-xs rounded-full">
                    {statistik.guru_belum_absen_hari_ini.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {statistik.guru_belum_absen_hari_ini.map((guru) => (
                    <motion.div
                      key={guru.id}
                      whileHover={{ x: 2 }}
                      className="flex items-center gap-3 p-3 bg-[#F59E0B]/20 dark:bg-[#FBBF24]/20 rounded-xl border border-[#F59E0B]/30 dark:border-[#FBBF24]/30"
                    >
                      <div className="relative flex-shrink-0">
                        {guru.foto ? (
                          <img 
                            src={guru.foto} 
                            alt={guru.nama} 
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-[#1F3A44]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center text-white font-bold text-sm">
                            {guru.nama.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{guru.nama}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">NIP: {guru.nip}</p>
                      </div>
                      <Clock size={14} className="text-[#F59E0B] animate-pulse" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Ranking Grid: Rajin + Terlambat + Alpha */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

              {/* Top Guru Rajin */}
              {statistik.guru_rajin?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 bg-gradient-to-r from-[#10B981] to-[#34D399]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/25 rounded-xl">
                          <Award size={15} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">Paling Rajin</h3>
                          <p className="text-[10px] text-white/75">Top hadir bulan ini</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-white/20 rounded-lg text-white text-[10px] font-bold">
                        Top {statistik.guru_rajin.length}
                      </span>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="p-3 space-y-1.5">
                    {statistik.guru_rajin.map((item, idx) => {
                      const maxHadir = statistik.guru_rajin[0]?.total_hadir || 1
                      const barW = Math.round((item.total_hadir / maxHadir) * 100)
                      const isTop3 = idx < 3
                      const rankColors = ['#F59E0B','#94a3b8','#f97316']
                      return (
                        <motion.div key={idx}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border overflow-hidden transition-all cursor-pointer hover:shadow-sm active:scale-[0.99] ${
                            idx === 0
                              ? 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/50'
                          }`}
                          onClick={() => setSelectedSiswaRanking({ ...item, posisi: idx + 1 })}>
                          {/* bar bg */}
                          <motion.div className="absolute inset-y-0 left-0 pointer-events-none rounded-xl"
                            initial={{ width: 0 }} animate={{ width: `${barW}%` }}
                            transition={{ delay: 0.3 + idx * 0.04, duration: 0.6, ease: 'easeOut' }}
                            style={{ background: '#10B98108' }} />
                          {/* rank badge */}
                          <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg"
                            style={isTop3
                              ? { background: `${rankColors[idx]}20` }
                              : { background: 'rgba(100,116,139,0.1)' }}>
                            {isTop3
                              ? <span className="text-[11px] font-black" style={{ color: rankColors[idx] }}>{idx + 1}</span>
                              : <span className="text-[11px] font-black text-slate-400">{idx + 1}</span>
                            }
                          </div>
                          {/* avatar */}
                          <div className="flex-shrink-0">
                            {(item.guru.foto_url || item.guru.foto)
                              ? <img src={(item.guru.foto_url || item.guru.foto)} alt={item.guru.nama} className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-900" />
                              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center text-white font-bold text-sm">
                                  {item.guru.nama.charAt(0)}
                                </div>
                            }
                          </div>
                          {/* info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{item.guru.nama}</p>
                            <p className="text-[10px] text-slate-400 truncate">NIP: {item.guru.nip}</p>
                          </div>
                          {/* score */}
                          <div className="flex-shrink-0 text-right">
                            <p className="text-base font-black text-[#10B981] dark:text-[#34D399] leading-none">{item.persentase_kehadiran}%</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{item.total_hadir} hadir</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <CheckCircle size={9} className="text-[#10B981]" />
                      {new Date(2000, filters.bulan - 1).toLocaleDateString('id-ID', { month: 'long' })} {filters.tahun}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Top Guru Terlambat */}
              {statistik.guru_sering_terlambat?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/25 rounded-xl">
                          <Clock size={15} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">Sering Terlambat</h3>
                          <p className="text-[10px] text-white/75">Top keterlambatan</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-white/20 rounded-lg text-white text-[10px] font-bold">
                        Top {statistik.guru_sering_terlambat.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {statistik.guru_sering_terlambat.map((item, idx) => {
                      const maxTerlambat = statistik.guru_sering_terlambat[0]?.total_terlambat || 1
                      const barW = Math.round((item.total_terlambat / maxTerlambat) * 100)
                      const isTop3 = idx < 3
                      const rankColors = ['#F59E0B','#94a3b8','#f97316']
                      return (
                        <motion.div key={idx}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border overflow-hidden transition-all cursor-pointer hover:shadow-sm active:scale-[0.99] ${
                            idx === 0
                              ? 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/50'
                          }`}
                          onClick={() => setSelectedSiswaRanking({ ...item, posisi: idx + 1 })}>
                          <motion.div className="absolute inset-y-0 left-0 pointer-events-none rounded-xl"
                            initial={{ width: 0 }} animate={{ width: `${barW}%` }}
                            transition={{ delay: 0.3 + idx * 0.04, duration: 0.6, ease: 'easeOut' }}
                            style={{ background: '#F59E0B08' }} />
                          <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg"
                            style={isTop3
                              ? { background: `${rankColors[idx]}20` }
                              : { background: 'rgba(100,116,139,0.1)' }}>
                            {isTop3
                              ? <span className="text-[11px] font-black" style={{ color: rankColors[idx] }}>{idx + 1}</span>
                              : <span className="text-[11px] font-black text-slate-400">{idx + 1}</span>
                            }
                          </div>
                          <div className="flex-shrink-0">
                            {(item.guru.foto_url || item.guru.foto)
                              ? <img src={(item.guru.foto_url || item.guru.foto)} alt={item.guru.nama} className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-900" />
                              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center text-white font-bold text-sm">
                                  {item.guru.nama.charAt(0)}
                                </div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{item.guru.nama}</p>
                            <p className="text-[10px] text-slate-400 truncate">NIP: {item.guru.nip}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-base font-black text-[#F59E0B] dark:text-[#FBBF24] leading-none">{item.total_terlambat}x</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">~{item.rata_rata_terlambat}m</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={9} className="text-[#F59E0B]" />
                      {new Date(2000, filters.bulan - 1).toLocaleDateString('id-ID', { month: 'long' })} {filters.tahun}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Top Guru Alpha */}
              {statistik.guru_sering_alpha?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-[#EF4444] to-[#F87171]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/25 rounded-xl">
                          <XCircle size={15} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">Sering Alpha</h3>
                          <p className="text-[10px] text-white/75">Top ketidakhadiran</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-white/20 rounded-lg text-white text-[10px] font-bold">
                        Top {statistik.guru_sering_alpha.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {statistik.guru_sering_alpha.map((item, idx) => {
                      const maxAlpha = statistik.guru_sering_alpha[0]?.total_alpha || 1
                      const barW = Math.round((item.total_alpha / maxAlpha) * 100)
                      const isTop3 = idx < 3
                      const rankColors = ['#F59E0B','#94a3b8','#f97316']
                      return (
                        <motion.div key={idx}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border overflow-hidden transition-all cursor-pointer hover:shadow-sm active:scale-[0.99] ${
                            idx === 0
                              ? 'bg-red-50/60 dark:bg-red-900/10 border-red-100 dark:border-red-800/30'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/50'
                          }`}
                          onClick={() => setSelectedSiswaRanking({ ...item, posisi: idx + 1 })}>
                          <motion.div className="absolute inset-y-0 left-0 pointer-events-none rounded-xl"
                            initial={{ width: 0 }} animate={{ width: `${barW}%` }}
                            transition={{ delay: 0.3 + idx * 0.04, duration: 0.6, ease: 'easeOut' }}
                            style={{ background: '#EF444408' }} />
                          <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg"
                            style={isTop3
                              ? { background: `${rankColors[idx]}20` }
                              : { background: 'rgba(100,116,139,0.1)' }}>
                            {isTop3
                              ? <span className="text-[11px] font-black" style={{ color: rankColors[idx] }}>{idx + 1}</span>
                              : <span className="text-[11px] font-black text-slate-400">{idx + 1}</span>
                            }
                          </div>
                          <div className="flex-shrink-0">
                            {(item.guru.foto_url || item.guru.foto)
                              ? <img src={(item.guru.foto_url || item.guru.foto)} alt={item.guru.nama} className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-900" />
                              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EF4444] to-[#F87171] flex items-center justify-center text-white font-bold text-sm">
                                  {item.guru.nama.charAt(0)}
                                </div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{item.guru.nama}</p>
                            <p className="text-[10px] text-slate-400 truncate">NIP: {item.guru.nip}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-base font-black text-[#EF4444] dark:text-[#F87171] leading-none">{item.total_alpha}x</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">alpha</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <XCircle size={9} className="text-[#EF4444]" />
                      {new Date(2000, filters.bulan - 1).toLocaleDateString('id-ID', { month: 'long' })} {filters.tahun}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Fallback: jika guru_sering_alpha belum ada di API */}
              {!statistik.guru_sering_alpha && statistik.guru_sering_terlambat?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-[#EF4444] to-[#F87171]">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white/25 rounded-xl">
                        <XCircle size={15} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Sering Alpha</h3>
                        <p className="text-[10px] text-white/75">Data dari rekap per guru</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                    <XCircle size={28} className="opacity-20" />
                    <p className="text-xs font-medium">Data alpha guru belum tersedia</p>
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 text-center px-4">Perbarui API untuk menampilkan guru_sering_alpha</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Rekap Per Guru Tab */}
        {selectedTab === 'rekap' && (
          <motion.div
            key="rekap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Search & Filter */}
            <div className="bg-white/90 dark:bg-[#1F3A44]/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8B5CF6] transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="Cari nama guru atau NIP..."
                    value={rekapSearch}
                    onChange={(e) => setRekapSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchRekap(rekapSearch)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1F3A44] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filters.bulan}
                    onChange={(e) => handleFilterChange('bulan', e.target.value)}
                    className="px-3 py-2.5 bg-white dark:bg-[#1F3A44] border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleDateString('id-ID', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.tahun}
                    onChange={(e) => handleFilterChange('tahun', e.target.value)}
                    className="px-3 py-2.5 bg-white dark:bg-[#1F3A44] border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i
                      return <option key={year} value={year}>{year}</option>
                    })}
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => fetchRekap(rekapSearch)}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white rounded-xl text-sm font-medium transition-all"
                  >
                    <RefreshCw size={15} className={loadingRekap ? 'animate-spin' : ''} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Tabel Rekap */}
            <div className="bg-white/90 dark:bg-[#1F3A44]/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-lg overflow-hidden">
              {loadingRekap ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw size={24} className="animate-spin text-[#8B5CF6]" />
                </div>
              ) : rekapData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Users size={40} className="mb-3 opacity-40" />
                  <p className="text-sm">Belum ada data rekap</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#1F3A44]/80 border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Guru</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Hadir</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Terlambat</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Alpha</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Rata-rata Terlambat</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">% Kehadiran</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {rekapData.map((item, idx) => {
                        const pct = item.persentase_kehadiran
                        const pctColor = pct >= 80 ? 'text-[#10B981] dark:text-[#34D399]' : pct >= 60 ? 'text-[#F59E0B] dark:text-[#FBBF24]' : 'text-[#EF4444] dark:text-[#F87171]'
                        const barColor = pct >= 80 ? 'bg-[#10B981]' : pct >= 60 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                        return (
                          <motion.tr
                            key={item.guru.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="hover:bg-[#8B5CF6]/5 dark:hover:bg-[#C084FC]/10 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {(item.guru.foto_url || item.guru.foto) ? (
                                  <img src={(item.guru.foto_url || item.guru.foto)} alt={item.guru.nama} className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-[#1F3A44] flex-shrink-0" />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {item.guru.nama.charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-900 dark:text-white truncate">{item.guru.nama}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">NIP: {item.guru.nip}</p>
                                </div>
                              </div>
                             </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-10 h-7 bg-[#10B981]/20 dark:bg-[#34D399]/20 text-[#10B981] dark:text-[#34D399] rounded-lg text-sm font-bold">
                                {item.total_hadir}
                              </span>
                             </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-10 h-7 bg-[#F59E0B]/20 dark:bg-[#FBBF24]/20 text-[#F59E0B] dark:text-[#FBBF24] rounded-lg text-sm font-bold">
                                {item.total_terlambat}
                              </span>
                             </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-10 h-7 bg-[#EF4444]/20 dark:bg-[#EF4444]/20 text-[#EF4444] dark:text-[#F87171] rounded-lg text-sm font-bold">
                                {item.total_alpha}
                              </span>
                             </td>
                            <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400 text-sm">
                              {item.rata_rata_terlambat > 0 ? `${item.rata_rata_terlambat} menit` : '-'}
                             </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`text-sm font-bold ${pctColor}`}>{pct}%</span>
                                <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, delay: idx * 0.03 }}
                                    className={`h-full rounded-full ${barColor}`}
                                  />
                                </div>
                              </div>
                             </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary footer */}
            {rekapData.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Guru', value: rekapData.length, color: 'text-[#8B5CF6] dark:text-[#C084FC]', bg: 'bg-[#8B5CF6]/20 dark:bg-[#C084FC]/20' },
                  { label: 'Total Hadir', value: rekapData.reduce((s, i) => s + i.total_hadir, 0), color: 'text-[#10B981] dark:text-[#34D399]', bg: 'bg-[#10B981]/20 dark:bg-[#34D399]/20' },
                  { label: 'Total Terlambat', value: rekapData.reduce((s, i) => s + i.total_terlambat, 0), color: 'text-[#F59E0B] dark:text-[#FBBF24]', bg: 'bg-[#F59E0B]/20 dark:bg-[#FBBF24]/20' },
                  { label: 'Total Alpha', value: rekapData.reduce((s, i) => s + i.total_alpha, 0), color: 'text-[#EF4444] dark:text-[#F87171]', bg: 'bg-[#EF4444]/20 dark:bg-[#EF4444]/20' },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-slate-200 dark:border-slate-700/50`}>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline styles */}
      <style jsx>{`
        .text-gradient-purple-green {
          background: linear-gradient(135deg, #8B5CF6 0%, #10B981 50%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dark .text-gradient-purple-green {
          background: linear-gradient(135deg, #C084FC 0%, #34D399 50%, #C084FC 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  )
}
