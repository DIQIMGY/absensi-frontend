import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save, Clock, Calendar, Building2, Camera,
  Settings2, School, MapPin, User, Hash,
  AlertCircle, XCircle, Info, Shield,
  CheckCircle, Sunrise, Sunset, Timer,
  Image as ImageIcon, Palmtree, Sparkles, Plus, Trash2, CalendarDays, Globe, HelpCircle, Mountain, Award,
} from 'lucide-react'
import { adminApi } from '../../services/adminService'
import toast from 'react-hot-toast'
import Select from 'react-select'
import { usePengaturanStore } from '../../stores/pengaturanStore'

const HARI_OPTIONS = [
  { value: 'Senin', label: 'Senin' },
  { value: 'Selasa', label: 'Selasa' },
  { value: 'Rabu', label: 'Rabu' },
  { value: 'Kamis', label: 'Kamis' },
  { value: 'Jumat', label: 'Jumat' },
  { value: 'Sabtu', label: 'Sabtu' },
  { value: 'Minggu', label: 'Minggu' },
]

const TABS = [
  { id: 'absensi', label: 'Absensi', icon: Clock, accent: 'teal',
    grad: 'from-teal-500 to-cyan-500', light: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-800', ring: 'focus:ring-teal-500',
    text: 'text-teal-600 dark:text-teal-400' },
  { id: 'libur', label: 'Libur', icon: Palmtree, accent: 'amber',
    grad: 'from-amber-500 to-orange-500', light: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800', ring: 'focus:ring-amber-500',
    text: 'text-amber-600 dark:text-amber-400' },
  { id: 'event', label: 'Event', icon: CalendarDays, accent: 'indigo',
    grad: 'from-indigo-500 to-violet-500', light: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800', ring: 'focus:ring-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400' },
  { id: 'budaya', label: 'Budaya', icon: Globe, accent: 'rose',
    grad: 'from-rose-500 to-orange-500', light: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800', ring: 'focus:ring-rose-500',
    text: 'text-rose-600 dark:text-rose-400' },
  { id: 'alam', label: 'Alam', icon: Mountain, accent: 'emerald',
    grad: 'from-emerald-500 to-teal-500', light: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800', ring: 'focus:ring-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'sekolah', label: 'Sekolah', icon: Building2, accent: 'emerald',
    grad: 'from-emerald-500 to-green-500', light: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800', ring: 'focus:ring-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'prestasi', label: 'Prestasi', icon: Award, accent: 'amber',
    grad: 'from-amber-400 to-yellow-500', light: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800', ring: 'focus:ring-amber-500',
    text: 'text-amber-600 dark:text-amber-400' },
]

// Reusable input wrapper
const Field = ({ label, hint, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
      {Icon && <Icon size={11} />} {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
  </div>
)

const inputCls = (ring = 'focus:ring-teal-500') =>
  `w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
   rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400
   focus:outline-none focus:ring-2 ${ring} focus:border-transparent transition-all`

const TimeInput = ({ value, onChange, ring }) => (
  <input type="time" value={value} onChange={onChange}
    className={inputCls(ring)} required />
)

export default function Pengaturan() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('absensi')
  const { updatePengaturan } = usePengaturanStore()
  const [formData, setFormData] = useState({
    jam_masuk: '07:15', jam_pulang: '15:00', jam_buka_absen: '06:00',
    batas_keterlambatan: 15,
    hari_aktif: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
    status_libur: false, keterangan_libur: '',
    tanggal_libur_mulai: '', tanggal_libur_selesai: '',
    foto_libur: null, foto_libur_2: null, foto_libur_3: null, foto_libur_4: null,
    foto_libur_bg: null,
    hapus_foto_libur: '0', hapus_foto_libur_2: '0', hapus_foto_libur_3: '0', hapus_foto_libur_4: '0',
    hapus_foto_libur_bg: '0',
        events: [],
        event_fotos: [],
    nama_sekolah: '', alamat_sekolah: '',
    kepala_sekolah: '', nip_kepala_sekolah: '', logo_sekolah: null,
    video_dashboard: null,
    hapus_video_dashboard: '0',
    budaya_info: { judul:'', deskripsi:'', pertanyaan:'', jawaban_benar:0, pilihan:['','',''] },
    budaya_fotos: Array(7).fill(null),
    budaya_video: null,
    hapus_budaya_video: '0',
    budaya_video_2: null,
    hapus_budaya_video_2: '0',
    budaya_bg: null,
    hapus_budaya_bg: '0',
    alam_info: { judul:'', deskripsi:'', judul_2:'' },
    alam_fotos: Array(7).fill(null),
    alam_fotos_2: Array(7).fill(null),
    alam_bg: null,
    hapus_alam_bg: '0',
    prestasi_judul: '',
    prestasi_deskripsi: '',
    prestasi_siswa: [],
  })
  const [previewLogo, setPreviewLogo] = useState(null)
  const [previewVideoDashboard, setPreviewVideoDashboard] = useState(null)
  const [previewBudayaFotos, setPreviewBudayaFotos] = useState(Array(7).fill(null))
  const [previewBudayaVideo, setPreviewBudayaVideo] = useState(null)
  const [previewBudayaVideo2, setPreviewBudayaVideo2] = useState(null)
  const [previewBudayaBg, setPreviewBudayaBg] = useState(null)
  const [previewAlamFotos, setPreviewAlamFotos] = useState(Array(7).fill(null))
  const [previewAlamFotos2, setPreviewAlamFotos2] = useState(Array(7).fill(null))
  const [previewFotoLibur, setPreviewFotoLibur] = useState(null)
  const [previewFotoLibur2, setPreviewFotoLibur2] = useState(null)
  const [previewFotoLibur3, setPreviewFotoLibur3] = useState(null)
  const [previewFotoLibur4, setPreviewFotoLibur4] = useState(null)
  const [previewFotoLiburBg, setPreviewFotoLiburBg] = useState(null)
  const [previewEventFotos, setPreviewEventFotos] = useState({})

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }))

  useEffect(() => { fetchPengaturan() }, [])

  useEffect(() => () => {
    if (previewLogo?.startsWith('blob:')) URL.revokeObjectURL(previewLogo)
  }, [previewLogo])

  const fetchPengaturan = async () => {
    try {
      const res = await adminApi.getPengaturan()
      const d = res.data.data
      let hari = d.hari_aktif || ['Senin','Selasa','Rabu','Kamis','Jumat']
      if (typeof hari === 'string') { try { hari = JSON.parse(hari) } catch { hari = ['Senin','Selasa','Rabu','Kamis','Jumat'] } }
      if (!Array.isArray(hari)) hari = ['Senin','Selasa','Rabu','Kamis','Jumat']
      setFormData({
        jam_masuk: d.jam_masuk?.substring(0,5) || '07:15',
        jam_pulang: d.jam_pulang?.substring(0,5) || '15:00',
        jam_buka_absen: d.jam_buka_absen?.substring(0,5) || '06:00',
        batas_keterlambatan: d.batas_keterlambatan || 15,
        hari_aktif: hari,
        status_libur: d.status_libur || false,
        keterangan_libur: d.keterangan_libur || '',
        tanggal_libur_mulai: d.tanggal_libur_mulai || '',
        tanggal_libur_selesai: d.tanggal_libur_selesai || '',
        nama_sekolah: d.nama_sekolah || '',
        alamat_sekolah: d.alamat_sekolah || '',
        kepala_sekolah: d.kepala_sekolah || '',
        nip_kepala_sekolah: d.nip_kepala_sekolah || '',
        logo_sekolah: null,
        video_dashboard: null,
        events: Array.isArray(d.events) ? d.events : [],
        event_fotos: Array.isArray(d.event_fotos) ? d.event_fotos : [],
        hapus_foto_libur: '0', hapus_foto_libur_2: '0', hapus_foto_libur_3: '0',
        hapus_foto_libur_4: '0', hapus_foto_libur_bg: '0',
      })
      if (d.logo_sekolah) setPreviewLogo(d.logo_sekolah)
      if (d.video_dashboard) setPreviewVideoDashboard(d.video_dashboard)
      set('budaya_info', d.budaya_info || { judul:'', deskripsi:'', pertanyaan:'', jawaban_benar:0, pilihan:['','',''] })
      set('budaya_fotos', Array.isArray(d.budaya_fotos) ? d.budaya_fotos : Array(7).fill(null))
      setPreviewBudayaFotos((d.budaya_fotos || Array(7).fill(null)).map(f => f || null))
      set('budaya_video', d.budaya_video || null)
      if (d.budaya_video) setPreviewBudayaVideo(d.budaya_video)
      set('budaya_video_2', d.budaya_video_2 || null)
      if (d.budaya_video_2) setPreviewBudayaVideo2(d.budaya_video_2)
      set('budaya_bg', d.budaya_bg || null)
      if (d.budaya_bg) setPreviewBudayaBg(d.budaya_bg)
      set('alam_info', d.alam_info || { judul:'', deskripsi:'', judul_2:'' })
      set('alam_fotos', Array.isArray(d.alam_fotos) ? d.alam_fotos : Array(6).fill(null))
      setPreviewAlamFotos((d.alam_fotos || Array(7).fill(null)).map(f => f || null))
      set('alam_fotos_2', Array.isArray(d.alam_fotos_2) ? d.alam_fotos_2 : Array(7).fill(null))
      setPreviewAlamFotos2((d.alam_fotos_2 || Array(7).fill(null)).map(f => f || null))
      set('alam_bg', d.alam_bg || null)
      set('prestasi_judul', d.prestasi_judul || '')
      set('prestasi_deskripsi', d.prestasi_deskripsi || '')
      set('prestasi_siswa', Array.isArray(d.prestasi_siswa) ? d.prestasi_siswa : [])
      if (d.foto_libur) setPreviewFotoLibur(d.foto_libur)
      if (d.foto_libur_2) setPreviewFotoLibur2(d.foto_libur_2)
      if (d.foto_libur_3) setPreviewFotoLibur3(d.foto_libur_3)
      if (d.foto_libur_4) setPreviewFotoLibur4(d.foto_libur_4)
      if (d.foto_libur_bg) setPreviewFotoLiburBg(d.foto_libur_bg)
      updatePengaturan({ ...d, hari_aktif: hari })
    } catch { toast.error('Gagal memuat pengaturan') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const fd = new FormData()
      const hari = Array.isArray(formData.hari_aktif) ? formData.hari_aktif : ['Senin','Selasa','Rabu','Kamis','Jumat']
      Object.keys(formData).forEach(k => {
        if (k === 'hari_aktif') hari.forEach(h => fd.append('hari_aktif[]', h))
        else if (['foto_libur','foto_libur_2','foto_libur_3','foto_libur_4','logo_sekolah','video_dashboard'].includes(k) && formData[k] instanceof File) fd.append(k, formData[k])
        else if (['foto_libur','foto_libur_2','foto_libur_3','foto_libur_4','logo_sekolah','video_dashboard'].includes(k)) { /* skip non-File */ }
        else if (k === 'status_libur') fd.append(k, formData[k] ? '1' : '0')
        else if (k === 'events') fd.append(k, JSON.stringify(formData[k] || []))
        else if (k === 'budaya_info') fd.append(k, JSON.stringify(formData[k] || {}))
        else if (k === 'budaya_video' && formData[k] instanceof File) fd.append(k, formData[k])
        else if (k === 'budaya_video') { /* skip non-File */ }
        else if (k === 'budaya_video_2' && formData[k] instanceof File) fd.append(k, formData[k])
        else if (k === 'budaya_video_2') { /* skip non-File */ }
        else if (k === 'budaya_bg' && formData[k] instanceof File) fd.append(k, formData[k])
        else if (k === 'budaya_bg') { /* skip non-File */ }
        else if (k === 'alam_info') fd.append(k, JSON.stringify(formData[k] || {}))
        else if (k === 'alam_fotos_2') {
          (formData.alam_fotos_2||[]).forEach((f, idx) => {
            if (f instanceof File) fd.append(`alam_foto_2_${idx}`, f)
          })
        }
        else if (k === 'alam_bg' && formData[k] instanceof File) fd.append(k, formData[k])
        else if (k === 'alam_bg') { /* skip non-File */ }
        else if (k === 'prestasi_siswa') {
          // Send metadata as JSON, files separately
          const meta = (formData.prestasi_siswa||[]).map(s => ({
            nama: s.nama || '', kelas: s.kelas || '', prestasi: s.prestasi || '',
            foto_path: (s.foto_path && !(s._fotoFile)) ? s.foto_path : null,
          }))
          fd.append('prestasi_siswa', JSON.stringify(meta))
          ;(formData.prestasi_siswa||[]).forEach((s, idx) => {
            if (s._fotoFile instanceof File) fd.append(`prestasi_foto_${idx}`, s._fotoFile)
            if (s._hapusFoto) fd.append(`hapus_prestasi_foto_${idx}`, '1')
          })
        }
        else if (k === 'alam_fotos') {
          (formData.alam_fotos||[]).forEach((f, idx) => {
            if (f instanceof File) fd.append(`alam_foto_${idx}`, f)
          })
        }
        else if (k === 'budaya_fotos') {
          (formData.budaya_fotos||[]).forEach((f, idx) => {
            if (f instanceof File) fd.append(`budaya_foto_${idx}`, f)
          })
        }
        else if (k === 'event_fotos') {
          (formData.event_fotos||[]).forEach((f, idx) => {
            if (f instanceof File) fd.append(`event_foto_${idx}`, f)
          })
        }
        else if (formData[k] !== null && formData[k] !== '') fd.append(k, formData[k])
      })
      const res = await adminApi.updatePengaturan(fd)
      const s = res.data.data
      const newHari = Array.isArray(s.hari_aktif) ? s.hari_aktif : hari
      setFormData(p => ({
        ...p, jam_masuk: s.jam_masuk?.substring(0,5) || p.jam_masuk,
        jam_pulang: s.jam_pulang?.substring(0,5) || p.jam_pulang,
        jam_buka_absen: s.jam_buka_absen?.substring(0,5) || p.jam_buka_absen,
        batas_keterlambatan: s.batas_keterlambatan || p.batas_keterlambatan,
        hari_aktif: newHari, status_libur: s.status_libur || false,
        keterangan_libur: s.keterangan_libur || '', tanggal_libur_mulai: s.tanggal_libur_mulai || '',
        tanggal_libur_selesai: s.tanggal_libur_selesai || '', nama_sekolah: s.nama_sekolah || '',
        alamat_sekolah: s.alamat_sekolah || '', kepala_sekolah: s.kepala_sekolah || '',
        nip_kepala_sekolah: s.nip_kepala_sekolah || '', logo_sekolah: null, foto_libur: null,
        events: Array.isArray(s.events) ? s.events : (p.events || []),
        event_fotos: Array.isArray(s.event_fotos) ? s.event_fotos : (p.event_fotos || []),
        video_dashboard: null,
      }))
      if (s.logo_sekolah) { if (previewLogo?.startsWith('blob:')) URL.revokeObjectURL(previewLogo); setPreviewLogo(s.logo_sekolah) }
      if (s.foto_libur) { if (previewFotoLibur?.startsWith('blob:')) URL.revokeObjectURL(previewFotoLibur); setPreviewFotoLibur(s.foto_libur) }
      if (!s.foto_libur) setPreviewFotoLibur(null)
      if (s.foto_libur_2) setPreviewFotoLibur2(s.foto_libur_2); else setPreviewFotoLibur2(null)
      if (s.foto_libur_3) setPreviewFotoLibur3(s.foto_libur_3); else setPreviewFotoLibur3(null)
      if (s.foto_libur_4) setPreviewFotoLibur4(s.foto_libur_4); else setPreviewFotoLibur4(null)
      if (s.foto_libur_bg) setPreviewFotoLiburBg(s.foto_libur_bg); else setPreviewFotoLiburBg(null)
      if (s.video_dashboard) setPreviewVideoDashboard(s.video_dashboard); else setPreviewVideoDashboard(null)
      updatePengaturan({ ...s, hari_aktif: newHari, events: Array.isArray(s.events) ? s.events : [] })
      window.dispatchEvent(new CustomEvent('pengaturan-updated', { detail: { ...s, hari_aktif: newHari } }))
      toast.success('Pengaturan berhasil disimpan!', { icon: '💾' })
    } catch (err) {
      const errors = err.response?.data?.errors || {}
      if (Object.keys(errors).length) Object.values(errors).forEach(e => toast.error(Array.isArray(e) ? e[0] : e))
      else toast.error(err.response?.data?.message || 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return
    if (!['image/jpeg','image/png','image/jpg','image/svg+xml'].includes(file.type)) {
      toast.error('Format harus JPG, PNG, atau SVG'); return
    }
    if (previewLogo?.startsWith('blob:')) URL.revokeObjectURL(previewLogo)
    set('logo_sekolah', file)
    setPreviewLogo(URL.createObjectURL(file))
  }

  const tab = TABS.find(t => t.id === activeTab)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="w-14 h-14 border-4 border-slate-200 dark:border-slate-700 border-t-teal-500 rounded-full animate-spin" />
        <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap">Memuat...</p>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 px-0">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        className="relative overflow-hidden rounded-2xl shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f4c3a 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center flex-shrink-0">
            <Settings2 size={20} className="text-teal-300" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">Pengaturan Sistem</h1>
            <p className="text-xs text-white/40 mt-0.5">Konfigurasi absensi, libur, dan identitas sekolah</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-white/60 text-xs">
              <Shield size={11} className="text-teal-400" />
              <span>Admin</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="flex gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm w-full">
        {TABS.map(t => {
          const Icon = t.icon
          const active = activeTab === t.id
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${active
                  ? `bg-gradient-to-r ${t.grad} text-white shadow-md`
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Icon size={15} />
              <span className="hidden xs:inline sm:inline">{t.label}</span>
            </button>
          )
        })}
      </motion.div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">

          {/* ══ TAB: ABSENSI ══ */}
          {activeTab === 'absensi' && (
            <motion.div key="absensi" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              transition={{ duration:0.2 }} className="space-y-4">

              {/* Jam Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                {/* Section header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                    <Clock size={14} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Jadwal Waktu</p>
                    <p className="text-[11px] text-slate-400">Atur jam buka, masuk, dan pulang</p>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Jam Buka */}
                  <Field label="Buka Absen" hint="Mulai bisa scan QR" icon={Sunrise}>
                    <div className="relative">
                      <Sunrise size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="time" value={formData.jam_buka_absen}
                        onChange={e => set('jam_buka_absen', e.target.value)}
                        className={`${inputCls('focus:ring-teal-500')} pl-9`} required />
                    </div>
                  </Field>
                  {/* Jam Masuk */}
                  <Field label="Jam Masuk" hint="Batas hadir tepat waktu" icon={Clock}>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="time" value={formData.jam_masuk}
                        onChange={e => set('jam_masuk', e.target.value)}
                        className={`${inputCls('focus:ring-teal-500')} pl-9`} required />
                    </div>
                  </Field>
                  {/* Jam Pulang */}
                  <Field label="Jam Pulang" hint="Tutup absensi" icon={Sunset}>
                    <div className="relative">
                      <Sunset size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="time" value={formData.jam_pulang}
                        onChange={e => set('jam_pulang', e.target.value)}
                        className={`${inputCls('focus:ring-teal-500')} pl-9`} required />
                    </div>
                  </Field>
                </div>

                {/* Visual timeline */}
                <div className="mx-5 mb-5 p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/40">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-teal-700 dark:text-teal-300">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
                      <span>Buka: {formData.jam_buka_absen}</span>
                    </div>
                    <div className="flex-1 h-px bg-teal-200 dark:bg-teal-700" />
                    <div className="flex items-center gap-1.5 flex-1 justify-center">
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      <span>Masuk: {formData.jam_masuk}</span>
                    </div>
                    <div className="flex-1 h-px bg-teal-200 dark:bg-teal-700" />
                    <div className="flex items-center gap-1.5 flex-1 justify-end">
                      <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                      <span>Pulang: {formData.jam_pulang}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keterlambatan + Hari Aktif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Batas Keterlambatan */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <Timer size={14} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Toleransi Terlambat</p>
                      <p className="text-[11px] text-slate-400">Menit setelah jam masuk</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input type="number" min="0" max="120" value={formData.batas_keterlambatan}
                          onChange={e => set('batas_keterlambatan', parseInt(e.target.value))}
                          className={`${inputCls('focus:ring-amber-500')} pr-14 text-center text-2xl font-black`} required />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">menit</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {[5,10,15,30].map(v => (
                        <button key={v} type="button" onClick={() => set('batas_keterlambatan', v)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${formData.batas_keterlambatan === v
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600'}`}>
                          {v}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hari Aktif */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                      <Calendar size={14} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Hari Aktif</p>
                      <p className="text-[11px] text-slate-400">{formData.hari_aktif.length} hari dipilih</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {HARI_OPTIONS.map(h => {
                        const active = formData.hari_aktif.includes(h.value)
                        return (
                          <button key={h.value} type="button"
                            onClick={() => set('hari_aktif', active
                              ? formData.hari_aktif.filter(x => x !== h.value)
                              : [...formData.hari_aktif, h.value])}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                              ${active
                                ? 'bg-violet-500 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600'}`}>
                            {h.label.substring(0,3)}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3">
                      Aktif: <span className="text-violet-600 dark:text-violet-400 font-semibold">{formData.hari_aktif.join(', ') || '—'}</span>
                    </p>
                  </div>
              </div>
            </div>
            </motion.div>
          )}

          {/* ══ TAB: LIBUR ══ */}
          {activeTab === 'libur' && (
            <motion.div key="libur" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              transition={{ duration:0.2 }} className="space-y-4">

              {/* Toggle Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                        ${formData.status_libur ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <Palmtree size={20} className={formData.status_libur ? 'text-amber-500' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Status Libur</p>
                        <p className="text-xs text-slate-400">
                          {formData.status_libur ? '🏖️ Absensi dinonaktifkan saat ini' : 'Absensi berjalan normal'}
                        </p>
                      </div>
                    </div>
                    {/* Toggle switch */}
                    <button type="button" onClick={() => set('status_libur', !formData.status_libur)}
                      className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0
                        ${formData.status_libur ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all
                        ${formData.status_libur ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {formData.status_libur && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                      exit={{ opacity:0, height:0 }} className="overflow-hidden">
                      <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                        {/* Keterangan */}
                        <Field label="Keterangan Libur" icon={Info}>
                          <div className="relative">
                            <AlertCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input type="text" value={formData.keterangan_libur}
                              onChange={e => set('keterangan_libur', e.target.value)}
                              placeholder="Contoh: Libur Hari Raya Idul Fitri"
                              className={`${inputCls('focus:ring-amber-500')} pl-9`}
                              required={formData.status_libur} />
                          </div>
                        </Field>
                        {/* Tanggal */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="Tanggal Mulai" icon={Calendar}>
                            <div className="relative">
                              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              <input type="date" value={formData.tanggal_libur_mulai}
                                onChange={e => set('tanggal_libur_mulai', e.target.value)}
                                className={`${inputCls('focus:ring-amber-500')} pl-9`}
                                required={formData.status_libur} />
                            </div>
                          </Field>
                          <Field label="Tanggal Selesai" icon={Calendar}>
                            <div className="relative">
                              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              <input type="date" value={formData.tanggal_libur_selesai}
                                onChange={e => set('tanggal_libur_selesai', e.target.value)}
                                min={formData.tanggal_libur_mulai}
                                className={`${inputCls('focus:ring-amber-500')} pl-9`}
                                required={formData.status_libur} />
                            </div>
                          </Field>
                        </div>
                        {/* Preview */}
                        {formData.tanggal_libur_mulai && formData.tanggal_libur_selesai && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                            <span className="text-2xl">🏖️</span>
                            <div>
                              <p className="text-xs font-bold text-amber-700 dark:text-amber-300">{formData.keterangan_libur || 'Libur'}</p>
                              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                {new Date(formData.tanggal_libur_mulai).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}
                                {' — '}
                                {new Date(formData.tanggal_libur_selesai).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Foto Libur Upload — 4 slot */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                            <Camera size={11}/> Foto Tema Libur <span className="text-slate-400 font-normal normal-case">(maks 4 foto)</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { key:'foto_libur',   previewKey:'previewFotoLibur',   label:'Foto 1' },
                              { key:'foto_libur_2', previewKey:'previewFotoLibur2',  label:'Foto 2' },
                              { key:'foto_libur_3', previewKey:'previewFotoLibur3',  label:'Foto 3' },
                              { key:'foto_libur_4', previewKey:'previewFotoLibur4',  label:'Foto 4' },
                            ].map(({ key, label }, idx) => {
                              const previews = [previewFotoLibur, previewFotoLibur2, previewFotoLibur3, previewFotoLibur4]
                              const setters  = [setPreviewFotoLibur, setPreviewFotoLibur2, setPreviewFotoLibur3, setPreviewFotoLibur4]
                              const preview  = previews[idx]
                              const setPreview = setters[idx]
                              return (
                                <div key={key} className="flex flex-col items-center gap-2">
                                  <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 overflow-hidden bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                      {preview
                                        ? <img src={preview} alt={label} className="w-full h-full object-cover"/>
                                        : <div className="flex flex-col items-center gap-1">
                                            <span className="text-xl">🖼️</span>
                                            <span className="text-[9px] text-amber-400 font-medium">{label}</span>
                                          </div>
                                      }
                                    </div>
                                    {preview && (
                                      <button type="button"
                                        onClick={() => {
                                          if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
                                          setPreview(null)
                                          set(key, null)
                                          set(`hapus_${key}`, '1')
                                        }}
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow border-2 border-white dark:border-slate-900">
                                        <XCircle size={11}/>
                                      </button>
                                    )}
                                  </div>
                                  <input type="file" id={key} accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={(e) => {
                                      const file = e.target.files[0]; if (!file) return
                                      if (!['image/jpeg','image/png','image/jpg','image/webp'].includes(file.type)) {
                                        toast.error('Format harus JPG, PNG, atau WebP'); return
                                      }
                                      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
                                      set(key, file)
                                      set(`hapus_${key}`, '0')
                                      setPreview(URL.createObjectURL(file))
                                    }}
                                    className="hidden"/>
                                  <label htmlFor={key}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg text-[10px] font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer transition-colors">
                                    <Camera size={10}/> {preview ? 'Ganti' : 'Pilih'}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2">Foto akan ditampilkan overlapping di banner libur siswa. JPG, PNG, WebP · Maks 5MB per foto.</p>
                        </div>

                        {/* Foto Background Banner */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                            <ImageIcon size={11}/> Foto Background Banner <span className="text-slate-400 font-normal normal-case">(landscape, untuk latar belakang)</span>
                          </label>
                          <div className="flex items-start gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="w-40 h-20 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 overflow-hidden bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                {previewFotoLiburBg
                                  ? <img src={previewFotoLiburBg} alt="BG" className="w-full h-full object-cover"/>
                                  : <div className="flex flex-col items-center gap-1">
                                      <span className="text-xl">🖼️</span>
                                      <span className="text-[9px] text-amber-400 font-medium">Landscape</span>
                                    </div>
                                }
                              </div>
                              {previewFotoLiburBg && (
                                <button type="button"
                                  onClick={() => {
                                    if (previewFotoLiburBg?.startsWith('blob:')) URL.revokeObjectURL(previewFotoLiburBg)
                                    setPreviewFotoLiburBg(null)
                                    set('foto_libur_bg', null)
                                    set('hapus_foto_libur_bg', '1')
                                  }}
                                  className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow border-2 border-white dark:border-slate-900">
                                  <XCircle size={11}/>
                                </button>
                              )}
                            </div>
                            <div className="flex-1">
                              <input type="file" id="foto_libur_bg" accept="image/jpeg,image/png,image/jpg,image/webp"
                                onChange={(e) => {
                                  const file = e.target.files[0]; if (!file) return
                                  if (!['image/jpeg','image/png','image/jpg','image/webp'].includes(file.type)) {
                                    toast.error('Format harus JPG, PNG, atau WebP'); return
                                  }
                                  if (previewFotoLiburBg?.startsWith('blob:')) URL.revokeObjectURL(previewFotoLiburBg)
                                  set('foto_libur_bg', file)
                                  set('hapus_foto_libur_bg', '0')
                                  setPreviewFotoLiburBg(URL.createObjectURL(file))
                                }}
                                className="hidden"/>
                              <label htmlFor="foto_libur_bg"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer transition-colors">
                                <Camera size={13}/> Pilih Foto Background
                              </label>
                              <p className="text-[11px] text-slate-400 mt-1.5">Gunakan foto landscape (lebar) agar tidak burek. Ini yang jadi latar belakang banner libur.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Info */}
              {!formData.status_libur && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <Info size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aktifkan status libur untuk menonaktifkan absensi secara otomatis selama periode yang ditentukan. Siswa dan guru tidak bisa absen saat libur aktif.
                  </p>
                </div>
              )}
            </motion.div>
          )}


          {/* ══ TAB: EVENT ══ */}
          {activeTab === 'event' && (
            <motion.div key="event" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              transition={{ duration:0.2 }} className="space-y-4">

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                      <CalendarDays size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Event & Ujian</p>
                      <p className="text-[11px] text-slate-400">Tampil sebagai countdown di dashboard siswa</p>
                    </div>
                  </div>
                  <button type="button"
                    onClick={() => set('events', [...(formData.events||[]), { nama:'', tanggal:'', ikon:'default', warna:'biru' }])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors">
                    <Plus size={12}/> Tambah Event
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  {(!formData.events || formData.events.length === 0) && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <CalendarDays size={32} className="mx-auto mb-2 opacity-30"/>
                      <p>Belum ada event. Klik "Tambah Event" untuk mulai.</p>
                    </div>
                  )}
                  {(formData.events||[]).map((ev, idx) => (
                    <div key={idx} className="relative grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                      {/* Nama */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nama Event</label>
                        <input type="text" value={ev.nama||''} placeholder="cth: Ujian Tengah Semester"
                          onChange={e => {
                            const evs = [...(formData.events||[])]
                            evs[idx] = { ...evs[idx], nama: e.target.value }
                            set('events', evs)
                          }}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"/>
                      </div>
                      {/* Tanggal */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tanggal</label>
                        <input type="date" value={ev.tanggal||''}
                          onChange={e => {
                            const evs = [...(formData.events||[])]
                            evs[idx] = { ...evs[idx], tanggal: e.target.value }
                            set('events', evs)
                          }}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"/>
                      </div>
                      {/* Ikon + Warna + Hapus */}
                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ikon</label>
                          <select value={ev.ikon||'default'}
                            onChange={e => {
                              const evs = [...(formData.events||[])]
                              evs[idx] = { ...evs[idx], ikon: e.target.value }
                              set('events', evs)
                            }}
                            className="w-full px-2 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100">
                            <option value="ujian">📝 Ujian</option>
                            <option value="ulangan">📋 Ulangan</option>
                            <option value="lomba">🏆 Lomba</option>
                            <option value="wisuda">🎓 Wisuda</option>
                            <option value="libur">🏖️ Libur</option>
                            <option value="rapat">📅 Rapat</option>
                            <option value="olahraga">⚽ Olahraga</option>
                            <option value="seni">🎨 Seni</option>
                            <option value="default">📌 Lainnya</option>
                          </select>
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Warna</label>
                          <select value={ev.warna||'biru'}
                            onChange={e => {
                              const evs = [...(formData.events||[])]
                              evs[idx] = { ...evs[idx], warna: e.target.value }
                              set('events', evs)
                            }}
                            className="w-full px-2 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100">
                            <option value="merah">🔴 Merah</option>
                            <option value="oranye">🟠 Oranye</option>
                            <option value="kuning">🟡 Kuning</option>
                            <option value="hijau">🟢 Hijau</option>
                            <option value="biru">🔵 Biru</option>
                            <option value="ungu">🟣 Ungu</option>
                            <option value="pink">🩷 Pink</option>
                          </select>
                        </div>
                        <button type="button"
                          onClick={() => {
                            const evs = [...(formData.events||[])]
                            evs.splice(idx, 1)
                            set('events', evs)
                          }}
                          className="flex-shrink-0 p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors mb-0.5">
                          <Trash2 size={14}/>
                        </button>
                      {/* Foto Event */}
                      <div className="sm:col-span-4 flex items-center gap-3 pt-1 border-t border-slate-200 dark:border-slate-700/60 mt-1">
                        <div className="relative flex-shrink-0">
                          {(formData.event_fotos||[])[idx]
                            ? <img src={typeof (formData.event_fotos||[])[idx] === 'string' && (formData.event_fotos||[])[idx].startsWith('blob:') ? (formData.event_fotos||[])[idx] : (previewEventFotos[idx] || (formData.event_fotos||[])[idx])} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700"/>
                            : <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800"><ImageIcon size={16} className="text-slate-300"/></div>
                          }
                          {(formData.event_fotos||[])[idx] && (
                            <button type="button" onClick={() => {
                              const fotos = [...(formData.event_fotos||[])]
                              if (previewEventFotos[idx]?.startsWith('blob:')) URL.revokeObjectURL(previewEventFotos[idx])
                              fotos[idx] = null
                              set('event_fotos', fotos)
                              setPreviewEventFotos(p => ({ ...p, [idx]: null }))
                            }} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow">
                              <XCircle size={10}/>
                            </button>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Foto Event (opsional)</label>
                          <input type="file" id={`event_foto_${idx}`} accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={e => {
                              const file = e.target.files[0]; if (!file) return
                              if (file.size > 3 * 1024 * 1024) { toast.error('Foto maks 3MB'); return }
                              const fotos = [...(formData.event_fotos||[])]
                              while (fotos.length <= idx) fotos.push(null)
                              if (previewEventFotos[idx]?.startsWith('blob:')) URL.revokeObjectURL(previewEventFotos[idx])
                              fotos[idx] = file
                              set('event_fotos', fotos)
                              setPreviewEventFotos(p => ({ ...p, [idx]: URL.createObjectURL(file) }))
                            }}
                            className="hidden"/>
                          <label htmlFor={`event_foto_${idx}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-lg text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer transition-colors">
                            <Camera size={11}/> Pilih Foto
                          </label>
                          <p className="text-[10px] text-slate-400">JPG, PNG · Maks 3MB</p>
                        </div>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}


          {/* ══ TAB: BUDAYA ══ */}
          {activeTab === 'budaya' && (
            <motion.div key="budaya" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              transition={{ duration:0.2 }} className="space-y-4">

              {/* Info Budaya */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                    <Globe size={14} className="text-rose-600 dark:text-rose-400"/>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Info Budaya & Destinasi</p>
                    <p className="text-[11px] text-slate-400">Tampil di dashboard siswa sebagai edukasi harian</p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {/* Judul */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Judul / Nama Tempat</label>
                    <input type="text" value={formData.budaya_info?.judul||''} placeholder="cth: Candi Borobudur, Tari Saman..."
                      onChange={e => set('budaya_info', {...(formData.budaya_info||{}), judul: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"/>
                  </div>
                  {/* Deskripsi */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Deskripsi</label>
                    <textarea rows={3} value={formData.budaya_info?.deskripsi||''} placeholder="Ceritakan tentang budaya atau destinasi ini..."
                      onChange={e => set('budaya_info', {...(formData.budaya_info||{}), deskripsi: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100 resize-none"/>
                  </div>
                </div>
              </div>

              {/* Kuis */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                    <HelpCircle size={14} className="text-violet-600 dark:text-violet-400"/>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Kuis Budaya</p>
                    <p className="text-[11px] text-slate-400">Pertanyaan interaktif untuk siswa</p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pertanyaan</label>
                    <input type="text" value={formData.budaya_info?.pertanyaan||''} placeholder="cth: Tari Saman berasal dari provinsi mana?"
                      onChange={e => set('budaya_info', {...(formData.budaya_info||{}), pertanyaan: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pilihan Jawaban (klik radio = jawaban benar)</label>
                    {(formData.budaya_info?.pilihan || ['','','']).map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button type="button"
                          onClick={() => set('budaya_info', {...(formData.budaya_info||{}), jawaban_benar: i})}
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            (formData.budaya_info?.jawaban_benar ?? 0) === i
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}>
                          {(formData.budaya_info?.jawaban_benar ?? 0) === i && (
                            <div className="w-2 h-2 rounded-full bg-white"/>
                          )}
                        </button>
                        <span className="text-[10px] font-bold text-slate-400 w-4">{String.fromCharCode(65+i)}</span>
                        <input type="text" value={p} placeholder={`Pilihan ${String.fromCharCode(65+i)}`}
                          onChange={e => {
                            const arr = [...(formData.budaya_info?.pilihan || ['','',''])]
                            arr[i] = e.target.value
                            set('budaya_info', {...(formData.budaya_info||{}), pilihan: arr})
                          }}
                          className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"/>
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-400">● hijau = jawaban benar</p>
                  </div>
                </div>
              </div>

              {/* 7 Foto */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                    <ImageIcon size={14} className="text-rose-600 dark:text-rose-400"/>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Foto Budaya (maks 7)</p>
                    <p className="text-[11px] text-slate-400">Slideshow otomatis di dashboard siswa</p>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({length:7}).map((_, idx) => {
                    const preview = previewBudayaFotos[idx]
                    const hasFile = !!(formData.budaya_fotos||[])[idx]
                    return (
                      <div key={idx} className="relative group">
                        <div className="aspect-video rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                          {preview
                            ? <img src={preview} alt="" className="w-full h-full object-cover"/>
                            : <div className="flex flex-col items-center gap-1 text-slate-300">
                                <ImageIcon size={20}/>
                                <span className="text-[9px] font-bold">Foto {idx+1}</span>
                              </div>
                          }
                        </div>
                        {hasFile && (
                          <button type="button"
                            onClick={() => {
                              const fotos = [...(formData.budaya_fotos||Array(7).fill(null))]
                              if (previewBudayaFotos[idx]?.startsWith('blob:')) URL.revokeObjectURL(previewBudayaFotos[idx])
                              fotos[idx] = null
                              set('budaya_fotos', fotos)
                              const prev = [...previewBudayaFotos]; prev[idx] = null
                              setPreviewBudayaFotos(prev)
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow border-2 border-white dark:border-slate-900 z-10">
                            <XCircle size={11}/>
                          </button>
                        )}
                        <input type="file" id={`budaya_foto_${idx}`} accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={e => {
                            const file = e.target.files[0]; if (!file) return
                            if (file.size > 5*1024*1024) { toast.error('Foto maks 5MB'); return }
                            const fotos = [...(formData.budaya_fotos||Array(7).fill(null))]
                            if (previewBudayaFotos[idx]?.startsWith('blob:')) URL.revokeObjectURL(previewBudayaFotos[idx])
                            fotos[idx] = file
                            set('budaya_fotos', fotos)
                            const prev = [...previewBudayaFotos]; prev[idx] = URL.createObjectURL(file)
                            setPreviewBudayaFotos(prev)
                          }}
                          className="hidden"/>
                        <label htmlFor={`budaya_foto_${idx}`}
                          className="mt-1.5 flex items-center justify-center gap-1 w-full py-1 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-lg text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 cursor-pointer transition-colors">
                          <Camera size={10}/> {preview ? 'Ganti' : 'Upload'}
                        </label>
                      </div>
                    )
                  })}

                {/* Video Budaya — item ke-8 di slideshow */}
                <div className="col-span-2 sm:col-span-3 lg:col-span-4 border-t border-slate-200 dark:border-slate-700/60 pt-3 mt-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Video Budaya (item ke-8 di slideshow)</p>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {previewBudayaVideo
                        ? <video src={previewBudayaVideo} className="w-32 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700" muted autoPlay loop playsInline/>
                        : <div className="w-32 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 gap-1">
                            <ImageIcon size={16} className="text-slate-300"/>
                            <span className="text-[8px] text-slate-400 font-bold">Video</span>
                          </div>
                      }
                      {formData.budaya_video && (
                        <button type="button" onClick={() => {
                          if (previewBudayaVideo?.startsWith('blob:')) URL.revokeObjectURL(previewBudayaVideo)
                          set('budaya_video', null)
                          set('hapus_budaya_video', '1')
                          setPreviewBudayaVideo(null)
                        }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow border-2 border-white dark:border-slate-900">
                          <XCircle size={11}/>
                        </button>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input type="file" id="budaya_video" accept="video/mp4,video/webm"
                        onChange={e => {
                          const file = e.target.files[0]; if (!file) return
                          if (file.size > 50*1024*1024) { toast.error('Video maks 50MB'); return }
                          if (previewBudayaVideo?.startsWith('blob:')) URL.revokeObjectURL(previewBudayaVideo)
                          set('budaya_video', file)
                          set('hapus_budaya_video', '0')
                          setPreviewBudayaVideo(URL.createObjectURL(file))
                        }}
                        className="hidden"/>
                      <label htmlFor="budaya_video"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 rounded-lg text-[10px] font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-100 cursor-pointer transition-colors">
                        <ImageIcon size={10}/> Pilih Video
                      </label>
                      <p className="text-[10px] text-slate-400">MP4, WebM · Maks 50MB · Muncul sebagai item terakhir slideshow</p>
                    </div>
                  </div>
                </div>

                {/* Video Budaya 2 — item ke-9 */}
                <div className="col-span-2 sm:col-span-3 lg:col-span-4 border-t border-slate-200 dark:border-slate-700/60 pt-3 mt-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Video Budaya 2 (item ke-9 di slideshow)</p>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {previewBudayaVideo2
                        ? <video src={previewBudayaVideo2} className="w-32 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700" muted autoPlay loop playsInline/>
                        : <div className="w-32 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 gap-1">
                            <ImageIcon size={16} className="text-slate-300"/>
                            <span className="text-[8px] text-slate-400 font-bold">Video 2</span>
                          </div>
                      }
                      {formData.budaya_video_2 && (
                        <button type="button" onClick={() => {
                          if (previewBudayaVideo2?.startsWith('blob:')) URL.revokeObjectURL(previewBudayaVideo2)
                          set('budaya_video_2', null)
                          set('hapus_budaya_video_2', '1')
                          setPreviewBudayaVideo2(null)
                        }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow border-2 border-white dark:border-slate-900">
                          <XCircle size={11}/>
                        </button>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input type="file" id="budaya_video_2" accept="video/mp4,video/webm"
                        onChange={e => {
                          const file = e.target.files[0]; if (!file) return
                          if (file.size > 50*1024*1024) { toast.error('Video maks 50MB'); return }
                          if (previewBudayaVideo2?.startsWith('blob:')) URL.revokeObjectURL(previewBudayaVideo2)
                          set('budaya_video_2', file)
                          set('hapus_budaya_video_2', '0')
                          setPreviewBudayaVideo2(URL.createObjectURL(file))
                        }}
                        className="hidden"/>
                      <label htmlFor="budaya_video_2"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 rounded-lg text-[10px] font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-100 cursor-pointer transition-colors">
                        <ImageIcon size={10}/> Pilih Video 2
                      </label>
                      <p className="text-[10px] text-slate-400">MP4, WebM · Maks 50MB · Item ke-9 (opsional)</p>
                    </div>
                  </div>
                </div>

                {/* Background Budaya */}
                <div className="col-span-2 sm:col-span-3 lg:col-span-4 border-t border-slate-200 dark:border-slate-700/60 pt-3 mt-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Background Komponen Budaya</p>
                  <p className="text-[10px] text-slate-400 mb-2">Ganti foto batik default dengan foto kamu sendiri. Akan muncul sebagai background di dashboard siswa.</p>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {formData.budaya_bg
                        ? <img src={typeof formData.budaya_bg === 'string' ? formData.budaya_bg : (previewBudayaBg || '')} alt="" className="w-32 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"/>
                        : <div className="w-32 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 gap-1">
                            <ImageIcon size={16} className="text-slate-300"/>
                            <span className="text-[8px] text-slate-400 font-bold">Background</span>
                          </div>
                      }
                      {formData.budaya_bg && (
                        <button type="button" onClick={() => {
                          if (previewBudayaBg?.startsWith('blob:')) URL.revokeObjectURL(previewBudayaBg)
                          set('budaya_bg', null)
                          set('hapus_budaya_bg', '1')
                          setPreviewBudayaBg(null)
                        }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow border-2 border-white dark:border-slate-900">
                          <XCircle size={11}/>
                        </button>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input type="file" id="budaya_bg" accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={e => {
                          const file = e.target.files[0]; if (!file) return
                          if (file.size > 5*1024*1024) { toast.error('Foto maks 5MB'); return }
                          if (previewBudayaBg?.startsWith('blob:')) URL.revokeObjectURL(previewBudayaBg)
                          set('budaya_bg', file)
                          set('hapus_budaya_bg', '0')
                          setPreviewBudayaBg(URL.createObjectURL(file))
                        }}
                        className="hidden"/>
                      <label htmlFor="budaya_bg"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg text-[10px] font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer transition-colors">
                        <Camera size={10}/> Pilih Background
                      </label>
                      <p className="text-[10px] text-slate-400">JPG, PNG, WebP · Maks 5MB · Rekomendasi: foto batik landscape</p>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </motion.div>
          )}


          {/* ══ TAB: ALAM ══ */}
          {activeTab === 'alam' && (
            <motion.div key="alam" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              transition={{ duration:0.2 }} className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Mountain size={14} className="text-emerald-600 dark:text-emerald-400"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Keindahan Alam Indonesia</p>
                  <p className="text-[11px] text-slate-400">Galeri foto alam daerah — tampil di bawah komponen Budaya</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {/* Judul + Deskripsi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Judul Strip Atas</label>
                    <input type="text" value={formData.alam_info?.judul||''} placeholder="cth: Keindahan Alam Bali"
                      onChange={e => set('alam_info', {...(formData.alam_info||{}), judul: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Judul Strip Bawah</label>
                    <input type="text" value={formData.alam_info?.judul_2||''} placeholder="cth: Pesona Pantai Lombok"
                      onChange={e => set('alam_info', {...(formData.alam_info||{}), judul_2: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Deskripsi Singkat</label>
                    <input type="text" value={formData.alam_info?.deskripsi||''} placeholder="cth: Pesona alam Pulau Dewata"
                      onChange={e => set('alam_info', {...(formData.alam_info||{}), deskripsi: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"/>
                  </div>
                </div>
                {/* 7 Foto Strip Atas */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 block">7 Foto Alam Strip Atas (portrait)</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {Array.from({length:7}).map((_, idx) => {
                      const preview = previewAlamFotos[idx]
                      const hasFile = !!(formData.alam_fotos||[])[idx]
                      return (
                        <div key={idx} className="relative group">
                          <div className="rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex items-center justify-center" style={{aspectRatio:'3/4'}}>
                            {preview
                              ? <img src={preview} alt="" className="w-full h-full object-cover"/>
                              : <div className="flex flex-col items-center gap-1 text-slate-300">
                                  <ImageIcon size={16}/>
                                  <span className="text-[8px] font-bold">{idx+1}</span>
                                </div>
                            }
                          </div>
                          {hasFile && (
                            <button type="button"
                              onClick={() => {
                                const fotos = [...(formData.alam_fotos||Array(7).fill(null))]
                                if (previewAlamFotos[idx]?.startsWith('blob:')) URL.revokeObjectURL(previewAlamFotos[idx])
                                fotos[idx] = null
                                set('alam_fotos', fotos)
                                const prev = [...previewAlamFotos]; prev[idx] = null
                                setPreviewAlamFotos(prev)
                              }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow border-2 border-white dark:border-slate-900 z-10">
                              <XCircle size={11}/>
                            </button>
                          )}
                          <input type="file" id={`alam_foto_${idx}`} accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={e => {
                              const file = e.target.files[0]; if (!file) return
                              if (file.size > 5*1024*1024) { toast.error('Foto maks 5MB'); return }
                              const fotos = [...(formData.alam_fotos||Array(7).fill(null))]
                              if (previewAlamFotos[idx]?.startsWith('blob:')) URL.revokeObjectURL(previewAlamFotos[idx])
                              fotos[idx] = file
                              set('alam_fotos', fotos)
                              const prev = [...previewAlamFotos]; prev[idx] = URL.createObjectURL(file)
                              setPreviewAlamFotos(prev)
                            }}
                            className="hidden"/>
                          <label htmlFor={`alam_foto_${idx}`}
                            className="mt-1 flex items-center justify-center gap-1 w-full py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 cursor-pointer transition-colors">
                            <Camera size={9}/> {preview ? 'Ganti' : 'Upload'}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 7 Foto Strip Bawah */}
                <div className="border-t border-slate-200 dark:border-slate-700/60 pt-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 block">7 Foto Alam Strip Bawah (scroll ke kanan)</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {Array.from({length:7}).map((_, idx) => {
                      const preview = previewAlamFotos2[idx]
                      const hasFile = !!(formData.alam_fotos_2||[])[idx]
                      return (
                        <div key={idx} className="relative group">
                          <div className="rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex items-center justify-center" style={{aspectRatio:'16/9'}}>
                            {preview
                              ? <img src={preview} alt="" className="w-full h-full object-cover"/>
                              : <div className="flex flex-col items-center gap-1 text-slate-300">
                                  <ImageIcon size={14}/>
                                  <span className="text-[8px] font-bold">{idx+1}</span>
                                </div>
                            }
                          </div>
                          {hasFile && (
                            <button type="button"
                              onClick={() => {
                                const fotos = [...(formData.alam_fotos_2||Array(7).fill(null))]
                                if (previewAlamFotos2[idx]?.startsWith('blob:')) URL.revokeObjectURL(previewAlamFotos2[idx])
                                fotos[idx] = null
                                set('alam_fotos_2', fotos)
                                const prev = [...previewAlamFotos2]; prev[idx] = null
                                setPreviewAlamFotos2(prev)
                              }}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow border border-white dark:border-slate-900 z-10">
                              <XCircle size={9}/>
                            </button>
                          )}
                          <input type="file" id={`alam_foto_2_${idx}`} accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={e => {
                              const file = e.target.files[0]; if (!file) return
                              if (file.size > 5*1024*1024) { toast.error('Foto maks 5MB'); return }
                              const fotos = [...(formData.alam_fotos_2||Array(7).fill(null))]
                              if (previewAlamFotos2[idx]?.startsWith('blob:')) URL.revokeObjectURL(previewAlamFotos2[idx])
                              fotos[idx] = file
                              set('alam_fotos_2', fotos)
                              const prev = [...previewAlamFotos2]; prev[idx] = URL.createObjectURL(file)
                              setPreviewAlamFotos2(prev)
                            }}
                            className="hidden"/>
                          <label htmlFor={`alam_foto_2_${idx}`}
                            className="mt-1 flex items-center justify-center gap-1 w-full py-0.5 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800/40 rounded-lg text-[8px] font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 cursor-pointer transition-colors">
                            <Camera size={8}/> {preview ? 'Ganti' : 'Upload'}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Background Alam */}
                <div className="border-t border-slate-200 dark:border-slate-700/60 pt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Background Komponen Alam</p>
                  <p className="text-[10px] text-slate-400 mb-2">Foto background di belakang strip foto alam. Rekomendasi: foto alam landscape.</p>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {formData.alam_bg
                        ? <img src={typeof formData.alam_bg === 'string' ? formData.alam_bg : ''} alt="" className="w-32 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"/>
                        : <div className="w-32 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                            <ImageIcon size={16} className="text-slate-300"/>
                          </div>
                      }
                      {formData.alam_bg && (
                        <button type="button" onClick={() => { set('alam_bg', null); set('hapus_alam_bg', '1') }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow border-2 border-white dark:border-slate-900">
                          <XCircle size={11}/>
                        </button>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input type="file" id="alam_bg" accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={e => {
                          const file = e.target.files[0]; if (!file) return
                          if (file.size > 5*1024*1024) { toast.error('Foto maks 5MB'); return }
                          set('alam_bg', file); set('hapus_alam_bg', '0')
                        }}
                        className="hidden"/>
                      <label htmlFor="alam_bg"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer transition-colors">
                        <Camera size={10}/> Pilih Background
                      </label>
                      <p className="text-[10px] text-slate-400">JPG, PNG · Maks 5MB · Landscape</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          )}

          {/* ══ TAB: PRESTASI ══ */}
          {activeTab === 'prestasi' && (
            <motion.div key="prestasi" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              transition={{ duration:0.2 }} className="space-y-4">

              {/* Info section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-900/10">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <Award size={14} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Siswa Berprestasi</p>
                    <p className="text-[11px] text-slate-400">Tampil di dashboard guru dan siswa</p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <Field label="Judul Section" icon={Award}>
                    <input type="text" value={formData.prestasi_judul}
                      onChange={e => set('prestasi_judul', e.target.value)}
                      placeholder="Siswa Berprestasi Bulan Ini"
                      className={inputCls('focus:ring-amber-500')} />
                  </Field>
                  <Field label="Deskripsi" icon={Info}>
                    <textarea value={formData.prestasi_deskripsi}
                      onChange={e => set('prestasi_deskripsi', e.target.value)}
                      placeholder="Selamat kepada siswa-siswa terbaik kita!"
                      rows={2} className={`${inputCls('focus:ring-amber-500')} resize-none`} />
                  </Field>
                </div>
              </div>

              {/* Daftar siswa */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Daftar Siswa</p>
                    <p className="text-[11px] text-slate-400">Maks 10 siswa · Klik foto untuk upload</p>
                  </div>
                  <button type="button"
                    onClick={() => {
                      const list = [...(formData.prestasi_siswa||[])]
                      if (list.length >= 10) { toast.error('Maks 10 siswa'); return }
                      list.push({ nama:'', kelas:'', prestasi:'', foto_path:null, foto_url:null, _fotoFile:null, _hapusFoto:false })
                      set('prestasi_siswa', list)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
                    <Plus size={12}/> Tambah
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  {(formData.prestasi_siswa||[]).length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Belum ada siswa. Klik "Tambah" untuk menambahkan.
                    </div>
                  )}
                  {(formData.prestasi_siswa||[]).map((siswa, idx) => {
                    const previewSrc = siswa._fotoFile ? URL.createObjectURL(siswa._fotoFile) : (siswa.foto_url || null)
                    return (
                      <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                        {/* Foto */}
                        <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 cursor-pointer group"
                          onClick={() => document.getElementById(`prestasi-foto-${idx}`)?.click()}>
                          {previewSrc
                            ? <img src={previewSrc} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Camera size={18} className="text-slate-400"/></div>}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={14} className="text-white"/>
                          </div>
                          {previewSrc && (
                            <button type="button"
                              onClick={e => {
                                e.stopPropagation()
                                const list = [...(formData.prestasi_siswa||[])]
                                list[idx] = { ...list[idx], _fotoFile:null, foto_url:null, foto_path:null, _hapusFoto:true }
                                set('prestasi_siswa', list)
                              }}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                              <XCircle size={9} className="text-white"/>
                            </button>
                          )}
                          <input id={`prestasi-foto-${idx}`} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                            onChange={e => {
                              const f = e.target.files[0]; if (!f) return
                              if (f.size > 3*1024*1024) { toast.error('Foto maks 3MB'); return }
                              const list = [...(formData.prestasi_siswa||[])]
                              list[idx] = { ...list[idx], _fotoFile:f, _hapusFoto:false }
                              set('prestasi_siswa', list)
                              e.target.value = ''
                            }}/>
                        </div>

                        {/* Fields */}
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <input type="text" value={siswa.nama}
                            onChange={e => {
                              const list = [...(formData.prestasi_siswa||[])]
                              list[idx] = { ...list[idx], nama: e.target.value }
                              set('prestasi_siswa', list)
                            }}
                            placeholder="Nama Siswa"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all font-semibold" />
                          <input type="text" value={siswa.kelas}
                            onChange={e => {
                              const list = [...(formData.prestasi_siswa||[])]
                              list[idx] = { ...list[idx], kelas: e.target.value }
                              set('prestasi_siswa', list)
                            }}
                            placeholder="Kelas (contoh: XII TKJ 1)"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all" />
                          <input type="text" value={siswa.prestasi}
                            onChange={e => {
                              const list = [...(formData.prestasi_siswa||[])]
                              list[idx] = { ...list[idx], prestasi: e.target.value }
                              set('prestasi_siswa', list)
                            }}
                            placeholder="Prestasi (contoh: Juara 1 OSN Matematika)"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all" />
                        </div>

                        {/* Hapus */}
                        <button type="button"
                          onClick={() => {
                            const list = [...(formData.prestasi_siswa||[])]
                            list.splice(idx, 1)
                            set('prestasi_siswa', list)
                          }}
                          className="flex-shrink-0 w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors self-start mt-0.5">
                          <Trash2 size={12} className="text-rose-500"/>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ TAB: SEKOLAH ══ */}
          {activeTab === 'sekolah' && (
            <motion.div key="sekolah" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              transition={{ duration:0.2 }} className="space-y-4">

              {/* Logo + Nama */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Building2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Identitas Sekolah</p>
                    <p className="text-[11px] text-slate-400">Digunakan pada laporan dan dokumen resmi</p>
                  </div>
                </div>
                <div className="p-5 space-y-5">
                  {/* Logo upload */}
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        {previewLogo
                          ? <img src={previewLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                          : <ImageIcon size={24} className="text-slate-300" />}
                      </div>
                      {formData.logo_sekolah && (
                        <button type="button" onClick={() => { set('logo_sekolah', null); setPreviewLogo(null) }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow">
                          <XCircle size={12} />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Logo Sekolah</p>
                      <input type="file" id="logo" accept="image/jpeg,image/png,image/jpg,image/svg+xml" onChange={handleFile} className="hidden" />
                      <label htmlFor="logo"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer transition-colors">
                        <Camera size={13} /> Pilih Logo
                      </label>
                      <p className="text-[11px] text-slate-400">JPG, PNG, SVG · Maks 2MB</p>
                    </div>
                  </div>

                  {/* Nama Sekolah */}
                  <Field label="Nama Sekolah" icon={School}>
                    <div className="relative">
                      <School size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="text" value={formData.nama_sekolah}
                        onChange={e => set('nama_sekolah', e.target.value)}
                        placeholder="Masukkan nama sekolah"
                        className={`${inputCls('focus:ring-emerald-500')} pl-9`} required />
                    </div>
                  </Field>

                  {/* Alamat */}
                  <Field label="Alamat Sekolah" icon={MapPin}>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                      <textarea value={formData.alamat_sekolah}
                        onChange={e => set('alamat_sekolah', e.target.value)}
                        placeholder="Masukkan alamat lengkap sekolah"
                        rows={2}
                        className={`${inputCls('focus:ring-emerald-500')} pl-9 resize-none`} />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Kepala Sekolah */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                    <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Kepala Sekolah</p>
                    <p className="text-[11px] text-slate-400">Untuk tanda tangan laporan</p>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nama Kepala Sekolah" icon={User}>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="text" value={formData.kepala_sekolah}
                        onChange={e => set('kepala_sekolah', e.target.value)}
                        placeholder="Nama lengkap"
                        className={`${inputCls('focus:ring-indigo-500')} pl-9`} />
                    </div>
                  </Field>
                  <Field label="NIP" icon={Hash}>
                    <div className="relative">
                      <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="text" value={formData.nip_kepala_sekolah}
                        onChange={e => set('nip_kepala_sekolah', e.target.value)}
                        placeholder="Nomor Induk Pegawai"
                        className={`${inputCls('focus:ring-indigo-500')} pl-9`} />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Video Dashboard */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                    <ImageIcon size={14} className="text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Video Dashboard</p>
                    <p className="text-[11px] text-slate-400">Tampil di dashboard siswa & guru. MP4, maks 50MB</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="relative flex-shrink-0">
                      {previewVideoDashboard
                        ? <video src={previewVideoDashboard} className="w-32 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700" muted autoPlay loop playsInline/>
                        : <div className="w-32 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                            <ImageIcon size={20} className="text-slate-300"/>
                          </div>
                      }
                      {previewVideoDashboard && (
                        <button type="button" onClick={() => {
                          if (previewVideoDashboard?.startsWith('blob:')) URL.revokeObjectURL(previewVideoDashboard)
                          set('video_dashboard', null)
                          set('hapus_video_dashboard', '1')
                          setPreviewVideoDashboard(null)
                        }} className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow border-2 border-white dark:border-slate-900">
                          <XCircle size={12}/>
                        </button>
                      )}
                    </div>
                    {/* Upload */}
                    <div className="flex-1 space-y-2">
                      <input type="file" id="video_dashboard" accept="video/mp4,video/webm,video/ogg"
                        onChange={e => {
                          const file = e.target.files[0]; if (!file) return
                          if (file.size > 50 * 1024 * 1024) { toast.error('Video maks 50MB'); return }
                          if (previewVideoDashboard?.startsWith('blob:')) URL.revokeObjectURL(previewVideoDashboard)
                          set('video_dashboard', file)
                          set('hapus_video_dashboard', '0')
                          setPreviewVideoDashboard(URL.createObjectURL(file))
                        }}
                        className="hidden"/>
                      <label htmlFor="video_dashboard"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 cursor-pointer transition-colors">
                        <ImageIcon size={13}/> Pilih Video
                      </label>
                      <p className="text-[11px] text-slate-400">MP4, WebM · Maks 50MB · Landscape direkomendasikan</p>
                      {!formData.video_dashboard && (
                        <p className="text-[11px] text-slate-400">Jika kosong, menggunakan <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">/video/videodash.mp4</code></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── SAVE BUTTON ── */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200 dark:border-slate-700/60">
          <p className="text-xs text-slate-400 hidden sm:block">
            <Sparkles size={11} className="inline mr-1 text-teal-400" />
            Perubahan akan langsung berlaku setelah disimpan
          </p>
          <button type="submit" disabled={saving}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600
              shadow-lg shadow-teal-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed
              active:scale-95">
            {saving
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
              : <><Save size={15} /> Simpan Pengaturan</>}
          </button>
        </motion.div>
      </form>
    </div>
  )
}
