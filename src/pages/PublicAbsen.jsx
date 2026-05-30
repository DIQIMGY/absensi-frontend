import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Hash, QrCode, Camera, CheckCircle, AlertCircle, X, Clock, Calendar,
  Loader, School, ScanLine, Fingerprint, ArrowRight, Info, Sparkles, Shield,
  FileText, Moon, Sun, GraduationCap, Zap, TrendingUp, Star, Activity, LogOut,
  ChevronRight, Wifi, MapPin
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
  const [pulangSubTab, setPulangSubTab] = useState('manual')
  const [formData, setFormData] = useState({ nisn: '', nip: '', nipPulang: '' })
  const [errors, setErrors] = useState({})
  const [absenResult, setAbsenResult] = useState(null)
  const [pulangResult, setPulangResult] = useState(null)
  const [waktu, setWaktu] = useState(new Date())
  const [jamMasuk, setJamMasuk] = useState('07:15')
  const { pengaturan, fetchPengaturan } = usePengaturanStore()
  const { isDark, toggleTheme } = useThemeStore()

  const getKet = () => { try { return `public-absen; ua=${navigator.userAgent}` } catch { return 'public-absen' } }

  const showSudahAbsen = async (existingData) => {
    const metodeMap = { fingerprint: '🖐 Sidik Jari', qr_code: '📷 QR Code', manual: '✏️ Manual', sistem: '⚙️ Sistem' }
    const metodeLabel = metodeMap[existingData?.metode] || '✅ Sistem'
    const jamAbsen = existingData?.jam_masuk ? ` pukul ${existingData.jam_masuk.substring(0, 5)}` : ''
    const statusLabel = existingData?.status === 'terlambat' ? ' (Terlambat)' : ' (Tepat Waktu)'
    playAlreadyAbsenSound()
    await showWarning('Sudah Absen Hari Ini', `Kamu sudah tercatat absen${jamAbsen}${statusLabel} via ${metodeLabel}. Tidak perlu absen lagi.`)
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
      if (s > 0) { await showWarning('Pulang Lebih Awal', `Pulang ${Math.abs(s)} menit lebih awal dari jam pulang sekolah (${d.jam_pulang_sekolah}).`) }
      else if (s < 0) { showSuccess('Terima Kasih!', `Lembur ${Math.abs(s)} menit. Terima kasih!`) }
      else { showSuccess('Absen Pulang Berhasil', 'Pulang tepat waktu.') }
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan'
      setPulangResult({ success: false, message: msg })
      playErrorSound()
      if (msg.includes('belum') && msg.includes('masuk')) { await showWarning('Belum Absen Masuk', 'Kamu belum tercatat absen masuk hari ini.') }
      else if (msg.includes('sudah') && msg.includes('pulang')) { playAlreadyAbsenSound(); await showWarning('Sudah Absen Pulang', 'Kamu sudah tercatat absen pulang hari ini.') }
      else if (msg.toLowerCase().includes('alpha')) { await showWarning('Tidak Bisa Absen Pulang', 'Kamu tercatat Alpha hari ini.') }
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
      if (s > 0) { await showWarning('Pulang Lebih Awal', `Pulang ${Math.abs(s)} menit lebih awal dari jam pulang sekolah (${d.jam_pulang_sekolah}).`) }
      else if (s < 0) { showSuccess('Terima Kasih!', `Lembur ${Math.abs(s)} menit. Terima kasih!`) }
      else { showSuccess('Absen Pulang Berhasil', 'Pulang tepat waktu.') }
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan'
      setPulangResult({ success: false, message: msg })
      playErrorSound()
      if (msg.includes('belum') && msg.includes('masuk')) { await showWarning('Belum Absen Masuk', 'Kamu belum tercatat absen masuk hari ini.') }
      else if (msg.includes('sudah') && msg.includes('pulang')) { playAlreadyAbsenSound(); await showWarning('Sudah Absen Pulang', 'Kamu sudah tercatat absen pulang hari ini.') }
      else if (msg.toLowerCase().includes('alpha')) { await showWarning('Tidak Bisa Absen Pulang', 'Kamu tercatat Alpha hari ini.') }
      else if (msg.includes('tidak valid') || msg.includes('tidak terdaftar')) { showError('QR Tidak Valid', 'QR Code tidak dikenali.') }
      else { showError('Gagal', msg) }
    } finally { setLoading(false) }
  }

  const tabs = [
    { key: 'manual', label: 'Manual', icon: Fingerprint },
    { key: 'qr', label: 'QR Code', icon: ScanLine },
    ...(userRole === 'siswa' ? [{ key: 'izin', label: 'Izin/Sakit', icon: FileText }] : []),
    { key: 'pulang', label: 'Pulang', icon: LogOut },
  ]

  const resetRole = (role) => {
    setUserRole(role)
    setAbsenResult(null)
    setErrors({})
    setFormData({ nisn: '', nip: '', nipPulang: '' })
    setPulangResult(null)
    setPulangSubTab('manual')
    setShowScannerPulang(false)
    if (role === 'guru' && activeTab === 'izin') setActiveTab('manual')
  }

  // ─── THEME TOKENS ────────────────────────────────────────────────────────────
  const bg     = isDark ? 'bg-[#0a0f1e]'       : 'bg-[#f5f7ff]'
  const card   = isDark ? 'bg-[#111827]/80'     : 'bg-white'
  const border = isDark ? 'border-white/[0.07]' : 'border-slate-200/80'
  const txt    = isDark ? 'text-white'          : 'text-slate-900'
  const sub    = isDark ? 'text-slate-400'      : 'text-slate-500'
  const muted  = isDark ? 'text-slate-600'      : 'text-slate-400'
  const inputBg = isDark
    ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-slate-600 focus:border-emerald-500/60 focus:ring-emerald-500/10'
    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/15 focus:bg-white'

  return (
    <div className={`min-h-screen ${bg} font-sans antialiased`}>

      {/* ══════════════════════════════════════════════════════════════════
          LAYOUT: sidebar kiri (desktop) + konten kanan
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex min-h-screen md:h-screen md:overflow-hidden">

        {/* ── SIDEBAR KIRI ─────────────────────────────────────────────── */}
        <aside className="hidden md:flex w-[280px] lg:w-[320px] xl:w-[360px] flex-shrink-0 flex-col h-screen relative overflow-hidden">
          {/* BG layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1f3c] via-[#0a1628] to-[#060d1a]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.18)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.10)_0%,transparent_55%)]" />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* Glow orb */}
          <div className="absolute top-1/4 -left-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full p-6 xl:p-8 overflow-y-auto">

            {/* Logo + nama sekolah */}
            <div className="flex items-center gap-3 mb-8">
              {loadingPengaturan
                ? <div className="w-10 h-10 rounded-2xl bg-white/10 animate-pulse flex-shrink-0" />
                : pengaturan.logo_sekolah
                  ? <img src={pengaturan.logo_sekolah} alt="" className="w-10 h-10 rounded-2xl object-contain bg-white/10 p-1 ring-1 ring-white/15 flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                  : <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center ring-1 ring-white/15 flex-shrink-0"><School size={18} className="text-white/70" /></div>
              }
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">{pengaturan.nama_sekolah || 'Sistem Absensi'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${boleh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className={`text-[10px] font-semibold ${boleh ? 'text-emerald-400' : 'text-slate-500'}`}>{boleh ? 'Sistem Aktif' : 'Tidak Aktif'}</span>
                </div>
              </div>
              <Link to="/login" className="ml-auto flex-shrink-0 p-2 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all" title="Login">
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Jam besar */}
            <div className="mb-1">
              <p className="text-[52px] xl:text-[60px] font-black text-white tabular-nums tracking-tight leading-none"
                style={{ textShadow: '0 0 60px rgba(52,211,153,0.25)' }}>
                {fmtJam(waktu)}
              </p>
            </div>
            <p className={`text-xs mb-5 ${sub}`}>{fmtTgl(waktu)}</p>

            {/* Status badge */}
            <div className={`self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold mb-6 border ${
              boleh ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300' : 'bg-red-500/15 border-red-500/25 text-red-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${boleh ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {boleh ? `Absensi Dibuka · Masuk ${jamMasuk}` : pesan?.title || 'Tidak Aktif'}
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: 'Jam Masuk',  value: jamMasuk || '-',                              color: 'text-emerald-400' },
                { label: 'Jam Pulang', value: pengaturan.jam_pulang?.substring(0,5) || '-', color: 'text-cyan-400' },
                { label: 'Hari Aktif', value: `${(pengaturan.hari_aktif||[]).length} hari`,  color: 'text-violet-400' },
                { label: 'Status',     value: boleh ? 'Buka' : 'Tutup',                     color: boleh ? 'text-emerald-400' : 'text-red-400' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-3.5 border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm">
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-1.5">{s.label}</p>
                  <p className={`font-black text-sm leading-none ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Hari aktif pills */}
            {(pengaturan.hari_aktif || []).length > 0 && (
              <div className="mb-5">
                <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest mb-2">Hari Sekolah</p>
                <div className="flex flex-wrap gap-1.5">
                  {(pengaturan.hari_aktif || []).map((h, i) => {
                    const isToday = fmtHari(new Date()) === h
                    return (
                      <span key={i} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        isToday ? 'bg-emerald-400 border-emerald-400 text-emerald-950' : 'bg-white/[0.04] border-white/[0.08] text-white/35'
                      }`}>{h.substring(0, 3)}</span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Role switcher */}
            <div className="mt-auto">
              <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest mb-2.5">Saya adalah</p>
              <div className="flex gap-2">
                {[
                  { key: 'siswa', label: 'Siswa', icon: GraduationCap, sub: 'NIS / NISN' },
                  { key: 'guru',  label: 'Guru',  icon: User,           sub: 'NIP' },
                ].map(r => (
                  <motion.button key={r.key} whileTap={{ scale: 0.97 }}
                    onClick={() => resetRole(r.key)}
                    className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all ${
                      userRole === r.key
                        ? 'bg-white border-white text-slate-900 shadow-xl shadow-black/30'
                        : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:border-white/15'
                    }`}>
                    <r.icon size={15} />
                    <div className="text-left">
                      <p className="text-xs font-black leading-tight">{r.label}</p>
                      <p className={`text-[10px] font-medium ${userRole === r.key ? 'text-emerald-600' : 'text-white/25'}`}>{r.sub}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer strip */}
            <div className="pt-5 mt-5 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Wifi size={10} className="text-emerald-500/60" />
                  <span className="text-white/20 text-[10px]">Real-time · sync 30s</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-[10px] font-bold">LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── KONTEN KANAN ─────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-y-auto">

          {/* Mobile top bar */}
          <header className={`md:hidden sticky top-0 z-30 border-b backdrop-blur-xl ${isDark ? 'bg-[#0a0f1e]/90 border-white/[0.06]' : 'bg-white/90 border-slate-200/60'}`}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                {pengaturan.logo_sekolah
                  ? <img src={pengaturan.logo_sekolah} alt="" className="w-8 h-8 rounded-xl object-contain flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                  : <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0"><School size={14} className="text-white" /></div>
                }
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${txt}`}>{pengaturan.nama_sekolah || 'Absensi'}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{fmtJam(waktu)}</span>
                    <span className={`flex items-center gap-1 text-[9px] font-bold ${boleh ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-red-400' : 'text-red-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${boleh ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                      {boleh ? 'Buka' : 'Tutup'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className={`p-2 rounded-xl border transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}>
                  {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-500" />}
                </button>
                <Link to="/login" className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-emerald-500/20">
                  Login <ArrowRight size={10} />
                </Link>
              </div>
            </div>
            {!boleh && pesan && (
              <div className={`flex items-center gap-2 px-4 py-2 border-t text-[11px] font-semibold ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                <span>{pesan.icon}</span><span>{pesan.title} · {pesan.msg}</span>
              </div>
            )}
          </header>

          {/* Konten utama */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 pb-24 md:pb-8 flex flex-col gap-4">

            {/* Desktop header row */}
            <div className="hidden md:flex items-center justify-between">
              <div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-2 border ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  <Zap size={9} /> Absensi Digital
                </div>
                <h1 className={`text-2xl font-black leading-tight ${txt}`}>
                  Absen <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Sekarang</span>
                </h1>
                <p className={`text-xs mt-0.5 ${sub}`}>{userRole === 'siswa' ? 'Masukkan NIS/NISN atau scan QR Code' : 'Masukkan NIP atau scan QR Code'}</p>
              </div>
              <button onClick={toggleTheme} className={`p-2.5 rounded-xl border transition-all hover:scale-105 ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}>
                {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-500" />}
              </button>
            </div>

            {/* Warning banner (desktop) */}
            <AnimatePresence>
              {!boleh && pesan && (
                <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className={`hidden md:flex items-center gap-3 p-4 rounded-2xl border ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                  <span className="text-xl">{pesan.icon}</span>
                  <div>
                    <p className={`text-xs font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>{pesan.title}</p>
                    <p className={`text-[11px] ${isDark ? 'text-amber-400/60' : 'text-amber-700'}`}>{pesan.msg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Banner libur */}
            <AnimatePresence>
              {isLibur() && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  className="relative overflow-hidden rounded-2xl min-h-[90px]">
                  {pengaturan.foto_libur_bg
                    ? <img src={pengaturan.foto_libur_bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    : <div className="absolute inset-0 bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#0891b2]" />
                  }
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 border border-white/15 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Hari Libur</span>
                      </div>
                      <h3 className="text-white font-black text-base sm:text-lg leading-tight drop-shadow">{pengaturan.keterangan_libur || 'Libur Sekolah'}</h3>
                      <p className="text-white/50 text-xs mt-0.5">
                        {pengaturan.tanggal_libur_mulai && pengaturan.tanggal_libur_selesai
                          ? `${new Date(pengaturan.tanggal_libur_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} — ${new Date(pengaturan.tanggal_libur_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                          : 'Absensi tidak tersedia'}
                      </p>
                    </div>
                    {[pengaturan.foto_libur, pengaturan.foto_libur_2, pengaturan.foto_libur_3, pengaturan.foto_libur_4].filter(Boolean).length > 0 && (
                      <div className="flex items-center flex-shrink-0">
                        {[pengaturan.foto_libur, pengaturan.foto_libur_2, pengaturan.foto_libur_3, pengaturan.foto_libur_4].filter(Boolean).map((src, i) => (
                          <img key={i} src={src} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white/50 shadow-md"
                            style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 4 - i }}
                            onError={e => e.target.style.display = 'none'} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── MAIN CARD ── */}
            <div className={`rounded-2xl border overflow-hidden ${card} ${border} ${isDark ? '' : 'shadow-xl shadow-slate-200/50'}`}>
              {/* Top accent bar */}
              <div className="h-[3px] bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400" />

              <div className="p-4 sm:p-6">
                {/* Tab bar */}
                <div className={`flex gap-1 p-1 rounded-xl mb-5 ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
                  {tabs.map(t => (
                    <button key={t.key}
                      onClick={() => { setActiveTab(t.key); setAbsenResult(null); setErrors({}); setPulangResult(null); setShowScannerPulang(false) }}
                      className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                        activeTab === t.key
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                          : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                      }`}>
                      <t.icon size={11} /><span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab: Manual */}
                <AnimatePresence mode="wait">
                  {activeTab === 'manual' && (
                    <motion.form key="manual" onSubmit={handleAbsen}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }}
                      className="space-y-3">
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {userRole === 'siswa' ? 'NIS / NISN' : 'NIP'}
                        </label>
                        <div className="relative">
                          <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-50'}`}>
                            <Hash size={13} className="text-emerald-500" />
                          </div>
                          <input type="text"
                            name={userRole === 'siswa' ? 'nisn' : 'nip'}
                            value={userRole === 'siswa' ? formData.nisn : formData.nip}
                            onChange={handleInput}
                            disabled={loading || !boleh}
                            autoComplete="off"
                            placeholder={userRole === 'siswa' ? 'Masukkan NIS atau NISN' : 'Masukkan NIP'}
                            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                              (userRole === 'siswa' ? errors.nisn : errors.nip) ? 'border-red-400 focus:ring-red-400/20' : inputBg
                            } ${!boleh ? 'opacity-40 cursor-not-allowed' : ''}`}
                          />
                        </div>
                        {(userRole === 'siswa' ? errors.nisn : errors.nip) && (
                          <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10} />{userRole === 'siswa' ? errors.nisn : errors.nip}</p>
                        )}
                      </div>

                      <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-[11px] ${isDark ? 'bg-white/[0.03] border-white/[0.06] text-slate-500' : 'bg-emerald-50/80 border-emerald-100 text-slate-500'}`}>
                        <Info size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{userRole === 'siswa'
                          ? <> Masukkan NIS atau NISN. Belum punya akun? <Link to="/register" className="text-emerald-500 font-bold underline underline-offset-2">Registrasi</Link></>
                          : 'Masukkan NIP yang terdaftar di sistem sekolah.'
                        }</span>
                      </div>

                      <motion.button whileTap={{ scale: 0.99 }} type="submit" disabled={loading || !boleh}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide">
                        {loading ? <><Loader size={15} className="animate-spin" />Memproses...</>
                          : !boleh ? <><AlertCircle size={15} />{pesan?.title || 'Tidak Aktif'}</>
                          : <><CheckCircle size={15} />Absen Sekarang</>}
                      </motion.button>

                      <p className={`text-center text-[11px] ${muted}`}>
                        Belum punya akun? <Link to="/register" className="text-emerald-500 font-bold">Registrasi</Link>
                      </p>
                    </motion.form>
                  )}

                  {/* Tab: QR */}
                  {activeTab === 'qr' && (
                    <motion.div key="qr" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
                      className="space-y-3">
                      <div className={`rounded-2xl border-2 border-dashed p-8 text-center ${isDark ? 'border-white/[0.08] bg-white/[0.02]' : 'border-emerald-200 bg-emerald-50/40'}`}>
                        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                          className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center mb-3 ${isDark ? 'bg-emerald-500/15' : 'bg-white shadow-lg shadow-emerald-100'}`}>
                          <QrCode size={28} className="text-emerald-500" />
                        </motion.div>
                        <p className={`text-sm font-black mb-1 ${txt}`}>Scan QR Code</p>
                        <p className={`text-xs mb-4 ${sub}`}>Aktifkan kamera untuk scan QR Code absensi</p>
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowScanner(true)} disabled={!boleh}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/25 disabled:opacity-40 transition-all">
                          <Camera size={14} />{boleh ? 'Buka Kamera' : pesan?.title || 'Tidak Aktif'}
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['Pencahayaan cukup', 'QR di tengah kamera', 'Jarak 10–20 cm', 'Hindari gerakan'].map((t, i) => (
                          <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-100'}`}>
                            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black flex-shrink-0 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>{i + 1}</span>
                            <span className={`text-[10px] font-medium ${sub}`}>{t}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Tab: Izin */}
                  {activeTab === 'izin' && userRole === 'siswa' && (
                    <motion.div key="izin" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>
                      <FormIzin />
                    </motion.div>
                  )}

                  {/* Tab: Pulang */}
                  {activeTab === 'pulang' && (
                    <motion.div key="pulang" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
                      className="space-y-4">

                      {/* Info banner */}
                      <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                          <LogOut size={15} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                            {userRole === 'guru' ? 'Absen Pulang Guru' : 'Absen Pulang Siswa'}
                          </p>
                          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-emerald-400/70' : 'text-emerald-700'}`}>
                            Jam pulang: <span className="font-black">{pengaturan.jam_pulang?.substring(0, 5) || '-'}</span>
                            {' · '}Hanya yang sudah absen masuk yang bisa absen pulang.
                          </p>
                        </div>
                      </div>

                      {/* Sub-tabs */}
                      <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
                        {[
                          { key: 'manual', label: userRole === 'guru' ? '✍️ Manual NIP' : '✍️ Manual NIS', icon: Hash },
                          { key: 'qr',     label: '📷 QR Code', icon: QrCode },
                        ].map(st => (
                          <button key={st.key}
                            onClick={() => { setPulangSubTab(st.key); setErrors({}); setPulangResult(null); setShowScannerPulang(false) }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all ${
                              pulangSubTab === st.key
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                                : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                            }`}>
                            <st.icon size={11} />{st.label}
                          </button>
                        ))}
                      </div>

                      {/* Manual pulang */}
                      {pulangSubTab === 'manual' && (
                        <form onSubmit={handlePulangManual} className="space-y-3">
                          <div>
                            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {userRole === 'guru' ? 'NIP' : 'NIS / NISN'}
                            </label>
                            <div className="relative">
                              <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-50'}`}>
                                <Hash size={13} className="text-emerald-500" />
                              </div>
                              <input type="text" name="nipPulang" value={formData.nipPulang}
                                onChange={e => { setFormData(p => ({ ...p, nipPulang: e.target.value })); setErrors(p => ({ ...p, nipPulang: '' })) }}
                                disabled={loading} autoComplete="off"
                                placeholder={userRole === 'guru' ? 'Masukkan NIP untuk absen pulang' : 'Masukkan NIS/NISN untuk absen pulang'}
                                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                                  errors.nipPulang ? 'border-red-400 focus:ring-red-400/20' : inputBg
                                } ${loading ? 'opacity-40 cursor-not-allowed' : ''}`}
                              />
                            </div>
                            {errors.nipPulang && (
                              <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10} />{errors.nipPulang}</p>
                            )}
                          </div>
                          <motion.button whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide">
                            {loading ? <><Loader size={15} className="animate-spin" />Memproses...</> : <><LogOut size={15} />Absen Pulang Sekarang</>}
                          </motion.button>
                        </form>
                      )}

                      {/* QR pulang */}
                      {pulangSubTab === 'qr' && (
                        <div className={`rounded-2xl border-2 border-dashed p-8 text-center ${isDark ? 'border-white/[0.08] bg-white/[0.02]' : 'border-emerald-200 bg-emerald-50/40'}`}>
                          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                            className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center mb-3 ${isDark ? 'bg-emerald-500/15' : 'bg-white shadow-lg shadow-emerald-100'}`}>
                            <QrCode size={28} className="text-emerald-500" />
                          </motion.div>
                          <p className={`text-sm font-black mb-1 ${txt}`}>Scan QR Code Pulang</p>
                          <p className={`text-xs mb-4 ${sub}`}>Aktifkan kamera untuk scan QR Code absen pulang</p>
                          <motion.button whileTap={{ scale: 0.97 }}
                            onClick={() => { setPulangResult(null); setShowScannerPulang(true) }}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/25 disabled:opacity-40 transition-all">
                            <Camera size={14} />Buka Kamera
                          </motion.button>
                        </div>
                      )}

                      {/* Result pulang */}
                      <AnimatePresence>
                        {pulangResult && (
                          <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
                            className={`rounded-2xl border-2 overflow-hidden ${pulangResult.success ? isDark ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-emerald-50 border-emerald-200' : isDark ? 'bg-red-500/10 border-red-500/25' : 'bg-red-50 border-red-200'}`}>
                            <div className={`px-4 py-2.5 flex items-center justify-between ${pulangResult.success ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                              <div className="flex items-center gap-2">
                                {pulangResult.success ? <CheckCircle size={13} className="text-white" /> : <X size={13} className="text-white" />}
                                <span className="text-white text-xs font-black">{pulangResult.success ? 'Absen Pulang Berhasil!' : 'Absen Pulang Gagal'}</span>
                              </div>
                              <button onClick={() => setPulangResult(null)} className="text-white/60 hover:text-white"><X size={12} /></button>
                            </div>
                            <div className="p-4">
                              <p className={`text-xs mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{pulangResult.message}</p>
                              {pulangResult.success && pulangResult.data && (
                                <div className={`rounded-xl p-3 grid grid-cols-2 gap-2.5 ${isDark ? 'bg-white/[0.04]' : 'bg-white border border-slate-100'}`}>
                                  {(() => {
                                    const d = pulangResult.data
                                    const selisih = d.menit_pulang_cepat
                                    const abs = Math.abs(selisih ?? 0)
                                    const jam = Math.floor(abs / 60), sisa = abs % 60
                                    const durasi = jam > 0 ? (sisa > 0 ? `${jam} jam ${sisa} menit` : `${jam} jam`) : `${abs} menit`
                                    const selisihLabel = selisih > 0 ? `${durasi} lebih awal` : selisih < 0 ? `Lembur ${durasi}` : 'Tepat waktu'
                                    const selisihColor = selisih > 0 ? isDark ? 'text-amber-300' : 'text-amber-600' : selisih < 0 ? isDark ? 'text-emerald-300' : 'text-emerald-600' : isDark ? 'text-blue-300' : 'text-blue-600'
                                    const nama = userRole === 'guru' ? d.guru?.nama : d.siswa?.nama
                                    const extra = userRole === 'siswa' && d.siswa?.kelas ? [{ label: 'Kelas', value: d.siswa.kelas }] : []
                                    return [
                                      { label: 'Nama', value: nama },
                                      ...extra,
                                      { label: 'Jam Pulang', value: d.absensi?.jam_pulang ? String(d.absensi.jam_pulang).substring(0, 5) : '-', mono: true },
                                      { label: 'Jam Sekolah', value: d.jam_pulang_sekolah, mono: true },
                                      { label: 'Selisih', value: selisihLabel, color: selisihColor },
                                    ].map((item, i) => (
                                      <div key={i}>
                                        <p className={`text-[9px] uppercase font-black mb-0.5 tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{item.label}</p>
                                        <p className={`text-xs font-bold truncate ${item.mono ? 'font-mono' : ''} ${item.color || (isDark ? 'text-white' : 'text-slate-800')}`}>{item.value}</p>
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
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
                      className={`mt-4 rounded-2xl border-2 overflow-hidden ${absenResult.success ? isDark ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-emerald-50 border-emerald-200' : isDark ? 'bg-red-500/10 border-red-500/25' : 'bg-red-50 border-red-200'}`}>
                      <div className={`px-4 py-2.5 flex items-center justify-between ${absenResult.success ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                        <div className="flex items-center gap-2">
                          {absenResult.success ? <CheckCircle size={13} className="text-white" /> : <X size={13} className="text-white" />}
                          <span className="text-white text-xs font-black">{absenResult.success ? 'Absensi Berhasil!' : 'Absensi Gagal'}</span>
                        </div>
                        <button onClick={() => { setAbsenResult(null); setErrors({}) }} className="text-white/60 hover:text-white"><X size={12} /></button>
                      </div>
                      <div className="p-4">
                        <p className={`text-xs mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{absenResult.message}</p>
                        {absenResult.success && absenResult.data && (
                          <div className={`rounded-xl p-3 grid grid-cols-2 gap-2.5 ${isDark ? 'bg-white/[0.04]' : 'bg-white border border-slate-100'}`}>
                            {(() => {
                              const metodeMap = { fingerprint: '🖐 Sidik Jari', qr_code: '📷 QR Code', manual: '✏️ Manual', sistem: '⚙️ Sistem' }
                              const metode = absenResult.data.absensi?.metode
                              const metodeLabel = metodeMap[metode] || metode || '-'
                              return [
                                { label: 'Nama', value: absenResult.role === 'siswa' ? absenResult.data.siswa?.nama : absenResult.data.guru?.nama },
                                ...(absenResult.role === 'siswa' ? [{ label: 'Kelas', value: absenResult.data.siswa?.kelas }] : []),
                                { label: 'Status', value: absenResult.data.is_terlambat ? 'Terlambat' : 'Tepat Waktu', badge: true, late: absenResult.data.is_terlambat },
                                ...(absenResult.data.absensi ? [{ label: 'Jam Masuk', value: absenResult.data.absensi.jam_masuk?.substring(0, 5), mono: true }] : []),
                                { label: 'Metode', value: metodeLabel },
                              ]
                            })().map((item, i) => (
                              <div key={i}>
                                <p className={`text-[9px] uppercase font-black mb-0.5 tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{item.label}</p>
                                {item.badge
                                  ? <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${item.late ? isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700' : isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${item.late ? 'bg-amber-400' : 'bg-emerald-400'}`} />{item.value}
                                    </span>
                                  : <p className={`text-xs font-bold truncate ${item.mono ? 'font-mono' : ''} ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.value}</p>
                                }
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── INFO CARDS BAWAH ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Jadwal */}
              <div className={`relative rounded-2xl overflow-hidden border ${border} ${isDark ? '' : 'shadow-sm'}`}>
                <img src="/image/bg5.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className={`absolute inset-0 ${isDark ? 'bg-[#111827]/85' : 'bg-white/85'}`} />
                <div className="relative z-10 p-4">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${muted}`}>
                    <Clock size={10} className="text-emerald-500" />Jadwal Sekolah
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { l: 'Masuk',  v: jamMasuk || '-',                                  c: 'text-emerald-500' },
                      { l: 'Pulang', v: pengaturan.jam_pulang?.substring(0, 5) || '-',    c: 'text-cyan-500' },
                      { l: 'Buka',   v: pengaturan.jam_buka_absen?.substring(0, 5) || '-', c: 'text-violet-500' },
                    ].map((x, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className={`text-[11px] ${sub}`}>{x.l}</span>
                        <span className={`text-[11px] font-black font-mono ${x.c}`}>{x.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cara absen */}
              <div className={`relative rounded-2xl overflow-hidden border ${border} ${isDark ? '' : 'shadow-sm'}`}>
                <img src="/image/bg4.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className={`absolute inset-0 ${isDark ? 'bg-[#111827]/85' : 'bg-white/85'}`} />
                <div className="relative z-10 p-4">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${muted}`}>
                    <Sparkles size={10} className="text-emerald-500" />Cara Absen
                  </p>
                  <div className="space-y-2">
                    {[
                      { n: '1', t: 'Pilih role (Siswa/Guru)', c: 'bg-emerald-500' },
                      { n: '2', t: 'Pilih metode absen',      c: 'bg-teal-500' },
                      { n: '3', t: 'Isi data & submit',       c: 'bg-cyan-500' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-md ${s.c} flex items-center justify-center text-[9px] font-black text-white flex-shrink-0`}>{s.n}</span>
                        <span className={`text-[11px] font-medium ${sub}`}>{s.t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Login CTA */}
            <Link to="/login"
              className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white transition-all shadow-xl shadow-emerald-500/20 group">
              <div>
                <p className="text-sm font-black">Login ke Dashboard</p>
                <p className="text-[11px] text-white/60 mt-0.5">Laporan, data siswa, pengaturan & lainnya</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-all">
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <p className={`text-center text-[10px] ${isDark ? 'text-white/10' : 'text-slate-300'}`}>
              © {new Date().getFullYear()} {pengaturan.nama_sekolah || 'Sistem Absensi Digital'}
            </p>
          </div>
        </main>
      </div>

      {/* Mobile bottom role switcher */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-3 py-2.5 backdrop-blur-xl ${isDark ? 'bg-[#0a0f1e]/95 border-white/[0.06]' : 'bg-white/95 border-slate-200/60'}`}>
        <div className="flex gap-2 max-w-sm mx-auto">
          {[{ key: 'siswa', label: 'Siswa', icon: GraduationCap }, { key: 'guru', label: 'Guru', icon: User }].map(r => (
            <button key={r.key}
              onClick={() => resetRole(r.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
                userRole === r.key
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : isDark ? 'bg-white/[0.05] text-slate-500' : 'bg-slate-100 text-slate-400'
              }`}>
              <r.icon size={13} />{r.label}
            </button>
          ))}
        </div>
      </div>

      {/* QR Scanner modals */}
      <AnimatePresence>
        {showScanner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QrScanner onScan={handleQr} onError={(e) => showError('Kamera Error', e)} onClose={() => setShowScanner(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScannerPulang && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QrScanner onScan={handleQrPulang} onError={(e) => showError('Kamera Error', e)} onClose={() => setShowScannerPulang(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
