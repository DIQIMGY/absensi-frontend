import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Edit2, 
  Save, 
  X, 
  Filter,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  ChevronDown,
  RefreshCw,
  UserCheck,
  UserMinus,
  Activity,
  BookOpen,
  Bell,
  Eye,
  XCircle,
  Heart
} from 'lucide-react'
import Select from 'react-select'
import DataTable from '../../components/DataTable'
import { guruApi } from '../../services/guruService'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Swal from 'sweetalert2'

const STATUS_OPTIONS = [
  { value: 'hadir', label: 'Hadir', color: 'emerald', icon: CheckCircle },
  { value: 'terlambat', label: 'Terlambat', color: 'amber', icon: Clock },
  { value: 'izin', label: 'Izin', color: 'blue', icon: FileText },
  { value: 'sakit', label: 'Sakit', color: 'purple', icon: Activity },
  { value: 'alpha', label: 'Alpha', color: 'rose', icon: UserMinus },
]

export default function GuruAbsensi() {
  const [absensis, setAbsensis] = useState([])
  const [kelasAmpu, setKelasAmpu] = useState(null)
  const [pendingIzins, setPendingIzins] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingIzin, setLoadingIzin] = useState(false)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [showPendingIzins, setShowPendingIzins] = useState(true)
  const [filters, setFilters] = useState({
    date: new Date(),
  })
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({ status: '', keterangan: '' })

  useEffect(() => {
    fetchKelasDiampu()
    fetchPendingIzins()
  }, [])

  useEffect(() => {
    if (kelasAmpu) {
      fetchAbsensis()
    }
  }, [currentPage, filters, kelasAmpu])

  const fetchPendingIzins = async () => {
    try {
      setLoadingIzin(true)
      const response = await guruApi.getPendingIzinsToday()
      setPendingIzins(response.data.data || [])
    } catch (error) {
      console.error('Error fetching pending izins:', error)
    } finally {
      setLoadingIzin(false)
    }
  }

  const fetchAbsensis = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        per_page: 15,
        date: filters.date.toISOString().split('T')[0],
        kelas_id: kelasAmpu.id, // Otomatis gunakan kelas yang diampu
      }

      const response = await guruApi.getAbsensis(params)
      const res = response.data
      setAbsensis(Array.isArray(res?.data) ? res.data : [])
      setPagination(res?.pagination || null)
    } catch (error) {
      toast.error('Gagal memuat data absensi')
    } finally {
      setLoading(false)
    }
  }

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

  const handleEdit = (row) => {
    setEditingId(row.id)
    setEditData({
      status: row.status,
      keterangan: row.keterangan || '',
    })
  }

  const handleSave = async (id) => {
    try {
      await guruApi.updateStatus(id, editData)
      toast.success('Status absensi berhasil diperbarui')
      setEditingId(null)
      fetchAbsensis()
    } catch (error) {
      toast.error('Gagal memperbarui status')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({ status: '', keterangan: '' })
  }

  const handleApproveIzin = async (izin) => {
    const { value: catatan } = await Swal.fire({
      title: 'Setujui Izin?',
      html: `
        <div class="text-left">
          <p><strong>Siswa:</strong> ${izin.nama_lengkap}</p>
          <p><strong>Kelas:</strong> ${izin.siswa?.kelas || '-'}</p>
          <p><strong>Jenis:</strong> ${izin.jenis_label}</p>
          <p><strong>Alasan:</strong> ${izin.alasan}</p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Notes Optional',
      inputPlaceholder: 'Add Notes If Needed...',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes Approve',
      cancelButtonText: 'Batal'
    })

    if (catatan !== undefined) {
      try {
        await guruApi.approveIzin(izin.id, { catatan_admin: catatan })
        toast.success('Izin berhasil disetujui')
        fetchPendingIzins()
        fetchAbsensis() // Refresh absensi data to show the new record
      } catch (error) {
        toast.error('Gagal menyetujui izin')
      }
    }
  }

  const handleRejectIzin = async (izin) => {
    const { value: catatan } = await Swal.fire({
      title: 'Tolak Izin?',
      html: `
        <div class="text-left">
          <p><strong>Siswa:</strong> ${izin.nama_lengkap}</p>
          <p><strong>Kelas:</strong> ${izin.siswa?.kelas || '-'}</p>
          <p><strong>Jenis:</strong> ${izin.jenis_label}</p>
          <p><strong>Alasan:</strong> ${izin.alasan}</p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Explain Rejection...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes Reject',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value) {
          return 'Rejection Reason wajib diisi'
        }
      }
    })

    if (catatan) {
      try {
        await guruApi.rejectIzin(izin.id, { catatan_admin: catatan })
        toast.success('Izin berhasil ditolak')
        fetchPendingIzins()
      } catch (error) {
        toast.error('Gagal menolak izin')
      }
    }
  }

  const handleSyncIzin = async () => {
    try {
      const response = await guruApi.syncIzinToAbsensi({
        date: filters.date.toISOString().split('T')[0]
      })
      
      if (response.data.data.created > 0) {
        toast.success(response.data.data.message)
        fetchAbsensis() // Refresh the attendance data
      } else {
        toast.info('Tidak ada izin yang perlu disinkronkan')
      }
    } catch (error) {
      toast.error('Gagal melakukan sinkronisasi')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[4]
    const colors = {
      emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    }
    
    const Icon = statusConfig.icon
    
    return (
      <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium border ${colors[statusConfig.color]} whitespace-nowrap`}>
        <Icon size={10} className="mr-0.5 sm:mr-1 flex-shrink-0" />
        <span className="truncate max-w-[50px] sm:max-w-none">{statusConfig.label}</span>
      </span>
    )
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const columns = [
    {
      header: 'Siswa',
      accessor: 'siswa',
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0 max-w-[200px]">
          {row.siswa?.foto_url || row.siswa?.foto ? (
            <img 
              src={row.siswa.foto_url || row.siswa.foto} 
              alt={row.siswa.nama_lengkap}
              className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 ${row.siswa?.foto_url || row.siswa?.foto ? 'hidden' : 'flex'}`}>
            {row.siswa?.nama_lengkap?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{row.siswa?.nama_lengkap}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{row.siswa?.nis}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Kelas',
      accessor: 'kelas',
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
          <Users size={12} className="mr-1 flex-shrink-0" />
          {row.kelas?.nama_kelas || '-'}
        </span>
      ),
    },
    {
      header: 'Jam',
      accessor: 'jam_masuk',
      cell: (row) => (
        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
          <Clock size={12} className="text-slate-400 flex-shrink-0" />
          {row.jam_masuk || '-'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        if (editingId === row.id) {
          return (
            <div className="min-w-[140px]">
              <Select
                options={STATUS_OPTIONS.map(({ value, label }) => ({
                  value,
                  label
                }))}
                value={STATUS_OPTIONS.find(s => s.value === editData.status) ? { 
                  value: editData.status, 
                  label: STATUS_OPTIONS.find(s => s.value === editData.status)?.label 
                } : null}
                onChange={(option) => setEditData({ ...editData, status: option?.value })}
                className="text-sm"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    borderColor: '#e2e8f0',
                    minHeight: '36px',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: '#10b981'
                    }
                  })
                }}
              />
            </div>
          )
        }
        return getStatusBadge(row.status)
      },
    },
    {
      header: 'Keterangan',
      accessor: 'keterangan',
      cell: (row) => {
        if (editingId === row.id) {
          return (
            <div className="relative min-w-[150px] max-w-[200px]">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input
                type="text"
                value={editData.keterangan}
                onChange={(e) => setEditData({ ...editData, keterangan: e.target.value })}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Keterangan..."
              />
            </div>
          )
        }
        return (
          <div className="min-w-[100px] max-w-[200px]">
            <span className="text-xs text-slate-600 dark:text-slate-400 block truncate" title={row.keterangan}>
              {row.keterangan || '-'}
            </span>
          </div>
        )
      },
    },
    {
      header: 'Aksi',
      cell: (row) => {
        if (editingId === row.id) {
          return (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSave(row.id)}
                className="p-2 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                title="Simpan"
              >
                <Save size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                title="Batal"
              >
                <X size={16} />
              </motion.button>
            </div>
          )
        }
        return (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleEdit(row)}
            className="p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </motion.button>
        )
      },
    },
  ]

  // Hitung statistik
  const totalSiswa = absensis.length
  const hadir = absensis.filter(a => a.status === 'hadir').length
  const terlambat = absensis.filter(a => a.status === 'terlambat').length
  const izin = absensis.filter(a => a.status === 'izin').length
  const sakit = absensis.filter(a => a.status === 'sakit').length
  const alpha = absensis.filter(a => a.status === 'alpha').length

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
              Data Absensi Kelas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Kelola dan update status absensi siswa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
          <Calendar size={14} className="text-emerald-600 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
            {formatDate(filters.date)}
          </span>
          {pendingIzins.length > 0 && (
            <div className="relative ml-2">
              <Bell size={14} className="text-amber-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {pendingIzins.length}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 lg:grid-cols-6 gap-3"
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 truncate">Total</p>
            <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0">
              <Users size={14} className="text-slate-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{totalSiswa}</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-emerald-600 truncate">Hadir</p>
            <div className="p-1.5 bg-white rounded-lg flex-shrink-0">
              <CheckCircle size={14} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 truncate">{hadir}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-amber-600 truncate">Telat</p>
            <div className="p-1.5 bg-white rounded-lg flex-shrink-0">
              <Clock size={14} className="text-amber-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-amber-700 dark:text-amber-300 truncate">{terlambat}</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-blue-600 truncate">Izin</p>
            <div className="p-1.5 bg-white rounded-lg flex-shrink-0">
              <FileText size={14} className="text-blue-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300 truncate">{izin}</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-purple-600 truncate">Sakit</p>
            <div className="p-1.5 bg-white rounded-lg flex-shrink-0">
              <Activity size={14} className="text-purple-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-purple-700 dark:text-purple-300 truncate">{sakit}</p>
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-3 border border-rose-200 dark:border-rose-800">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-rose-600 truncate">Alpha</p>
            <div className="p-1.5 bg-white rounded-lg flex-shrink-0">
              <UserMinus size={14} className="text-rose-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-rose-700 dark:text-rose-300 truncate">{alpha}</p>
        </div>
      </motion.div>

      {/* Pending Izin Section */}
      {pendingIzins.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-amber-200 dark:border-amber-700">
            <button
              onClick={() => setShowPendingIzins(!showPendingIzins)}
              className="flex items-center gap-3 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors text-base font-semibold w-full"
            >
              <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg">
                <Bell size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <span className="flex-1 text-left">
                Pengajuan Izin Hari Ini ({pendingIzins.length})
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  fetchPendingIzins()
                }}
                className="p-2 hover:bg-amber-200 dark:hover:bg-amber-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} className={loadingIzin ? 'animate-spin' : ''} />
              </button>
              <ChevronDown size={18} className={`transform transition-transform ${showPendingIzins ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Content */}
          <AnimatePresence>
            {showPendingIzins && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4"
              >
                {loadingIzin ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingIzins.map((izin) => (
                      <motion.div
                        key={izin.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-amber-200 dark:border-amber-700 shadow-sm"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                                {izin.nama_lengkap?.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white text-base">
                                  {izin.nama_lengkap}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {izin.siswa?.kelas} • NIS: {izin.nis}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${izin.jenis === 'sakit' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                                  {izin.jenis === 'sakit' ? (
                                    <Heart size={14} className="text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <FileText size={14} className="text-purple-600 dark:text-purple-400" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                  {izin.jenis_label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-slate-400" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {izin.tanggal_formatted}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 mb-3">
                              <span className="font-medium">Alasan:</span> {izin.alasan}
                            </p>

                            {izin.bukti_foto && (
                              <div className="mb-3">
                                <img 
                                  src={izin.bukti_foto} 
                                  alt="Bukti" 
                                  className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApproveIzin(izin)}
                              className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                              title="Setujui"
                            >
                              <CheckCircle size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRejectIzin(izin)}
                              className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
                              title="Tolak"
                            >
                              <XCircle size={18} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        {/* Filter Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors text-sm font-medium"
            >
              <Filter size={16} />
              <span className="font-semibold">Filter Data Absensi</span>
              <ChevronDown size={14} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Kelas Info Badge */}
            {kelasAmpu && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Users size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {kelasAmpu.nama_kelas}
                </span>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {filters.date && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">Filter aktif:</span>
              <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs border border-emerald-200 dark:border-emerald-800">
                Tanggal: {filters.date.toLocaleDateString('id-ID')}
              </span>
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
              className="border-b border-slate-200 dark:border-slate-700"
            >
              <div className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Date Picker */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      <Calendar size={14} className="inline mr-1" />
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
                        className="w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={handleSyncIzin}
                    className="px-4 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 rounded-lg transition-colors flex items-center gap-2 border border-emerald-200 dark:border-emerald-800"
                  >
                    <CheckCircle size={14} />
                    Sync Izin ke Absensi
                  </button>
                  <button
                    onClick={() => {
                      setFilters({ date: new Date() })
                      setCurrentPage(1)
                    }}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Reset Filter
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="p-4">
          <DataTable
            columns={columns}
            data={absensis}
            pagination={pagination}
            onPageChange={setCurrentPage}
            loading={loading}
            emptyMessage="Tidak ada data absensi untuk tanggal ini"
          />
        </div>
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800"
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-800 dark:text-emerald-300 min-w-0">
            <p className="font-semibold mb-2">Informasi:</p>
            <ul className="list-disc list-inside space-y-1 text-emerald-700 dark:text-emerald-400">
              <li>Klik ikon edit untuk mengubah status absensi siswa</li>
              <li>Status yang diubah akan langsung tersimpan di database</li>
              <li>Filter berdasarkan tanggal dan kelas untuk memudahkan pencarian</li>
            </ul>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  )
}