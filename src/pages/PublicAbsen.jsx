import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Hash, QrCode, Camera, CheckCircle, AlertCircle, X, Clock, Calendar,
  Loader, School, ScanLine, Fingerprint, ArrowRight, Info, Sparkles, Shield,
  FileText, Moon, Sun, GraduationCap, Zap, TrendingUp, Star, Activity,
  Flame, Trophy, Target
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
  const [formData, setFormData] = useState({ nisn: '', nip: '' })
  const [errors, setErrors] = useState({})
  const [absenResult, setAbsenResult] = useState(null)
  const [waktu, setWaktu] = useState(new Date())
  const [jamMasuk, setJamMasuk] = useState('07:15')
  const { pengaturan, fetchPengaturan } = usePengaturanStore()
  const { isDark, toggleTheme } = useThemeStore()

  const getKet = () => { try { return `public-absen; ua=${navigator.userAgent}` } catch { return 'public-absen' } }

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
      if (r?.message?.includes('sudah melakukan absensi')) { playAlreadyAbsenSound(); await showWarning('Sudah Absen', 'Anda sudah absen hari ini'); return }
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
      if (r?.message?.includes('sudah melakukan absensi')) { playAlreadyAbsenSound(); await showWarning('Sudah Absen', 'Anda sudah absen hari ini'); return }
      playErrorSound()
      if (r?.message?.includes('belum terdaftar')) showError('Belum Registrasi', 'QR valid tapi belum punya akun.')
      else if (r?.message?.includes('tidak valid')) showError('QR Tidak Valid', 'QR Code tidak dikenali.')
      else showError('Gagal', r?.message || 'Terjadi kesalahan')
    } finally { setLoading(false) }
  }

  const tabs = [
    { key: 'manual', label: 'Manual', icon: Fingerprint },
    { key: 'qr', label: 'QR Code', icon: ScanLine },
    ...(userRole === 'siswa' ? [{ key: 'izin', label: 'Izin/Sakit', icon: FileText }] : []),
  ]

  return (
    <div className={`flex flex-col md:flex-row md:h-screen md:overflow-hidden font-sans antialiased ${isDark ? 'bg-[#080e1a]' : 'bg-slate-50'}`}>

      {/* ══════════════════════════════════════════════════════════════════
          LEFT SIDEBAR — Premium dark panel, full height
      ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex w-[280px] lg:w-[320px] xl:w-[360px] flex-shrink-0 flex-col h-screen relative overflow-hidden">
        {/* Deep emerald gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#0f172a]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent" />
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 z-20" />
        {/* Glow orbs */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-teal-400/15 blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
        {/* Animated dot grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]">
          <defs>
            <pattern id="sidebar-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sidebar-dots)" />
        </svg>

        <div className="relative z-10 flex flex-col h-full p-5 lg:p-6 overflow-y-auto">

          {/* ── Header: logo + school name + login ── */}
          <div className="flex items-center justify-between mb-7 pt-2">
            <div className="flex items-center gap-3 min-w-0">
              {loadingPengaturan
                ? <div className="w-10 h-10 rounded-2xl bg-white/10 animate-pulse flex-shrink-0" />
                : pengaturan.logo_sekolah
                  ? <img src={pengaturan.logo_sekolah} alt="" className="w-10 h-10 rounded-2xl object-contain bg-white/10 p-1 ring-1 ring-white/20 flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                  : <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 flex items-center justify-center ring-1 ring-white/20 flex-shrink-0">
                      <School size={18} className="text-emerald-300" />
                    </div>
              }
              <div className="min-w-0">
                <p className="text-white font-black text-sm leading-tight truncate">{pengaturan.nama_sekolah || 'Sistem Absensi'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${boleh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <p className={`text-[10px] font-semibold ${boleh ? 'text-emerald-400' : 'text-slate-500'}`}>{boleh ? 'Sistem Aktif' : 'Tidak Aktif'}</p>
                </div>
              </div>
            </div>
            <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 text-[11px] font-bold transition-all flex-shrink-0 ml-2">
              Login <ArrowRight size={10} />
            </Link>
          </div>

          {/* ── Giant live clock ── */}
          <div className="mb-1">
            <p
              className="text-5xl lg:text-6xl font-black text-white tabular-nums tracking-tight leading-none"
              style={{ textShadow: '0 0 48px rgba(52,211,153,0.35), 0 0 80px rgba(52,211,153,0.15)' }}>
              {fmtJam(waktu)}
            </p>
          </div>
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={11} className="text-white/30 flex-shrink-0" />
            <p className="text-white/40 text-xs font-medium">{fmtTgl(waktu)}</p>
          </div>

          {/* ── Status pill ── */}
          <div className={`self-start flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 border backdrop-blur-sm ${
            boleh
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${boleh ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {boleh ? `Absensi Dibuka · Masuk ${jamMasuk}` : pesan?.title || 'Tidak Aktif'}
          </div>

          {/* ── 4 stat mini-cards in 2×2 grid ── */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { label: 'Jam Masuk',  value: jamMasuk || '-',                                  icon: '🕐', accent: 'from-emerald-500/25 to-teal-500/10'   },
              { label: 'Jam Pulang', value: pengaturan.jam_pulang?.substring(0,5) || '-',     icon: '🏠', accent: 'from-blue-500/25 to-cyan-500/10'      },
              { label: 'Hari Aktif', value: `${(pengaturan.hari_aktif||[]).length} hari`,     icon: '📅', accent: 'from-purple-500/25 to-pink-500/10'    },
              { label: 'Status',     value: boleh ? 'Buka' : 'Tutup',                         icon: boleh ? '✅' : '🔒', accent: boleh ? 'from-emerald-500/25 to-green-500/10' : 'from-red-500/25 to-rose-500/10' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.accent} rounded-2xl p-3 border border-white/[0.08] backdrop-blur-sm`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider leading-none">{s.label}</span>
                  <span className="text-xs leading-none">{s.icon}</span>
                </div>
                <p className="text-white font-black text-sm leading-none">{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Hari aktif pills ── */}
          {(pengaturan.hari_aktif || []).length > 0 && (
            <div className="mb-5">
              <p className="text-white/25 text-[9px] font-black uppercase tracking-widest mb-2">Hari Sekolah</p>
              <div className="flex flex-wrap gap-1.5">
                {(pengaturan.hari_aktif || []).map((h, i) => {
                  const isToday = fmtHari(new Date()) === h
                  return (
                    <span key={i} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      isToday
                        ? 'bg-emerald-400 border-emerald-400 text-emerald-900 shadow-lg shadow-emerald-500/30'
                        : 'bg-white/[0.05] border-white/10 text-white/40 hover:bg-white/10'
                    }`}>{h.substring(0, 3)}</span>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Role switcher ── */}
          <div className="mb-auto">
            <p className="text-white/25 text-[9px] font-black uppercase tracking-widest mb-2.5">Saya adalah</p>
            <div className="flex gap-2">
              {[
                { key: 'siswa', label: 'Siswa', icon: GraduationCap, sub: 'NIS / NISN' },
                { key: 'guru',  label: 'Guru',  icon: User,           sub: 'NIP'        },
              ].map(r => (
                <motion.button key={r.key} whileTap={{ scale: 0.97 }}
                  onClick={() => { setUserRole(r.key); setAbsenResult(null); setErrors({}); setFormData({ nisn: '', nip: '' }); if (r.key === 'guru' && activeTab === 'izin') setActiveTab('manual') }}
                  className={`flex-1 flex items-center gap-2.5 px-3 py-3 rounded-2xl border-2 transition-all duration-200 ${
                    userRole === r.key
                      ? 'bg-white border-white text-emerald-800 shadow-xl shadow-black/30'
                      : 'bg-white/[0.05] border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white/70'
                  }`}>
                  <r.icon size={15} />
                  <div className="text-left">
                    <p className="text-xs font-black leading-tight">{r.label}</p>
                    <p className={`text-[10px] font-medium leading-tight ${userRole === r.key ? 'text-emerald-600' : 'text-white/25'}`}>{r.sub}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── Bottom: real-time + LIVE badge ── */}
          <div className="pt-4 mt-4 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={11} className="text-emerald-500" />
                <span className="text-white/25 text-[10px] font-medium">Real-time · Auto sync 30s</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[9px] font-black tracking-wider">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT PANEL — Main content area
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen md:h-screen overflow-y-auto relative">
        {/* Background */}
        {!isDark && <div className="absolute inset-0 z-0 bg-white" />}
        {isDark  && <div className="absolute inset-0 z-0 bg-[#080e1a]" />}
        <div className="relative z-10 flex flex-col flex-1">

        {/* ── MOBILE TOP BAR ── */}
        <div className={`md:hidden sticky top-0 z-30 border-b backdrop-blur-xl ${isDark ? 'bg-[#080e1a]/90 border-white/[0.06]' : 'bg-white/90 border-slate-100'}`}>
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {pengaturan.logo_sekolah
                ? <img src={pengaturan.logo_sekolah} alt="" className="w-8 h-8 rounded-xl object-contain flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                : <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                    <School size={14} className="text-white" />
                  </div>
              }
              <div className="min-w-0">
                <p className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{pengaturan.nama_sekolah || 'Absensi'}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-[10px] font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{fmtJam(waktu)}</p>
                  <span className={`flex items-center gap-1 text-[9px] font-bold ${boleh ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-red-400' : 'text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${boleh ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    {boleh ? 'Buka' : 'Tutup'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={toggleTheme} className={`p-2 rounded-xl border transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-500" />}
              </button>
              <Link to="/login" className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-[11px] font-black shadow-lg shadow-emerald-500/25">
                Login <ArrowRight size={10} />
              </Link>
            </div>
          </div>
          {/* Mobile warning banner */}
          {!boleh && pesan && (
            <div className={`flex items-center gap-2 px-4 py-2 border-t text-[11px] font-semibold ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
              <span className="flex-shrink-0">{pesan.icon}</span>
              <span>{pesan.title} · {pesan.msg}</span>
            </div>
          )}
        </div>

        {/* ── RIGHT CONTENT ── */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 pb-24 md:pb-6 flex flex-col gap-4 sm:gap-5">

          {/* ── PAGE HEADER ── */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black mb-2.5 border ${isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                <Sparkles size={9} /> ✦ Absensi Digital
              </div>
              <h1 className={`text-2xl sm:text-3xl font-black leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Absen{' '}
                <span className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Sekarang
                </span>
              </h1>
              <p className={`text-xs sm:text-sm mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {userRole === 'siswa' ? 'Masukkan NIS/NISN atau scan QR Code kamu' : 'Masukkan NIP atau scan QR Code untuk absen'}
              </p>
            </div>
            <button onClick={toggleTheme} className={`hidden md:flex p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5 hover:border-white/20' : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300'}`}>
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>
          </div>

          {/* ── WARNING BANNER (desktop, hidden on mobile) ── */}
          <AnimatePresence>
            {!boleh && pesan && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`hidden md:flex items-center gap-3 p-4 rounded-2xl border ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                  {pesan.icon}
                </div>
                <div>
                  <p className={`text-sm font-black ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>{pesan.title}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-amber-400/70' : 'text-amber-700'}`}>{pesan.msg}</p>
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
                {/* Background: foto_libur_bg dari admin, fallback gradient */}
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
                  {/* Foto bulat */}
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

          {/* ── MAIN ABSEN CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`rounded-3xl border overflow-hidden shadow-2xl ${isDark ? 'bg-white/[0.03] border-white/[0.08] shadow-black/40' : 'bg-white border-slate-100 shadow-slate-200/80'}`}>
            {/* Top accent gradient line */}
            <div className="h-[3px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

            <div className="p-5 sm:p-7">
              {/* ── TABS ── */}
              <div className={`flex gap-1 p-1 rounded-2xl mb-5 sm:mb-6 ${isDark ? 'bg-white/[0.05]' : 'bg-slate-100'}`}>
                {tabs.map(t => (
                  <button key={t.key}
                    onClick={() => { setActiveTab(t.key); setAbsenResult(null); setErrors({}) }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                      activeTab === t.key
                        ? 'bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                        : isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                    }`}>
                    <t.icon size={12} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* ── TAB CONTENT ── */}
              <AnimatePresence mode="wait">

                {/* MANUAL TAB */}
                {activeTab === 'manual' && (
                  <motion.form key="manual" onSubmit={handleAbsen}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4">

                    <div>
                      <label className={`block text-xs font-black mb-2 tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {userRole === 'siswa' ? 'NIS / NISN' : 'NIP'}
                      </label>
                      <div className="relative">
                        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
                          <Hash size={14} className="text-emerald-500" />
                        </div>
                        <input
                          type="text"
                          name={userRole === 'siswa' ? 'nisn' : 'nip'}
                          value={userRole === 'siswa' ? formData.nisn : formData.nip}
                          onChange={handleInput}
                          disabled={loading || !boleh}
                          autoComplete="off"
                          placeholder={userRole === 'siswa' ? 'Masukkan NIS atau NISN kamu' : 'Masukkan NIP yang terdaftar'}
                          className={`w-full pl-14 pr-4 py-4 rounded-2xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 ${
                            (userRole === 'siswa' ? errors.nisn : errors.nip)
                              ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400'
                              : isDark
                                ? 'bg-white/[0.05] border-white/10 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-emerald-400/20 focus:bg-white/[0.08]'
                                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white'
                          } ${!boleh ? 'opacity-40 cursor-not-allowed' : ''}`}
                        />
                      </div>
                      {(userRole === 'siswa' ? errors.nisn : errors.nip) && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-xs text-red-500 flex items-center gap-1.5 font-semibold">
                          <AlertCircle size={11} />
                          {userRole === 'siswa' ? errors.nisn : errors.nip}
                        </motion.p>
                      )}
                    </div>

                    {/* Info hint */}
                    <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs ${isDark ? 'bg-white/[0.03] border-white/[0.08] text-slate-500' : 'bg-emerald-50/80 border-emerald-100 text-slate-500'}`}>
                      <Info size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>
                        {userRole === 'siswa'
                          ? <> Masukkan NIS atau NISN kamu. Belum punya akun? <Link to="/register" className="text-emerald-500 font-bold underline underline-offset-2">Registrasi di sini</Link></>
                          : 'Masukkan NIP yang terdaftar di sistem sekolah.'
                        }
                      </span>
                    </div>

                    {/* PRIMARY BUTTON */}
                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      whileHover={!loading && boleh ? { y: -2 } : {}}
                      type="submit"
                      disabled={loading || !boleh}
                      className={`relative w-full py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg tracking-wide transition-all duration-200 overflow-hidden flex items-center justify-center gap-2.5 ${
                        loading || !boleh
                          ? isDark ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/50'
                      }`}>
                      {!loading && boleh && (
                        <span className="absolute inset-0 rounded-2xl ring-4 ring-emerald-400/20 animate-pulse pointer-events-none" />
                      )}
                      {loading
                        ? <><Loader size={18} className="animate-spin" /> Memproses...</>
                        : !boleh
                          ? <><AlertCircle size={18} />{pesan?.title || 'Tidak Aktif'}</>
                          : <><CheckCircle size={18} /> Absen Sekarang</>
                      }
                    </motion.button>

                    <p className={`text-center text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      Belum punya akun?{' '}
                      <Link to="/register" className="text-emerald-500 font-black hover:text-emerald-400 transition-colors">
                        Registrasi sekarang
                      </Link>
                    </p>
                  </motion.form>
                )}

                {/* QR TAB */}
                {activeTab === 'qr' && (
                  <motion.div key="qr"
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4">
                    <div className={`rounded-2xl border-2 border-dashed p-8 text-center ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-emerald-200 bg-emerald-50/50'}`}>
                      <motion.div
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 ${isDark ? 'bg-emerald-500/15 ring-1 ring-emerald-500/20' : 'bg-white shadow-xl shadow-emerald-100 ring-1 ring-emerald-100'}`}>
                        <QrCode size={32} className="text-emerald-500" />
                      </motion.div>
                      <p className={`text-base font-black mb-1.5 ${isDark ? 'text-white' : 'text-slate-700'}`}>Scan QR Code</p>
                      <p className={`text-xs mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Aktifkan kamera untuk scan QR Code absensi kamu</p>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        whileHover={boleh ? { y: -2 } : {}}
                        onClick={() => setShowScanner(true)}
                        disabled={!boleh}
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-2xl hover:shadow-emerald-500/40">
                        <Camera size={16} />
                        {boleh ? 'Buka Kamera' : pesan?.title || 'Tidak Aktif'}
                      </motion.button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { tip: 'Pencahayaan cukup',   icon: '💡' },
                        { tip: 'QR di tengah kamera', icon: '🎯' },
                        { tip: 'Jarak yang tepat',    icon: '📏' },
                        { tip: 'Hindari gerakan',     icon: '🤚' },
                      ].map((t, i) => (
                        <div key={i} className={`flex items-center gap-2.5 p-3 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-slate-50 border-slate-100'}`}>
                          <span className="text-base flex-shrink-0">{t.icon}</span>
                          <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.tip}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* IZIN TAB */}
                {activeTab === 'izin' && userRole === 'siswa' && (
                  <motion.div key="izin"
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}>
                    <FormIzin />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── RESULT STATE ── */}
              <AnimatePresence>
                {absenResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`mt-5 rounded-2xl border-2 overflow-hidden ${
                      absenResult.success
                        ? isDark ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-emerald-50 border-emerald-200'
                        : isDark ? 'bg-red-500/10 border-red-500/25' : 'bg-red-50 border-red-200'
                    }`}>
                    <div className={`px-5 py-3 flex items-center justify-between ${absenResult.success ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                      <div className="flex items-center gap-2.5">
                        {absenResult.success
                          ? <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                              <CheckCircle size={16} className="text-white" />
                            </motion.div>
                          : <X size={16} className="text-white" />
                        }
                        <span className="text-white text-sm font-black">
                          {absenResult.success ? 'Absensi Berhasil! 🎉' : 'Absensi Gagal'}
                        </span>
                      </div>
                      <button onClick={() => { setAbsenResult(null); setErrors({}) }} className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="p-5">
                      <p className={`text-sm mb-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{absenResult.message}</p>
                      {absenResult.success && absenResult.data && (
                        <div className={`rounded-xl p-4 grid grid-cols-2 gap-3 ${isDark ? 'bg-white/[0.05]' : 'bg-white border border-slate-100 shadow-sm'}`}>
                          {[
                            { label: 'Nama',  value: absenResult.role === 'siswa' ? absenResult.data.siswa?.nama : absenResult.data.guru?.nama },
                            ...(absenResult.role === 'siswa' ? [{ label: 'Kelas', value: absenResult.data.siswa?.kelas }] : []),
                            { label: 'Status', value: absenResult.data.is_terlambat ? 'Terlambat' : 'Tepat Waktu', badge: true, late: absenResult.data.is_terlambat },
                            ...(absenResult.data.absensi ? [{ label: 'Jam Masuk', value: absenResult.data.absensi.jam_masuk, mono: true }] : []),
                          ].map((item, i) => (
                            <div key={i}>
                              <p className={`text-[9px] uppercase font-black mb-1 tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{item.label}</p>
                              {item.badge
                                ? <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black ${
                                    item.late
                                      ? isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                                      : isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.late ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                    {item.value}
                                  </span>
                                : <p className={`text-sm font-bold truncate ${item.mono ? 'font-mono' : ''} ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.value}</p>
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
          </motion.div>

          {/* ── GAMIFICATION CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`rounded-2xl border p-4 sm:p-5 ${isDark ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/20' : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <Flame size={22} className="text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Streak Hadir</p>
                    <p className={`text-[11px] ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>5 hari berturut-turut 🔥</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy size={14} className="text-amber-500" />
                    <span className={`text-xs font-black ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Rajin!</span>
                  </div>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-orange-100'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400" />
                </div>
                <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>7 hari target · 5 hari tercapai</p>
              </div>
            </div>
          </motion.div>

          {/* ── STEP GUIDE ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className={`rounded-2xl border p-4 sm:p-5 ${isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-100'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Cara Absen</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
              {[
                { n: '1', icon: '👤', title: 'Pilih Role',   desc: 'Siswa atau Guru' },
                { n: '2', icon: '📱', title: 'Pilih Metode', desc: 'Manual atau QR'  },
                { n: '3', icon: '✅', title: 'Isi & Submit', desc: 'Masukkan data kamu' },
              ].map((s, i) => (
                <div key={i} className="flex sm:flex-col sm:flex-1 items-center sm:items-center gap-3 sm:gap-2 sm:text-center relative">
                  {i < 2 && (
                    <div className={`hidden sm:block absolute left-[calc(50%+24px)] top-5 w-[calc(100%-48px)] border-t-2 border-dashed ${isDark ? 'border-emerald-900' : 'border-emerald-200'}`} />
                  )}
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25 relative z-10">
                    <span className="text-white font-black text-sm">{s.n}</span>
                  </div>
                  <div>
                    <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-700'}`}>{s.icon} {s.title}</p>
                    <p className={`text-[11px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── BOTTOM INFO CARDS ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Jadwal */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <img src="/image/bg5.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-10 p-4">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Clock size={10} className="text-emerald-500" /> Jadwal
                </p>
                <div className="space-y-2">
                  {[
                    { l: 'Masuk',  v: jamMasuk || '-',                                  c: 'text-emerald-500' },
                    { l: 'Pulang', v: pengaturan.jam_pulang?.substring(0,5) || '-',     c: 'text-blue-500'    },
                    { l: 'Buka',   v: pengaturan.jam_buka_absen?.substring(0,5) || '-', c: 'text-purple-500'  },
                  ].map((x, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{x.l}</span>
                      <span className={`text-[11px] font-black font-mono ${x.c}`}>{x.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cara absen */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <img src="/image/bg4.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-10 p-4">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Sparkles size={10} className="text-emerald-500" /> Cara Absen
                </p>
                <div className="space-y-2">
                  {[
                    { n: '1', t: 'Pilih role (Siswa/Guru)', c: 'bg-emerald-500' },
                    { n: '2', t: 'Pilih metode absen',      c: 'bg-teal-500'    },
                    { n: '3', t: 'Isi data & submit',       c: 'bg-cyan-500'    },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-md ${s.c} flex items-center justify-center text-[9px] font-black text-white flex-shrink-0`}>{s.n}</span>
                      <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── LOGIN CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}>
            <Link to="/login"
              className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white transition-all duration-200 shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/35 group hover:-translate-y-0.5">
              <div>
                <p className="text-sm font-black">Login ke Dashboard</p>
                <p className="text-xs text-white/60 mt-0.5">Laporan, data siswa, pengaturan & lainnya</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-all flex-shrink-0">
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </motion.div>

          <p className={`text-center text-[10px] pb-2 ${isDark ? 'text-white/10' : 'text-slate-300'}`}>
            © {new Date().getFullYear()} {pengaturan.nama_sekolah || 'Sistem Absensi Digital'}
          </p>
        </div>
        </div>{/* end relative z-10 */}
      </div>

      {/* ── MOBILE BOTTOM ROLE SWITCHER ── */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-3 py-2.5 backdrop-blur-xl ${isDark ? 'bg-[#080e1a]/95 border-white/[0.06]' : 'bg-white/95 border-slate-100'}`}>
        <div className="flex gap-2 max-w-sm mx-auto">
          {[
            { key: 'siswa', label: 'Siswa', icon: GraduationCap },
            { key: 'guru',  label: 'Guru',  icon: User           },
          ].map(r => (
            <button key={r.key}
              onClick={() => { setUserRole(r.key); setAbsenResult(null); setErrors({}); setFormData({ nisn: '', nip: '' }); if (r.key === 'guru' && activeTab === 'izin') setActiveTab('manual') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                userRole === r.key
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : isDark ? 'bg-white/[0.05] text-slate-500 hover:bg-white/10' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}>
              <r.icon size={13} /> {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── QR SCANNER MODAL ── */}
      <AnimatePresence>
        {showScanner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QrScanner onScan={handleQr} onError={(e) => showError('Kamera Error', e)} onClose={() => setShowScanner(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
