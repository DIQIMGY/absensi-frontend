import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Moon, Sun, GraduationCap, Key, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const { login, getDashboardRoute, isAuthenticated, isLoading } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(getDashboardRoute(), { replace: true })
  }, [isAuthenticated, isLoading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const r = await login(form)
    if (r.success) navigate(getDashboardRoute())
    setLoading(false)
  }

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>

      {/* ── MOBILE HEADER (tablet & below) ── */}
      <div className="lg:hidden w-full flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f766e 100%)' }}>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <GraduationCap size={16} className="text-white"/>
            </div>
            <span className="text-white font-black text-base">EduAbsen</span>
          </div>
          <span className="text-white/60 text-xs">Sistem Absensi Digital</span>
        </div>
      </div>

      {/* ── LEFT PANEL — branding ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 30%, #0f766e 65%, #134e4a 100%)' }}>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}/>

        {/* Glow orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.25) 0%, transparent 60%)', transform: 'translate(-30%, -30%)' }}/>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 60%)', transform: 'translate(30%, 30%)' }}/>

        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <GraduationCap size={20} className="text-white"/>
            </div>
            <span className="text-white font-black text-xl tracking-tight">EduAbsen</span>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.6 }}>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                <span className="text-white/80 text-xs font-medium">Sistem Absensi Digital</span>
              </div>
              <h2 className="text-white font-black text-4xl xl:text-5xl leading-tight mb-4">
                Kelola<br/>Kehadiran<br/>
                <span className="text-emerald-300">dengan Mudah</span>
              </h2>
              <p className="text-white/55 text-base leading-relaxed max-w-sm">
                Platform absensi modern dengan QR Code, laporan real-time, dan manajemen siswa terintegrasi.
              </p>
            </motion.div>

            {/* Feature pills */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4, duration:0.6 }}
              className="flex flex-wrap gap-2 mt-8">
              {['QR Code Absensi', 'Laporan Real-time', 'Multi Role', 'Dark Mode'].map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-white/75 text-xs font-medium">
                  <span className="w-1 h-1 rounded-full bg-emerald-400"/>
                  {f}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Bottom quote */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
            className="border-t border-white/10 pt-6">
            <p className="text-white/40 text-xs">"Disiplin adalah jembatan antara tujuan dan pencapaian."</p>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className={`w-full lg:w-[48%] flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-8 lg:py-12 overflow-y-auto relative ${isDark ? 'bg-slate-950' : 'bg-white'}`}>

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className={`absolute top-6 right-6 p-2.5 rounded-xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
          {isDark ? <Sun size={15}/> : <Moon size={15}/>}
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
            <GraduationCap size={16} className="text-white"/>
          </div>
          <span className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>EduAbsen</span>
        </div>

        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
          className="w-full max-w-sm mx-auto lg:mx-0">

          <h1 className={`text-2xl sm:text-3xl font-black mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Masuk</h1>
          <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Belum punya akun?{' '}
            <Link to="/register" className="text-emerald-500 hover:text-emerald-600 font-semibold">Daftar sekarang</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Alamat Email</label>
              <div className="relative">
                <Mail size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}/>
                <input type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all
                    ${isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white'}`}
                  placeholder="nama@sekolah.sch.id"/>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                <Link to="/forgot-password" className="text-xs text-emerald-500 hover:text-emerald-600 font-medium">Lupa password?</Link>
              </div>
              <div className="relative">
                <Lock size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}/>
                <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm({...form,password:e.target.value})}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border outline-none transition-all
                    ${isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white'}`}
                  placeholder="••••••••"/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={form.remember} onChange={e => setForm({...form,remember:e.target.checked})}
                className="w-4 h-4 rounded accent-emerald-500"/>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ingat saya selama 30 hari</span>
            </label>

            {/* Submit */}
            <motion.button whileTap={{scale:0.99}} type="submit" disabled={loading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Memuat...</span></>
                : <><span>Masuk ke Dashboard</span><ArrowRight size={14}/></>}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}/>
            <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>atau</span>
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}/>
          </div>

          {/* Back + Demo */}
          <div className="space-y-2.5">
            <Link to="/absen"
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors
                ${isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>
              <ArrowRight size={13} className="rotate-180"/>
              Kembali ke halaman absensi
            </Link>

            <div className="relative">
              <button type="button" onClick={() => setShowDemo(!showDemo)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors
                  ${isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                <Key size={13}/> Lihat akun demo
              </button>
              <AnimatePresence>
                {showDemo && (
                  <motion.div initial={{opacity:0,y:-8,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:0.97}}
                    transition={{duration:0.15}}
                    className={`absolute bottom-full left-0 right-0 mb-2 p-3.5 rounded-xl border shadow-xl z-20
                      ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
                      <div>
                        <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Akun Demo</p>
                        <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          admin@absensi.test<br/>password
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
