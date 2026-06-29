import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Download, FileText, Calendar, Filter, FileSpreadsheet,
  Users, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown,
  RefreshCw, BarChart3, Eye, EyeOff, Info, Search, X as XIcon,
} from 'lucide-react'
import { adminApi } from '../../services/adminService'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select'
import ExportPreviewModal from '../../components/ExportPreviewModal'

/* download helper */
async function downloadBlob(apiFn, fileName, mimeType) {
  const response = await apiFn()
  const ct = response.headers?.['content-type'] || ''
  if (ct.includes('application/json')) {
    const text = await response.data.text()
    throw new Error(JSON.parse(text).message || 'Gagal ekspor')
  }
  const blob = new Blob([response.data], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = fileName
  document.body.appendChild(a); a.click(); a.remove()
  window.URL.revokeObjectURL(url)
}

const EXCEL_COLUMNS = [
  { key: 'nis',           label: 'NIS',      mono: true },
  { key: 'nama_lengkap',  label: 'Nama Siswa', bold: true },
  { key: 'kelas',         label: 'Kelas' },
  { key: 'hadir',         label: 'Hadir',     center: true, color: 'text-emerald-600 font-semibold' },
  { key: 'terlambat',     label: 'Terlambat', center: true, color: 'text-amber-600 font-semibold' },
  { key: 'izin',          label: 'Izin',      center: true, color: 'text-blue-600 font-semibold' },
  { key: 'sakit',         label: 'Sakit',     center: true, color: 'text-purple-600 font-semibold' },
  { key: 'alpha',         label: 'Alpha',     center: true, color: 'text-rose-600 font-semibold' },
  { key: 'total_absensi', label: 'Total',     center: true, bold: true },
]

export default function Laporan() {
  const [previewLoading, setPreviewLoading]   = useState(false)
  const [previewData, setPreviewData]         = useState(null)
  const [showPreview, setShowPreview]         = useState(true)
  const [searchQuery, setSearchQuery]         = useState('')
  const [kelasList, setKelasList]             = useState([])
  const [stats, setStats]                     = useState({ total_absensi:0, hadir:0, sakit:0, izin:0, alpha:0, terlambat:0 })

  // modal state
  const [modal, setModal]                     = useState({ open: false, type: 'pdf' }) // 'pdf'|'excel'
  const [pdfBlobUrl, setPdfBlobUrl]           = useState(null)
  const [pdfLoading, setPdfLoading]           = useState(false)
  const [pdfError, setPdfError]               = useState(null)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const pdfBlobRef                            = useRef(null)  // track blob untuk revoke

  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(1)),
    end_date:   new Date(),
    kelas_id:   '',
  })

  useEffect(() => { fetchKelas(); fetchPreview() }, [])
  useEffect(() => { fetchPreview() }, [filters.start_date, filters.end_date, filters.kelas_id])

  // Revoke blob URL saat unmount
  useEffect(() => () => { if (pdfBlobRef.current) window.URL.revokeObjectURL(pdfBlobRef.current) }, [])

  const fetchKelas = async () => {
    try {
      const res = await adminApi.getAllKelas()
      setKelasList(res.data.data.map(k => ({ value: k.id, label: `${k.nama_kelas} - ${k.jurusan?.nama_jurusan || ''}` })))
    } catch {}
  }

  const getParams = useCallback(() => {
    const p = {
      start_date: filters.start_date.toISOString().split('T')[0],
      end_date:   filters.end_date.toISOString().split('T')[0],
    }
    if (filters.kelas_id) p.kelas_id = filters.kelas_id
    return p
  }, [filters])

  const fetchPreview = useCallback(async () => {
    setPreviewLoading(true)
    try {
      const res  = await adminApi.getLaporanBulanan(getParams())
      const data = res.data.data || []
      setPreviewData(data)
      setStats({
        total_absensi: data.reduce((s,i) => s + (i.total_absensi||0), 0),
        hadir:         data.reduce((s,i) => s + (i.hadir||0), 0),
        sakit:         data.reduce((s,i) => s + (i.sakit||0), 0),
        izin:          data.reduce((s,i) => s + (i.izin||0), 0),
        alpha:         data.reduce((s,i) => s + (i.alpha||0), 0),
        terlambat:     data.reduce((s,i) => s + (i.terlambat||0), 0),
      })
    } catch { toast.error('Gagal memuat data preview') }
    finally { setPreviewLoading(false) }
  }, [getParams])

  /* ─── Buka modal PDF: load preview PDF dulu ─── */
  const openPdfModal = async () => {
    setModal({ open: true, type: 'pdf' })
    setPdfError(null)
    setPdfLoading(true)
    if (pdfBlobRef.current) { window.URL.revokeObjectURL(pdfBlobRef.current); pdfBlobRef.current = null }
    setPdfBlobUrl(null)
    try {
      const res = await adminApi.previewPdf(getParams())
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url  = window.URL.createObjectURL(blob)
      pdfBlobRef.current = url
      setPdfBlobUrl(url)
    } catch (e) {
      setPdfError(e.message || 'Gagal generate preview PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  /* ─── Buka modal Excel ─── */
  const openExcelModal = () => setModal({ open: true, type: 'excel' })

  /* ─── Close modal ─── */
  const closeModal = () => {
    setModal(m => ({ ...m, open: false }))
  }

  /* ─── Download dari dalam modal ─── */
  const handleDownload = async (format) => {
    setDownloadLoading(true)
    const p = getParams()
    const sDate = p.start_date, eDate = p.end_date
    try {
      if (format === 'pdf') {
        await downloadBlob(() => adminApi.exportPdf(p), `Laporan-Absensi-${sDate}-sd-${eDate}.pdf`, 'application/pdf')
      } else {
        await downloadBlob(() => adminApi.exportExcel(p), `Laporan-Absensi-${sDate}-sd-${eDate}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      }
      toast.success(`Berhasil diunduh!`)
    } catch (e) {
      toast.error(e.message || 'Gagal mengunduh')
    } finally {
      setDownloadLoading(false)
    }
  }

  const quickFilter = (type) => {
    const today = new Date()
    const map = {
      today: [new Date(), new Date()],
      week:  [new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), new Date()],
      month: [new Date(today.getFullYear(), today.getMonth(), 1), new Date()],
      year:  [new Date(today.getFullYear(), 0, 1), new Date()],
    }
    const [s,e] = map[type]
    setFilters(f => ({ ...f, start_date: s, end_date: e }))
  }

  const pct = (v) => stats.total_absensi === 0 ? 0 : Math.round((v / stats.total_absensi) * 100)
  const dateRange = () => {
    const fmt = (d) => d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
    return `${fmt(filters.start_date)} – ${fmt(filters.end_date)}`
  }

  const filteredPreview = (previewData||[]).filter(item => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (item.nama_lengkap||'').toLowerCase().includes(q) ||
           (item.nis||'').toLowerCase().includes(q) ||
           (item.kelas||'').toLowerCase().includes(q)
  })

  const QUICK_FILTERS = [
    { key:'today', label:'Hari Ini' }, { key:'week', label:'Minggu Ini' },
    { key:'month', label:'Bulan Ini' }, { key:'year', label:'Tahun Ini' },
  ]

  const STAT_CARDS = [
    { label:'Total',     value:stats.total_absensi, pctVal:null,              color:'slate',   Icon:Users },
    { label:'Hadir',     value:stats.hadir,         pctVal:pct(stats.hadir),  color:'emerald', Icon:CheckCircle },
    { label:'Terlambat', value:stats.terlambat,     pctVal:pct(stats.terlambat), color:'amber', Icon:Clock },
    { label:'Izin',      value:stats.izin,          pctVal:pct(stats.izin),   color:'blue',    Icon:FileText },
    { label:'Sakit',     value:stats.sakit,         pctVal:pct(stats.sakit),  color:'purple',  Icon:AlertCircle },
    { label:'Alpha',     value:stats.alpha,         pctVal:pct(stats.alpha),  color:'rose',    Icon:XCircle },
  ]

  const colorMap = {
    slate:   { card:'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700', label:'text-slate-500 dark:text-slate-400', val:'text-slate-900 dark:text-white', icon:'bg-teal-50 dark:bg-teal-900/20', iconColor:'text-teal-600' },
    emerald: { card:'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', label:'text-emerald-600', val:'text-emerald-700 dark:text-emerald-300', icon:'bg-white dark:bg-slate-800', iconColor:'text-emerald-600' },
    amber:   { card:'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',         label:'text-amber-600',   val:'text-amber-700 dark:text-amber-300',   icon:'bg-white dark:bg-slate-800', iconColor:'text-amber-600' },
    blue:    { card:'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',             label:'text-blue-600',    val:'text-blue-700 dark:text-blue-300',     icon:'bg-white dark:bg-slate-800', iconColor:'text-blue-600' },
    purple:  { card:'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',     label:'text-purple-600',  val:'text-purple-700 dark:text-purple-300', icon:'bg-white dark:bg-slate-800', iconColor:'text-purple-600' },
    rose:    { card:'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',             label:'text-rose-600',    val:'text-rose-700 dark:text-rose-300',     icon:'bg-white dark:bg-slate-800', iconColor:'text-rose-600' },
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 px-2 sm:px-0">

      {/* ── Preview Modal ── */}
      <ExportPreviewModal
        isOpen={modal.open}
        onClose={closeModal}
        type={modal.type}
        title={`Laporan Absensi Siswa`}
        subtitle={`Preview sebelum mengunduh`}
        meta={{ periode: dateRange(), jumlah: previewData?.length }}
        pdfBlobUrl={pdfBlobUrl}
        pdfLoading={pdfLoading}
        pdfError={pdfError}
        onRetryPdf={openPdfModal}
        excelColumns={EXCEL_COLUMNS}
        excelData={previewData || []}
        onDownload={handleDownload}
        downloadLoading={downloadLoading}
        fileName={`Laporan-Absensi-${getParams().start_date}-sd-${getParams().end_date}`}
      />

      {/* Header */}
      <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-xl"><BarChart3 size={18} className="text-teal-600" /></div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Laporan Absensi Siswa</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Export dan analisis data absensi siswa</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs text-slate-600 dark:text-slate-400">
          <Calendar size={13} className="text-teal-500" /> Periode: {dateRange()}
        </div>
      </motion.div>

      {/* Quick Filters */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map(f => (
          <button key={f.key} onClick={() => quickFilter(f.key)}
            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 dark:hover:bg-teal-900/20 transition-all">
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Stat Cards */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {STAT_CARDS.map(({ label, value, pctVal, color, Icon }) => {
          const c = colorMap[color]
          return (
            <div key={label} className={`rounded-xl p-3 md:p-4 border shadow-sm ${c.card}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs truncate ${c.label}`}>{label}</p>
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${c.icon}`}><Icon size={12} className={c.iconColor} /></div>
              </div>
              <p className={`text-lg md:text-xl font-bold truncate ${c.val}`}>{previewLoading ? '...' : value}</p>
              {pctVal !== null && <p className={`text-xs mt-1 ${c.label}`}>{pctVal}%</p>}
            </div>
          )
        })}
      </motion.div>

      {/* Filter Section */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg"><Filter size={14} className="text-teal-600" /></div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Filter Laporan</h3>
          {filters.kelas_id && (
            <span className="ml-auto px-2 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-xs font-medium rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-1">
              <Info size={10}/> {kelasList.find(k => k.value === filters.kelas_id)?.label}
              <button onClick={() => setFilters(f => ({ ...f, kelas_id:'' }))} className="ml-1 hover:text-rose-500"><XIcon size={10}/></button>
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"><Calendar size={11} className="inline mr-1"/>Tanggal Mulai</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={12}/>
                <DatePicker selected={filters.start_date} onChange={d => setFilters(f => ({ ...f, start_date:d }))}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  dateFormat="dd/MM/yyyy" maxDate={filters.end_date}/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"><Calendar size={11} className="inline mr-1"/>Tanggal Selesai</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={12}/>
                <DatePicker selected={filters.end_date} onChange={d => setFilters(f => ({ ...f, end_date:d }))}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  dateFormat="dd/MM/yyyy" minDate={filters.start_date} maxDate={new Date()}/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"><Users size={11} className="inline mr-1"/>Kelas (Opsional)</label>
              <Select options={kelasList} value={kelasList.find(k => k.value === filters.kelas_id)||null}
                onChange={opt => setFilters(f => ({ ...f, kelas_id:opt?.value||'' }))}
                placeholder="Semua Kelas" isClearable isSearchable menuPortalTarget={document.body} menuPosition="fixed"
                className="text-sm" classNamePrefix="react-select"
                styles={{ control: b => ({ ...b, borderRadius:'0.75rem', borderColor:'#e2e8f0', minHeight:'38px', boxShadow:'none', '&:hover':{ borderColor:'#14b8a6' } }), menuPortal: b => ({ ...b, zIndex:9999 }) }}/>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Preview (ringkas) */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg"><Eye size={14} className="text-teal-600"/></div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Data {previewData ? `(${filteredPreview.length}${searchQuery ? ` dari ${previewData.length}` : ''} Siswa)` : ''}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchPreview} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Refresh">
              <RefreshCw size={14} className={`text-slate-400 ${previewLoading ? 'animate-spin' : ''}`}/>
            </button>
            <button onClick={() => setShowPreview(v => !v)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showPreview ? 'rotate-180' : ''}`}/>
            </button>
          </div>
        </div>
        {showPreview && (
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa, NIS, atau kelas..."
                className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all"/>
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><XIcon size={14}/></button>}
            </div>
            {previewLoading ? (
              <div className="py-8 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-teal-500"/><p className="text-sm text-slate-500 mt-2">Memuat data...</p></div>
            ) : filteredPreview.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full min-w-[640px] text-xs">
                  <thead><tr className="bg-slate-50 dark:bg-slate-700/50">
                    {['No','NIS','Nama Siswa','Kelas','H','T','I','S','A','Total'].map((h,i) => (
                      <th key={h} className={`py-2.5 px-3 font-semibold ${i>=4?'text-center '+['text-emerald-600','text-amber-600','text-blue-600','text-purple-600','text-rose-600','text-slate-600'][i-4]:'text-left text-slate-600 dark:text-slate-300'}`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredPreview.slice(0,10).map((item,i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-2 px-3 text-slate-400">{i+1}</td>
                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">{item.nis}</td>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-white max-w-[130px] truncate">{item.nama_lengkap}</td>
                        <td className="py-2 px-3 text-slate-500 max-w-[80px] truncate">{item.kelas}</td>
                        <td className="py-2 px-3 text-center font-semibold text-emerald-600">{item.hadir||0}</td>
                        <td className="py-2 px-3 text-center font-semibold text-amber-600">{item.terlambat||0}</td>
                        <td className="py-2 px-3 text-center font-semibold text-blue-600">{item.izin||0}</td>
                        <td className="py-2 px-3 text-center font-semibold text-purple-600">{item.sakit||0}</td>
                        <td className="py-2 px-3 text-center font-semibold text-rose-600">{item.alpha||0}</td>
                        <td className="py-2 px-3 text-center font-bold text-slate-900 dark:text-white">{item.total_absensi||0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  {searchQuery ? <Search size={20} className="text-slate-400"/> : <EyeOff size={20} className="text-slate-400"/>}
                </div>
                <p className="text-sm text-slate-500">{searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Tidak ada data untuk periode ini'}</p>
              </div>
            )}
            {!previewLoading && filteredPreview.length > 10 && (
              <p className="text-xs text-slate-400 text-center">Menampilkan 10 dari {filteredPreview.length}. Klik Preview untuk lihat semua.</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Export Buttons */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PDF */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl"><FileText size={16} className="text-rose-600"/></div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Export PDF</h3>
                <p className="text-xs text-slate-500 mt-0.5">Preview → cetak atau unduh</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-lg">.pdf</span>
          </div>
          <button onClick={openPdfModal} disabled={!previewData || previewData.length === 0}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Eye size={14}/> Preview &amp; Download PDF
          </button>
        </div>

        {/* Excel */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"><FileSpreadsheet size={16} className="text-emerald-600"/></div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Export Excel</h3>
                <p className="text-xs text-slate-500 mt-0.5">Preview tabel → unduh spreadsheet</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg">.xlsx</span>
          </div>
          <button onClick={openExcelModal} disabled={!previewData || previewData.length === 0}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Eye size={14}/> Preview &amp; Download Excel
          </button>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
        className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-teal-200 dark:border-teal-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl flex-shrink-0"><Info size={14} className="text-teal-600"/></div>
          <div>
            <p className="text-sm font-semibold text-teal-800 dark:text-teal-200 mb-1">Keterangan Kolom</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span><strong className="text-emerald-600">H</strong> = Hadir</span>
              <span><strong className="text-amber-600">T</strong> = Terlambat</span>
              <span><strong className="text-blue-600">I</strong> = Izin</span>
              <span><strong className="text-purple-600">S</strong> = Sakit</span>
              <span><strong className="text-rose-600">A</strong> = Alpha</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
