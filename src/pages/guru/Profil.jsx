import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Calendar, Hash,
  Camera, Save, QrCode, Loader, Download,
  X, Eye, AlertCircle, BookOpen, School,
  Award, Briefcase, Users, Shield, Sparkles,
} from 'lucide-react'
import { guruApi } from '../../services/guruService'
import { useAuthStore } from '../../stores/authStore'
import { usePengaturanStore } from '../../stores/pengaturanStore'
import { publicApi } from '../../services/publicApi'
import toast from 'react-hot-toast'
import QrCard from '../../components/QrCard'

const iv = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } } }
const cv = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const inputCls = 'w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
const TABS = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'mapel', label: 'Mapel', icon: BookOpen },
  { id: 'kelas', label: 'Kelas', icon: School },
  { id: 'qr', label: 'QR Code', icon: QrCode },
]

export default function GuruProfil() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ nama_lengkap:'', jenis_kelamin:'', tanggal_lahir:'', alamat:'', no_hp:'' })
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profil')
  const [downloading, setDownloading] = useState(false)
  const [qrImage, setQrImage] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [logoForQr, setLogoForQr] = useState(null)
  const [fotoForQr, setFotoForQr] = useState(null)
  const { user, updateUser } = useAuthStore()
  const { pengaturan } = usePengaturanStore()

  useEffect(() => {
    fetchProfile()
    return () => { if (fotoPreview?.startsWith('blob:')) URL.revokeObjectURL(fotoPreview) }
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await guruApi.getProfile()
      const d = res.data.data
      setProfile(d)
      setFormData({ nama_lengkap: d.nama_lengkap||'', jenis_kelamin: d.jenis_kelamin||'', tanggal_lahir: d.tanggal_lahir||'', alamat: d.alamat||'', no_hp: d.no_hp||'' })
      setFotoPreview(d.foto)
      updateUser({ ...user, guru: d, foto: d.foto })
    } catch { toast.error('Gagal memuat profil') }
    finally { setLoading(false) }
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Maks 2MB'); return }
    if (!file.type.startsWith('image/')) { toast.error('Harus gambar'); return }
    if (fotoPreview?.startsWith('blob:')) URL.revokeObjectURL(fotoPreview)
    setFotoFile(file); setFotoPreview(URL.createObjectURL(file))
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({ nama_lengkap: profile.nama_lengkap||'', jenis_kelamin: profile.jenis_kelamin||'', tanggal_lahir: profile.tanggal_lahir||'', alamat: profile.alamat||'', no_hp: profile.no_hp||'' })
    if (fotoPreview?.startsWith('blob:')) URL.revokeObjectURL(fotoPreview)
    setFotoFile(null); setFotoPreview(profile.foto)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([k,v]) => fd.append(k, v))
      if (fotoFile) fd.append('foto', fotoFile)
      const res = await guruApi.updateProfile(fd)
      const d = res.data.data
      updateUser({ ...user, guru: d, foto: d.foto })
      toast.success('Profil berhasil diperbarui')
      setIsEditing(false); setFotoFile(null)
      fetchProfile()
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal memperbarui profil') }
    finally { setSaving(false) }
  }

  const handleViewQr = async () => {
    setQrLoading(true)
    const t = toast.loading('Memuat QR Code...')
    try {
      const [qrRes, logoRes, fotoRes] = await Promise.allSettled([
        guruApi.downloadQrCode(),
        publicApi.downloadLogo(),
        profile?.foto ? guruApi.downloadFoto() : Promise.reject('no foto'),
      ])

      let qrData = null
      if (qrRes.status === 'fulfilled') {
        const blob = new Blob([qrRes.value.data], { type: qrRes.value.headers['content-type'] || 'image/png' })
        qrData = await new Promise(r => { const fr = new FileReader(); fr.onloadend = () => r(fr.result); fr.readAsDataURL(blob) })
      }

      let logoData = null
      if (logoRes.status === 'fulfilled') {
        const blob = new Blob([logoRes.value.data], { type: logoRes.value.headers['content-type'] || 'image/png' })
        logoData = await new Promise(r => { const fr = new FileReader(); fr.onloadend = () => r(fr.result); fr.readAsDataURL(blob) })
      }

      let fotoData = null
      if (fotoRes.status === 'fulfilled') {
        const blob = new Blob([fotoRes.value.data], { type: fotoRes.value.headers['content-type'] || 'image/jpeg' })
        fotoData = await new Promise(r => { const fr = new FileReader(); fr.onloadend = () => r(fr.result); fr.readAsDataURL(blob) })
      }

      if (!qrData) { toast.dismiss(t); toast.error('Gagal memuat QR Code'); setQrLoading(false); return }

      setQrImage(qrData)
      setLogoForQr(logoData)
      setFotoForQr(fotoData)
      setShowQrModal(true)
      toast.dismiss(t)
    } catch { toast.error('Gagal memuat QR Code') }
    finally { setQrLoading(false) }
  }

  const handleDownloadQr = async () => {
    setDownloading(true)
    const t = toast.loading('Menyiapkan QR Code...')
    try {
      const res = await guruApi.downloadQrCode()
      const ct = res.headers['content-type'] || 'image/svg+xml'
      const ext = ct.includes('svg') ? 'svg' : 'png'
      const blob = new Blob([res.data], { type: ct })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `QR-Guru-${profile?.nip || 'guru'}.${ext}`
      document.body.appendChild(a); a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
      toast.dismiss(t); toast.success('QR Code berhasil diunduh')
    } catch (e) {
      toast.dismiss(t)
      const s = e.response?.status
      toast.error(s === 404 ? 'QR Code belum tersedia' : s === 401 ? 'Sesi berakhir' : 'Gagal mengunduh QR Code')
    } finally { setDownloading(false) }
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '-'

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
        <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap">Memuat...</p>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
      <User size={32} className="mx-auto text-slate-300 mb-3" />
      <p className="text-sm text-slate-500">Data profil tidak ditemukan</p>
    </div>
  )

  const initial = (profile.nama_lengkap || 'G').charAt(0).toUpperCase()

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">

      {/* ── HERO CARD ── */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        className="relative overflow-hidden rounded-2xl shadow-xl"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 35%, #0f766e 70%, #0e7490 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 left-1/4 w-40 h-40 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-4 ring-white/20 overflow-hidden bg-emerald-700/50 shadow-xl">
                {fotoPreview
                  ? <img src={fotoPreview} alt={profile.nama_lengkap} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white">{initial}</div>}
              </div>
              {isEditing && (
                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 hover:bg-emerald-400 rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-all">
                  <Camera size={13} className="text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
                </label>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{profile.nama_lengkap}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white/80 text-[10px] font-semibold">
                  <Shield size={9} /> Guru
                </span>
                {profile.is_wali_kelas && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-semibold">
                    <Award size={9} /> Wali Kelas
                  </span>
                )}
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-white/60 mb-3">
                <span className="flex items-center gap-1"><Hash size={10} /> NIP: {profile.nip || '-'}</span>
                <span className="flex items-center gap-1"><Mail size={10} /> {profile.user?.email || '-'}</span>
                {profile.nuptk && <span className="flex items-center gap-1"><Hash size={10} /> NUPTK: {profile.nuptk}</span>}
              </div>
              {profile.is_wali_kelas && profile.kelas_wali && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/15 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                  <School size={11} /> Wali Kelas {profile.kelas_wali.nama_kelas}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-all">
                  <Camera size={13} /> Edit
                </button>
              ) : (
                <>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-700 text-xs font-bold hover:bg-emerald-50 transition-all disabled:opacity-60 shadow">
                    {saving ? <Loader size={13} className="animate-spin" /> : <Save size={13} />}
                    {saving ? 'Simpan...' : 'Simpan'}
                  </button>
                  <button onClick={handleCancel}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all">
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
            {[
              { label: 'Mapel Diampu', val: profile.mata_pelajaran?.length || 0, color: 'text-emerald-300' },
              { label: 'Kelas Diampu', val: profile.kelas_diampu?.length || 1, color: 'text-teal-300' },
              { label: 'Jenis Kelamin', val: profile.jenis_kelamin === 'L' ? 'L' : profile.jenis_kelamin === 'P' ? 'P' : '-', color: 'text-cyan-300' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-lg sm:text-xl font-black tabular-nums ${s.color}`}>{s.val}</p>
                <p className="text-[10px] text-white/40 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div className="flex gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
        {TABS.map(t => {
          const Icon = t.icon; const active = activeTab === t.id
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${active ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Icon size={14} /><span className="hidden xs:inline sm:inline">{t.label}</span>
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* ── TAB PROFIL ── */}
        {activeTab === 'profil' && (
          <motion.div key="profil" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}
            transition={{ duration:0.18 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <User size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Data Pribadi</p>
            </div>
            <div className="p-5">
              {isEditing ? (
                <motion.div initial="hidden" animate="visible" variants={cv}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div variants={iv}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nama Lengkap</label>
                    <input type="text" name="nama_lengkap" value={formData.nama_lengkap}
                      onChange={e => setFormData(p => ({...p, nama_lengkap: e.target.value}))}
                      className={inputCls} />
                  </motion.div>
                  <motion.div variants={iv}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Jenis Kelamin</label>
                    <select name="jenis_kelamin" value={formData.jenis_kelamin}
                      onChange={e => setFormData(p => ({...p, jenis_kelamin: e.target.value}))}
                      className={inputCls}>
                      <option value="">Pilih</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </motion.div>
                  <motion.div variants={iv}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tanggal Lahir</label>
                    <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir}
                      onChange={e => setFormData(p => ({...p, tanggal_lahir: e.target.value}))}
                      className={inputCls} />
                  </motion.div>
                  <motion.div variants={iv}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">No. HP</label>
                    <input type="text" name="no_hp" value={formData.no_hp}
                      onChange={e => setFormData(p => ({...p, no_hp: e.target.value}))}
                      placeholder="08xxxxxxxxxx" className={inputCls} />
                  </motion.div>
                  <motion.div variants={iv} className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Alamat</label>
                    <textarea name="alamat" value={formData.alamat}
                      onChange={e => setFormData(p => ({...p, alamat: e.target.value}))}
                      rows={3} placeholder="Alamat lengkap" className={`${inputCls} resize-none`} />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div initial="hidden" animate="visible" variants={cv}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { icon: User, label: 'Nama Lengkap', val: profile.nama_lengkap },
                    { icon: Hash, label: 'NIP', val: profile.nip || '-', mono: true },
                    { icon: Hash, label: 'NUPTK', val: profile.nuptk || '-', mono: true },
                    { icon: Mail, label: 'Email', val: profile.user?.email || '-' },
                    { icon: User, label: 'Jenis Kelamin', val: profile.jenis_kelamin === 'L' ? 'Laki-laki' : profile.jenis_kelamin === 'P' ? 'Perempuan' : '-' },
                    { icon: Calendar, label: 'Tanggal Lahir', val: fmt(profile.tanggal_lahir) },
                    { icon: Phone, label: 'No. HP', val: profile.no_hp || '-' },
                    { icon: MapPin, label: 'Alamat', val: profile.alamat || '-', full: true },
                  ].map(item => (
                    <motion.div key={item.label} variants={iv} className={`flex items-start gap-3 ${item.full ? 'sm:col-span-2' : ''}`}>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon size={13} className="text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{item.label}</p>
                        <p className={`text-sm font-medium text-slate-800 dark:text-slate-100 mt-0.5 break-words ${item.mono ? 'font-mono' : ''}`}>{item.val || '-'}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TAB MAPEL ── */}
        {activeTab === 'mapel' && (
          <motion.div key="mapel" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}
            transition={{ duration:0.18 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <BookOpen size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Mata Pelajaran Diampu</p>
              <span className="ml-auto text-xs font-semibold text-slate-400">{profile.mata_pelajaran?.length || 0} mapel</span>
            </div>
            <div className="p-5">
              {profile.mata_pelajaran?.length > 0 ? (
                <motion.div initial="hidden" animate="visible" variants={cv}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profile.mata_pelajaran.map((m, i) => (
                    <motion.div key={m.id} variants={iv}
                      className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 hover:shadow-md transition-shadow">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0">
                        <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{m.nama_mapel}</p>
                        <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5">{m.kode_mapel}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={24} className="text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400">Belum ada mata pelajaran yang diampu</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TAB KELAS ── */}
        {activeTab === 'kelas' && (
          <motion.div key="kelas" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}
            transition={{ duration:0.18 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <School size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Kelas Diampu</p>
              {profile.is_wali_kelas && (
                <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">Wali Kelas</span>
              )}
            </div>
            <div className="p-5">
              {profile.kelas_diampu?.length > 0 ? (
                <motion.div initial="hidden" animate="visible" variants={cv} className="space-y-3">
                  {profile.kelas_diampu.map((kelas, i) => (
                    <motion.div key={kelas.id || i} variants={iv}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0">
                        <Briefcase size={20} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{kelas.nama_kelas}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">{kelas.jurusan}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex-shrink-0">
                        <Users size={13} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{kelas.total_siswa}</span>
                        <span className="text-xs text-slate-400">siswa</span>
                      </div>
                      {profile.is_wali_kelas && profile.kelas_wali?.id === kelas.id && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">
                          <Award size={11} /> Wali
                        </span>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <School size={24} className="text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400">Belum ada kelas yang diampu</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TAB QR CODE ── */}
        {activeTab === 'qr' && (
          <motion.div key="qr" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}
            transition={{ duration:0.18 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <QrCode size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">QR Code Absensi</p>
            </div>
            <div className="p-6 flex flex-col items-center gap-5">
              {/* QR preview */}
              <div className="relative">
                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center overflow-hidden">
                  {qrImage && qrImage.startsWith('data:') ? (
                    <img src={qrImage} alt="QR Code" className="w-full h-full object-contain p-3" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <QrCode size={60} className="text-emerald-300 dark:text-emerald-700" />
                      <p className="text-xs text-slate-400">Klik Lihat untuk memuat QR</p>
                    </div>
                  )}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                  <Sparkles size={11} className="text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 dark:text-slate-100">{profile.nama_lengkap}</p>
                <p className="text-xs text-slate-400 mt-0.5">NIP: {profile.nip}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button onClick={handleViewQr} disabled={qrLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all">
                  {qrLoading ? <Loader size={14} className="animate-spin" /> : <Eye size={14} />}
                  {qrLoading ? 'Memuat...' : 'Lihat & Download ID Card'}
                </button>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 w-full max-w-xs">
                <AlertCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 dark:text-amber-300">QR Code ini unik milikmu. Jangan berikan ke orang lain — digunakan untuk absensi.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQrModal(false)}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <QrCode size={16} className="text-emerald-600" />
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">Kartu QR Absensi</p>
                </div>
                <button onClick={() => setShowQrModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
              <div className="p-4">
                {qrImage ? (
                  <QrCard
                    qrUrl={qrImage}
                    nama={profile?.nama_lengkap}
                    identifier={profile?.nip}
                    labelId="NIP"
                    role="guru"
                    foto={fotoForQr}
                    logo={logoForQr}
                    sekolah={pengaturan?.nama_sekolah}
                    onClose={() => { setShowQrModal(false); setLogoForQr(null); setFotoForQr(null) }}
                  />
                ) : (
                  <div className="py-10 text-center">
                    <Loader size={32} className="text-emerald-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Memuat QR Code...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
