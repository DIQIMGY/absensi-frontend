import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Hash,
  FileText,
  CheckCircle,
  XCircle,
  BookMarked,
  GraduationCap,
  Layers,
  Info,
  ChevronDown,
  Book,
  Library,
  AlertCircle,
  Eye,
  Sparkles,
  Activity,
  TrendingUp,
  BookCopy,
  BookCheck
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import AdminStatCard from '../../components/AdminStatCard'
import { adminApi } from '../../services/adminService'
import { confirmDelete, showSuccess } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'

export default function MataPelajarans() {
  const [mataPelajarans, setMataPelajarans] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingMapel, setViewingMapel] = useState(null)
  const [editingMataPelajaran, setEditingMataPelajaran] = useState(null)
  const [formData, setFormData] = useState({
    kode_mapel: '',
    nama_mapel: '',
    deskripsi: '',
    is_active: true,
  })

  useEffect(() => {
    fetchMataPelajarans()
  }, [currentPage, search])

  const fetchMataPelajarans = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getMataPelajarans({
        page: currentPage,
        search: search,
        per_page: 10,
      })
      const res = response.data
      setMataPelajarans(Array.isArray(res?.data) ? res.data : [])
      setPagination(res?.pagination || null)
    } catch (error) {
      toast.error('Gagal memuat data mata pelajaran')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingMataPelajaran) {
        await adminApi.updateMataPelajaran(editingMataPelajaran.id, formData)
        toast.success('Mata pelajaran berhasil diperbarui')
      } else {
        await adminApi.createMataPelajaran(formData)
        toast.success('Mata pelajaran berhasil ditambahkan')
      }
      setIsModalOpen(false)
      resetForm()
      fetchMataPelajarans()
    } catch (error) {
      const message = error.response?.data?.message || 'Terjadi kesalahan'
      toast.error(message)
    }
  }

  const handleDelete = async (item) => {
    if (await confirmDelete('Hapus Mata Pelajaran?', `Mata pelajaran ${item.nama_mapel} akan dihapus permanen`)) {
      try {
        await adminApi.deleteMataPelajaran(item.id)
        showSuccess('Mata pelajaran berhasil dihapus')
        fetchMataPelajarans()
      } catch (error) {
        toast.error('Gagal menghapus mata pelajaran')
      }
    }
  }

  const handleViewDetail = (item) => {
    setViewingMapel(item)
    setIsDetailModalOpen(true)
  }

  const openModal = (item = null) => {
    if (item) {
      setEditingMataPelajaran(item)
      setFormData({
        kode_mapel: item.kode_mapel || '',
        nama_mapel: item.nama_mapel || '',
        deskripsi: item.deskripsi || '',
        is_active: item.is_active,
      })
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingMataPelajaran(null)
    setFormData({
      kode_mapel: '',
      nama_mapel: '',
      deskripsi: '',
      is_active: true,
    })
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
      header: 'Kode', 
      accessor: 'kode_mapel',
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-purple-500/20 dark:bg-purple-500/20 rounded-lg border border-purple-500/30 dark:border-purple-500/30 flex-shrink-0">
            <Hash size={14} className="text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            {row.kode_mapel}
          </span>
        </div>
      )
    },
    { 
      header: 'Nama Mata Pelajaran', 
      accessor: 'nama_mapel',
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-emerald-500/20 dark:bg-emerald-500/20 rounded-lg flex-shrink-0">
            <BookOpen size={14} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="font-medium text-sm text-slate-900 dark:text-white truncate max-w-[120px] md:max-w-[180px] lg:max-w-[220px]">
            {row.nama_mapel}
          </span>
        </div>
      )
    },
    { 
      header: 'Deskripsi', 
      accessor: 'deskripsi',
      cell: (row) => (
        <div className="hidden lg:flex items-start gap-2 max-w-xs">
          <FileText size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 truncate">
            {row.deskripsi || '-'}
          </p>
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
          <button
            onClick={() => openModal(row)}
            className="p-1.5 bg-slate-100/80 hover:bg-emerald-500/20 text-slate-600 hover:text-emerald-600 dark:bg-slate-800/50 dark:hover:bg-emerald-500/20 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg transition-all border border-slate-200/60 dark:border-slate-700/50 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 shadow-sm hover:shadow-md"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 dark:text-orange-400 rounded-lg transition-all border border-orange-500/30 dark:border-orange-500/30 shadow-sm hover:shadow-md"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 px-3 sm:px-4 lg:px-6 py-4">
      {/* Page Header */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <Library size={17} className="text-emerald-600 dark:text-emerald-400"/>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Mata Pelajaran</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{mataPelajarans.length} mapel · {mataPelajarans.filter(m=>m.is_active).length} aktif</p>
          </div>
        </div>
        <button onClick={() => openModal()}
          className="px-3 py-1.5 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold" style={{ background:'#10b981' }}>
          <Plus size={12}/><span className="hidden sm:inline">Tambah Mata Pelajaran</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label:'Total Mapel',    value:mataPelajarans.length,                          icon:BookOpen,  color:'#8b5cf6', border:'border-violet-100 dark:border-violet-800/40', tc:'text-violet-600 dark:text-violet-400', iconBg:'bg-violet-50 dark:bg-violet-900/30', delay:0,    sparkType:'area' },
          { label:'Mapel Aktif',    value:mataPelajarans.filter(m=>m.is_active).length,   icon:CheckCircle,color:'#10b981', border:'border-emerald-100 dark:border-emerald-800/40',tc:'text-emerald-600 dark:text-emerald-400',iconBg:'bg-emerald-50 dark:bg-emerald-900/30',delay:0.05, sparkType:'bar' },
          { label:'Mapel Nonaktif', value:mataPelajarans.filter(m=>!m.is_active).length,  icon:XCircle,   color:'#f59e0b', border:'border-amber-100 dark:border-amber-800/40',   tc:'text-amber-600 dark:text-amber-400',   iconBg:'bg-amber-50 dark:bg-amber-900/30',   delay:0.1,  sparkType:'bar' },
        ].map(s => <AdminStatCard key={s.label} {...s}/>)}
      </div>

      {/* Table */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-6 h-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <BookOpen size={12} className="text-emerald-500"/>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Daftar Mata Pelajaran</p>
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-bold">{pagination?.total || mataPelajarans.length}</span>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={mataPelajarans}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onSearch={setSearch}
            loading={loading}
            searchPlaceholder="Cari kode atau nama mata pelajaran..."
          />
        </div>
      </motion.div>

      {/* Modal Detail dengan Desain Responsif - EMERALD */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false)
              setViewingMapel(null)
            }}
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30">
                  <Info size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Detail Mata Pelajaran</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Informasi lengkap mata pelajaran</p>
                </div>
              </div>
            }
            size="md"
          >
            {viewingMapel && (
              <div className="space-y-6 p-6">
                {/* Header Info dengan Gradient */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <p className="text-xs text-white/80 mb-1">Kode Mata Pelajaran</p>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {viewingMapel.kode_mapel}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {getStatusBadge(viewingMapel.is_active)}
                      </div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl self-start">
                      <BookOpen size={32} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Data Detail dalam Grid */}
                <div className="space-y-4">
                  {/* Nama Mapel */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Book size={12} className="text-emerald-500" />
                      Nama Mata Pelajaran
                    </p>
                    <p className="font-medium text-base text-slate-900 dark:text-white break-words">
                      {viewingMapel.nama_mapel}
                    </p>
                  </div>

                  {/* Deskripsi */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <FileText size={12} className="text-emerald-500" />
                      Deskripsi
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                      {viewingMapel.deskripsi || 'Tidak ada deskripsi'}
                    </p>
                  </div>

                  {/* Info Tambahan */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 border border-slate-200 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Ditambahkan</p>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">
                        {new Date().toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 border border-slate-200 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Terakhir Update</p>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">
                        {new Date().toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      openModal(viewingMapel)
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
                  {editingMataPelajaran ? <Edit2 size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {editingMataPelajaran ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingMataPelajaran ? 'Ubah data mata pelajaran yang sudah ada' : 'Isi form untuk menambah mata pelajaran baru'}
                  </p>
                </div>
              </div>
            }
            maxWidth="max-w-md"
          >
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Kode Mata Pelajaran */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Kode Mata Pelajaran <span className="text-emerald-500">*</span>
                </label>
                <div className="relative group">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <input
                    type="text"
                    required
                    value={formData.kode_mapel}
                    onChange={(e) => setFormData({ ...formData, kode_mapel: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="Contoh: MAT"
                  />
                </div>
              </div>

              {/* Nama Mata Pelajaran */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Mata Pelajaran <span className="text-emerald-500">*</span>
                </label>
                <div className="relative group">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <input
                    type="text"
                    required
                    value={formData.nama_mapel}
                    onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="Contoh: Matematika"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Deskripsi
                </label>
                <div className="relative group">
                  <FileText className="absolute left-3 top-3 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    rows="3"
                    placeholder="Deskripsi mata pelajaran (opsional)"
                  />
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
                    Mata pelajaran aktif (dapat digunakan)
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mata pelajaran yang tidak aktif tidak akan muncul di dropdown pemilihan
                  </p>
                </div>
              </div>

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
                  {editingMataPelajaran ? 'Simpan Perubahan' : 'Tambah Mata Pelajaran'}
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