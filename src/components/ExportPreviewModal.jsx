/**
 * ExportPreviewModal
 * Modal preview sebelum download — support PDF (iframe) dan Excel (tabel HTML)
 *
 * Props:
 *   isOpen        boolean
 *   onClose       () => void
 *   type          'pdf' | 'excel'
 *   title         string           — judul laporan
 *   subtitle      string           — sub info (periode, dll)
 *   meta          object           — { periode, jumlah, format }
 *   pdfBlobUrl    string|null      — object URL dari PDF blob (untuk iframe)
 *   pdfLoading    boolean
 *   pdfError      string|null
 *   excelColumns  array            — [{ key, label, color? }]
 *   excelData     array            — rows data
 *   onDownload    (format) => void — 'pdf' | 'excel'
 *   downloadLoading boolean
 *   fileName      string
 */
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Download, Printer, FileText, FileSpreadsheet,
  Loader2, AlertTriangle, Search, ChevronLeft, ChevronRight,
  RefreshCw, ZoomIn
} from 'lucide-react'

/* ─── Excel Preview Table ─── */
function ExcelTable({ columns, data, fileName }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  const filtered = data.filter(row =>
    columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase()))
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  useEffect(() => setPage(1), [search])

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari data..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <span className="text-xs text-slate-500 ml-auto whitespace-nowrap">
          {filtered.length} baris • halaman {page}/{totalPages}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse min-w-max">
          <thead className="sticky top-0 z-10">
            <tr className="bg-emerald-600 text-white">
              <th className="px-3 py-2.5 text-center font-semibold border border-emerald-500 w-10">No</th>
              {columns.map(col => (
                <th key={col.key} className="px-3 py-2.5 text-left font-semibold border border-emerald-500 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-slate-400">
                  {search ? `Tidak ada hasil untuk "${search}"` : 'Tidak ada data'}
                </td>
              </tr>
            ) : paged.map((row, i) => (
              <tr key={i} className={`${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/70 dark:bg-slate-800/40'} hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors`}>
                <td className="px-3 py-2 text-center text-slate-400 border border-slate-100 dark:border-slate-700 font-mono">
                  {(page - 1) * PER_PAGE + i + 1}
                </td>
                {columns.map(col => (
                  <td key={col.key} className={`px-3 py-2 border border-slate-100 dark:border-slate-700 ${col.center ? 'text-center' : ''} ${col.color ? col.color : 'text-slate-700 dark:text-slate-300'} ${col.mono ? 'font-mono' : ''} ${col.bold ? 'font-bold' : ''}`}>
                    {row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft size={12} /> Prev
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${p === page ? 'bg-emerald-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
                  {p}
                </button>
              )
            })}
          </div>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 transition-colors">
            Next <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Main Modal ─── */
export default function ExportPreviewModal({
  isOpen, onClose,
  type = 'pdf',           // 'pdf' | 'excel'
  title = 'Laporan',
  subtitle = '',
  meta = {},              // { periode, jumlah, format }
  pdfBlobUrl = null,
  pdfLoading = false,
  pdfError = null,
  onRetryPdf,
  excelColumns = [],
  excelData = [],
  onDownload,
  downloadLoading = false,
  fileName = 'laporan',
}) {
  const isPdf = type === 'pdf'
  const overlayRef = useRef(null)

  // Tutup dengan Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll saat modal terbuka
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handlePrint = () => {
    if (!pdfBlobUrl) return
    const win = window.open(pdfBlobUrl, '_blank')
    win?.focus()
    // Biarkan browser handle print dari tab baru
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[999] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          {/* Modal Panel */}
          <motion.div
            className="relative flex flex-col w-full h-full max-w-6xl mx-auto my-4 sm:my-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
            initial={{ scale: 0.96, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className={`flex items-center gap-4 px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 ${isPdf ? 'bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40' : 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40'}`}>
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${isPdf ? 'bg-rose-100 dark:bg-rose-900/50' : 'bg-emerald-100 dark:bg-emerald-900/50'}`}>
                {isPdf
                  ? <FileText size={20} className="text-rose-600 dark:text-rose-400" />
                  : <FileSpreadsheet size={20} className="text-emerald-600 dark:text-emerald-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">{title}</h2>
                {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{subtitle}</p>}
              </div>

              {/* Meta pills */}
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                {meta.periode && (
                  <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 whitespace-nowrap">
                    📅 {meta.periode}
                  </span>
                )}
                {meta.jumlah !== undefined && (
                  <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 whitespace-nowrap">
                    👥 {meta.jumlah} data
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap ${isPdf ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'}`}>
                  {isPdf ? '.PDF' : '.XLSX'}
                </span>
              </div>

              <button onClick={onClose}
                className="flex-shrink-0 p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors ml-2">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-hidden">
              {isPdf ? (
                // ── PDF Viewer ──
                <div className="w-full h-full flex flex-col">
                  {pdfLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                          <FileText size={28} className="text-rose-500" />
                        </div>
                        <div className="absolute -inset-1 rounded-2xl border-2 border-rose-300 border-t-transparent animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Menyiapkan PDF...</p>
                        <p className="text-xs text-slate-400 mt-1">Mohon tunggu sebentar</p>
                      </div>
                    </div>
                  ) : pdfError ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
                      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                        <AlertTriangle size={28} className="text-rose-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Gagal memuat preview</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">{pdfError}</p>
                      </div>
                      {onRetryPdf && (
                        <button onClick={onRetryPdf}
                          className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors">
                          <RefreshCw size={14} /> Coba Lagi
                        </button>
                      )}
                    </div>
                  ) : pdfBlobUrl ? (
                    <iframe
                      src={pdfBlobUrl}
                      className="w-full h-full border-0"
                      title="Preview PDF"
                      // #toolbar=1 aktifkan toolbar bawaan browser (zoom, print, download)
                      // Chrome/Firefox otomatis tampilkan PDF viewer dengan toolbar lengkap
                    />
                  ) : null}
                </div>
              ) : (
                // ── Excel Preview ──
                <ExcelTable columns={excelColumns} data={excelData} fileName={fileName} />
              )}
            </div>

            {/* ── Footer / Actions ── */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
              <button onClick={onClose}
                className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                Kembali
              </button>

              <div className="flex items-center gap-2 ml-auto">
                {isPdf && pdfBlobUrl && !pdfLoading && !pdfError && (
                  <button onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-xl text-sm font-medium transition-colors">
                    <Printer size={14} /> Print
                  </button>
                )}
                <button
                  onClick={() => onDownload(isPdf ? 'pdf' : 'excel')}
                  disabled={downloadLoading || (isPdf && (pdfLoading || !!pdfError || !pdfBlobUrl))}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${isPdf ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'}`}>
                  {downloadLoading
                    ? <><Loader2 size={14} className="animate-spin" /> Mengunduh...</>
                    : <><Download size={14} /> Download {isPdf ? 'PDF' : 'Excel'}</>
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
