import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter,
  Medal,
  Star,
  Crown,
  User,
  Users,
  Clock,
  AlertCircle,
  XCircle,
  CheckCircle,
  Award,
  Sparkles,
  GraduationCap,
  School,
  ChevronDown,
  BarChart3,
  Activity
} from 'lucide-react'
import { guruApi } from '../../services/guruService'
import toast from 'react-hot-toast'

export default function GuruRanking() {
  const [loading, setLoading] = useState(false)
  const [rankingData, setRankingData] = useState(null)
  const [kelasAmpu, setKelasAmpu] = useState(null)
  const [showStats, setShowStats] = useState(true)
  const [filters, setFilters] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
  })

  useEffect(() => {
    fetchKelasDiampu()
  }, [])

  useEffect(() => {
    if (kelasAmpu) {
      fetchRanking()
    }
  }, [filters, kelasAmpu])

  const fetchKelasDiampu = async () => {
    try {
      const response = await guruApi.getKelasDiampu()
      const kelasData = response.data.data || []
      
      if (kelasData.length === 0) {
        toast.error('Anda belum memiliki kelas yang diampu. Hubungi admin untuk menambahkan penugasan mengajar.')
        return
      }
      
      // Ambil kelas pertama (karena guru hanya mengampu 1 kelas)
      setKelasAmpu(kelasData[0])
    } catch (error) {
      console.error('Error fetching kelas:', error)
      toast.error('Gagal memuat daftar kelas')
    }
  }

  const fetchRanking = async () => {
    try {
      setLoading(true)
      const params = {
        bulan: filters.bulan,
        tahun: filters.tahun,
        kelas_id: kelasAmpu.id, // Otomatis gunakan kelas yang diampu
      }
      
      const response = await guruApi.getRankingSiswa(params)
      setRankingData(response.data.data)
    } catch (error) {
      console.error('Error fetching ranking:', error)
      toast.error(error.response?.data?.message || 'Gagal memuat data ranking')
    } finally {
      setLoading(false)
    }
  }

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

  const tahunOptions = [2024, 2025, 2026, 2027]

  const getBulanName = (value) => {
    return bulanOptions.find(b => b.value === value)?.label || ''
  }

  const RankingCard = ({ title, data, icon: Icon, gradient, type }) => {
    const getIconForPosition = (index) => {
      if (index === 0) return Crown
      if (index === 1) return Medal
      if (index === 2) return Star
      return User
    }

    const getPositionColor = (index) => {
      if (index === 0) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      if (index === 1) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      if (index === 2) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800'
      return 'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    }

    const getValueDisplay = (siswa) => {
      switch(type) {
        case 'rajin':
          return (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                  {siswa.total_hadir}x
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[50px] sm:max-w-none">
                {siswa.persentase_kehadiran}% hadir
              </p>
            </div>
          )
        case 'terlambat':
          return (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Clock size={12} className="flex-shrink-0" />
              <span className="font-bold text-xs sm:text-sm">{siswa.total_terlambat}x</span>
            </div>
          )
        case 'alpha':
          return (
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <XCircle size={12} className="flex-shrink-0" />
              <span className="font-bold text-xs sm:text-sm">{siswa.total_alpha}x</span>
            </div>
          )
        default:
          return null
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-lg transition-all"
      >
        {/* Card Header */}
        <div className={`p-3 sm:p-4 md:p-5 ${gradient} border-b border-slate-200 dark:border-slate-700`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 md:p-2.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex-shrink-0">
                <Icon size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">{title}</h3>
                <p className="text-[10px] sm:text-xs text-white/80 mt-0.5 truncate">
                  {kelasAmpu?.nama_kelas || 'Memuat...'} • {getBulanName(filters.bulan)} {filters.tahun}
                </p>
              </div>
            </div>
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-[10px] sm:text-xs md:text-sm font-medium flex-shrink-0">
              Top {data?.length || 0}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3 sm:p-4 md:p-5">
          {data && data.length > 0 ? (
            <div className="space-y-1.5 sm:space-y-2">
              {data.map((siswa, index) => {
                const PositionIcon = getIconForPosition(index)
                return (
                  <motion.div
                    key={siswa.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all hover:shadow-md ${
                      index === 0 
                        ? 'bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10 border-amber-200 dark:border-amber-800' 
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800'
                    }`}
                  >
                    {/* Position Badge */}
                    <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center font-bold text-[10px] sm:text-xs border ${getPositionColor(index)}`}>
                      {index + 1}
                    </div>
                    
                    {/* Avatar/Photo */}
                    {siswa.foto_url || siswa.foto ? (
                      <img 
                        src={siswa.foto_url || siswa.foto} 
                        alt={siswa.nama_lengkap}
                        className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[8px] sm:text-[10px] md:text-xs font-bold shadow-sm flex-shrink-0 ${siswa.foto_url || siswa.foto ? 'hidden' : 'flex'}`}>
                      {siswa.nama_lengkap?.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <p className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          {siswa.nama_lengkap}
                        </p>
                        <PositionIcon size={10} className={`flex-shrink-0 ${
                          index === 0 ? 'text-amber-500' :
                          index === 1 ? 'text-slate-400' :
                          index === 2 ? 'text-orange-500' :
                          'text-slate-300'
                        }`} />
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        {siswa.kelas?.nama_kelas || '-'} • {siswa.nis}
                      </p>
                    </div>

                    {/* Value Display */}
                    {getValueDisplay(siswa)}
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-10 md:py-12">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 inline-block mb-3 sm:mb-4">
                <Users size={24} className="text-slate-400" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Belum ada data untuk periode ini
              </p>
            </div>
          )}
        </div>

        {/* Card Footer */}
        {data && data.length > 0 && (
          <div className="px-3 sm:px-4 md:px-5 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <Activity size={10} className="flex-shrink-0" />
              <span className="truncate">Berdasarkan data kehadiran {getBulanName(filters.bulan)} {filters.tahun}</span>
            </p>
          </div>
        )}
      </motion.div>
    )
  }

  const StatSummary = () => {
    if (!rankingData) return null

    const totalRajin = rankingData.siswa_rajin?.length || 0
    const totalTerlambat = rankingData.siswa_sering_terlambat?.length || 0
    const totalAlpha = rankingData.siswa_sering_alpha?.length || 0
    const totalSiswa = rankingData.total_siswa || 0

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 sm:p-4 md:p-5"
      >
        <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="p-1 sm:p-1.5 md:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex-shrink-0">
              <BarChart3 size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
              Ringkasan Statistik
            </h3>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          >
            <ChevronDown size={14} className={`text-slate-400 transform transition-transform ${showStats ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4"
            >
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1 truncate">Total</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">{totalSiswa}</p>
                <p className="text-[8px] sm:text-xs text-slate-500 mt-0.5 truncate">Siswa</p>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 mb-0.5 sm:mb-1 truncate">Rajin</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-emerald-700 dark:text-emerald-300 truncate">{totalRajin}</p>
                <p className="text-[8px] sm:text-xs text-emerald-600 dark:text-emerald-500 mt-0.5 truncate">Top</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 mb-0.5 sm:mb-1 truncate">Telat</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-amber-700 dark:text-amber-300 truncate">{totalTerlambat}</p>
                <p className="text-[8px] sm:text-xs text-amber-600 dark:text-amber-500 mt-0.5 truncate">Perlu</p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                <p className="text-[10px] sm:text-xs text-rose-600 dark:text-rose-400 mb-0.5 sm:mb-1 truncate">Alpha</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-rose-700 dark:text-rose-300 truncate">{totalAlpha}</p>
                <p className="text-[8px] sm:text-xs text-rose-600 dark:text-rose-500 mt-0.5 truncate">Tindak</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] px-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-4 border-slate-200 dark:border-slate-700"></div>
          <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 sm:mt-6 font-medium">
          Memuat data... ranking...
        </p>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-1 sm:mt-2">
          {getBulanName(filters.bulan)} {filters.tahun}
        </p>
      </div>
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
            <Trophy size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
              Ranking Siswa
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Peringkat siswa di kelas yang Anda ampu
            </p>
          </div>
        </div>
      </motion.div>

      {/* No Classes Message */}
      {!kelasAmpu ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-center border border-amber-200 dark:border-amber-800"
        >
          <div className="bg-amber-100 dark:bg-amber-900/30 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <School size={24} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-amber-900 dark:text-amber-100 mb-1 sm:mb-2 truncate">
            Tidak Ada Kelas yang Diampu
          </h3>
          <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mb-4 sm:mb-5 md:mb-6 max-w-md mx-auto">
            Anda belum memiliki penugasan mengajar. Silakan hubungi administrator untuk menambahkan penugasan kelas dan mata pelajaran.
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 text-left max-w-md mx-auto border border-amber-200 dark:border-amber-800">
            <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
              <Sparkles size={14} />
              Solusi:
            </p>
            <ol className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 list-decimal list-inside space-y-1 sm:space-y-2">
              <li className="truncate">Hubungi administrator sekolah</li>
              <li className="truncate">Minta untuk ditambahkan ke mata pelajaran dan kelas</li>
              <li className="truncate">Atau jika Anda wali kelas, pastikan data wali kelas sudah diatur</li>
            </ol>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 sm:p-4 md:p-5"
          >
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
              {/* Info Kelas */}
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <School size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Kelas: {kelasAmpu?.nama_kelas}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <Filter size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Periode:
                </span>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                <select
                  value={filters.bulan}
                  onChange={(e) => setFilters({ ...filters, bulan: Number(e.target.value) })}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  {bulanOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={filters.tahun}
                  onChange={(e) => setFilters({ ...filters, tahun: Number(e.target.value) })}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  {tahunOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Stat Summary */}
          <StatSummary />

          {/* Ranking Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            <RankingCard
              title="Siswa Paling Rajin"
              data={rankingData?.siswa_rajin?.slice(0, 5)}
              icon={Trophy}
              gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
              type="rajin"
            />

            <RankingCard
              title="Sering Terlambat"
              data={[...(rankingData?.siswa_sering_terlambat || [])].sort((a,b) => b.total_terlambat - a.total_terlambat).slice(0, 5)}
              icon={TrendingDown}
              gradient="bg-gradient-to-r from-amber-500 to-orange-500"
              type="terlambat"
            />

            <RankingCard
              title="Sering Alpha"
              data={[...(rankingData?.siswa_sering_alpha || [])].sort((a,b) => b.total_alpha - a.total_alpha).slice(0, 5)}
              icon={TrendingUp}
              gradient="bg-gradient-to-r from-rose-500 to-red-500"
              type="alpha"
            />
          </div>

          {/* Info Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex-shrink-0">
                <Sparkles size={14} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-0.5 sm:mb-1 truncate">
                  Informasi Ranking
                </h4>
                <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  Data ranking dihitung berdasarkan rekap kehadiran siswa pada periode {getBulanName(filters.bulan)} {filters.tahun} untuk kelas {kelasAmpu?.nama_kelas}.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}