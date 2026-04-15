import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Hash, Calendar, FileText, Upload, AlertCircle,
  CheckCircle, Loader, Search, Heart, FileWarning, Trash2,
  Sparkles, ArrowRight, RefreshCw
} from 'lucide-react'
import { publicApi } from '../services/publicApi'
import { showSuccess, showError } from './ConfirmDialog'
import { useThemeStore } from '../stores/themeStore'

export default function FormIzin() {
  const { isDark } = useThemeStore()
  const [step, setStep] = useState('form')
  const [loading, setLoading] = useState(false)
  const [loadingCek, setLoadingCek] = useState(false)
  const [siswaFound, setSiswaFound] = useState(null)
  const [previewFoto, setPreviewFoto] = useState(null)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    nis: '', nama_lengkap: '',
    tanggal: new Date().toISOString().split('T')[0],
    jenis: 'izin', alasan: '', bukti_foto: null,
  })

  const fieldClass = (field) =>
    `w-full px-4 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-400 focus:ring-red-400/20 bg-red-500/5'
        : isDark
          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20'
          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 focus:bg-white'
    }`

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (name === 'nis') setSiswaFound(null)
  }

  const handleCekSiswa = async () => {
    if (!formData.nis.trim()) { setErrors(prev => ({ ...prev, nis: 'NIS wajib diisi' })); return }
    setLoadingCek(true)
    try {
      const res = await publicApi.checkSiswa({ nis: formData.nis.trim() })
      const siswa = res.data.data
      setSiswaFound(siswa)
      setFormData(prev => ({ ...prev, nama_lengkap: siswa.nama_lengkap }))
      setErrors(prev => ({ ...prev, nis: '', nama_lengkap: '' }))
    } catch (err) {
      setSiswaFound(null)
      setErrors(prev => ({ ...prev, nis: err.response?.data?.message || 'NIS tidak ditemukan' }))
    } finally { setLoadingCek(false) }
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setErrors(prev => ({ ...prev, bukti_foto: 'Ukuran maksimal 2MB' })); return }
    setFormData(prev => ({ ...prev, bukti_foto: file }))
    setPreviewFoto(URL.createObjectURL(file))
    setErrors(prev => ({ ...prev, bukti_foto: '' }))
  }

  const removeFoto = () => { setFormData(prev => ({ ...prev, bukti_foto: null })); setPreviewFoto(null) }

  const validate = () => {
    const e = {}
    if (!formData.nis.trim()) e.nis = 'NIS wajib diisi'
    if (!formData.nama_lengkap.trim()) e.nama_lengkap = 'Nama lengkap wajib diisi'
    if (!formData.tanggal) e.tanggal = 'Tanggal wajib diisi'
    if (!formData.alasan.trim()) e.alasan = 'Alasan wajib diisi'
    else if (formData.alasan.trim().length < 10) e.alasan = 'Alasan minimal 10 karakter'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const data = new FormData()
      data.append('nis', formData.nis.trim())
      data.append('nama_lengkap', formData.nama_lengkap.trim())
      data.append('tanggal', formData.tanggal)
      data.append('jenis', formData.jenis)
      data.append('alasan', formData.alasan.trim())
      if (formData.bukti_foto) data.append('bukti_foto', formData.bukti_foto)
      await publicApi.submitIzin(data)
      setStep('success')
      showSuccess('Berhasil', 'Pengajuan izin berhasil dikirim.')
    } catch (err) {
      const res = err.response?.data
      if (res?.errors) setErrors(res.errors)
      else showError('Gagal', res?.message || 'Terjadi kesalahan saat mengirim izin')
    } finally { setLoading(false) }
  }

  const reset = () => {
    setStep('form'); setSiswaFound(null); setPreviewFoto(null); setErrors({})
    setFormData({ nis: '', nama_lengkap: '', tanggal: new Date().toISOString().split('T')[0], jenis: 'izin', alasan: '', bukti_foto: null })
  }

  if (step === 'success') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        className="py-4 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-500/30">
          <CheckCircle size={36} className="text-white"/>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className={`font-black text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Izin Terkirim!</h3>
          <p className={`text-xs leading-relaxed mb-6 max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Pengajuan izin berhasil dikirim dan sedang menunggu persetujuan dari guru atau admin.
          </p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs mb-6 ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
            <Sparkles size={11}/>Status: Menunggu Persetujuan
          </div>
        </motion.div>
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          onClick={reset}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-105">
          <RefreshCw size={14}/>Ajukan Lagi
        </motion.button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* NIS + Cek */}
      <div>
        <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>NIS Siswa</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
              <Hash size={11} className="text-emerald-500"/>
            </div>
            <input type="text" name="nis" value={formData.nis} onChange={handleChange}
              placeholder="Masukkan NIS"
              className={`${fieldClass('nis')} pl-12`}/>
          </div>
          <motion.button type="button" onClick={handleCekSiswa} disabled={loadingCek} whileTap={{ scale: 0.97 }}
            className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 whitespace-nowrap">
            {loadingCek ? <Loader size={12} className="animate-spin"/> : <Search size={12}/>}
            Cek
          </motion.button>
        </div>
        {errors.nis && <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10}/>{errors.nis}</p>}
        <AnimatePresence>
          {siswaFound && (
            <motion.div initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className={`mt-2 px-3 py-2.5 rounded-xl flex items-center gap-2.5 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                <CheckCircle size={13} className="text-emerald-500"/>
              </div>
              <div>
                <p className={`text-xs font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{siswaFound.nama_lengkap}</p>
                <p className={`text-[10px] ${isDark ? 'text-emerald-400/60' : 'text-emerald-600/70'}`}>{siswaFound.kelas || 'Kelas tidak diketahui'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nama */}
      <div>
        <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nama Lengkap</label>
        <div className="relative">
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
            <User size={11} className="text-blue-500"/>
          </div>
          <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange}
            placeholder="Nama sesuai data sekolah"
            className={`${fieldClass('nama_lengkap')} pl-12`}/>
        </div>
        {errors.nama_lengkap && <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10}/>{errors.nama_lengkap}</p>}
      </div>

      {/* Tanggal + Jenis */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tanggal</label>
          <div className="relative">
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
              <Calendar size={11} className="text-purple-500"/>
            </div>
            <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange}
              className={`${fieldClass('tanggal')} pl-12`}/>
          </div>
          {errors.tanggal && <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10}/>{errors.tanggal}</p>}
        </div>
        <div>
          <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jenis</label>
          <div className="flex gap-1.5 h-[46px]">
            {[
              { key: 'izin', label: 'Izin', icon: FileWarning, color: 'from-amber-400 to-orange-500' },
              { key: 'sakit', label: 'Sakit', icon: Heart, color: 'from-rose-400 to-pink-500' },
            ].map(j => (
              <motion.button key={j.key} type="button" whileTap={{ scale: 0.97 }}
                onClick={() => setFormData(prev => ({ ...prev, jenis: j.key }))}
                className={`flex-1 flex items-center justify-center gap-1 rounded-2xl border text-xs font-bold transition-all ${
                  formData.jenis === j.key
                    ? `bg-gradient-to-r ${j.color} border-transparent text-white shadow-lg`
                    : isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
                <j.icon size={11}/>{j.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Alasan */}
      <div>
        <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Alasan <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(min. 10 karakter)</span>
        </label>
        <div className="relative">
          <div className={`absolute left-3 top-3 w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? 'bg-teal-500/20' : 'bg-teal-50'}`}>
            <FileText size={11} className="text-teal-500"/>
          </div>
          <textarea name="alasan" value={formData.alasan} onChange={handleChange} rows={3}
            placeholder="Jelaskan alasan izin atau sakit secara singkat..."
            className={`${fieldClass('alasan')} pl-12 resize-none`}/>
        </div>
        <div className="flex items-center justify-between mt-1">
          {errors.alasan
            ? <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10}/>{errors.alasan}</p>
            : <span/>
          }
          <span className={`text-[10px] ${formData.alasan.length >= 10 ? 'text-emerald-500' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            {formData.alasan.length}/10+
          </span>
        </div>
      </div>

      {/* Bukti Foto */}
      <div>
        <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Bukti Foto <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(opsional · maks 2MB)</span>
        </label>
        <AnimatePresence mode="wait">
          {previewFoto ? (
            <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative rounded-2xl overflow-hidden border-2 border-emerald-400/30 group">
              <img src={previewFoto} alt="Preview" className="w-full h-36 object-cover"/>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <motion.button type="button" onClick={removeFoto} whileTap={{ scale: 0.9 }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-bold">
                  <Trash2 size={12}/>Hapus Foto
                </motion.button>
              </div>
              <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-[10px] font-semibold ${isDark ? 'bg-black/60 text-white' : 'bg-white/90 text-slate-700'}`}>
                ✓ Foto terpilih
              </div>
            </motion.div>
          ) : (
            <motion.label key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all group ${
                isDark
                  ? 'border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                  : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                <Upload size={18} className="text-emerald-500"/>
              </div>
              <div className="text-center">
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Klik untuk upload foto surat</p>
                <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>JPEG, JPG, PNG · Maks 2MB</p>
              </div>
              <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFotoChange} className="hidden"/>
            </motion.label>
          )}
        </AnimatePresence>
        {errors.bukti_foto && <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10}/>{errors.bukti_foto}</p>}
      </div>

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
        {loading
          ? <><Loader size={15} className="animate-spin"/>Mengirim Pengajuan...</>
          : <><ArrowRight size={15}/>Kirim Pengajuan Izin</>
        }
      </motion.button>
    </form>
  )
}
