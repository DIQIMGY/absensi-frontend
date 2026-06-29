/**
 * ExportPreviewModal — preview PDF (iframe bawaan browser) & Excel (tabel HTML)
 * Responsif: mobile, tablet, desktop
 */
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Download, Printer, FileText, FileSpreadsheet,
  Loader2, AlertTriangle, Search, ChevronLeft, ChevronRight,
  RefreshCw, CalendarDays, Users, FileDown,
} from 'lucide-react'

/* ══════════════════════════════════════════════════════
   Excel Preview — tabel HTML bergaya spreadsheet
══════════════════════════════════════════════════════ */
function ExcelTable({ columns, data }) {
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const PER_PAGE              = 20

  const filtered = data.filter(row =>
    !search || columns.some(col =>
      String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  useEffect(() => setPage(1), [search])

  // range halaman untuk pagination (maks 5 tombol)
  const pageRange = () => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i)
  }

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Toolbar search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari data..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap flex-shrink-0">
          {filtered.length} baris &bull; hal. {page}/{totalPages}
        </span>
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-xs border-collapse" style={{ minWidth: `${columns.length * 100 + 60}px` }}>
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-center font-semibold bg-emerald-600 text-white border border-emerald-500 w-10 whitespace-nowrap">No</th>
              {columns.map(col => (
                <th key={col.key}
                  className="px-3 py-3 text-left font-semibold bg-emerald-600 text-white border border-emerald-500 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FileSpreadsheet size={32} strokeWidth={1.5} />
                    <span className="text-sm">{search ? `Tidak ada hasil untuk "${search}"` : 'Tidak ada data'}</span>
                  </div>
                </td>
              </tr>
            ) : paged.map((row, i) => (
              <tr key={i}
                className={`transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/80 dark:bg-slate-800/40'} hover:bg-emerald-50 dark:hover:bg-emerald-900/10`}>
                <td className="px-3 py-2.5 text-center text-slate-400 border border-slate-100 dark:border-slate-700 font-mono">
                  {(page - 1) * PER_PAGE + i + 1}
                </td>
                {columns.map(col => (
                  <td key={col.key}
                    className={[
                      'px-3 py-2.5 border border-slate-100 dark:border-slate-700 whitespace-nowrap',
                      col.center ? 'text-center' : '',
                      col.mono   ? 'font-mono' : '',
                      col.bold   ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300',
                      col.color  ? col.color : '',
                    ].filter(Boolean).join(' ')}>
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
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex-shrink-0">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft size={12} /> Prev
          </button>

          <div className="flex items-center gap-1">
            {pageRange().map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${p === page ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                {p}
              </button>
            ))}
          </div>

          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            Next <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Main Modal
══════════════════════════════════════════════════════ */
export default function ExportPreviewModal({
  isOpen,
  onClose,
  type          = 'pdf',
  title         = 'Laporan',
  subtitle      = '',
  meta          = {},
  pdfBlobUrl    = null,
  pdfLoading    = false,
  pdfError      = null,
  onRetryPdf,
  excelColumns  = [],
  excelData     = [],
  onDownload,
  downloadLoading = false,
}) {
  const isPdf = type === 'pdf'

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [isOpen, onClose])

  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handlePrint = () => {
    if (!pdfBlobUrl) return
    window.open(pdfBlobUrl, '_blank')?.focus()
  }

  /* ── Meta pills data ── */
  const metaItems = [
    meta.periode  && { icon: CalendarDays, label: meta.periode },
    meta.jumlah !== undefined && { icon: Users, label: `${meta.jumlah} data` },
  ].filter(Boolean)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-stretch justify-center p-0 sm:p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative flex flex-col w-full sm:max-w-5xl bg-white dark:bg-slate-900 sm:rounded-2xl overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 z-10"
            style={{ maxHeight: '100dvh' }}
            initial={{ scale: 0.97, y: 16 }}
            animate={{ scale: 1,    y: 0  }}
            exit={{ scale: 0.97,    y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >

            {/* ── Header ── */}
            <div className={`flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0
              ${isPdf
                ? 'bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30'
                : 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30'
              }`}>

              {/* Icon */}
              <div className={`p-2 rounded-xl flex-shrink-0
                ${isPdf ? 'bg-rose-100 dark:bg-rose-900/50' : 'bg-emerald-100 dark:bg-emerald-900/50'}`}>
                {isPdf
                  ? <FileText size={18} className="text-rose-600 dark:text-rose-400" />
                  : <FileSpreadsheet size={18} className="text-emerald-600 dark:text-emerald-400" />
                }
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate hidden sm:block">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Meta pills — hanya desktop */}
              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                {metaItems.map(({ icon: Icon, label }, i) => (
                  <span key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/80 dark:bg-slate-800/80 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-600/80 whitespace-nowrap">
                    <Icon size={11} className="flex-shrink-0 text-slate-400" />
                    {label}
                  </span>
                ))}
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap
                  ${isPdf
                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}>
                  {isPdf ? 'PDF' : 'XLSX'}
                </span>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-1 p-1.5 sm:p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Tutup">
                <X size={16} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* ── Meta strip untuk mobile/tablet ── */}
            {metaItems.length > 0 && (
              <div className="md:hidden flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 overflow-x-auto flex-shrink-0">
                {metaItems.map(({ icon: Icon, label }, i) => (
                  <span key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-md text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 whitespace-nowrap flex-shrink-0">
                    <Icon size={10} className="text-slate-400" />
                    {label}
                  </span>
                ))}
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border whitespace-nowrap flex-shrink-0
                  ${isPdf
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                  {isPdf ? 'PDF' : 'XLSX'}
                </span>
              </div>
            )}

            {/* ── Content ── */}
            <div className="flex-1 overflow-hidden min-h-0">
              {isPdf ? (
                /* PDF Viewer */
                <div className="w-full h-full flex flex-col">
                  {pdfLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                          <FileText size={26} className="text-rose-400" />
                        </div>
                        <div className="absolute -inset-1 rounded-2xl border-2 border-rose-400/60 border-t-transparent animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Menyiapkan PDF...</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Mohon tunggu sebentar</p>
                      </div>
                    </div>
                  ) : pdfError ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                        <AlertTriangle size={26} className="text-rose-500" />
                      </div>
                      <div className="text-center max-w-xs">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Gagal memuat preview</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{pdfError}</p>
                      </div>
                      {onRetryPdf && (
                        <button onClick={onRetryPdf}
                          className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
                          <RefreshCw size={14} /> Coba Lagi
                        </button>
                      )}
                    </div>
                  ) : pdfBlobUrl ? (
                    <iframe
                      src={`${pdfBlobUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                      className="w-full h-full border-0"
                      title="Preview PDF"
                    />
                  ) : null}
                </div>
              ) : (
                /* Excel Table */
                <ExcelTable columns={excelColumns} data={excelData} />
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-5 sm:py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex-shrink-0">
                Kembali
              </button>

              <div className="flex items-center gap-2 ml-auto">
                {/* Tombol print — hanya PDF dan hanya kalau blob ada */}
                {isPdf && pdfBlobUrl && !pdfLoading && !pdfError && (
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors flex-shrink-0">
                    <Printer size={13} />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                )}

                {/* Tombol download */}
                <button
                  onClick={() => onDownload(isPdf ? 'pdf' : 'excel')}
                  disabled={downloadLoading || (isPdf && (pdfLoading || !!pdfError || !pdfBlobUrl))}
                  className={[
                    'flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0',
                    isPdf
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                      : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25',
                  ].join(' ')}>
                  {downloadLoading
                    ? <><Loader2 size={13} className="animate-spin" /><span>Mengunduh...</span></>
                    : <><FileDown size={13} /><span>Download {isPdf ? 'PDF' : 'Excel'}</span></>
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
