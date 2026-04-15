import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, 
  Filter, 
  Download,
  Eye,
  Calendar,
  Users,
  Award,
  FileText,
  BookOpen,
  School,
  User,
  MapPin,
  Phone,
  Mail,
  Crown,
  Clock,
  Briefcase,
  X,
  SlidersHorizontal,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import AdminStatCard from '../../components/AdminStatCard'
import { adminApi } from '../../services/adminService'
import toast from 'react-hot-toast'

// Filter Badge Component - EMERALD
const FilterBadge = ({ label, onRemove }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-medium border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm"
  >
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="p-0.5 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30 rounded-full transition-colors"
    >
      <X size={10} />
    </button>
  </motion.span>
)

// Alumni Avatar Component - EMERALD + PURPLE
const AlumniAvatar = ({ alumni }) => {
  const hasPhoto = alumni.foto_url || alumni.foto
  const initial = alumni.nama_lengkap?.charAt(0).toUpperCase() || '?'

  return (
    <div className="relative flex-shrink-0">
      {hasPhoto ? (
        <img 
          src={alumni.foto_url || alumni.foto} 
          alt={alumni.nama_lengkap}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
          onError={(e) => {
            e.target.style.display = 'none'
            if (e.target.nextElementSibling) {
              e.target.nextElementSibling.style.display = 'flex'
            }
          }}
        />
      ) : null}
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-slate-800 ${hasPhoto ? 'hidden' : 'flex'}`}>
        {initial}
      </div>
    </div>
  )
}

// Achievement Badge Component - EMERALD + GOLD
const AchievementBadge = ({ type }) => {
  const config = {
    cumlaude: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      icon: Crown,
      label: 'Cumlaude'
    },
    excellent: {
      bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      icon: Star,
      label: 'Excellent'
    },
    good: {
      bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      icon: CheckCircle,
      label: 'Good'
    }
  }

  const { bg, icon: Icon, label } = config[type] || config.good

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 ${bg} text-white rounded-lg text-[8px] font-medium shadow-sm`}>
      <Icon size={8} />
      {label}
    </span>
  )
}

export default function Alumni() {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    tahun_lulus: '',
    jurusan_id: '',
    predikat: '',
    status: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    tahun_ini: 0,
    per_jurusan: []
  })
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingAlumni, setViewingAlumni] = useState(null)
  const [jurusans, setJurusans] = useState([])
  const [tahunLulusList, setTahunLulusList] = useState([])

  useEffect(() => {
    fetchJurusans()
    fetchTahunLulus()
  }, [])

  useEffect(() => {
    fetchAlumni()
  }, [currentPage, search, filters])

  const fetchJurusans = async () => {
    try {
      const response = await adminApi.getAllJurusans()
      setJurusans(response.data.data || [])
    } catch (error) {
      console.error('Error fetching jurusans:', error)
    }
  }

  const fetchTahunLulus = async () => {
    try {
      const response = await adminApi.getAlumniTahunLulus()
      setTahunLulusList(response.data.data || [])
    } catch (error) {
      console.error('Error fetching tahun lulus:', error)
    }
  }

  const fetchAlumni = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getAlumni({
        page: currentPage,
        search: search,
        per_page: 10,
        ...filters
      })
      const res = response.data
      setAlumni(Array.isArray(res?.data) ? res.data : [])
      setPagination(res?.pagination || null)
      setStats(res?.stats || { total: 0, tahun_ini: 0, per_jurusan: [] })
    } catch (error) {
      console.error('Error fetching alumni:', error)
      toast.error('Gagal memuat data alumni')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (alumniData) => {
    setViewingAlumni(alumniData)
    setIsDetailModalOpen(true)
  }

  const handleExport = async () => {
    try {
      const toastId = toast.loading('Mengunduh data alumni...')
      const response = await adminApi.exportAlumni(filters)
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Alumni-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.dismiss(toastId)
      toast.success('✅ Data alumni berhasil diunduh!')
    } catch (error) {
      toast.dismiss()
      console.error('Export error:', error)
      toast.error('❌ Gagal mengunduh data alumni')
    }
  }

  const removeFilter = (key) => {
    setFilters({ ...filters, [key]: '' })
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const columns = [
    {
      header: 'NIS',
      accessor: 'nis',
      cell: (row) => (
        <span className="font-mono text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          {row.nis}
        </span>
      )
    },
    {
      header: 'Nama Lengkap',
      accessor: 'nama_lengkap',
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <AlumniAvatar alumni={row} />
          <div className="min-w-0">
            <p className="font-medium text-xs text-slate-900 dark:text-white truncate flex items-center gap-0.5">
              {row.nama_lengkap}
              {row.predikat === 'cumlaude' && <Crown size={10} className="text-amber-500 flex-shrink-0" />}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {row.jurusan?.nama_jurusan || '-'}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Jurusan',
      accessor: 'jurusan',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <BookOpen size={10} className="text-emerald-500" />
          <span className="text-xs font-medium">{row.jurusan?.nama_jurusan || '-'}</span>
        </div>
      )
    },
    {
      header: 'Tahun Lulus',
      accessor: 'tahun_lulus',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-medium border border-emerald-500/30 dark:border-emerald-500/30">
          <Calendar size={10} />
          {row.tahun_lulus || '-'}
        </span>
      )
    },
    {
      header: 'Tanggal Lulus',
      accessor: 'tanggal_lulus',
      cell: (row) => (
        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
          <Clock size={10} className="text-slate-400" />
          <span>{formatDate(row.tanggal_lulus)}</span>
        </div>
      )
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleViewDetail(row)}
          className="p-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-400 rounded-lg transition-all border border-purple-500/30 dark:border-purple-500/30 shadow-sm hover:shadow-md"
          title="Lihat Detail"
        >
          <Eye size={14} />
        </motion.button>
      )
    },
  ]

  // Active filters count
  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length

  const statsCards = [
    { label:'Total Alumni',    value:stats.total,                   icon:Users,        color:'#10b981', border:'border-emerald-100 dark:border-emerald-800/40', tc:'text-emerald-600 dark:text-emerald-400', iconBg:'bg-emerald-50 dark:bg-emerald-900/30', delay:0,    sparkType:'area' },
    { label:'Lulus Tahun Ini', value:stats.tahun_ini,               icon:Award,        color:'#6366f1', border:'border-indigo-100 dark:border-indigo-800/40',   tc:'text-indigo-600 dark:text-indigo-400',   iconBg:'bg-indigo-50 dark:bg-indigo-900/30',   delay:0.05, sparkType:'bar' },
    { label:'Jurusan',         value:stats.per_jurusan?.length || 0, icon:School,       color:'#f59e0b', border:'border-amber-100 dark:border-amber-800/40',     tc:'text-amber-600 dark:text-amber-400',     iconBg:'bg-amber-50 dark:bg-amber-900/30',     delay:0.1,  sparkType:'bar' },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 px-3 sm:px-4 lg:px-6 py-4">

      {/* PAGE HEADER */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <GraduationCap size={17} className="text-emerald-600 dark:text-emerald-400"/>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Data Alumni</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{stats.total} alumni · {stats.tahun_ini} lulus tahun ini</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors border ${
              showFilters || activeFiltersCount > 0
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Filter size={12}/>
            <span className="hidden sm:inline">Filter</span>
            {activeFiltersCount > 0 && <span className="px-1 py-0.5 bg-white/25 rounded-full text-[9px]">{activeFiltersCount}</span>}
          </button>
          <button onClick={handleExport}
            className="px-3 py-1.5 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold" style={{ background:'#10b981' }}>
            <Download size={12}/><span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {statsCards.map(s => <AdminStatCard key={s.label} {...s}/>)}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                <SlidersHorizontal size={14} className="text-emerald-500" />
                Filter Data Alumni
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={14} className="text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[9px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Tahun Lulus
                </label>
                <select
                  value={filters.tahun_lulus}
                  onChange={(e) => setFilters({ ...filters, tahun_lulus: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                >
                  <option value="">Semua Tahun</option>
                  {tahunLulusList.map((tahun) => (
                    <option key={tahun} value={tahun}>{tahun}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Jurusan
                </label>
                <select
                  value={filters.jurusan_id}
                  onChange={(e) => setFilters({ ...filters, jurusan_id: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                >
                  <option value="">Semua Jurusan</option>
                  {jurusans.map((jurusan) => (
                    <option key={jurusan.id} value={jurusan.id}>{jurusan.nama_jurusan}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Predikat
                </label>
                <select
                  value={filters.predikat}
                  onChange={(e) => setFilters({ ...filters, predikat: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                >
                  <option value="">Semua Predikat</option>
                  <option value="cumlaude">Cumlaude</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                >
                  <option value="">Semua Status</option>
                  <option value="bekerja">Bekerja</option>
                  <option value="kuliah">Kuliah</option>
                  <option value="wirausaha">Wirausaha</option>
                  <option value="belum">Belum</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400">Filter aktif:</span>
                  {filters.tahun_lulus && (
                    <FilterBadge 
                      label={`Tahun: ${filters.tahun_lulus}`}
                      onRemove={() => removeFilter('tahun_lulus')}
                    />
                  )}
                  {filters.jurusan_id && (
                    <FilterBadge 
                      label={`Jurusan: ${jurusans.find(j => j.id === parseInt(filters.jurusan_id))?.nama_jurusan}`}
                      onRemove={() => removeFilter('jurusan_id')}
                    />
                  )}
                  {filters.predikat && (
                    <FilterBadge 
                      label={`Predikat: ${filters.predikat}`}
                      onRemove={() => removeFilter('predikat')}
                    />
                  )}
                  {filters.status && (
                    <FilterBadge 
                      label={`Status: ${filters.status}`}
                      onRemove={() => removeFilter('status')}
                    />
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <GraduationCap size={12} className="text-emerald-500"/>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Daftar Alumni</p>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-bold">
              {pagination?.total || alumni.length}
            </span>
          </div>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={alumni}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onSearch={setSearch}
            loading={loading}
            searchPlaceholder="Cari alumni berdasarkan NIS atau nama..."
            emptyMessage="Tidak ada data alumni"
          />
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && viewingAlumni && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false)
              setViewingAlumni(null)
            }}
            title={
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm">
                  <Eye size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Detail Alumni</p>
                  <p className="text-[10px] text-slate-400">Informasi lengkap alumni</p>
                </div>
              </div>
            }
            size="md"
          >
            <div className="space-y-5 p-5">
              {/* Header dengan Foto */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  {viewingAlumni.foto_url || viewingAlumni.foto ? (
                    <img
                      src={viewingAlumni.foto_url || viewingAlumni.foto}
                      alt={viewingAlumni.nama_lengkap}
                      className="w-12 h-12 rounded-full object-cover ring-4 ring-white/80 dark:ring-slate-800/80 shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        if (e.target.nextElementSibling) {
                          e.target.nextElementSibling.style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-base font-bold ring-4 ring-white/80 dark:ring-slate-800/80 shadow-md ${viewingAlumni.foto_url || viewingAlumni.foto ? 'hidden' : 'flex'}`}>
                    {viewingAlumni.nama_lengkap?.charAt(0).toUpperCase()}
                  </div>
                  {viewingAlumni.predikat === 'cumlaude' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border-2 border-white dark:border-slate-800"
                    >
                      <Crown size={8} className="text-white" />
                    </motion.div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {viewingAlumni.nama_lengkap}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {viewingAlumni.nis}
                    </span>
                    {viewingAlumni.predikat && (
                      <AchievementBadge type={viewingAlumni.predikat} />
                    )}
                  </div>
                </div>
              </div>

              {/* Data Detail */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 border border-slate-200 dark:border-slate-700/50 shadow-inner">
                <div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                    <FileText size={10} className="text-emerald-500" />
                    NISN
                  </p>
                  <p className="font-medium text-[10px] text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {viewingAlumni.nisn || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                    <BookOpen size={10} className="text-emerald-500" />
                    Jurusan
                  </p>
                  <p className="font-medium text-[10px] text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {viewingAlumni.jurusan?.nama_jurusan || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                    <Calendar size={10} className="text-emerald-500" />
                    Tahun Lulus
                  </p>
                  <p className="font-medium text-[10px] text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {viewingAlumni.tahun_lulus || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                    <Clock size={10} className="text-emerald-500" />
                    Tanggal Lulus
                  </p>
                  <p className="font-medium text-[10px] text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {formatDate(viewingAlumni.tanggal_lulus)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                    <MapPin size={10} className="text-emerald-500" />
                    Alamat
                  </p>
                  <p className="font-medium text-[10px] text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {viewingAlumni.alamat || '-'}
                  </p>
                </div>
              </div>

              {/* Status Info */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20 rounded-lg p-2 border border-emerald-500/30 dark:border-emerald-500/30">
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">Status</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center gap-1">
                    <Briefcase size={10} />
                    {viewingAlumni.status || 'Belum terdata'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20 rounded-lg p-2 border border-emerald-500/30 dark:border-emerald-500/30">
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">Tempat</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-[10px]">
                    {viewingAlumni.tempat_bekerja || viewingAlumni.kampus || '-'}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              {(viewingAlumni.email || viewingAlumni.no_hp) && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 border border-slate-200 dark:border-slate-700/50">
                  <h4 className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <Mail size={10} className="text-emerald-500" />
                    Kontak
                  </h4>
                  <div className="space-y-1">
                    {viewingAlumni.email && (
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <Mail size={10} className="text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-300">{viewingAlumni.email}</span>
                      </div>
                    )}
                    {viewingAlumni.no_hp && (
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <Phone size={10} className="text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-300">{viewingAlumni.no_hp}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

    </div>
  )
}