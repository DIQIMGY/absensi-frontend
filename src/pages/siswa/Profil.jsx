﻿import { useState, useEffect } from 'react'
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
import { usePengaturanStore } from '../../stores/pengaturanStore'
import { publicApi } from '../../services/publicApi'
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
  const [fotoForQr, setFotoForQr] = useState(null)
  const [logoForQr, setLogoForQr] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [coverType, setCoverType] = useState('image') // 'image' | 'video'
  const [activeTab, setActiveTab] = useState('profil')
  const [activeBadge, setActiveBadge] = useState(null)
  const [ownedBadges, setOwnedBadges] = useState([])
  const { user, updateUser } = useAuthStore()
  const { pengaturan } = usePengaturanStore()

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
      // Upload cover dulu kalau ada
      if (coverFile) {
        const fd = new FormData(); fd.append('foto_cover', coverFile)
        await siswaApi.updateFotoCover(fd)
      }
      // Update data profil
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
      setCoverFile(null); setCoverPreview(null)
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

  const handleCoverChange = (e) => {
    const file = e.target.files[0]; if (!file) return
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) { toast.error('Harus foto atau video'); return }
    if (isImage && file.size > 5 * 1024 * 1024) { toast.error('Foto maks 5MB'); return }
    if (isVideo && file.size > 50 * 1024 * 1024) { toast.error('Video maks 50MB'); return }

    if (isVideo) {
      // Validasi durasi max 30 detik
      const url = URL.createObjectURL(file)
      const vid = document.createElement('video')
      vid.preload = 'metadata'
      vid.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        if (vid.duration > 31) {
          toast.error('Video maksimal 30 detik')
          return
        }
        setCoverFile(file)
        setCoverPreview(URL.createObjectURL(file))
        setCoverType('video')
      }
      vid.src = url
    } else {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
      setCoverType('image')
    }
  }

  const handleViewQr = async () => {
    setQrLoading(true)
    const t = toast.loading('Memuat QR Code...')
    try {
      // Fetch QR, foto, dan logo paralel
      const [qrRes, fotoRes, logoRes] = await Promise.allSettled([
        siswaApi.downloadQrCode(),
        profil?.foto ? siswaApi.downloadFoto() : Promise.reject('no foto'),
        publicApi.downloadLogo(),
      ])

      // QR
      let qrData = null
      if (qrRes.status === 'fulfilled') {
        const blob = new Blob([qrRes.value.data], { type: qrRes.value.headers['content-type'] || 'image/png' })
        qrData = await new Promise(r => { const fr = new FileReader(); fr.onloadend = () => r(fr.result); fr.readAsDataURL(blob) })
      }

      // Foto
      let fotoData = null
      if (fotoRes.status === 'fulfilled') {
        const blob = new Blob([fotoRes.value.data], { type: fotoRes.value.headers['content-type'] || 'image/jpeg' })
        fotoData = await new Promise(r => { const fr = new FileReader(); fr.onloadend = () => r(fr.result); fr.readAsDataURL(blob) })
      }

      // Logo
      let logoData = null
      if (logoRes.status === 'fulfilled') {
        const blob = new Blob([logoRes.value.data], { type: logoRes.value.headers['content-type'] || 'image/png' })
        logoData = await new Promise(r => { const fr = new FileReader(); fr.onloadend = () => r(fr.result); fr.readAsDataURL(blob) })
      }

      if (!qrData) { toast.dismiss(t); toast.error('Gagal memuat QR Code'); setQrLoading(false); return }

      setQrImage(qrData)
      if (fotoData) setFotoForQr(fotoData)
      if (logoData) setLogoForQr(logoData)
      setShowQrModal(true)
      toast.dismiss(t)
    } catch { toast.error('Gagal memuat QR Code') }
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
    <div className="w-full max-w-2xl mx-auto">

      {/* â•â• COVER + AVATAR (Twitter/X style) â•â• */}

      {/* COVER + AVATAR */}
      <div className="relative">
        {/* Cover photo - bisa di-upload */}
        <div className="relative w-full aspect-video overflow-hidden rounded-t-2xl group">
          {coverPreview ? (
            coverType === 'video'
              ? <video src={coverPreview} autoPlay loop muted playsInline className="w-full h-full object-cover"/>
              : <img src={coverPreview} alt="cover" className="w-full h-full object-cover"/>
          ) : profil?.foto_cover_url ? (
            profil?.cover_type === 'video'
              ? <video src={profil.foto_cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover"/>
              : <img src={profil.foto_cover_url} alt="cover" className="w-full h-full object-cover"/>
          ) : (
            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#3b0764 0%,#4c1d95 40%,#5b21b6 70%,#6d28d9 100%)' }}>
              <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize:'18px 18px' }}/>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-violet-400/20 blur-3xl pointer-events-none"/>
              <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-indigo-300/10 blur-2xl pointer-events-none"/>
            </div>
          )}
          {editMode && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl border border-white/20 text-white text-xs font-semibold">
                <Camera size={14}/> Ubah Cover (Foto/Video ≤30 detik)
              </div>
              <input type="file" className="hidden" accept="image/*,video/mp4,video/webm,video/mov" onChange={handleCoverChange}/>
            </label>
          )}
          {/* Tombol hapus cover — muncul saat edit dan ada cover */}
          {editMode && (coverPreview || profil?.foto_cover_url) && (
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault()
                if (coverPreview) {
                  // Batal preview saja, belum tersimpan
                  setCoverFile(null); setCoverPreview(null); setCoverType('image')
                } else {
                  // Hapus dari database
                  try {
                    await siswaApi.hapusFotoCover()
                    toast.success('Cover dihapus')
                    fetchProfil()
                  } catch { toast.error('Gagal menghapus cover') }
                }
              }}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-red-600 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all border border-white/20 z-10">
              <X size={14}/>
            </button>
          )}
        </div>

        {/* Avatar overlapping cover */}
        <div className="absolute left-4 sm:left-6 -bottom-10 sm:-bottom-12">
          <div className="relative">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 overflow-hidden shadow-xl bg-violet-700 ${
              activeBadge && !editMode
                ? 'rounded-full ring-0'
                : 'rounded-2xl ring-4 ring-white dark:ring-slate-900'
            }`}>
              {avatar
                ? <img src={avatar} alt={profil?.nama_lengkap} className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-black text-white">{initial}</div>}
            </div>
            {activeBadge && !editMode && <BadgeOverlay badgeId={activeBadge} badges={ownedBadges} size="lg"/>}
            {editMode && (
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-violet-500 hover:bg-violet-400 rounded-xl flex items-center justify-center cursor-pointer shadow-lg border-2 border-white dark:border-slate-900 transition-all">
                <Camera size={13} className="text-white"/>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange}/>
              </label>
            )}
          </div>
        </div>

        {/* Edit / Save / Cancel */}
        <div className="absolute right-4 sm:right-6 -bottom-10 sm:-bottom-12 flex items-center gap-2">
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all bg-white dark:bg-slate-900 shadow-sm">
              <Camera size={13}/> Edit Profil
            </button>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-violet-500 hover:bg-violet-600 text-white text-xs font-bold transition-all disabled:opacity-60 shadow-lg shadow-violet-500/30">
                {saving ? <Loader size={13} className="animate-spin"/> : <Save size={13}/>}
                {saving ? 'Simpan...' : 'Simpan'}
              </button>
              <button onClick={() => { setEditMode(false); setSelectedFile(null); setPreviewUrl(null); setCoverFile(null); setCoverPreview(null); setCoverType('image') }} className="p-2 rounded-full border-2 border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all bg-white dark:bg-slate-900">
                <X size={14}/>
              </button>
            </>
          )}
        </div>
      </div>

      {/* PROFILE INFO */}
      <div className="bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-700/60 px-4 sm:px-6 pt-14 sm:pt-16 pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">{profil?.nama_lengkap}</h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-[10px] font-bold border border-violet-200 dark:border-violet-800/40">
            <Shield size={9}/> Siswa
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1"><Hash size={10}/>{profil?.nis||'-'}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="flex items-center gap-1"><GraduationCap size={10}/>{profil?.kelas?.nama_kelas||'-'}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="flex items-center gap-1"><Mail size={10}/>{user?.email||'-'}</span>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tingkat Kehadiran</span>
            <span className="text-sm font-black text-violet-600 dark:text-violet-400">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1.2,delay:0.3,ease:'easeOut'}}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"/>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label:'Hadir',     val: profil?.total_hadir||0,     bg:'bg-emerald-50 dark:bg-emerald-900/20', text:'text-emerald-600 dark:text-emerald-400', border:'border-emerald-100 dark:border-emerald-800/40' },
            { label:'Terlambat', val: profil?.total_terlambat||0, bg:'bg-amber-50 dark:bg-amber-900/20',   text:'text-amber-600 dark:text-amber-400',   border:'border-amber-100 dark:border-amber-800/40' },
            { label:'Izin',      val: profil?.total_izin||0,      bg:'bg-sky-50 dark:bg-sky-900/20',       text:'text-sky-600 dark:text-sky-400',       border:'border-sky-100 dark:border-sky-800/40' },
            { label:'Alpha',     val: profil?.total_alpha||0,     bg:'bg-rose-50 dark:bg-rose-900/20',     text:'text-rose-600 dark:text-rose-400',     border:'border-rose-100 dark:border-rose-800/40' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-2.5 sm:p-3 text-center`}>
              <p className={`text-lg sm:text-xl font-black tabular-nums ${s.text}`}>{s.val}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        {ownedBadges.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Badge Koleksi</p>
            <div className="flex flex-wrap gap-1.5">
              {ownedBadges.map(badge => {
                const cfg = RARITY_CFG[badge.rarity] || RARITY_CFG.common
                const isActive = activeBadge === badge.id
                return (
                  <button key={badge.id}
                    onClick={async () => {
                      try {
                        if (isActive) { await siswaApi.unequipBadge(); setActiveBadge(null); toast.success('Badge dilepas') }
                        else { await siswaApi.equipBadge(badge.id); setActiveBadge(badge.id); toast.success('Badge terpasang!') }
                      } catch { toast.error('Gagal') }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isActive ? 'bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 shadow-sm'
                               : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                    }`}>
                    <span>{badge.emoji}</span>
                    <span className="hidden sm:inline">{badge.name}</span>
                    <span className={`text-[9px] font-bold ${cfg.text}`}>{cfg.label}</span>
                    {isActive && <span className="text-[9px] text-emerald-500">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-700/60 overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map(t => {
            const Icon = t.icon; const active = activeTab === t.id
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 sm:px-7 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  active ? 'border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-900/10'
                         : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}>
                <Icon size={14}/>{t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-700/60 rounded-b-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'profil' && (
            <motion.div key="profil" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.15}}>
              <div className="p-4 sm:p-6">
                {editMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">No. HP</label>
                      <input type="text" value={formData.no_hp||''} onChange={e=>setFormData(p=>({...p,no_hp:e.target.value}))} placeholder="08123456789" className={inputCls}/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Tanggal Lahir</label>
                      <input type="date" value={formData.tanggal_lahir||''} onChange={e=>setFormData(p=>({...p,tanggal_lahir:e.target.value}))} className={inputCls}/>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Alamat</label>
                      <textarea value={formData.alamat||''} onChange={e=>setFormData(p=>({...p,alamat:e.target.value}))} rows={3} placeholder="Alamat lengkap" className={`${inputCls} resize-none`}/>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon:User,       label:'Nama Lengkap',   val: profil?.nama_lengkap },
                      { icon:Hash,       label:'NIS',            val: profil?.nis||'-' },
                      { icon:Hash,       label:'NISN',           val: profil?.nisn||'-' },
                      { icon:Calendar,   label:'Tanggal Lahir',  val: profil?.tanggal_lahir ? new Date(profil.tanggal_lahir).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '-' },
                      { icon:Phone,      label:'No. HP',         val: profil?.no_hp||'-' },
                      { icon:Mail,       label:'Email',          val: user?.email||'-' },
                      { icon:UserCircle, label:'Nama Orang Tua', val: profil?.nama_ortu||'-' },
                      { icon:MapPin,     label:'Alamat',         val: profil?.alamat||'-', full: true },
                    ].map(item => (
                      <div key={item.label} className={`flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 ${item.full ? 'sm:col-span-2' : ''}`}>
                        <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                          <item.icon size={13} className="text-violet-500 dark:text-violet-400"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5 break-words">{item.val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {activeTab === 'akademik' && (
            <motion.div key="akademik" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.15}}>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label:'Kelas',   val: profil?.kelas?.nama_kelas, icon: GraduationCap },
                    { label:'Jurusan', val: profil?.kelas?.jurusan,    icon: BookOpen },
                    { label:'Tingkat', val: profil?.kelas?.tingkat ? `Kelas ${profil.kelas.tingkat}` : '-', icon: Award },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0">
                        <item.icon size={16} className="text-violet-500 dark:text-violet-400"/>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{item.val||'-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800/40">
                  <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Award size={12}/> Statistik Kehadiran</p>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500">Persentase Hadir</span>
                      <span className="text-sm font-black text-violet-600 dark:text-violet-400">{pct}%</span>
                    </div>
                    <div className="h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1.2}}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label:'Hadir',      val: profil?.total_hadir||0,     color:'text-emerald-600 dark:text-emerald-400' },
                      { label:'Terlambat',  val: profil?.total_terlambat||0, color:'text-amber-600 dark:text-amber-400' },
                      { label:'Izin/Sakit', val: profil?.total_izin||0,      color:'text-sky-600 dark:text-sky-400' },
                      { label:'Alpha',      val: profil?.total_alpha||0,     color:'text-rose-600 dark:text-rose-400' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-2 bg-white/60 dark:bg-slate-800/60 rounded-xl">
                        <p className={`text-lg font-black tabular-nums ${s.color}`}>{s.val}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                  <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-xs text-amber-700 dark:text-amber-300">Untuk perubahan NIS, NISN, kelas, dan email — hubungi administrator sekolah.</p>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'qr' && (
            <motion.div key="qr" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.15}}>
              <div className="p-6 flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center overflow-hidden shadow-inner">
                    {qrImage ? <img src={qrImage} alt="QR" className="w-full h-full object-contain p-3"/>
                      : profil?.qr_code_url ? <img src={profil.qr_code_url} alt="QR" className="w-full h-full object-contain p-3"/>
                      : <QrCode size={80} className="text-violet-300 dark:text-violet-700"/>}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles size={12} className="text-white"/>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-800 dark:text-slate-100 text-base">{profil?.nama_lengkap}</p>
                  <p className="text-xs text-slate-400 mt-0.5">NIS: {profil?.nis}</p>
                </div>
                <button onClick={handleViewQr} disabled={qrLoading}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white text-sm font-bold shadow-lg shadow-violet-500/25 transition-all w-full max-w-xs disabled:opacity-60">
                  {qrLoading ? <Loader size={14} className="animate-spin"/> : <Eye size={14}/>}
                  {qrLoading ? 'Memuat...' : 'Lihat & Download ID Card'}
                </button>
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 w-full max-w-xs">
                  <AlertCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">QR Code ini unik milikmu. Jangan berikan ke orang lain.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal isOpen={showQrModal} onClose={() => { setShowQrModal(false); if(qrImage?.startsWith('blob:')) URL.revokeObjectURL(qrImage); setQrImage(null) }}
        title="Kartu QR Absensi" size="sm">
        <div className="p-4">
          {qrImage ? (
            <QrCard qrUrl={qrImage} nama={profil?.nama_lengkap} identifier={profil?.nis} labelId="NIS" role="siswa"
              kelas={profil?.kelas?.nama_kelas} foto={fotoForQr} logo={logoForQr} sekolah={pengaturan?.nama_sekolah}
              onClose={() => { setShowQrModal(false); setQrImage(null); setFotoForQr(null); setLogoForQr(null) }}/>
          ) : (
            <div className="py-10 text-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin mx-auto mb-3"/>
              <p className="text-sm text-slate-400">Memuat QR Code...</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}