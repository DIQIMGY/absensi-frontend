import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, User, Calendar, Filter, Search, Trash2, Clock,
  TrendingUp, FileText, AlertCircle, CheckCircle, XCircle,
  RefreshCw, Shield, LogIn, LogOut, Edit, Plus, Database,
  ChevronDown, X, Server, Eye
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import { adminApi } from '../../services/adminService'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

export default function Logging() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filters, setFilters] = useState({ action: '', model_type: '', user_id: '', start_date: '', end_date: '', search: '' })

  useEffect(() => { fetchLogs(); fetchStats() }, [currentPage, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const cleanFilters = Object.entries(filters).reduce((acc, [k, v]) => { if (v) acc[k] = v; return acc }, {})
      const res = (await adminApi.getActivityLogs({ page: currentPage, per_page: 15, ...cleanFilters })).data
      setLogs(Array.isArray(res?.data) ? res.data : [])
      setPagination(res?.pagination || null)
    } catch { toast.error('Gagal memuat activity logs') }
    finally { setLoading(false) }
  }

  const fetchStats = async () => {
    try { setStats((await adminApi.getActivityLogStats()).data.data) } catch {}
  }

  const handleDelete = async (id) => {
    const r = await Swal.fire({ title: 'Hapus Log?', text: 'Log yang dihapus tidak dapat dikembalikan', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b', confirmButtonText: 'Hapus', cancelButtonText: 'Batal' })
    if (r.isConfirmed) {
      try { await adminApi.deleteActivityLog(id); toast.success('Log berhasil dihapus'); fetchLogs(); fetchStats() }
      catch { toast.error('Gagal menghapus log') }
    }
  }

  const handleClearOldLogs = async () => {
    const { value: days } = await Swal.fire({ title: 'Hapus Log Lama', input: 'number', inputLabel: 'Hapus log lebih dari berapa hari?', inputPlaceholder: 'Contoh: 30', inputAttributes: { min: 1, max: 365 }, showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b', confirmButtonText: 'Hapus', cancelButtonText: 'Batal', inputValidator: (v) => (!v || v < 1) ? 'Masukkan jumlah hari yang valid' : null })
    if (days) {
      try { const count = (await adminApi.clearActivityLogs(days)).data.data.deleted_count; toast.success(`Berhasil menghapus ${count} log lama`); fetchLogs(); fetchStats() }
      catch { toast.error('Gagal menghapus log lama') }
    }
  }

  const ACTION_CFG = {
    login:    { bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-800',    icon: LogIn,       label: 'Login' },
    logout:   { bg: 'bg-slate-100 dark:bg-slate-800',     text: 'text-slate-700 dark:text-slate-300',   border: 'border-slate-200 dark:border-slate-700',   icon: LogOut,      label: 'Logout' },
    register: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', icon: Plus, label: 'Register' },
    created:  { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', icon: Plus, label: 'Created' },
    updated:  { bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-300',   border: 'border-amber-200 dark:border-amber-800',   icon: Edit,        label: 'Updated' },
    deleted:  { bg: 'bg-rose-100 dark:bg-rose-900/30',    text: 'text-rose-700 dark:text-rose-300',     border: 'border-rose-200 dark:border-rose-800',     icon: Trash2,      label: 'Deleted' },
    absen:    { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', icon: CheckCircle, label: 'Absen' },
  }

  const getActionBadge = (action) => {
    const cfg = ACTION_CFG[action] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700', icon: Activity, label: action }
    const Icon = cfg.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
        <Icon size={11} />{cfg.label}
      </span>
    )
  }

  const UserCell = ({ row }) => {
    if (row.user?.id) {
      const foto = row.user.foto_url || row.user.foto
      return (
        <div className="flex items-center gap-2 min-w-0">
          {foto
            ? <img src={foto} alt={row.user.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700" onError={e => e.target.style.display='none'} />
            : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{(row.user.name||row.user.email||'U').charAt(0)}</div>
          }
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-800 dark:text-white truncate max-w-[100px]">{row.user.name || row.user.email || 'Unknown'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{row.user.role || '-'}</p>
          </div>
        </div>
      )
    }
    if (row.new_values?.siswa_nama) {
      const foto = row.new_values?.siswa_foto_url || row.new_values?.siswa_foto
      return (
        <div className="flex items-center gap-2 min-w-0">
          {foto
            ? <img src={foto} alt={row.new_values.siswa_nama} className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700" onError={e => e.target.style.display='none'} />
            : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{row.new_values.siswa_nama.charAt(0)}</div>
          }
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-800 dark:text-white truncate max-w-[100px]">{row.new_values.siswa_nama}</p>
            <p className="text-[10px] text-slate-400">{row.new_values.siswa_nis ? `NIS: ${row.new_values.siswa_nis}` : 'Siswa'}</p>
          </div>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center flex-shrink-0"><Server size={13} className="text-white" /></div>
        <div><p className="text-xs font-medium text-slate-800 dark:text-white">System</p><p className="text-[10px] text-slate-400">Auto</p></div>
      </div>
    )
  }

  const columns = [
    {
      header: 'Waktu',
      accessor: 'created_at',
      cell: (row) => (
        <div className="min-w-[110px]">
          <p className="text-xs font-medium text-slate-800 dark:text-white">
            {new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            {new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      ),
    },
    {
      header: 'User',
      accessor: 'user',
      cell: (row) => <UserCell row={row} />,
    },
    {
      header: 'Aksi',
      accessor: 'action',
      cell: (row) => getActionBadge(row.action),
    },
    {
      header: 'Model',
      accessor: 'model_type',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-medium border border-teal-200 dark:border-teal-800">
          <Database size={10} />{row.model_type ? row.model_type.split('\\').pop() : '-'}
        </span>
      ),
    },
    {
      header: 'IP',
      accessor: 'ip_address',
      cell: (row) => (
        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 whitespace-nowrap">
          {row.ip_address || '-'}
        </span>
      ),
    },
    {
      header: '',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setSelectedLog(row); setShowDetailModal(true) }}
            className="p-1.5 text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 rounded-lg transition-colors" title="Detail">
            <Eye size={14} />
          </button>
          <button onClick={() => handleDelete(row.id)}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Hapus">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const STAT_CARDS = [
    { label: 'Total Logs',  key: 'total_logs',  sub: 'Sepanjang waktu',  color: 'teal',   icon: Database,   fmt: (v) => v?.toLocaleString() },
    { label: 'Hari Ini',    key: 'today_logs',  sub: 'Aktivitas terbaru', color: 'emerald', icon: TrendingUp, fmt: (v) => v },
    { label: 'Minggu Ini',  key: 'week_logs',   sub: '7 hari terakhir',  color: 'amber',  icon: Calendar,   fmt: (v) => v },
    { label: 'Bulan Ini',   key: 'month_logs',  sub: '30 hari terakhir', color: 'purple', icon: FileText,   fmt: (v) => v },
  ]
  const colorMap = {
    teal:   { val: 'text-teal-600 dark:text-teal-400',   icon: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' },
    emerald:{ val: 'text-emerald-600 dark:text-emerald-400', icon: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
    amber:  { val: 'text-amber-600 dark:text-amber-400', icon: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
    purple: { val: 'text-purple-600 dark:text-purple-400', icon: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex-shrink-0">
            <Activity size={20} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Activity Logs</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Riwayat aktivitas sistem dan pengguna</p>
          </div>
        </div>
        <button onClick={handleClearOldLogs}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm w-full sm:w-auto">
          <Trash2 size={15} />
          <span>Hapus Log Lama</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {STAT_CARDS.map(({ label, key, sub, color, icon: Icon, fmt }) => (
            <div key={key} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{label}</p>
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${colorMap[color].icon}`}>
                  <Icon size={15} />
                </div>
              </div>
              <p className={`text-xl sm:text-2xl font-bold ${colorMap[color].val}`}>{fmt(stats[key])}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

        {/* Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              <Filter size={15} />
              <span className="hidden xs:inline">Filter & Pencarian</span>
              <span className="xs:hidden">Filter</span>
              <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={() => { setFilters({ action: '', model_type: '', user_id: '', start_date: '', end_date: '', search: '' }); setCurrentPage(1) }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="pt-3 space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari user, email, atau aksi..."
                      value={filters.search}
                      onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" />
                  </div>
                  {/* Filter row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <select value={filters.action} onChange={e => setFilters(p => ({ ...p, action: e.target.value }))}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-slate-700 dark:text-slate-300">
                      <option value="">Semua Aksi</option>
                      {['login','logout','register','created','updated','deleted','absen'].map(a => <option key={a} value={a} className="capitalize">{a.charAt(0).toUpperCase()+a.slice(1)}</option>)}
                    </select>
                    <input type="date" value={filters.start_date} onChange={e => setFilters(p => ({ ...p, start_date: e.target.value }))}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-slate-700 dark:text-slate-300" />
                    <input type="date" value={filters.end_date} onChange={e => setFilters(p => ({ ...p, end_date: e.target.value }))}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-slate-700 dark:text-slate-300" />
                    <button onClick={() => { setCurrentPage(1); fetchLogs() }}
                      className="px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <Filter size={14} />Terapkan
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <div className="p-3 sm:p-4">
          {!loading && logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Activity size={28} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Belum Ada Log</p>
              <p className="text-xs text-slate-400 mt-1">Tidak ada aktivitas dengan filter yang dipilih</p>
            </div>
          ) : (
            <DataTable columns={columns} data={logs} pagination={pagination} onPageChange={setCurrentPage} loading={loading} />
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedLog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowDetailModal(false)} onTouchEnd={() => setShowDetailModal(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-slate-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <Activity size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Detail Aktivitas</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ID: {selectedLog.id}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/60 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Waktu', val: new Date(selectedLog.created_at).toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' }) },
                    { label: 'Aksi', val: null, badge: getActionBadge(selectedLog.action) },
                    { label: 'IP Address', val: selectedLog.ip_address || '-', mono: true },
                    { label: 'Model', val: selectedLog.model_type?.split('\\').pop() || '-' },
                    { label: 'Model ID', val: selectedLog.model_id || '-' },
                    { label: 'User Agent', val: selectedLog.user_agent || '-', truncate: true },
                  ].map(({ label, val, badge, mono, truncate }) => (
                    <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                      {badge
                        ? badge
                        : <p className={`text-xs text-slate-800 dark:text-white ${mono ? 'font-mono' : ''} ${truncate ? 'truncate' : 'break-words'}`}>{val}</p>
                      }
                    </div>
                  ))}
                </div>

                {/* Old Values */}
                {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Data Sebelumnya
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                      <pre className="text-[10px] sm:text-xs text-amber-800 dark:text-amber-200 overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(selectedLog.old_values, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* New Values */}
                {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Data Baru
                    </p>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                      <pre className="text-[10px] sm:text-xs text-emerald-800 dark:text-emerald-200 overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(selectedLog.new_values, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
