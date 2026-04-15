import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'

export default function DataTable({
  columns = [], // Default empty array
  data = [], // Default empty array
  pagination,
  onPageChange,
  onSearch,
  searchPlaceholder = 'Cari...',
  loading = false,
  emptyMessage = 'Tidak ada data',
}) {
  const [searchValue, setSearchValue] = useState('')

  // Pastikan data adalah array
  const safeData = Array.isArray(data) ? data : []
  const safeColumns = Array.isArray(columns) ? columns : []
  
  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchValue)
    }
  }

  return (
    <div className="space-y-4">
      {onSearch && (
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button type="submit" className="btn-primary">
            Cari
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              {safeColumns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {column.header || column.accessor || '-'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={safeColumns.length || 1} className="px-4 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Memuat data...</p>
                </td>
              </tr>
            ) : safeData.length === 0 ? (
              <tr>
                <td colSpan={safeColumns.length || 1} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={24} className="text-slate-300" />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              safeData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  {safeColumns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                      {column.cell ? column.cell(row) : (row[column.accessor] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Menampilkan {pagination.from || 0} - {pagination.to || 0} dari {pagination.total || 0} data
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(1)}
              disabled={pagination.current_page === 1}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
              Halaman {pagination.current_page} dari {pagination.last_page}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(pagination.last_page)}
              disabled={pagination.current_page === pagination.last_page}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}