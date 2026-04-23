import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Edit2, Trash2, Key, Power, RotateCcw, Archive,
  Users as UsersIcon, Mail, Shield,
  UserCircle, ChevronDown,
  UserPlus, GraduationCap, Clock,
  Users2, Filter, Camera, X
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import AdminStatCard from '../../components/AdminStatCard'
import { adminApi } from '../../services/adminService'
import { confirmDelete, showSuccess } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'

const ROLE_CFG = {
  admin: { gradient: 'from-violet-500 to-purple-600', icon: Shield,        label: 'Admin', row: 'border-l-violet-500', rowBg: 'hover:bg-violet-50 dark:hover:bg-violet-900/10' },
  guru:  { gradient: 'from-amber-400 to-orange-500',  icon: UserCircle,    label: 'Guru',  row: 'border-l-amber-500',  rowBg: 'hover:bg-amber-50 dark:hover:bg-amber-900/10' },
  siswa: { gradient: 'from-emerald-400 to-teal-500',  icon: GraduationCap, label: 'Siswa', row: 'border-l-emerald-500', rowBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10' },
}

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CFG[role] || { gradient: 'from-slate-400 to-slate-500', icon: UserCircle, label: role }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r ${cfg.gradient} text-white text-[10px] font-semibold shadow-sm`}>
      <Icon size={9}/>{cfg.label}
    </span>
  )
}

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold shadow-sm ${
    isActive ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-slate-400'}`}/>
    {isActive ? 'Aktif' : 'Nonaktif'}
  </span>
)

const UserAvatar = ({ user }) => {
  const initial = user.name?.charAt(0).toUpperCase() || '?'
  const hasPhoto = user.foto_url || user.foto
  const cfg = ROLE_CFG[user.role] || ROLE_CFG.siswa
  return (
    <div className="relative flex-shrink-0">
      {hasPhoto && (
        <img src={user.foto_url || user.foto} alt={user.name}
          className="w-9 h-9 rounded-xl object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm"
          onError={e => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex' }}/>
      )}
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-white dark:ring-slate-700 ${hasPhoto ? 'hidden' : 'flex'}`}>
        {initial}
      </div>
      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 ${user.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}/>
    </div>
  )
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showTrashed, setShowTrashed] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [stats, setStats] = useState({ total:0, admin:0, guru:0, siswa:0, active:0, inactive:0 })
  const [formData, setFormData] = useState({ name:'', email:'', password:'', password_confirmation:'', role:'siswa', is_active:true })
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)

  useEffect(() => { fetchUsers(); if (!showTrashed) fetchStats() }, [currentPage, search, showTrashed, roleFilter])

  const fetchStats = async () => {
    try { const r = await adminApi.getUserStats(); setStats(r.data.data) } catch {}
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = { page: currentPage, search, per_page: 10, ...(roleFilter !== 'all' && { role: roleFilter }) }
      const r = showTrashed ? await adminApi.getTrashedUsers(params) : await adminApi.getUsers(params)
      setUsers(Array.isArray(r.data?.data) ? r.data.data : [])
      setPagination(r.data?.pagination || null)
    } catch { toast.error('Gagal memuat data user') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password && formData.password !== formData.password_confirmation) { toast.error('Password tidak cocok'); return }
    try {
      if (editingUser) { await adminApi.updateUser(editingUser.id, formData); toast.success('User diperbarui') }
      else { await adminApi.createUser(formData); toast.success('User dibuat') }
      setIsModalOpen(false); resetForm(); setCurrentPage(1)
      setTimeout(() => { fetchUsers(); fetchStats() }, 500)
    } catch (err) { toast.error(err.response?.data?.message || 'Terjadi kesalahan') }
  }

  const handleDelete = async (user) => {
    if (await confirmDelete('Hapus user ini?', 'User akan dipindahkan ke trash')) {
      try { await adminApi.deleteUser(user.id); showSuccess('User dipindahkan ke trash'); fetchUsers(); fetchStats() }
      catch { toast.error('Gagal menghapus user') }
    }
  }

  const handleRestore = async (user) => {
    try { await adminApi.restoreUser(user.id); toast.success('User dipulihkan'); fetchUsers(); fetchStats() }
    catch { toast.error('Gagal memulihkan user') }
  }

  const handleForceDelete = async (user) => {
    if (await confirmDelete('Hapus permanen?', 'Data tidak dapat dipulihkan!')) {
      try { await adminApi.forceDeleteUser(user.id); showSuccess('User dihapus permanen'); fetchUsers(); fetchStats() }
      catch { toast.error('Gagal menghapus user') }
    }
  }

  const handleToggleActive = async (user) => {
    try { await adminApi.toggleActive(user.id); toast.success(`User ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}`); fetchUsers(); fetchStats() }
    catch { toast.error('Gagal mengubah status') }
  }

  const handleResetPassword = async (user) => {
    const pw = prompt('Password baru:'); if (!pw) return
    if (pw.length < 6) { toast.error('Minimal 6 karakter'); return }
    const cpw = prompt('Konfirmasi password:')
    if (pw !== cpw) { toast.error('Password tidak cocok'); return }
    try { await adminApi.resetPassword(user.id, { password: pw, password_confirmation: cpw }); showSuccess('Password direset') }
    catch { toast.error('Gagal reset password') }
  }

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({ name: user.name, email: user.email, password:'', password_confirmation:'', role: user.role, is_active: user.is_active })
      setFotoPreview(user.foto_url || user.foto || null)
    } else resetForm()
    setIsModalOpen(true)
  }

  const handleUploadFoto = async (file) => {
    if (!editingUser || !file) return
    try {
      setUploadingFoto(true)
      const fd = new FormData()
      fd.append('foto', file)
      const res = await adminApi.uploadFotoUser(editingUser.id, fd)
      setFotoPreview(res.data.data?.foto_url || URL.createObjectURL(file))
      toast.success('Foto berhasil diupload')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal upload foto')
    } finally {
      setUploadingFoto(false)
    }
  }

  const handleHapusFoto = async () => {
    if (!editingUser) return
    try {
      await adminApi.hapusFotoUser(editingUser.id)
      setFotoPreview(null)
      setFotoFile(null)
      toast.success('Foto dihapus')
      fetchUsers()
    } catch (err) {
      toast.error('Gagal hapus foto')
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setFormData({ name:'', email:'', password:'', password_confirmation:'', role:'siswa', is_active:true })
    setFotoFile(null)
    setFotoPreview(null)
  }

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      cell: (row) => {
        const cfg = ROLE_CFG[row.role] || ROLE_CFG.siswa
        return (
          <div className={`flex items-center gap-2.5 min-w-0 pl-1 border-l-2 ${cfg.row}`}>
            <UserAvatar user={row}/>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1">
                {row.name}
                {row.role === 'admin' && <Shield size={9} className="text-violet-500 flex-shrink-0"/>}
              </p>
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-0.5">
                <Mail size={8}/>{row.email}
              </p>
            </div>
          </div>
        )
      }
    },
    { header: 'Role', accessor: 'role', cell: (row) => <RoleBadge role={row.role}/> },
    ...(showTrashed ? [{
      header: 'Dihapus',
      accessor: 'deleted_at',
      cell: (row) => (
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Clock size={9}/>
          {row.deleted_at ? new Date(row.deleted_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) : '-'}
        </span>
      )
    }] : [
      { header: 'Status', accessor: 'is_active', cell: (row) => <StatusBadge isActive={row.is_active}/> },
      {
        header: 'Bergabung',
        accessor: 'created_at',
        cell: (row) => (
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock size={9}/>
            {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) : '-'}
          </span>
        )
      }
    ]),
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="flex items-center gap-0.5">
          {showTrashed ? (
            <>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={() => handleRestore(row)}
                className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 transition-all" title="Pulihkan">
                <RotateCcw size={12}/>
              </motion.button>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={() => handleForceDelete(row)}
                className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-all" title="Hapus Permanen">
                <Trash2 size={12}/>
              </motion.button>
            </>
          ) : (
            <>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={() => openModal(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all" title="Edit">
                <Edit2 size={12}/>
              </motion.button>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={() => handleResetPassword(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all hidden sm:block" title="Reset Password">
                <Key size={12}/>
              </motion.button>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={() => handleToggleActive(row)}
                className={`p-1.5 rounded-lg transition-all ${row.is_active
                  ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'}`}
                title={row.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                <Power size={12}/>
              </motion.button>
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={() => handleDelete(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all" title="Hapus">
                <Trash2 size={12}/>
              </motion.button>
            </>
          )}
        </div>
      )
    }
  ]

  const statsCards = [
    { label:'Total Users', value:stats.total,    icon:Users2,       color:'#6366f1', border:'border-indigo-100 dark:border-indigo-800/40',   tc:'text-indigo-600 dark:text-indigo-400',   iconBg:'bg-indigo-50 dark:bg-indigo-900/30',   delay:0,    subtitle:`${stats.active ?? 0} aktif`, sparkType:'area' },
    { label:'Admin',       value:stats.admin,    icon:Shield,       color:'#8b5cf6', border:'border-violet-100 dark:border-violet-800/40',   tc:'text-violet-600 dark:text-violet-400',   iconBg:'bg-violet-50 dark:bg-violet-900/30',   delay:0.05, sparkType:'bar' },
    { label:'Guru',        value:stats.guru,     icon:UserCircle,   color:'#f59e0b', border:'border-amber-100 dark:border-amber-800/40',     tc:'text-amber-600 dark:text-amber-400',     iconBg:'bg-amber-50 dark:bg-amber-900/30',     delay:0.1,  sparkType:'bar' },
    { label:'Siswa',       value:stats.siswa,    icon:GraduationCap,color:'#10b981', border:'border-emerald-100 dark:border-emerald-800/40', tc:'text-emerald-600 dark:text-emerald-400', iconBg:'bg-emerald-50 dark:bg-emerald-900/30', delay:0.15, subtitle:`${stats.inactive ?? 0} nonaktif`, sparkType:'area' },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">

      {/* ── PAGE HEADER ── */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <UsersIcon size={17} className="text-indigo-600 dark:text-indigo-400"/>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen User</h1>
              {showTrashed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/40 rounded-lg text-[10px] font-bold">
                  <Archive size={9}/>Trash
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {showTrashed ? 'User yang telah dihapus'
                : `${stats.total} pengguna · ${stats.active ?? 0} aktif · ${stats.inactive ?? 0} nonaktif`}
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
              className="px-3 py-1.5 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors"
              style={{ background: '#6366f1' }}>
              <UserPlus size={12}/><span className="hidden sm:inline">Tambah User</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* ── STAT CARDS ── */}
      {!showTrashed && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsCards.map(s => <AdminStatCard key={s.label} {...s}/>)}
        </div>
      )}

      {/* ── TABLE ── */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <UsersIcon size={12} className="text-indigo-500"/>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{showTrashed ? 'User Terhapus' : 'Daftar User'}</p>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-bold">
              {pagination?.total || users.length}
            </span>
          </div>
          {!showTrashed && (
            <div className="flex items-center gap-1.5">
              <Filter size={11} className="text-slate-400"/>
              {[
                { key:'all',   label:'Semua', active:'bg-slate-700 dark:bg-slate-600 text-white' },
                { key:'admin', label:'Admin', active:'bg-violet-500 text-white' },
                { key:'guru',  label:'Guru',  active:'bg-amber-500 text-white' },
                { key:'siswa', label:'Siswa', active:'bg-emerald-500 text-white' },
              ].map(f => (
                <button key={f.key}
                  onClick={() => { setRoleFilter(f.key); setCurrentPage(1) }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                    roleFilter === f.key ? f.active : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={users}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onSearch={setSearch}
            loading={loading}
            searchPlaceholder="Cari nama atau email..."
          />
        </div>
      </motion.div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
            title={
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-sm">
                  {editingUser ? <Edit2 size={14} className="text-white"/> : <UserPlus size={14} className="text-white"/>}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {editingUser ? 'Edit User' : 'Tambah User Baru'}
                  </p>
                  <p className="text-[10px] text-slate-400">{editingUser ? 'Ubah data user' : 'Isi form untuk user baru'}</p>
                </div>
              </div>
            }
            maxWidth="max-w-md"
          >
            <form onSubmit={handleSubmit} className="space-y-3 p-5">
              {/* Foto Upload */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-200 dark:ring-emerald-800"/>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700">
                      <span className="text-2xl font-black text-slate-400">{formData.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    </div>
                  )}
                  {uploadingFoto && (
                    <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Foto Profil</p>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors">
                      <Camera size={11}/>
                      {editingUser ? 'Upload' : 'Pilih'}
                      <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" className="hidden"
                        onChange={e => {
                          const file = e.target.files[0]
                          if (!file) return
                          if (file.size > 2*1024*1024) { toast.error('Foto maks 2MB'); return }
                          setFotoFile(file)
                          setFotoPreview(URL.createObjectURL(file))
                          if (editingUser) handleUploadFoto(file)
                        }}/>
                    </label>
                    {fotoPreview && editingUser && (
                      <button type="button" onClick={handleHapusFoto}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors">
                        <X size={10}/> Hapus
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">JPG, PNG · Maks 2MB</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <UserCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13}/>
                  <input type="text" required value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                    placeholder="Nama lengkap"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13}/>
                  <input type="email" required value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                    placeholder="user@example.com"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <div className="relative">
                  <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13}/>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full pl-8 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs text-slate-900 dark:text-white appearance-none transition-all">
                    <option value="admin">Admin</option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13}/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password {editingUser && <span className="text-[9px] text-slate-400 font-normal ml-1">(kosongkan jika tidak diubah)</span>}
                </label>
                <input type="password" required={!editingUser} value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  placeholder="••••••••"/>
              </div>
              {(!editingUser || formData.password) && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Konfirmasi Password</label>
                  <input type="password" required={!editingUser || !!formData.password} value={formData.password_confirmation}
                    onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                    placeholder="••••••••"/>
                </motion.div>
              )}
              <label className="flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30 cursor-pointer">
                <input type="checkbox" checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 rounded accent-emerald-500"/>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Akun aktif (dapat login)</span>
              </label>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  Batal
                </motion.button>
                <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-500/30 transition-all">
                  {editingUser ? 'Simpan' : 'Tambah User'}
                </motion.button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
