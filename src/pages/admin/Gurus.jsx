import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Archive,
  Users,
  BookOpen,
  Calendar,
  Phone,
  MapPin,
  User,
  Mail,
  Lock,
  Camera,
  Image,
  ChevronDown,
  Award,
  Star,
  AlertCircle,
  X,
  Eye,
  Sparkles,
  Clock,
  UserX,
  QrCode,
  Download,
  RefreshCw,
  Users2,
  UserCheck,
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

// Badge Component untuk Wali Kelas - EMERALD
const WaliKelasBadge = ({ guru }) => {
  if (!guru.is_wali_kelas) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-medium border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <UserX size={10} className="mr-1 opacity-50" />
        <span>Bukan Wali Kelas</span>
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-medium border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm">
      <Star size={10} className="mr-1" />
      <span>Wali Kelas {guru.kelas && `- ${guru.kelas.nama_kelas}`}</span>
    </span>
  )
}

// Avatar Component untuk Guru - EMERALD + PURPLE
const GuruAvatar = ({ guru }) => {
  const hasPhoto = guru.foto_url || guru.foto
  const initial = guru.nama_lengkap?.charAt(0).toUpperCase() || '?'

  return (
    <div className="relative flex-shrink-0">
      {hasPhoto ? (
        <img 
          src={guru.foto_url || guru.foto} 
          alt={guru.nama_lengkap}
          className="w-8 h-8 rounded-lg object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
          onError={(e) => {
            e.target.style.display = 'none'
            if (e.target.nextElementSibling) {
              e.target.nextElementSibling.style.display = 'flex'
            }
          }}
        />
      ) : null}
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-slate-800 ${hasPhoto ? 'hidden' : 'flex'}`}>
        {initial}
      </div>
    </div>
  )
}

// QR Code Action Buttons - EMERALD + PURPLE
const QrActions = ({ row, onView, onDownload, onReset, onFingerprint }) => (
  <div className="flex items-center gap-0.5">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onView(row)}
      className="p-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-400 rounded-lg transition-all border border-purple-500/30 dark:border-purple-500/30 shadow-sm hover:shadow-md"
      title="Lihat QR Code"
    >
      <QrCode size={14} />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onDownload(row)}
      className="p-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-400 rounded-lg transition-all hidden sm:block border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm hover:shadow-md"
      title="Download QR Code"
    >
      <Download size={14} />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onReset(row)}
      className="p-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 dark:text-orange-400 rounded-lg transition-all hidden lg:block border border-orange-500/30 dark:border-orange-500/30 shadow-sm hover:shadow-md"
      title="Reset QR Code"
    >
      <RefreshCw size={14} />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onFingerprint(row)}
      className="p-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-600 dark:bg-cyan-500/20 dark:hover:bg-cyan-500/30 dark:text-cyan-400 rounded-lg transition-all border border-cyan-500/30 dark:border-cyan-500/30 shadow-sm hover:shadow-md"
      title="Daftar Sidik Jari"
    >
      <Fingerprint size={14} />
    </motion.button>
  </div>
)

// Action Buttons - EMERALD + PURPLE
const ActionButtons = ({ row, onView, onEdit, onDelete, showTrashed, onRestore, onForceDelete }) => {
  if (showTrashed) {
    return (
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onRestore(row)}
          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-400 rounded-lg transition-all border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm hover:shadow-md"
          title="Pulihkan"
        >
          <RotateCcw size={14} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onForceDelete(row)}
          className="p-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 dark:text-orange-400 rounded-lg transition-all border border-orange-500/30 dark:border-orange-500/30 shadow-sm hover:shadow-md"
          title="Hapus Permanen"
        >
          <Trash2 size={14} />
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onView(row)}
        className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-400 rounded-lg transition-all border border-purple-500/30 dark:border-purple-500/30 shadow-sm hover:shadow-md"
        title="Lihat Detail"
      >
        <Eye size={14} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onEdit(row)}
        className="p-1.5 bg-slate-100/80 hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-600 dark:bg-slate-800/50 dark:hover:bg-emerald-500/20 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg transition-all border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 shadow-sm hover:shadow-md"
        title="Edit"
      >
        <Edit2 size={14} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onDelete(row)}
        className="p-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 dark:text-orange-400 rounded-lg transition-all border border-orange-500/30 dark:border-orange-500/30 shadow-sm hover:shadow-md"
        title="Hapus"
      >
        <Trash2 size={14} />
      </motion.button>
    </div>
  )
}

export default function Gurus() {
  const [gurus, setGurus] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [mapelList, setMapelList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showTrashed, setShowTrashed] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingGuru, setViewingGuru] = useState(null)
  const [viewingQrGuru, setViewingQrGuru] = useState(null)
  const [editingGuru, setEditingGuru] = useState(null)
  // Fingerprint modal
  const [fingerprintGuru, setFingerprintGuru] = useState(null)
  const [fpLoading, setFpLoading] = useState(false)
  const [fpStatus, setFpStatus] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    wali_kelas: 0,
    laki_laki: 0,
    perempuan: 0,
  })
  const [formData, setFormData] = useState({
    nip: '',
    nuptk: '',
    nama_lengkap: '',
    jenis_kelamin: 'L',
    tanggal_lahir: '',
    alamat: '',
    no_hp: '',
    is_wali_kelas: false,
    kelas_id: '',
    email: '',
    password: '',
    mata_pelajaran_ids: [],
    foto: null,
  })
  const [previewFoto, setPreviewFoto] = useState(null)

  // Data untuk chart (simulasi - masing-masing berbeda polanya)
  const [totalGuruData] = useState([25, 28, 32, 30, 35, 38, 42]) // wave - tren naik
  const [waliKelasData] = useState([8, 10, 12, 15, 14, 16, 18]) // bar - meningkat
  const [maleData] = useState([15, 16, 18, 17, 19, 20, 22]) // sparkline - stabil naik
  const [femaleData] = useState([10, 12, 14, 13, 16, 18, 20]) // radar - variatif

  useEffect(() => {
    fetchGurus()
    if (!showTrashed) {
      fetchKelas()
      fetchMapel()
      fetchStats()
    }
  }, [currentPage, search, showTrashed])

  const fetchStats = async () => {
    try {
      const response = await adminApi.getGuruStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchGurus = async () => {
    try {
      setLoading(true)
      const response = showTrashed 
        ? await adminApi.getTrashedGurus({
            page: currentPage,
            search: search,
            per_page: 10,
          })
        : await adminApi.getGurus({
            page: currentPage,
            search: search,
            per_page: 10,
          })
      
      const res = response.data
      setGurus(Array.isArray(res?.data) ? res.data : [])
      setPagination(res?.pagination || null)
    } catch (error) {
      toast.error('Gagal memuat data guru')
    } finally {
      setLoading(false)
    }
  }

  const fetchKelas = async () => {
    try {
      const response = await adminApi.getAllKelas()
      const kelasData = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : [])
      setKelasList(kelasData.map(k => ({
        value: k.id,
        label: k.nama_kelas
      })))
    } catch (error) {
      console.error('Error fetching kelas:', error)
    }
  }

  const fetchMapel = async () => {
    try {
      const response = await adminApi.getAllMataPelajarans()
      const mapelData = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : [])
      setMapelList(mapelData.map(m => ({
        value: m.id,
        label: m.nama_mapel
      })))
    } catch (error) {
      console.error('Error fetching mapel:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData()
      
      Object.keys(formData).forEach(key => {
        if (key === 'mata_pelajaran_ids') {
          if (Array.isArray(formData[key]) && formData[key].length > 0) {
            formData[key].forEach(id => data.append('mata_pelajaran_ids[]', id))
          }
        } else if (key === 'foto') {
          if (formData[key] instanceof File) {
            data.append(key, formData[key])
          }
        } else if (key === 'is_wali_kelas') {
          data.append(key, formData[key] ? '1' : '0')
        } else if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key])
        }
      })

      if (editingGuru) {
        data.append('_method', 'PUT')
        await adminApi.updateGuru(editingGuru.id, data)
        toast.success('Guru berhasil diperbarui')
      } else {
        await adminApi.createGuru(data)
        toast.success('Guru berhasil ditambahkan')
      }
      
      setIsModalOpen(false)
      resetForm()
      fetchGurus()
      fetchStats()
    } catch (error) {
      console.error('Submit error:', error)
      const message = error.response?.data?.message || 'Terjadi kesalahan'
      toast.error(message)
    }
  }

  const handleDelete = async (guru) => {
    if (await confirmDelete('Hapus guru ini?', 'Guru akan dipindahkan ke trash')) {
      try {
        await adminApi.deleteGuru(guru.id)
        showSuccess('Guru berhasil dihapus')
        fetchGurus()
        fetchStats()
      } catch (error) {
        toast.error('Gagal menghapus guru')
      }
    }
  }

  const handleRestore = async (guru) => {
    try {
      await adminApi.restoreGuru(guru.id)
      toast.success('Guru berhasil dipulihkan')
      fetchGurus()
      fetchStats()
    } catch (error) {
      toast.error('Gagal memulihkan guru')
    }
  }

  const handleForceDelete = async (guru) => {
    if (await confirmDelete('Hapus permanen guru ini?', 'Data tidak dapat dipulihkan!')) {
      try {
        await adminApi.forceDeleteGuru(guru.id)
        showSuccess('Guru berhasil dihapus permanen')
        fetchGurus()
        fetchStats()
      } catch (error) {
        toast.error('Gagal menghapus guru')
      }
    }
  }

  const handleResetQr = async (guru) => {
    if (!guru?.id) {
      toast.error('Data guru tidak valid')
      return
    }
    
    const confirmed = await confirmDelete(
      'Reset QR Code',
      'QR Code lama tidak dapat digunakan lagi. Lanjutkan?'
    )
    
    if (!confirmed) return
    
    try {
      setLoading(true)
      await adminApi.resetGuruQrCode(guru.id)
      showSuccess('QR Code berhasil direset')
      await fetchGurus()
    } catch (error) {
      console.error('Error resetting QR:', error)
      toast.error(error.response?.data?.message || 'Gagal mereset QR Code')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQr = async (guru) => {
    if (!guru?.id) {
      toast.error('Data guru tidak valid')
      return
    }
    
    try {
      const loadingToast = toast.loading('Mengunduh QR Code...')
      
      const response = await adminApi.downloadGuruQrCode(guru.id)
      
      const contentType = response.headers['content-type'] || 'image/svg+xml'
      const isSvg = contentType.includes('svg')
      const extension = isSvg ? 'svg' : 'png'
      
      const blob = new Blob([response.data], { type: contentType })
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `QR-Guru-${guru.nip || guru.nama_lengkap || guru.id}.${extension}`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      toast.dismiss(loadingToast)
      toast.success('✅ QR Code berhasil diunduh')
    } catch (error) {
      console.error('Error downloading QR:', error)
      
      let errorMessage = 'Gagal mengunduh QR Code'
      if (error.response?.status === 404) {
        errorMessage = 'QR Code tidak ditemukan. Silakan reset QR Code terlebih dahulu.'
      } else if (error.response?.status === 500) {
        errorMessage = 'Terjadi kesalahan server. Coba lagi nanti.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
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

  const handleViewDetail = (guru) => {
    setViewingGuru(guru)
    setIsDetailModalOpen(true)
  }

  const openModal = (guru = null) => {
    if (guru) {
      setEditingGuru(guru)
      setFormData({
        nip: guru.nip || '',
        nuptk: guru.nuptk || '',
        nama_lengkap: guru.nama_lengkap || '',
        jenis_kelamin: guru.jenis_kelamin || 'L',
        tanggal_lahir: guru.tanggal_lahir || '',
        alamat: guru.alamat || '',
        no_hp: guru.no_hp || '',
        is_wali_kelas: guru.is_wali_kelas || false,
        kelas_id: guru.kelas?.id || '',
        email: '',
        password: '',
        mata_pelajaran_ids: (guru.mata_pelajarans || []).map(m => m.id),
        foto: null,
      })
      setPreviewFoto(guru.foto_url || null)
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingGuru(null)
    setFormData({
      nip: '',
      nuptk: '',
      nama_lengkap: '',
      jenis_kelamin: 'L',
      tanggal_lahir: '',
      alamat: '',
      no_hp: '',
      is_wali_kelas: false,
      kelas_id: '',
      email: '',
      password: '',
      mata_pelajaran_ids: [],
      foto: null,
    })
    setPreviewFoto(null)
  }

  // ============= FINGERPRINT HANDLERS =============
  const handleOpenFingerprint = async (guru) => {
    setFingerprintGuru(guru)
    setFpStatus('checking')
    setFpLoading(false)
    try {
      const res = await adminApi.checkFingerprintRegistered({ tipe: 'guru', id: guru.id })
      setFpStatus(res.data.data)
    } catch {
      setFpStatus({ terdaftar: false, userid: 'G-' + guru.nip })
    }
  }

  const handleRegisterFingerprint = async () => {
    if (!fingerprintGuru) return
    setFpLoading(true)
    try {
      const res = await adminApi.registerFingerprint({ tipe: 'guru', id: fingerprintGuru.id })
      setFpStatus({ terdaftar: true, userid: res.data.data.userid, uid: res.data.data.uid })
      toast.success(res.data.data.pesan)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mendaftarkan sidik jari')
    } finally {
      setFpLoading(false)
    }
  }

  const handleUnregisterFingerprint = async () => {
    if (!fingerprintGuru) return
    setFpLoading(true)
    try {
      await adminApi.unregisterFingerprint({ tipe: 'guru', id: fingerprintGuru.id })
      setFpStatus({ terdaftar: false, userid: 'G-' + fingerprintGuru.nip })
      toast.success('Sidik jari berhasil dihapus dari mesin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus sidik jari')
    } finally {
      setFpLoading(false)
    }
  }

  const columns = [
    {
      header: 'Guru',
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <GuruAvatar guru={row} />
          <div className="min-w-0">
            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
              {row.nama_lengkap}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-0.5">
              <Award size={8} className="text-emerald-500" />
              {row.nip || 'NIP tidak tersedia'}
            </p>
          </div>
        </div>
      ),
    },
    { 
      header: 'NUPTK', 
      accessor: 'nuptk',
      cell: (row) => (
        <span className="hidden md:inline-block font-mono text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          {row.nuptk || '-'}
        </span>
      )
    },
    ...(showTrashed ? [{
      header: 'Dihapus Pada',
      accessor: 'deleted_at',
      cell: (row) => (
        <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
          <Clock size={10} className="text-slate-400 flex-shrink-0" />
          <span>
            {row.deleted_at ? new Date(row.deleted_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : '-'}
          </span>
        </div>
      ),
    }] : [{
      header: 'Wali Kelas',
      accessor: 'is_wali_kelas',
      cell: (row) => <WaliKelasBadge guru={row} />,
    }]),
    ...(!showTrashed ? [{
      header: 'QR Code',
      accessor: 'qr_code',
      cell: (row) => (
        <QrActions 
          row={row}
          onView={setViewingQrGuru}
          onDownload={handleDownloadQr}
          onReset={handleResetQr}
          onFingerprint={handleOpenFingerprint}
        />
      ),
    }] : []),
    {
      header: 'Aksi',
      cell: (row) => (
        <ActionButtons
          row={row}
          onView={handleViewDetail}
          onEdit={openModal}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onForceDelete={handleForceDelete}
          showTrashed={showTrashed}
        />
      ),
    },
  ]

  // Stats cards
  const statsCards = [
    { label:'Total Guru', value:stats.total,      icon:Users2,    color:'#10b981', border:'border-emerald-100 dark:border-emerald-800/40', tc:'text-emerald-600 dark:text-emerald-400', iconBg:'bg-emerald-50 dark:bg-emerald-900/30', delay:0,    sparkType:'area' },
    { label:'Wali Kelas', value:stats.wali_kelas, icon:Star,      color:'#f59e0b', border:'border-amber-100 dark:border-amber-800/40',     tc:'text-amber-600 dark:text-amber-400',     iconBg:'bg-amber-50 dark:bg-amber-900/30',     delay:0.05, sparkType:'bar' },
    { label:'Laki-laki',  value:stats.laki_laki,  icon:UserCheck, color:'#6366f1', border:'border-indigo-100 dark:border-indigo-800/40',   tc:'text-indigo-600 dark:text-indigo-400',   iconBg:'bg-indigo-50 dark:bg-indigo-900/30',   delay:0.1,  sparkType:'bar' },
    { label:'Perempuan',  value:stats.perempuan,  icon:User,      color:'#ec4899', border:'border-pink-100 dark:border-pink-800/40',       tc:'text-pink-600 dark:text-pink-400',       iconBg:'bg-pink-50 dark:bg-pink-900/30',       delay:0.15, sparkType:'area' },
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
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#10B981/10',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#10B981',
    })
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">
      {/* Page Header */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <Users size={17} className="text-emerald-600 dark:text-emerald-400"/>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Guru</h1>
              {showTrashed && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/40 rounded-lg text-[10px] font-bold"><Archive size={9}/>Trash</span>}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {showTrashed ? 'Data guru yang telah dihapus' : `${stats.total} guru · ${stats.wali_kelas} wali kelas`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowTrashed(!showTrashed); setCurrentPage(1) }}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700">
            <Archive size={12}/><span className="hidden sm:inline">{showTrashed ? 'Data Aktif' : 'Trash'}</span>
          </button>
          {!showTrashed && (
            <button onClick={() => openModal()}
              className="px-3 py-1.5 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold" style={{ background:'#10b981' }}>
              <Plus size={12}/><span className="hidden sm:inline">Tambah Guru</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      {!showTrashed && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsCards.map(s => <AdminStatCard key={s.label} {...s}/>)}
        </div>
      )}

      {/* Table */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <Users size={12} className="text-emerald-500"/>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{showTrashed ? 'Guru Terhapus' : 'Daftar Guru'}</p>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-bold">
              {pagination?.total || gurus.length}
            </span>
          </div>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={gurus}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onSearch={setSearch}
            loading={loading}
            searchPlaceholder="Cari berdasarkan NIP, NUPTK, atau nama..."
            emptyMessage="Tidak ada data guru"
          />
        </div>
      </motion.div>

      {/* Enhanced Modal Detail - EMERALD */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false)
              setViewingGuru(null)
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
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Detail Guru</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Informasi lengkap guru</p>
                </div>
              </div>
            }
            size="md"
          >
            {viewingGuru && (
              <div className="space-y-5 p-5">
                {/* Foto */}
                <div className="flex justify-center">
                  <div className="relative">
                    {viewingGuru.foto_url || viewingGuru.foto ? (
                      <img
                        src={viewingGuru.foto_url || viewingGuru.foto}
                        alt={viewingGuru.nama_lengkap}
                        className="w-24 h-24 rounded-lg object-cover ring-4 ring-white/80 dark:ring-slate-800/80 shadow-xl"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          if (e.target.nextElementSibling) {
                            e.target.nextElementSibling.style.display = 'flex'
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-24 h-24 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white/80 dark:ring-slate-800/80 shadow-xl ${viewingGuru.foto_url || viewingGuru.foto ? 'hidden' : 'flex'}`}>
                      {viewingGuru.nama_lengkap?.charAt(0).toUpperCase()}
                    </div>
                    {viewingGuru.is_wali_kelas && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-2 -right-2 px-2 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[9px] font-medium rounded-full shadow-md border-2 border-white dark:border-slate-800"
                      >
                        <Star size={8} className="inline mr-0.5" />
                        Wali Kelas
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Nama */}
                <div className="text-center">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {viewingGuru.nama_lengkap}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center gap-1">
                    <Award size={12} className="text-emerald-500" />
                    {viewingGuru.nip || 'NIP tidak tersedia'}
                  </p>
                </div>

                {/* Data Detail */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50 shadow-inner">
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <Award size={10} className="text-emerald-500" />
                      NUPTK
                    </p>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingGuru.nuptk || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <User size={10} className="text-emerald-500" />
                      Jenis Kelamin
                    </p>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingGuru.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <Calendar size={10} className="text-emerald-500" />
                      Tanggal Lahir
                    </p>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingGuru.tanggal_lahir 
                        ? new Date(viewingGuru.tanggal_lahir).toLocaleDateString('id-ID', {
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
                      {viewingGuru.no_hp || '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <Mail size={10} className="text-emerald-500" />
                      Email
                    </p>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingGuru.user?.email || viewingGuru.email || '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <MapPin size={10} className="text-emerald-500" />
                      Alamat
                    </p>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {viewingGuru.alamat || '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-0.5">
                      <BookOpen size={10} className="text-emerald-500" />
                      Mata Pelajaran
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(viewingGuru.mata_pelajarans || []).length > 0 ? (
                        viewingGuru.mata_pelajarans.map(mapel => (
                          <span
                            key={mapel.id}
                            className="inline-flex items-center px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-medium border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm"
                          >
                            <BookOpen size={8} className="mr-0.5" />
                            {mapel.nama_mapel}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400">Tidak ada mata pelajaran</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-0.5">
                      <Star size={10} className="text-emerald-500" />
                      Status Wali Kelas
                    </p>
                    <WaliKelasBadge guru={viewingGuru} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      openModal(viewingGuru)
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all text-xs font-medium"
                  >
                    <Edit2 size={14} />
                    Edit Data
                  </motion.button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Enhanced Modal Form (Tambah/Edit) - EMERALD */}
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
                  {editingGuru ? <Edit2 size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
                </motion.div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    {editingGuru ? 'Edit Guru' : 'Tambah Guru Baru'}
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingGuru ? 'Ubah data guru yang sudah ada' : 'Isi form untuk menambah guru baru'}
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
                    Foto Guru {editingGuru && <span className="text-[9px] text-slate-400 ml-1">(Opsional)</span>}
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
                            if (editingGuru) {
                              setPreviewFoto(editingGuru.foto_url || null)
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
                      {editingGuru && (
                        <p className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
                          <Sparkles size={8} />
                          Kosongkan jika tidak ingin mengubah foto
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* NIP */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    NIP
                  </label>
                  <div className="relative group">
                    <Award className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                      type="text"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="Nomor Induk Pegawai"
                    />
                  </div>
                </div>

                {/* NUPTK */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    NUPTK
                  </label>
                  <div className="relative group">
                    <Award className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                      type="text"
                      value={formData.nuptk}
                      onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="Nomor Unik PTK"
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
                      placeholder="Nama lengkap guru"
                    />
                  </div>
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="relative group">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <select
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                      className="w-full pl-8 pr-8 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs text-slate-900 dark:text-white appearance-none hover:border-slate-300 dark:hover:border-slate-600"
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

                {/* Mata Pelajaran */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mata Pelajaran
                  </label>
                  <Select
                    isMulti
                    options={mapelList}
                    value={mapelList.filter(m => formData.mata_pelajaran_ids.includes(m.value))}
                    onChange={(options) => setFormData({ 
                      ...formData, 
                      mata_pelajaran_ids: options.map(o => o.value) 
                    })}
                    placeholder="Pilih mata pelajaran yang diajar"
                    className="react-select-container text-xs"
                    classNamePrefix="react-select"
                    styles={customSelectStyles}
                  />
                </div>

                {/* Wali Kelas Checkbox */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.is_wali_kelas}
                      onChange={(e) => setFormData({ ...formData, is_wali_kelas: e.target.checked })}
                      className="w-4 h-4 text-emerald-500 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-800 dark:border-slate-600 flex-shrink-0"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Wali Kelas
                      </span>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Centang jika guru ini menjadi wali kelas
                      </p>
                    </div>
                  </label>
                </div>

                {/* Kelas (untuk wali kelas) */}
                <AnimatePresence>
                  {formData.is_wali_kelas && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="sm:col-span-2"
                    >
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Kelas yang Dijaga
                      </label>
                      <Select
                        options={kelasList}
                        value={kelasList.find(k => k.value === formData.kelas_id)}
                        onChange={(option) => setFormData({ ...formData, kelas_id: option?.value })}
                        placeholder="Pilih kelas"
                        className="react-select-container text-xs"
                        classNamePrefix="react-select"
                        styles={customSelectStyles}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email & Password untuk guru baru */}
                {!editingGuru && (
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
                          placeholder="guru@sekolah.com"
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
                {editingGuru && (
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
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    editingGuru ? 'Simpan Perubahan' : 'Tambah Guru'
                  )}
                </motion.button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Enhanced Modal Lihat QR Code - EMERALD */}
      <AnimatePresence>
        {viewingQrGuru && (
          <Modal
            isOpen={!!viewingQrGuru}
            onClose={() => setViewingQrGuru(null)}
            title={
              <div className="flex items-center gap-2">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30"
                >
                  <QrCode size={16} className="text-white" />
                </motion.div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">QR Code Guru</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px]">
                    {viewingQrGuru?.nama_lengkap} - {viewingQrGuru?.nip}
                  </p>
                </div>
              </div>
            }
            size="sm"
          >
            {viewingQrGuru && (
              <div className="text-center space-y-4 p-5">
                {viewingQrGuru.qr_code_url ? (
                  <>
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg inline-block mx-auto shadow-xl border border-slate-200 dark:border-slate-700">
                      <img
                        src={viewingQrGuru.qr_code_url}
                        alt={`QR ${viewingQrGuru.nama_lengkap}`}
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {viewingQrGuru.nama_lengkap}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                        <Award size={10} className="text-emerald-500" />
                        {viewingQrGuru.nip} • 
                        <BookOpen size={10} className="text-emerald-500 ml-0.5" />
                        {(viewingQrGuru.mata_pelajarans || []).length} Mapel
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownloadQr(viewingQrGuru)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all text-xs font-medium"
                      >
                        <Download size={14} />
                        Download QR
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          handleResetQr(viewingQrGuru)
                          setViewingQrGuru(null)
                        }}
                        className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 dark:text-orange-400 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium border border-orange-500/30 dark:border-orange-500/30"
                      >
                        <RefreshCw size={14} />
                        Reset QR
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="py-6 space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-6 border-2 border-dashed border-slate-300/60 dark:border-slate-700/60 shadow-md">
                      <QrCode size={48} className="mx-auto text-slate-400/80" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      QR Code belum tersedia untuk guru ini.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleResetQr(viewingQrGuru)
                        setViewingQrGuru(null)
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

      {/* ── MODAL FINGERPRINT GURU ── */}
      <AnimatePresence>
        {fingerprintGuru && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setFingerprintGuru(null); setFpStatus(null) }}>
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
                      <h3 className="text-base font-bold text-white">Sidik Jari Guru</h3>
                      <p className="text-xs text-white/70 mt-0.5">Daftar ke mesin fingerprint</p>
                    </div>
                  </div>
                  <button onClick={() => { setFingerprintGuru(null); setFpStatus(null) }}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white">
                    <X size={16}/>
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Info guru */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  {fingerprintGuru.foto_url ? (
                    <img src={fingerprintGuru.foto_url} alt={fingerprintGuru.nama_lengkap}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-200 flex-shrink-0"/>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {(fingerprintGuru.nama_lengkap||'?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{fingerprintGuru.nama_lengkap}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">NIP: {fingerprintGuru.nip}</p>
                    <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">User ID Mesin: G-{fingerprintGuru.nip}</p>
                  </div>
                </div>

                {/* Status */}
                {fpStatus === 'checking' ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
                    <Loader size={16} className="animate-spin"/>
                    <span className="text-sm">Mengecek status di mesin...</span>
                  </div>
                ) : fpStatus?.terdaftar ? (
                  <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                    className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-emerald-500 flex-shrink-0"/>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">✅ Sudah Terdaftar di Mesin</p>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">UID Mesin: <span className="font-mono font-bold">{fpStatus.uid}</span></p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Guru sudah bisa scan sidik jari di mesin. Untuk daftar ulang, hapus dulu lalu daftarkan kembali.</p>
                  </motion.div>
                ) : fpStatus ? (
                  <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                    className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={16} className="text-amber-500 flex-shrink-0"/>
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">⚠️ Belum Terdaftar di Mesin</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Klik "Daftarkan ke Mesin" — lalu guru perlu datang ke mesin fingerprint untuk merekam sidik jarinya.</p>
                  </motion.div>
                ) : null}

                {/* Petunjuk */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">📋 Alur Pendaftaran</p>
                  {[
                    {n:'1', t:'Klik "Daftarkan ke Mesin" di bawah.'},
                    {n:'2', t:'Guru datang ke mesin fingerprint yang terhubung.'},
                    {n:'3', t:'Mesin akan meminta scan jari — ikuti instruksi layar mesin.'},
                    {n:'4', t:'Selesai! Absensi fingerprint langsung aktif.'},
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.t}</p>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  {fpStatus !== 'checking' && fpStatus && !fpStatus.terdaftar && (
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
                  <button onClick={() => { setFingerprintGuru(null); setFpStatus(null) }}
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