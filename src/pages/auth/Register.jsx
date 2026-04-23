import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, EyeOff, Mail, Lock, User, Hash, Calendar, AlertCircle, 
  ChevronLeft, QrCode, Download, CheckCircle, Upload, Image as ImageIcon, 
  Users, GraduationCap, UserCheck, Key, Phone, MapPin, BookOpen,
  ArrowRight, Sparkles, Moon, Sun, Shield, Fingerprint, Award,
  Camera, X, Globe, Clock, Bell, Heart, Star, FileText, Info
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { publicApi } from '../../services/publicApi'
import Select from 'react-select'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal'

const ADMIN_SECRET_CODE = 'ADMIN2024SECRET'

// Role selector component dengan tema Emerald
const RoleSelector = ({ roleType, setRoleType, setErrors, isDark }) => (
  <div className={`grid grid-cols-3 gap-2 p-1.5 rounded-xl mb-6 ${
    isDark ? 'bg-slate-800' : 'bg-emerald-50'
  }`}>
    <motion.button
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      type="button"
      onClick={() => { setRoleType('siswa'); setErrors({}) }}
      className={`relative py-3 px-2 rounded-lg text-sm font-semibold transition-all flex flex-col items-center gap-1 overflow-hidden ${
        roleType === 'siswa'
          ? 'bg-emerald-600 text-white shadow-lg'
          : isDark
            ? 'text-slate-400 hover:text-white hover:bg-slate-700'
            : 'text-slate-600 hover:text-emerald-600 hover:bg-white/50'
      }`}
    >
      {roleType === 'siswa' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />
      )}
      <GraduationCap size={20} className="relative z-10" />
      <span className="relative z-10">Siswa</span>
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      type="button"
      onClick={() => { setRoleType('guru'); setErrors({}) }}
      className={`relative py-3 px-2 rounded-lg text-sm font-semibold transition-all flex flex-col items-center gap-1 overflow-hidden ${
        roleType === 'guru'
          ? 'bg-emerald-600 text-white shadow-lg'
          : isDark
            ? 'text-slate-400 hover:text-white hover:bg-slate-700'
            : 'text-slate-600 hover:text-emerald-600 hover:bg-white/50'
      }`}
    >
      {roleType === 'guru' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />
      )}
      <UserCheck size={20} className="relative z-10" />
      <span className="relative z-10">Guru</span>
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      type="button"
      onClick={() => { setRoleType('admin'); setErrors({}) }}
      className={`relative py-3 px-2 rounded-lg text-sm font-semibold transition-all flex flex-col items-center gap-1 overflow-hidden ${
        roleType === 'admin'
          ? 'bg-emerald-600 text-white shadow-lg'
          : isDark
            ? 'text-slate-400 hover:text-white hover:bg-slate-700'
            : 'text-slate-600 hover:text-emerald-600 hover:bg-white/50'
      }`}
    >
      {roleType === 'admin' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />
      )}
      <Users size={20} className="relative z-10" />
      <span className="relative z-10">Admin</span>
    </motion.button>
  </div>
)

// Input field component dengan tema Emerald
const InputField = ({ label, name, type = 'text', required = false, icon: Icon, placeholder, value, error, onChange, focusedField, setFocusedField, isDark }) => (
  <div className="space-y-1.5">
    <label className={`block text-sm font-semibold flex items-center gap-1 ${
      isDark ? 'text-slate-300' : 'text-slate-700'
    }`}>
      {Icon && <Icon size={14} className="text-emerald-500" />}
      {label} {required && <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>*</span>}
    </label>
    <motion.div 
      className="relative group"
      animate={focusedField === name ? { scale: 1.01 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {Icon && (
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 ${
          focusedField === name 
            ? 'text-emerald-500 scale-105'
            : (isDark ? 'text-slate-500 group-hover:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-500')
        }`} size={18} />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField(null)}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 border-2 rounded-xl transition-all duration-200 focus:outline-none input-glow ${
          error 
            ? 'border-orange-500' 
            : focusedField === name
              ? isDark
                ? 'border-emerald-500 bg-slate-900 text-white placeholder-slate-500 focus:ring-4 focus:ring-emerald-500/20'
                : 'border-emerald-500 bg-white text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/20'
              : isDark
                ? 'border-emerald-500/30 bg-slate-900 text-white placeholder-slate-500 hover:border-emerald-500/60'
                : 'border-emerald-300 bg-white text-slate-800 placeholder-slate-400 hover:border-emerald-500'
        }`}
        placeholder={placeholder}
      />
    </motion.div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xs text-orange-500 font-medium flex items-center gap-1"
        >
          <AlertCircle size={12} />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
)

export default function Register() {
  const [roleType, setRoleType] = useState('siswa')
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', password_confirmation: '',
    admin_code: '', nis: '', nisn: '', kelas_id: '', nama_lengkap: '',
    jenis_kelamin: 'L', tanggal_lahir: '', alamat: '', no_hp: '', nama_ortu: '',
    foto: null, nip: '', mata_pelajaran_ids: [],
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [kelasList, setKelasList] = useState([])
  const [mataPelajaranList, setMataPelajaranList] = useState([])
  const [errors, setErrors] = useState({})
  const [showQrModal, setShowQrModal] = useState(false)
  const [registeredUser, setRegisteredUser] = useState(null)
  const [previewFoto, setPreviewFoto] = useState(null)
  const [focusedField, setFocusedField] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const { register, isAuthenticated, isLoading, getDashboardRoute } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  }

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  }

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(getDashboardRoute(), { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, getDashboardRoute])

  useEffect(() => {
    if (roleType === 'siswa') fetchKelas()
    else if (roleType === 'guru') fetchMataPelajaran()
  }, [roleType])

  const fetchKelas = async () => {
    try {
      const response = await publicApi.getKelas()
      const kelasData = response.data?.data || []
      setKelasList(kelasData.map(k => ({ value: k.id, label: `${k.nama_kelas} - ${k.jurusan?.nama_jurusan || ''}` })))
    } catch (error) {
      console.error('Error fetching kelas:', error)
      toast.error('Gagal memuat data kelas')
    }
  }

  const fetchMataPelajaran = async () => {
    try {
      const response = await publicApi.getMataPelajaran()
      const mapelData = response.data?.data || []
      setMataPelajaranList(mapelData.map(m => ({ value: m.id, label: m.nama_mata_pelajaran })))
    } catch (error) {
      console.error('Error fetching mata pelajaran:', error)
      toast.error('Gagal memuat data mata pelajaran')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      e.target.value = ''
      return
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Format file harus JPG, JPEG, atau PNG')
      e.target.value = ''
      return
    }
    setFormData({ ...formData, foto: file })
    setPreviewFoto(URL.createObjectURL(file))
    toast.success(`Foto "${file.name}" berhasil dipilih`)
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name) newErrors.name = 'Nama pengguna wajib diisi'
    if (!formData.email) newErrors.email = 'Email wajib diisi'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email tidak valid'
    if (!formData.password) newErrors.password = 'Password wajib diisi'
    else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter'
    if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Konfirmasi password tidak cocok'
    
    if (roleType === 'admin') {
      if (!formData.admin_code) newErrors.admin_code = 'Kode admin wajib diisi'
      else if (formData.admin_code !== ADMIN_SECRET_CODE) newErrors.admin_code = 'Kode admin tidak valid'
    } else if (roleType === 'siswa') {
      if (!formData.nis) newErrors.nis = 'NIS wajib diisi'
      if (!formData.nama_lengkap) newErrors.nama_lengkap = 'Nama lengkap wajib diisi'
      if (!formData.kelas_id) newErrors.kelas_id = 'Kelas wajib dipilih'
    } else if (roleType === 'guru') {
      if (!formData.nip) newErrors.nip = 'NIP wajib diisi'
      if (!formData.nama_lengkap) newErrors.nama_lengkap = 'Nama lengkap wajib diisi'
      if (!formData.mata_pelajaran_ids || formData.mata_pelajaran_ids.length === 0) newErrors.mata_pelajaran_ids = 'Minimal pilih 1 mata pelajaran'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('email', formData.email)
      submitData.append('password', formData.password)
      submitData.append('password_confirmation', formData.password_confirmation)
      submitData.append('role', roleType)
      
      if (roleType === 'admin') {
        submitData.append('admin_code', formData.admin_code)
      } else if (roleType === 'siswa') {
        submitData.append('nis', formData.nis)
        if (formData.nisn) submitData.append('nisn', formData.nisn)
        submitData.append('kelas_id', formData.kelas_id)
        submitData.append('nama_lengkap', formData.nama_lengkap)
        submitData.append('jenis_kelamin', formData.jenis_kelamin)
        if (formData.tanggal_lahir) submitData.append('tanggal_lahir', formData.tanggal_lahir)
        if (formData.alamat) submitData.append('alamat', formData.alamat)
        if (formData.no_hp) submitData.append('no_hp', formData.no_hp)
        if (formData.nama_ortu) submitData.append('nama_ortu', formData.nama_ortu)
        if (formData.foto instanceof File) submitData.append('foto', formData.foto)
      } else if (roleType === 'guru') {
        submitData.append('nip', formData.nip)
        submitData.append('nama_lengkap', formData.nama_lengkap)
        submitData.append('jenis_kelamin', formData.jenis_kelamin)
        if (formData.tanggal_lahir) submitData.append('tanggal_lahir', formData.tanggal_lahir)
        if (formData.alamat) submitData.append('alamat', formData.alamat)
        if (formData.no_hp) submitData.append('no_hp', formData.no_hp)
        if (formData.mata_pelajaran_ids && formData.mata_pelajaran_ids.length > 0) {
          formData.mata_pelajaran_ids.forEach(id => submitData.append('mata_pelajaran_ids[]', id))
        }
        if (formData.foto instanceof File) submitData.append('foto', formData.foto)
      }

      const result = await register(submitData)
      if (result.success) {
        if (roleType === 'siswa' || roleType === 'guru') {
          setRegisteredUser(result.user)
          setShowQrModal(true)
          toast.success(`Registrasi berhasil! Simpan QR Code Anda untuk absensi.`)
        } else {
          toast.success(`Registrasi ${roleType} berhasil! Silakan login.`)
          setTimeout(() => navigate('/login'), 2000)
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      const message = error.response?.data?.message || 'Registrasi gagal'
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors
        setErrors(backendErrors)
        Object.keys(backendErrors).forEach(key => {
          const errorMsg = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key]
          let translatedMsg = errorMsg
          if (errorMsg.includes('has already been taken')) {
            if (key === 'nis') translatedMsg = 'NIS sudah terdaftar'
            else if (key === 'nisn') translatedMsg = 'NISN sudah terdaftar'
            else if (key === 'nip') translatedMsg = 'NIP sudah terdaftar'
            else if (key === 'email') translatedMsg = 'Email sudah terdaftar'
          }
          toast.error(`${key.toUpperCase()}: ${translatedMsg}`)
        })
      } else {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Custom styles for react-select with Emerald theme
  const customSelectStyles = (isDark, hasError) => ({
    control: (base, state) => ({
      ...base,
      minHeight: '50px',
      borderRadius: '12px',
      borderWidth: '2px',
      borderColor: hasError ? '#F59E0B' : (state.isFocused ? '#10B981' : (isDark ? '#10B98130' : '#10B98130')),
      backgroundColor: isDark ? '#0F172A' : '#ffffff',
      color: isDark ? '#ffffff' : '#1F2937',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none',
      '&:hover': { borderColor: '#10B981' },
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? '#ffffff' : '#1F2937'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? (isDark ? '#1E293B' : '#D1FAE5') : 'transparent',
      color: state.isFocused ? (isDark ? '#ffffff' : '#059669') : (isDark ? '#94A3B8' : '#1F2937'),
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDark ? '#1E293B' : '#D1FAE5'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? '#ffffff' : '#059669'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? '#94A3B8' : '#64748B',
      ':hover': {
        backgroundColor: '#10B981',
        color: 'white'
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? '#64748B' : '#94A3B8'
    }),
    input: (base) => ({
      ...base,
      color: isDark ? '#ffffff' : '#1F2937'
    })
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen flex flex-col lg:flex-row overflow-x-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-emerald-50 via-white to-teal-50'}`}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 p-2.5 rounded-xl border shadow-sm transition-all ${
          isDark ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
        }`}
      >
        {isDark ? <Sun size={15}/> : <Moon size={15}/>}
      </button>

      {/* ── MOBILE: ilustrasi atas ── */}
      <div className="lg:hidden flex-shrink-0 sticky top-0 z-30 relative overflow-visible flex flex-col items-center justify-end"
        style={{ background: 'linear-gradient(135deg,#064e3b,#065f46,#0f766e)', minHeight: 260 }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '16px 16px' }}/>
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(52,211,153,0.4) 0%,transparent 70%)' }}/>
        </div>
        <div className="relative z-10 text-center px-6 pt-8 pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <GraduationCap size={14} className="text-white"/>
            </div>
            <span className="text-white font-black text-base">EduAbsen</span>
          </div>
          <h2 className="text-white font-black text-xl leading-tight">
            {roleType === 'siswa' ? 'Daftar Siswa' : roleType === 'guru' ? 'Daftar Guru' : 'Daftar Admin'}
          </h2>
        </div>
        {/* Gambar — overflow ke bawah masuk area form */}
        <div className="relative z-20 w-full flex justify-center" style={{ marginBottom: '-5rem' }}>
          <motion.img src="/image/bg3.png" alt="ilustrasi"
            initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }}
            transition={{ delay:0.2, duration:0.6 }}
            className="w-64 sm:w-72 object-contain select-none pointer-events-none"
            style={{ filter:'drop-shadow(0 12px 24px rgba(0,0,0,0.3))' }}/>
        </div>
      </div>

      {/* ── DESKTOP: form kiri ── */}
      <div className={`w-full lg:w-[52%] flex-1 lg:h-screen lg:overflow-y-auto
        rounded-t-[2.5rem] lg:rounded-none -mt-2 lg:mt-0 relative z-10
        ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="flex flex-col justify-start px-6 sm:px-10 lg:px-14 xl:px-16 pt-20 pb-10 lg:py-10">

          {/* Logo desktop */}
          <div className="hidden lg:flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <GraduationCap size={18} className="text-white"/>
            </div>
            <span className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>EduAbsen</span>
          </div>

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
              <GraduationCap size={16} className="text-white"/>
            </div>
            <span className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>EduAbsen</span>
          </div>

          <div className="w-full max-w-lg mx-auto lg:mx-0">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step <= currentStep 
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isDark
                        ? 'border-emerald-500/30 text-slate-500'
                        : 'border-emerald-300 text-slate-400'
                  }`}>
                    {step < currentStep ? (
                      <CheckCircle size={16} />
                    ) : (
                      <span className="text-sm font-semibold">{step}</span>
                    )}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      step < currentStep 
                        ? 'bg-emerald-500'
                        : isDark ? 'bg-emerald-500/30' : 'bg-emerald-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Header */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-3 ${
                isDark 
                  ? 'bg-slate-900/50 border-emerald-500/30' 
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <User size={14} className="text-emerald-500" />
                <span className={`text-xs font-medium ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>Registrasi</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 tracking-tight ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                Buat Akun Baru
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Pilih jenis akun dan lengkapi data Anda
              </p>
            </motion.div>

            {/* Role Selector */}
            <RoleSelector roleType={roleType} setRoleType={setRoleType} setErrors={setErrors} isDark={isDark} />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Info Section */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-slate-900/40' : 'bg-emerald-50'
                  }`}>
                    <User size={16} className="text-emerald-500" />
                  </div>
                  Informasi Akun
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Nama Pengguna"
                    name="name"
                    required
                    icon={User}
                    placeholder="Nama untuk login"
                    value={formData.name}
                    error={errors.name}
                    onChange={(v) => handleInputChange('name', v)}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    isDark={isDark}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    required
                    icon={Mail}
                    placeholder="nama@sekolah.sch.id"
                    value={formData.email}
                    error={errors.email}
                    onChange={(v) => handleInputChange('email', v)}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    isDark={isDark}
                  />
                  <div className="space-y-1.5">
                    <label className={`block text-sm font-semibold flex items-center gap-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <Lock size={14} className="text-emerald-500" />
                      Password <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>*</span>
                    </label>
                    <motion.div 
                      className="relative group"
                      animate={focusedField === 'password' ? { scale: 1.01 } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                        focusedField === 'password' 
                          ? 'text-emerald-500 scale-105'
                          : (isDark ? 'text-slate-500 group-hover:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-500')
                      }`} size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl transition-all duration-200 focus:outline-none input-glow ${
                          errors.password 
                            ? 'border-orange-500' 
                            : focusedField === 'password'
                              ? isDark
                                ? 'border-emerald-500 bg-slate-900 text-white placeholder-slate-500 focus:ring-4 focus:ring-emerald-500/20'
                                : 'border-emerald-500 bg-white text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/20'
                              : isDark
                                ? 'border-emerald-500/30 bg-slate-900 text-white placeholder-slate-500 hover:border-emerald-500/60'
                                : 'border-emerald-300 bg-white text-slate-800 placeholder-slate-400 hover:border-emerald-500'
                        }`}
                        placeholder="Minimal 6 karakter"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                          isDark ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-400 hover:text-emerald-500'
                        }`}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </motion.button>
                    </motion.div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xs text-orange-500 font-medium flex items-center gap-1"
                        >
                          <AlertCircle size={12} />
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <InputField
                    label="Konfirmasi Password"
                    name="password_confirmation"
                    type={showPassword ? 'text' : 'password'}
                    required
                    icon={Lock}
                    placeholder="Ulangi password"
                    value={formData.password_confirmation}
                    error={errors.password_confirmation}
                    onChange={(v) => handleInputChange('password_confirmation', v)}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    isDark={isDark}
                  />
                </div>
              </motion.div>

              {/* Role Specific Sections */}
              {roleType === 'admin' && (
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-slate-900/40' : 'bg-emerald-50'
                    }`}>
                      <Key size={16} className="text-emerald-500" />
                    </div>
                    Verifikasi Admin
                  </h3>
                  <motion.div 
                    whileHover={{ scale: 1.01, y: -1 }}
                    className={`rounded-xl p-5 border ${
                      isDark 
                        ? 'bg-slate-900/40 border-emerald-500/20' 
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`p-2 rounded-lg ${
                          isDark ? 'bg-slate-800/70' : 'bg-white'
                        }`}
                      >
                        <Shield size={20} className="text-emerald-500" />
                      </motion.div>
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Hanya yang memiliki kode rahasia yang dapat mendaftar sebagai admin.
                      </p>
                    </div>
                    <InputField
                      label="Kode Admin"
                      name="admin_code"
                      type="password"
                      required
                      icon={Key}
                      placeholder="Masukkan kode rahasia"
                      value={formData.admin_code}
                      error={errors.admin_code}
                      onChange={(v) => handleInputChange('admin_code', v)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      isDark={isDark}
                    />
                  </motion.div>
                </motion.div>
              )}

              {roleType === 'siswa' && (
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-slate-900/40' : 'bg-emerald-50'
                    }`}>
                      <GraduationCap size={16} className="text-emerald-500" />
                    </div>
                    Data Siswa
                  </h3>
                  
                  {/* Foto Upload */}
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 border-dashed transition-colors ${
                      isDark 
                        ? 'bg-slate-900/50 border-emerald-500/30 hover:border-emerald-500' 
                        : 'bg-emerald-50 border-emerald-300 hover:border-emerald-500'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {previewFoto ? (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative"
                        >
                          <img src={previewFoto} alt="Preview" className="w-20 h-20 rounded-xl object-cover border-2 shadow-lg border-emerald-500" />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => { setFormData({ ...formData, foto: null }); setPreviewFoto(null) }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg hover:bg-emerald-700"
                          >
                            <X size={12} />
                          </motion.button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`w-20 h-20 rounded-xl flex items-center justify-center shadow-inner ${
                            isDark ? 'bg-slate-800' : 'bg-white'
                          }`}
                        >
                          <Camera size={32} className="text-emerald-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl group">
                        <Upload size={18} className="transition-transform group-hover:-translate-y-1" />
                        <span className="text-sm">{previewFoto ? 'Ganti Foto' : 'Upload Foto'}</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                      <p className={`text-xs mt-2 flex items-center gap-1 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <Info size={12} />
                        JPG/PNG, max 2MB (opsional)
                      </p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="NIS"
                      name="nis"
                      required
                      icon={Hash}
                      placeholder="Nomor Induk Siswa"
                      value={formData.nis}
                      error={errors.nis}
                      onChange={(v) => handleInputChange('nis', v)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      isDark={isDark}
                    />
                    <InputField
                      label="NISN"
                      name="nisn"
                      icon={Hash}
                      placeholder="NISN (opsional)"
                      value={formData.nisn}
                      onChange={(v) => handleInputChange('nisn', v)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      isDark={isDark}
                    />
                    <InputField
                      label="Nama Lengkap"
                      name="nama_lengkap"
                      required
                      icon={User}
                      placeholder="Nama lengkap siswa"
                      value={formData.nama_lengkap}
                      error={errors.nama_lengkap}
                      onChange={(v) => handleInputChange('nama_lengkap', v)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      isDark={isDark}
                    />
                    <div className="space-y-1.5">
                      <label className={`block text-sm font-semibold flex items-center gap-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <BookOpen size={14} className="text-emerald-500" />
                        Kelas <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>*</span>
                      </label>
                      <Select
                        options={kelasList}
                        onChange={(option) => handleInputChange('kelas_id', option?.value)}
                        placeholder="Pilih kelas"
                        styles={customSelectStyles(isDark, !!errors.kelas_id)}
                      />
                      <AnimatePresence>
                        {errors.kelas_id && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-orange-500 font-medium flex items-center gap-1"
                          >
                            <AlertCircle size={12} />
                            {errors.kelas_id}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="space-y-1.5">
                      <label className={`block text-sm font-semibold flex items-center gap-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <Users size={14} className="text-emerald-500" />
                        Jenis Kelamin
                      </label>
                      <select
                        value={formData.jenis_kelamin}
                        onChange={(e) => handleInputChange('jenis_kelamin', e.target.value)}
                        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all focus:outline-none ${
                          isDark 
                            ? 'bg-slate-900 border-emerald-500/30 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-500/60'
                            : 'bg-white border-emerald-300 text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-500'
                        }`}
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className={`block text-sm font-semibold flex items-center gap-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <Calendar size={14} className="text-emerald-500" />
                        Tanggal Lahir
                      </label>
                      <motion.div 
                        className="relative group"
                        animate={focusedField === 'tanggal_lahir' ? { scale: 1.01 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                          focusedField === 'tanggal_lahir' 
                            ? 'text-emerald-500 scale-105'
                            : (isDark ? 'text-slate-500 group-hover:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-500')
                        }`} size={18} />
                        <input
                          type="date"
                          value={formData.tanggal_lahir}
                          onChange={(e) => handleInputChange('tanggal_lahir', e.target.value)}
                          onFocus={() => setFocusedField('tanggal_lahir')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all focus:outline-none ${
                            isDark 
                              ? 'bg-slate-900 border-emerald-500/30 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-500/60'
                              : 'bg-white border-emerald-300 text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-500'
                          }`}
                        />
                      </motion.div>
                    </div>
                    <InputField
                      label="No. HP"
                      name="no_hp"
                      icon={Phone}
                      placeholder="08123456789"
                      value={formData.no_hp}
                      onChange={(v) => handleInputChange('no_hp', v)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      isDark={isDark}
                    />
                    <div className="sm:col-span-2">
                      <InputField
                        label="Alamat"
                        name="alamat"
                        icon={MapPin}
                        placeholder="Alamat lengkap"
                        value={formData.alamat}
                        onChange={(v) => handleInputChange('alamat', v)}
                        focusedField={focusedField}
                        setFocusedField={setFocusedField}
                        isDark={isDark}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <InputField
                        label="Nama Orang Tua / Wali"
                        name="nama_ortu"
                        icon={Users}
                        placeholder="Nama orang tua atau wali"
                        value={formData.nama_ortu}
                        onChange={(v) => handleInputChange('nama_ortu', v)}
                        focusedField={focusedField}
                        setFocusedField={setFocusedField}
                        isDark={isDark}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {roleType === 'guru' && (
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-slate-900/40' : 'bg-emerald-50'
                    }`}>
                      <UserCheck size={16} className="text-emerald-500" />
                    </div>
                    Data Guru
                  </h3>
                  
                  {/* Foto Upload */}
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 border-dashed transition-colors ${
                      isDark 
                        ? 'bg-slate-900/50 border-emerald-500/30 hover:border-emerald-500' 
                        : 'bg-emerald-50 border-emerald-300 hover:border-emerald-500'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {previewFoto ? (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative"
                        >
                          <img src={previewFoto} alt="Preview" className="w-20 h-20 rounded-xl object-cover border-2 shadow-lg border-emerald-500" />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => { setFormData({ ...formData, foto: null }); setPreviewFoto(null) }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg hover:bg-emerald-700"
                          >
                            <X size={12} />
                          </motion.button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`w-20 h-20 rounded-xl flex items-center justify-center shadow-inner ${
                            isDark ? 'bg-slate-800' : 'bg-white'
                          }`}
                        >
                          <Camera size={32} className="text-emerald-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl group">
                        <Upload size={18} className="transition-transform group-hover:-translate-y-1" />
                        <span className="text-sm">{previewFoto ? 'Ganti Foto' : 'Upload Foto'}</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                      <p className={`text-xs mt-2 flex items-center gap-1 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <Info size={12} />
                        JPG/PNG, max 2MB (opsional)
                      </p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="NIP"
                      name="nip"
                      required
                      icon={Hash}
                      placeholder="Nomor Induk Pegawai"
                      value={formData.nip}
                      error={errors.nip}
                      onChange={(v) => handleInputChange('nip', v)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      isDark={isDark}
                    />
                    <InputField
                      label="Nama Lengkap"
                      name="nama_lengkap"
                      required
                      icon={User}
                      placeholder="Nama lengkap guru"
                      value={formData.nama_lengkap}
                      error={errors.nama_lengkap}
                      onChange={(v) => handleInputChange('nama_lengkap', v)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      isDark={isDark}
                    />
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className={`block text-sm font-semibold flex items-center gap-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <BookOpen size={14} className="text-emerald-500" />
                        Mata Pelajaran <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>*</span>
                      </label>
                      <Select
                        isMulti
                        options={mataPelajaranList}
                        onChange={(options) => handleInputChange('mata_pelajaran_ids', options ? options.map(o => o.value) : [])}
                        placeholder="Pilih mata pelajaran (bisa lebih dari 1)"
                        styles={customSelectStyles(isDark, !!errors.mata_pelajaran_ids)}
                      />
                      <AnimatePresence>
                        {errors.mata_pelajaran_ids && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-orange-500 font-medium flex items-center gap-1"
                          >
                            <AlertCircle size={12} />
                            {errors.mata_pelajaran_ids}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="space-y-1.5">
                      <label className={`block text-sm font-semibold flex items-center gap-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <Users size={14} className="text-emerald-500" />
                        Jenis Kelamin
                      </label>
                      <select
                        value={formData.jenis_kelamin}
                        onChange={(e) => handleInputChange('jenis_kelamin', e.target.value)}
                        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all focus:outline-none ${
                          isDark 
                            ? 'bg-slate-900 border-emerald-500/30 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-500/60'
                            : 'bg-white border-emerald-300 text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-500'
                        }`}
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className={`block text-sm font-semibold flex items-center gap-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <Calendar size={14} className="text-emerald-500" />
                        Tanggal Lahir
                      </label>
                      <motion.div 
                        className="relative group"
                        animate={focusedField === 'tanggal_lahir' ? { scale: 1.01 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                          focusedField === 'tanggal_lahir' 
                            ? 'text-emerald-500 scale-105'
                            : (isDark ? 'text-slate-500 group-hover:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-500')
                        }`} size={18} />
                        <input
                          type="date"
                          value={formData.tanggal_lahir}
                          onChange={(e) => handleInputChange('tanggal_lahir', e.target.value)}
                          onFocus={() => setFocusedField('tanggal_lahir')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all focus:outline-none ${
                            isDark 
                              ? 'bg-slate-900 border-emerald-500/30 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-500/60'
                              : 'bg-white border-emerald-300 text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-500'
                          }`}
                        />
                      </motion.div>
                    </div>
                    <InputField
                      label="No. HP"
                      name="no_hp"
                      icon={Phone}
                      placeholder="08123456789"
                      value={formData.no_hp}
                      onChange={(v) => handleInputChange('no_hp', v)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      isDark={isDark}
                    />
                    <InputField
                      label="Alamat"
                      name="alamat"
                      icon={MapPin}
                      placeholder="Alamat lengkap"
                      value={formData.alamat}
                      onChange={(v) => handleInputChange('alamat', v)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      isDark={isDark}
                    />
                  </div>
                </motion.div>
              )}

              {/* Error Summary */}
              <AnimatePresence>
                {Object.keys(errors).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`rounded-xl p-5 border-2 ${
                      isDark 
                        ? 'bg-slate-900/40 border-emerald-500/20' 
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`p-2 rounded-lg ${
                          isDark ? 'bg-slate-800/70' : 'bg-white'
                        }`}
                      >
                        <AlertCircle size={20} className="text-emerald-500" />
                      </motion.div>
                      <div>
                        <p className={`text-sm font-bold mb-2 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Terdapat kesalahan pada form:
                        </p>
                        <ul className="space-y-1">
                          {Object.entries(errors).map(([key, value]) => (
                            <motion.li
                              key={key}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className={`text-xs flex items-start gap-1 ${
                                isDark ? 'text-slate-400' : 'text-slate-600'
                              }`}
                            >
                              <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 bg-emerald-500`} />
                              <span><span className="font-semibold capitalize">{key}:</span> {Array.isArray(value) ? value[0] : value}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button - Emerald */}
              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                animate={loading ? { scale: [1, 1.01, 1] } : {}}
                transition={{ duration: 0.3 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden btn-shine"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                />
                {loading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span className="relative z-10">Mendaftar...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Daftar sebagai {roleType.charAt(0).toUpperCase() + roleType.slice(1)}</span>
                    <ArrowRight size={20} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>

              {/* Login Link */}
              <motion.div 
                variants={itemVariants}
                className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 ${
                  isDark ? 'border-slate-700' : 'border-slate-200'
                }`}
              >
                <Link 
                  to="/absen" 
                  className={`flex items-center gap-2 text-sm transition-colors font-medium group ${
                    isDark 
                      ? 'text-slate-400 hover:text-emerald-400' 
                      : 'text-slate-600 hover:text-emerald-600'
                  }`}
                >
                  <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                  Kembali ke absensi
                </Link>
                <p className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Sudah punya akun?{' '}
                  <Link to="/login" className={`font-bold underline underline-offset-2 transition-colors ${
                    isDark 
                      ? 'text-emerald-400 hover:text-emerald-300' 
                      : 'text-emerald-600 hover:text-emerald-700'
                  }`}>
                    Masuk di sini
                  </Link>
                </p>
              </motion.div>
            </form>
          </div>
        </div>
      </div>

      {/* ── DESKTOP: ilustrasi kanan ── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden flex-col items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(145deg,#064e3b 0%,#065f46 40%,#0f766e 100%)' }}>
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
            transition={{ repeat:Infinity, duration:2.3+i*0.3, delay:s.d }}>✦</motion.span>
        ))}
        <div className="relative z-10 text-center px-12 mb-6">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-5">
            <Sparkles size={10} className="text-emerald-300"/>
            <span className="text-white/75 text-xs font-semibold">
              {roleType === 'siswa' ? 'Registrasi Siswa' : roleType === 'guru' ? 'Registrasi Guru' : 'Registrasi Admin'}
            </span>
          </div>
          <h2 className="text-white font-black text-4xl xl:text-5xl leading-tight mb-4">
            Bergabung<br/>dengan<br/>
            <span className="text-emerald-300">EduAbsen</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Daftar dan nikmati kemudahan<br/>absensi digital dengan QR Code
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['QR Code','Real-time','Multi Role'].map((f,i) => (
              <span key={i} className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-white/60 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"/>{f}
              </span>
            ))}
          </div>
        </div>
        <motion.img src="/image/bg3.png" alt="ilustrasi"
          initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }}
          transition={{ delay:0.3, duration:0.7, ease:[0.22,1,0.36,1] }}
          className="relative z-20 w-72 xl:w-80 object-contain select-none pointer-events-none"
          style={{ filter:'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}/>
      </div>

      {/* QR Code Modal */}
      <Modal 
        isOpen={showQrModal} 
        onClose={() => { 
          setShowQrModal(false); 
          navigate(roleType === 'siswa' ? '/siswa/dashboard' : roleType === 'guru' ? '/guru/dashboard' : '/login') 
        }} 
        title="QR Code Absensi Anda" 
        size="sm"
      >
        {registeredUser?.profile?.qr_code_url ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-5"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex justify-center"
            >
              <img src={registeredUser.profile.qr_code_url} alt="QR Code" className={`w-56 h-56 border-4 rounded-xl object-contain bg-white p-3 shadow-xl ${
                isDark ? 'border-emerald-500/50' : 'border-emerald-500'
              }`} />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border ${
                isDark 
                  ? 'bg-slate-900/30 border-emerald-500/20 text-emerald-400' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}
            >
              <CheckCircle size={20} />
              <span className="font-medium">Simpan QR Code ini untuk absensi!</span>
            </motion.div>
            
            <p className={`text-sm font-medium ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {registeredUser.profile.nama_lengkap} • {registeredUser.profile.nis || registeredUser.profile.nip}
            </p>
            
            <div className="flex gap-3 justify-center pt-2">
              <motion.a
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                href={registeredUser.profile.qr_code_url} 
                download={`QR-${registeredUser.profile.nis || registeredUser.profile.nip || 'user'}.svg`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-lg"
              >
                <Download size={18} />
                Download QR
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { 
                  setShowQrModal(false); 
                  navigate(roleType === 'siswa' ? '/siswa/dashboard' : roleType === 'guru' ? '/guru/dashboard' : '/login') 
                }} 
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-md ${
                  isDark 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <ArrowRight size={18} />
                Lanjut ke Dashboard
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className={`py-8 text-center ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={`w-12 h-12 border-4 rounded-full mx-auto mb-4 ${
                isDark 
                  ? 'border-emerald-500/30 border-t-emerald-500' 
                  : 'border-emerald-300 border-t-emerald-500'
              }`}
            />
            <p>Memuat QR Code...</p>
          </div>
        )}
      </Modal>

      {/* Inline styles */}
      <style jsx>{`
        .input-glow:focus {
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08);
        }
        .dark .input-glow:focus {
          box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.08);
        }
        .btn-shine {
          position: relative;
          overflow: hidden;
        }
        .btn-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(30deg);
          animation: shine 3s infinite;
        }
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(30deg); }
          20% { transform: translateX(100%) rotate(30deg); }
          100% { transform: translateX(100%) rotate(30deg); }
        }
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
        }
      `}</style>
    </motion.div>
  )
}
