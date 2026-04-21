import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Calendar, Hash,
  Camera, Save, QrCode, Loader, Download,
  X, Eye, AlertCircle, GraduationCap,
  UserCircle, Home, Award, BookOpen,
  CheckCircle, Shield, Sparkles,
} from 'lucide-react'
import { siswaApi } from '../../services/siswaService'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal'
import QrCard from '../../components/QrCard'
import { BadgeOverlay, BADGE_POOL, RARITY_CFG } from '../../components/GachaHarian'

const iv = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } } }
const cv = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }

const inputCls = 'w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all'

const TABS = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'akademik', label: 'Akademik', icon: GraduationCap },
  { id: 'qr', label: 'QR Code', icon: QrCode },
]

export default function SiswaProfil() {
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({})
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrImage, setQrImage] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [activeTab, setActiveTab] = useState('profil')
  const [activeBadge, setActiveBadge] = useState(null)
  const [ownedBadges, setOwnedBadges] = useState([])
  const { user, updateUser } = useAuthStore()

  useEffect(() => { fetchProfil(); fetchGacha() }, [])

  const fetchGacha = async () => {
    try {
      const res = await siswaApi.getGachaStatus()
      setActiveBadge(res.data.active_badge)
      setOwnedBadges(res.data.badges || [])
    } catch { /* silent */ }
  }

  const fetchProfil = async () => {
    try {
      const res = await siswaApi.getProfil()
      const d = res.data.data
      setProfil(d); setFormData(d)
      updateUser({ ...user, siswa: d, foto: d.foto })
    } catch { toast.error('Gagal memuat profil') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const dataRes = await siswaApi.updateProfil({ no_hp: formData.no_hp, tanggal_lahir: formData.tanggal_lahir, alamat: formData.alamat })
      if (selectedFile) {
        const fd = new FormData(); fd.append('foto', selectedFile)
        const fotoRes = await siswaApi.updateFoto(fd)
        updateUser({ ...user, siswa: fotoRes.data.data, foto: fotoRes.data.data.foto })
      } else {
        updateUser({ ...user, siswa: dataRes.data.data, foto: dataRes.data.data.foto })
      }
      toast.success('Profil berhasil diperbarui')
      setEditMode(false); setSelectedFile(null); setPreviewUrl(null)
      fetchProfil()
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal memperbarui profil') }
    finally { setSaving(false) }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Maks 2MB'); return }
    if (!file.type.startsWith('image/')) { toast.error('Harus gambar'); return }
    setSelectedFile(file)
    const r = new FileReader(); r.onloadend = () => setPreviewUrl(r.result); r.readAsDataURL(file)
  }

  const handleViewQr = async () => {
    if (profil?.qr_code_url) { setQrImage(profil.qr_code_url); setShowQrModal(true); return }
    setQrLoading(true)
    const t = toast.loading('Memuat QR Code...')
    try {
      const res = await siswaApi.downloadQrCode()
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'image/svg+xml' })
      setQrImage(URL.createObjectURL(blob)); setShowQrModal(true)
      toast.dismiss(t)
    } catch { toast.dismiss(t); toast.error('Gagal memuat QR Code') }
    finally { setQrLoading(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-violet-500 rounded-full animate-spin" />
        <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap">Memuat...</p>
      </div>
    </div>
  )

  const pct = profil?.persentase_kehadiran || 0
  const avatar = previewUrl || profil?.foto_url
  const initial = (profil?.nama_lengkap || 'S').charAt(0).toUpperCase()

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">

      {/* ── HERO CARD ── */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        className="relative overflow-hidden rounded-2xl shadow-xl"
        style={{ background: 'linear-gradient(135deg, #3b0764 0%, #4c1d95 40%, #5b21b6 80%, #6d28d9 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-violet-400/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 left-1/4 w-40 h-40 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-4 ring-white/20 overflow-hidden bg-violet-700/50 shadow-xl">
                {avatar
                  ? <img src={avatar} alt={profil?.nama_lengkap} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white">{initial}</div>}
              </div>
              {/* Badge overlay */}
              {activeBadge && !editMode && <BadgeOverlay badgeId={activeBadge} badges={ownedBadges} size="lg" />}
              {editMode && (
                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-500 hover:bg-violet-400 rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-all">
                  <Camera size={13} className="text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{profil?.nama_lengkap}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white/80 text-[10px] font-semibold">
                  <Shield size={9} /> Siswa
                </span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-white/60 mb-3">
                <span className="flex items-center gap-1"><Hash size={10} /> {profil?.nis || '-'}</span>
                <span className="flex items-center gap-1"><GraduationCap size={10} /> {profil?.kelas?.nama_kelas || '-'}</span>
                <span className="flex items-center gap-1"><Mail size={10} /> {user?.email || '-'}</span>
              </div>
              {/* Kehadiran bar */}
              <div className="flex items-center gap-2 max-w-xs mx-auto sm:mx-0">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1, delay:0.3 }}
                    className="h-full bg-gradient-to-r from-violet-300 to-indigo-300 rounded-full" />
                </div>
                <span className="text-xs font-bold text-white/80 tabular-nums">{pct}%</span>
                <span className="text-[10px] text-white/40">hadir</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!editMode ? (
                <button onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-all">
                  <Camera size={13} /> Edit
                </button>
              ) : (
                <>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-violet-700 text-xs font-bold hover:bg-violet-50 transition-all disabled:opacity-60 shadow">
                    {saving ? <Loader size={13} className="animate-spin" /> : <Save size={13} />}
                    {saving ? 'Simpan...' : 'Simpan'}
                  </button>
                  <button onClick={() => { setEditMode(false); setSelectedFile(null); setPreviewUrl(null) }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all">
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10">
            {[
              { label: 'Hadir', val: profil?.total_hadir || 0, color: 'text-emerald-300' },
              { label: 'Terlambat', val: profil?.total_terlambat || 0, color: 'text-amber-300' },
              { label: 'Izin', val: profil?.total_izin || 0, color: 'text-sky-300' },
              { label: 'Alpha', val: profil?.total_alpha || 0, color: 'text-rose-300' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-lg sm:text-xl font-black tabular-nums ${s.color}`}>{s.val}</p>
                <p className="text-[10px] text-white/40 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Badge row */}
          {ownedBadges.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wide mb-2">Badge Koleksi</p>
              <div className="flex flex-wrap gap-2">
                {ownedBadges.map(badge => {
                  const cfg = RARITY_CFG[badge.rarity] || RARITY_CFG.common
                  const isActive = activeBadge === badge.id
                  return (
                    <button
                      key={badge.id}
                      onClick={async () => {
                        try {
                          if (isActive) {
                            await siswaApi.unequipBadge()
                            setActiveBadge(null)
                            toast.success('Badge dilepas')
                          } else {
                            await siswaApi.equipBadge(badge.id)
                            setActiveBadge(badge.id)
                            toast.success('Badge terpasang!')
                          }
                        } catch { toast.error('Gagal') }
                      }}
                      title={`${badge.name} · ${cfg.label}${isActive ? ' (aktif)' : ''}`}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-white/25 border-white/40 text-white'
                          : 'bg-white/10 border-white/15 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <span>{badge.emoji}</span>
                      <span className="hidden sm:inline">{badge.name}</span>
                      <span className={`text-[9px] font-bold ${cfg.text}`}>{cfg.label}</span>
                      {isActive && <span className="text-[9px] text-emerald-300">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div className="flex gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
        {TABS.map(t => {
          const Icon = t.icon; const active = activeTab === t.id
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${active ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
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
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <User size={14} className="text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Data Pribadi</p>
              {!editMode && (
                <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1">
                  <CheckCircle size={10} className="text-emerald-400" /> Tersimpan
                </span>
              )}
            </div>
            <div className="p-5">
              {editMode ? (
                <motion.div initial="hidden" animate="visible" variants={cv}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div variants={iv}>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      <Phone size={10} className="inline mr-1" /> No. HP
                    </label>
                    <input type="text" value={formData.no_hp || ''} onChange={e => setFormData(p => ({...p, no_hp: e.target.value}))}
                      placeholder="08123456789" className={inputCls} />
                  </motion.div>
                  <motion.div variants={iv}>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      <Calendar size={10} className="inline mr-1" /> Tanggal Lahir
                    </label>
                    <input type="date" value={formData.tanggal_lahir || ''} onChange={e => setFormData(p => ({...p, tanggal_lahir: e.target.value}))}
                      className={inputCls} />
                  </motion.div>
                  <motion.div variants={iv} className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      <MapPin size={10} className="inline mr-1" /> Alamat
                    </label>
                    <textarea value={formData.alamat || ''} onChange={e => setFormData(p => ({...p, alamat: e.target.value}))}
                      rows={3} placeholder="Alamat lengkap" className={`${inputCls} resize-none`} />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div initial="hidden" animate="visible" variants={cv}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { icon: User, label: 'Nama Lengkap', val: profil?.nama_lengkap },
                    { icon: Hash, label: 'NIS', val: profil?.nis || '-' },
                    { icon: Hash, label: 'NISN', val: profil?.nisn || '-' },
                    { icon: Calendar, label: 'Tanggal Lahir', val: profil?.tanggal_lahir ? new Date(profil.tanggal_lahir).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '-' },
                    { icon: Phone, label: 'No. HP', val: profil?.no_hp || '-' },
                    { icon: Mail, label: 'Email', val: user?.email || '-' },
                    { icon: UserCircle, label: 'Nama Orang Tua', val: profil?.nama_ortu || '-' },
                    { icon: MapPin, label: 'Alamat', val: profil?.alamat || '-', full: true },
                  ].map(item => (
                    <motion.div key={item.label} variants={iv} className={`flex items-start gap-3 ${item.full ? 'sm:col-span-2' : ''}`}>
                      <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon size={13} className="text-violet-500 dark:text-violet-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-0.5 break-words">{item.val || '-'}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TAB AKADEMIK ── */}
        {activeTab === 'akademik' && (
          <motion.div key="akademik" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}
            transition={{ duration:0.18 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kelas */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                    <GraduationCap size={14} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Data Kelas</p>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'Kelas', val: profil?.kelas?.nama_kelas },
                    { label: 'Jurusan', val: profil?.kelas?.jurusan },
                    { label: 'Tingkat', val: profil?.kelas?.tingkat ? `Kelas ${profil.kelas.tingkat}` : '-' },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{item.val || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Statistik */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Award size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Statistik Kehadiran</p>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-xs font-semibold text-slate-500">Persentase Hadir</p>
                      <span className="text-sm font-black text-violet-600">{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1 }}
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
                    </div>
                  </div>
                  {[
                    { label: 'Total Hadir', val: profil?.total_hadir || 0, color: 'text-emerald-600' },
                    { label: 'Terlambat', val: profil?.total_terlambat || 0, color: 'text-amber-600' },
                    { label: 'Alpha', val: profil?.total_alpha || 0, color: 'text-rose-600' },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between items-center">
                      <p className="text-xs text-slate-500">{s.label}</p>
                      <p className={`text-sm font-bold tabular-nums ${s.color}`}>{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40">
              <BookOpen size={14} className="text-violet-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-violet-700 dark:text-violet-300">
                Untuk perubahan data seperti NIS, NISN, kelas, dan email — hubungi administrator sekolah.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── TAB QR CODE ── */}
        {activeTab === 'qr' && (
          <motion.div key="qr" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}
            transition={{ duration:0.18 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <QrCode size={14} className="text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">QR Code Absensi</p>
            </div>
            <div className="p-6 flex flex-col items-center gap-5">
              {/* QR preview box — tampilkan QR langsung kalau sudah ada */}
              <div className="relative">
                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center overflow-hidden">
                  {qrImage ? (
                    <img src={qrImage} alt="QR Code" className="w-full h-full object-contain p-3" />
                  ) : profil?.qr_code_url ? (
                    <img src={profil.qr_code_url} alt="QR Code" className="w-full h-full object-contain p-3" />
                  ) : (
                    <QrCode size={80} className="text-violet-300 dark:text-violet-700" />
                  )}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center shadow">
                  <Sparkles size={11} className="text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 dark:text-slate-100">{profil?.nama_lengkap}</p>
                <p className="text-xs text-slate-400 mt-0.5">NIS: {profil?.nis}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button onClick={handleViewQr} disabled={qrLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-300 text-sm font-semibold hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all">
                  {qrLoading ? <Loader size={14} className="animate-spin" /> : <Eye size={14} />} Lihat &amp; Download
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
      <Modal isOpen={showQrModal} onClose={() => { setShowQrModal(false); if (qrImage?.startsWith('blob:')) URL.revokeObjectURL(qrImage); setQrImage(null) }}
        title="Kartu QR Absensi" size="sm">
        <div className="p-4">
          {qrImage ? (
            <QrCard
              qrUrl={qrImage}
              nama={profil?.nama_lengkap}
              identifier={profil?.nis}
              labelId="NIS"
              role="siswa"
              kelas={profil?.kelas?.nama_kelas}
              foto={profil?.foto_url}
              onClose={() => { setShowQrModal(false); if (qrImage?.startsWith('blob:')) URL.revokeObjectURL(qrImage); setQrImage(null) }}
            />
          ) : (
            <div className="py-10 text-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Memuat QR Code...</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
