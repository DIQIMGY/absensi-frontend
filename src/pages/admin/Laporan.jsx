import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  RefreshCw,
  PieChart,
  BarChart3,
  Printer,
  Eye,
  EyeOff,
  Info,
  Sparkles
} from 'lucide-react'
import { adminApi } from '../../services/adminService'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select'

export default function Laporan() {
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [showPreview, setShowPreview] = useState(true)
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(1)),
    end_date: new Date(),
    kelas_id: '',
    format: 'pdf',
  })
  const [kelasList, setKelasList] = useState([])
  const [stats, setStats] = useState({
    total_absensi: 0,
    hadir: 0,
    sakit: 0,
    izin: 0,
    alpha: 0,
    terlambat: 0
  })

  useEffect(() => {
    fetchKelas()
    fetchPreview()
  }, [])

  useEffect(() => {
    fetchPreview()
  }, [filters.start_date, filters.end_date, filters.kelas_id])

  const fetchKelas = async () => {
    try {
      const response = await adminApi.getAllKelas()
      setKelasList(response.data.data.map(k => ({
        value: k.id,
        label: `${k.nama_kelas} - ${k.jurusan?.nama_jurusan || ''}`
      })))
    } catch (error) {
      console.error('Error fetching kelas:', error)
    }
  }

  const fetchPreview = async () => {
    setPreviewLoading(true)
    try {
      const params = {
        start_date: filters.start_date.toISOString().split('T')[0],
        end_date: filters.end_date.toISOString().split('T')[0],
      }
      if (filters.kelas_id) params.kelas_id = filters.kelas_id

      const response = await adminApi.getLaporanBulanan(params)
      const data = response.data.data
      
      setPreviewData(data)
      
      let totalAbsensi = 0
      let hadir = 0
      let sakit = 0
      let izin = 0
      let alpha = 0
      let terlambat = 0

      if (data && data.length > 0) {
        data.forEach(item => {
          totalAbsensi += item.total_absensi || 0
          hadir += item.hadir || 0
          sakit += item.sakit || 0
          izin += item.izin || 0
          alpha += item.alpha || 0
          terlambat += item.terlambat || 0
        })
      }

      setStats({ total_absensi: totalAbsensi, hadir, sakit, izin, alpha, terlambat })
    } catch (error) {
      console.error('Error fetching preview:', error)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      const params = {
        start_date: filters.start_date.toISOString().split('T')[0],
        end_date: filters.end_date.toISOString().split('T')[0],
      }
      if (filters.kelas_id) params.kelas_id = filters.kelas_id

      let response
      let fileName
      let mimeType

      if (filters.format === 'pdf') {
        response = await adminApi.exportPdf(params)
        fileName = `Laporan-Absensi-${params.start_date}-sd-${params.end_date}.pdf`
        mimeType = 'application/pdf'
      } else {
        response = await adminApi.exportExcel(params)
        fileName = `Laporan-Absensi-${params.start_date}-sd-${params.end_date}.xlsx`
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }

      const blob = new Blob([response.data], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success(`Laporan ${filters.format.toUpperCase()} berhasil diunduh!`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error.response?.data?.message || 'Gagal mengunduh laporan')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFilter = (type) => {
    const today = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (type) {
      case 'today':
        startDate = today
        endDate = today
        break
      case 'week':
        startDate = new Date(today.setDate(today.getDate() - today.getDay()))
        endDate = new Date()
        break
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        endDate = new Date()
        break
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1)
        endDate = new Date()
        break
      default:
        break
    }

    setFilters({ ...filters, start_date: startDate, end_date: endDate })
  }

  const formatDateRange = () => {
    const start = filters.start_date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    const end = filters.end_date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${start} - ${end}`
  }

  const getPercentage = (value) => {
    if (stats.total_absensi === 0) return 0
    return Math.round((value / stats.total_absensi) * 100)
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
          <div className="p-1.5 sm:p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg sm:rounded-xl flex-shrink-0">
            <BarChart3 size={18} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
              Laporan Absensi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Export dan analisis data absensi siswa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate max-w-[200px] sm:max-w-none">
            Periode: {formatDateRange()}
          </div>
        </div>
      </motion.div>

      {/* Quick Filter Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-1.5 sm:gap-2"
      >
        <button
          onClick={() => handleQuickFilter('today')}
          className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 dark:hover:bg-teal-900/20 dark:hover:border-teal-800 transition-all"
        >
          Hari Ini
        </button>
        <button
          onClick={() => handleQuickFilter('week')}
          className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 dark:hover:bg-teal-900/20 dark:hover:border-teal-800 transition-all"
        >
          Minggu Ini
        </button>
        <button
          onClick={() => handleQuickFilter('month')}
          className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 dark:hover:bg-teal-900/20 dark:hover:border-teal-800 transition-all"
        >
          Bulan Ini
        </button>
        <button
          onClick={() => handleQuickFilter('year')}
          className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 dark:hover:bg-teal-900/20 dark:hover:border-teal-800 transition-all"
        >
          Tahun Ini
        </button>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4"
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">Total</p>
            <div className="p-1 sm:p-1.5 md:p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex-shrink-0">
              <Users size={12} className="text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-slate-900 dark:text-white truncate">
            {previewLoading ? <span className="animate-pulse">...</span> : stats.total_absensi}
          </p>
          <p className="text-[8px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">Total kehadiran</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 truncate">Hadir</p>
            <div className="p-1 sm:p-1.5 md:p-2 bg-white dark:bg-slate-800 rounded-lg flex-shrink-0">
              <CheckCircle size={12} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-emerald-700 dark:text-emerald-300 truncate">
            {previewLoading ? '...' : stats.hadir}
          </p>
          <p className="text-[8px] sm:text-xs text-emerald-600 mt-0.5 sm:mt-1 truncate">{getPercentage(stats.hadir)}%</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 truncate">Telat</p>
            <div className="p-1 sm:p-1.5 md:p-2 bg-white dark:bg-slate-800 rounded-lg flex-shrink-0">
              <Clock size={12} className="text-amber-600" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-amber-700 dark:text-amber-300 truncate">
            {previewLoading ? '...' : stats.terlambat}
          </p>
          <p className="text-[8px] sm:text-xs text-amber-600 mt-0.5 sm:mt-1 truncate">{getPercentage(stats.terlambat)}%</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 truncate">Izin</p>
            <div className="p-1 sm:p-1.5 md:p-2 bg-white dark:bg-slate-800 rounded-lg flex-shrink-0">
              <FileText size={12} className="text-blue-600" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-blue-700 dark:text-blue-300 truncate">
            {previewLoading ? '...' : stats.izin}
          </p>
          <p className="text-[8px] sm:text-xs text-blue-600 mt-0.5 sm:mt-1 truncate">{getPercentage(stats.izin)}%</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 truncate">Sakit</p>
            <div className="p-1 sm:p-1.5 md:p-2 bg-white dark:bg-slate-800 rounded-lg flex-shrink-0">
              <AlertCircle size={12} className="text-purple-600" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-purple-700 dark:text-purple-300 truncate">
            {previewLoading ? '...' : stats.sakit}
          </p>
          <p className="text-[8px] sm:text-xs text-purple-600 mt-0.5 sm:mt-1 truncate">{getPercentage(stats.sakit)}%</p>
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-5 border border-rose-200 dark:border-rose-800">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-[10px] sm:text-xs text-rose-600 dark:text-rose-400 truncate">Alpha</p>
            <div className="p-1 sm:p-1.5 md:p-2 bg-white dark:bg-slate-800 rounded-lg flex-shrink-0">
              <XCircle size={12} className="text-rose-600" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-rose-700 dark:text-rose-300 truncate">
            {previewLoading ? '...' : stats.alpha}
          </p>
          <p className="text-[8px] sm:text-xs text-rose-600 mt-0.5 sm:mt-1 truncate">{getPercentage(stats.alpha)}%</p>
        </div>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        <div className="p-3 sm:p-4 md:p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-1.5 md:p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex-shrink-0">
                <Filter size={14} className="text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Filter Laporan</h3>
            </div>
            {filters.kelas_id && (
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-[10px] sm:text-xs font-medium rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
                <Info size={10} />
                <span className="truncate">Filter: {kelasList.find(k => k.value === filters.kelas_id)?.label}</span>
              </span>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Tanggal Mulai */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 sm:mb-1.5">
                <Calendar size={12} className="inline mr-1" />
                Tanggal Mulai
              </label>
              <div className="relative">
                <Calendar className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={12} />
                <DatePicker
                  selected={filters.start_date}
                  onChange={(date) => setFilters({ ...filters, start_date: date })}
                  className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  dateFormat="dd/MM/yyyy"
                  maxDate={filters.end_date}
                />
              </div>
            </div>

            {/* Tanggal Selesai */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 sm:mb-1.5">
                <Calendar size={12} className="inline mr-1" />
                Tanggal Selesai
              </label>
              <div className="relative">
                <Calendar className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={12} />
                <DatePicker
                  selected={filters.end_date}
                  onChange={(date) => setFilters({ ...filters, end_date: date })}
                  className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  dateFormat="dd/MM/yyyy"
                  minDate={filters.start_date}
                  maxDate={new Date()}
                />
              </div>
            </div>

            {/* Filter Kelas */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 sm:mb-1.5">
                <Users size={12} className="inline mr-1" />
                Kelas (Opsional)
              </label>
              <Select
                options={kelasList}
                value={kelasList.find(k => k.value === filters.kelas_id) || null}
                onChange={(option) => setFilters({ ...filters, kelas_id: option?.value || '' })}
                placeholder="Semua Kelas"
                className="react-select-container text-xs sm:text-sm"
                classNamePrefix="react-select"
                isClearable
                isSearchable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    borderColor: '#e2e8f0',
                    minHeight: '32px',
                    boxShadow: 'none',
                    fontSize: '0.75rem',
                    '&:hover': {
                      borderColor: '#14b8a6'
                    }
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999
                  })
                }}
              />
            </div>

            {/* Format Export */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 sm:mb-1.5">
                <FileText size={12} className="inline mr-1" />
                Format Export
              </label>
              <div className="relative">
                <FileText className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={12} />
                <select
                  value={filters.format}
                  onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                  className="w-full pl-7 sm:pl-9 pr-6 sm:pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                </select>
                <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              </div>
            </div>
          </div>
          
          {/* Reset Filter */}
          {filters.kelas_id && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 sm:mt-4 flex justify-end"
            >
              <button
                onClick={() => setFilters({ ...filters, kelas_id: '' })}
                className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg sm:rounded-xl transition-colors flex items-center gap-1 sm:gap-2"
              >
                <XCircle size={12} />
                Reset Filter Kelas
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Preview Data Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        {/* Preview Header */}
        <div className="p-3 sm:p-4 md:p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-1.5 md:p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex-shrink-0">
                <Eye size={14} className="text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                Preview Data {previewData && `(${previewData.length} Siswa)`}
              </h3>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronDown size={14} className={`text-slate-400 transform transition-transform ${showPreview ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {previewLoading ? (
                <div className="p-4 sm:p-6 md:p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-slate-200 border-t-teal-500"></div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">Memuat preview...</p>
                </div>
              ) : previewData && previewData.length > 0 ? (
                <div className="p-3 sm:p-4 md:p-5">
                  <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full min-w-[800px] sm:min-w-full">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/50">
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">No</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">Student Number</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">Nama</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">Kelas</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs font-semibold text-emerald-600">H</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs font-semibold text-amber-600">T</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs font-semibold text-blue-600">I</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs font-semibold text-purple-600">S</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs font-semibold text-rose-600">A</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs font-semibold text-slate-600">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {previewData.slice(0, 10).map((item, index) => (
                          <motion.tr
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">{index + 1}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-mono text-slate-900 dark:text-white truncate max-w-[60px] sm:max-w-none">{item.nis}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs text-slate-900 dark:text-white truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">{item.nama_lengkap}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 truncate max-w-[60px] sm:max-w-[80px]">{item.kelas}</td>
                            <td className="py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs text-center font-semibold text-emerald-600">{item.hadir || 0}</td>
                            <td className="py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs text-center font-semibold text-amber-600">{item.terlambat || 0}</td>
                            <td className="py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs text-center font-semibold text-blue-600">{item.izin || 0}</td>
                            <td className="py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs text-center font-semibold text-purple-600">{item.sakit || 0}</td>
                            <td className="py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs text-center font-semibold text-rose-600">{item.alpha || 0}</td>
                            <td className="py-2 sm:py-3 px-1 sm:px-2 text-[10px] sm:text-xs text-center font-bold text-slate-900 dark:text-white">{item.total_absensi || 0}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewData.length > 10 && (
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 text-center mt-3 sm:mt-4">
                      Menampilkan 10 dari {previewData.length} data. Download untuk melihat semua data.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 sm:p-8 text-center">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 inline-block mb-3 sm:mb-4">
                    <EyeOff size={24} className="text-slate-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Tidak ada data untuk periode yang dipilih
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Download Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6"
      >
        {/* PDF Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <div className="p-1 sm:p-1.5 md:p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg flex-shrink-0">
                    <FileText size={14} className="text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 dark:text-white truncate">
                    Download PDF
                  </h3>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Format dokumen untuk dicetak atau dibagikan.
                </p>
              </div>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-[10px] sm:text-xs font-medium rounded-lg w-fit">
                .pdf
              </span>
            </div>
            
            <button 
              onClick={() => {
                setFilters({ ...filters, format: 'pdf' })
                setTimeout(handleExport, 100)
              }}
              disabled={loading || !previewData || previewData.length === 0}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && filters.format === 'pdf' ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span className="truncate">Memproses...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span className="truncate">Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Excel Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <div className="p-1 sm:p-1.5 md:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex-shrink-0">
                    <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 dark:text-white truncate">
                    Download Excel
                  </h3>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Format spreadsheet untuk analisis data lebih lanjut.
                </p>
              </div>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-medium rounded-lg w-fit">
                .xlsx
              </span>
            </div>
            
            <button 
              onClick={() => {
                setFilters({ ...filters, format: 'excel' })
                setTimeout(handleExport, 100)
              }}
              disabled={loading || !previewData || previewData.length === 0}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && filters.format === 'excel' ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span className="truncate">Memproses...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span className="truncate">Download Excel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-teal-200 dark:border-teal-800"
      >
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="p-2 sm:p-2.5 md:p-3 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm flex-shrink-0">
            <Sparkles size={16} className="text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-teal-900 dark:text-teal-300 mb-1 sm:mb-2">
              Informasi Laporan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs text-teal-800 dark:text-teal-400">
              <ul className="space-y-1 sm:space-y-2">
                <li className="flex items-start gap-1 sm:gap-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-teal-500 mt-1 sm:mt-1.5 flex-shrink-0"></span>
                  <span className="truncate">Laporan mencakup data absensi dari tanggal yang dipilih</span>
                </li>
                <li className="flex items-start gap-1 sm:gap-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-teal-500 mt-1 sm:mt-1.5 flex-shrink-0"></span>
                  <span className="truncate">Filter kelas opsional - kosongkan untuk semua kelas</span>
                </li>
                <li className="flex items-start gap-1 sm:gap-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-teal-500 mt-1 sm:mt-1.5 flex-shrink-0"></span>
                  <span className="truncate">PDF cocok untuk laporan resmi dan cetak</span>
                </li>
              </ul>
              <ul className="space-y-1 sm:space-y-2">
                <li className="flex items-start gap-1 sm:gap-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-teal-500 mt-1 sm:mt-1.5 flex-shrink-0"></span>
                  <span className="truncate">Excel cocok untuk analisis dan pengolahan data</span>
                </li>
                <li className="flex items-start gap-1 sm:gap-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-teal-500 mt-1 sm:mt-1.5 flex-shrink-0"></span>
                  <span className="truncate">Data real-time dari database</span>
                </li>
                <li className="flex items-start gap-1 sm:gap-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-teal-500 mt-1 sm:mt-1.5 flex-shrink-0"></span>
                  <span className="truncate">Preview menampilkan maksimal 10 data</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}