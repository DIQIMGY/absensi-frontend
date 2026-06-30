/**
 * DetailAbsensiModal — Laporan detail absensi per individu (siswa / guru)
 * Desain: header identitas, ringkasan statistik, tabel harian
 * Fitur: Preview PDF (iframe) + Download PDF
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Calendar, ChevronLeft, ChevronRight, RefreshCw,
  CalendarDays, User, GraduationCap, Hash, BookOpen,
  FileText, Download, Loader2, AlertTriangle, Printer,
} from 'lucide-react'
import { adminApi } from '../services/adminService'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import toast from 'react-hot-toast'

const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]

const STATUS = {
  hadir:     { label:'Hadir',     cls:'text-emerald-600 font-semibold' },
  terlambat: { label:'Terlambat', cls:'text-amber-500 font-semibold' },
  izin:      { label:'Izin',      cls:'text-blue-500 font-semibold' },
  sakit:     { label:'Sakit',     cls:'text-purple-500 font-semibold' },
  alpha:     { label:'Alpha',     cls:'text-rose-600 font-bold' },
}

function StatCard({ label, value, color }) {
  const cls = {
    slate:   'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    amber:   'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    blue:    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    purple:  'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    rose:    'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
  }
  return (
    <div className={`rounded-xl border px-3 py-2.5 text-center ${cls[color]}`}>
      <div className="text-2xl font-black leading-none">{value}</div>
      <div className="text-[10px] font-semibold mt-1 opacity-70 uppercase tracking-wide">{label}</div>
    </div>
  )
}

/* ─── Sub-modal: PDF Viewer ─── */
function PdfViewerModal({ isOpen, onClose, blobUrl, loading, error, onRetry, onDownload, downloadLoading, title }) {
  useEffect(() => {
    if (!isOpen) return
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-5"
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative flex flex-col bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-10 overflow-hidden"
            style={{ height: '90dvh' }}
            initial={{ scale:0.96, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.96, y:16 }}
            transition={{ type:'spring', stiffness:300, damping:30 }}
            onClick={e => e.stopPropagation()}>

            {/* header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-rose-50 dark:bg-rose-950/30 flex-shrink-0">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl flex-shrink-0">
                <FileText size={16} className="text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{title}</p>
                <p className="text-xs text-slate-500">Preview PDF — gunakan toolbar browser untuk zoom &amp; print</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* content */}
            <div className="flex-1 min-h-0 bg-slate-100 dark:bg-slate-800">
              {loading ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                      <FileText size={24} className="text-rose-400" />
                    </div>
                    <div className="absolute -inset-1 rounded-2xl border-2 border-rose-400/60 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Menyiapkan PDF...</p>
                </div>
              ) : error ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <AlertTriangle size={24} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Gagal memuat PDF</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">{error}</p>
                  </div>
                  <button onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">
                    <RefreshCw size={13} /> Coba Lagi
                  </button>
                </div>
              ) : blobUrl ? (
                <iframe
                  src={`${blobUrl}#toolbar=1&navpanes=0&view=FitH`}
                  className="w-full h-full border-0"
                  title="Preview PDF"
                />
              ) : null}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
              <button onClick={onClose}
                className="px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                Kembali
              </button>
              <div className="flex items-center gap-2">
                {blobUrl && !loading && !error && (
                  <button onClick={() => window.open(blobUrl, '_blank')?.focus()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors">
                    <Printer size={13} /> Print
                  </button>
                )}
                <button onClick={onDownload} disabled={downloadLoading || loading || !!error || !blobUrl}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25">
                  {downloadLoading
                    ? <><Loader2 size={13} className="animate-spin" /> Mengunduh...</>
                    : <><Download size={13} /> Download PDF</>
                  }
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Main Modal ─── */
export default function DetailAbsensiModal({ isOpen, onClose, type = 'siswa', id, nama }) {
  const isSiswa = type === 'siswa'

  // filter state
  const [filterMode, setFilterMode] = useState('bulan')
  const [bulan, setBulan]           = useState(new Date().getMonth() + 1)
  const [tahun, setTahun]           = useState(new Date().getFullYear())
  const [startDate, setStartDate]   = useState(new Date(new Date().setDate(1)))
  const [endDate, setEndDate]       = useState(new Date())

  // data state
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // PDF state
  const [pdfOpen, setPdfOpen]             = useState(false)
  const [pdfBlob, setPdfBlob]             = useState(null)
  const [pdfLoading, setPdfLoading]       = useState(false)
  const [pdfError, setPdfError]           = useState(null)
  const [dlLoading, setDlLoading]         = useState(false)
  const pdfBlobRef                        = useRef(null)

  // scroll lock + ESC
  useEffect(() => {
    if (!isOpen) return
    const fn = e => { if (e.key === 'Escape' && !pdfOpen) onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [isOpen, onClose, pdfOpen])

  // revoke blob on unmount
  useEffect(() => () => { if (pdfBlobRef.current) window.URL.revokeObjectURL(pdfBlobRef.current) }, [])

  // build params dari current filter state
  const getFilterParams = useCallback(() => {
    const p = { mode: filterMode }
    if (filterMode === 'range') {
      p.start_date = startDate.toISOString().split('T')[0]
      p.end_date   = endDate.toISOString().split('T')[0]
    } else {
      p.bulan = bulan; p.tahun = tahun
    }
    return p
  }, [filterMode, bulan, tahun, startDate, endDate])

  const fetchDetail = useCallback(async () => {
    if (!id) return
    setLoading(true); setError(null)
    try {
      const res = isSiswa
        ? await adminApi.getLaporanPerSiswa(id, getFilterParams())
        : await adminApi.getLaporanDetailGuru(id, getFilterParams())
      setData(res.data.data)
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal memuat data')
    } finally { setLoading(false) }
  }, [id, isSiswa, getFilterParams])

  useEffect(() => { if (isOpen && id) fetchDetail() }, [isOpen, id, fetchDetail])

  // buka preview PDF
  const openPdf = async () => {
    setPdfOpen(true); setPdfError(null); setPdfLoading(true)
    if (pdfBlobRef.current) { window.URL.revokeObjectURL(pdfBlobRef.current); pdfBlobRef.current = null }
    setPdfBlob(null)
    try {
      const res  = isSiswa
        ? await adminApi.previewSiswaPdf(id, getFilterParams())
        : await adminApi.previewGuruDetailPdf(id, getFilterParams())
      const ct   = res.headers?.['content-type'] || ''
      if (ct.includes('application/json')) {
        const txt = await res.data.text()
        throw new Error(JSON.parse(txt).message || 'Gagal generate PDF')
      }
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      pdfBlobRef.current = url
      setPdfBlob(url)
    } catch (e) {
      setPdfError(e.message || 'Gagal generate PDF')
    } finally { setPdfLoading(false) }
  }

  // download PDF langsung
  const downloadPdf = async () => {
    setDlLoading(true)
    try {
      const res = isSiswa
        ? await adminApi.exportSiswaPdf(id, getFilterParams())
        : await adminApi.exportGuruDetailPdf(id, getFilterParams())
      const ct = res.headers?.['content-type'] || ''
      if (ct.includes('application/json')) {
        const txt = await res.data.text()
        throw new Error(JSON.parse(txt).message || 'Gagal download')
      }
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a    = document.createElement('a')
      const nm   = data?.[isSiswa?'siswa':'guru']?.nama ?? 'laporan'
      a.href = url; a.download = `Detail-Absensi-${nm}-${new Date().toISOString().slice(0,10)}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('PDF berhasil diunduh!')
    } catch (e) {
      toast.error(e.message || 'Gagal mengunduh PDF')
    } finally { setDlLoading(false) }
  }

  const prevMonth = () => { if (bulan===1){setBulan(12);setTahun(y=>y-1)}else setBulan(b=>b-1) }
  const nextMonth = () => { if (bulan===12){setBulan(1);setTahun(y=>y+1)}else setBulan(b=>b+1) }
  const YEARS = Array.from({ length:10 }, (_,i) => new Date().getFullYear()-4+i)

  const person  = data?.siswa ?? data?.guru
  const records = data?.records ?? []
  const stat    = data?.statistik ?? {}

  const periodLabel = filterMode === 'range'
    ? `${startDate.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})} s/d ${endDate.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}`
    : `${MONTHS[bulan-1]} ${tahun}`

  const pdfTitle = `Detail Absensi ${isSiswa?'Siswa':'Guru'} — ${person?.nama ?? nama ?? ''}`

  return (
    <>
      {/* PDF sub-modal */}
      <PdfViewerModal
        isOpen={pdfOpen} onClose={() => setPdfOpen(false)}
        blobUrl={pdfBlob} loading={pdfLoading} error={pdfError}
        onRetry={openPdf} onDownload={downloadPdf} downloadLoading={dlLoading}
        title={pdfTitle}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              className="relative flex flex-col bg-white dark:bg-slate-900 w-full sm:max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 z-10 max-h-[95dvh] sm:max-h-[90vh]"
              initial={{ y:50, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:50, opacity:0 }}
              transition={{ type:'spring', stiffness:300, damping:30 }}
              onClick={e => e.stopPropagation()}>

              {/* drag handle mobile */}
              <div className="flex justify-center pt-2.5 pb-0.5 sm:hidden flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>

              {/* TOP BAR */}
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className={`p-2 rounded-xl flex-shrink-0 ${isSiswa?'bg-teal-100 dark:bg-teal-900/40':'bg-indigo-100 dark:bg-indigo-900/40'}`}>
                  <FileText size={16} className={isSiswa?'text-teal-600':'text-indigo-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                    Detail Absensi {isSiswa?'Siswa':'Guru'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{periodLabel}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0">
                  <X size={16} className="text-slate-500" />
                </button>
              </div>

              {/* FILTER BAR */}
              <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* mode toggle */}
                  <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 gap-0.5 flex-shrink-0">
                    {[{key:'bulan',icon:Calendar,label:'Bulan'},{key:'range',icon:CalendarDays,label:'Rentang'}].map(({key,icon:Icon,label})=>(
                      <button key={key} onClick={()=>setFilterMode(key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterMode===key?(isSiswa?'bg-teal-500':'bg-indigo-500')+' text-white shadow-sm':'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        <Icon size={12}/> {label}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    {filterMode==='bulan' ? (
                      <>
                        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex-shrink-0"><ChevronLeft size={14} className="text-slate-500"/></button>
                        <select value={bulan} onChange={e=>setBulan(+e.target.value)}
                          className="flex-1 py-1.5 px-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none min-w-0">
                          {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                        </select>
                        <select value={tahun} onChange={e=>setTahun(+e.target.value)}
                          className="w-20 py-1.5 px-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none flex-shrink-0">
                          {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                        </select>
                        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex-shrink-0"><ChevronRight size={14} className="text-slate-500"/></button>
                      </>
                    ) : (
                      <>
                        <div className="relative flex-1">
                          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={11}/>
                          <DatePicker selected={startDate} onChange={d=>setStartDate(d)}
                            className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            dateFormat="dd/MM/yy" maxDate={endDate}/>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">s/d</span>
                        <div className="relative flex-1">
                          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={11}/>
                          <DatePicker selected={endDate} onChange={d=>setEndDate(d)}
                            className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            dateFormat="dd/MM/yy" minDate={startDate} maxDate={new Date()}/>
                        </div>
                      </>
                    )}
                    <button onClick={fetchDetail} disabled={loading} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex-shrink-0">
                      <RefreshCw size={13} className={`text-slate-400 ${loading?'animate-spin':''}`}/>
                    </button>
                  </div>
                </div>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50 dark:bg-slate-950">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="relative w-14 h-14">
                      <div className={`absolute inset-0 rounded-2xl flex items-center justify-center ${isSiswa?'bg-teal-100 dark:bg-teal-900/30':'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                        <FileText size={24} className={isSiswa?'text-teal-400':'text-indigo-400'}/>
                      </div>
                      <div className={`absolute -inset-1 rounded-2xl border-2 border-t-transparent animate-spin ${isSiswa?'border-teal-400/60':'border-indigo-400/60'}`}/>
                    </div>
                    <p className="text-sm text-slate-500">Memuat laporan...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 px-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                      <X size={24} className="text-rose-500"/>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Gagal memuat data</p>
                    <p className="text-xs text-slate-400">{error}</p>
                    <button onClick={fetchDetail} className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-medium transition-colors">
                      <RefreshCw size={12}/> Coba Lagi
                    </button>
                  </div>
                ) : !data ? null : (
                  <div className="p-4 sm:p-5 md:p-6 space-y-4">

                    {/* Kartu Identitas */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                      <div className={`h-1.5 ${isSiswa?'bg-gradient-to-r from-teal-400 to-emerald-500':'bg-gradient-to-r from-indigo-400 to-violet-500'}`}/>
                      <div className="p-4 sm:p-5 flex items-center gap-4">
                        {person?.foto ? (
                          <img src={person.foto} alt={person.nama} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow-md flex-shrink-0"/>
                        ) : (
                          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-md ${isSiswa?'bg-gradient-to-br from-teal-400 to-emerald-600':'bg-gradient-to-br from-indigo-400 to-violet-600'}`}>
                            {(person?.nama ?? nama ?? '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">{person?.nama ?? nama}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                            {isSiswa ? (
                              <>
                                <span className="flex items-center gap-1.5 text-xs text-slate-500"><Hash size={11} className="text-slate-400"/>NIS: <strong className="text-slate-700 dark:text-slate-200">{person?.nis??'-'}</strong></span>
                                <span className="flex items-center gap-1.5 text-xs text-slate-500"><GraduationCap size={11} className="text-slate-400"/>Kelas: <strong className="text-slate-700 dark:text-slate-200">{person?.kelas??'-'}</strong></span>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center gap-1.5 text-xs text-slate-500"><Hash size={11} className="text-slate-400"/>NIP: <strong className="text-slate-700 dark:text-slate-200">{person?.nip??'-'}</strong></span>
                                <span className="flex items-center gap-1.5 text-xs text-slate-500"><BookOpen size={11} className="text-slate-400"/>Mapel: <strong className="text-slate-700 dark:text-slate-200">{person?.mata_pelajaran??'-'}</strong></span>
                                <span className="flex items-center gap-1.5 text-xs text-slate-500"><User size={11} className="text-slate-400"/>Jabatan: <strong className="text-slate-700 dark:text-slate-200">{person?.jabatan??'-'}</strong></span>
                              </>
                            )}
                          </div>
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-500">
                            <Calendar size={10}/> Periode: <strong className="text-slate-700 dark:text-slate-200">{periodLabel}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ringkasan Statistik */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Ringkasan Statistik</h4>
                      </div>
                      <div className={`p-4 sm:p-5 grid gap-3 ${isSiswa?'grid-cols-3 sm:grid-cols-6':'grid-cols-2 sm:grid-cols-4'}`}>
                        <StatCard label="Total"     value={stat.total??0}     color="slate"/>
                        <StatCard label="Hadir"     value={stat.hadir??0}     color="emerald"/>
                        <StatCard label="Terlambat" value={stat.terlambat??0} color="amber"/>
                        {isSiswa && <StatCard label="Izin"  value={stat.izin??0}  color="blue"/>}
                        {isSiswa && <StatCard label="Sakit" value={stat.sakit??0} color="purple"/>}
                        <StatCard label="Alpha" value={stat.alpha??0} color="rose"/>
                      </div>
                    </div>

                    {/* Tabel Harian */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Rincian Kehadiran
                          <span className="ml-2 text-xs font-normal text-slate-400">({records.length} hari tercatat)</span>
                        </h4>
                      </div>
                      {records.length === 0 ? (
                        <div className="py-16 text-center">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3"><CalendarDays size={22} className="text-slate-400"/></div>
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tidak ada data</p>
                          <p className="text-xs text-slate-400 mt-1">Belum ada absensi pada {periodLabel}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs" style={{ minWidth: isSiswa?'700px':'620px' }}>
                            <thead>
                              <tr className={isSiswa?'bg-teal-600 text-white':'bg-indigo-600 text-white'}>
                                {['No','Tanggal','Hari','Status','Masuk','Pulang','Terlambat','Keterangan','Metode'].map((h,i)=>(
                                  <th key={h} className={`px-3 py-3 font-semibold border-r border-white/20 last:border-r-0 ${i===0?'text-center w-10':i>=4&&i<=6?'text-center':'text-left'}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {records.map((rec,i)=>{
                                const sc = STATUS[rec.status]||STATUS.alpha
                                return (
                                  <tr key={rec.id??i} className={`border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-blue-50/40 dark:hover:bg-slate-800/60 ${i%2===0?'bg-white dark:bg-slate-900':'bg-slate-50/70 dark:bg-slate-800/30'}`}>
                                    <td className="px-3 py-2.5 text-center text-slate-400 font-mono border-r border-slate-100 dark:border-slate-800">{i+1}</td>
                                    <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-800">{rec.tanggal}</td>
                                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap border-r border-slate-100 dark:border-slate-800">{rec.hari}</td>
                                    <td className="px-3 py-2.5 text-center border-r border-slate-100 dark:border-slate-800">
                                      <span className={sc.cls}>{sc.label}</span>
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-mono text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                                      {rec.jam_masuk||<span className="text-slate-300 dark:text-slate-600">—</span>}
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-mono text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                                      {rec.jam_pulang||<span className="text-slate-300 dark:text-slate-600">—</span>}
                                    </td>
                                    <td className="px-3 py-2.5 text-center border-r border-slate-100 dark:border-slate-800">
                                      {(rec.menit_keterlambatan??0)>0
                                        ?<span className="text-amber-600 font-semibold">{rec.menit_keterlambatan} mnt</span>
                                        :<span className="text-slate-300 dark:text-slate-600">—</span>}
                                    </td>
                                    <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 max-w-[140px] truncate border-r border-slate-100 dark:border-slate-800">
                                      {rec.keterangan&&rec.keterangan!=='-'?rec.keterangan:<span className="text-slate-300 dark:text-slate-600">—</span>}
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      <span className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded capitalize text-[10px]">
                                        {rec.metode&&rec.metode!=='-'?rec.metode.replace('_',' '):'—'}
                                      </span>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-600">
                                <td colSpan={3} className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-300 font-bold text-xs">Total</td>
                                <td className="px-3 py-2.5 text-center text-slate-700 dark:text-slate-200 font-bold text-xs">{records.length} hari</td>
                                <td colSpan={2} className="px-3 py-2.5"/>
                                <td className="px-3 py-2.5 text-center text-amber-600 font-bold text-xs">
                                  {records.filter(r=>(r.menit_keterlambatan??0)>0).length > 0 ? `${records.filter(r=>(r.menit_keterlambatan??0)>0).length}x` : '—'}
                                </td>
                                <td colSpan={2} className="px-3 py-2.5"/>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
                <p className="text-xs text-slate-400 truncate min-w-0">
                  {data ? `${records.length} record • ${periodLabel}` : 'Detail Absensi'}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Satu tombol Download — buka preview dulu, download dari dalam preview */}
                  <button
                    onClick={openPdf}
                    disabled={!data || records.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-rose-500/20">
                    <Download size={13}/> Download PDF
                  </button>
                  <button onClick={onClose}
                    className="px-3 sm:px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                    Tutup
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
