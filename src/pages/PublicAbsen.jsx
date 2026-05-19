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

  // ── Handler absen PULANG guru ──────────────────────────────────────
  const handlePulangManual = async (e) => {
    e.preventDefault()
    const nip = formData.nipPulang?.trim()
    if (!nip || nip.length < 4) {
      setErrors(p => ({ ...p, nipPulang: 'NIP wajib diisi (min 4 karakter)' }))
      return
    }
    setLoading(true); setPulangResult(null)
    try {
      const res = await publicApi.absenGuruPulangManual({ nip, keterangan: getKet() })
      const d   = res.data.data
      setPulangResult({ success: true, data: d, message: res.data.message })
      setFormData(p => ({ ...p, nipPulang: '' }))
      playSuccessSound()
      const selisih = d.menit_pulang_cepat
      if (selisih > 0) {
        await showWarning('Pulang Lebih Awal', `Anda pulang ${selisih} menit lebih awal dari jam pulang sekolah (${d.jam_pulang_sekolah}).`)
      } else if (selisih < 0) {
        showSuccess('Terima Kasih!', `Anda lembur ${Math.abs(selisih)} menit. Terima kasih atas dedikasinya!`)
      } else {
        showSuccess('Absen Pulang Berhasil', 'Anda pulang tepat waktu.')
      }
    } catch (err) {
      const r = err.response?.data
      const msg = r?.message || 'Terjadi kesalahan'
      setPulangResult({ success: false, message: msg })
      playErrorSound()
      if (msg.includes('belum melakukan absen masuk') || msg.includes('belum absen masuk')) {
        await showWarning('Belum Absen Masuk', 'Anda belum tercatat absen masuk hari ini. Tidak bisa absen pulang.')
      } else if (msg.includes('sudah melakukan absen pulang') || msg.includes('sudah absen pulang')) {
        playAlreadyAbsenSound()
        await showWarning('Sudah Absen Pulang', 'Anda sudah tercatat absen pulang hari ini.')
      } else if (msg.includes('tidak ditemukan') || msg.includes('tidak terdaftar')) {
        showError('NIP Tidak Ditemukan', 'NIP tidak terdaftar di sistem. Hubungi admin.')
      } else {
        showError('Gagal', msg)
      }
    } finally { setLoading(false) }
  }

  const handleQrPulang = async (qrCode) => {
    setLoading(true); setShowScannerPulang(false); playScanSound()
    try {
      const res = await publicApi.absenGuruPulangQr({ qr_code: qrCode, keterangan: getKet() })
      const d   = res.data.data
      setPulangResult({ success: true, data: d, message: res.data.message })
      playSuccessSound()
      const selisih = d.menit_pulang_cepat
      if (selisih > 0) {
        await showWarning('Pulang Lebih Awal', `Anda pulang ${selisih} menit lebih awal dari jam pulang sekolah (${d.jam_pulang_sekolah}).`)
      } else if (selisih < 0) {
        showSuccess('Terima Kasih!', `Lembur ${Math.abs(selisih)} menit. Terima kasih!`)
      } else {
        showSuccess('Absen Pulang Berhasil', 'Pulang tepat waktu.')
      }
    } catch (err) {
      const r = err.response?.data
      const msg = r?.message || 'Terjadi kesalahan'
      setPulangResult({ success: false, message: msg })
      playErrorSound()
      if (msg.includes('belum melakukan absen masuk') || msg.includes('belum absen masuk')) {
        await showWarning('Belum Absen Masuk', 'Anda belum tercatat absen masuk hari ini. Tidak bisa absen pulang.')
      } else if (msg.includes('sudah melakukan absen pulang') || msg.includes('sudah absen pulang')) {
        playAlreadyAbsenSound()
        await showWarning('Sudah Absen Pulang', 'Anda sudah tercatat absen pulang hari ini.')
      } else if (msg.includes('tidak valid') || msg.includes('tidak terdaftar')) {
        showError('QR Tidak Valid', 'QR Code tidak dikenali atau tidak terdaftar.')
      } else {
        showError('Gagal', msg)
      }
    } finally { setLoading(false) }
  }

  const tabs = [
    { key: 'manual', label: 'Manual', icon: Fingerprint },
    { key: 'qr', label: 'QR Code', icon: ScanLine },
    ...(userRole === 'siswa' ? [{ key: 'izin', label: 'Izin/Sakit', icon: FileText }] : []),
    ...(userRole === 'guru'  ? [{ key: 'pulang', label: 'Pulang', icon: LogOut }] : []),
  ]

  return (
    <div className={`flex flex-col md:flex-row md:h-screen md:overflow-hidden font-sans ${isDark ? 'bg-[#080e1a]' : 'bg-[#f0fdf4]'}`}>

      {/* ══════════════════════════════════════════════════════════════════
          LEFT — Dark premium panel, full height
      ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex w-[300px] lg:w-[360px] xl:w-[420px] flex-shrink-0 flex-col h-screen relative overflow-hidden">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#0f172a]"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"/>
        {/* Glow orbs */}
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"/>
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-teal-400/15 blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"/>
        <div className="absolute top-1/2 right-0 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none"/>
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]">
          <defs><pattern id="dp" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="white"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dp)"/>
        </svg>

        <div className="relative z-10 flex flex-col h-full p-5 lg:p-7 xl:p-8 overflow-y-auto">

          {/* ── Header row ── */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {loadingPengaturan ? <div className="w-10 h-10 rounded-2xl bg-white/10 animate-pulse"/> :
                pengaturan.logo_sekolah
                  ? <img src={pengaturan.logo_sekolah} alt="" className="w-10 h-10 rounded-2xl object-contain bg-white/10 p-1 ring-1 ring-white/20" onError={e=>e.target.style.display='none'}/>
                  : <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center ring-1 ring-white/20"><School size={18} className="text-white"/></div>
              }
              <div>
                <p className="text-white font-bold text-sm leading-tight">{pengaturan.nama_sekolah || 'Sistem Absensi'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${boleh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}/>
                  <p className={`text-[10px] font-medium ${boleh ? 'text-emerald-400' : 'text-slate-500'}`}>{boleh ? 'Sistem Aktif' : 'Tidak Aktif'}</p>
                </div>
              </div>
            </div>
            <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 text-[11px] font-semibold transition-all">
              Login <ArrowRight size={10}/>
            </Link>
          </div>

          {/* ── Giant clock ── */}
          <div className="mb-1">
            <motion.p
              key={fmtJam(waktu)}
              className="text-[44px] lg:text-[58px] xl:text-[66px] font-black text-white tabular-nums tracking-tight leading-none"
              style={{ textShadow: '0 0 40px rgba(52,211,153,0.3)' }}>
              {fmtJam(waktu)}
            </motion.p>
          </div>
          <p className="text-white/40 text-xs mb-5 font-medium">{fmtTgl(waktu)}</p>

          {/* ── Status pill ── */}
          <div className={`self-start flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold mb-6 border ${
            boleh
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${boleh ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}/>
            {boleh ? `Absensi Dibuka · Masuk ${jamMasuk}` : pesan?.title || 'Tidak Aktif'}
          </div>

          {/* ── 4 stat cards ── */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { label: 'Jam Masuk', value: jamMasuk || '-', icon: '🕐', accent: 'from-emerald-500/20 to-teal-500/10' },
              { label: 'Jam Pulang', value: pengaturan.jam_pulang?.substring(0,5) || '-', icon: '🕐', accent: 'from-blue-500/20 to-cyan-500/10' },
              { label: 'Hari Aktif', value: `${(pengaturan.hari_aktif||[]).length} hari`, icon: '📅', accent: 'from-purple-500/20 to-pink-500/10' },
              { label: 'Status', value: boleh ? 'Buka' : 'Tutup', icon: boleh ? '✅' : '🔒', accent: boleh ? 'from-emerald-500/20 to-green-500/10' : 'from-red-500/20 to-rose-500/10' },
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
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-2.5">Saya adalah</p>
            <div className="flex gap-2">
              {[
                { key: 'siswa', label: 'Siswa', icon: GraduationCap, sub: 'NIS / NISN' },
                { key: 'guru', label: 'Guru', icon: User, sub: 'NIP' },
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
        {/* Background — putih */}
        {!isDark && <div className="absolute inset-0 z-0 bg-white"/>}
        {isDark && <div className="absolute inset-0 z-0 bg-[#080e1a]"/>}
        <div className="relative z-10 flex flex-col flex-1">

        {/* Mobile top bar */}
        <div className={`md:hidden sticky top-0 z-30 border-b backdrop-blur-xl ${isDark ? 'bg-[#080e1a]/90 border-white/5' : 'bg-white/90 border-slate-100'}`}>
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              {pengaturan.logo_sekolah
                ? <img src={pengaturan.logo_sekolah} alt="" className="w-8 h-8 rounded-xl object-contain" onError={e=>e.target.style.display='none'}/>
                : <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0"><School size={14} className="text-white"/></div>
              }
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${isDark?'text-white':'text-slate-800'}`}>{pengaturan.nama_sekolah||'Absensi'}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-[10px] font-mono ${isDark?'text-emerald-400':'text-emerald-600'}`}>{fmtJam(waktu)}</p>
                  <span className={`flex items-center gap-1 text-[9px] font-bold ${boleh ? isDark?'text-emerald-400':'text-emerald-600' : isDark?'text-red-400':'text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${boleh?'bg-emerald-400 animate-pulse':'bg-red-400'}`}/>
                    {boleh ? 'Buka' : 'Tutup'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={toggleTheme} className={`p-2 rounded-xl border ${isDark?'border-white/10':'border-slate-200'}`}>
                {isDark ? <Sun size={13} className="text-amber-400"/> : <Moon size={13} className="text-slate-500"/>}
              </button>
              <Link to="/login" className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-emerald-500/25">
                Login <ArrowRight size={10}/>
              </Link>
            </div>
          </div>
          {/* Mobile status bar */}
          {!boleh && pesan && (
            <div className={`flex items-center gap-2 px-4 py-2 border-t text-[11px] font-semibold ${isDark?'bg-amber-500/10 border-amber-500/20 text-amber-300':'bg-amber-50 border-amber-100 text-amber-700'}`}>
              <span>{pesan.icon}</span><span>{pesan.title} · {pesan.msg}</span>
            </div>
          )}
        </div>

        {/* ── Right content ── */}
        <div className="flex-1 p-4 sm:p-5 lg:p-8 xl:p-10 pb-24 md:pb-6 flex flex-col gap-3 sm:gap-4">

          {/* Title + theme */}
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

          {/* Warning — hidden on mobile (shown in top bar instead) */}
          <AnimatePresence>
            {!boleh && pesan && (
              <motion.div initial={{opacity:0,y:-6,height:0}} animate={{opacity:1,y:0,height:'auto'}} exit={{opacity:0,height:0}}
                className={`hidden md:flex items-center gap-3 p-3.5 rounded-2xl border ${isDark?'bg-amber-500/10 border-amber-500/20':'bg-amber-50 border-amber-200'}`}>
                <span className="text-lg">{pesan.icon}</span>
                <div>
                  <p className={`text-xs font-bold ${isDark?'text-amber-300':'text-amber-800'}`}>{pesan.title}</p>
                  <p className={`text-[11px] ${isDark?'text-amber-400/60':'text-amber-700'}`}>{pesan.msg}</p>
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

          {/* ── MAIN CARD ── */}
          <div className={`rounded-2xl sm:rounded-3xl border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/8' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/60'}`}>
            {/* Card top accent */}
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400"/>

            <div className="p-4 sm:p-6">
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

                {activeTab==='pulang' && userRole==='guru' && (
                  <motion.div key="pulang" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:0.15}}
                    className="space-y-4">

                    {/* Info banner */}
                    <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${isDark?'bg-violet-500/10 border-violet-500/20':'bg-violet-50 border-violet-200'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark?'bg-violet-500/20':'bg-violet-100'}`}>
                        <LogOut size={15} className={isDark?'text-violet-400':'text-violet-600'}/>
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isDark?'text-violet-300':'text-violet-800'}`}>Absen Pulang Guru</p>
                        <p className={`text-[11px] mt-0.5 ${isDark?'text-violet-400/70':'text-violet-600'}`}>
                          Jam pulang sekolah: <span className="font-black">{pengaturan.jam_pulang?.substring(0,5) || '-'}</span>
                          {' · '}Hanya guru yang sudah absen masuk yang bisa absen pulang.
                        </p>
                      </div>
                    </div>

                    {/* Sub-tabs: Manual / QR */}
                    <div className={`flex gap-1 p-1 rounded-xl ${isDark?'bg-white/5':'bg-slate-100'}`}>
                      {[
                        { key:'manual', label:'✍️ Manual NIP', icon: Hash },
                        { key:'qr',     label:'📷 QR Code',    icon: QrCode },
                      ].map(st => (
                        <button key={st.key}
                          onClick={() => { setPulangSubTab(st.key); setErrors({}); setPulangResult(null); setShowScannerPulang(false) }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all ${
                            pulangSubTab === st.key
                              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                              : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                          }`}>
                          <st.icon size={11}/>{st.label}
                        </button>
                      ))}
                    </div>

                    {/* Manual NIP form */}
                    {pulangSubTab === 'manual' && (
                      <form onSubmit={handlePulangManual} className="space-y-3">
                        <div>
                          <label className={`block text-xs font-bold mb-1.5 ${isDark?'text-slate-300':'text-slate-700'}`}>NIP</label>
                          <div className="relative">
                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center ${isDark?'bg-violet-500/20':'bg-violet-50'}`}>
                              <Hash size={13} className="text-violet-500"/>
                            </div>
                            <input
                              type="text"
                              name="nipPulang"
                              value={formData.nipPulang}
                              onChange={e => { setFormData(p=>({...p,nipPulang:e.target.value})); setErrors(p=>({...p,nipPulang:''})) }}
                              disabled={loading}
                              autoComplete="off"
                              placeholder="Masukkan NIP untuk absen pulang"
                              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                                errors.nipPulang
                                  ? 'border-red-400 focus:ring-red-400/20'
                                  : isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder-slate-600 focus:border-violet-500 focus:ring-violet-500/20'
                                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:ring-violet-400/20 focus:bg-white'
                              } ${loading?'opacity-40 cursor-not-allowed':''}`}
                            />
                          </div>
                          {errors.nipPulang && (
                            <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10}/>{errors.nipPulang}</p>
                          )}
                        </div>

                        <motion.button whileTap={{scale:0.99}} type="submit" disabled={loading}
                          className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-black rounded-2xl shadow-lg shadow-violet-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide">
                          {loading
                            ? <><Loader size={15} className="animate-spin"/>Memproses...</>
                            : <><LogOut size={15}/>Absen Pulang Sekarang</>}
                        </motion.button>
                      </form>
                    )}

                    {/* QR Scanner pulang */}
                    {pulangSubTab === 'qr' && (
                      <div className={`rounded-2xl border-2 border-dashed p-7 text-center ${isDark?'border-white/10 bg-white/3':'border-violet-200 bg-violet-50/50'}`}>
                        <motion.div animate={{scale:[1,1.04,1]}} transition={{duration:2.5,repeat:Infinity}}
                          className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center mb-3 ${isDark?'bg-violet-500/15':'bg-white shadow-lg shadow-violet-100'}`}>
                          <QrCode size={28} className="text-violet-500"/>
                        </motion.div>
                        <p className={`text-sm font-black mb-1 ${isDark?'text-white':'text-slate-700'}`}>Scan QR Code Pulang</p>
                        <p className={`text-xs mb-4 ${isDark?'text-slate-500':'text-slate-400'}`}>Aktifkan kamera untuk scan QR Code absen pulang</p>
                        <motion.button whileTap={{scale:0.97}}
                          onClick={() => { setPulangResult(null); setShowScannerPulang(true) }}
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-violet-500/30 disabled:opacity-40 transition-all">
                          <Camera size={14}/>Buka Kamera
                        </motion.button>
                      </div>
                    )}

                    {/* Result pulang */}
                    <AnimatePresence>
                      {pulangResult && (
                        <motion.div initial={{opacity:0,y:8,scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8}}
                          className={`rounded-2xl border-2 overflow-hidden ${pulangResult.success ? isDark?'bg-violet-500/10 border-violet-500/25':'bg-violet-50 border-violet-200' : isDark?'bg-red-500/10 border-red-500/25':'bg-red-50 border-red-200'}`}>
                          <div className={`px-4 py-2.5 flex items-center justify-between ${pulangResult.success?'bg-gradient-to-r from-violet-500 to-purple-600':'bg-gradient-to-r from-red-500 to-rose-600'}`}>
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
                                  const jam  = Math.floor(abs / 60)
                                  const sisa = abs % 60
                                  const durasi = jam > 0
                                    ? (sisa > 0 ? `${jam} jam ${sisa} menit` : `${jam} jam`)
                                    : `${abs} menit`
                                  const selisihLabel = selisih > 0
                                    ? `${durasi} lebih awal`
                                    : selisih < 0
                                      ? `Lembur ${durasi}`
                                      : 'Tepat waktu'
                                  const selisihColor = selisih > 0
                                    ? isDark?'text-amber-300':'text-amber-600'
                                    : selisih < 0
                                      ? isDark?'text-emerald-300':'text-emerald-600'
                                      : isDark?'text-blue-300':'text-blue-600'
                                  return [
                                    { label:'Nama',          value: d.guru?.nama },
                                    { label:'Jam Pulang',    value: d.absensi?.jam_pulang ? String(d.absensi.jam_pulang).substring(0,5) : '-', mono: true },
                                    { label:'Jam Sekolah',   value: d.jam_pulang_sekolah, mono: true },
                                    { label:'Selisih',       value: selisihLabel, color: selisihColor },
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

              {/* Result */}
              <AnimatePresence>
                {absenResult && (
                  <motion.div initial={{opacity:0,y:8,scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8}}
                    className={`mt-4 rounded-2xl border-2 overflow-hidden ${absenResult.success ? isDark?'bg-emerald-500/10 border-emerald-500/25':'bg-emerald-50 border-emerald-200' : isDark?'bg-red-500/10 border-red-500/25':'bg-red-50 border-red-200'}`}>
                    <div className={`px-4 py-2.5 flex items-center justify-between ${absenResult.success?'bg-gradient-to-r from-emerald-500 to-teal-600':'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                      <div className="flex items-center gap-2">
                        {absenResult.success?<CheckCircle size={13} className="text-white"/>:<X size={13} className="text-white"/>}
                        <span className="text-white text-xs font-black">{absenResult.success?'Absensi Berhasil!':'Absensi Gagal'}</span>
                      </div>
                      <button onClick={()=>{setAbsenResult(null);setErrors({})}} className="text-white/60 hover:text-white"><X size={12}/></button>
                    </div>
                    <div className="p-4">
                      <p className={`text-xs mb-3 ${isDark?'text-slate-300':'text-slate-600'}`}>{absenResult.message}</p>
                      {absenResult.success && absenResult.data && (
                        <div className={`rounded-xl p-3 grid grid-cols-2 gap-2.5 ${isDark?'bg-white/5':'bg-white border border-slate-100'}`}>
                          {(() => {
                            const metodeMap = {
                              fingerprint: '🖐 Sidik Jari',
                              qr_code:     '📷 QR Code',
                              manual:      '✏️ Manual',
                              sistem:      '⚙️ Sistem',
                            }
                            const metode = absenResult.data.absensi?.metode
                            const metodeLabel = metodeMap[metode] || metode || '-'
                            return [
                              { label:'Nama', value: absenResult.role==='siswa'?absenResult.data.siswa?.nama:absenResult.data.guru?.nama },
                              ...(absenResult.role==='siswa' ? [{ label:'Kelas', value: absenResult.data.siswa?.kelas }] : []),
                              { label:'Status', value: absenResult.data.is_terlambat?'Terlambat':'Tepat Waktu', badge: true, late: absenResult.data.is_terlambat },
                              ...(absenResult.data.absensi ? [{ label:'Jam Masuk', value: absenResult.data.absensi.jam_masuk?.substring(0,5), mono: true }] : []),
                              { label:'Metode', value: metodeLabel },
                            ]
                          })().map((item,i) => (
                            <div key={i}>
                              <p className={`text-[9px] uppercase font-black mb-0.5 tracking-widest ${isDark?'text-slate-600':'text-slate-400'}`}>{item.label}</p>
                              {item.badge
                                ? <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${item.late ? isDark?'bg-amber-500/20 text-amber-300':'bg-amber-100 text-amber-700' : isDark?'bg-emerald-500/20 text-emerald-300':'bg-emerald-100 text-emerald-700'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.late?'bg-amber-400':'bg-emerald-400'}`}/>{item.value}
                                  </span>
                                : <p className={`text-xs font-bold truncate ${item.mono?'font-mono':''} ${isDark?'text-white':'text-slate-800'}`}>{item.value}</p>
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

          {/* ── Bottom info cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Jadwal */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <img src="/image/bg5.png" alt="" className="absolute inset-0 w-full h-full object-cover"/>
              <div className="relative z-10 p-4">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${isDark?'text-slate-400':'text-slate-500'}`}>
                  <Clock size={10} className="text-emerald-500"/>Jadwal
                </p>
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
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <img src="/image/bg4.png" alt="" className="absolute inset-0 w-full h-full object-cover"/>
              <div className="relative z-10 p-4">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${isDark?'text-slate-400':'text-slate-500'}`}>
                  <Sparkles size={10} className="text-emerald-500"/>Cara Absen
                </p>
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
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white transition-all shadow-xl shadow-emerald-500/20 group">
            <div>
              <p className="text-sm font-black">Login ke Dashboard</p>
              <p className="text-[11px] text-white/60 mt-0.5">Laporan, data siswa, pengaturan & lainnya</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-all">
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform"/>
            </div>
          </Link>

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
    </div>
  )
}
