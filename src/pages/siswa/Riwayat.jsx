import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  History,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Activity,
  ChevronDown,
  RefreshCw,
  Download,
  Printer,
  Sparkles,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  LogOut
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { siswaApi } from '../../services/siswaService'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// Helper format selisih waktu pulang
const fmtSelisihPulang = (menit) => {
  if (menit === null || menit === undefined) return null
  const abs = Math.abs(menit)
  const jam = Math.floor(abs / 60), sisa = abs % 60
  const dur = jam > 0 ? (sisa > 0 ? `${jam}j ${sisa}m` : `${jam} jam`) : `${abs} mnt`
  if (menit > 0) return { label: `-${dur} lebih awal`, cls: 'text-amber-600 dark:text-amber-400', icon: TrendingDown }
  if (menit < 0) return { label: `+${dur} lembur`, cls: 'text-emerald-600 dark:text-emerald-400', icon: TrendingUp }
  return { label: 'Tepat waktu', cls: 'text-blue-600 dark:text-blue-400', icon: Minus }
}

export default function SiswaRiwayat() {
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    hadir: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    alpha: 0
  })
  const [filters, setFilters] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
  })

  useEffect(() => {
    fetchRiwayat()
  }, [currentPage, filters])

  const fetchRiwayat = async () => {
    try {
      setLoading(true)
      const response = await siswaApi.getRiwayat({
        page: currentPage,
        per_page: 10,
        bulan: filters.bulan,
        tahun: filters.tahun,
      })
      const res = response.data
      const data = Array.isArray(res?.data) ? res.data : []
      
      setRiwayat(data)
      setPagination(res?.pagination || null)
      
      // Use stats from API response
      if (res?.stats) {
        setStats(res.stats)
      } else {
        // Fallback to calculating from current page if stats not available
        const newStats = {
          total: data.length,
          hadir: data.filter(item => item.status === 'hadir').length,
          terlambat: data.filter(item => item.status === 'terlambat').length,
          izin: data.filter(item => item.status === 'izin').length,
          sakit: data.filter(item => item.status === 'sakit').length,
          alpha: data.filter(item => item.status === 'alpha').length,
        }
        setStats(newStats)
      }
      
    } catch (error) {
      toast.error('Gagal memuat riwayat absensi')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      hadir: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-300', border: 'border-emerald-200', darkBorder: 'dark:border-emerald-800', icon: CheckCircle, label: 'Hadir' },
      terlambat: { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-300', border: 'border-amber-200', darkBorder: 'dark:border-amber-800', icon: Clock, label: 'Terlambat' },
      izin: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-300', border: 'border-blue-200', darkBorder: 'dark:border-blue-800', icon: FileText, label: 'Izin' },
      sakit: { bg: 'bg-purple-100', text: 'text-purple-700', darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-300', border: 'border-purple-200', darkBorder: 'dark:border-purple-800', icon: Activity, label: 'Sakit' },
      alpha: { bg: 'bg-rose-100', text: 'text-rose-700', darkBg: 'dark:bg-rose-900/30', darkText: 'dark:text-rose-300', border: 'border-rose-200', darkBorder: 'dark:border-rose-800', icon: XCircle, label: 'Alpha' },
    }
    
    const cfg = config[status] || config.alpha
    const Icon = cfg.icon
    
    return (
      <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 ${cfg.bg} ${cfg.text} ${cfg.darkBg} ${cfg.darkText} rounded-lg text-[10px] sm:text-xs font-medium border ${cfg.border} ${cfg.darkBorder} whitespace-nowrap`}>
        <Icon size={10} className="mr-0.5 sm:mr-1 flex-shrink-0" />
        <span className="truncate max-w-[50px] sm:max-w-none">{cfg.label}</span>
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const columns = [
    {
      header: 'Tanggal',
      accessor: 'tanggal',
      cell: (row) => (
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <div className="p-1 sm:p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
            <Calendar size={12} className="text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate max-w-[80px] sm:max-w-none">
            {new Date(row.tanggal).toLocaleDateString('id-ID', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })}
          </span>
        </div>
      ),
    },
    {
      header: 'Jam',
      accessor: 'jam_masuk',
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <Clock size={12} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">{row.jam_masuk || '-'}</span>
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
          <span className="hidden lg:inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 rounded-lg text-[10px] sm:text-xs font-medium border border-amber-200 dark:border-amber-800">
            <Clock size={10} className="mr-0.5 sm:mr-1 flex-shrink-0" />
            <span className="truncate max-w-[40px] sm:max-w-none">{row.menit_keterlambatan} menit</span>
          </span>
        ) : (
          <span className="hidden lg:block text-slate-400 text-xs sm:text-sm">-</span>
        )
      ),
    },
    {
      header: 'Jam Pulang',
      accessor: 'jam_pulang',
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs sm:text-sm">
          <LogOut size={12} className={`flex-shrink-0 ${row.jam_pulang ? 'text-emerald-500' : 'text-slate-300'}`}/>
          <span className={`font-mono ${row.jam_pulang ? 'text-slate-700 dark:text-slate-300 font-semibold' : 'text-slate-400'}`}>
            {row.jam_pulang ? row.jam_pulang.substring(0,5) : '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Selisih Pulang',
      accessor: 'menit_pulang_cepat',
      cell: (row) => {
        if (!row.jam_pulang) return <span className="text-slate-400 text-xs">—</span>
        const s = fmtSelisihPulang(row.menit_pulang_cepat)
        if (!s) return <span className="text-slate-400 text-xs">—</span>
        const Icon = s.icon
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${s.cls}`}>
            <Icon size={11}/>{s.label}
          </span>
        )
      },
    },
    {
      header: 'Metode',
      accessor: 'metode',
      cell: (row) => (
        <span className="hidden xl:inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-lg text-[10px] sm:text-xs font-medium border border-purple-200 dark:border-purple-800">
          {row.metode === 'qr_code' ? 'QR Code' : row.metode}
        </span>
      ),
    },
    {
      header: 'Keterangan',
      accessor: 'keterangan',
      cell: (row) => (
        <div className="max-w-[120px] sm:max-w-[150px] md:max-w-[180px] lg:max-w-[200px]">
          {row.keterangan ? (
            <span 
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 block truncate" 
              title={row.keterangan}
            >
              {row.keterangan}
            </span>
          ) : (
            <span className="text-xs sm:text-sm text-slate-400">-</span>
          )}
        </div>
      ),
    },
  ]

  const bulanOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ]

  const tahunOptions = [2023, 2024, 2025]

  const getBulanName = (value) => {
    return bulanOptions.find(b => b.value === value)?.label || ''
  }

  const persentaseKehadiran = stats.total > 0 
    ? Math.round(((stats.hadir + stats.terlambat) / stats.total) * 100) 
    : 0

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl flex-shrink-0">
            <History size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
              Riwayat Absensi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Lihat riwayat kehadiran Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
          <Calendar size={14} className="text-purple-600 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">
            {getBulanName(filters.bulan)} {filters.tahun}
          </span>
        </div>
      </motion.div>

      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 truncate">
              <Sparkles size={16} />
              <span className="truncate">Ringkasan Kehadiran</span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-50 max-w-2xl">
              Anda memiliki total <span className="font-bold text-white">{stats.total}</span> data kehadiran 
              dengan tingkat kehadiran <span className="font-bold text-white">{persentaseKehadiran}%</span> 
              pada periode {getBulanName(filters.bulan)} {filters.tahun}.
            </p>
          </div>
          <div className="hidden sm:block p-2 sm:p-2.5 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex-shrink-0">
            <Award size={24} className="text-white" />
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4"
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">Total</p>
            <div className="p-1 sm:p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
              <History size={10} className="text-purple-600" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-bold text-slate-900 truncate">{stats.total}</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <p className="text-[10px] sm:text-xs text-emerald-600 truncate">Hadir</p>
            <div className="p-1 sm:p-1.5 bg-white rounded-lg flex-shrink-0">
              <CheckCircle size={10} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-bold text-emerald-700 truncate">{stats.hadir}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <p className="text-[10px] sm:text-xs text-amber-600 truncate">Telat</p>
            <div className="p-1 sm:p-1.5 bg-white rounded-lg flex-shrink-0">
              <Clock size={10} className="text-amber-600" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-bold text-amber-700 truncate">{stats.terlambat}</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <p className="text-[10px] sm:text-xs text-blue-600 truncate">Izin</p>
            <div className="p-1 sm:p-1.5 bg-white rounded-lg flex-shrink-0">
              <FileText size={10} className="text-blue-600" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-bold text-blue-700 truncate">{stats.izin}</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <p className="text-[10px] sm:text-xs text-purple-600 truncate">Sakit</p>
            <div className="p-1 sm:p-1.5 bg-white rounded-lg flex-shrink-0">
              <Activity size={10} className="text-purple-600" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-bold text-purple-700 truncate">{stats.sakit}</p>
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-rose-200 dark:border-rose-800">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <p className="text-[10px] sm:text-xs text-rose-600 truncate">Alpha</p>
            <div className="p-1 sm:p-1.5 bg-white rounded-lg flex-shrink-0">
              <XCircle size={10} className="text-rose-600" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-bold text-rose-700 truncate">{stats.alpha}</p>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        {/* Filter Header */}
        <div className="p-3 sm:p-4 md:p-5 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 sm:gap-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors text-xs sm:text-sm"
          >
            <Filter size={14} />
            <span className="font-medium">Filter Periode</span>
            <ChevronDown size={12} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Active Filter Badge */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-[10px] sm:text-xs border border-purple-200 dark:border-purple-800">
              {getBulanName(filters.bulan)} {filters.tahun}
            </span>
          </div>
        </div>

        {/* Filter Content */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-slate-200 dark:border-slate-700"
            >
              <div className="p-3 sm:p-4 md:p-5">
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Bulan
                    </label>
                    <select
                      value={filters.bulan}
                      onChange={(e) => setFilters({ ...filters, bulan: parseInt(e.target.value) })}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      {bulanOptions.map(b => (
                        <option key={b.value} value={b.value}>{b.label.substring(0, 3)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Tahun
                    </label>
                    <select
                      value={filters.tahun}
                      onChange={(e) => setFilters({ ...filters, tahun: parseInt(e.target.value) })}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      {tahunOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end mt-1 sm:mt-0">
                    <button
                      onClick={() => {
                        setFilters({
                          bulan: new Date().getMonth() + 1,
                          tahun: new Date().getFullYear(),
                        })
                        setCurrentPage(1)
                      }}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center gap-1 sm:gap-2"
                    >
                      <RefreshCw size={12} />
                      <span className="hidden xs:inline">Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="p-3 sm:p-4 md:p-5">
          {!loading && riwayat.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 sm:py-12 md:py-16"
            >
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 inline-block mb-3 sm:mb-4">
                <History size={32} className="text-slate-400" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-1 sm:mb-2">
                Belum Ada Data Riwayat
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto px-4">
                Belum ada data absensi untuk periode {getBulanName(filters.bulan)} {filters.tahun}.
                Coba pilih periode lain.
              </p>
            </motion.div>
          ) : (
            <DataTable
              columns={columns}
              data={riwayat}
              pagination={pagination}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          )}
        </div>
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex-shrink-0">
            <BookOpen size={14} className="text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-purple-800 dark:text-purple-300 mb-0.5 truncate">
              Informasi Riwayat
            </h4>
            <p className="text-[10px] sm:text-xs text-purple-700 dark:text-purple-400 leading-relaxed">
              Menampilkan {riwayat.length} data kehadiran dari total {pagination?.total || 0} data.
              Data diperbarui secara real-time setiap kali Anda melakukan absensi.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}