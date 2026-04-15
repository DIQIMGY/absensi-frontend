import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  QrCode
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { adminApi } from '../../services/adminService'
import { confirmDelete, showSuccess } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'
import Select from 'react-select'

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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingSiswa, setEditingSiswa] = useState(null)
  const [viewingSiswa, setViewingSiswa] = useState(null)
  const [viewingQrSiswa, setViewingQrSiswa] = useState(null)
  const [error, setError] = useState(null)
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

  // ============= DATA FETCHING =============
  useEffect(() => {
    fetchSiswas()
    fetchKelas()
  }, [currentPage, search, showDeleted])

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
      
      // Format backend: { success, message, data: [...], pagination: {...} }
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
      
      // Handle berbagai struktur response
      let kelasData = []
      if (response.data?.data) {
        kelasData = response.data.data
      } else if (Array.isArray(response.data)) {
        kelasData = response.data
      }
      
      setKelasList(kelasData.map(k => ({
        value: k.id,
        label: `${k.nama_kelas || k.nama} - ${k.tingkat || ''}`
      })))
    } catch (error) {
      console.error('Error fetching kelas:', error)
      toast.error('Gagal memuat data kelas')
    }
  }

  // ============= CRUD OPERATIONS =============
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validasi form dasar
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
      
      // Field wajib kirim
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
        // Mode Edit
        submitData.append('_method', 'PUT')
        // Email & Password tidak dikirim saat edit sesuai SiswaRequest.php
      } else {
        // Mode Tambah
        submitData.append('email', formData.email)
        submitData.append('password', formData.password)
      }

      // Handle foto secara eksplisit
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
  } catch (error) {
    console.error('Gagal menghapus siswa:', error)
    toast.error(error.response?.data?.message || 'Gagal menghapus siswa')
  } finally {
    setLoading(false)
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
      
      // Buat blob dari response
      const blob = new Blob([response.data], { type: 'image/png' })
      const url = window.URL.createObjectURL(blob)
      
      // Buat link download
      const link = document.createElement('a')
      link.href = url
      link.download = `QR-${siswa.nis || siswa.nama_lengkap || siswa.id}.png`
      document.body.appendChild(link)
      link.click()
      
      // Bersihkan
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
      // Validasi file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        toast.error('File harus berupa gambar (JPG, PNG, JPEG)')
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 2MB')
        return
      }
      
      setFormData({ ...formData, foto: file })
      setPreviewFoto(URL.createObjectURL(file))
    }
  }

  const openModal = (siswa = null) => {
    if (siswa) {
      // Mode Edit
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
        email: '', // Email tidak diisi untuk edit
        password: '', // Password kosong untuk edit
        foto: null, // PENTING: foto null untuk edit (tidak kirim foto lama)
      })
      // Set preview dari foto yang sudah ada (URL)
      setPreviewFoto(siswa.foto || null)
    } else {
      // Mode Tambah
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

  // ============= TABLE COLUMNS =============
  const columns = [
    {
      header: 'Foto',
      accessor: 'foto',
      cell: (row) => (
        <img
          src={row.foto || '/default-avatar.png'}
          alt={row.nama_lengkap}
          className="w-10 h-10 rounded-full object-cover border border-slate-200"
          onError={(e) => { e.target.src = '/default-avatar.png' }}
        />
      ),
    },
    { 
      header: 'NIS', 
      accessor: 'nis',
      cell: (row) => row.nis || '-'
    },
    { 
      header: 'Nama Lengkap', 
      accessor: 'nama_lengkap' 
    },
    {
      header: 'Kelas',
      accessor: 'kelas',
      cell: (row) => {
        if (row.kelas?.nama_kelas) return row.kelas.nama_kelas
        if (row.nama_kelas) return row.nama_kelas
        return '-'
      },
    },
    {
      header: 'JK',
      accessor: 'jenis_kelamin',
      cell: (row) => row.jenis_kelamin === 'L' ? 'L' : 'P',
    },
    {
      header: 'QR Code',
      accessor: 'qr_code',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewingQrSiswa(row)}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
            title="Lihat QR Code"
            disabled={loading}
          >
            <QrCode size={16} />
          </button>
          <button
            onClick={() => handleDownloadQr(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Download QR Code"
            disabled={loading}
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => handleResetQr(row)}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
            title="Reset QR Code"
            disabled={loading}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      ),
    },
    {
      header: 'Aksi',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDetail(row)}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
            title="Lihat Detail"
            disabled={loading}
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => openModal(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Edit"
            disabled={loading}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Hapus"
            disabled={loading}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  // ============= RENDER =============
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Manajemen Siswa
        </h1>
        <div className="flex gap-2">
          <button 
            className="btn-secondary flex items-center gap-2"
            onClick={() => toast.info('Fitur import Excel sedang dalam pengembangan')}
            disabled={loading}
          >
            <Upload size={18} />
            Import Excel
          </button>
          <button
            onClick={() => openModal()}
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            <Plus size={18} />
            Tambah Siswa
          </button>
          <button
            onClick={() => setShowDeleted(prev => !prev)}
            className="btn-outline flex items-center gap-2"
            disabled={loading}
          >
            {showDeleted ? 'Sembunyikan Terhapus' : 'Tampilkan Terhapus'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchSiswas}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              disabled={loading}
            >
              <RefreshCw size={14} />
              Coba lagi
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-body">
          <DataTable
            columns={columns}
            data={siswas}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onSearch={setSearch}
            loading={loading}
            searchPlaceholder="Cari NIS atau nama..."
            emptyMessage="Tidak ada data siswa"
          />
        </div>
      </motion.div>

      {/* Modal Form (Tambah/Edit) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingSiswa ? 'Edit Siswa' : 'Tambah Siswa'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NIS */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                NIS <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                className="input-field"
                placeholder="Contoh: 2024001"
                disabled={loading}
              />
            </div>

            {/* NISN */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                NISN
              </label>
              <input
                type="text"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                className="input-field"
                placeholder="Nomor Induk Siswa Nasional"
                disabled={loading}
              />
            </div>

            {/* Nama Lengkap */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                className="input-field"
                placeholder="Nama lengkap siswa"
                disabled={loading}
              />
            </div>

            {/* Kelas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <Select
                options={kelasList}
                value={kelasList.find(k => k.value === formData.kelas_id)}
                onChange={(option) => setFormData({ ...formData, kelas_id: option?.value })}
                placeholder="Pilih kelas"
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable={false}
                isDisabled={loading}
                required
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                className="input-field"
                required
                disabled={loading}
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* No HP */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                No. HP
              </label>
              <input
                type="text"
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                className="input-field"
                placeholder="081234567890"
                disabled={loading}
              />
            </div>

            {/* Nama Orang Tua */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nama Orang Tua
              </label>
              <input
                type="text"
                value={formData.nama_ortu}
                onChange={(e) => setFormData({ ...formData, nama_ortu: e.target.value })}
                className="input-field"
                placeholder="Nama orang tua/wali"
                disabled={loading}
              />
            </div>

            {/* Email & Password - hanya untuk siswa baru */}
            {!editingSiswa && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="siswa@email.com"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    placeholder="Minimal 6 karakter"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Info untuk edit mode */}
            {editingSiswa && (
              <div className="md:col-span-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Email tidak dapat diubah. Untuk mereset password, gunakan fitur lupa password.
                  </p>
                </div>
              </div>
            )}

            {/* Alamat */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Alamat
              </label>
              <textarea
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="input-field"
                rows="2"
                placeholder="Alamat lengkap"
                disabled={loading}
              />
            </div>

            {/* Foto */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Foto {editingSiswa && <span className="text-xs text-slate-500">(Opsional - kosongkan jika tidak ingin mengubah)</span>}
              </label>
              <div className="flex items-center gap-4">
                {previewFoto && (
                  <div className="relative">
                    <img
                      src={previewFoto}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    {formData.foto && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, foto: null })
                          // Jika edit, kembalikan preview ke foto lama
                          if (editingSiswa) {
                            setPreviewFoto(editingSiswa.foto || null)
                          } else {
                            setPreviewFoto(null)
                          }
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        title="Batalkan foto baru"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Format: JPG, PNG, JPEG. Maks: 2MB
                    {editingSiswa && <span className="block text-blue-600">Kosongkan jika tidak ingin mengubah foto</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                resetForm()
              }}
              className="btn-secondary"
              disabled={loading}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : (editingSiswa ? 'Simpan Perubahan' : 'Tambah Siswa')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setViewingSiswa(null)
        }}
        title="Detail Siswa"
        size="md"
      >
        {viewingSiswa && (
          <div className="space-y-4">
            {/* Foto */}
            <div className="flex justify-center">
              <img
                src={viewingSiswa.foto || '/default-avatar.png'}
                alt={viewingSiswa.nama_lengkap}
                className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700"
                onError={(e) => { e.target.src = '/default-avatar.png' }}
              />
            </div>

            {/* Data Detail */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500">NIS</label>
                <p className="font-medium">{viewingSiswa.nis || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">NISN</label>
                <p className="font-medium">{viewingSiswa.nisn || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500">Nama Lengkap</label>
                <p className="font-medium">{viewingSiswa.nama_lengkap}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Kelas</label>
                <p className="font-medium">
                  {viewingSiswa.kelas?.nama_kelas || viewingSiswa.nama_kelas || '-'}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Jenis Kelamin</label>
                <p className="font-medium">
                  {viewingSiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Tanggal Lahir</label>
                <p className="font-medium">
                  {viewingSiswa.tanggal_lahir 
                    ? new Date(viewingSiswa.tanggal_lahir).toLocaleDateString('id-ID') 
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500">No. HP</label>
                <p className="font-medium">{viewingSiswa.no_hp || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500">Nama Orang Tua</label>
                <p className="font-medium">{viewingSiswa.nama_ortu || viewingSiswa.nama_ayah || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500">Alamat</label>
                <p className="font-medium">{viewingSiswa.alamat || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500">Email</label>
                <p className="font-medium">{viewingSiswa.user?.email || viewingSiswa.email || '-'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false)
                  openModal(viewingSiswa)
                }}
                className="btn-primary"
              >
                Edit Data
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Lihat QR Code */}
      <Modal
        isOpen={!!viewingQrSiswa}
        onClose={() => setViewingQrSiswa(null)}
        title={`QR Code - ${viewingQrSiswa?.nama_lengkap || ''}`}
        size="sm"
      >
        {viewingQrSiswa && (
          <div className="text-center space-y-4">
            {viewingQrSiswa.qr_code_url ? (
              <>
                <img
                  src={viewingQrSiswa.qr_code_url}
                  alt={`QR ${viewingQrSiswa.nama_lengkap}`}
                  className="w-56 h-56 mx-auto border-2 border-slate-200 dark:border-slate-700 rounded-lg object-contain"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {viewingQrSiswa.nis} • {viewingQrSiswa.kelas?.nama_kelas || '-'}
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleDownloadQr(viewingQrSiswa)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8">
                <p className="text-slate-500 mb-4">QR Code belum tersedia.</p>
                <button
                  onClick={() => handleResetQr(viewingQrSiswa)}
                  className="btn-primary"
                >
                  Generate QR Code
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}