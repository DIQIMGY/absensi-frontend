import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Users,
  GraduationCap,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  Phone,
  MapPin,
  Calendar,
  User,
  Mail,
  UserCheck,
  UserX,
  Award
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { guruApi } from '../../services/guruService'
import toast from 'react-hot-toast'

export default function DataSiswa() {
  const [siswas, setSiswas] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingSiswa, setViewingSiswa] = useState(null)
  const [kelasInfo, setKelasInfo] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    laki_laki: 0,
    perempuan: 0,
  })

  useEffect(() => {
    fetchSiswas()
    fetchStats()
  }, [currentPage, search])

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [searchInput])

  const fetchStats = async () => {
    try {
      const response = await guruApi.getSiswaStats()
      setStats(response.data.data)
      setKelasInfo(response.data.data.kelas_info)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchSiswas = async () => {
    try {
      setLoading(true)
      
      console.log('Fetching siswas...')
      const response = await guruApi.getSiswas({
        page: currentPage,
        search: search,
        per_page: 10,
      })
      
      console.log('Full Response:', response)
      console.log('Response data:', response.data)
      console.log('Response data.data:', response.data?.data)
      
      // Backend mengembalikan response.data.data (nested)
      const apiData = response.data?.data
      
      if (!apiData) {
        console.warn('No data in response')
        setSiswas([])
        setPagination(null)
        toast.error('Tidak ada data siswa')
        return
      }
      
      // Data siswa ada di apiData.data
      const siswaData = Array.isArray(apiData.data) ? apiData.data : (Array.isArray(apiData) ? apiData : [])
      const paginationData = apiData.pagination || null

      console.log('Siswa data:', siswaData)
      console.log('Pagination:', paginationData)

      if (siswaData.length === 0) {
        console.warn('Siswa data is empty')
        toast.info('Tidak ada siswa di kelas yang Anda ampu')
      }

      setSiswas(siswaData)
      setPagination(paginationData)
      
    } catch (error) {
      console.error('Error fetching siswas:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      
      if (error.response?.status === 404) {
        toast.error('Anda belum mengampu kelas manapun')
      } else {
        toast.error(error.response?.data?.message || 'Gagal memuat data siswa')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (siswa) => {
    setViewingSiswa(siswa)
    setIsDetailModalOpen(true)
  }

  const columns = [
    {
      header: 'Siswa',
      accessor: 'nama_lengkap',
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          {row.foto_url || row.foto ? (
            <img 
              src={row.foto_url || row.foto} 
              alt={row.nama_lengkap}
              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0 border-2 border-white dark:border-slate-700 ${row.foto_url || row.foto ? 'hidden' : 'flex'}`}>
            {row.nama_lengkap?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{row.nama_lengkap}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">NIS: {row.nis}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'NISN',
      accessor: 'nisn',
      cell: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{row.nisn || '-'}</span>
      ),
    },
    {
      header: 'Hadir',
      accessor: 'statistik_absensi.hadir',
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {row.statistik_absensi?.hadir || 0}
        </span>
      ),
    },
    {
      header: 'Terlambat',
      accessor: 'statistik_absensi.terlambat',
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {row.statistik_absensi?.terlambat || 0}
        </span>
      ),
    },
    {
      header: 'Izin/Sakit',
      accessor: 'statistik_absensi.izin',
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {(row.statistik_absensi?.izin || 0) + (row.statistik_absensi?.sakit || 0)}
        </span>
      ),
    },
    {
      header: 'Alpha',
      accessor: 'statistik_absensi.alpha',
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {row.statistik_absensi?.alpha || 0}
        </span>
      ),
    },
    {
      header: 'Belum Absen',
      accessor: 'statistik_absensi.belum_absen',
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300">
          {row.statistik_absensi?.belum_absen || 0}
        </span>
      ),
    },
    {
      header: 'Aksi',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewDetail(row)}
            className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
            title="Lihat" Detail
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="text-teal-600" size={28} />
            Data Siswa
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {kelasInfo ? `Kelas ${kelasInfo.nama_kelas}` : 'Daftar siswa di kelas yang Anda ampu'}
          </p>
        </div>

        <button
          onClick={fetchSiswas}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-lg shadow-teal-600/30"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Siswa</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
              <Users className="text-teal-600 dark:text-teal-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Laki-laki</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.laki_laki}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <UserCheck className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Perempuan</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.perempuan}</p>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
              <UserX className="text-pink-600 dark:text-pink-400" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Cari siswa (Nama, NIS, NISN)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white"
          />
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <DataTable
          columns={columns}
          data={siswas}
          loading={loading}
          pagination={pagination}
          onPageChange={setCurrentPage}
          emptyMessage="Tidak ada data siswa"
        />
      </motion.div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setViewingSiswa(null)
        }}
        title="Detailsiswa"
        size="lg"
      >
        {viewingSiswa && (
          <div className="space-y-6">
            {/* Foto */}
            <div className="flex justify-center">
              {viewingSiswa.foto_url || viewingSiswa.foto ? (
                <img
                  src={viewingSiswa.foto_url || viewingSiswa.foto}
                  alt={viewingSiswa.nama_lengkap}
                  className="w-32 h-32 rounded-full object-cover border-4 border-teal-500 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-teal-500 shadow-lg">
                  {viewingSiswa.nama_lengkap?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Statistik Absensi Bulan Ini */}
            {viewingSiswa.statistik_absensi && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar size={16} className="text-teal-600" />
                  Statistik Absensi Bulan Ini
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{viewingSiswa.statistik_absensi.hadir}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Hadir</p>
                  </div>
                  <div className="text-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{viewingSiswa.statistik_absensi.terlambat}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Terlambat</p>
                  </div>
                  <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{viewingSiswa.statistik_absensi.izin + viewingSiswa.statistik_absensi.sakit}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">Izin/Sakit</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-800">
                    <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{viewingSiswa.statistik_absensi.alpha}</p>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">Alpha</p>
                  </div>
                  <div className="text-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{viewingSiswa.statistik_absensi.belum_absen}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Belum Absen</p>
                  </div>
                  <div className="text-center p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg border border-teal-200 dark:border-teal-800">
                    <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{viewingSiswa.statistik_absensi.persentase_kehadiran}%</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 font-medium">Kehadiran</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <User size={16} className="text-slate-400" />
                  <span className="text-slate-900 dark:text-white">{viewingSiswa.nama_lengkap}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Student Number</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <Award size={16} className="text-slate-400" />
                  <span className="text-slate-900 dark:text-white">{viewingSiswa.nis}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">NISN</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <Award size={16} className="text-slate-400" />
                  <span className="text-slate-900 dark:text-white">{viewingSiswa.nisn || '-'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Student Gender</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  {viewingSiswa.jenis_kelamin === 'L' ? <UserCheck size={16} className="text-blue-500" /> : <UserX size={16} className="text-pink-500" />}
                  <span className="text-slate-900 dark:text-white">
                    {viewingSiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Student Birth Date</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-slate-900 dark:text-white">
                    {viewingSiswa.tanggal_lahir ? new Date(viewingSiswa.tanggal_lahir).toLocaleDateString('id-ID') : '-'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone Number</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <Phone size={16} className="text-slate-400" />
                  <span className="text-slate-900 dark:text-white">{viewingSiswa.no_hp || '-'}</span>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Alamat</label>
                <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <MapPin size={16} className="text-slate-400 mt-0.5" />
                  <span className="text-slate-900 dark:text-white">{viewingSiswa.alamat || '-'}</span>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Nama Orang Tua</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <User size={16} className="text-slate-400" />
                  <span className="text-slate-900 dark:text-white">{viewingSiswa.nama_ortu || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
