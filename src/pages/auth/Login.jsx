import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Moon, Sun, GraduationCap, Key, AlertCircle, Sparkles } from 'lucide-react'
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
    <div className={`min-h-screen flex items-center justify-center p-0 lg:p-6 transition-colors duration-300
      ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100'}`}>

      <button onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 p-2.5 rounded-xl border shadow-sm transition-all
          ${isDark ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-slate-200 text-slate-500'}`}>
        {isDark ? <Sun size={15}/> : <Moon size={15}/>}
      </button>

      {/* MOBILE */}
      <div className="lg:hidden w-full min-h-screen flex flex-col">
        <div className="relative flex flex-col items-center justify-end overflow-visible flex-shrink-0"
          style={{ background: 'linear-gradient(145deg,#064e3b,#065f46,#0f766e)', minHeight: 260 }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '18px 18px' }}/>
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(52,211,153,0.4) 0%,transparent 70%)' }}/>
          </div>
          {[
            { top:'10%', left:'8%', d:0 }, { top:'8%', right:'8%', d:0.7 },
          ].map((s,i) => (
            <motion.span key={i} className="absolute text-emerald-300/70 text-sm pointer-events-none z-10" style={s}
              animate={{ opacity:[0.3,1,0.3], scale:[0.8,1.3,0.8], y:[0,-7,0] }}
              transition={{ repeat:Infinity, duration:2.2+i*0.35, delay:s.d }}>*</motion.span>
          ))}
          <div className="relative z-10 text-center px-8 pt-8 pb-2">
            <h2 className="text-white font-black text-2xl leading-tight">
              Selamat Datang<br/><span className="text-emerald-300">Kembali!</span>
            </h2>
          </div>
          <div className="relative z-20 w-full flex justify-center" style={{ marginBottom: '-4.5rem' }}>
            <motion.img src="/image/bg2.png" alt="ilustrasi"
              initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }}
              transition={{ delay:0.2, duration:0.6 }}
              className="w-80 sm:w-96 object-contain select-none pointer-events-none"
              style={{ filter:'drop-shadow(0 16px 32px rgba(0,0,0,0.3))' }}/>
          </div>
        </div>
        <div className={`flex-1 rounded-t-[2.5rem] px-6 sm:px-10 pt-20 pb-10 -mt-2 relative z-10
          ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <FormContent form={form} setForm={setForm} showPw={showPw} setShowPw={setShowPw}
            loading={loading} showDemo={showDemo} setShowDemo={setShowDemo}
            handleSubmit={handleSubmit} isDark={isDark}/>
        </div>
      </div>

      {/* DESKTOP */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
        transition={{ duration:0.4 }}
        className="hidden lg:flex w-full h-screen">

        <div className={`w-[52%] flex flex-col justify-center px-16 xl:px-24 py-12 relative overflow-y-auto
          ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <FormContent form={form} setForm={setForm} showPw={showPw} setShowPw={setShowPw}
            loading={loading} showDemo={showDemo} setShowDemo={setShowDemo}
            handleSubmit={handleSubmit} isDark={isDark}/>
        </div>

        <div className="w-[48%] relative flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(145deg,#064e3b,#065f46,#0f766e)' }}>
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '20px 20px' }}/>
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(52,211,153,0.35) 0%,transparent 70%)' }}/>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(13,148,136,0.3) 0%,transparent 70%)' }}/>
          {[
            { top:'8%', left:'10%', d:0 }, { top:'10%', right:'8%', d:0.6 },
            { bottom:'30%', left:'6%', d:1.1 }, { bottom:'25%', right:'7%', d:0.4 },
          ].map((s,i) => (
            <motion.span key={i} className="absolute text-emerald-300/60 text-base pointer-events-none z-10" style={s}
              animate={{ opacity:[0.3,0.9,0.3], scale:[0.8,1.3,0.8], y:[0,-8,0] }}
              transition={{ repeat:Infinity, duration:2.3+i*0.3, delay:s.d }}>*</motion.span>
          ))}
          <div className="relative z-10 text-center px-12 mb-6">
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-5">
              <Sparkles size={10} className="text-emerald-300"/>
              <span className="text-white/75 text-xs font-semibold">Sistem Absensi Digital</span>
            </div>
            <h2 className="text-white font-black text-4xl xl:text-5xl leading-tight mb-4">
              Selamat<br/>Datang<br/>
              <span className="text-emerald-300">Kembali!</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Masuk untuk mengelola<br/>kehadiran siswa dengan mudah
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['QR Code','Real-time','Multi Role'].map((f,i) => (
                <span key={i} className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-white/60 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"/>{f}
                </span>
              ))}
            </div>
          </div>
          <motion.img src="/image/bg2.png" alt="ilustrasi"
            initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }}
            transition={{ delay:0.3, duration:0.7, ease:[0.22,1,0.36,1] }}
            className="relative z-20 w-80 xl:w-96 object-contain select-none pointer-events-none"
            style={{ filter:'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}/>
        </div>
      </motion.div>
    </div>
  )
}

function FormContent({ form, setForm, showPw, setShowPw, loading, showDemo, setShowDemo, handleSubmit, isDark }) {
  return (
    <>
      <div className="flex items-center gap-2.5 mb-7">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
          <GraduationCap size={18} className="text-white"/>
        </div>
        <span className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>EduAbsen</span>
      </div>

      <div className="mb-6">
        <p className={`text-sm font-medium mb-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`}>
          Halo, selamat datang
        </p>
        <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Masuk</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Belum punya akun?{' '}
          <Link to="/register" className="text-emerald-500 hover:text-emerald-600 font-semibold">Daftar sekarang</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Email</label>
          <div className="relative">
            <Mail size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}/>
            <input type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})}
              placeholder="nama@sekolah.sch.id"
              className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all
                ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white'}`}/>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Password</label>
            <Link to="/forgot-password" className="text-xs text-emerald-500 hover:text-emerald-600 font-medium">Lupa password?</Link>
          </div>
          <div className="relative">
            <Lock size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}/>
            <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm({...form,password:e.target.value})}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm border outline-none transition-all
                ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white'}`}/>
            <button type="button" onClick={() => setShowPw(!showPw)}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
              {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={form.remember} onChange={e => setForm({...form,remember:e.target.checked})}
            className="w-4 h-4 rounded accent-emerald-500"/>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ingat saya selama 30 hari</span>
        </label>

        <motion.button whileTap={{ scale:0.98 }} type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background:'linear-gradient(135deg,#059669,#0d9488)', boxShadow:'0 8px 24px rgba(5,150,105,0.3)' }}>
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Memuat...</span></>
            : <><span>Masuk ke Dashboard</span><ArrowRight size={14}/></>}
        </motion.button>
      </form>

      <div className="mt-3 relative">
        <button type="button" onClick={() => setShowDemo(!showDemo)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-colors
            ${isDark ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
          <Key size={12}/> Lihat akun demo
        </button>
        <AnimatePresence>
          {showDemo && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              transition={{ duration:0.15 }}
              className={`absolute bottom-full left-0 right-0 mb-2 p-3.5 rounded-xl border shadow-xl z-20
                ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start gap-2.5">
                <AlertCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
                <div>
                  <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Akun Demo</p>
                  <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>admin@absensi.test<br/>password</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Link to="/absen"
        className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-colors
          ${isDark ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
        <ArrowRight size={12} className="rotate-180"/> Kembali ke halaman absensi
      </Link>
    </>
  )
}
