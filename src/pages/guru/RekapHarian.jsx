import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  UserCheck, 
  Clock, 
  UserX, 
  FileText,
  TrendingUp,
  School,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  Sparkles,
  Award,
  BookOpen,
  X
} from 'lucide-react'
import { guruApi } from '../../services/guruService'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function GuruRekapHarian() {
  const [loading, setLoading] = useState(false)
  const [rekapData, setRekapData] = useState(null)
  const [tanggal, setTanggal] = useState(new Date())
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetchRekap()
  }, [tanggal])

  const fetchRekap = async () => {
    try {
      setLoading(true)
      const response = await guruApi.getRekapHarian({
        tanggal: tanggal.toISOString().split('T')[0]
      })
      setRekapData(response.data.data)
    } catch (error) {
      console.error('Error fetching rekap:', error)
      toast.error(error.response?.data?.message || 'Gagal memuat rekap harian')
      setRekapData(null)
    } finally {
      setLoading(false)
    }
  }

  const formatTanggal = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getStatusColor = (persentase) => {
    if (persentase >= 90) return 'text-emerald-600 dark:text-emerald-400'
    if (persentase >= 75) return 'text-blue-600 dark:text-blue-400'
    if (persentase >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  const getStatusBg = (persentase) => {
    if (persentase >= 90) return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
    if (persentase >= 75) return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
    if (persentase >= 60) return 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
    return 'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800'
  }

  const KelasCard = ({ kelas, index, onClick, isSelected }) => {
    const stats = [
      { label: 'Hadir', value: kelas.hadir, color: 'emerald', icon: CheckCircle },
      { label: 'Terlambat', value: kelas.terlambat, color: 'amber', icon: Clock },
      { label: 'Izin', value: kelas.izin, color: 'blue', icon: FileText },
      { label: 'Alpha', value: kelas.alpha, color: 'rose', icon: XCircle },
    ]

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -4 }}
        onClick={onClick}
        className={`bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border shadow-sm overflow-hidden cursor-pointer transition-all ${
          isSelected 
            ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900'
            : 'border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800'
        }`}
      >
        {/* Card Header */}
        <div className="p-3 sm:p-4 md:p-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl flex-shrink-0">
                <School size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {kelas.nama_kelas}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                  {kelas.jurusan}
                </p>
              </div>
            </div>
            <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium ${getStatusBg(kelas.persentase_kehadiran)}`}>
              {kelas.persentase_kehadiran}%
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3 sm:p-4 md:p-5">
          {/* Total Siswa */}
          <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <Users size={14} className="text-slate-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 truncate">Total Siswa</span>
            </div>
            <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {kelas.total_siswa}
            </span>
          </div>

          {/* Stat Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              const percentage = kelas.total_siswa > 0 
                ? Math.round((stat.value / kelas.total_siswa) * 100) 
                : 0
              
              return (
                <div key={idx} className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border ${getStatusBg(percentage)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <Icon size={12} className={`text-${stat.color}-600 dark:text-${stat.color}-400 flex-shrink-0`} />
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500">{percentage}%</span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                    {stat.label}
                  </p>
                  <p className={`text-base sm:text-lg md:text-xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>
                    {stat.value}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Belum Absen Warning */}
          {kelas.belum_absen > 0 && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg sm:rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <AlertCircle size={12} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-medium text-amber-700 dark:text-amber-300 truncate">
                    Belum Absen
                  </span>
                </div>
                <span className="font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                  {kelas.belum_absen}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const DetailModal = ({ kelas, onClose }) => {
    if (!kelas) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-5 md:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl flex-shrink-0">
                  <School size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">
                    {kelas.nama_kelas}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{kelas.jurusan}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
            {/* Ringkasan */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-300 truncate">Tingkat Kehadiran</span>
                <span className={`text-lg sm:text-xl md:text-2xl font-bold ${getStatusColor(kelas.persentase_kehadiran)}`}>
                  {kelas.persentase_kehadiran}%
                </span>
              </div>
              <div className="h-1.5 sm:h-2 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${kelas.persentase_kehadiran}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                />
              </div>
            </div>

            {/* Statistik Detail */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <UserCheck size={12} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-medium text-emerald-700 truncate">Hadir</span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-emerald-600">{kelas.hadir}</p>
                <p className="text-[8px] sm:text-xs text-emerald-500 mt-0.5 sm:mt-1 truncate">
                  {Math.round((kelas.hadir / kelas.total_siswa) * 100)}%
                </p>
              </div>

              <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <Clock size={12} className="text-amber-600 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-medium text-amber-700 truncate">Telat</span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-amber-600">{kelas.terlambat}</p>
                <p className="text-[8px] sm:text-xs text-amber-500 mt-0.5 sm:mt-1 truncate">
                  {Math.round((kelas.terlambat / kelas.total_siswa) * 100)}%
                </p>
              </div>

              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <FileText size={12} className="text-blue-600 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-medium text-blue-700 truncate">Izin</span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600">{kelas.izin}</p>
                <p className="text-[8px] sm:text-xs text-blue-500 mt-0.5 sm:mt-1 truncate">
                  {Math.round((kelas.izin / kelas.total_siswa) * 100)}%
                </p>
              </div>

              <div className="p-3 sm:p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg sm:rounded-xl border border-rose-200 dark:border-rose-800">
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <XCircle size={12} className="text-rose-600 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-medium text-rose-700 truncate">Alpha</span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-rose-600">{kelas.alpha}</p>
                <p className="text-[8px] sm:text-xs text-rose-500 mt-0.5 sm:mt-1 truncate">
                  {Math.round((kelas.alpha / kelas.total_siswa) * 100)}%
                </p>
              </div>
            </div>

            {/* Belum Absen */}
            {kelas.belum_absen > 0 && (
              <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 sm:gap-3">
                  <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-amber-700 truncate">Belum Absen</p>
                    <p className="text-[10px] sm:text-xs text-amber-600 truncate">
                      {kelas.belum_absen} siswa belum melakukan absensi hari ini
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl flex-shrink-0">
            <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
              Rekap Harian
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Rekap absensi harian per kelas yang diampu
            </p>
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
          <Calendar size={14} className="text-emerald-600 flex-shrink-0" />
          <DatePicker
            selected={tanggal}
            onChange={(date) => setTanggal(date)}
            className="bg-transparent text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 border-none focus:ring-0 w-24 sm:w-28 md:w-32"
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
          />
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-2.5 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex-shrink-0">
            <Calendar size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-emerald-100">Rekap Absensi</p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate">
              {rekapData?.tanggal ? formatTanggal(rekapData.tanggal) : '-'}
            </p>
            {rekapData?.rekap_per_kelas && (
              <p className="text-[10px] sm:text-xs text-emerald-100 mt-0.5 sm:mt-1 flex items-center gap-1 truncate">
                <Sparkles size={12} className="flex-shrink-0" />
                <span className="truncate">
                  {rekapData.rekap_per_kelas.length === 1 
                    ? 'Kelas yang Anda ampu' 
                    : `${rekapData.rekap_per_kelas.length} kelas yang diampu`}
                </span>
              </p>
            )}
          </div>
        </div>
        
        {/* Display kelas info if only 1 class */}
        {rekapData?.rekap_per_kelas && rekapData.rekap_per_kelas.length === 1 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/20">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg w-fit">
              <School size={14} className="flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold">{rekapData.rekap_per_kelas[0].nama_kelas}</p>
                <p className="text-[10px] text-emerald-100">{rekapData.rekap_per_kelas[0].jurusan}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-4 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-4 border-emerald-500 border-t-transparent"></div>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 sm:mt-6 font-medium">
            Memuat data... rekap...
          </p>
        </div>
      ) : rekapData?.rekap_per_kelas && rekapData.rekap_per_kelas.length > 0 ? (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {rekapData.rekap_per_kelas.map((kelas, index) => (
              <KelasCard
                key={kelas.kelas_id}
                kelas={kelas}
                index={index}
                onClick={() => {
                  setSelectedKelas(kelas)
                  setShowDetail(true)
                }}
                isSelected={selectedKelas?.kelas_id === kelas.kelas_id}
              />
            ))}
          </div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex-shrink-0">
                <Award size={14} className="text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-0.5 truncate">
                  Ringkasan
                </h4>
                <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 truncate">
                  Total {rekapData.rekap_per_kelas.reduce((acc, k) => acc + k.total_siswa, 0)} siswa • 
                  Hadir: {rekapData.rekap_per_kelas.reduce((acc, k) => acc + k.hadir, 0)} • 
                  Telat: {rekapData.rekap_per_kelas.reduce((acc, k) => acc + k.terlambat, 0)} • 
                  Izin: {rekapData.rekap_per_kelas.reduce((acc, k) => acc + k.izin, 0)} • 
                  Alpha: {rekapData.rekap_per_kelas.reduce((acc, k) => acc + k.alpha, 0)}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl p-8 sm:p-10 md:p-12 text-center border border-slate-200 dark:border-slate-700"
        >
          <div className="bg-slate-50 dark:bg-slate-700/50 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Users size={24} className="text-slate-400" />
          </div>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
            Tidak ada data rekap untuk tanggal ini
          </p>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1 sm:mt-2">
            Pilih tanggal lain untuk melihat data rekap
          </p>
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetail && (
          <DetailModal
            kelas={selectedKelas}
            onClose={() => {
              setShowDetail(false)
              setSelectedKelas(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}