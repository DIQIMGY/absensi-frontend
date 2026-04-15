import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, XCircle, Clock, Eye, Filter, Search, Calendar, User, Image as ImageIcon } from 'lucide-react'
import { guruApi } from '../../services/guruService'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

export default function Izins() {
  const [izins, setIzins] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    jenis: '',
    search: '',
    start_date: '',
    end_date: ''
  })
  const [selectedIzin, setSelectedIzin] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchIzins()
    fetchStats()
  }, [currentPage, filters])

  const fetchIzins = async () => {
    try {
      setLoading(true)
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {})
      
      const response = await guruApi.getIzins({
        page: currentPage,
        per_page: 15,
        ...cleanFilters
      })
      setIzins(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Gagal memuat data izin')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await guruApi.getIzinStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleApprove = async (izin) => {
    const { value: catatan } = await Swal.fire({
      title: 'Setujui Izin?',
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
        fetchIzins()
        fetchStats()
      } catch (error) {
        toast.error('Gagal menyetujui izin')
      }
    }
  }

  const handleReject = async (izin) => {
    const { value: catatan } = await Swal.fire({
      title: 'Tolak Izin?',
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
        fetchIzins()
        fetchStats()
      } catch (error) {
        toast.error('Gagal menolak izin')
      }
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-300', label: 'Menunggu' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-300', label: 'Disetujui' },
      rejected: { bg: 'bg-rose-100', text: 'text-rose-700', darkBg: 'dark:bg-rose-900/30', darkText: 'dark:text-rose-300', label: 'Ditolak' },
    }
    const cfg = config[status] || config.pending
    return (
      <span className={`inline-flex items-center px-2 py-1 ${cfg.bg} ${cfg.text} ${cfg.darkBg} ${cfg.darkText} rounded-lg text-xs font-medium`}>
        {cfg.label}
      </span>
    )
  }

  const getJenisBadge = (jenis) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
        jenis === 'sakit' 
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      }`}>
        {jenis === 'sakit' ? 'Sakit' : 'Izin'}
      </span>
    )
  }

  const columns = [
    {
      header: 'Tanggal',
      accessor: 'tanggal_formatted',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-sm font-medium">{row.tanggal_formatted}</span>
        </div>
      ),
    },
    {
      header: 'Siswa',
      accessor: 'nama_lengkap',
      cell: (row) => (
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{row.nama_lengkap}</p>
          <p className="text-xs text-slate-500">NIS: {row.nis}</p>
          {row.siswa && <p className="text-xs text-slate-500">Kelas: {row.siswa.kelas}</p>}
        </div>
      ),
    },
    {
      header: 'Jenis',
      accessor: 'jenis',
      cell: (row) => getJenisBadge(row.jenis),
    },
    {
      header: 'Alasan',
      accessor: 'alasan',
      cell: (row) => (
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
          {row.alasan}
        </p>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Aksi',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedIzin(row)
              setShowDetailModal(true)
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Detail"
          >
            <Eye size={14} />
          </button>
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(row)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                title="Setujui"
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={() => handleReject(row)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                title="Tolak"
              >
                <XCircle size={14} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <FileText size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Manajemen Izin
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage Permissions dan sakit siswa
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Permissions</p>
              <FileText size={18} className="text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_izin}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Menunggu</p>
              <Clock size={18} className="text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Disetujui</p>
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Ditolak</p>
              <XCircle size={18} className="text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-rose-600">{stats.rejected}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Hari Ini</p>
              <Calendar size={18} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.today_izin}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Carinama/Nis..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
          />
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>

          <select
            value={filters.jenis}
            onChange={(e) => setFilters({ ...filters, jenis: e.target.value })}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
          >
            <option value="">All Types</option>
            <option value="izin">Izin</option>
            <option value="sakit">Sakit</option>
          </select>

          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
          />

          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <DataTable
          columns={columns}
          data={izins}
          pagination={pagination}
          onPageChange={setCurrentPage}
          loading={loading}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detailizin"
      >
        {selectedIzin && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Student Name</p>
                <p className="font-semibold">{selectedIzin.nama_lengkap}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Student Number</p>
                <p className="font-semibold">{selectedIzin.nis}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tanggal</p>
                <p className="font-semibold">{selectedIzin.tanggal_formatted}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Jenis</p>
                {getJenisBadge(selectedIzin.jenis)}
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-500">Alasan</p>
                <p className="font-semibold">{selectedIzin.alasan}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                {getStatusBadge(selectedIzin.status)}
              </div>
              {selectedIzin.disetujui_oleh && (
                <div>
                  <p className="text-sm text-slate-500">Approved By</p>
                  <p className="font-semibold">{selectedIzin.disetujui_oleh.name}</p>
                </div>
              )}
              {selectedIzin.catatan_admin && (
                <div className="col-span-2">
                  <p className="text-sm text-slate-500">Admin Notes</p>
                  <p className="font-semibold">{selectedIzin.catatan_admin}</p>
                </div>
              )}
            </div>
            
            {selectedIzin.bukti_foto && (
              <div>
                <p className="text-sm text-slate-500 mb-2">Proof Photo</p>
                <img 
                  src={selectedIzin.bukti_foto} 
                  alt="Bukti" 
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setSelectedImage(selectedIzin.bukti_foto)
                    setShowImageModal(true)
                  }}
                />
              </div>
            )}

            {selectedIzin.status === 'pending' && (
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    handleApprove(selectedIzin)
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  Setujui
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    handleReject(selectedIzin)
                  }}
                  className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
                >
                  Tolak
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Proof Photo"
      >
        {selectedImage && (
          <img src={selectedImage} alt="Bukti" className="w-full h-auto rounded-lg" />
        )}
      </Modal>
    </div>
  )
}
