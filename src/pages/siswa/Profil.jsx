import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Calendar, Hash,
  Camera, Save, QrCode, Loader, Download,
  X, Eye, AlertCircle, GraduationCap,
  UserCircle, Home, Award, BookOpen,
  CheckCircle, Shield, Sparkles, Lock, Send, MessageSquare, Music, Disc,
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

// Format detik → "23j 59m" atau "59m 30d"
function formatSisaBorder(detik) {
  if (!detik || detik <= 0) return null
  const h = Math.floor(detik / 3600)
  const m = Math.floor((detik % 3600) / 60)
  const s = detik % 60
  if (h > 0) return `${h}j ${m}m lagi`
  if (m > 0) return `${m}m ${s}d lagi`
  return `${s}d lagi`
}

const TABS = [
  { id: 'profil',   label: 'Profil',   icon: User },
  { id: 'akademik', label: 'Akademik', icon: GraduationCap },
  { id: 'qr',       label: 'QR Code',  icon: QrCode },
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
  const [showBorderModal, setShowBorderModal] = useState(false)
  const [showKoleksiModal, setShowKoleksiModal] = useState(false)
  const [borderWindow, setBorderWindow] = useState(null)
  const [borderSisaDetik, setBorderSisaDetik] = useState(0)
  const [windowPickedBadgeId, setWindowPickedBadgeId] = useState(null)
  const [windowBadgeIds, setWindowBadgeIds] = useState([])
  const [permanentBadges, setPermanentBadges] = useState([])
  // Pesan Dispen
  const [showPesanModal, setShowPesanModal] = useState(false)
  // Musik Favorit
  const [musikPlaying, setMusikPlaying] = useState(false)
  const [musikForm, setMusikForm] = useState({ nama: '', artis: '' })
  const [musikFotoFile, setMusikFotoFile] = useState(null)
  const [musikFotoPreview, setMusikFotoPreview] = useState(null)
  const [musikAudioFile, setMusikAudioFile] = useState(null)
  const [musikAudioName, setMusikAudioName] = useState('')
  const [musikSaving, setMusikSaving] = useState(false)
  const [showMusikEdit, setShowMusikEdit] = useState(false)
  const musikAudioRef = useRef(null)
  const [guruList, setGuruList] = useState([])
  const [pesanForm, setPesanForm] = useState({ guru_id: '', judul: '', pesan: '' })
  const [pesanFoto, setPesanFoto] = useState(null)
  const [pesanFotoPreview, setPesanFotoPreview] = useState(null)
  const [pesanSending, setPesanSending] = useState(false)
  const [riwayatPesan, setRiwayatPesan] = useState([])
  const [pesanTab, setPesanTab] = useState('kirim') // 'kirim' | 'riwayat'
  const { user, updateUser } = useAuthStore()
  const { pengaturan } = usePengaturanStore()

  useEffect(() => { fetchProfil(); fetchGacha() }, [])

  const fetchGacha = async () => {
    try {
      const res = await siswaApi.getGachaStatus()
      setActiveBadge(res.data.active_badge)
      setOwnedBadges(res.data.badges || [])
      setPermanentBadges(res.data.permanent_badges || [])
    } catch { /* silent */ }
  }

  // Broadcast perubahan active badge ke layout
  const updateActiveBadge = (badgeId) => {
    setActiveBadge(badgeId)
    window.dispatchEvent(new CustomEvent('badge-changed', { detail: { activeBadge: badgeId } }))
  }

  const fetchGuruList = async () => {
    try {
      const res = await siswaApi.getPesanDispenGurus()
      setGuruList(res.data.data || [])
    } catch { /* silent */ }
  }

  const fetchRiwayatPesan = async () => {
    try {
      const res = await siswaApi.getPesanDispen()
      setRiwayatPesan(res.data.data || [])
    } catch { /* silent */ }
  }

  const handleOpenPesan = () => {
    setShowPesanModal(true)
    setPesanTab('kirim')
    if (guruList.length === 0) fetchGuruList()
    fetchRiwayatPesan()
  }

  const handleKirimPesan = async () => {
    if (!pesanForm.guru_id) { toast.error('Pilih guru terlebih dahulu'); return }
    if (!pesanForm.judul.trim()) { toast.error('Judul tidak boleh kosong'); return }
    if (!pesanForm.pesan.trim()) { toast.error('Pesan tidak boleh kosong'); return }
    setPesanSending(true)
    try {
      const fd = new FormData()
      fd.append('guru_id', pesanForm.guru_id)
      fd.append('judul', pesanForm.judul)
      fd.append('pesan', pesanForm.pesan)
      if (pesanFoto) fd.append('foto_bukti', pesanFoto)
      await siswaApi.kirimPesanDispen(fd)
      toast.success('Pesan berhasil dikirim ke guru!')
      setPesanForm({ guru_id: '', judul: '', pesan: '' })
      setPesanFoto(null); setPesanFotoPreview(null)
      setPesanTab('riwayat')
      fetchRiwayatPesan()
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal mengirim pesan') }
    finally { setPesanSending(false) }
  }

  // ── MUSIK FAVORIT ──
  const handleMusikPlay = () => {
    if (!musikAudioRef.current) return
    if (musikPlaying) {
      musikAudioRef.current.pause()
      setMusikPlaying(false)
    } else {
      musikAudioRef.current.play()
      setMusikPlaying(true)
    }
  }

  const handleSaveMusik = async () => {
    setMusikSaving(true)
    try {
      const fd = new FormData()
      fd.append('musik_nama', musikForm.nama)
      fd.append('musik_artis', musikForm.artis)
      if (musikFotoFile) fd.append('musik_foto', musikFotoFile)
      if (musikAudioFile) fd.append('musik_audio', musikAudioFile)
      await siswaApi.updateMusik(fd)
      toast.success('Musik favorit disimpan!')
      setShowMusikEdit(false)
      fetchProfil()
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal menyimpan') }
    finally { setMusikSaving(false) }
  }

  const handleHapusMusik = async () => {
    try {
      await siswaApi.hapusMusik()
      toast.success('Musik favorit dihapus')
      setShowMusikEdit(false)
      setMusikPlaying(false)
      fetchProfil()
    } catch { toast.error('Gagal menghapus') }
  }

  // Preload gambar border yang dimiliki + aktif saat modal dibuka
  const handleOpenBorderModal = () => {
    setShowBorderModal(true)
    const toPreload = [
      ...ownedBadges.map(b => BADGE_POOL.find(p => p.id === b.id)?.borderImg).filter(Boolean),
      ...windowBadgeIds.map(id => BADGE_POOL.find(p => p.id === id)?.borderImg).filter(Boolean),
      ...permanentBadges.map(id => BADGE_POOL.find(p => p.id === id)?.borderImg).filter(Boolean),
      activeBadge ? BADGE_POOL.find(p => p.id === activeBadge)?.borderImg : null,
    ].filter(Boolean)
    toPreload.forEach(src => { const img = new Image(); img.src = src })
  }
  const fetchBorderWindow = async () => {
    try {
      const res = await siswaApi.getBorderWindowStatus()
      setBorderWindow(res.data)
      if (res.data.active_badge !== undefined) setActiveBadge(res.data.active_badge)
      setBorderSisaDetik(res.data.border_sisa_detik || 0)
      // Simpan semua window badges aktif
      const wBadges = res.data.window_badges || []
      setWindowBadgeIds(wBadges.map(wb => wb.id))
      // backward compat
      if (wBadges.length > 0) {
        setWindowPickedBadgeId(res.data.window_badge || wBadges[0]?.id || null)
      } else {
        setWindowPickedBadgeId(null)
      }    } catch { /* silent */ }
  }
  // Countdown lokal sisa waktu border aktif
  useEffect(() => {
    if (!borderSisaDetik || borderSisaDetik <= 0) return
    const t = setInterval(() => {
      setBorderSisaDetik(prev => {
        if (prev <= 1) { fetchBorderWindow(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [borderSisaDetik > 0])

  useEffect(() => {
    fetchBorderWindow()
    const interval = setInterval(fetchBorderWindow, 30000)
    return () => clearInterval(interval)
  }, [])

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
            /* NONAKTIF sementara — kembalikan kondisi video saat koneksi stabil:
            profil?.cover_type === 'video'
              ? <video src={profil.foto_cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover"/>
              : <img src={profil.foto_cover_url} alt="cover" className="w-full h-full object-cover"/>
            */
            <img src={profil.foto_cover_url} alt="cover" className="w-full h-full object-cover"/>
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
          {/* Icon surat — sosmed style, top-right saat tidak edit */}
          {!editMode && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleOpenPesan}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all"
              style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)' }}
              title="Kirim pesan ke guru"
            >
              <Send size={15} className="text-white"/>
            </motion.button>
          )}

          {/* ── MUSIK FAVORIT — pojok kanan bawah cover ── */}
          {!editMode && (profil?.musik_foto_url || profil?.musik_audio_url || profil?.musik_nama) && (
            <div className="absolute bottom-3 right-3 z-10">
              {profil.musik_audio_url && (
                <audio ref={musikAudioRef} src={profil.musik_audio_url}
                  loop
                  onEnded={() => setMusikPlaying(false)}/>
              )}

              {/* Music pill — glassmorphism */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleMusikPlay}
                className="flex items-center gap-2.5 rounded-full overflow-hidden"
                style={{
                  background: 'rgba(0,0,0,0.52)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  boxShadow: musikPlaying
                    ? '0 4px 20px rgba(167,139,250,0.45), 0 0 0 1px rgba(167,139,250,0.3)'
                    : '0 4px 16px rgba(0,0,0,0.4)',
                  padding: '5px 12px 5px 5px',
                  maxWidth: 180,
                }}
              >
                {/* Vinyl disc */}
                <div className="relative flex-shrink-0" style={{ width: 34, height: 34 }}>
                  {/* Outer glow ring saat playing */}
                  {musikPlaying && (
                    <motion.div className="absolute inset-0 rounded-full"
                      animate={{ scale:[1,1.5,1], opacity:[0.6,0,0.6] }}
                      transition={{ repeat:Infinity, duration:1.4, ease:'easeInOut' }}
                      style={{ background:'rgba(167,139,250,0.4)' }}/>
                  )}
                  <motion.div
                    animate={{ rotate: musikPlaying ? 360 : 0 }}
                    transition={{ repeat: musikPlaying ? Infinity : 0, duration: 3.5, ease:'linear' }}
                    className="w-full h-full rounded-full overflow-hidden"
                    style={{
                      border: musikPlaying ? '2px solid rgba(167,139,250,0.7)' : '2px solid rgba(255,255,255,0.35)',
                      background: 'linear-gradient(135deg,#0f0a1e,#1e0a3c)',
                    }}
                  >
                    {profil.musik_foto_url
                      ? <img src={profil.musik_foto_url} alt="album" className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center">
                          <Disc size={14} className="text-white/40"/>
                        </div>
                    }
                  </motion.div>
                  {/* Center hole */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2 h-2 rounded-full"
                      style={{ background: musikPlaying ? 'rgba(167,139,250,0.9)' : 'rgba(255,255,255,0.8)' }}/>
                  </div>
                </div>

                {/* Text info */}
                <div className="flex-1 min-w-0 text-left">
                  {profil.musik_nama && (
                    <p className="text-white font-bold leading-tight truncate"
                      style={{ fontSize: 10, letterSpacing: '0.01em' }}>
                      {profil.musik_nama}
                    </p>
                  )}
                  {profil.musik_artis && (
                    <p className="truncate leading-tight mt-0.5"
                      style={{ fontSize: 9, color: 'rgba(200,180,255,0.75)' }}>
                      {profil.musik_artis}
                    </p>
                  )}
                  {/* Equalizer bars saat playing */}
                  {musikPlaying && (
                    <div className="flex items-end gap-0.5 mt-1" style={{ height: 8 }}>
                      {[0,1,2,3].map(i => (
                        <motion.div key={i}
                          className="w-0.5 rounded-full"
                          style={{ background: 'rgba(167,139,250,0.8)' }}
                          animate={{ height: ['30%','100%','50%','80%','30%'] }}
                          transition={{ repeat:Infinity, duration:0.6+i*0.15, ease:'easeInOut', delay:i*0.1 }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.button>
            </div>
          )}

          {/* Edit mode: tombol edit musik */}
          {editMode && (
            <button
              onClick={() => {
                setMusikForm({ nama: profil?.musik_nama || '', artis: profil?.musik_artis || '' })
                setMusikFotoPreview(profil?.musik_foto_url || null)
                setShowMusikEdit(true)
              }}
              className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-white text-[10px] font-bold transition-all"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <Music size={11}/> {profil?.musik_nama ? 'Edit Musik' : 'Tambah Musik'}
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
                        if (isActive) { await siswaApi.unequipBadge(); updateActiveBadge(null); toast.success('Badge dilepas') }
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

        {/* Button Border Tersedia + Koleksiku */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleOpenBorderModal()}
            className="flex-1 flex items-center justify-between px-4 py-3 rounded-2xl transition-all group"
            style={{
              background: borderWindow?.border_window_aktif && !borderWindow?.sudah_pilih
                ? 'linear-gradient(135deg, rgba(120,60,200,0.15) 0%, rgba(60,100,220,0.12) 100%)'
                : 'linear-gradient(135deg, rgba(120,60,200,0.08) 0%, rgba(60,100,220,0.08) 100%)',
              border: borderWindow?.border_window_aktif && !borderWindow?.sudah_pilih
                ? '1px solid rgba(160,100,255,0.35)'
                : '1px solid rgba(120,60,200,0.15)',
            }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, rgba(120,60,200,0.15), rgba(60,100,220,0.15))' }}>
                <Sparkles size={16} className="text-violet-500 dark:text-violet-400"/>
                {borderWindow?.border_window_aktif && !borderWindow?.sudah_pilih && (
                  <motion.span animate={{ scale:[1,1.4,1], opacity:[1,0.5,1] }} transition={{ repeat:Infinity, duration:1.2 }}
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-violet-500 border-2 border-white dark:border-slate-900"/>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-800 dark:text-white">Border Tersedia</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {borderWindow?.border_window_aktif && !borderWindow?.sudah_pilih
                    ? '✨ Window aktif — pilih border bebas sekarang!'
                    : borderSisaDetik > 0
                    ? `🕐 Border aktif · ${formatSisaBorder(borderSisaDetik)}`
                    : `${ownedBadges.length} dimiliki · ${BADGE_POOL.filter(b => b.borderImg).length} total`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {ownedBadges.length > 0 && (
                <div className="flex -space-x-1.5">
                  {ownedBadges.slice(0,3).map(b => {
                    const pool = BADGE_POOL.find(p => p.id === b.id)
                    return pool?.borderImg ? (
                      <div key={b.id} className="w-6 h-6 rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-slate-200">
                        <img src={pool.borderImg} alt="" className="w-full h-full object-cover"/>
                      </div>
                    ) : null
                  })}
                </div>
              )}
              <svg className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </motion.button>

          {/* Button Koleksiku */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowKoleksiModal(true)}
            className="flex flex-col items-center justify-center px-4 py-3 rounded-2xl transition-all flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,180,220,0.08) 0%, rgba(0,100,160,0.08) 100%)',
              border: permanentBadges.length > 0 ? '1px solid rgba(0,229,255,0.3)' : '1px solid rgba(0,180,220,0.15)',
            }}>
            <span className="text-base leading-none">🎒</span>
            <p className="text-[9px] font-black text-slate-700 dark:text-white mt-1">Koleksiku</p>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5">
              {permanentBadges.length + ownedBadges.length + windowBadgeIds.length}
            </p>
          </motion.button>
        </div>
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

      {/* ── MODAL BORDER TERSEDIA ── */}
      <AnimatePresence>
        {showBorderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)' }}
            onClick={() => setShowBorderModal(false)}>
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden bg-white dark:bg-[#0f0d1a] border border-slate-200 dark:border-white/[0.06]"
              style={{
                boxShadow: '0 -8px 60px rgba(0,0,0,0.3)',
                maxHeight: '90vh',
              }}>

              {/* Handle bar mobile */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20"/>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Border Tersedia</h2>
                  <p className="text-[11px] text-slate-400 dark:text-white/40 mt-0.5">
                    {borderWindow?.border_window_aktif && !borderWindow?.sudah_pilih
                      ? '✨ Window aktif — pilih 1 border bebas!'
                      : `${ownedBadges.length} dimiliki · ${BADGE_POOL.filter(b => b.borderImg).length} total · Gacha harian untuk membuka`
                    }
                  </p>
                </div>
                <button onClick={() => setShowBorderModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/[0.07] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                  <X size={14}/>
                </button>
              </div>

              {/* Banner permanent dimiliki */}
              {permanentBadges.length > 0 && (
                <div className="mx-4 mb-3 px-4 py-2.5 rounded-xl flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/15 border border-cyan-200 dark:border-cyan-500/20">
                  <span className="text-sm">∞</span>
                  <p className="text-[11px] text-cyan-700 dark:text-cyan-300 font-bold">
                    {permanentBadges.length} border permanen · milikmu selamanya
                  </p>
                </div>
              )}

              {/* Banner window aktif */}
              {borderWindow?.border_window_aktif && !borderWindow?.sudah_pilih && (
                <motion.div
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mx-4 mb-3 px-4 py-2.5 rounded-xl flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-500/30">
                  <Sparkles size={13} className="text-violet-500 dark:text-violet-400 flex-shrink-0"/>
                  <p className="text-[11px] text-violet-700 dark:text-violet-300 font-bold flex-1">
                    Pilih 1 border apapun — gratis! Hanya bisa 1x per window.
                  </p>
                </motion.div>
              )}

              {/* Banner sudah pilih */}
              {borderWindow?.border_window_aktif && borderWindow?.sudah_pilih && (
                <div className="mx-4 mb-3 px-4 py-2.5 rounded-xl flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/25">
                  <CheckCircle size={13} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0"/>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                    Border terpasang · berlaku 1 hari
                    {borderSisaDetik > 0 && <span className="font-normal opacity-75"> ({formatSisaBorder(borderSisaDetik)})</span>}
                  </p>
                </div>
              )}

              {/* Garis */}
              <div className="h-px mx-5 bg-slate-100 dark:bg-white/[0.06]"/>

              {/* Grid border */}
              <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(90vh - 160px)' }}>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {BADGE_POOL.filter(b => b.borderImg).map(border => {
                    const cfg      = RARITY_CFG[border.rarity] || RARITY_CFG.common
                    const glow     = border.glow  || cfg.glow
                    const glow2    = border.glow2 || cfg.glow2
                    const owned    = ownedBadges.some(b => b.id === border.id)
                    const isActive = activeBadge === border.id
                    const windowAktif    = borderWindow?.border_window_aktif
                    const sudahPilih     = borderWindow?.sudah_pilih
                    const isLimited      = border.rarity === 'limited'
                    const isPermanent    = border.rarity === 'permanent'
                    const windowLimited  = borderWindow?.limited_badges || []
                    const isLimitedAvail = isLimited && windowAktif && !sudahPilih && windowLimited.includes(border.id)
                    const bisaPilihBebas = windowAktif && !sudahPilih && !isLimited && !isPermanent
                    // Border ini ada di window_badges aktif — bisa equip/unequip berulang
                    const windowBadgeOwned = windowBadgeIds.includes(border.id)
                    // Permanent — milik selamanya
                    const isPermanentOwned = isPermanent && permanentBadges.includes(border.id)
                    const canInteract    = owned || bisaPilihBebas || windowBadgeOwned || isLimitedAvail || isPermanentOwned

                    return (
                      <motion.button
                        key={border.id}
                        whileTap={canInteract ? { scale: 0.95 } : {}}
                        onClick={async () => {
                          if (!canInteract) return
                          try {
                            if ((bisaPilihBebas || isLimitedAvail) && !owned && !windowBadgeOwned && !isPermanentOwned) {
                              // Pilih border baru via window (1x per window)
                              await siswaApi.pilihBorderWindow(border.id)
                              updateActiveBadge(border.id)
                              setWindowPickedBadgeId(border.id)
                              setWindowBadgeIds(prev => [...prev.filter(id => id !== border.id), border.id])
                              setBorderWindow(prev => ({ ...prev, sudah_pilih: true }))
                              setBorderSisaDetik(86400)
                              toast.success(`${border.name} terpasang! Berlaku 24 jam.`)
                            } else {
                              // Equip / unequip — bisa berulang kali
                              if (isActive) {
                                await siswaApi.unequipBadge()
                                updateActiveBadge(null)
                                toast.success('Border dilepas')
                              } else {
                                await siswaApi.equipBadge(border.id)
                                updateActiveBadge(border.id)
                                toast.success(`${border.name} terpasang!`)
                              }
                            }
                          } catch (e) {
                            toast.error(e.response?.data?.message || 'Gagal')
                          }
                        }}
                        className="relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all bg-slate-50 dark:bg-white/[0.02]"
                        style={{
                          background: isActive
                            ? `linear-gradient(160deg, ${glow}22, ${glow2}18)`
                            : bisaPilihBebas && !owned
                            ? 'rgba(120,60,200,0.07)'
                            : owned
                            ? 'rgba(120,60,200,0.05)'
                            : undefined,
                          border: isActive
                            ? `1.5px solid ${glow}55`
                            : bisaPilihBebas && !owned
                            ? '1.5px solid rgba(160,100,255,0.25)'
                            : owned
                            ? '1.5px solid rgba(120,60,200,0.15)'
                            : '1.5px solid transparent',
                          cursor: canInteract ? 'pointer' : 'default',
                        }}>

                        {/* Preview border */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20" style={{ zIndex: 1 }}>
                          <div className="absolute inset-0 rounded-full"
                            style={{ background: canInteract ? `radial-gradient(circle, ${glow}18 0%, transparent 70%)` : undefined }}/>

                          {canInteract ? (
                            <motion.img
                              src={border.borderImg}
                              alt={border.name}
                              loading="lazy"
                              className="absolute pointer-events-none select-none"
                              style={{
                                top: '50%', left: '50%',
                                transform: 'translate(-50%,-50%) scale(1.35)',
                                width: '100%', height: '100%',
                                objectFit: 'contain', zIndex: 10,
                              }}
                              animate={{ filter: isActive ? [
                                `drop-shadow(0 0 6px ${glow2})`,
                                `drop-shadow(0 0 16px ${glow})`,
                                `drop-shadow(0 0 6px ${glow2})`,
                              ] : [`drop-shadow(0 0 4px ${glow2})`]}}
                              transition={{ repeat: isActive ? Infinity : 0, duration: 2.4, ease: 'easeInOut' }}
                            />
                          ) : (
                            <>
                              <img
                                src={border.borderImg}
                                alt={border.name}
                                loading="lazy"
                                className="absolute pointer-events-none select-none"
                                style={{
                                  top: '50%', left: '50%',
                                  transform: 'translate(-50%,-50%) scale(1.35)',
                                  width: '100%', height: '100%',
                                  objectFit: 'contain', zIndex: 10,
                                  filter: 'grayscale(1) brightness(0.5) blur(1px)',
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-200/80 dark:bg-black/60 border border-slate-300 dark:border-white/10">
                                  <Lock size={12} className="text-slate-400 dark:text-white/50"/>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Badge FREE */}
                          {bisaPilihBebas && !owned && !windowBadgeOwned && (
                            <div className="absolute -top-1 -right-1 z-30 px-1.5 py-0.5 rounded-full text-[8px] font-black text-white"
                              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
                              FREE
                            </div>
                          )}
                          {/* Badge LTD FREE untuk limited yang tersedia di window */}
                          {isLimitedAvail && !owned && !windowBadgeOwned && (
                            <div className="absolute -top-1 -right-1 z-30 px-1.5 py-0.5 rounded-full text-[8px] font-black text-white"
                              style={{ background: 'linear-gradient(135deg,#be0058,#ff2d78)' }}>
                              LTD✨
                            </div>
                          )}
                          {/* Badge PERM untuk permanent yang dimiliki */}
                          {isPermanentOwned && (
                            <div className="absolute -top-1 -right-1 z-30 px-1.5 py-0.5 rounded-full text-[8px] font-black"
                              style={{ background: 'linear-gradient(135deg,#003d5c,#00e5ff)', color: '#000' }}>
                              ∞
                            </div>
                          )}
                          {/* Badge LIMITED */}
                          {isLimited && !owned && (
                            <div className="absolute -top-1 -right-1 z-30 px-1.5 py-0.5 rounded-full text-[8px] font-black text-white"
                              style={{ background: 'linear-gradient(135deg,#be0058,#ff2d78)' }}>
                              LTD
                            </div>
                          )}
                        </div>

                        {/* Nama & rarity */}
                        <div className="text-center w-full" style={{ zIndex: 1 }}>
                          <p className={`text-[10px] font-black leading-tight truncate ${
                            canInteract ? 'text-slate-800 dark:text-white/85' : 'text-slate-300 dark:text-white/25'
                          }`}>
                            {border.name}
                          </p>
                          <p className={`text-[9px] font-bold mt-0.5 ${
                            canInteract ? '' : 'text-slate-300 dark:text-white/15'
                          }`}
                            style={{ color: canInteract ? glow : undefined }}>
                            {cfg.label}
                          </p>
                        </div>

                        {/* Badge aktif */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0f0d1a]"
                            style={{ zIndex: 2 }}>
                            <CheckCircle size={10} className="text-white"/>
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>

                {/* Info */}
                <div className="mt-4 p-3 rounded-2xl flex items-center gap-3 bg-amber-50 dark:bg-white/[0.03] border border-amber-100 dark:border-white/[0.05]">
                  <Sparkles size={14} className="text-amber-500 dark:text-amber-400 flex-shrink-0"/>
                  <p className="text-[11px] text-slate-500 dark:text-white/35">
                    Saat admin buka window, kamu punya <span className="text-violet-600 dark:text-violet-400 font-bold">1 jam</span> untuk pilih border. Border yang dipilih berlaku <span className="text-amber-600 dark:text-amber-400 font-bold">1 hari</span>. Border <span className="text-rose-500 font-bold">LIMITED</span> hanya bisa didapat dari Gacha Harian.
                  </p>
                </div>

                {/* Tombol Lepas Border */}
                {activeBadge && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={async () => {
                      try {
                        await siswaApi.unequipBadge()
                        updateActiveBadge(null)
                        toast.success('Border dilepas')
                      } catch {
                        toast.error('Gagal melepas border')
                      }
                    }}
                    className="mt-3 w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08]">
                    <X size={14}/>
                    Lepas Border Aktif
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL KOLEKSIKU ── */}
      <AnimatePresence>
        {showKoleksiModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)' }}
            onClick={() => setShowKoleksiModal(false)}>
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden bg-white dark:bg-[#0f0d1a] border border-slate-200 dark:border-white/[0.06]"
              style={{ maxHeight: '90vh' }}>

              {/* Handle bar mobile */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20"/>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">🎒 Koleksiku</h2>
                  <p className="text-[11px] text-slate-400 dark:text-white/40 mt-0.5">
                    {permanentBadges.length} permanen · {ownedBadges.length} trial gacha · {windowBadgeIds.length} trial window
                  </p>
                </div>
                <button onClick={() => setShowKoleksiModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/[0.07] text-slate-500 dark:text-white/40">
                  <X size={14}/>
                </button>
              </div>

              <div className="h-px mx-5 bg-slate-100 dark:bg-white/[0.06]"/>

              <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                {/* Hitung semua koleksi */}
                {(() => {
                  // Gabungkan semua badge yang dimiliki
                  const allOwned = []

                  // 1. Permanent
                  permanentBadges.forEach(id => {
                    const b = BADGE_POOL.find(p => p.id === id)
                    if (b) allOwned.push({ ...b, type: 'permanent', expiresLabel: null })
                  })

                  // 2. Window badges (trial)
                  const wBadgesRaw = borderWindow?.window_badges || []
                  wBadgesRaw.forEach(wb => {
                    const b = BADGE_POOL.find(p => p.id === wb.id)
                    if (b && !permanentBadges.includes(wb.id)) {
                      const exp = wb.expires_at ? new Date(wb.expires_at) : null
                      const sisaMs = exp ? exp - Date.now() : 0
                      const sisaJam = sisaMs > 0 ? Math.floor(sisaMs / 3600000) : 0
                      const sisaMenit = sisaMs > 0 ? Math.floor((sisaMs % 3600000) / 60000) : 0
                      allOwned.push({
                        ...b,
                        type: 'window',
                        expiresLabel: sisaMs > 0 ? `${sisaJam}j ${sisaMenit}m` : 'Expired',
                      })
                    }
                  })

                  // 3. Gacha badges (trial hari ini)
                  ownedBadges.forEach(badge => {
                    const b = BADGE_POOL.find(p => p.id === badge.id)
                    if (b && !permanentBadges.includes(badge.id) && !wBadgesRaw.find(w => w.id === badge.id)) {
                      allOwned.push({ ...b, type: 'gacha', expiresLabel: 'Hari ini' })
                    }
                  })

                  if (allOwned.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <p className="text-4xl mb-3">🎒</p>
                        <p className="text-sm font-bold text-slate-500 dark:text-white/40">Koleksi masih kosong</p>
                        <p className="text-[11px] text-slate-400 dark:text-white/25 mt-1">Gacha harian untuk mulai koleksi!</p>
                      </div>
                    )
                  }

                  return (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {allOwned.map((border, idx) => {
                        const cfg = RARITY_CFG[border.rarity] || RARITY_CFG.common
                        const glow = border.glow || cfg.glow
                        const glow2 = border.glow2 || cfg.glow2
                        const isActive = activeBadge === border.id
                        const isPerm = border.type === 'permanent'

                        return (
                          <motion.button
                            key={`${border.id}-${idx}`}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              try {
                                if (isActive) {
                                  await siswaApi.unequipBadge()
                                  updateActiveBadge(null)
                                  toast.success('Border dilepas')
                                } else {
                                  await siswaApi.equipBadge(border.id)
                                  updateActiveBadge(border.id)
                                  toast.success(`${border.name} terpasang!`)
                                }
                              } catch (e) {
                                toast.error(e.response?.data?.message || 'Gagal')
                              }
                            }}
                            className="relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all bg-slate-50 dark:bg-white/[0.02]"
                            style={{
                              background: isActive ? `linear-gradient(160deg, ${glow}22, ${glow2}18)` : undefined,
                              border: isActive ? `1.5px solid ${glow}55` : '1.5px solid transparent',
                              cursor: 'pointer',
                            }}>

                            {/* Preview */}
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                              <div className="absolute inset-0 rounded-full"
                                style={{ background: `radial-gradient(circle, ${glow}18 0%, transparent 70%)` }}/>
                              <motion.img
                                src={border.borderImg}
                                alt={border.name}
                                loading="lazy"
                                className="absolute pointer-events-none select-none"
                                style={{
                                  top: '50%', left: '50%',
                                  transform: 'translate(-50%,-50%) scale(1.35)',
                                  width: '100%', height: '100%',
                                  objectFit: 'contain', zIndex: 10,
                                }}
                                animate={{ filter: isActive ? [
                                  `drop-shadow(0 0 6px ${glow2})`,
                                  `drop-shadow(0 0 16px ${glow})`,
                                  `drop-shadow(0 0 6px ${glow2})`,
                                ] : [`drop-shadow(0 0 4px ${glow2})`]}}
                                transition={{ repeat: isActive ? Infinity : 0, duration: 2.4, ease: 'easeInOut' }}
                              />
                              {/* Label type */}
                              <div className="absolute -top-1 -right-1 z-30 px-1.5 py-0.5 rounded-full text-[7px] font-black"
                                style={isPerm
                                  ? { background: 'linear-gradient(135deg,#003d5c,#00e5ff)', color: '#000' }
                                  : { background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.7)' }}>
                                {isPerm ? '∞' : 'TRIAL'}
                              </div>
                            </div>

                            {/* Nama */}
                            <div className="text-center w-full">
                              <p className="text-[10px] font-black leading-tight truncate text-slate-800 dark:text-white/85">
                                {border.name}
                              </p>
                              <p className="text-[8px] mt-0.5"
                                style={{ color: isPerm ? 'rgba(0,229,255,0.8)' : 'rgba(200,160,60,0.8)' }}>
                                {isPerm ? 'Permanen' : border.expiresLabel}
                              </p>
                            </div>

                            {/* Aktif indicator */}
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0f0d1a]"
                                style={{ zIndex: 2 }}>
                                <CheckCircle size={10} className="text-white"/>
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  )
                })()}

                {/* Lepas border aktif */}
                {activeBadge && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={async () => {
                      try {
                        await siswaApi.unequipBadge()
                        updateActiveBadge(null)
                        toast.success('Border dilepas')
                      } catch { toast.error('Gagal') }
                    }}
                    className="mt-3 w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08]">
                    <X size={14}/>
                    Lepas Border Aktif
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL EDIT MUSIK ── */}
      <AnimatePresence>
        {showMusikEdit && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(10px)' }}
            onClick={() => setShowMusikEdit(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 sm:hidden">
                <div className="w-9 h-1 rounded-full bg-slate-200 dark:bg-slate-700"/>
              </div>
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                    <Music size={15} className="text-violet-600 dark:text-violet-400"/>
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Musik Favorit</h2>
                    <p className="text-[10px] text-slate-400">Foto album + audio (maks 10MB)</p>
                  </div>
                </div>
                <button onClick={() => setShowMusikEdit(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <X size={13}/>
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Preview foto album */}
                <div className="flex items-center gap-4">
                  <label className="relative cursor-pointer flex-shrink-0">
                    <motion.div
                      animate={{ rotate: 0 }}
                      className="w-16 h-16 rounded-full overflow-hidden shadow-lg"
                      style={{ border: '3px solid rgba(139,92,246,0.5)', background: 'linear-gradient(135deg,#1a0a2e,#3b0764)' }}
                    >
                      {musikFotoPreview
                        ? <img src={musikFotoPreview} alt="album" className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center">
                            <Disc size={22} className="text-white/40"/>
                          </div>
                      }
                    </motion.div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center border-2 border-white dark:border-slate-900">
                      <Camera size={10} className="text-white"/>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                      const f = e.target.files[0]; if (!f) return
                      if (f.size > 5*1024*1024) { toast.error('Maks 5MB'); return }
                      setMusikFotoFile(f)
                      const r = new FileReader(); r.onloadend = () => setMusikFotoPreview(r.result); r.readAsDataURL(f)
                    }}/>
                  </label>
                  <div className="flex-1 space-y-2">
                    <input type="text" value={musikForm.nama}
                      onChange={e => setMusikForm(p => ({ ...p, nama: e.target.value }))}
                      placeholder="Nama lagu" maxLength={200}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"/>
                    <input type="text" value={musikForm.artis}
                      onChange={e => setMusikForm(p => ({ ...p, artis: e.target.value }))}
                      placeholder="Nama artis / band" maxLength={200}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"/>
                  </div>
                </div>

                {/* Upload audio */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    Audio <span className="text-slate-300 dark:text-slate-600 font-normal normal-case">(opsional, maks 10MB)</span>
                  </label>
                  <label className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    musikAudioName
                      ? 'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 bg-slate-50 dark:bg-slate-800/40'
                  }`}>
                    <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                      <Music size={14} className="text-violet-500"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {musikAudioName || 'Klik untuk upload audio'}
                      </p>
                      <p className="text-[10px] text-slate-400">MP3, AAC, OGG · Maks 10MB</p>
                    </div>
                    {musikAudioName && (
                      <button type="button" onClick={e => { e.preventDefault(); setMusikAudioFile(null); setMusikAudioName('') }}
                        className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <X size={10} className="text-slate-500"/>
                      </button>
                    )}
                    <input type="file" className="hidden" accept="audio/*" onChange={e => {
                      const f = e.target.files[0]; if (!f) return
                      if (f.size > 10*1024*1024) { toast.error('Maks 10MB'); return }
                      setMusikAudioFile(f)
                      setMusikAudioName(f.name)
                      }
                      audio.src = url
                    }}/>
                  </label>
                </div>

                {/* Tombol aksi */}
                <div className="flex gap-2 pt-1">
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={handleSaveMusik}
                    disabled={musikSaving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                    {musikSaving ? <Loader size={13} className="animate-spin"/> : <Music size={13}/>}
                    {musikSaving ? 'Menyimpan...' : 'Simpan'}
                  </motion.button>
                  {(profil?.musik_nama || profil?.musik_foto_url) && (
                    <button onClick={handleHapusMusik}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/50 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL PESAN DISPEN ── */}      <AnimatePresence>
        {showPesanModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(10px)' }}
            onClick={() => setShowPesanModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Drag handle mobile */}
              <div className="flex justify-center pt-3 sm:hidden">
                <div className="w-9 h-1 rounded-full bg-slate-200 dark:bg-slate-700"/>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                    <MessageSquare size={15} className="text-violet-600 dark:text-violet-400"/>
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Pesan ke Guru</h2>
                    <p className="text-[10px] text-slate-400">Kirim pesan / dispen ke guru</p>
                  </div>
                </div>
                <button onClick={() => setShowPesanModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <X size={13}/>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800">
                {[
                  { key: 'kirim', label: 'Kirim Pesan', icon: Send },
                  { key: 'riwayat', label: 'Riwayat', icon: MessageSquare },
                ].map(t => (
                  <button key={t.key} onClick={() => { setPesanTab(t.key); if (t.key === 'riwayat') fetchRiwayatPesan() }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      pesanTab === t.key
                        ? 'border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-900/10'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}>
                    <t.icon size={12}/>{t.label}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto max-h-[70vh]">
                {pesanTab === 'kirim' ? (
                  <div className="p-5 space-y-4">
                    {/* Pilih Guru */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Tujuan Guru
                      </label>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {guruList.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-3">Memuat daftar guru...</p>
                        ) : guruList.map(g => (
                          <button key={g.id} type="button"
                            onClick={() => setPesanForm(p => ({ ...p, guru_id: String(g.id) }))}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                              pesanForm.guru_id === String(g.id)
                                ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700 ring-1 ring-violet-300 dark:ring-violet-700/50'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800'
                            }`}>
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                              {g.foto_url
                                ? <img src={g.foto_url} alt={g.nama_lengkap} className="w-full h-full object-cover"/>
                                : <span className="text-white font-black text-xs">{g.nama_lengkap.charAt(0)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{g.nama_lengkap}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {g.is_wali_kelas ? `Wali Kelas ${g.kelas || ''}` : 'Guru'} · {g.nip}
                              </p>
                            </div>
                            {pesanForm.guru_id === String(g.id) && (
                              <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                                <CheckCircle size={10} className="text-white"/>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Judul */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Judul</label>
                      <input
                        type="text"
                        value={pesanForm.judul}
                        onChange={e => setPesanForm(p => ({ ...p, judul: e.target.value }))}
                        placeholder="Contoh: Izin tidak masuk sekolah"
                        maxLength={200}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Pesan */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Pesan</label>
                      <textarea
                        value={pesanForm.pesan}
                        onChange={e => setPesanForm(p => ({ ...p, pesan: e.target.value }))}
                        placeholder="Tulis pesan atau alasan dispen kamu di sini..."
                        rows={4}
                        maxLength={2000}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                      />
                      <p className="text-[10px] text-slate-400 text-right mt-0.5">{pesanForm.pesan.length}/2000</p>
                    </div>

                    {/* Foto Bukti */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                        Foto Bukti <span className="text-slate-300 dark:text-slate-600 font-normal normal-case">(opsional)</span>
                      </label>
                      {pesanFotoPreview ? (
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800">
                          <img src={pesanFotoPreview} alt="bukti" className="w-full h-full object-cover"/>
                          <button onClick={() => { setPesanFoto(null); setPesanFotoPreview(null) }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                            <X size={12}/>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 w-full h-24 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 transition-colors bg-slate-50 dark:bg-slate-800/40">
                          <Camera size={20} className="text-slate-300 dark:text-slate-600"/>
                          <span className="text-xs text-slate-400">Klik untuk upload foto bukti</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => {
                            const f = e.target.files[0]; if (!f) return
                            if (f.size > 5 * 1024 * 1024) { toast.error('Maks 5MB'); return }
                            setPesanFoto(f)
                            const r = new FileReader(); r.onloadend = () => setPesanFotoPreview(r.result); r.readAsDataURL(f)
                          }}/>
                        </label>
                      )}
                    </div>

                    {/* Tombol Kirim */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleKirimPesan}
                      disabled={pesanSending || !pesanForm.guru_id || !pesanForm.judul || !pesanForm.pesan}
                      className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
                    >
                      {pesanSending ? <Loader size={14} className="animate-spin"/> : <Send size={14}/>}
                      {pesanSending ? 'Mengirim...' : 'Kirim Pesan'}
                    </motion.button>
                  </div>
                ) : (
                  /* Riwayat */
                  <div className="p-4 space-y-2">
                    {riwayatPesan.length === 0 ? (
                      <div className="flex flex-col items-center py-10 gap-2 text-slate-400">
                        <MessageSquare size={28} className="opacity-30"/>
                        <p className="text-sm font-medium">Belum ada pesan terkirim</p>
                      </div>
                    ) : riwayatPesan.map(p => (
                      <div key={p.id} className={`rounded-2xl border p-3.5 ${
                        p.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-700/40'
                        : p.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-900/15 border-rose-200 dark:border-rose-700/40'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{p.judul}</p>
                          <span className={`flex-shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full ${
                            p.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                            : p.status === 'rejected' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'
                            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                          }`}>
                            {p.status === 'approved' ? '✓ Disetujui' : p.status === 'rejected' ? '✗ Ditolak' : '⏳ Menunggu'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                          Ke: <span className="font-semibold">{p.guru_nama}</span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{p.pesan}</p>
                        {p.catatan_guru && (
                          <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50">
                            <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Catatan Guru:</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{p.catatan_guru}</p>
                          </div>
                        )}
                        {p.foto_bukti && (
                          <img src={p.foto_bukti} alt="bukti" className="mt-2 w-full max-h-32 object-cover rounded-xl"/>
                        )}
                        <p className="text-[9px] text-slate-400 mt-1.5">
                          {new Date(p.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </p>
                      </div>
                    ))}
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