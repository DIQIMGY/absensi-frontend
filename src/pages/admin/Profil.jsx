import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Camera, Save, Loader, X,
  Eye, EyeOff, Shield, Lock, CheckCircle,
  KeyRound, AlertCircle,
} from 'lucide-react'
import { adminApi } from '../../services/adminService'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

const iv = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 130, damping: 16 } } }
const cv = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }

const inputCls = 'w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'

const COVER_GRADIENT = 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #059669 75%, #0d9488 100%)'

const TABS = [
  { id: 'profil',   label: 'Profil',   icon: User },
  { id: 'password', label: 'Password', icon: KeyRound },
]

export default function AdminProfil() {
  const { user, checkAuth } = useAuthStore()
  const [loading, setLoading]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [activeTab, setActiveTab]     = useState('profil')

  // Form profil
  const [name, setName]   = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  // Foto
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile]       = useState(null)
  const fotoInputRef = useRef(null)

  // Password
  const [pwForm, setPwForm] = useState({ password: '', password_confirmation: '' })
  const [showPw, setShowPw] = useState({ password: false, confirm: false })
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    setName(user?.name || '')
    setEmail(user?.email || '')
    setFotoPreview(getFoto())
  }, [user])

  useEffect(() => {
    return () => { if (fotoPreview?.startsWith('blob:')) URL.revokeObjectURL(fotoPreview) }
  }, [fotoPreview])

  const getFoto = () => {
    return user?.foto_url || user?.siswa?.foto_url || user?.guru?.foto_url || null
  }

  const initial = (user?.name || 'A').charAt(0).toUpperCase()

  // ── UPLOAD FOTO ──────────────────────────────────────────────
  const handleFotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Foto maksimal 2MB'); return }
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return }

    // Preview langsung
    const url = URL.createObjectURL(file)
    setFotoPreview(url)
    setFotoFile(file)

    // Upload langsung
    setUploadingFoto(true)
    try {
      const fd = new FormData()
      fd.append('foto', file)
      await adminApi.uploadFotoUser(user.id, fd)
      await checkAuth()
      toast.success('Foto profil diperbarui!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal upload foto')
      setFotoPreview(getFoto())
    } finally {
      setUploadingFoto(false)
      if (fotoInputRef.current) fotoInputRef.current.value = ''
    }
  }

  // ── SAVE PROFIL ───────────────────────────────────────────────
  const handleSaveProfil = async () => {
    if (!name.trim()) { toast.error('Nama tidak boleh kosong'); return }
    if (!email.trim()) { toast.error('Email tidak boleh kosong'); return }

    setSaving(true)
    try {
      await adminApi.updateUser(user.id, {
        name: name.trim(),
        email: email.trim(),
        role: 'admin',
      })
      await checkAuth()
      toast.success('Profil berhasil diperbarui!')
    } catch (e) {
      const msg = e.response?.data?.message || ''
      const errors = e.response?.data?.errors || {}
      if (errors.email) toast.error(errors.email[0])
      else if (errors.name) toast.error(errors.name[0])
      else toast.error(msg || 'Gagal memperbarui profil')
    } finally {
      setSaving(false)
    }
  }

  // ── SAVE PASSWORD ─────────────────────────────────────────────
  const handleSavePassword = async () => {
    if (!pwForm.password || pwForm.password.length < 6) { toast.error('Password baru minimal 6 karakter'); return }
    if (pwForm.password !== pwForm.password_confirmation) { toast.error('Konfirmasi password tidak cocok'); return }

    setSavingPw(true)
    try {
      await adminApi.resetPassword(user.id, {
        password: pwForm.password,
        password_confirmation: pwForm.password_confirmation,
      })
      toast.success('Password berhasil diubah!')
      setPwForm({ current: '', password: '', password_confirmation: '' })
    } catch (e) {
      const msg = e.response?.data?.message || ''
      const errors = e.response?.data?.errors || {}
      if (errors.password) toast.error(errors.password[0])
      else toast.error(msg || 'Gagal mengubah password')
    } finally {
      setSavingPw(false)
    }
  }

  const pwStrength = (pw) => {
    if (!pw) return null
    let score = 0
    if (pw.length >= 8)  score++
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { label: 'Lemah',   color: 'bg-rose-500',   w: 'w-1/5',  text: 'text-rose-500' }
    if (score <= 2) return { label: 'Cukup',   color: 'bg-amber-500',  w: 'w-2/5',  text: 'text-amber-500' }
    if (score <= 3) return { label: 'Sedang',  color: 'bg-yellow-400', w: 'w-3/5',  text: 'text-yellow-500' }
    if (score <= 4) return { label: 'Kuat',    color: 'bg-emerald-500',w: 'w-4/5',  text: 'text-emerald-500' }
    return               { label: 'Sangat Kuat', color: 'bg-emerald-400', w: 'w-full', text: 'text-emerald-400' }
  }

  const strength = pwStrength(pwForm.password)

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* ══ COVER + AVATAR ══ */}
      <div className="relative">
        {/* Cover */}
        <div className="relative w-full rounded-t-2xl overflow-hidden" style={{ aspectRatio: '16/5' }}>
          <div className="w-full h-full" style={{ background: COVER_GRADIENT }}>
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '18px 18px' }}/>
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none"/>
            <div className="absolute bottom-0 left-1/3 w-36 h-36 rounded-full bg-teal-300/15 blur-2xl pointer-events-none"/>
            {/* Decorative shimmer line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"/>
          </div>
          {/* Shield badge di cover */}
          <div className="absolute top-3 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Shield size={11} className="text-emerald-400"/>
            <span className="text-white text-[10px] font-bold tracking-wide">ADMINISTRATOR</span>
          </div>
        </div>

        {/* Avatar */}
        <div className="absolute left-4 sm:left-6 -bottom-10 sm:-bottom-12">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-white dark:ring-slate-900 overflow-hidden bg-emerald-700 shadow-xl flex-shrink-0">
              {uploadingFoto ? (
                <div className="w-full h-full flex items-center justify-center bg-black/50">
                  <Loader size={22} className="text-white animate-spin"/>
                </div>
              ) : fotoPreview ? (
                <img src={fotoPreview} alt={user?.name} className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-black text-white">
                  {initial}
                </div>
              )}
            </div>
            {/* Upload foto button */}
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all border-2 border-white dark:border-slate-900 group">
              <Camera size={12} className="text-white"/>
              <input ref={fotoInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFotoChange}/>
            </label>
          </div>
        </div>
      </div>

      {/* ══ PROFILE INFO HEADER ══ */}
      <div className="bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-700/60 px-4 sm:px-6 pt-14 sm:pt-16 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
            {user?.name || 'Administrator'}
          </h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/40">
            <Shield size={9}/> Admin
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Mail size={10}/>
          {user?.email || '-'}
        </p>
      </div>

      {/* ══ TABS ══ */}
      <div className="bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-700/60 overflow-x-auto">
        <div className="flex min-w-max sm:min-w-0">
          {TABS.map(t => {
            const Icon = t.icon
            const active = activeTab === t.id
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}>
                <Icon size={14}/>{t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ══ TAB CONTENT ══ */}
      <div className="bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-700/60 rounded-b-2xl overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── TAB PROFIL ── */}
          {activeTab === 'profil' && (
            <motion.div key="profil"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              <div className="p-4 sm:p-6 space-y-5">

                {/* Info banner */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/30">
                  <AlertCircle size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5"/>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Perubahan nama dan email akan langsung berlaku setelah disimpan.
                    Foto profil diupload otomatis saat kamu memilih file baru.
                  </p>
                </div>

                <motion.div initial="hidden" animate="visible" variants={cv} className="space-y-4">
                  {/* Nama */}
                  <motion.div variants={iv}>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nama administrator"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={iv}>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="admin@sekolah.id"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                  </motion.div>

                  {/* Foto profil info */}
                  <motion.div variants={iv}>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Foto Profil
                    </label>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-emerald-600 flex-shrink-0 shadow-sm">
                        {uploadingFoto ? (
                          <div className="w-full h-full flex items-center justify-center bg-black/40">
                            <Loader size={18} className="text-white animate-spin"/>
                          </div>
                        ) : fotoPreview ? (
                          <img src={fotoPreview} alt={user?.name} className="w-full h-full object-cover"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-black text-white">{initial}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {uploadingFoto ? 'Mengupload...' : 'Klik ikon kamera di avatar'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP · Maksimal 2MB</p>
                        <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                          <Camera size={12}/>
                          Ganti Foto
                          <input type="file" className="hidden" accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={handleFotoChange}/>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Tombol simpan */}
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSaveProfil}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all disabled:opacity-60 shadow-sm shadow-emerald-500/30">
                    {saving
                      ? <><Loader size={14} className="animate-spin"/> Menyimpan...</>
                      : <><Save size={14}/> Simpan Perubahan</>
                    }
                  </motion.button>
                  <button
                    onClick={() => { setName(user?.name || ''); setEmail(user?.email || '') }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TAB PASSWORD ── */}
          {activeTab === 'password' && (
            <motion.div key="password"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              <div className="p-4 sm:p-6 space-y-5">

                {/* Info banner */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/30">
                  <Lock size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"/>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Gunakan password yang kuat — minimal 6 karakter, kombinasi huruf besar, angka, dan simbol.
                  </p>
                </div>

                <motion.div initial="hidden" animate="visible" variants={cv} className="space-y-4">
                  {/* Password baru */}
                  <motion.div variants={iv}>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Password Baru
                    </label>
                    <div className="relative">
                      <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                      <input
                        type={showPw.password ? 'text' : 'password'}
                        value={pwForm.password}
                        onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="Min. 6 karakter"
                        className={`${inputCls} pl-9 pr-10`}
                      />
                      <button type="button"
                        onClick={() => setShowPw(p => ({ ...p, password: !p.password }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        {showPw.password ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                    {/* Password strength bar */}
                    {pwForm.password && strength && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                          style={{ width: { 'w-1/5': '20%', 'w-2/5': '40%', 'w-3/5': '60%', 'w-4/5': '80%', 'w-full': '100%' }[strength.w] }}
                          />
                        </div>
                        <p className={`text-[10px] font-semibold mt-1 ${strength.text}`}>{strength.label}</p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Konfirmasi */}
                  <motion.div variants={iv}>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                      <input
                        type={showPw.confirm ? 'text' : 'password'}
                        value={pwForm.password_confirmation}
                        onChange={e => setPwForm(p => ({ ...p, password_confirmation: e.target.value }))}
                        placeholder="Ulangi password baru"
                        className={`${inputCls} pl-9 pr-10 ${
                          pwForm.password_confirmation && pwForm.password !== pwForm.password_confirmation
                            ? 'border-rose-400 focus:ring-rose-500'
                            : pwForm.password_confirmation && pwForm.password === pwForm.password_confirmation
                            ? 'border-emerald-400 focus:ring-emerald-500'
                            : ''
                        }`}
                      />
                      <button type="button"
                        onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        {showPw.confirm ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                      {/* Match indicator */}
                      {pwForm.password_confirmation && (
                        <div className="absolute right-9 top-1/2 -translate-y-1/2">
                          {pwForm.password === pwForm.password_confirmation
                            ? <CheckCircle size={14} className="text-emerald-500"/>
                            : <X size={14} className="text-rose-500"/>
                          }
                        </div>
                      )}
                    </div>
                    {pwForm.password_confirmation && pwForm.password !== pwForm.password_confirmation && (
                      <p className="text-[10px] text-rose-500 mt-1 font-medium">Password tidak cocok</p>
                    )}
                  </motion.div>
                </motion.div>

                {/* Tombol simpan password */}
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSavePassword}
                    disabled={savingPw || !pwForm.password || pwForm.password !== pwForm.password_confirmation}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all disabled:opacity-50 shadow-sm shadow-emerald-500/30">
                    {savingPw
                      ? <><Loader size={14} className="animate-spin"/> Menyimpan...</>
                      : <><Lock size={14}/> Ubah Password</>
                    }
                  </motion.button>
                  <button
                    onClick={() => setPwForm({ password: '', password_confirmation: '' })}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
