import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Hash, QrCode, Camera, CheckCircle, AlertCircle, X, Clock, Calendar,
  Loader, School, ScanLine, Fingerprint, ArrowRight, Info, Sparkles, Shield,
  FileText, Moon, Sun, GraduationCap, Zap, TrendingUp, Star, Activity, LogOut
} from 'lucide-react'
import { publicApi } from '../services/publicApi'
import QrScanner from '../components/QrScanner'
import FormIzin from '../components/FormIzin'
import { showWarning, showSuccess, showError } from '../components/ConfirmDialog'
import { Link } from 'react-router-dom'
import { playSuccessSound, playErrorSound, playWarningSound, playScanSound, playLateSound, playAlreadyAbsenSound } from '../utils/soundNotification'
import { usePengaturanStore } from '../stores/pengaturanStore'
import { useThemeStore } from '../stores/themeStore'

export default function PublicAbsen() {
  const [userRole, setUserRole] = useState('siswa')
  const [activeTab, setActiveTab] = useState('manual')
  const [loading, setLoading] = useState(false)
  const [loadingPengaturan, setLoadingPengaturan] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [showScannerPulang, setShowScannerPulang] = useState(false)
  const [pulangSubTab, setPulangSubTab] = useState('manual') // 'manual' | 'qr'
  const [formData, setFormData] = useState({ nisn: '', nip: '', nipPulang: '' })
  const [errors, setErrors] = useState({})
  const [absenResult, setAbsenResult] = useState(null)
  const [pulangResult, setPulangResult] = useState(null)
  const [waktu, setWaktu] = useState(new Date())
  const [jamMasuk, setJamMasuk] = useState('07:15')
  // ── Fingerprint registration ──
  const [showFpModal, setShowFpModal] = useState(false)
  const [fpForm, setFpForm] = useState({ identifier: '', tipe: 'siswa' })
  const [fpFormErrors, setFpFormErrors] = useState({})
  const [fpLoading, setFpLoading] = useState(false)
  const [fpResult, setFpResult] = useState(null) // null | { success, data, message }
  const { pengaturan, fetchPengaturan } = usePengaturanStore()
  const { isDark, toggleTheme } = useThemeStore()

  const getKet = () => { try { return `public-absen; ua=${navigator.userAgent}` } catch { return 'public-absen' } }

  // Helper: tampilkan pesan "sudah absen" dengan info metode
  const showSudahAbsen = async (existingData) => {
    const metodeMap = {
      fingerprint: '🖐 Sidik Jari',
      qr_code:     '📷 QR Code',
      manual:      '✏️ Manual',
      sistem:      '⚙️ Sistem',
    }
    const metodeLabel = metodeMap[existingData?.metode] || '✅ Sistem'
    const jamAbsen = existingData?.jam_masuk
      ? ` pukul ${existingData.jam_masuk.substring(0, 5)}`
      : ''
    const statusLabel = existingData?.status === 'terlambat' ? ' (Terlambat)' : ' (Tepat Waktu)'
    playAlreadyAbsenSound()
    await showWarning(
      'Sudah Absen Hari Ini',
      `Kamu sudah tercatat absen${jamAbsen}${statusLabel} via ${metodeLabel}. Tidak perlu absen lagi.`
    )
  }

  useEffect(() => { const t = setInterval(() => setWaktu(new Date()), 1000); return () => clearInterval(t) }, [])

  useEffect(() => {
    const load = async () => {
      setLoadingPengaturan(true)
      try { const c = localStorage.getItem('pengaturan-storage'); if (c) { const p = JSON.parse(c); if (p?.state?.pengaturan?.jam_pulang < '06:00') localStorage.removeItem('pengaturan-storage') } } catch {}
      await fetchPengaturan(true)
      try { const r = await publicApi.getPengaturan(); if (r.data.data.jam_masuk) setJamMasuk(r.data.data.jam_masuk.substring(0, 5)) } catch { if (pengaturan.jam_masuk) setJamMasuk(pengaturan.jam_masuk) }
      setLoadingPengaturan(false)
    }
    load()
    const poll = setInterval(() => fetchPengaturan(true), 30000)
    const onStorage = (e) => { if (e.key === 'pengaturan-storage' && e.newValue) { try { const d = JSON.parse(e.newValue); if (d?.state?.pengaturan) fetchPengaturan(true) } catch {} } }
    window.addEventListener('storage', onStorage)
    window.addEventListener('pengaturan-updated', () => fetchPengaturan(true))
    return () => { clearInterval(poll); window.removeEventListener('storage', onStorage) }
  }, [])

  const fmtJam = (d) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const fmtTgl = (d) => d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const fmtHari = (d) => d.toLocaleDateString('id-ID', { weekday: 'long' })

  const isHariAktif = () => (pengaturan.hari_aktif || []).includes(fmtHari(new Date()))
  const isLibur = () => {
    if (!pengaturan.status_libur || !pengaturan.tanggal_libur_mulai || !pengaturan.tanggal_libur_selesai) return false
    const t = new Date(); t.setHours(0,0,0,0)
    const a = new Date(pengaturan.tanggal_libur_mulai); a.setHours(0,0,0,0)
    const b = new Date(pengaturan.tanggal_libur_selesai); b.setHours(0,0,0,0)
    return t >= a && t <= b
  }
  const isSudahPulang = () => { if (!pengaturan.jam_pulang) return false; const [h,m] = pengaturan.jam_pulang.split(':'); const jp = new Date(); jp.setHours(+h,+m,0); return new Date() > jp }
  const isBelumBuka = () => { if (!pengaturan.jam_buka_absen) return false; const [h,m] = pengaturan.jam_buka_absen.split(':'); const jb = new Date(); jb.setHours(+h,+m,0); return new Date() < jb }
  const boleh = isHariAktif() && !isLibur() && !isSudahPulang() && !isBelumBuka()
  const getPesan = () => {
    if (isBelumBuka()) return { title: 'Absensi Belum Dibuka', msg: `Dibuka jam ${pengaturan.jam_buka_absen?.substring(0,5)}`, icon: '⏰' }
    if (isSudahPulang()) return { title: 'Absensi Ditutup', msg: `Ditutup jam ${pengaturan.jam_pulang?.substring(0,5)}`, icon: '🏠' }
    if (isLibur()) return { title: 'Hari Libur', msg: pengaturan.keterangan_libur || 'Sekolah sedang libur', icon: '🏖️' }
    if (!isHariAktif()) return { title: 'Bukan Hari Aktif', msg: 'Hari ini bukan hari aktif sekolah', icon: '📅' }
    return null
  }
  const pesan = getPesan()

  const handleInput = (e) => { const { name, value } = e.target; setFormData(p => ({ ...p, [name]: value })); if (errors[name]) setErrors(p => ({ ...p, [name]: '' })) }
  const validate = () => {
    const e = {}
    if (userRole === 'siswa') { if (!formData.nisn.trim()) e.nisn = 'NIS/NISN wajib diisi'; else if (formData.nisn.length < 4) e.nisn = 'Minimal 4 karakter' }
    else { if (!formData.nip.trim()) e.nip = 'NIP wajib diisi'; else if (formData.nip.length < 4) e.nip = 'Minimal 4 karakter' }
    setErrors(e); return !Object.keys(e).length
  }

  const handleAbsen = async (e) => {
    e.preventDefault()
    if (!boleh) { const p = getPesan(); playWarningSound(); await showWarning(p.title, p.msg); return }
    if (!validate()) return
    setLoading(true); setAbsenResult(null)
    try {
      const res = userRole === 'siswa' ? await publicApi.absenManual({ nisn: formData.nisn, keterangan: getKet() }) : await publicApi.absenGuruManual({ nip: formData.nip, keterangan: getKet() })
      const result = res.data.data
      setAbsenResult({ success: true, data: result, message: res.data.message, role: userRole })
      setFormData({ nisn: '', nip: '' })
      if (result.is_terlambat) { playLateSound(); await showWarning('Terlambat!', `Terlambat ${result.menit_terlambat} menit dari jam masuk (${jamMasuk})`) }
      else { playSuccessSound(); showSuccess('Absensi Berhasil', 'Anda telah berhasil absen tepat waktu') }
    } catch (err) {
      const r = err.response?.data
      setAbsenResult({ success: false, message: r?.message || 'Terjadi kesalahan', role: userRole })
      if (r?.errors) setErrors(r.errors)
      if (r?.message?.includes('belum dibuka')) { playWarningSound(); await showWarning('Belum Dibuka', r.message); return }
      if (r?.message?.includes('sudah ditutup')) { playWarningSound(); await showWarning('Sudah Ditutup', r.message); return }
      if (r?.message?.includes('sudah melakukan absensi')) { await showSudahAbsen(r?.data); return }
      playErrorSound()
      if (r?.message?.includes('belum terdaftar') || r?.errors?.registrasi) showError('Belum Registrasi', 'Data ditemukan tapi belum punya akun.')
      else if (r?.message?.includes('tidak ditemukan')) showError('Tidak Ditemukan', `${userRole === 'siswa' ? 'NISN' : 'NIP'} tidak terdaftar.`)
      else showError('Gagal', r?.message || 'Terjadi kesalahan')
    } finally { setLoading(false) }
  }

  const handleQr = async (qrCode) => {
    if (!boleh) { const p = getPesan(); playWarningSound(); await showWarning(p.title, p.msg); return }
    setLoading(true); setShowScanner(false); playScanSound()
    try {
      const res = userRole === 'siswa' ? await publicApi.absenQr({ qr_code: qrCode, keterangan: getKet() }) : await publicApi.absenGuruQr({ qr_code: qrCode, keterangan: getKet() })
      const result = res.data.data
      setAbsenResult({ success: true, data: result, message: res.data.message, role: userRole })
      if (result.is_terlambat) { playLateSound(); await showWarning('Terlambat!', `Terlambat ${result.menit_terlambat} menit`) }
      else { playSuccessSound(); showSuccess('Absensi Berhasil', 'Berhasil absen tepat waktu') }
    } catch (err) {
      const r = err.response?.data
      setAbsenResult({ success: false, message: r?.message || 'Terjadi kesalahan', role: userRole })
      if (r?.message?.includes('belum dibuka')) { playWarningSound(); await showWarning('Belum Dibuka', r.message); return }
      if (r?.message?.includes('sudah ditutup')) { playWarningSound(); await showWarning('Sudah Ditutup', r.message); return }
      if (r?.message?.includes('sudah melakukan absensi')) { await showSudahAbsen(r?.data); return }
      playErrorSound()
      if (r?.message?.includes('belum terdaftar')) showError('Belum Registrasi', 'QR valid tapi belum punya akun.')
      else if (r?.message?.includes('tidak valid')) showError('QR Tidak Valid', 'QR Code tidak dikenali.')
      else showError('Gagal', r?.message || 'Terjadi kesalahan')
    } finally { setLoading(false) }
  }

  // ── Handler absen PULANG (siswa & guru) ───────────────────────────
  const handlePulangManual = async (e) => {
    e.preventDefault()
    const val = formData.nipPulang?.trim()
    const label = userRole === 'guru' ? 'NIP' : 'NIS/NISN'
    if (!val || val.length < 4) { setErrors(p => ({ ...p, nipPulang: `${label} wajib diisi (min 4 karakter)` })); return }
    setLoading(true); setPulangResult(null)
    try {
      const res = userRole === 'guru'
        ? await publicApi.absenGuruPulangManual({ nip: val, keterangan: getKet() })
        : await publicApi.absenSiswaPulangManual({ nisn: val, keterangan: getKet() })
      const d = res.data.data
      setPulangResult({ success: true, data: d, message: res.data.message })
      setFormData(p => ({ ...p, nipPulang: '' }))
      playSuccessSound()
      const s = d.menit_pulang_cepat
      if (s > 0)      { await showWarning('Pulang Lebih Awal', `Pulang ${Math.abs(s)} menit lebih awal dari jam pulang sekolah (${d.jam_pulang_sekolah}).`) }
      else if (s < 0) { showSuccess('Terima Kasih!', `Lembur ${Math.abs(s)} menit. Terima kasih!`) }
      else            { showSuccess('Absen Pulang Berhasil', 'Pulang tepat waktu.') }
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan'
      setPulangResult({ success: false, message: msg })
      playErrorSound()
      if (msg.includes('belum') && msg.includes('masuk'))       { await showWarning('Belum Absen Masuk', 'Kamu belum tercatat absen masuk hari ini.') }
      else if (msg.includes('sudah') && msg.includes('pulang')) { playAlreadyAbsenSound(); await showWarning('Sudah Absen Pulang', 'Kamu sudah tercatat absen pulang hari ini.') }
      else if (msg.toLowerCase().includes('alpha'))             { await showWarning('Tidak Bisa Absen Pulang', 'Kamu tercatat Alpha hari ini.') }
      else if (msg.includes('tidak ditemukan') || msg.includes('tidak terdaftar')) { showError('Tidak Ditemukan', `${label} tidak terdaftar di sistem.`) }
      else { showError('Gagal', msg) }
    } finally { setLoading(false) }
  }

  const handleQrPulang = async (qrCode) => {
    setLoading(true); setShowScannerPulang(false); playScanSound()
    try {
      const res = userRole === 'guru'
        ? await publicApi.absenGuruPulangQr({ qr_code: qrCode, keterangan: getKet() })
        : await publicApi.absenSiswaPulangQr({ qr_code: qrCode, keterangan: getKet() })
      const d = res.data.data
      setPulangResult({ success: true, data: d, message: res.data.message })
      playSuccessSound()
      const s = d.menit_pulang_cepat
      if (s > 0)      { await showWarning('Pulang Lebih Awal', `Pulang ${Math.abs(s)} menit lebih awal dari jam pulang sekolah (${d.jam_pulang_sekolah}).`) }
      else if (s < 0) { showSuccess('Terima Kasih!', `Lembur ${Math.abs(s)} menit. Terima kasih!`) }
      else            { showSuccess('Absen Pulang Berhasil', 'Pulang tepat waktu.') }
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan'
      setPulangResult({ success: false, message: msg })
      playErrorSound()
      if (msg.includes('belum') && msg.includes('masuk'))       { await showWarning('Belum Absen Masuk', 'Kamu belum tercatat absen masuk hari ini.') }
      else if (msg.includes('sudah') && msg.includes('pulang')) { playAlreadyAbsenSound(); await showWarning('Sudah Absen Pulang', 'Kamu sudah tercatat absen pulang hari ini.') }
      else if (msg.toLowerCase().includes('alpha'))             { await showWarning('Tidak Bisa Absen Pulang', 'Kamu tercatat Alpha hari ini.') }
      else if (msg.includes('tidak valid') || msg.includes('tidak terdaftar')) { showError('QR Tidak Valid', 'QR Code tidak dikenali.') }
      else { showError('Gagal', msg) }
    } finally { setLoading(false) }
  }

  // ── Handler fingerprint registration ──────────────────────────────
  const handleOpenFpModal = () => {
    setFpForm({ identifier: userRole === 'siswa' ? formData.nisn : formData.nip, tipe: userRole })
    setFpFormErrors({})
    setFpResult(null)
    setShowFpModal(true)
  }

  const handleFpRegister = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!fpForm.identifier.trim()) errs.identifier = fpForm.tipe === 'siswa' ? 'NIS/NISN wajib diisi' : 'NIP wajib diisi'
    else if (fpForm.identifier.length < 4) errs.identifier = 'Minimal 4 karakter'
    setFpFormErrors(errs)
    if (Object.keys(errs).length) return

    setFpLoading(true)
    setFpResult(null)
    try {
      const res = await publicApi.registerFingerprint({ identifier: fpForm.identifier, tipe: fpForm.tipe })
      const d = res.data.data

      // Jika backend dispatch job (async), lakukan polling
      if (d.polling && d.job_key) {
        // Tampilkan state "processing" dulu
        setFpResult({ success: true, data: { ...d, status: 'processing' }, message: res.data.message })
        setFpLoading(false)

        // Ekstrak key tanpa prefix 'fp_reg_' untuk dikirim ke endpoint
        const rawKey = d.job_key.replace(/^fp_reg_/, '')

        // Poll tiap 2 detik, max 30 detik
        let attempts = 0
        const maxAttempts = 15
        const poll = async () => {
          attempts++
          try {
            const pollRes = await publicApi.getFingerprintStatus(rawKey)
            const status = pollRes.data.data
            if (status.status === 'success') {
              setFpResult({ success: true, data: { ...d, ...status }, message: status.message })
              playSuccessSound()
              return
            } else if (status.status === 'failed') {
              setFpResult({ success: false, data: { ...d, ...status }, message: status.message })
              playErrorSound()
              return
            } else if (status.status === 'already') {
              setFpResult({ success: true, data: { ...d, ...status }, message: status.message })
              return
            }
            // masih processing
          } catch {}
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000)
          } else {
            setFpResult({ success: true, data: { ...d, status: 'timeout' }, message: 'Pendaftaran diproses. Coba scan jari ke mesin sekarang.' })
          }
        }
        setTimeout(poll, 2000)
      } else {
        // Sync response langsung
        setFpResult({ success: true, data: d, message: res.data.message })
        playSuccessSound()
        setFpLoading(false)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan'
      setFpResult({ success: false, message: msg })
      playErrorSound()
      setFpLoading(false)
    }
  }

  const tabs = [
    { key: 'manual', label: 'Manual', icon: Fingerprint },
    { key: 'qr', label: 'QR Code', icon: ScanLine },
    ...(userRole === 'siswa' ? [{ key: 'izin', label: 'Izin/Sakit', icon: FileText }] : []),
    ...(userRole === 'siswa' ? [{ key: 'pulang', label: 'Pulang', icon: LogOut }] : []),
    ...(userRole === 'guru'  ? [{ key: 'pulang', label: 'Pulang', icon: LogOut }] : []),
  ]

  return (
    <div className={`flex flex-col md:flex-row md:h-screen md:overflow-hidden font-sans ${isDark ? 'bg-[#080e1a]' : 'bg-slate-50'}`}>

      {/* ══════════════════════════════════════════════════════════════════
          LEFT — Dark premium panel, full height
      ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex w-[300px] lg:w-[360px] xl:w-[400px] flex-shrink-0 flex-col h-screen relative overflow-hidden">
        {/* BG layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#0f172a]"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"/>
        {/* Glow orbs */}
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"/>
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-teal-400/15 blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"/>
        <div className="absolute top-1/2 right-0 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none"/>
        {/* Dot grid texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]">
          <defs><pattern id="dp" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="white"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dp)"/>
        </svg>
        {/* Diagonal accent line */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent pointer-events-none"/>

        <div className="relative z-10 flex flex-col h-full p-6 lg:p-7 xl:p-8 overflow-y-auto">

          {/* ── Logo + nama sekolah ── */}
          <div className="flex items-center gap-3 mb-8">
            {loadingPengaturan
              ? <div className="w-11 h-11 rounded-2xl bg-white/10 animate-pulse flex-shrink-0"/>
              : pengaturan.logo_sekolah
                ? <img src={pengaturan.logo_sekolah} alt="" className="w-11 h-11 rounded-2xl object-contain bg-white/10 p-1 ring-1 ring-white/20 flex-shrink-0" onError={e=>e.target.style.display='none'}/>
                : <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center ring-1 ring-white/20 flex-shrink-0"><School size={20} className="text-white"/></div>
            }
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-sm leading-tight truncate">{pengaturan.nama_sekolah || 'Sistem Absensi'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${boleh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}/>
                <p className={`text-[10px] font-medium ${boleh ? 'text-emerald-400' : 'text-slate-500'}`}>{boleh ? 'Sistem Aktif' : 'Tidak Aktif'}</p>
              </div>
            </div>
            <Link to="/login" className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 text-[10px] font-semibold transition-all">
              Login <ArrowRight size={9}/>
            </Link>
          </div>

          {/* ── Jam besar + tanggal ── */}
          <div className="mb-4">
            {/* Dekorasi: garis kecil di atas jam */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-px bg-emerald-400/60"/>
              <span className="text-emerald-400/60 text-[9px] font-bold uppercase tracking-widest">Waktu Sekarang</span>
            </div>
            <motion.p
              key={fmtJam(waktu)}
              className="text-[48px] lg:text-[56px] xl:text-[62px] font-black text-white tabular-nums tracking-tight leading-none"
              style={{ textShadow: '0 0 40px rgba(52,211,153,0.3)' }}>
              {fmtJam(waktu)}
            </motion.p>
            <p className="text-white/40 text-xs mt-1.5 font-medium">{fmtTgl(waktu)}</p>
          </div>

          {/* ── Status pill ── */}
          <div className={`self-start flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold mb-5 border ${
            boleh
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${boleh ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}/>
            {boleh ? `Absensi Dibuka · Masuk ${jamMasuk}` : pesan?.title || 'Tidak Aktif'}
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8"/>
            <span className="text-white/20 text-[9px] font-bold uppercase tracking-widest">Info</span>
            <div className="flex-1 h-px bg-white/8"/>
          </div>

          {/* ── 4 stat cards ── */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { label: 'Jam Masuk',  value: jamMasuk || '-',                              icon: '🕐', accent: 'from-emerald-500/20 to-teal-500/10' },
              { label: 'Jam Pulang', value: pengaturan.jam_pulang?.substring(0,5) || '-', icon: '🕐', accent: 'from-blue-500/20 to-cyan-500/10' },
              { label: 'Hari Aktif', value: `${(pengaturan.hari_aktif||[]).length} hari`,  icon: '📅', accent: 'from-purple-500/20 to-pink-500/10' },
              { label: 'Status',     value: boleh ? 'Buka' : 'Tutup',                     icon: boleh ? '✅' : '🔒', accent: boleh ? 'from-emerald-500/20 to-green-500/10' : 'from-red-500/20 to-rose-500/10' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.accent} rounded-2xl p-3.5 border border-white/8 backdrop-blur-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">{s.label}</span>
                  <span className="text-sm">{s.icon}</span>
                </div>
                <p className="text-white font-black text-base leading-none">{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Hari aktif pills ── */}
          {(pengaturan.hari_aktif || []).length > 0 && (
            <div className="mb-5">
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-2">Hari Sekolah</p>
              <div className="flex flex-wrap gap-1.5">
                {(pengaturan.hari_aktif || []).map((h, i) => {
                  const isToday = fmtHari(new Date()) === h
                  return (
                    <span key={i} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      isToday ? 'bg-emerald-400 border-emerald-400 text-emerald-900' : 'bg-white/5 border-white/10 text-white/50'
                    }`}>{h.substring(0,3)}</span>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Role switcher ── */}
          <div className="mb-auto">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="flex-1 h-px bg-white/8"/>
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Saya adalah</p>
              <div className="flex-1 h-px bg-white/8"/>
            </div>
            <div className="flex gap-2">
              {[
                { key: 'siswa', label: 'Siswa', icon: GraduationCap, sub: 'NIS / NISN' },
                { key: 'guru',  label: 'Guru',  icon: User,           sub: 'NIP' },
              ].map(r => (
                <motion.button key={r.key} whileTap={{ scale: 0.97 }}
                  onClick={() => { setUserRole(r.key); setAbsenResult(null); setErrors({}); setFormData({ nisn:'', nip:'', nipPulang:'' }); setPulangResult(null); setPulangSubTab('manual'); setShowScannerPulang(false); if (r.key==='guru' && activeTab==='izin') setActiveTab('manual') }}
                  className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all ${
                    userRole === r.key
                      ? 'bg-white border-white text-emerald-800 shadow-xl shadow-emerald-900/50'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                  }`}>
                  <r.icon size={16}/>
                  <div className="text-left">
                    <p className="text-xs font-black leading-tight">{r.label}</p>
                    <p className={`text-[10px] font-medium ${userRole===r.key ? 'text-emerald-600' : 'text-white/30'}`}>{r.sub}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── Bottom strip ── */}
          <div className="pt-5 mt-5 border-t border-white/8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={11} className="text-emerald-500"/>
                <span className="text-white/30 text-[10px] font-medium">Real-time · Auto sync 30s</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                <span className="text-emerald-400 text-[10px] font-bold">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT — Form panel, fills remaining space
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen md:h-screen overflow-y-auto relative">
        {/* Background */}
        <div className={`absolute inset-0 z-0 ${isDark ? 'bg-[#080e1a]' : 'bg-slate-50'}`}/>
        {/* Subtle top-right glow on light mode */}
        {!isDark && <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none z-0"/>}
        {isDark && <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-900/10 blur-3xl pointer-events-none z-0"/>}

        <div className="relative z-10 flex flex-col flex-1">

        {/* ── Mobile top bar ── */}
        <div className={`md:hidden sticky top-0 z-30 border-b backdrop-blur-xl ${isDark ? 'bg-[#080e1a]/90 border-white/5' : 'bg-white/90 border-slate-200/60'}`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {pengaturan.logo_sekolah
                ? <img src={pengaturan.logo_sekolah} alt="" className="w-8 h-8 rounded-xl object-contain flex-shrink-0" onError={e=>e.target.style.display='none'}/>
                : <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0"><School size={14} className="text-white"/></div>
              }
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${isDark?'text-white':'text-slate-800'}`}>{pengaturan.nama_sekolah||'Absensi'}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-[10px] font-mono font-semibold ${isDark?'text-emerald-400':'text-emerald-600'}`}>{fmtJam(waktu)}</p>
                  <span className={`flex items-center gap-1 text-[9px] font-bold ${boleh ? isDark?'text-emerald-400':'text-emerald-600' : isDark?'text-red-400':'text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${boleh?'bg-emerald-400 animate-pulse':'bg-red-400'}`}/>
                    {boleh ? 'Buka' : 'Tutup'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={toggleTheme} className={`p-2 rounded-xl border transition-all ${isDark?'border-white/10 hover:bg-white/5':'border-slate-200 hover:bg-slate-100'}`}>
                {isDark ? <Sun size={13} className="text-amber-400"/> : <Moon size={13} className="text-slate-500"/>}
              </button>
              <Link to="/login" className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-emerald-500/25">
                Login <ArrowRight size={10}/>
              </Link>
            </div>
          </div>
          {/* Mobile: jam + status bar */}
          <div className={`flex items-center justify-between px-4 py-2 border-t ${isDark?'border-white/5':'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <Clock size={10} className="text-emerald-500"/>
              <span className={`text-[10px] font-semibold ${isDark?'text-slate-400':'text-slate-500'}`}>
                Masuk <span className="font-black text-emerald-500">{jamMasuk}</span>
                {' · '}Pulang <span className="font-black text-blue-500">{pengaturan.jam_pulang?.substring(0,5)||'-'}</span>
              </span>
            </div>
            {!boleh && pesan && (
              <span className={`flex items-center gap-1 text-[10px] font-semibold ${isDark?'text-amber-300':'text-amber-600'}`}>
                <span>{pesan.icon}</span><span className="truncate max-w-[120px]">{pesan.title}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── Right content ── */}
        <div className="flex-1 p-4 sm:p-5 lg:p-8 xl:p-10 pb-24 md:pb-6 flex flex-col gap-4">

          {/* ── Header: badge + judul + theme toggle ── */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-2 ${isDark ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                <Zap size={9}/> Absensi Digital
              </div>
              <h1 className={`text-xl sm:text-2xl font-black leading-tight ${isDark?'text-white':'text-slate-900'}`}>
                Absen <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Sekarang</span>
              </h1>
              <p className={`text-xs mt-0.5 ${isDark?'text-slate-500':'text-slate-400'}`}>
                {userRole==='siswa' ? 'Masukkan NIS/NISN atau scan QR Code' : 'Masukkan NIP atau scan QR Code'}
              </p>
            </div>
            <button onClick={toggleTheme} className={`hidden md:flex p-2.5 rounded-xl border transition-all hover:scale-105 flex-shrink-0 ${isDark?'border-white/10 text-slate-400 hover:bg-white/5':'border-slate-200 text-slate-400 hover:bg-slate-100'}`}>
              {isDark ? <Sun size={14} className="text-amber-400"/> : <Moon size={14}/>}
            </button>
          </div>

          {/* ── Mobile: mini stat strip (hanya di mobile, bukan di tablet+) ── */}
          <div className={`flex sm:hidden items-center gap-2 p-3 rounded-2xl border ${isDark?'bg-white/3 border-white/8':'bg-white border-slate-100 shadow-sm'}`}>
            {[
              { l:'Masuk', v: jamMasuk||'-', c:'text-emerald-500' },
              { l:'Pulang', v: pengaturan.jam_pulang?.substring(0,5)||'-', c:'text-blue-500' },
              { l:'Status', v: boleh?'Buka':'Tutup', c: boleh?'text-emerald-500':'text-red-500' },
            ].map((x,i)=>(
              <div key={i} className={`flex-1 text-center ${i>0?`border-l ${isDark?'border-white/8':'border-slate-100'}`:''}`}>
                <p className={`text-[9px] ${isDark?'text-slate-600':'text-slate-400'} uppercase tracking-wider font-bold`}>{x.l}</p>
                <p className={`text-xs font-black font-mono mt-0.5 ${x.c}`}>{x.v}</p>
              </div>
            ))}
          </div>

          {/* Warning banner (desktop) */}
          <AnimatePresence>
            {!boleh && pesan && (
              <motion.div initial={{opacity:0,y:-6,height:0}} animate={{opacity:1,y:0,height:'auto'}} exit={{opacity:0,height:0}}
                className={`hidden md:flex items-center gap-3 p-4 rounded-2xl border ${isDark?'bg-amber-500/10 border-amber-500/20':'bg-amber-50 border-amber-200'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${isDark?'bg-amber-500/20':'bg-amber-100'}`}>{pesan.icon}</div>
                <div>
                  <p className={`text-xs font-bold ${isDark?'text-amber-300':'text-amber-800'}`}>{pesan.title}</p>
                  <p className={`text-[11px] mt-0.5 ${isDark?'text-amber-400/60':'text-amber-700'}`}>{pesan.msg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── BANNER LIBUR ── */}
          <AnimatePresence>
            {isLibur() && (
              <motion.div
                initial={{opacity:0,y:-8,scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8}}
                transition={{type:'spring',stiffness:200,damping:22}}
                className="relative overflow-hidden rounded-2xl"
                style={{ minHeight: 100 }}
              >
                {pengaturan.foto_libur_bg
                  ? <img src={pengaturan.foto_libur_bg} alt="" className="absolute inset-0 w-full h-full object-cover"/>
                  : <div className="absolute inset-0" style={{
                      background: 'linear-gradient(135deg,#064e3b 0%,#065f46 35%,#0f766e 65%,#0891b2 100%)'
                    }}/>
                }
                <div className="absolute inset-0" style={{
                  background:'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)'
                }}/>
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize:'18px 18px' }}/>
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"/>

                <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-black/25 backdrop-blur-sm rounded-full px-3 py-1 border border-white/15">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest">Hari Libur</span>
                    </div>
                  </div>
                  {[pengaturan.foto_libur, pengaturan.foto_libur_2, pengaturan.foto_libur_3, pengaturan.foto_libur_4].filter(Boolean).length > 0 && (
                    <div className="flex items-center">
                      {[pengaturan.foto_libur, pengaturan.foto_libur_2, pengaturan.foto_libur_3, pengaturan.foto_libur_4].filter(Boolean).map((src, i) => (
                        <img key={i} src={src} alt=""
                          className="w-8 h-8 rounded-full object-cover border-2 border-white/60 shadow-md"
                          style={{ marginLeft: i===0?0:-10, zIndex:4-i }}
                          onError={e => e.target.style.display='none'}/>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative z-10 px-4 sm:px-5 pb-4">
                  <h3 className="text-white font-black text-base sm:text-lg leading-tight drop-shadow">
                    {pengaturan.keterangan_libur || 'Libur Sekolah'}
                  </h3>
                  <p className="text-white/60 text-xs mt-0.5">
                    {pengaturan.tanggal_libur_mulai && pengaturan.tanggal_libur_selesai
                      ? `${new Date(pengaturan.tanggal_libur_mulai).toLocaleDateString('id-ID',{day:'numeric',month:'long'})} — ${new Date(pengaturan.tanggal_libur_selesai).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}`
                      : 'Absensi tidak tersedia'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── MAIN CARD ── */}
          <div className={`rounded-2xl sm:rounded-3xl border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/8' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/60'}`}>
            {/* Card top accent — gradient bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400"/>

            <div className="p-4 sm:p-6">
              {/* Card header: label + role badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500`}/>
                  <span className={`text-xs font-black uppercase tracking-wider ${isDark?'text-slate-300':'text-slate-700'}`}>Form Absensi</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  userRole==='siswa'
                    ? isDark?'bg-emerald-500/15 border-emerald-500/25 text-emerald-400':'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : isDark?'bg-blue-500/15 border-blue-500/25 text-blue-400':'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  {userRole==='siswa' ? <GraduationCap size={9}/> : <User size={9}/>}
                  {userRole==='siswa' ? 'Siswa' : 'Guru'}
                </span>
              </div>

              {/* Tabs */}
              <div className={`flex gap-1 p-1 rounded-xl sm:rounded-2xl mb-4 sm:mb-5 ${isDark?'bg-white/5':'bg-slate-100'}`}>
                {tabs.map(t => (
                  <button key={t.key}
                    onClick={() => { setActiveTab(t.key); setAbsenResult(null); setErrors({}); setPulangResult(null); setShowScannerPulang(false) }}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                      activeTab===t.key
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                        : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                    <t.icon size={11}/><span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {activeTab==='manual' && (
                  <motion.form key="manual" onSubmit={handleAbsen}
                    initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:10}} transition={{duration:0.15}}
                    className="space-y-3">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDark?'text-slate-300':'text-slate-700'}`}>
                        {userRole==='siswa' ? 'NIS / NISN' : 'NIP'}
                      </label>
                      <div className="relative">
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center ${isDark?'bg-emerald-500/20':'bg-emerald-50'}`}>
                          <Hash size={13} className="text-emerald-500"/>
                        </div>
                        <input
                          type="text"
                          name={userRole==='siswa'?'nisn':'nip'}
                          value={userRole==='siswa'?formData.nisn:formData.nip}
                          onChange={handleInput}
                          disabled={loading||!boleh}
                          autoComplete="off"
                          placeholder={userRole==='siswa'?'Masukkan NIS atau NISN':'Masukkan NIP'}
                          className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                            (userRole==='siswa'?errors.nisn:errors.nip)
                              ? 'border-red-400 focus:ring-red-400/20'
                              : isDark
                                ? 'bg-white/5 border-white/10 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20 focus:bg-white/8'
                                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white'
                          } ${!boleh?'opacity-40 cursor-not-allowed':''}`}
                        />
                      </div>
                      {(userRole==='siswa'?errors.nisn:errors.nip) && (
                        <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10}/>{userRole==='siswa'?errors.nisn:errors.nip}</p>
                      )}
                    </div>

                    <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-[11px] ${isDark?'bg-white/3 border-white/8 text-slate-500':'bg-emerald-50/80 border-emerald-100 text-slate-500'}`}>
                      <Info size={12} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
                      <span>{userRole==='siswa' ? <> Masukkan NIS atau NISN. Belum punya akun? <Link to="/register" className="text-emerald-500 font-bold underline-offset-2 underline">Registrasi</Link></> : 'Masukkan NIP yang terdaftar di sistem sekolah.'}</span>
                    </div>

                    <motion.button whileTap={{scale:0.99}} type="submit" disabled={loading||!boleh}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide">
                      {loading ? <><Loader size={15} className="animate-spin"/>Memproses...</>
                        : !boleh ? <><AlertCircle size={15}/>{pesan?.title||'Tidak Aktif'}</>
                        : <><CheckCircle size={15}/>Absen Sekarang</>}
                    </motion.button>

                    <p className={`text-center text-[11px] ${isDark?'text-slate-600':'text-slate-400'}`}>
                      Belum punya akun? <Link to="/register" className="text-emerald-500 font-bold">Registrasi</Link>
                    </p>
                  </motion.form>
                )}

                {activeTab==='qr' && (
                  <motion.div key="qr" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.15}}
                    className="space-y-3">
                    <div className={`rounded-2xl border-2 border-dashed p-7 text-center ${isDark?'border-white/10 bg-white/3':'border-emerald-200 bg-emerald-50/50'}`}>
                      <motion.div animate={{scale:[1,1.04,1]}} transition={{duration:2.5,repeat:Infinity}}
                        className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center mb-3 ${isDark?'bg-emerald-500/15':'bg-white shadow-lg shadow-emerald-100'}`}>
                        <QrCode size={28} className="text-emerald-500"/>
                      </motion.div>
                      <p className={`text-sm font-black mb-1 ${isDark?'text-white':'text-slate-700'}`}>Scan QR Code</p>
                      <p className={`text-xs mb-4 ${isDark?'text-slate-500':'text-slate-400'}`}>Aktifkan kamera untuk scan QR Code absensi</p>
                      <motion.button whileTap={{scale:0.97}} onClick={()=>setShowScanner(true)} disabled={!boleh}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/30 disabled:opacity-40 transition-all">
                        <Camera size={14}/>{boleh?'Buka Kamera':pesan?.title||'Tidak Aktif'}
                      </motion.button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['Pencahayaan cukup','QR di tengah kamera','Jarak yang tepat','Hindari gerakan'].map((t,i)=>(
                        <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border ${isDark?'bg-white/3 border-white/8':'bg-slate-50 border-slate-100'}`}>
                          <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black flex-shrink-0 ${isDark?'bg-emerald-500/20 text-emerald-400':'bg-emerald-100 text-emerald-600'}`}>{i+1}</span>
                          <span className={`text-[10px] font-medium ${isDark?'text-slate-400':'text-slate-500'}`}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab==='izin' && userRole==='siswa' && (
                  <motion.div key="izin" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.15}}>
                    <FormIzin/>
                  </motion.div>
                )}

                {activeTab==='pulang' && (
                  <motion.div key="pulang" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.15}}
                    className="space-y-4">

                    {/* Info banner */}
                    <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${isDark?'bg-emerald-500/10 border-emerald-500/20':'bg-emerald-50 border-emerald-200'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark?'bg-emerald-500/20':'bg-emerald-100'}`}>
                        <LogOut size={15} className={isDark?'text-emerald-400':'text-emerald-600'}/>
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isDark?'text-emerald-300':'text-emerald-800'}`}>
                          {userRole==='guru' ? 'Absen Pulang Guru' : 'Absen Pulang Siswa'}
                        </p>
                        <p className={`text-[11px] mt-0.5 ${isDark?'text-emerald-400/70':'text-emerald-700'}`}>
                          Jam pulang sekolah: <span className="font-black">{pengaturan.jam_pulang?.substring(0,5) || '-'}</span>
                          {' · '}Hanya yang sudah absen masuk yang bisa absen pulang.
                        </p>
                      </div>
                    </div>

                    {/* Sub-tabs: Manual / QR */}
                    <div className={`flex gap-1 p-1 rounded-xl ${isDark?'bg-white/5':'bg-slate-100'}`}>
                      {[
                        { key:'manual', label: userRole==='guru' ? '✍️ Manual NIP' : '✍️ Manual NIS', icon: Hash },
                        { key:'qr',     label:'📷 QR Code', icon: QrCode },
                      ].map(st => (
                        <button key={st.key}
                          onClick={() => { setPulangSubTab(st.key); setErrors({}); setPulangResult(null); setShowScannerPulang(false) }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all ${
                            pulangSubTab === st.key
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                              : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                          }`}>
                          <st.icon size={11}/>{st.label}
                        </button>
                      ))}
                    </div>

                    {/* Manual form */}
                    {pulangSubTab === 'manual' && (
                      <form onSubmit={handlePulangManual} className="space-y-3">
                        <div>
                          <label className={`block text-xs font-bold mb-1.5 ${isDark?'text-slate-300':'text-slate-700'}`}>
                            {userRole==='guru' ? 'NIP' : 'NIS / NISN'}
                          </label>
                          <div className="relative">
                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center ${isDark?'bg-emerald-500/20':'bg-emerald-50'}`}>
                              <Hash size={13} className="text-emerald-500"/>
                            </div>
                            <input
                              type="text"
                              name="nipPulang"
                              value={formData.nipPulang}
                              onChange={e => { setFormData(p=>({...p,nipPulang:e.target.value})); setErrors(p=>({...p,nipPulang:''})) }}
                              disabled={loading}
                              autoComplete="off"
                              placeholder={userRole==='guru' ? 'Masukkan NIP untuk absen pulang' : 'Masukkan NIS/NISN untuk absen pulang'}
                              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                                errors.nipPulang
                                  ? 'border-red-400 focus:ring-red-400/20'
                                  : isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20'
                                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white'
                              } ${loading?'opacity-40 cursor-not-allowed':''}`}
                            />
                          </div>
                          {errors.nipPulang && (
                            <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10}/>{errors.nipPulang}</p>
                          )}
                        </div>

                        <motion.button whileTap={{scale:0.99}} type="submit" disabled={loading}
                          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide">
                          {loading
                            ? <><Loader size={15} className="animate-spin"/>Memproses...</>
                            : <><LogOut size={15}/>Absen Pulang Sekarang</>}
                        </motion.button>
                      </form>
                    )}

                    {/* QR Scanner pulang */}
                    {pulangSubTab === 'qr' && (
                      <div className={`rounded-2xl border-2 border-dashed p-7 text-center ${isDark?'border-white/10 bg-white/3':'border-emerald-200 bg-emerald-50/50'}`}>
                        <motion.div animate={{scale:[1,1.04,1]}} transition={{duration:2.5,repeat:Infinity}}
                          className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center mb-3 ${isDark?'bg-emerald-500/15':'bg-white shadow-lg shadow-emerald-100'}`}>
                          <QrCode size={28} className="text-emerald-500"/>
                        </motion.div>
                        <p className={`text-sm font-black mb-1 ${isDark?'text-white':'text-slate-700'}`}>Scan QR Code Pulang</p>
                        <p className={`text-xs mb-4 ${isDark?'text-slate-500':'text-slate-400'}`}>Aktifkan kamera untuk scan QR Code absen pulang</p>
                        <motion.button whileTap={{scale:0.97}}
                          onClick={() => { setPulangResult(null); setShowScannerPulang(true) }}
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/30 disabled:opacity-40 transition-all">
                          <Camera size={14}/>Buka Kamera
                        </motion.button>
                      </div>
                    )}

                    {/* Result pulang */}
                    <AnimatePresence>
                      {pulangResult && (
                        <motion.div initial={{opacity:0,y:8,scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8}}
                          className={`rounded-2xl border-2 overflow-hidden ${pulangResult.success ? isDark?'bg-emerald-500/10 border-emerald-500/25':'bg-emerald-50 border-emerald-200' : isDark?'bg-red-500/10 border-red-500/25':'bg-red-50 border-red-200'}`}>
                          <div className={`px-4 py-2.5 flex items-center justify-between ${pulangResult.success?'bg-gradient-to-r from-emerald-500 to-teal-600':'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                            <div className="flex items-center gap-2">
                              {pulangResult.success?<CheckCircle size={13} className="text-white"/>:<X size={13} className="text-white"/>}
                              <span className="text-white text-xs font-black">{pulangResult.success?'Absen Pulang Berhasil!':'Absen Pulang Gagal'}</span>
                            </div>
                            <button onClick={()=>setPulangResult(null)} className="text-white/60 hover:text-white"><X size={12}/></button>
                          </div>
                          <div className="p-4">
                            <p className={`text-xs mb-3 ${isDark?'text-slate-300':'text-slate-600'}`}>{pulangResult.message}</p>
                            {pulangResult.success && pulangResult.data && (
                              <div className={`rounded-xl p-3 grid grid-cols-2 gap-2.5 ${isDark?'bg-white/5':'bg-white border border-slate-100'}`}>
                                {(() => {
                                  const d = pulangResult.data
                                  const selisih = d.menit_pulang_cepat
                                  const abs = Math.abs(selisih ?? 0)
                                  const jam  = Math.floor(abs / 60), sisa = abs % 60
                                  const durasi = jam > 0 ? (sisa > 0 ? `${jam} jam ${sisa} menit` : `${jam} jam`) : `${abs} menit`
                                  const selisihLabel = selisih > 0 ? `${durasi} lebih awal` : selisih < 0 ? `Lembur ${durasi}` : 'Tepat waktu'
                                  const selisihColor = selisih > 0 ? isDark?'text-amber-300':'text-amber-600' : selisih < 0 ? isDark?'text-emerald-300':'text-emerald-600' : isDark?'text-blue-300':'text-blue-600'
                                  const nama = userRole==='guru' ? d.guru?.nama : d.siswa?.nama
                                  const extra = userRole==='siswa' && d.siswa?.kelas ? [{ label:'Kelas', value: d.siswa.kelas }] : []
                                  return [
                                    { label:'Nama',        value: nama },
                                    ...extra,
                                    { label:'Jam Pulang',  value: d.absensi?.jam_pulang ? String(d.absensi.jam_pulang).substring(0,5) : '-', mono: true },
                                    { label:'Jam Sekolah', value: d.jam_pulang_sekolah, mono: true },
                                    { label:'Selisih',     value: selisihLabel, color: selisihColor },
                                  ].map((item,i) => (
                                    <div key={i}>
                                      <p className={`text-[9px] uppercase font-black mb-0.5 tracking-widest ${isDark?'text-slate-600':'text-slate-400'}`}>{item.label}</p>
                                      <p className={`text-xs font-bold truncate ${item.mono?'font-mono':''} ${item.color || (isDark?'text-white':'text-slate-800')}`}>{item.value}</p>
                                    </div>
                                  ))
                                })()}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result absen masuk */}
              <AnimatePresence>
                {absenResult && (
                  <motion.div initial={{opacity:0,y:8,scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8}}
                    className={`mt-4 rounded-2xl border-2 overflow-hidden ${absenResult.success ? isDark?'bg-emerald-500/10 border-emerald-500/25':'bg-emerald-50 border-emerald-200' : isDark?'bg-red-500/10 border-red-500/25':'bg-red-50 border-red-200'}`}>
                    {/* Header bar */}
                    <div className={`px-4 py-2.5 flex items-center justify-between ${absenResult.success?'bg-gradient-to-r from-emerald-500 to-teal-600':'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                      <div className="flex items-center gap-2">
                        {absenResult.success?<CheckCircle size={13} className="text-white"/>:<X size={13} className="text-white"/>}
                        <span className="text-white text-xs font-black">{absenResult.success?'Absensi Berhasil!':'Absensi Gagal'}</span>
                      </div>
                      <button onClick={()=>{setAbsenResult(null);setErrors({})}} className="text-white/60 hover:text-white"><X size={12}/></button>
                    </div>

                    <div className="p-4">
                      {absenResult.success && absenResult.data && (() => {
                        const isSiswa = absenResult.role === 'siswa'
                        const person  = isSiswa ? absenResult.data.siswa : absenResult.data.guru
                        const fotoUrl = person?.foto_url
                        const isLate  = absenResult.data.is_terlambat
                        const metodeMap = { fingerprint:'🖐 Sidik Jari', qr_code:'📷 QR Code', manual:'✏️ Manual', sistem:'⚙️ Sistem' }
                        const metode = absenResult.data.absensi?.metode
                        const metodeLabel = metodeMap[metode] || metode || '-'
                        const jamMasuk = absenResult.data.absensi?.jam_masuk?.substring(0,5)

                        return (
                          <div className={`rounded-2xl overflow-hidden ${isDark?'bg-white/5':'bg-white border border-slate-100'} shadow-sm`}>
                            {/* Foto + nama section */}
                            <div className={`relative flex items-center gap-4 px-4 py-4 ${isLate ? isDark?'bg-amber-500/10':'bg-amber-50' : isDark?'bg-emerald-500/10':'bg-emerald-50'}`}>
                              {/* foto */}
                              <div className="relative flex-shrink-0">
                                {fotoUrl ? (
                                  <img src={fotoUrl} alt={person?.nama}
                                    className={`w-16 h-16 rounded-2xl object-cover shadow-lg border-2 ${isLate?'border-amber-400':'border-emerald-400'}`}
                                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
                                  />
                                ) : null}
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg border-2 ${isLate?'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-400':'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-400'} ${fotoUrl?'hidden':''}`}>
                                  {(person?.nama||'?')[0].toUpperCase()}
                                </div>
                                {/* status dot */}
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center ${isLate?'bg-amber-400':'bg-emerald-400'}`}>
                                  {isLate ? <span className="text-[8px]">⏰</span> : <CheckCircle size={10} className="text-white"/>}
                                </div>
                              </div>

                              {/* nama & kelas */}
                              <div className="flex-1 min-w-0">
                                <p className={`font-black text-base truncate ${isDark?'text-white':'text-slate-800'}`}>{person?.nama}</p>
                                {isSiswa && (
                                  <p className={`text-xs font-semibold truncate ${isDark?'text-slate-400':'text-slate-500'}`}>
                                    {person?.kelas}{person?.jurusan ? ` · ${person.jurusan}` : ''}
                                  </p>
                                )}
                                {!isSiswa && (
                                  <p className={`text-xs font-semibold truncate ${isDark?'text-slate-400':'text-slate-500'}`}>
                                    {person?.nip}
                                  </p>
                                )}
                                {/* status badge */}
                                <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isLate ? isDark?'bg-amber-500/25 text-amber-300':'bg-amber-100 text-amber-700' : isDark?'bg-emerald-500/25 text-emerald-300':'bg-emerald-100 text-emerald-700'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isLate?'bg-amber-400':'bg-emerald-400'}`}/>
                                  {isLate ? `Terlambat ${absenResult.data.menit_terlambat || 0} menit` : 'Tepat Waktu'}
                                </span>
                              </div>

                              {/* jam besar di kanan */}
                              {jamMasuk && (
                                <div className="flex-shrink-0 text-right">
                                  <p className={`text-[9px] uppercase font-black tracking-widest mb-0.5 ${isDark?'text-slate-500':'text-slate-400'}`}>Jam Masuk</p>
                                  <p className={`text-2xl font-black font-mono ${isLate?'text-amber-500':'text-emerald-500'}`}>{jamMasuk}</p>
                                </div>
                              )}
                            </div>

                            {/* info bawah */}
                            <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-700">
                              {[
                                ...(isSiswa ? [{ label:'NIS', value: person?.nis || '-' }] : [{ label:'NIP', value: person?.nip || '-' }]),
                                { label:'Metode', value: metodeLabel },
                              ].map((item, i) => (
                                <div key={i} className={`px-3 py-2.5 ${isDark?'bg-slate-800/80':'bg-white'}`}>
                                  <p className={`text-[9px] uppercase font-black tracking-widest mb-0.5 ${isDark?'text-slate-500':'text-slate-400'}`}>{item.label}</p>
                                  <p className={`text-xs font-bold ${isDark?'text-white':'text-slate-700'}`}>{item.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}

                      {/* Gagal state */}
                      {!absenResult.success && (
                        <p className={`text-xs mt-1 ${isDark?'text-slate-300':'text-slate-600'}`}>{absenResult.message}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── INFO CARDS: Jadwal + Cara Absen ── */}
          {/* Mobile: 1 kolom atas-bawah | Desktop: 2 kolom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Jadwal */}
            <div className={`relative rounded-2xl overflow-hidden border ${isDark?'border-white/8':'border-slate-100 shadow-sm'}`}>
              <img src="/image/bg5.png" alt="" className="absolute inset-0 w-full h-full object-cover"/>
              <div className={`absolute inset-0 ${isDark?'bg-[#080e1a]/82':'bg-white/88'}`}/>
              <div className="relative z-10 p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${isDark?'bg-emerald-500/20':'bg-emerald-100'}`}>
                    <Clock size={10} className="text-emerald-500"/>
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDark?'text-slate-400':'text-slate-500'}`}>Jadwal</p>
                </div>
                <div className="space-y-2">
                  {[
                    { l:'Masuk',  v: jamMasuk||'-',                              c:'text-emerald-500' },
                    { l:'Pulang', v: pengaturan.jam_pulang?.substring(0,5)||'-', c:'text-blue-500' },
                    { l:'Buka',   v: pengaturan.jam_buka_absen?.substring(0,5)||'-', c:'text-purple-500' },
                  ].map((x,i)=>(
                    <div key={i} className="flex items-center justify-between">
                      <span className={`text-[11px] ${isDark?'text-slate-500':'text-slate-400'}`}>{x.l}</span>
                      <span className={`text-[11px] font-black font-mono ${x.c}`}>{x.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cara absen */}
            <div className={`relative rounded-2xl overflow-hidden border ${isDark?'border-white/8':'border-slate-100 shadow-sm'}`}>
              <img src="/image/bg4.png" alt="" className="absolute inset-0 w-full h-full object-cover"/>
              <div className={`absolute inset-0 ${isDark?'bg-[#080e1a]/82':'bg-white/88'}`}/>
              <div className="relative z-10 p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${isDark?'bg-emerald-500/20':'bg-emerald-100'}`}>
                    <Sparkles size={10} className="text-emerald-500"/>
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDark?'text-slate-400':'text-slate-500'}`}>Cara Absen</p>
                </div>
                <div className="space-y-2">
                  {[
                    { n:'1', t:'Pilih role (Siswa/Guru)', c:'bg-emerald-500' },
                    { n:'2', t:'Pilih metode absen',      c:'bg-teal-500' },
                    { n:'3', t:'Isi data & submit',       c:'bg-cyan-500' },
                  ].map((s,i)=>(
                    <div key={i} className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-md ${s.c} flex items-center justify-center text-[9px] font-black text-white flex-shrink-0`}>{s.n}</span>
                      <span className={`text-[11px] font-medium ${isDark?'text-slate-400':'text-slate-500'}`}>{s.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Login CTA ── */}
          <Link to="/login"
            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white transition-all shadow-xl shadow-emerald-500/20 group">
            <div>
              <p className="text-sm font-black">Login ke Dashboard</p>
              <p className="text-[11px] text-white/60 mt-0.5">Laporan, data siswa, pengaturan & lainnya</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-all flex-shrink-0">
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform"/>
            </div>
          </Link>

          {/* ── Daftar Sidik Jari CTA ── */}
          {pengaturan.fingerprint_enabled && (
            <motion.button
              whileHover={{scale:1.01}} whileTap={{scale:0.99}}
              onClick={handleOpenFpModal}
              className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all group ${
                isDark
                  ? 'border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/50'
                  : 'border-cyan-300 bg-cyan-50 hover:bg-cyan-100 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark?'bg-cyan-500/20':'bg-white shadow-md shadow-cyan-100'}`}>
                  <Fingerprint size={18} className="text-cyan-500"/>
                </div>
                <div className="text-left">
                  <p className={`text-sm font-black ${isDark?'text-cyan-300':'text-cyan-700'}`}>Daftar Sidik Jari</p>
                  <p className={`text-[10px] mt-0.5 ${isDark?'text-cyan-500/70':'text-cyan-500'}`}>Daftarkan jari ke mesin fingerprint sekolah</p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isDark?'bg-cyan-500/20 group-hover:bg-cyan-500/30':'bg-white shadow-sm group-hover:shadow-md'}`}>
                <ArrowRight size={14} className={`${isDark?'text-cyan-400':'text-cyan-500'} group-hover:translate-x-0.5 transition-transform`}/>
              </div>
            </motion.button>
          )}

          <p className={`text-center text-[10px] ${isDark?'text-white/10':'text-slate-300'}`}>
            © {new Date().getFullYear()} {pengaturan.nama_sekolah||'Sistem Absensi Digital'}
          </p>
        </div>
        </div>{/* end relative z-10 */}
      </div>

      {/* Mobile bottom role switcher */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-3 py-2 backdrop-blur-xl ${isDark?'bg-[#080e1a]/95 border-white/5':'bg-white/95 border-slate-100'}`}>
        <div className="flex gap-2 max-w-sm mx-auto">
          {[{ key:'siswa', label:'Siswa', icon:GraduationCap },{ key:'guru', label:'Guru', icon:User }].map(r => (
            <button key={r.key}
              onClick={() => { setUserRole(r.key); setAbsenResult(null); setErrors({}); setFormData({nisn:'',nip:'',nipPulang:''}); setPulangResult(null); setPulangSubTab('manual'); setShowScannerPulang(false); if(r.key==='guru'&&activeTab==='izin') setActiveTab('manual') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
                userRole===r.key ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' : isDark?'bg-white/5 text-slate-500':'bg-slate-100 text-slate-400'
              }`}>
              <r.icon size={13}/>{r.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showScanner && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <QrScanner onScan={handleQr} onError={(e)=>showError('Kamera Error',e)} onClose={()=>setShowScanner(false)}/>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScannerPulang && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <QrScanner onScan={handleQrPulang} onError={(e)=>showError('Kamera Error',e)} onClose={()=>setShowScannerPulang(false)}/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MODAL DAFTAR SIDIK JARI ══ */}
      <AnimatePresence>
        {showFpModal && (
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => { if (!fpLoading) { setShowFpModal(false); setFpResult(null); setFpFormErrors({}) } }}
          >
            <motion.div
              initial={{y:'100%', opacity:0}} animate={{y:0, opacity:1}} exit={{y:'100%', opacity:0}}
              transition={{type:'spring', bounce:0.18, duration:0.45}}
              className="bg-white dark:bg-[#0d1526] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
              onClick={e => e.stopPropagation()}
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20"/>
              </div>

              {/* Header */}
              <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 p-5">
                {/* BG pattern */}
                <div className="absolute inset-0 opacity-10"
                  style={{backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize:'14px 14px'}}/>
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div animate={{rotate:[0,10,-10,0]}} transition={{duration:2,repeat:Infinity,repeatDelay:3}}
                      className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg shadow-black/20">
                      <Fingerprint size={24} className="text-white"/>
                    </motion.div>
                    <div>
                      <h3 className="text-white font-black text-base">Daftar Sidik Jari</h3>
                      <p className="text-white/70 text-xs mt-0.5">Daftarkan ke mesin fingerprint sekolah</p>
                    </div>
                  </div>
                  <button onClick={() => { if (!fpLoading) { setShowFpModal(false); setFpResult(null); setFpFormErrors({}) } }}
                    className="p-1.5 rounded-xl hover:bg-white/20 transition-colors text-white/70 hover:text-white flex-shrink-0">
                    <X size={16}/>
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">

                {/* Jika belum berhasil daftar, tampilkan form */}
                {!fpResult?.success ? (
                  <>
                    {/* Info cara kerja */}
                    <div className={`p-3.5 rounded-2xl border ${isDark?'bg-cyan-500/8 border-cyan-500/20':'bg-cyan-50 border-cyan-200'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isDark?'text-cyan-400':'text-cyan-600'}`}>
                        📋 Cara Kerja
                      </p>
                      {[
                        {n:'1', t:'Isi NIS/NISN atau NIP di bawah lalu submit.'},
                        {n:'2', t:'Sistem mendaftarkan User ID ke mesin fingerprint.'},
                        {n:'3', t:'Datang ke mesin → ikuti instruksi layar → scan jari.'},
                        {n:'4', t:'Selesai! Absensi sidik jari langsung aktif.'},
                      ].map(s => (
                        <div key={s.n} className="flex items-start gap-2 mt-1.5">
                          <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5 ${isDark?'bg-cyan-500/30 text-cyan-300':'bg-cyan-100 text-cyan-600'}`}>{s.n}</span>
                          <p className={`text-[11px] leading-relaxed ${isDark?'text-slate-400':'text-slate-500'}`}>{s.t}</p>
                        </div>
                      ))}
                    </div>

                    {/* Error dari server */}
                    {fpResult?.success === false && (
                      <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
                        className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-xl">
                        <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5"/>
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">{fpResult.message}</p>
                      </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleFpRegister} className="space-y-3">
                      {/* Toggle tipe */}
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 ${isDark?'text-slate-300':'text-slate-700'}`}>
                          Saya adalah
                        </label>
                        <div className={`flex gap-1.5 p-1 rounded-xl ${isDark?'bg-white/5':'bg-slate-100'}`}>
                          {[
                            {k:'siswa', l:'Siswa', i:GraduationCap},
                            {k:'guru',  l:'Guru',  i:User},
                          ].map(t => (
                            <button key={t.k} type="button"
                              onClick={() => { setFpForm(p=>({...p, tipe:t.k, identifier:''})); setFpFormErrors({}) }}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                                fpForm.tipe===t.k
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                                  : isDark?'text-slate-500 hover:text-slate-300':'text-slate-400 hover:text-slate-600'
                              }`}>
                              <t.i size={11}/>{t.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Input NIS/NISN atau NIP */}
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 ${isDark?'text-slate-300':'text-slate-700'}`}>
                          {fpForm.tipe === 'siswa' ? 'NIS atau NISN' : 'NIP'}
                        </label>
                        <div className="relative">
                          <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center ${isDark?'bg-cyan-500/20':'bg-cyan-50'}`}>
                            <Hash size={13} className="text-cyan-500"/>
                          </div>
                          <input
                            type="text"
                            value={fpForm.identifier}
                            onChange={e => { setFpForm(p=>({...p, identifier:e.target.value})); setFpFormErrors({}) }}
                            disabled={fpLoading}
                            autoComplete="off"
                            placeholder={fpForm.tipe==='siswa' ? 'Masukkan NIS atau NISN' : 'Masukkan NIP'}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                              fpFormErrors.identifier
                                ? 'border-red-400 focus:ring-red-400/20 bg-red-50 dark:bg-red-500/10'
                                : isDark
                                  ? 'bg-white/5 border-white/10 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20'
                                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:bg-white'
                            } ${fpLoading?'opacity-50 cursor-not-allowed':''}`}
                          />
                        </div>
                        {fpFormErrors.identifier && (
                          <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                            <AlertCircle size={10}/>{fpFormErrors.identifier}
                          </p>
                        )}
                      </div>

                      {/* Submit */}
                      <motion.button whileTap={{scale:0.98}} type="submit" disabled={fpLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black rounded-xl shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                        {fpLoading
                          ? <><Loader size={15} className="animate-spin"/>Mendaftarkan...</>
                          : <><Fingerprint size={15}/>Daftarkan ke Mesin</>}
                      </motion.button>
                    </form>
                  </>
                ) : (
                  /* ── BERHASIL DAFTAR ── */
                  <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="space-y-4">
                    {/* Icon: processing vs success */}
                    <div className="flex flex-col items-center py-4">
                      {fpResult.data?.status === 'processing' ? (
                        <motion.div
                          animate={{rotate:360}} transition={{duration:2,repeat:Infinity,ease:'linear'}}
                          className="w-20 h-20 rounded-full border-4 border-cyan-200 border-t-cyan-500 mb-3"/>
                      ) : (
                        <motion.div
                          initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',bounce:0.5,delay:0.1}}
                          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl mb-3 ${
                            fpResult.data?.status === 'failed'
                              ? 'bg-gradient-to-br from-rose-400 to-red-500 shadow-rose-500/30'
                              : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30'
                          }`}>
                          {fpResult.data?.status === 'failed'
                            ? <X size={40} className="text-white"/>
                            : <CheckCircle size={40} className="text-white"/>}
                        </motion.div>
                      )}

                      <motion.p initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
                        className={`text-base font-black ${isDark?'text-white':'text-slate-800'}`}>
                        {fpResult.data?.status === 'processing' ? 'Sedang Diproses...' :
                         fpResult.data?.status === 'failed' ? 'Pendaftaran Gagal' :
                         fpResult.data?.status === 'already' ? 'Sudah Terdaftar ✅' :
                         'Berhasil Didaftarkan! 🎉'}
                      </motion.p>
                      <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}
                        className={`text-xs text-center mt-1 px-2 ${isDark?'text-slate-400':'text-slate-500'}`}>
                        {fpResult.data?.status === 'processing'
                          ? 'Menghubungi mesin fingerprint... Harap tunggu ±10 detik'
                          : fpResult.message || fpResult.data?.pesan || 'Pendaftaran sidik jari berhasil'}
                      </motion.p>
                    </div>

                    {/* Info card */}
                    <div className={`p-4 rounded-2xl border ${isDark?'bg-white/5 border-white/10':'bg-slate-50 border-slate-200'}`}>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {l:'Nama',         v: fpResult.data?.nama   || '-'},
                          {l:'User ID Mesin', v: fpResult.data?.userid || '-', mono:true},
                          {
                            l:'UID Mesin',
                            v: fpResult.data?.uid
                              ? String(fpResult.data.uid)
                              : fpResult.data?.status === 'processing'
                                ? '⏳ Memproses...'
                                : '-',
                            mono: !!fpResult.data?.uid
                          },
                          {l:'Tipe', v: fpForm.tipe === 'siswa' ? '🎓 Siswa' : '👨‍🏫 Guru'},
                        ].map((item,i) => (
                          <div key={i}>
                            <p className={`text-[9px] uppercase font-black tracking-wider mb-0.5 ${isDark?'text-slate-500':'text-slate-400'}`}>{item.l}</p>
                            <p className={`text-xs font-bold ${item.mono?'font-mono':''} ${isDark?'text-white':'text-slate-700'}`}>{item.v}</p>
                          </div>
                        ))}
                      </div>

                      {/* Polling status banner */}
                      {fpResult.data?.status === 'processing' && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}}
                          className={`mt-3 flex items-center gap-2 p-2.5 rounded-xl ${isDark?'bg-cyan-500/10 border border-cyan-500/20':'bg-cyan-50 border border-cyan-200'}`}>
                          <Loader size={12} className="text-cyan-500 animate-spin flex-shrink-0"/>
                          <p className={`text-[11px] font-semibold ${isDark?'text-cyan-400':'text-cyan-600'}`}>
                            Menghubungi mesin fingerprint...
                          </p>
                        </motion.div>
                      )}
                      {fpResult.data?.status === 'success' && (
                        <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
                          className={`mt-3 flex items-center gap-2 p-2.5 rounded-xl ${isDark?'bg-emerald-500/10 border border-emerald-500/20':'bg-emerald-50 border border-emerald-200'}`}>
                          <CheckCircle size={12} className="text-emerald-500 flex-shrink-0"/>
                          <p className={`text-[11px] font-semibold ${isDark?'text-emerald-400':'text-emerald-600'}`}>
                            ✅ Terdaftar di mesin! Sekarang datang ke mesin dan scan jari.
                          </p>
                        </motion.div>
                      )}
                      {fpResult.data?.status === 'already' && (
                        <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
                          className={`mt-3 flex items-center gap-2 p-2.5 rounded-xl ${isDark?'bg-amber-500/10 border border-amber-500/20':'bg-amber-50 border border-amber-200'}`}>
                          <AlertCircle size={12} className="text-amber-500 flex-shrink-0"/>
                          <p className={`text-[11px] font-semibold ${isDark?'text-amber-400':'text-amber-600'}`}>
                            Sudah terdaftar — langsung datang ke mesin untuk scan jari
                          </p>
                        </motion.div>
                      )}
                      {fpResult.data?.status === 'failed' && (
                        <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
                          className={`mt-3 flex items-center gap-2 p-2.5 rounded-xl ${isDark?'bg-red-500/10 border border-red-500/20':'bg-red-50 border border-red-200'}`}>
                          <AlertCircle size={12} className="text-red-500 flex-shrink-0"/>
                          <p className={`text-[11px] font-semibold ${isDark?'text-red-400':'text-red-600'}`}>
                            {fpResult.data?.message || 'Gagal mendaftarkan. Coba lagi.'}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Langkah selanjutnya — hanya tampil jika success/already/timeout */}
                    {fpResult.data?.status !== 'processing' && fpResult.data?.status !== 'failed' && (
                      <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
                        className={`p-3.5 rounded-2xl border ${isDark?'bg-emerald-500/10 border-emerald-500/25':'bg-emerald-50 border-emerald-200'}`}>
                        <p className={`text-xs font-black mb-2 ${isDark?'text-emerald-300':'text-emerald-700'}`}>
                          📋 Langkah Selanjutnya
                        </p>
                        <div className="space-y-1.5">
                          {[
                            `1. User ID kamu: ${fpResult.data?.userid || '-'} (catat ini!)`,
                            '2. Datang ke mesin fingerprint yang tersedia.',
                            '3. Di mesin: pilih Enroll → masukkan User ID → scan jari.',
                            '4. Ulangi scan 3–5 kali sampai mesin konfirmasi "OK".',
                          ].map((s,i) => (
                            <p key={i} className={`text-[11px] leading-relaxed ${isDark?'text-emerald-400/80':'text-emerald-700/80'}`}>{s}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {fpResult.data?.status !== 'processing' && (
                        <button
                          onClick={() => { setFpResult(null); setFpForm(p=>({...p, identifier:''})) }}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${isDark?'border-white/10 text-slate-300 hover:bg-white/5':'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                          Daftarkan Lagi
                        </button>
                      )}
                      <button
                        onClick={() => { setShowFpModal(false); setFpResult(null); setFpFormErrors({}) }}
                        className={`${fpResult.data?.status === 'processing' ? 'w-full' : 'flex-1'} py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-cyan-500/25 hover:from-cyan-600 hover:to-blue-700 transition-all`}>
                        {fpResult.data?.status === 'processing' ? 'Tutup (Proses Tetap Berjalan)' : 'Selesai'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
