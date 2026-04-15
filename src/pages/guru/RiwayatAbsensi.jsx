import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  History,
  Filter,
  CheckCircle,
  XCircle,
  ChevronDown,
  RefreshCw,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { guruApi } from '../../services/guruService'
import toast from 'react-hot-toast'

export default function GuruRiwayatAbsensi() {
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    hadir: 0,
    terlambat: 0,
    alpha: 0,
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
      const response = await guruApi.getRiwayatAbsensi({
        page: currentPage,
        per_page: 10,
        bulan: filters.bulan,
        tahun: filters.tahun,
      })
      const res = response.data
      const data = Array.isArray(res?.data) ? res.data : []
      
      setRiwayat(data)
      setPagination(res?.pagination || null)
      
      if (res?.stats) {
        setStats(res.stats)
      } else {
        const newStats = {
          total: data.length,
          hadir: data.filter(item => item.status === 'hadir').length,
          terlambat: data.filter(item => item.status === 'terlambat').length,
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
      hadir: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-300', icon: CheckCircle, label: 'Hadir' },
      terlambat: { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-300', icon: Clock, label: 'Terlambat' },
      alpha: { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'dark:bg-red-900/30', darkText: 'dark:text-red-300', icon: XCircle, label: 'Alpha' },
    }
    
    const cfg = config[status] || config.hadir
    const Icon = cfg.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 ${cfg.bg} ${cfg.text} ${cfg.darkBg} ${cfg.darkText} rounded-lg text-xs font-medium`}>
        <Icon size={12} className="mr-1" />
        {cfg.label}
      </span>
    )
  }

  const columns = [
    {
      header: 'Tanggal',
      accessor: 'tanggal',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-purple-600" />
          <span className="text-sm text-slate-700 dark:text-slate-300">
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
      header: 'Jam Masuk',
      accessor: 'jam_masuk',
      cell: (row) => (
        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
          <Clock size={14} className="text-slate-400" />
          {row.jam_masuk || '-'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Keterlambatan',
      accessor: 'menit_keterlambatan',
      cell: (row) => (
        row.menit_keterlambatan > 0 ? (
          <span className="text-sm text-amber-700">{row.menit_keterlambatan} menit</span>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        )
      ),
    },
    {
      header: 'Metode',
      accessor: 'metode',
      cell: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {row.metode === 'qr_code' ? 'QR Code' : 'Manual'}
        </span>
      ),
    },
    {
      header: 'Keterangan',
      accessor: 'keterangan',
      cell: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.keterangan || '-'}
        </span>
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

  const tahunOptions = [2023, 2024, 2025, 2026]

  const getBulanName = (value) => {
    return bulanOptions.find(b => b.value === value)?.label || ''
  }

  const persentaseKehadiran = stats.total > 0 
    ? Math.round(((stats.hadir + stats.terlambat) / stats.total) * 100) 
    : 0

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <History size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Riwayat Absensi
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Lihat riwayat kehadiran Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <Calendar size={16} className="text-purple-600" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {getBulanName(filters.bulan)} {filters.tahun}
          </span>
        </div>
      </motion.div>

      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Sparkles size={20} />
              Ringkasan Kehadiran
            </h2>
            <p className="text-sm text-purple-50 max-w-2xl">
              Anda memiliki total <span className="font-bold text-white">{stats.total}</span> data kehadiran 
              dengan tingkat kehadiran <span className="font-bold text-white">{persentaseKehadiran}%</span> 
              pada periode {getBulanName(filters.bulan)} {filters.tahun}.
            </p>
          </div>
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Award size={28} className="text-white" />
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500">Total</p>
            <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <History size={14} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-emerald-600">Hadir</p>
            <div className="p-1.5 bg-white rounded-lg">
              <CheckCircle size={14} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats.hadir}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-amber-600">Terlambat</p>
            <div className="p-1.5 bg-white rounded-lg">
              <Clock size={14} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700">{stats.terlambat}</p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-red-600">Alpha</p>
            <div className="p-1.5 bg-white rounded-lg">
              <XCircle size={14} className="text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.alpha}</p>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        {/* Filter Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors"
          >
            <Filter size={16} />
            <span className="font-medium">Filter Periode</span>
            <ChevronDown size={14} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs border border-purple-200 dark:border-purple-800">
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
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Bulan
                    </label>
                    <select
                      value={filters.bulan}
                      onChange={(e) => setFilters({ ...filters, bulan: parseInt(e.target.value) })}
                      className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {bulanOptions.map(b => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Tahun
                    </label>
                    <select
                      value={filters.tahun}
                      onChange={(e) => setFilters({ ...filters, tahun: parseInt(e.target.value) })}
                      className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {tahunOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilters({
                          bulan: new Date().getMonth() + 1,
                          tahun: new Date().getFullYear(),
                        })
                        setCurrentPage(1)
                      }}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
                    >
                      <RefreshCw size={14} />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="p-5">
          {!loading && riwayat.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-8 inline-block mb-4">
                <History size={48} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Belum Ada Data Riwayat
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Belum ada data absensi untuk periode {getBulanName(filters.bulan)} {filters.tahun}.
                Coba pilih periode lain.
              </p>
            </div>
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
        className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <BookOpen size={16} className="text-purple-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-0.5">
              Informasi Riwayat
            </h4>
            <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">
              Menampilkan {riwayat.length} data kehadiran dari total {pagination?.total || 0} data.
              Data diperbarui secara real-time setiap kali Anda melakukan absensi.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
