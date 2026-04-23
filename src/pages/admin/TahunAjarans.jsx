import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Calendar, 
  AlertCircle, 
  Clock,
  CalendarDays,
  CalendarRange,
  Layers,
  BookOpen,
  Award,
  Info,
  ChevronDown,
  XCircle,
  FileText,
  Hash,
  Eye,
  Sparkles,
  Activity,
  TrendingUp
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import AdminStatCard from '../../components/AdminStatCard'
import { adminApi } from '../../services/adminService'
import { confirmDelete, showSuccess, confirmAction } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'

export default function TahunAjarans() {
  const [tahunAjarans, setTahunAjarans] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingTahunAjaran, setViewingTahunAjaran] = useState(null)
  const [editingTahunAjaran, setEditingTahunAjaran] = useState(null)
  const [formData, setFormData] = useState({
    tahun_ajaran: '',
    semester: 'ganjil',
    tanggal_mulai: '',
    tanggal_selesai: '',
    semester_ganjil_mulai: '',
    semester_ganjil_selesai: '',
    semester_genap_mulai: '',
    semester_genap_selesai: '',
    is_active: false,
    enable_auto_naik_kelas: false,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchTahunAjarans()
  }, [currentPage, search])

  const fetchTahunAjarans = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getTahunAjarans({
        page: currentPage,
        search: search,
        per_page: 10,
      })
      const res = response.data
      setTahunAjarans(Array.isArray(res?.data) ? res.data : [])
      setPagination(res?.pagination || null)
    } catch (error) {
      console.error('Error fetching tahun ajaran:', error)
      toast.error('Gagal memuat data tahun ajaran')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.tahun_ajaran) {
      newErrors.tahun_ajaran = 'Tahun ajaran wajib diisi'
    } else if (!/^\d{4}\/\d{4}$/.test(formData.tahun_ajaran)) {
      newErrors.tahun_ajaran = 'Format harus YYYY/YYYY (contoh: 2024/2025)'
    }
    
    if (!formData.tanggal_mulai) {
      newErrors.tanggal_mulai = 'Tanggal mulai wajib diisi'
    }
    
    if (!formData.tanggal_selesai) {
      newErrors.tanggal_selesai = 'Tanggal selesai wajib diisi'
    }
    
    if (formData.tanggal_mulai && formData.tanggal_selesai) {
      if (new Date(formData.tanggal_mulai) >= new Date(formData.tanggal_selesai)) {
        newErrors.tanggal_selesai = 'Tanggal selesai harus lebih besar dari tanggal mulai'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Mohon periksa kembali form Anda')
      return
    }
    
    try {
      if (editingTahunAjaran) {
        await adminApi.updateTahunAjaran(editingTahunAjaran.id, formData)
        toast.success('Tahun ajaran berhasil diperbarui')
      } else {
        await adminApi.createTahunAjaran(formData)
        toast.success('Tahun ajaran berhasil ditambahkan')
      }
      setIsModalOpen(false)
      resetForm()
      fetchTahunAjarans()
    } catch (error) {
      console.error('Error saving tahun ajaran:', error)
      const message = error.response?.data?.message || 'Terjadi kesalahan'
      toast.error(message)
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      }
    }
  }

  const handleDelete = async (item) => {
    if (item.is_active) {
      toast.error('Tidak dapat menghapus tahun ajaran yang sedang aktif')
      return
    }
    
    if (await confirmDelete('Hapus Tahun Ajaran?', `Tahun ajaran ${item.tahun_ajaran} akan dihapus permanen`)) {
      try {
        await adminApi.deleteTahunAjaran(item.id)
        showSuccess('Tahun ajaran berhasil dihapus')
        fetchTahunAjarans()
      } catch (error) {
        console.error('Error deleting tahun ajaran:', error)
        toast.error(error.response?.data?.message || 'Gagal menghapus tahun ajaran')
      }
    }
  }

  const handleSetActive = async (item) => {
    if (await confirmAction(
      'Aktifkan Tahun Ajaran?', 
      `Tahun ajaran ${item.tahun_ajaran} akan diaktifkan dan tahun ajaran lain akan dinonaktifkan otomatis`
    )) {
      try {
        await adminApi.setActiveTahunAjaran(item.id)
        showSuccess('Tahun ajaran berhasil diaktifkan')
        fetchTahunAjarans()
      } catch (error) {
        console.error('Error activating tahun ajaran:', error)
        toast.error(error.response?.data?.message || 'Gagal mengaktifkan tahun ajaran')
      }
    }
  }

  const handleViewDetail = (item) => {
    setViewingTahunAjaran(item)
    setIsDetailModalOpen(true)
  }

  const openModal = (item = null) => {
    if (item) {
      setEditingTahunAjaran(item)
      setFormData({
        tahun_ajaran: item.tahun_ajaran,
        semester: item.semester,
        tanggal_mulai: item.tanggal_mulai,
        tanggal_selesai: item.tanggal_selesai,
        semester_ganjil_mulai: item.semester_ganjil_mulai || '',
        semester_ganjil_selesai: item.semester_ganjil_selesai || '',
        semester_genap_mulai: item.semester_genap_mulai || '',
        semester_genap_selesai: item.semester_genap_selesai || '',
        is_active: item.is_active,
        enable_auto_naik_kelas: item.enable_auto_naik_kelas || false,
      })
    } else {
      resetForm()
    }
    setErrors({})
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingTahunAjaran(null)
    setFormData({
      tahun_ajaran: '',
      semester: 'ganjil',
      tanggal_mulai: '',
      tanggal_selesai: '',
      semester_ganjil_mulai: '',
      semester_ganjil_selesai: '',
      semester_genap_mulai: '',
      semester_genap_selesai: '',
      is_active: false,
      enable_auto_naik_kelas: false,
    })
    setErrors({})
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

  const getDuration = (start, end) => {
    if (!start || !end) return '-'
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const months = Math.floor(diffDays / 30)
    const days = diffDays % 30
    return `${months} bulan ${days > 0 ? `${days} hari` : ''}`
  }

  const getSemesterBadge = (semester) => {
    return semester === 'ganjil' ? (
      <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 rounded-lg text-xs font-medium border border-purple-500/30 dark:border-purple-500/30 shadow-sm">
        <Layers size={12} className="mr-1.5 flex-shrink-0" />
        <span>Ganjil</span>
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm">
        <Layers size={12} className="mr-1.5 flex-shrink-0" />
        <span>Genap</span>
      </span>
    )
  }

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm">
        <CheckCircle size={12} className="mr-1.5 flex-shrink-0" />
        <span>Aktif</span>
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 bg-orange-500/20 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 rounded-lg text-xs font-medium border border-orange-500/30 dark:border-orange-500/30 shadow-sm">
        <XCircle size={12} className="mr-1.5 flex-shrink-0" />
        <span>Nonaktif</span>
      </span>
    )
  }

  const columns = [
    { 
      header: 'Tahun Ajaran', 
      accessor: 'tahun_ajaran',
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-purple-500/20 dark:bg-purple-500/20 rounded-lg border border-purple-500/30 dark:border-purple-500/30 flex-shrink-0">
            <CalendarDays size={14} className="text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
            {row.tahun_ajaran}
          </span>
        </div>
      )
    },
    {
      header: 'Semester',
      accessor: 'semester',
      cell: (row) => getSemesterBadge(row.semester),
    },
    { 
      header: 'Periode', 
      cell: (row) => (
        <div className="hidden lg:block space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Calendar size={12} className="text-purple-500 flex-shrink-0" />
            <span className="truncate">Mulai: {formatDate(row.tanggal_mulai)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Calendar size={12} className="text-purple-500 flex-shrink-0" />
            <span className="truncate">Selesai: {formatDate(row.tanggal_selesai)}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Durasi',
      cell: (row) => (
        <div className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <Clock size={12} className="text-purple-500 flex-shrink-0" />
          <span className="truncate max-w-[120px]">{getDuration(row.tanggal_mulai, row.tanggal_selesai)}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'is_active',
      cell: (row) => getStatusBadge(row.is_active),
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDetail(row)}
            className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-400 rounded-lg transition-all border border-purple-500/30 dark:border-purple-500/30 shadow-sm hover:shadow-md"
            title="Lihat Detail"
          >
            <Eye size={16} />
          </button>
          
          {!row.is_active && (
            <button
              onClick={() => handleSetActive(row)}
              className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-400 rounded-lg transition-all border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm hover:shadow-md"
              title="Aktifkan Tahun Ajaran"
            >
              <CheckCircle size={16} />
            </button>
          )}
          
          <button
            onClick={() => openModal(row)}
            className="p-1.5 bg-slate-100/80 hover:bg-emerald-500/20 text-slate-600 hover:text-emerald-600 dark:bg-slate-800/50 dark:hover:bg-emerald-500/20 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg transition-all border border-slate-200/60 dark:border-slate-700/50 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 shadow-sm hover:shadow-md"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          
          <button
            onClick={() => handleDelete(row)}
            disabled={row.is_active}
            className={`p-1.5 rounded-lg transition-all border shadow-sm ${
              row.is_active 
                ? 'bg-slate-100/50 text-slate-400 cursor-not-allowed dark:bg-slate-800/30 dark:text-slate-600 border-slate-200/30 dark:border-slate-700/30' 
                : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 dark:text-orange-400 border-orange-500/30 dark:border-orange-500/30 hover:shadow-md'
            }`}
            title={row.is_active ? 'Tidak dapat menghapus tahun ajaran aktif' : 'Hapus'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  const activeTahunAjaran = tahunAjarans.find(ta => ta.is_active)

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">
      {/* Page Header */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <CalendarRange size={17} className="text-emerald-600 dark:text-emerald-400"/>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Tahun Ajaran</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{tahunAjarans.length} tahun ajaran · {activeTahunAjaran ? `Aktif: ${activeTahunAjaran.tahun_ajaran}` : 'Belum ada yang aktif'}</p>
          </div>
        </div>
        <button onClick={() => openModal()}
          className="px-3 py-1.5 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold" style={{ background:'#10b981' }}>
          <Plus size={12}/><span className="hidden sm:inline">Tambah Tahun Ajaran</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Total Tahun Ajaran', value:tahunAjarans.length,                                          icon:CalendarRange, color:'#8b5cf6', border:'border-violet-100 dark:border-violet-800/40', tc:'text-violet-600 dark:text-violet-400', iconBg:'bg-violet-50 dark:bg-violet-900/30', delay:0,    sparkType:'area' },
          { label:'Semester Ganjil',    value:tahunAjarans.filter(ta=>ta.semester==='ganjil').length,       icon:Layers,        color:'#6366f1', border:'border-indigo-100 dark:border-indigo-800/40', tc:'text-indigo-600 dark:text-indigo-400', iconBg:'bg-indigo-50 dark:bg-indigo-900/30', delay:0.05, sparkType:'bar' },
          { label:'Semester Genap',     value:tahunAjarans.filter(ta=>ta.semester==='genap').length,        icon:Layers,        color:'#10b981', border:'border-emerald-100 dark:border-emerald-800/40',tc:'text-emerald-600 dark:text-emerald-400',iconBg:'bg-emerald-50 dark:bg-emerald-900/30',delay:0.1,  sparkType:'bar' },
          { label:'Tahun Aktif',        value:activeTahunAjaran ? 1 : 0, subtitle:activeTahunAjaran?.tahun_ajaran, icon:Award, color:'#f59e0b', border:'border-amber-100 dark:border-amber-800/40',   tc:'text-amber-600 dark:text-amber-400',   iconBg:'bg-amber-50 dark:bg-amber-900/30',   delay:0.15, sparkType:'area' },
        ].map(s => <AdminStatCard key={s.label} {...s}/>)}
      </div>

      {/* Info Card - Tahun Ajaran Aktif dengan Desain Responsif - EMERALD */}
      <AnimatePresence>
        {activeTahunAjaran && (
          <div
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20 rounded-xl border border-emerald-500/30 dark:border-emerald-500/30 p-4 sm:p-5 shadow-md"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex-shrink-0">
                <Award className="text-emerald-500" size={24} />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    Tahun Ajaran Aktif
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] rounded-full w-fit">
                    Berjalan
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-3">
                  {activeTahunAjaran.tahun_ajaran} - {activeTahunAjaran.semester === 'ganjil' ? 'Semester Ganjil' : 'Semester Genap'}
                </p>
                
                {/* Info Grid - Responsif */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span className="truncate">Mulai: {formatDate(activeTahunAjaran.tanggal_mulai)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span className="truncate">Selesai: {formatDate(activeTahunAjaran.tanggal_selesai)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                    <Clock size={14} className="flex-shrink-0" />
                    <span className="truncate">Durasi: {getDuration(activeTahunAjaran.tanggal_mulai, activeTahunAjaran.tanggal_selesai)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Table Card dengan Desain Modern */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6">
          <DataTable
            columns={columns}
            data={tahunAjarans}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onSearch={setSearch}
            loading={loading}
            searchPlaceholder="Cari tahun ajaran..."
          />
        </div>
      </div>

      {/* Modal Detail dengan Desain Responsif - EMERALD */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false)
              setViewingTahunAjaran(null)
            }}
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30">
                  <Info size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Detail Tahun Ajaran</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Informasi lengkap tahun ajaran</p>
                </div>
              </div>
            }
            size="md"
          >
            {viewingTahunAjaran && (
              <div className="space-y-6 p-6">
                {/* Header Info dengan Gradient */}
                <div className={`rounded-xl p-5 ${
                  viewingTahunAjaran.is_active 
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                    : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <p className="text-xs text-white/80 mb-1">Tahun Ajaran</p>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {viewingTahunAjaran.tahun_ajaran}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-white/20 rounded-lg text-xs">
                          {viewingTahunAjaran.semester === 'ganjil' ? 'Semester Ganjil' : 'Semester Genap'}
                        </span>
                        {viewingTahunAjaran.is_active && (
                          <span className="px-2 py-1 bg-emerald-500/40 rounded-lg text-xs flex items-center gap-1">
                            <CheckCircle size={12} />
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl self-start">
                      <CalendarRange size={32} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Data Detail Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Calendar size={12} className="text-emerald-500" />
                      Tanggal Mulai
                    </p>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                      {formatDate(viewingTahunAjaran.tanggal_mulai)}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Calendar size={12} className="text-emerald-500" />
                      Tanggal Selesai
                    </p>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                      {formatDate(viewingTahunAjaran.tanggal_selesai)}
                    </p>
                  </div>
                  <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Clock size={12} className="text-emerald-500" />
                      Durasi
                    </p>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                      {getDuration(viewingTahunAjaran.tanggal_mulai, viewingTahunAjaran.tanggal_selesai)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {!viewingTahunAjaran.is_active && (
                    <button
                      onClick={() => {
                        setIsDetailModalOpen(false)
                        handleSetActive(viewingTahunAjaran)
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all text-sm font-medium"
                    >
                      <CheckCircle size={16} />
                      Aktifkan
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      openModal(viewingTahunAjaran)
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all text-sm font-medium"
                  >
                    <Edit2 size={16} />
                    Edit Data
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Form dengan Desain Responsif - EMERALD */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              resetForm()
            }}
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30">
                  {editingTahunAjaran ? <Edit2 size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {editingTahunAjaran ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingTahunAjaran ? 'Ubah data tahun ajaran yang sudah ada' : 'Isi form untuk menambah tahun ajaran baru'}
                  </p>
                </div>
              </div>
            }
            maxWidth="max-w-lg"
          >
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Tahun Ajaran */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Tahun Ajaran <span className="text-emerald-500">*</span>
                </label>
                <div className="relative group">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <input
                    type="text"
                    required
                    value={formData.tahun_ajaran}
                    onChange={(e) => {
                      setFormData({ ...formData, tahun_ajaran: e.target.value })
                      if (errors.tahun_ajaran) setErrors({ ...errors, tahun_ajaran: '' })
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border ${
                      errors.tahun_ajaran 
                        ? 'border-orange-500 focus:ring-orange-500' 
                        : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                    } rounded-xl focus:ring-2 focus:border-transparent transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400`}
                    placeholder="Contoh: 2024/2025"
                  />
                </div>
                {errors.tahun_ajaran && (
                  <p className="mt-1 text-xs text-orange-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.tahun_ajaran}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  Format: YYYY/YYYY (contoh: 2024/2025)
                </p>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Semester <span className="text-emerald-500">*</span>
                </label>
                <div className="relative group">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm text-slate-900 dark:text-white appearance-none"
                    required
                  >
                    <option value="ganjil">Ganjil (Juli - Desember)</option>
                    <option value="genap">Genap (Januari - Juni)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Tanggal Mulai dan Selesai */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Tanggal Mulai <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                    <input
                      type="date"
                      required
                      value={formData.tanggal_mulai}
                      onChange={(e) => {
                        setFormData({ ...formData, tanggal_mulai: e.target.value })
                        if (errors.tanggal_mulai) setErrors({ ...errors, tanggal_mulai: '' })
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border ${
                        errors.tanggal_mulai 
                          ? 'border-orange-500 focus:ring-orange-500' 
                          : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                      } rounded-xl focus:ring-2 focus:border-transparent transition-all text-sm text-slate-900 dark:text-white`}
                    />
                  </div>
                  {errors.tanggal_mulai && (
                    <p className="mt-1 text-xs text-orange-500">{errors.tanggal_mulai}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Tanggal Selesai <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                    <input
                      type="date"
                      required
                      value={formData.tanggal_selesai}
                      onChange={(e) => {
                        setFormData({ ...formData, tanggal_selesai: e.target.value })
                        if (errors.tanggal_selesai) setErrors({ ...errors, tanggal_selesai: '' })
                      }}
                      min={formData.tanggal_mulai}
                      className={`w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border ${
                        errors.tanggal_selesai 
                          ? 'border-orange-500 focus:ring-orange-500' 
                          : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                      } rounded-xl focus:ring-2 focus:border-transparent transition-all text-sm text-slate-900 dark:text-white`}
                    />
                  </div>
                  {errors.tanggal_selesai && (
                    <p className="mt-1 text-xs text-orange-500">{errors.tanggal_selesai}</p>
                  )}
                </div>
              </div>

              {/* Semester Ganjil */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={12} />
                  Periode Semester (Opsional)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Semester Ganjil Mulai
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                      <input
                        type="date"
                        value={formData.semester_ganjil_mulai}
                        onChange={(e) => setFormData({ ...formData, semester_ganjil_mulai: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Semester Ganjil Selesai
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                      <input
                        type="date"
                        value={formData.semester_ganjil_selesai}
                        onChange={(e) => setFormData({ ...formData, semester_ganjil_selesai: e.target.value })}
                        min={formData.semester_ganjil_mulai}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Semester Genap Mulai
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                      <input
                        type="date"
                        value={formData.semester_genap_mulai}
                        onChange={(e) => setFormData({ ...formData, semester_genap_mulai: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Semester Genap Selesai
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                      <input
                        type="date"
                        value={formData.semester_genap_selesai}
                        onChange={(e) => setFormData({ ...formData, semester_genap_selesai: e.target.value })}
                        min={formData.semester_genap_mulai}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Digunakan sebagai jadwal auto naik kelas</p>
                  </div>
                </div>
              </div>

              {/* Auto Naik Kelas Toggle */}
              <div className="flex items-start gap-3 p-4 bg-orange-500/10 dark:bg-orange-500/10 rounded-xl border border-orange-500/30 dark:border-orange-500/30">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    id="enable_auto_naik_kelas"
                    checked={formData.enable_auto_naik_kelas}
                    onChange={(e) => setFormData({ ...formData, enable_auto_naik_kelas: e.target.checked })}
                    className="peer w-5 h-5 rounded-md border-2 border-orange-500/50 dark:border-orange-500/50 bg-white dark:bg-slate-800 checked:bg-orange-500 checked:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="enable_auto_naik_kelas" className="text-sm font-medium text-orange-600 dark:text-orange-400 cursor-pointer flex items-center gap-1.5">
                    <Sparkles size={14} />
                    Aktifkan Auto Naik Kelas
                  </label>
                  <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1">
                    Sistem akan otomatis proses naik kelas saat akhir semester genap (tanggal semester genap selesai)
                  </p>
                </div>
              </div>

              {/* Active Status dengan Desain Modern */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="peer w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-emerald-500 checked:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  />
                  <CheckCircle size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
                <div className="flex-1">
                  <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Aktifkan Tahun Ajaran Ini
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Jika dicentang, tahun ajaran lain akan dinonaktifkan otomatis
                  </p>
                </div>
              </div>

              {/* Error Summary */}
              <AnimatePresence>
                {Object.keys(errors).length > 0 && (
                  <div
                    className="bg-orange-500/10 dark:bg-orange-500/10 border border-orange-500/30 dark:border-orange-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" size={16} />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-orange-500 dark:text-orange-400">
                          Terdapat kesalahan pada form:
                        </h4>
                        <ul className="mt-2 space-y-1">
                          {Object.values(errors).map((error, index) => (
                            <li key={index} className="text-xs text-orange-500/80 dark:text-orange-400/80 flex items-start gap-1">
                              <span className="flex-shrink-0">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    resetForm()
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
                >
                  {editingTahunAjaran ? 'Simpan Perubahan' : 'Tambah Tahun Ajaran'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Inline styles */}
      <style jsx>{`
        .text-gradient-emerald {
          background: linear-gradient(135deg, #10B981 0%, #059669 50%, #10B981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dark .text-gradient-emerald {
          background: linear-gradient(135deg, #34D399 0%, #10B981 50%, #34D399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  )
}