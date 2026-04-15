import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  Clock, 
  UserX, 
  FileText,
  Calendar,
  TrendingUp,
  PieChart,
  Activity,
  Award,
  Sparkles,
  School,
  ChevronDown,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle,
  BookOpen
} from 'lucide-react'
import { guruApi } from '../../services/guruService'
import toast from 'react-hot-toast'

export default function GuruStatistikKelas() {
  const [loading, setLoading] = useState(false)
  const [statistikData, setStatistikData] = useState(null)
  const [kelasAmpu, setKelasAmpu] = useState(null)
  const [showGrafik, setShowGrafik] = useState(true)
  const [filters, setFilters] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
  })

  useEffect(() => {
    fetchKelasDiampu()
  }, [])

  useEffect(() => {
    if (kelasAmpu) {
      fetchStatistik()
    }
  }, [filters, kelasAmpu])

  const fetchKelasDiampu = async () => {
    try {
      const response = await guruApi.getKelasDiampu()
      const kelasData = response.data.data || []
      
      if (kelasData.length === 0) {
        toast.error('Anda belum memiliki kelas yang diampu.')
        return
      }
      
      // Ambil kelas pertama (karena guru hanya mengampu 1 kelas)
      setKelasAmpu(kelasData[0])
    } catch (error) {
      console.error('Error fetching kelas:', error)
      toast.error('Gagal memuat data kelas')
    }
  }

  const fetchStatistik = async () => {
    if (!kelasAmpu) return
    
    try {
      setLoading(true)
      const response = await guruApi.getStatistikKelas({
        kelas_id: kelasAmpu.id,
        ...filters
      })
      setStatistikData(response.data.data)
    } catch (error) {
      console.error('Error fetching statistik:', error)
      toast.error(error.response?.data?.message || 'Gagal memuat statistik kelas')
      setStatistikData(null)
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

  const tahunOptions = [2024, 2025, 2026]

  const StatCard = ({ title, value, icon: Icon, gradient, subtitle, color }) => (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group"
    >
      <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${gradient}`} />
      <div className="relative p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
          <div className={`p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-${color}-50 dark:bg-${color}-900/20 group-hover:scale-110 transition-transform flex-shrink-0`}>
            <Icon size={16} className={`text-${color}-600 dark:text-${color}-400`} />
          </div>
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{title}</p>
        {subtitle && (
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )

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
            <BarChart3 size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
              Statistik Kelas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Statistik detail per kelas yang diampu
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 sm:p-4 md:p-5"
      >
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
          {/* Kelas Info Badge */}
          {kelasAmpu && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <School size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 block">
                  {kelasAmpu.nama_kelas}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Kelas yang diampu
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar size={14} className="text-slate-400 flex-shrink-0" />
            <select
              value={filters.bulan}
              onChange={(e) => setFilters({ ...filters, bulan: Number(e.target.value) })}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              {bulanOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label.substring(0, 3)}</option>
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

      {!kelasAmpu ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl p-8 sm:p-10 md:p-12 text-center border border-slate-200 dark:border-slate-700"
        >
          <div className="bg-slate-50 dark:bg-slate-700/50 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <School size={24} className="text-slate-400" />
          </div>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
            Anda belum memiliki kelas yang diampu
          </p>
        </motion.div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-4 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-4 border-emerald-500 border-t-transparent"></div>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 sm:mt-6 font-medium">
            Memuat statistik kelas...
          </p>
        </div>
      ) : statistikData ? (
        <>
          {/* Info Kelas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="p-2 sm:p-2.5 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex-shrink-0">
                  <School size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-emerald-100">Kelas</p>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{statistikData.kelas.nama_kelas}</h2>
                  <p className="text-xs sm:text-sm text-emerald-100 mt-0.5 truncate">{statistikData.kelas.jurusan}</p>
                </div>
              </div>
              <div className="text-right bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 flex-shrink-0">
                <p className="text-[10px] sm:text-xs text-emerald-100">Total Siswa</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{statistikData.kelas.total_siswa}</p>
              </div>
            </div>

            {/* Ringkasan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-5 md:mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2">
                <p className="text-[10px] sm:text-xs text-emerald-100 truncate">Kehadiran</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold">{statistikData.statistik.persentase_kehadiran}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2">
                <p className="text-[10px] sm:text-xs text-emerald-100 truncate">Hadir Hari Ini</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold">{statistikData.statistik.total_hadir}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2">
                <p className="text-[10px] sm:text-xs text-emerald-100 truncate">Rata-rata</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold">
                  {Math.round(statistikData.statistik.total_hadir / (statistikData.grafik_mingguan?.length || 1))}/hari
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2">
                <p className="text-[10px] sm:text-xs text-emerald-100 truncate">Hari</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold">{statistikData.grafik_mingguan?.length || 0}</p>
              </div>
            </div>
          </motion.div>

          {/* Statistik Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            <StatCard
              title="Hadir"
              value={statistikData.statistik.total_hadir}
              icon={UserCheck}
              gradient="from-emerald-500 to-teal-500"
              color="emerald"
              subtitle={`${statistikData.statistik.persentase_kehadiran}% kehadiran`}
            />

            <StatCard
              title="Terlambat"
              value={statistikData.statistik.total_terlambat}
              icon={Clock}
              gradient="from-amber-500 to-orange-500"
              color="amber"
              subtitle={`${statistikData.statistik.total_menit_terlambat || 0} menit total`}
            />

            <StatCard
              title="Izin/Sakit"
              value={statistikData.statistik.total_izin + statistikData.statistik.total_sakit}
              icon={FileText}
              gradient="from-blue-500 to-indigo-500"
              color="blue"
              subtitle={`${statistikData.statistik.total_izin} izin, ${statistikData.statistik.total_sakit} sakit`}
            />

            <StatCard
              title="Alpha"
              value={statistikData.statistik.total_alpha}
              icon={UserX}
              gradient="from-rose-500 to-red-500"
              color="rose"
            />
          </div>

          {/* Grafik Kehadiran */}
          {statistikData.grafik_mingguan && statistikData.grafik_mingguan.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              {/* Grafik Header */}
              <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <div className="p-1 sm:p-1.5 md:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex-shrink-0">
                      <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 dark:text-white truncate">
                      Grafik Kehadiran 7 Hari Terakhir
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowGrafik(!showGrafik)}
                    className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                  >
                    <ChevronDown size={14} className={`text-slate-400 transform transition-transform ${showGrafik ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Grafik Content */}
              <AnimatePresence>
                {showGrafik && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                      <div className="flex items-end justify-between gap-1 sm:gap-2 h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80">
                        {statistikData.grafik_mingguan.map((item, index) => {
                          const total = item.hadir + item.terlambat + item.izin + item.alpha
                          const maxValue = Math.max(...statistikData.grafik_mingguan.map(d => 
                            d.hadir + d.terlambat + d.izin + d.alpha
                          ))
                          
                          return (
                            <motion.div 
                              key={index} 
                              className="flex-1 flex flex-col items-center gap-1 sm:gap-2 group"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              {/* Tooltip */}
                              <div className="relative w-full flex justify-center">
                                <div className="absolute bottom-full mb-1 sm:mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg whitespace-nowrap z-10">
                                  Total: {total} siswa
                                </div>
                              </div>

                              {/* Stacked Bars */}
                              <div className="w-full flex flex-col gap-0.5 items-center h-full max-h-32 sm:max-h-40 md:max-h-48">
                                {/* Hadir */}
                                {item.hadir > 0 && (
                                  <motion.div 
                                    className="w-full bg-emerald-500 rounded-t transition-all duration-500 hover:brightness-110"
                                    initial={{ height: 0 }}
                                    animate={{ 
                                      height: maxValue > 0 ? `${(item.hadir / maxValue) * 100}%` : 0
                                    }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    style={{ minHeight: '2px' }}
                                    title={`Hadir: ${item.hadir}`}
                                  />
                                )}
                                
                                {/* Terlambat */}
                                {item.terlambat > 0 && (
                                  <motion.div 
                                    className="w-full bg-amber-500 transition-all duration-500 hover:brightness-110"
                                    initial={{ height: 0 }}
                                    animate={{ 
                                      height: maxValue > 0 ? `${(item.terlambat / maxValue) * 100}%` : 0
                                    }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    style={{ minHeight: '2px' }}
                                    title={`Terlambat: ${item.terlambat}`}
                                  />
                                )}
                                
                                {/* Izin */}
                                {item.izin > 0 && (
                                  <motion.div 
                                    className="w-full bg-blue-500 transition-all duration-500 hover:brightness-110"
                                    initial={{ height: 0 }}
                                    animate={{ 
                                      height: maxValue > 0 ? `${(item.izin / maxValue) * 100}%` : 0
                                    }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    style={{ minHeight: '2px' }}
                                    title={`Izin: ${item.izin}`}
                                  />
                                )}
                                
                                {/* Alpha */}
                                {item.alpha > 0 && (
                                  <motion.div 
                                    className="w-full bg-rose-500 transition-all duration-500 hover:brightness-110"
                                    initial={{ height: 0 }}
                                    animate={{ 
                                      height: maxValue > 0 ? `${(item.alpha / maxValue) * 100}%` : 0
                                    }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    style={{ minHeight: '2px' }}
                                    title={`Alpha: ${item.alpha}`}
                                  />
                                )}
                              </div>
                              
                              {/* Label */}
                              <div className="text-[8px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                                {item.hari.substring(0, 3)}
                              </div>
                              <div className="text-[6px] sm:text-[10px] text-slate-400 truncate max-w-[30px] sm:max-w-none">
                                {item.tanggal}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mt-4 sm:mt-5 md:mt-6 lg:mt-8 pt-3 sm:pt-4 md:pt-5 lg:pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500"></div>
                          <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">Hadir</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-500"></div>
                          <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">Terlambat</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                          <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">Izin/Sakit</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-rose-500"></div>
                          <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate">Alpha</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Info Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex-shrink-0">
                <Info size={14} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-0.5 truncate">
                  Informasi Statistik
                </h4>
                <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  Data statistik dihitung berdasarkan rekap kehadiran siswa pada kelas {statistikData.kelas.nama_kelas} periode {bulanOptions.find(b => b.value === filters.bulan)?.label} {filters.tahun}. 
                  Grafik menampilkan tren kehadiran 7 hari terakhir.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </div>
  )
}