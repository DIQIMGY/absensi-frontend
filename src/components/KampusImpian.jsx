import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Globe, Pencil, Trash2, Plus, X, Camera, ExternalLink, BookOpen, Check, Video, Play } from 'lucide-react'
import { siswaApi } from '../services/siswaService'
import toast from 'react-hot-toast'

const getMotivasi = (nama, pct, alpha, terlambat, streak) => {
  const n = nama || 'kampus impianmu'
  if (streak >= 20 && pct >= 90) return { text: `${streak} hari berturut-turut — ${n} sudah menantimu!`, emoji: '🔥', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' }
  if (pct >= 80) return { text: `Tidak pernah absen — ${n} menunggumu!`, emoji: '🎯', color: '#818cf8', bg: 'rgba(129,140,248,0.12)', border: 'rgba(129,140,248,0.25)' }
  if (pct >= 60) return { text: `Hampir sampai! Tingkatkan kehadiranmu.`, emoji: '⚡', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' }
  if (alpha >= 5) return { text: `Jangan malas! ${n} hanya untuk yang rajin.`, emoji: '😤', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' }
  if (terlambat >= 5) return { text: `${n} butuh mahasiswa yang disiplin!`, emoji: '⏰', color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.25)' }
  return { text: `Rajin hadir — ${n} menunggumu!`, emoji: '🌟', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' }
}

/* shared modal form fields */
function FormFields({ form, setForm }) {
  return (
    <div className="space-y-3">
      {[
        { key: 'nama_kampus', label: 'Nama Kampus', placeholder: 'Universitas Indonesia', required: true },
        { key: 'jurusan_impian', label: 'Jurusan Impian', placeholder: 'Teknik Informatika' },
      ].map(f => (
        <div key={f.key}>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
            {f.label}{f.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
          <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-transparent transition-all font-medium" />
        </div>
      ))}
      <div>
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Website</label>
        <div className="relative">
          <Globe size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
            placeholder="https://www.ui.ac.id"
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-transparent transition-all font-medium" />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Motivasiku</label>
        <textarea value={form.motivasi} onChange={e => setForm(p => ({ ...p, motivasi: e.target.value }))}
          placeholder="Tuliskan alasanmu memilih kampus ini..." rows={3}
          className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:border-transparent transition-all resize-none font-medium leading-relaxed" />
        <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1 text-right">{form.motivasi.length}/1000</p>
      </div>
    </div>
  )
}

function ModalShell({ title, subtitle, onClose, onSubmit, saving, children }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative w-full sm:max-w-md bg-white dark:bg-[#0d0d18] rounded-t-[28px] sm:rounded-[24px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-shrink-0 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">{title}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X size={14} className="text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">{children}</div>
        <div className="px-5 py-4 flex gap-2.5 flex-shrink-0 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Batal
          </button>
          <button onClick={onSubmit} disabled={saving}
            className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-sm font-black hover:from-violet-700 hover:to-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</> : <><Check size={14} /> Simpan</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function ModalEdit({ data, onClose, onSaved }) {
  const [form, setForm] = useState({ nama_kampus: data?.nama_kampus || '', jurusan_impian: data?.jurusan_impian || '', motivasi: data?.motivasi || '', website: data?.website || '' })
  const [saving, setSaving] = useState(false)
  const submit = async () => {
    if (!form.nama_kampus.trim()) return toast.error('Nama kampus wajib diisi')
    setSaving(true)
    try {
      const fd = new FormData(); Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      const res = await siswaApi.saveKampusImpian(fd); toast.success('Tersimpan!'); onSaved(res.data.data); onClose()
    } catch (err) { toast.error(err?.response?.data?.message || 'Gagal menyimpan') }
    finally { setSaving(false) }
  }
  return <ModalShell title="Edit Info Kampus" subtitle="Perbarui data kampus impianmu" onClose={onClose} onSubmit={submit} saving={saving}><FormFields form={form} setForm={setForm} /></ModalShell>
}

function ModalAdd({ onClose, onSaved }) {
  const [form, setForm] = useState({ nama_kampus: '', jurusan_impian: '', motivasi: '', website: '' })
  const [saving, setSaving] = useState(false)
  const submit = async () => {
    if (!form.nama_kampus.trim()) return toast.error('Nama kampus wajib diisi')
    setSaving(true)
    try {
      const fd = new FormData(); Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      const res = await siswaApi.saveKampusImpian(fd); toast.success('Ditambahkan!'); onSaved(res.data.data); onClose()
    } catch (err) { toast.error(err?.response?.data?.message || 'Gagal menyimpan') }
    finally { setSaving(false) }
  }
  return <ModalShell title="Tambah Kampus Impian" subtitle="Foto bisa ditambah setelah disimpan" onClose={onClose} onSubmit={submit} saving={saving}><FormFields form={form} setForm={setForm} /></ModalShell>
}

/* inline foto upload helper */
function AvatarCircle({ src, index }) {
  const [err, setErr] = useState(false)
  return (
    <div className="relative rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-sm flex-shrink-0"
      style={{
        width: 'clamp(26px, 7vw, 34px)',
        height: 'clamp(26px, 7vw, 34px)',
        marginLeft: index === 0 ? 0 : 'clamp(-8px, -2vw, -10px)',
        zIndex: 3 - index,
      }}>
      {!err
        ? <img src={src} alt="" className="w-full h-full object-cover" onError={() => setErr(true)}/>
        : <div className="w-full h-full flex items-center justify-center">
            <GraduationCap size={10} className="text-slate-400"/>
          </div>}
    </div>
  )
}

/* inline foto upload helper */
function FotoBtn({ id, src, uploading, onUpload, onRemove, children }) {
  const [err, setErr] = useState(false)
  return (
    <div className="relative w-full h-full group cursor-pointer" onClick={() => document.getElementById(id)?.click()}>
      {src && !err
        ? <img src={src} alt="" className="w-full h-full object-cover" onError={() => setErr(true)} />
        : <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">{children}</div>}
      {/* hover overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
        <Camera size={13} className="text-white" />
        {src && !err && (
          <button onClick={e => { e.stopPropagation(); setErr(false); onRemove() }}
            className="w-5 h-5 rounded-full bg-rose-500/90 flex items-center justify-center">
            <X size={9} className="text-white" />
          </button>
        )}
      </div>
      {uploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={e => { const f = e.target.files[0]; if (!f) return; if (f.size > 2*1024*1024) { toast.error('Foto maks 2MB'); return } onUpload(f); e.target.value = '' }} />
    </div>
  )
}

/* ── VideoWithBlur — canvas background selalu sinkron dengan video ── */
function VideoWithBlur({ src, videoRef, videoMuted, setVideoMuted, uploadingVideo, onRemove, onPlay }) {
  const canvasRef = useRef()
  const rafRef = useRef()

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const ctx = canvas.getContext('2d')

    const draw = () => {
      if (!video.paused && !video.ended && video.readyState >= 2) {
        canvas.width = video.videoWidth || 320
        canvas.height = video.videoHeight || 180
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [src])

  return (
    <div className="relative rounded-xl overflow-hidden group" style={{ maxHeight: 180 }}>
      {/* canvas blur background — selalu sinkron */}
      <canvas ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover', filter: 'blur(14px)', transform: 'scale(1.08)', opacity: 0.65 }}/>
      {/* video utama */}
      <video ref={videoRef} src={src}
        className="relative z-10 w-full block"
        style={{ maxHeight: 180, objectFit: 'contain' }}
        autoPlay muted loop playsInline
        onPlay={onPlay}
      />
      {/* mute btn */}
      <button onClick={() => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setVideoMuted(v.muted) }}
        className="absolute bottom-1.5 left-1.5 z-20 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors">
        {videoMuted
          ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>}
      </button>
      <button onClick={onRemove} disabled={uploadingVideo}
        className="absolute top-1.5 right-1.5 z-20 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/80">
        <X size={9} className="text-white" />
      </button>
      {uploadingVideo && <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/></div>}
    </div>
  )
}

export default function KampusImpian({ pctHadir = 0, totalAlpha = 0, totalTerlambat = 0, streak = 0, onSaved, onDeleted }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [showConfirmDel, setShowConfirmDel] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingSlot, setUploadingSlot] = useState(null)
  const [uploadingSlotP, setUploadingSlotP] = useState(null)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoMuted, setVideoMuted] = useState(true)
  const videoRef = useRef()

  useEffect(() => {
    siswaApi.getKampusImpian().then(r => setData(r.data.data)).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  const uploadFoto = useCallback(async (slot, file) => {
    setUploadingSlot(slot)
    try {
      const fd = new FormData()
      const fields = ['foto_kampus', 'foto_2', 'foto_3', 'foto_4']
      if (data?.nama_kampus) fd.append('nama_kampus', data.nama_kampus)
      if (data?.jurusan_impian) fd.append('jurusan_impian', data.jurusan_impian)
      if (data?.motivasi) fd.append('motivasi', data.motivasi)
      if (data?.website) fd.append('website', data.website)
      fd.append(fields[slot], file)
      const res = await siswaApi.saveKampusImpian(fd); setData(res.data.data); toast.success('Foto diperbarui!')
    } catch { toast.error('Gagal upload') } finally { setUploadingSlot(null) }
  }, [data])

  const removeFoto = useCallback(async (slot) => {
    setUploadingSlot(slot)
    try {
      const fd = new FormData()
      const fields = ['foto_kampus', 'foto_2', 'foto_3', 'foto_4']
      if (data?.nama_kampus) fd.append('nama_kampus', data.nama_kampus)
      if (data?.jurusan_impian) fd.append('jurusan_impian', data.jurusan_impian)
      if (data?.motivasi) fd.append('motivasi', data.motivasi)
      if (data?.website) fd.append('website', data.website)
      fd.append(`remove_${fields[slot]}`, '1')
      const res = await siswaApi.saveKampusImpian(fd); setData(res.data.data); toast.success('Foto dihapus')
    } catch { toast.error('Gagal hapus') } finally { setUploadingSlot(null) }
  }, [data])

  const uploadFotoP = useCallback(async (slotIndex, file) => {
    setUploadingSlotP(slotIndex)
    const fieldMap = ['foto_p1', 'foto_p2', 'foto_p3']
    try {
      const fd = new FormData()
      if (data?.nama_kampus) fd.append('nama_kampus', data.nama_kampus)
      if (data?.jurusan_impian) fd.append('jurusan_impian', data.jurusan_impian)
      if (data?.motivasi) fd.append('motivasi', data.motivasi)
      if (data?.website) fd.append('website', data.website)
      if (file) {
        fd.append(fieldMap[slotIndex], file)
      } else {
        fd.append(`remove_${fieldMap[slotIndex]}`, '1')
      }
      const res = await siswaApi.saveKampusImpian(fd)
      setData(res.data.data)
      toast.success(file ? 'Foto diperbarui!' : 'Foto dihapus')
    } catch { toast.error('Gagal') }
    finally { setUploadingSlotP(null) }
  }, [data])

  const uploadVideo = useCallback(async (file) => {
    setUploadingVideo(true)
    try {
      const fd = new FormData()
      fd.append('video_kampus', file)
      const res = await siswaApi.uploadVideoKampus(fd)
      setData(res.data.data)
      toast.success('Video diperbarui!')
    } catch { toast.error('Gagal upload video') }
    finally { setUploadingVideo(false) }
  }, [])

  const removeVideo = useCallback(async () => {
    setUploadingVideo(true)
    try {
      const res = await siswaApi.hapusVideoKampus()
      setData(res.data.data)
      toast.success('Video dihapus')
    } catch { toast.error('Gagal hapus video') }
    finally { setUploadingVideo(false) }
  }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try { await siswaApi.deleteKampusImpian(); setData(null); setShowConfirmDel(false); toast.success('Dihapus'); onDeleted?.() }
    catch { toast.error('Gagal menghapus') } finally { setDeleting(false) }
  }

  const pColor = pctHadir >= 80 ? '#10b981' : pctHadir >= 60 ? '#f59e0b' : '#ef4444'
  const mot = data ? getMotivasi(data.nama_kampus, pctHadir, totalAlpha, totalTerlambat, streak) : null
  const fotos = data ? [data.foto_kampus_url || null, data.foto_2_url || null, data.foto_3_url || null, data.foto_4_url || null] : []
  const fotosP = data ? [data.foto_p1_url || null, data.foto_p2_url || null, data.foto_p3_url || null] : []
  const videoUrl = data?.video_kampus_url || null

  if (loading) return <div className="rounded-2xl animate-pulse bg-slate-200 dark:bg-slate-800 h-64" />

  return (
    <>
      <AnimatePresence>
        {showEdit && <ModalEdit data={data} onClose={() => setShowEdit(false)} onSaved={d => { setData(d); onSaved?.() }} />}
        {showAdd && <ModalAdd onClose={() => setShowAdd(false)} onSaved={d => { setData(d); onSaved?.() }} />}
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setLightboxSrc(null)}>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative max-w-xs w-full"
              onClick={e => e.stopPropagation()}>
              <img src={lightboxSrc} alt="foto" className="w-full rounded-3xl shadow-2xl object-cover" style={{ maxHeight: '70vh' }}/>
              <button onClick={() => setLightboxSrc(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
                <X size={14} className="text-white"/>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {data ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

          {/* ── TOP BAR: label + aksi ── */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-1.5">
              <GraduationCap size={12} className="text-violet-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kampus Impian</span>
            </div>
            <div className="flex items-center gap-0.5">
              {data.website && (
                <a href={data.website} target="_blank" rel="noopener noreferrer"
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                  <ExternalLink size={12} />
                </a>
              )}
              <button onClick={() => setShowEdit(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                <Pencil size={10} /> Edit
              </button>
              <button onClick={() => setShowConfirmDel(true)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          </div>

          {/* ── INFO ROW: logo square + nama/jurusan/motivasi + 3 foto bulat ── */}
          <div className="flex gap-3 px-4 pb-3 items-start">
            {/* logo — square, klik untuk ganti */}
            <div className="relative flex-shrink-0 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 cursor-pointer group"
              style={{ width: 'clamp(60px, 15vw, 76px)', aspectRatio: '1/1' }}
              onClick={() => document.getElementById('ki-logo')?.click()}>
              {fotos[0]
                ? <img src={fotos[0]} alt="logo" className="w-full h-full object-contain" />
                : <div className="w-full h-full flex items-center justify-center"><GraduationCap size={20} className="text-violet-300 dark:text-violet-600" /></div>}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={12} className="text-white" />
              </div>
              {uploadingSlot === 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
              <input id="ki-logo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => { const f = e.target.files[0]; if (f) { if (f.size > 2*1024*1024) { toast.error('Foto maks 2MB'); return } uploadFoto(0, f) }; e.target.value = '' }} />
            </div>

            {/* info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">{data.nama_kampus}</p>
              {data.jurusan_impian && (
                <p className="text-[11px] text-violet-500 dark:text-violet-400 font-semibold truncate mt-0.5">{data.jurusan_impian}</p>
              )}
              {data.motivasi && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1 line-clamp-2">{data.motivasi}</p>
              )}
            </div>

            {/* 3 foto bulat — kanan, CRUD langsung, dari foto_p1/p2/p3 */}
            <div className="flex-shrink-0 flex items-center">
              {[0, 1, 2].map((i, idx) => (
                <div key={i} className="relative group cursor-pointer"
                  style={{ marginLeft: idx === 0 ? 0 : -10, zIndex: 3 - idx }}
                  onClick={() => {
                    if (fotosP[i]) setLightboxSrc(fotosP[i])
                    else document.getElementById(`ki-circle-p${i}`)?.click()
                  }}>
                  <div className="rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ width: 'clamp(36px, 9vw, 46px)', height: 'clamp(36px, 9vw, 46px)' }}>
                    {fotosP[i]
                      ? <img src={fotosP[i]} alt={`p${i+1}`} className="w-full h-full object-cover" />
                      : <Camera size={12} className="text-slate-300 dark:text-slate-600" />}
                  </div>
                  {/* hover overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    {fotosP[i]
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      : <Camera size={11} className="text-white" />}
                  </div>
                  {/* X hapus — muncul saat hover */}
                  {fotosP[i] && (
                    <button onClick={e => { e.stopPropagation(); uploadFotoP(i, null) }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <X size={8} className="text-white" />
                    </button>
                  )}
                  {/* upload btn — muncul saat hover kalau ada foto */}
                  {fotosP[i] && (
                    <button onClick={e => { e.stopPropagation(); document.getElementById(`ki-circle-p${i}`)?.click() }}
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-500 border-2 border-white dark:border-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Camera size={7} className="text-white" />
                    </button>
                  )}
                  {uploadingSlotP === i && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  <input id={`ki-circle-p${i}`} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={e => { const f = e.target.files[0]; if (!f) return; if (f.size > 2*1024*1024) { toast.error('Foto maks 2MB'); return } uploadFotoP(i, f); e.target.value = '' }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── FOTO + VIDEO GRID ── */}
          <div className="px-4 pb-3 space-y-1.5">
            {/* 3 foto berjajar */}
            <div className="grid grid-cols-3 gap-1.5" style={{ height: 'clamp(70px, 20vw, 110px)' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="relative rounded-xl overflow-hidden">
                  <FotoBtn id={`ki-f${i}`} src={fotos[i]} uploading={uploadingSlot === i}
                    onUpload={f => uploadFoto(i, f)} onRemove={() => removeFoto(i)}>
                    <Camera size={11} className="text-slate-300 dark:text-slate-600" />
                  </FotoBtn>
                </div>
              ))}
            </div>

            {/* video — satu elemen, background blur via canvas (selalu sinkron) */}
            {videoUrl ? (
              <VideoWithBlur
                src={videoUrl}
                videoRef={videoRef}
                videoMuted={videoMuted}
                setVideoMuted={setVideoMuted}
                uploadingVideo={uploadingVideo}
                onRemove={removeVideo}
                onPlay={() => { if (videoRef.current) { videoRef.current.muted = false; setVideoMuted(false) } }}
              />
            ) : (
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/50 cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/40 dark:hover:bg-violet-900/10 transition-all group">
                <Video size={12} className="text-slate-300 dark:text-slate-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                <span className="text-[10px] text-slate-300 dark:text-slate-600 group-hover:text-violet-400 transition-colors font-medium">
                  {uploadingVideo ? 'Mengupload...' : 'Tambah video (opsional)'}
                </span>
                {uploadingVideo && <div className="w-3 h-3 border-2 border-violet-400/40 border-t-violet-500 rounded-full animate-spin ml-auto"/>}
                <input type="file" accept="video/mp4,video/mov,video/webm" className="hidden"
                  onChange={e => { const f = e.target.files[0]; if (!f) return; if (f.size > 50*1024*1024) { toast.error('Video maks 50MB'); return } uploadVideo(f); e.target.value = '' }} />
              </label>
            )}
          </div>

          {/* ── FOOTER: progress + badge ── */}
          <div className="px-4 pb-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider flex-shrink-0 hidden xs:block">Kehadiran</span>
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pctHadir, 100)}%` }}
                  transition={{ duration: 1.4, ease: 'easeOut', delay: 0.5 }}
                  className="h-full rounded-full" style={{ background: pColor }} />
              </div>
              <span className="text-[11px] font-black tabular-nums flex-shrink-0" style={{ color: pColor }}>{pctHadir}%</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ background: mot.bg, borderColor: mot.border }}>
              <span className="text-sm flex-shrink-0 leading-none">{mot.emoji}</span>
              <p className="text-[11px] font-semibold leading-snug" style={{ color: mot.color }}>{mot.text}</p>
            </div>
          </div>
        </motion.div>

      ) : (
        /* EMPTY STATE */
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 min-h-[200px]">
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          <div className="relative flex flex-col items-center justify-center h-full py-10 px-6 text-center">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/10">
              <GraduationCap size={24} className="text-violet-500 dark:text-violet-400" />
            </motion.div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1 tracking-tight">Mau kuliah di mana?</h4>
            <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mb-4">Tambahkan kampus impianmu sebagai motivasi hadir setiap hari.</p>
            <motion.button onClick={() => setShowAdd(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-xs font-black shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-600 transition-all">
              <Plus size={12} /> Tambah Sekarang
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Confirm Delete */}
      <AnimatePresence>
        {showConfirmDel && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmDel(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={16} className="text-rose-500" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white text-center mb-1">Hapus Kampus Impian?</h4>
              <p className="text-xs text-slate-400 text-center mb-4 leading-relaxed">Semua data dan foto akan dihapus permanen.</p>
              <div className="flex gap-2.5">
                <button onClick={() => setShowConfirmDel(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Batal
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2.5 rounded-2xl bg-rose-500 text-white text-sm font-black hover:bg-rose-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                  {deleting ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menghapus...</> : 'Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
