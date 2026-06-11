import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  QrCode,
  Users,
  Users2,
  GraduationCap,
  Calendar,
  Phone,
  MapPin,
  User,
  Mail,
  Lock,
  Camera,
  ChevronDown,
  FileText,
  Image,
  UserPlus,
  Sparkles,
  BookOpen,
  Fingerprint,
  CheckCircle,
  Loader,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import AdminStatCard from '../../components/AdminStatCard'
import { adminApi } from '../../services/adminService'
import { confirmDelete, showSuccess } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'
import Select from 'react-select'

// Badge Component untuk Kelas
const KelasBadge = ({ kelas }) => {
  if (!kelas) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-[10px] font-semibold shadow-sm">
      <BookOpen size={9}/>
      <span className="truncate max-w-[80px]">{kelas.nama_kelas || kelas}</span>
    </span>
  )
}

// Badge Component untuk Jenis Kelamin
const GenderBadge = ({ gender }) => (
  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-white font-bold text-xs shadow-sm ${
    gender === 'L'
      ? 'bg-gradient-to-br from-violet-500 to-purple-600'
      : 'bg-gradient-to-br from-pink-500 to-rose-500'
  }`}>
    {gender}
  </span>
)

// Avatar Component untuk Siswa - EMERALD + PURPLE
const StudentAvatar = ({ siswa }) => {
  const hasPhoto = siswa.foto_url || siswa.foto
  const initial = siswa.nama_lengkap?.charAt(0).toUpperCase() || '?'

  return (
    <div className="relative flex-shrink-0">
      {hasPhoto ? (
        <img 
          src={siswa.foto_url || siswa.foto} 
          alt={siswa.nama_lengkap}
          className="w-8 h-8 rounded-lg object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
          onError={(e) => {
            e.target.style.display = 'none'
            if (e.target.nextElementSibling) {
              e.target.nextElementSibling.style.display = 'flex'
            }
          }}
        />
      ) : null}
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-slate-800 ${hasPhoto ? 'hidden' : 'flex'}`}>
        {initial}
      </div>
    </div>
  )
}

// QR Code Action Buttons
const QrActions = ({ row, onView, onDownload, onReset, onFingerprint }) => (
  <div className="flex items-center gap-0.5">
    <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}
      onClick={() => onView(row)}
      className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm hover:shadow-md transition-all" title="Lihat QR Code">
      <QrCode size={12}/>
    </motion.button>
    <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}
      onClick={() => onDownload(row)}
      className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-md transition-all hidden sm:block" title="Download QR Code">
      <Download size={12}/>
    </motion.button>
    <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}
      onClick={() => onReset(row)}
      className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm hover:shadow-md transition-all hidden lg:block" title="Reset QR Code">
      <RefreshCw size={12}/>
    </motion.button>
    <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}
      onClick={() => onFingerprint(row)}
      className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-md transition-all" title="Daftar Sidik Jari">
      <Fingerprint size={12}/>
    </motion.button>
  </div>
)

// Action Buttons
const ActionButtons = ({ row, onView, onEdit, onDelete }) => (
  <div className="flex items-center gap-0.5">
    <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}
      onClick={() => onView(row)}
      className="p-1.5 rounded-lg text-slate-400 hover:text-violet-500 hover:bg-violet-500/10 transition-all" title="Lihat Detail">
      <Eye size={13}/>
    </motion.button>
    <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}
      onClick={() => onEdit(row)}
      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all" title="Edit">
      <Edit2 size={13}/>
    </motion.button>
    <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}
      onClick={() => onDelete(row)}
      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all" title="Hapus">
      <Trash2 size={13}/>
    </motion.button>
  </div>
)

export default function Siswas() {
  // ============= STATE MANAGEMENT =============
  const [siswas, setSiswas] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingSiswa, setEditingSiswa] = useState(null)
  const [viewingSiswa, setViewingSiswa] = useState(null)
  const [viewingQrSiswa, setViewingQrSiswa] = useState(null)
  const [error, setError] = useState(null)
  // Fingerprint modal
  const [fingerprintSiswa, setFingerprintSiswa] = useState(null)
  const [fpLoading, setFpLoading] = useState(false)
  const [fpStatus, setFpStatus] = useState(null) // null | 'checking' | { terdaftar, uid }
  const [stats, setStats] = useState({
    total: 0,
    laki_laki: 0,
    perempuan: 0,
    total_kelas: 0,
    aktif: 0,
    nonaktif: 0
  })
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    nama_lengkap: '',
    kelas_id: '',
    jenis_kelamin: 'L',
    tanggal_lahir: '',
    alamat: '',
    no_hp: '',
    nama_ortu: '',
    email: '',
    password: '',
    foto: null,
  })
  const [previewFoto, setPreviewFoto] = useState(null)
  const [importFile, setImportFile] = useState(null)

  // Data untuk chart tidak dipakai lagi — dihapus

  // ============= DATA FETCHING =============
  useEffect(() => {
    fetchSiswas()
    fetchKelas()
    if (!showDeleted) {
      fetchStats()
    }
  }, [currentPage, search, showDeleted])

  const fetchStats = async () => {
    try {
      const response = await adminApi.getSiswaStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchSiswas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminApi.getSiswas({
        page: currentPage,
        search: search,
        per_page: 10,
        show_deleted: showDeleted ? 1 : 0,
      })
      
      const res = response.data
      const siswaData = Array.isArray(res?.data) ? res.data : []
      const paginationData = res?.pagination || null

      setSiswas(siswaData)
      setPagination(paginationData)
      
    } catch (error) {
      console.error('Error fetching siswas:', error)
      setError(error.response?.data?.message || 'Gagal memuat data siswa')
      toast.error('Gagal memuat data siswa')
    } finally {
      setLoading(false)
    }
  }

  const fetchKelas = async () => {
    try {
      const response = await adminApi.getAllKelas()
      
      let kelasData = []
      if (response.data?.data) {
        kelasData = response.data.data
      } else if (Array.isArray(response.data)) {
        kelasData = response.data
      }
      
      setKelasList(kelasData.map(k => ({
        value: k.id,
        label: `${k.nama_kelas || k.nama} ${k.tingkat ? `- ${k.tingkat}` : ''}`
      })))
    } catch (error) {
      console.error('Error fetching kelas:', error)
      toast.error('Gagal memuat data kelas')
    }
  }

  // ============= CRUD OPERATIONS =============
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nama_lengkap?.trim()) {
      toast.error('Nama lengkap harus diisi')
      return
    }
    if (!formData.kelas_id) {
      toast.error('Kelas harus dipilih')
      return
    }

    try {
      setLoading(true)
      
      const submitData = new FormData()
      
      submitData.append('nama_lengkap', formData.nama_lengkap)
      submitData.append('kelas_id', formData.kelas_id)
      submitData.append('nis', formData.nis)
      submitData.append('nisn', formData.nisn || '')
      submitData.append('jenis_kelamin', formData.jenis_kelamin)
      submitData.append('tanggal_lahir', formData.tanggal_lahir || '')
      submitData.append('alamat', formData.alamat || '')
      submitData.append('no_hp', formData.no_hp || '')
      submitData.append('nama_ortu', formData.nama_ortu || '')

      if (editingSiswa) {
        submitData.append('_method', 'PUT')
      } else {
        submitData.append('email', formData.email)
        submitData.append('password', formData.password)
      }

      if (formData.foto instanceof File) {
        submitData.append('foto', formData.foto)
      }

      if (editingSiswa) {
        await adminApi.updateSiswa(editingSiswa.id, submitData)
        toast.success('Siswa berhasil diperbarui')
      } else {
        await adminApi.createSiswa(submitData)
        toast.success('Siswa berhasil ditambahkan')
      }
      
      setIsModalOpen(false)
      resetForm()
      await fetchSiswas()
      await fetchStats()
      
    } catch (error) {
      console.error('Error saving siswa:', error)
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0]
        toast.error(firstError)
      } else {
        toast.error(error.response?.data?.message || 'Terjadi kesalahan')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (siswa) => {
    const siswaId = siswa?.id

    if (!siswaId) {
      console.error('ID siswa tidak ditemukan:', siswa)
      toast.error('ID siswa tidak ditemukan')
      return
    }

    const confirmed = await confirmDelete(
      'Hapus Siswa',
      `Apakah Anda yakin ingin menghapus "${siswa.nama_lengkap || 'siswa ini'}"?`
    )
    if (!confirmed) return

    try {
      setLoading(true)
      await adminApi.deleteSiswa(siswaId)
      showSuccess('Siswa berhasil dihapus')
      await fetchSiswas()
      await fetchStats()
    } catch (error) {
      console.error('Gagal menghapus siswa:', error)
      toast.error(error.response?.data?.message || 'Gagal menghapus siswa')
    } finally {
      setLoading(false)
    }
  }

  // ============= IMPORT OPERATIONS =============
  const handleImport = async (e) => {
    e.preventDefault()
    
    if (!importFile) {
      toast.error('Pilih file Excel terlebih dahulu')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', importFile)
      
      await adminApi.importSiswas(formData)
      toast.success('Data siswa berhasil diimport')
      setIsImportModalOpen(false)
      setImportFile(null)
      await fetchSiswas()
      await fetchStats()
    } catch (error) {
      console.error('Error importing:', error)
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0]
        toast.error(firstError)
      } else {
        toast.error(error.response?.data?.message || 'Gagal import data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImportFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      if (!allowedTypes.includes(file.type)) {
        toast.error('File harus berupa Excel (.xls atau .xlsx)')
        return
      }
      setImportFile(file)
    }
  }

  // ============= QR CODE OPERATIONS =============
  const handleResetQr = async (siswa) => {
    if (!siswa?.id) {
      toast.error('Data siswa tidak valid')
      return
    }
    
    const confirmed = await confirmDelete(
      'Reset QR Code',
      'QR Code lama tidak dapat digunakan lagi. Lanjutkan?'
    )
    
    if (!confirmed) return
    
    try {
      setLoading(true)
      await adminApi.resetQrCode(siswa.id)
      showSuccess('QR Code berhasil direset')
      await fetchSiswas()
    } catch (error) {
      console.error('Error resetting QR:', error)
      toast.error(error.response?.data?.message || 'Gagal mereset QR Code')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQr = async (siswa) => {
    if (!siswa?.id) {
      toast.error('Data siswa tidak valid')
      return
    }
    
    try {
      setLoading(true)
      
      const response = await adminApi.downloadQrCode(siswa.id)
      
      const blob = new Blob([response.data], { type: 'image/png' })
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `QR-${siswa.nis || siswa.nama_lengkap || siswa.id}.png`
      document.body.appendChild(link)
      link.click()
      
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('QR Code berhasil diunduh')
    } catch (error) {
      console.error('Error downloading QR:', error)
      
      let errorMessage = 'Gagal mengunduh QR Code'
      if (error.response?.status === 404) {
        errorMessage = 'QR Code tidak ditemukan'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // ============= UI HANDLERS =============
  const handleViewDetail = (siswa) => {
    setViewingSiswa(siswa)
    setIsDetailModalOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        toast.error('File harus berupa gambar (JPG, PNG, JPEG)')
        return
      }
      
      setFormData({ ...formData, foto: file })
      setPreviewFoto(URL.createObjectURL(file))
    }
  }

  const openModal = (siswa = null) => {
    if (siswa) {
      setEditingSiswa(siswa)
      setFormData({
        nis: siswa.nis || '',
        nisn: siswa.nisn || '',
        nama_lengkap: siswa.nama_lengkap || '',
        kelas_id: siswa.kelas_id || siswa.kelas?.id || '',
        jenis_kelamin: siswa.jenis_kelamin || 'L',
        tanggal_lahir: siswa.tanggal_lahir || '',
        alamat: siswa.alamat || '',
        no_hp: siswa.no_hp || '',
        nama_ortu: siswa.nama_ortu || '',
        email: '',
        password: '',
        foto: null,
      })
      setPreviewFoto(siswa.foto_url || null)
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingSiswa(null)
    setFormData({
      nis: '',
      nisn: '',
      nama_lengkap: '',
      kelas_id: '',
      jenis_kelamin: 'L',
      tanggal_lahir: '',
      alamat: '',
      no_hp: '',
      nama_ortu: '',
      email: '',
      password: '',
      foto: null,
    })
    setPreviewFoto(null)
  }

  // ============= FINGERPRINT HANDLERS =============
  const handleOpenFingerprint = async (siswa) => {
    setFingerprintSiswa(siswa)
    setFpStatus('checking')
    setFpLoading(false)
    try {
      const res = await adminApi.checkFingerprintRegistered({ tipe: 'siswa', id: siswa.id })
      setFpStatus(res.data.data)
    } catch {
      setFpStatus({ terdaftar: false, userid: siswa.nis || siswa.nisn })
    }
  }

  const handleRegisterFingerprint = async () => {
    if (!fingerprintSiswa) return
    setFpLoading(true)
    try {
      const res = await adminApi.registerFingerprint({ tipe: 'siswa', id: fingerprintSiswa.id })
      setFpStatus({ terdaftar: true, userid: res.data.data.userid, uid: res.data.data.uid })
      toast.success(res.data.data.pesan)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mendaftarkan sidik jari')
    } finally {
      setFpLoading(false)
    }
  }

  const handleUnregisterFingerprint = async () => {
    if (!fingerprintSiswa) return
    setFpLoading(true)
    try {
      await adminApi.unregisterFingerprint({ tipe: 'siswa', id: fingerprintSiswa.id })
      setFpStatus({ terdaftar: false, userid: fingerprintSiswa.nis || fingerprintSiswa.nisn })
      toast.success('Sidik jari berhasil dihapus dari mesin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus sidik jari')
    } finally {
      setFpLoading(false)
    }
  }

  // ============= TABLE COLUMNS =============
  const columns = [
    {
      header: 'Siswa',
      accessor: 'foto',
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <StudentAvatar siswa={row} />
          <div className="min-w-0">
            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
              {row.nama_lengkap}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-0.5">
              <FileText size={8} className="text-slate-400" />
              {row.nis || '-'}
            </p>
          </div>
        </div>
      ),
    },
    { 
      header: 'NISN', 
      accessor: 'nisn',
      cell: (row) => (
        <span className="hidden md:inline-block font-mono text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          {row.nisn || '-'}
        </span>
      )
    },
    {
      header: 'Kelas',
      accessor: 'kelas',
      cell: (row) => <KelasBadge kelas={row.kelas || row.nama_kelas} />,
    },
    {
      header: 'JK',
      accessor: 'jenis_kelamin',
      cell: (row) => <GenderBadge gender={row.jenis_kelamin} />,
    },
    {
      header: 'Kontak',
      accessor: 'no_hp',
      cell: (row) => (
        <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
          <Phone size={10} className="text-slate-400" />
          <span className="truncate max-w-[100px]">{row.no_hp || '-'}</span>
        </div>
      ),
    },
    {
      header: 'QR Code',
      accessor: 'qr_code',
      cell: (row) => (
        <QrActions 
          row={row}
          onView={setViewingQrSiswa}
          onDownload={handleDownloadQr}
          onReset={handleResetQr}
          onFingerprint={handleOpenFingerprint}
        />
      ),
    },
    {
      header: 'Aksi',
      accessor: 'actions',
      cell: (row) => (
        <ActionButtons 
          row={row}
          onView={handleViewDetail}
          onEdit={openModal}
          onDelete={handleDelete}
        />
      ),
    },
  ]

  // Stats cards
  const statsCards = [
    { label:'Total Siswa', value:stats.total,       icon:Users2,       color:'#3b82f6', border:'border-blue-100 dark:border-blue-800/40',     tc:'text-blue-600 dark:text-blue-400',     iconBg:'bg-blue-50 dark:bg-blue-900/30',     delay:0,    sparkType:'area' },
    { label:'Laki-laki',   value:stats.laki_laki,   icon:User,         color:'#8b5cf6', border:'border-violet-100 dark:border-violet-800/40', tc:'text-violet-600 dark:text-violet-400', iconBg:'bg-violet-50 dark:bg-violet-900/30', delay:0.05, sparkType:'bar' },
    { label:'Perempuan',   value:stats.perempuan,   icon:User,         color:'#ec4899', border:'border-pink-100 dark:border-pink-800/40',     tc:'text-pink-600 dark:text-pink-400',     iconBg:'bg-pink-50 dark:bg-pink-900/30',     delay:0.1,  sparkType:'bar' },
    { label:'Total Kelas', value:stats.total_kelas, icon:GraduationCap,color:'#f59e0b', border:'border-amber-100 dark:border-amber-800/40',   tc:'text-amber-600 dark:text-amber-400',   iconBg:'bg-amber-50 dark:bg-amber-900/30',   delay:0.15, sparkType:'area' },
  ]

  // Custom styles for react-select with Emerald theme
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.5rem',
      borderWidth: '1px',
      borderColor: state.isFocused ? '#10B981' : '#e2e8f0',
      padding: '0.125rem 0',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      minHeight: '36px',
      '&:hover': {
        borderColor: '#10B981'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#10B981' : state.isFocused ? '#D1FAE5' : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      fontSize: '12px',
    })
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">

      {/* PAGE HEADER */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Users size={17} className="text-blue-600 dark:text-blue-400"/>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Siswa</h1>
              {showDeleted && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/40 rounded-lg text-[10px] font-bold"><AlertCircle size={9}/>Trash</span>}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {showDeleted ? 'Data siswa yang telah dihapus' : `${stats.total} siswa · ${stats.laki_laki} L · ${stats.perempuan} P · ${stats.total_kelas} kelas`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsImportModalOpen(true)} disabled={loading} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700">
            <Upload size={12}/><span className="hidden sm:inline">Import</span>
          </button>
          <button onClick={() => openModal()} disabled={loading} className="px-3 py-1.5 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold" style={{ background:'#3b82f6' }}>
            <UserPlus size={12}/><span className="hidden sm:inline">Tambah</span>
          </button>
          <button onClick={() => { setShowDeleted(p => !p); setCurrentPage(1) }} disabled={loading} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700">
            <FileText size={12}/><span className="hidden sm:inline">{showDeleted ? 'Data Aktif' : 'Trash'}</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {!showDeleted && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsCards.map(s => <AdminStatCard key={s.label} {...s}/>)}
        </div>
      )}

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={15}/>
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
              <button onClick={fetchSiswas} disabled={loading}
                className="mt-1 text-xs text-red-500 hover:underline flex items-center gap-1">
                <RefreshCw size={10} className={loading ? 'animate-spin' : ''}/>Coba lagi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <GraduationCap size={12} className="text-blue-500"/>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{showDeleted ? 'Siswa Terhapus' : 'Daftar Siswa'}</p>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-bold">
              {pagination?.total || siswas.length}
            </span>
          </div>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={siswas}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onSearch={setSearch}
            loading={loading}
            searchPlaceholder="Cari berdasarkan NIS atau nama..."
            emptyMessage="Tidak ada data siswa"
          />
        </div>
      </motion.div>

      {/* Enhanced Modal Form (Tambah/Edit) - dengan tema EMERALD */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              resetForm()
            }}
            title={
              <div className="flex items-center gap-2">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30"
                >
                  {editingSiswa ? <Edit2 size={16} className="text-white" /> : <UserPlus size={16} className="text-white" />}
                </motion.div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    {editingSiswa ? 'Edit Siswa' : 'Tambah Siswa Baru'}
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingSiswa ? 'Ubah data siswa yang sudah ada' : 'Isi form untuk menambah siswa baru'}
                  </p>
                </div>
              </div>
            }
            size="lg"
          >
            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Foto Upload */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Foto Siswa {editingSiswa && <span className="text-[9px] text-slate-400 ml-1">(Opsional)</span>}
                  </label>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="relative group flex-shrink-0">
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300/60 dark:border-slate-700/60 overflow-hidden bg-slate-100/80 dark:bg-slate-800/60 shadow-md group-hover:shadow-lg transition-all">
                        {previewFoto ? (
                          <img
                            src={previewFoto}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image size={24} className="text-slate-400/80" />
                          </div>
                        )}
                      </div>
                      {formData.foto && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, foto: null })
                            if (editingSiswa) {
                              setPreviewFoto(editingSiswa.foto_url || null)
                            } else {
                              setPreviewFoto(null)
                            }
                          }}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 shadow-md border-2 border-white dark:border-slate-800"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="foto"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={loading}
                      />
                      <label
                        htmlFor="foto"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-emerald-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <Camera size={14} />
                        Pilih Foto
                      </label>
                      <p className="mt-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                        Format: JPG, PNG, JPEG (Max 2MB)
                      </p>
                      {editingSiswa && (
                        <p className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
                          <Sparkles size={8} />
                          Kosongkan jika tidak ingin mengubah foto
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* NIS */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    NIS <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                      type="text"
                      required
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="Contoh: 2024001"
                    />
                  </div>
                </div>

                {/* NISN */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    NISN
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                      type="text"
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="Nomor Induk Siswa Nasional"
                    />
                  </div>
                </div>

                {/* Nama Lengkap */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                      type="text"
                      required
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="Nama lengkap siswa"
                    />
                  </div>
                </div>

                {/* Kelas */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Kelas <span className="text-emerald-500">*</span>
                  </label>
                  <Select
                    options={kelasList}
                    value={kelasList.find(k => k.value === formData.kelas_id)}
                    onChange={(option) => setFormData({ ...formData, kelas_id: option?.value })}
                    placeholder="Pilih kelas"
                    className="react-select-container text-xs"
                    classNamePrefix="react-select"
                    isClearable={false}
                    isDisabled={loading}
                    required
                    styles={customSelectStyles}
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Kelamin <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <select
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                      className="w-full pl-8 pr-8 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white appearance-none hover:border-slate-300 dark:hover:border-slate-600"
                      required
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Lahir
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600"
                    />
                  </div>
                </div>

                {/* No HP */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    No. HP
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                      type="text"
                      value={formData.no_hp}
                      onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="081234567890"
                    />
                  </div>
                </div>

                {/* Nama Orang Tua */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Orang Tua
                  </label>
                  <div className="relative group">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                      type="text"
                      value={formData.nama_ortu}
                      onChange={(e) => setFormData({ ...formData, nama_ortu: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="Nama orang tua/wali"
                    />
                  </div>
                </div>

                {/* Email & Password untuk tambah baru */}
                {!editingSiswa && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Email <span className="text-emerald-500">*</span>
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                          placeholder="siswa@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Password <span className="text-emerald-500">*</span>
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                          placeholder="Minimal 6 karakter"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Info untuk edit mode */}
                {editingSiswa && (
                  <div className="sm:col-span-2">
                    <div className="bg-emerald-500/10 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                        <AlertCircle size={12} />
                        Email tidak dapat diubah. Untuk mereset password, gunakan fitur reset password di halaman detail.
                      </p>
                    </div>
                  </div>
                )}

                {/* Alamat */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Alamat
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-2.5 top-2.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <textarea
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                      rows="2"
                      placeholder="Alamat lengkap"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
                  disabled={loading}
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    editingSiswa ? 'Simpan Perubahan' : 'Tambah Siswa'
                  )}
                </motion.button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Enhanced Modal Detail - EMERALD */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false)
              setViewingSiswa(null)
            }}
            title={
              <div className="flex items-center gap-2">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30"
                >
                  <Eye size={16} className="text-white" />
                </motion.div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Detail Siswa</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Informasi lengkap siswa</p>
                </div>
              </div>
            }
            size="md"
          >
            {viewingSiswa && (
              <div className="space-y-5 p-5">
                {/* Foto */}
                <div className="flex justify-center">
                  <div className="relative">
                    {viewingSiswa.foto_url || viewingSiswa.foto ? (
                      <img
                        src={viewingSiswa.foto_url || viewingSiswa.foto}
                        alt={viewingSiswa.nama_lengkap}
                        className="w-24 h-24 rounded-lg object-cover ring-4 ring-white/80 dark:ring-slate-800/80 shadow-xl"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          if (e.target.nextElementSibling) {
                            e.target.nextElementSibling.style.display = 'flex'
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-24 h-24 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white/80 dark:ring-slate-800/80 shadow-xl ${viewingSiswa.foto_url || viewingSiswa.foto ? 'hidden' : 'flex'}`}>
                      {viewingSiswa.nama_lengkap?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Nama */}
                <div className="text-center">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {viewingSiswa.nama_lengkap}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center gap-1">
                    <BookOpen size={12} className="text-emerald-500" />
                    {viewingSiswa.kelas?.nama_kelas || viewingSiswa.nama_kelas || '-'}
                  </p>
                </div>

                {/* Data Detail */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50 shadow-inner">
                  <div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <FileText size={10} className="text-emerald-500" />
                      NIS
                    </p>
                    <p className="font-mono font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingSiswa.nis || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <FileText size={10} className="text-emerald-500" />
                      NISN
                    </p>
                    <p className="font-mono font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingSiswa.nisn || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <User size={10} className="text-emerald-500" />
                      Jenis Kelamin
                    </p>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingSiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <Calendar size={10} className="text-emerald-500" />
                      Tanggal Lahir
                    </p>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingSiswa.tanggal_lahir 
                        ? new Date(viewingSiswa.tanggal_lahir).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <Phone size={10} className="text-emerald-500" />
                      No. HP
                    </p>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingSiswa.no_hp || '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <User size={10} className="text-emerald-500" />
                      Nama Orang Tua
                    </p>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingSiswa.nama_ortu || '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <MapPin size={10} className="text-emerald-500" />
                      Alamat
                    </p>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingSiswa.alamat || '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <Mail size={10} className="text-emerald-500" />
                      Email
                    </p>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingSiswa.user?.email || viewingSiswa.email || '-'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      openModal(viewingSiswa)
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all text-xs font-medium"
                  >
                    <Edit2 size={14} />
                    Edit
                  </motion.button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Enhanced Modal Lihat QR Code - EMERALD */}
      <AnimatePresence>
        {viewingQrSiswa && (
          <Modal
            isOpen={!!viewingQrSiswa}
            onClose={() => setViewingQrSiswa(null)}
            title={
              <div className="flex items-center gap-2">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30"
                >
                  <QrCode size={16} className="text-white" />
                </motion.div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">QR Code Siswa</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px]">
                    {viewingQrSiswa?.nama_lengkap} - {viewingQrSiswa?.nis}
                  </p>
                </div>
              </div>
            }
            size="sm"
          >
            {viewingQrSiswa && (
              <div className="text-center space-y-4 p-5">
                {viewingQrSiswa.qr_code_url ? (
                  <>
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg inline-block mx-auto shadow-xl border border-slate-200 dark:border-slate-700">
                      <img
                        src={viewingQrSiswa.qr_code_url}
                        alt={`QR ${viewingQrSiswa.nama_lengkap}`}
                        className="w-48 h-48 object-contain"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {viewingQrSiswa.nama_lengkap}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                        <FileText size={10} className="text-emerald-500" />
                        {viewingQrSiswa.nis} • 
                        <BookOpen size={10} className="text-emerald-500 ml-0.5" />
                        {viewingQrSiswa.kelas?.nama_kelas || '-'}
                      </p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownloadQr(viewingQrSiswa)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all text-xs font-medium"
                      >
                        <Download size={14} />
                        Download
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="py-6 space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-6 border-2 border-dashed border-slate-300/60 dark:border-slate-700/60 shadow-md">
                      <QrCode size={48} className="mx-auto text-slate-400/80" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      QR Code belum tersedia untuk siswa ini.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleResetQr(viewingQrSiswa)
                        setViewingQrSiswa(null)
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg flex items-center gap-1.5 mx-auto shadow-lg shadow-emerald-500/30 transition-all text-xs font-medium"
                    >
                      <RefreshCw size={14} />
                      Generate QR Code
                    </motion.button>
                  </div>
                )}
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Enhanced Modal Import Excel - EMERALD */}
      <AnimatePresence>
        {isImportModalOpen && (
          <Modal
            isOpen={isImportModalOpen}
            onClose={() => {
              setIsImportModalOpen(false)
              setImportFile(null)
            }}
            title={
              <div className="flex items-center gap-2">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30"
                >
                  <Upload size={16} className="text-white" />
                </motion.div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Import Data Siswa</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Upload file Excel untuk menambah banyak data</p>
                </div>
              </div>
            }
            size="sm"
          >
            <form onSubmit={handleImport} className="space-y-4 p-5">
              <div className="bg-emerald-500/10 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-1.5 font-medium">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>File Excel harus memiliki kolom: NIS, NISN, Nama Lengkap, Kelas ID, Jenis Kelamin, Email, Password</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih File Excel
                </label>
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleImportFileChange}
                  className="w-full text-xs text-slate-900 dark:text-white bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/20 file:text-emerald-600 hover:file:bg-emerald-500/30 dark:file:bg-emerald-500/20 dark:file:text-emerald-400 cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all hover:border-emerald-500/50 dark:hover:border-emerald-500/50"
                  disabled={loading}
                />
                {importFile && (
                  <p className="mt-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <FileText size={10} />
                    {importFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false)
                    setImportFile(null)
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
                  disabled={loading}
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  disabled={loading || !importFile}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={12} />
                      <span>Import Data</span>
                    </>
                  )}
                </motion.button>
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

      {/* ── MODAL FINGERPRINT SISWA ── */}
      <AnimatePresence>
        {fingerprintSiswa && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setFingerprintSiswa(null); setFpStatus(null) }}>
            <motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.9,opacity:0,y:20}}
              transition={{type:'spring',bounce:0.3}}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                      <Fingerprint size={22} className="text-white"/>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Sidik Jari Siswa</h3>
                      <p className="text-xs text-white/70 mt-0.5">Daftar ke mesin fingerprint</p>
                    </div>
                  </div>
                  <button onClick={() => { setFingerprintSiswa(null); setFpStatus(null) }}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white">
                    <X size={16}/>
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Info siswa */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  {fingerprintSiswa.foto_url ? (
                    <img src={fingerprintSiswa.foto_url} alt={fingerprintSiswa.nama_lengkap}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-200 flex-shrink-0"/>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {(fingerprintSiswa.nama_lengkap||'?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{fingerprintSiswa.nama_lengkap}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">NIS: {fingerprintSiswa.nis} · {fingerprintSiswa.kelas?.nama_kelas || '-'}</p>
                    <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">User ID Mesin: {fingerprintSiswa.nis || fingerprintSiswa.nisn}</p>
                  </div>
                </div>

                {/* Status */}
                {fpStatus === 'checking' ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
                    <Loader size={16} className="animate-spin"/>
                    <span className="text-sm">Mengecek status di mesin...</span>
                  </div>
                ) : fpStatus?.terdaftar ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={16} className="text-emerald-500 flex-shrink-0"/>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Sudah Terdaftar di Mesin</p>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">UID Mesin: <span className="font-mono font-bold">{fpStatus.uid}</span></p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Siswa sudah bisa scan sidik jari di mesin. Untuk menghapus dan daftar ulang, klik tombol hapus di bawah.</p>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={16} className="text-amber-500 flex-shrink-0"/>
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Belum Terdaftar di Mesin</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Klik "Daftarkan ke Mesin" — lalu siswa perlu datang ke mesin fingerprint untuk merekam sidik jarinya.</p>
                  </div>
                )}

                {/* Petunjuk cara kerja */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Cara Kerja</p>
                  {['1. Klik "Daftarkan ke Mesin" untuk mendaftarkan User ID siswa.', '2. Siswa datang ke mesin fingerprint.', '3. Ikuti instruksi mesin untuk scan jari (pilih jari ke-1 s.d 10).', '4. Setelah terdaftar, absensi fingerprint langsung berfungsi.'].map((s,i) => (
                    <p key={i} className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">{s}</p>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  {fpStatus !== 'checking' && !fpStatus?.terdaftar && (
                    <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                      onClick={handleRegisterFingerprint} disabled={fpLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {fpLoading ? <Loader size={14} className="animate-spin"/> : <Fingerprint size={14}/>}
                      {fpLoading ? 'Mendaftarkan...' : 'Daftarkan ke Mesin'}
                    </motion.button>
                  )}
                  {fpStatus?.terdaftar && (
                    <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                      onClick={handleUnregisterFingerprint} disabled={fpLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {fpLoading ? <Loader size={14} className="animate-spin"/> : <X size={14}/>}
                      {fpLoading ? 'Menghapus...' : 'Hapus dari Mesin'}
                    </motion.button>
                  )}
                  <button onClick={() => { setFingerprintSiswa(null); setFpStatus(null) }}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-colors border border-slate-200 dark:border-slate-700">
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}