import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, Eye, Play, History, AlertTriangle,
  CheckCircle, Users, GraduationCap, ArrowRight,
  Sparkles, RefreshCw, Calendar, Info, Clock,
  Award, Shield, BookOpen, School, UserCheck,
  ArrowUpCircle, ChevronRight, ChevronDown,
  Filter, Search, Check, X, HelpCircle,
  BarChart3, Layers, ListChecks, MoveRight
} from 'lucide-react'
import naikKelasService from '../../services/naikKelasService'
import { confirmAction } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'

// Stat Card Component - EMERALD
const StatCard = ({ label, value, icon: Icon, color = 'emerald', trend, trendValue }) => {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30 dark:border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 dark:bg-emerald-500/20',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30 dark:border-purple-500/30',
      iconBg: 'bg-purple-500/20 dark:bg-purple-500/20',
      gradient: 'from-purple-500 to-purple-600'
    },
    orange: {
      bg: 'bg-orange-500/10 dark:bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/30 dark:border-orange-500/30',
      iconBg: 'bg-orange-500/20 dark:bg-orange-500/20',
      gradient: 'from-orange-500 to-orange-600'
    }
  }

  const classes = colorClasses[color] || colorClasses.emerald

  return (
    <div className={`relative overflow-hidden ${classes.bg} rounded-xl border ${classes.border} p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
      {/* Background Pattern - simple */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.03)_0%,transparent_50%)]" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 ${classes.iconBg} rounded-lg border ${classes.border} shadow-sm`}>
            <Icon size={16} className={classes.text} />
          </div>
          
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-medium">
              <span className={trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}>
                {trend === 'up' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
              </span>
              <span className={trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}>
                {trendValue}
              </span>
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
            {label}
          </p>
          <p className={`text-lg sm:text-xl font-bold ${classes.text}`}>
            {value}
          </p>
        </div>

        {/* Bottom Indicator - simple */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-20" />
      </div>
    </div>
  )
}

// Status Badge Component - EMERALD
const StatusBadge = ({ status }) => {
  const config = {
    naik: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30 dark:border-purple-500/30',
      icon: TrendingUp,
      label: 'Naik Kelas'
    },
    lulus: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30 dark:border-emerald-500/30',
      icon: GraduationCap,
      label: 'Lulus'
    }
  }

  const { bg, text, border, icon: Icon, label } = config[status] || config.naik

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 ${bg} ${border} rounded-lg ${text} text-[10px] font-medium border shadow-sm`}>
      <Icon size={10} />
      {label}
    </span>
  )
}

// Preview Card Component - simple tanpa animasi berlebihan
const PreviewCard = ({ item, index }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg hover:bg-purple-500/10 dark:hover:bg-purple-500/20 transition-colors cursor-default border border-transparent hover:border-purple-500/30">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className={`flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-bold shadow-sm ${
          index < 3 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        }`}>
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-xs text-slate-900 dark:text-white truncate flex items-center gap-1">
            {item.nama}
            {item.status === 'lulus' && <Award size={10} className="text-emerald-500 flex-shrink-0" />}
          </p>
          <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-0.5">
            <FileText size={8} className="text-purple-500" />
            {item.nisn}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2">
        <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
          {item.kelas_lama}
        </span>
        <ArrowRight size={8} className="text-purple-500" />
        <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
          {item.kelas_baru || 'Alumni'}
        </span>
      </div>
    </div>
  )
}

const SiswaAvatar = ({ foto, nama, size = 'sm' }) => {
  const [imgError, setImgError] = useState(false)
  const dim = size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-xs'

  if (foto && !imgError) {
    return (
      <img
        src={foto}
        alt={nama}
        className={`${dim} rounded-full object-cover shadow-sm flex-shrink-0`}
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0`}>
      {nama?.charAt(0).toUpperCase()}
    </div>
  )
}

export default function NaikKelas() {
  const [preview, setPreview] = useState(null)
  const [history, setHistory] = useState([])
  const [statistik, setStatistik] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')
  const [showDetails, setShowDetails] = useState(false)

  // State untuk naik kelas selektif
  const [kelasData, setKelasData] = useState([])
  const [loadingKelas, setLoadingKelas] = useState(false)
  const [selectedSiswa, setSelectedSiswa] = useState(new Set())
  const [loadingSelektif, setLoadingSelektif] = useState(false)
  const [expandedKelas, setExpandedKelas] = useState(new Set())
  const [filterTingkat, setFilterTingkat] = useState('')

  // State untuk pindah kelas
  const [kelasList, setKelasList] = useState([])
  const [loadingKelasList, setLoadingKelasList] = useState(false)
  const [pindahTarget, setPindahTarget] = useState({}) // { kelas_id: tujuan_kelas_id }
  const [loadingPindah, setLoadingPindah] = useState({}) // { kelas_id: bool }

  useEffect(() => {
    fetchPreview()
    fetchHistory()
    fetchStatistik()
  }, [])

  useEffect(() => {
    if (activeTab === 'selektif') fetchKelasData()
  }, [activeTab, filterTingkat])

  useEffect(() => {
    if (activeTab === 'pindah') {
      fetchKelasData()
      fetchKelasList()
    }
  }, [activeTab])

  const fetchKelasList = async () => {
    try {
      setLoadingKelasList(true)
      const res = await naikKelasService.getKelasList()
      const list = res.data?.data || res.data || []
      setKelasList(list)
    } catch { toast.error('Gagal memuat daftar kelas') }
    finally { setLoadingKelasList(false) }
  }

  const handlePindahKelas = async (kelasAsalId, kelasAsalNama) => {
    const tujuanId = pindahTarget[kelasAsalId]
    if (!tujuanId) { toast.error('Pilih kelas tujuan dulu'); return }
    const tujuanNama = kelasList.find(k => k.id == tujuanId)?.nama_kelas || tujuanId
    const confirmed = await confirmAction(
      'Pindah Kelas?',
      `Semua siswa aktif dari "${kelasAsalNama}" akan dipindah ke "${tujuanNama}". Tindakan ini tidak dapat dibatalkan!`
    )
    if (!confirmed) return
    try {
      setLoadingPindah(prev => ({ ...prev, [kelasAsalId]: true }))
      const res = await naikKelasService.pindahKelas(kelasAsalId, tujuanId)
      if (res.success) {
        toast.success(res.message)
        setPindahTarget(prev => { const n = {...prev}; delete n[kelasAsalId]; return n })
        fetchKelasData()
        fetchStatistik()
      } else {
        toast.error(res.message || 'Gagal pindah kelas')
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal pindah kelas')
    } finally {
      setLoadingPindah(prev => ({ ...prev, [kelasAsalId]: false }))
    }
  }

  const fetchPreview = async () => {
    try {
      setLoadingPreview(true)
      const res = await naikKelasService.preview()
      if (res.success) setPreview(res.data)
    } catch (error) {
      console.error('Error fetching preview:', error)
      toast.error('Gagal memuat preview naik kelas')
    } finally {
      setLoadingPreview(false)
    }
  }

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true)
      const res = await naikKelasService.getHistory({ per_page: 20 })
      setHistory(res.data?.data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const fetchStatistik = async () => {
    try {
      const res = await naikKelasService.getStatistik()
      if (res.success) setStatistik(res.data)
    } catch (error) {
      console.error('Error fetching statistik:', error)
    }
  }

  const fetchKelasData = async () => {
    try {
      setLoadingKelas(true)
      const res = await naikKelasService.getSiswaPerKelas(filterTingkat || null)
      if (res.success) {
        setKelasData(res.data)
        // Auto expand semua kelas
        setExpandedKelas(new Set(res.data.map(k => k.kelas_id)))
      }
    } catch (error) {
      toast.error('Gagal memuat data kelas')
    } finally {
      setLoadingKelas(false)
    }
  }

  const toggleSiswa = (siswaId) => {
    setSelectedSiswa(prev => {
      const next = new Set(prev)
      if (next.has(siswaId)) next.delete(siswaId)
      else next.add(siswaId)
      return next
    })
  }

  const toggleKelas = (kelas) => {
    const ids = kelas.siswa.map(s => s.id)
    setSelectedSiswa(prev => {
      const next = new Set(prev)
      const allSelected = ids.every(id => next.has(id))
      if (allSelected) ids.forEach(id => next.delete(id))
      else ids.forEach(id => next.add(id))
      return next
    })
  }

  const toggleAngkatan = (tingkat) => {
    const kelasTingkat = kelasData.filter(k => k.tingkat === tingkat || k.tingkat === String(tingkat))
    const ids = kelasTingkat.flatMap(k => k.siswa.map(s => s.id))
    setSelectedSiswa(prev => {
      const next = new Set(prev)
      const allSelected = ids.every(id => next.has(id))
      if (allSelected) ids.forEach(id => next.delete(id))
      else ids.forEach(id => next.add(id))
      return next
    })
  }

  const handleProsesSelektif = async () => {
    if (selectedSiswa.size === 0) {
      toast.error('Pilih minimal 1 siswa')
      return
    }
    const confirmed = await confirmAction(
      `Proses ${selectedSiswa.size} Siswa?`,
      `Siswa kelas X/XI akan naik kelas. Siswa kelas XII akan dijadikan alumni. Tindakan ini tidak dapat dibatalkan!`
    )
    if (!confirmed) return
    try {
      setLoadingSelektif(true)
      const res = await naikKelasService.prosesSelektif(Array.from(selectedSiswa))
      if (res.success) {
        toast.success(res.message)
        setSelectedSiswa(new Set())
        fetchKelasData()
        fetchStatistik()
      } else {
        toast.error(res.message || 'Gagal proses naik kelas')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal proses naik kelas')
    } finally {
      setLoadingSelektif(false)
    }
  }

  const handleProsesNaikKelas = async () => {
    const confirmed = await confirmAction(
      'Proses Naik Kelas?',
      'Tindakan ini akan memindahkan semua siswa ke kelas berikutnya dan meluluskan siswa kelas XII. Proses ini tidak dapat dibatalkan!'
    )
    if (!confirmed) return

    try {
      setLoading(true)
      const res = await naikKelasService.proses()
      if (res.success) {
        toast.success('Naik kelas berhasil diproses!')
        fetchPreview()
        fetchHistory()
        fetchStatistik()
      } else {
        toast.error(res.message || 'Gagal proses naik kelas')
      }
    } catch (error) {
      console.error('Error proses naik kelas:', error)
      toast.error(error.response?.data?.message || 'Gagal proses naik kelas')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 px-3 sm:px-4 lg:px-6">
      {/* Header - EMERALD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              <span className="text-gradient-emerald">Naik Kelas</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <Sparkles size={12} className="text-emerald-500" />
              Proses kenaikan kelas siswa akhir tahun ajaran
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleProsesNaikKelas}
            disabled={loading}
            className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all text-xs font-medium"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            <span>Proses Naik Kelas</span>
          </button>
        </div>
      </div>

      {/* Stats - EMERALD */}
      {statistik && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Total Diproses"
            value={statistik.statistik?.total || 0}
            icon={Users}
            color="purple"
          />
          <StatCard
            label="Naik Kelas"
            value={statistik.statistik?.naik || 0}
            icon={TrendingUp}
            color="emerald"
            trend="up"
            trendValue="+12"
          />
          <StatCard
            label="Lulus (Alumni)"
            value={statistik.statistik?.lulus || 0}
            icon={GraduationCap}
            color="orange"
          />
        </div>
      )}

      {/* Warning Card - Menggunakan orange untuk warning */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/10 border border-orange-500/30 dark:border-orange-500/30 rounded-lg p-4 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.05)_0%,transparent_50%)]" />
        <div className="relative flex items-start gap-3">
          <div className="p-2 bg-orange-500/20 dark:bg-orange-500/20 rounded-lg border border-orange-500/30 dark:border-orange-500/30 shadow-sm">
            <AlertTriangle size={16} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-0.5 flex items-center gap-1">
              <Shield size={12} />
              Perhatian Penting
            </h3>
            <p className="text-[10px] text-orange-600/80 dark:text-orange-400/80 leading-relaxed">
              Proses naik kelas akan memindahkan semua siswa aktif ke kelas berikutnya. 
              Siswa kelas XII akan dijadikan alumni. Proses ini <span className="font-bold">tidak dapat dibatalkan</span>. 
              Pastikan data sudah benar sebelum melanjutkan.
            </p>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-orange-500/20 dark:border-orange-500/20">
              <CheckCircle size={10} className="text-emerald-500" />
              <p className="text-[8px] text-orange-600/70 dark:text-orange-400/70">
                Untuk auto naik kelas, aktifkan fitur di halaman <span className="font-bold">Tahun Ajaran</span> dan set tanggal semester genap selesai.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - EMERALD */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg w-fit flex-wrap">
        {[
          { id: 'preview', label: 'Preview', icon: Eye },
          { id: 'pindah', label: 'Pindah Kelas', icon: MoveRight },
          { id: 'selektif', label: 'Naik Kelas Selektif', icon: ListChecks },
          { id: 'history', label: 'Riwayat', icon: History },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/30 dark:border-emerald-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'preview' && (
        <>
          {loadingPreview ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-lg">
              <RefreshCw size={28} className="text-emerald-500 animate-spin" />
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Memuat preview data...</p>
            </div>
          ) : preview ? (
            <div className="space-y-3">
              {/* Info tahun ajaran */}
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700/60 p-4 shadow-md">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                      <Calendar size={14} className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400">Dari</p>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">{preview.tahun_ajaran_lama}</p>
                    </div>
                  </div>
                  
                  <ArrowRight size={16} className="text-purple-500" />
                  
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg border border-purple-500/30 dark:border-purple-500/30">
                      <Calendar size={14} className="text-purple-500 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400">Ke</p>
                      <p className="font-semibold text-xs text-purple-500 dark:text-purple-400">{preview.tahun_ajaran_baru}</p>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg border border-emerald-500/30 dark:border-emerald-500/30">
                      <Users size={14} className="text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400">Total</p>
                      <p className="font-semibold text-xs text-emerald-500 dark:text-emerald-400">{preview.total_siswa}</p>
                    </div>
                  </div>
                </div>

                {preview.statistik && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="px-2 py-1.5 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg border border-purple-500/30 dark:border-purple-500/30">
                      <p className="text-[8px] text-purple-500 dark:text-purple-400">X → XI</p>
                      <p className="font-semibold text-[10px] text-purple-500 dark:text-purple-400">{preview.statistik.naik_x_xi} siswa</p>
                    </div>
                    <div className="px-2 py-1.5 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg border border-purple-500/30 dark:border-purple-500/30">
                      <p className="text-[8px] text-purple-500 dark:text-purple-400">XI → XII</p>
                      <p className="font-semibold text-[10px] text-purple-500 dark:text-purple-400">{preview.statistik.naik_xi_xii} siswa</p>
                    </div>
                    <div className="px-2 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg border border-emerald-500/30 dark:border-emerald-500/30">
                      <p className="text-[8px] text-emerald-500 dark:text-emerald-400">Lulus</p>
                      <p className="font-semibold text-[10px] text-emerald-500 dark:text-emerald-400">{preview.statistik.lulus} siswa</p>
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 text-[10px] font-medium text-purple-500 dark:text-purple-400 hover:text-purple-600 transition-colors"
                  >
                    {showDetails ? 'Sembunyikan' : 'Tampilkan'} detail preview
                    <ChevronDown size={12} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Detail Preview */}
              {showDetails && (
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700/60 shadow-lg overflow-hidden">
                  <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                      <Eye size={12} className="text-purple-500" />
                      Daftar Preview Siswa
                    </h3>
                  </div>
                  <div className="p-3 max-h-96 overflow-y-auto">
                    <div className="space-y-0.5">
                      {preview.detail?.slice(0, 50).map((item, idx) => (
                        <PreviewCard key={idx} item={item} index={idx} />
                      ))}
                    </div>
                    {preview.detail?.length > 50 && (
                      <div className="mt-3 pt-3 text-center text-[9px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
                        Menampilkan 50 dari {preview.detail.length} siswa
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-lg">
              <Info size={40} className="mx-auto mb-3 text-slate-400" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Tidak ada data preview</p>
            </div>
          )}
        </>
      )}

      {/* Tab Pindah Kelas */}
      {activeTab === 'pindah' && (
        <div className="space-y-4">
          {/* Info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
            <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-0.5">Cara Kerja Pindah Kelas</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400">
                Pilih kelas asal, lalu pilih kelas tujuan dari dropdown. Semua siswa aktif di kelas asal akan dipindah ke kelas tujuan. Cocok untuk naik kelas manual sesuai kebijakan sekolah.
              </p>
            </div>
          </div>

          {/* Tabel kelas */}
          {loadingKelas ? (
            <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <RefreshCw size={20} className="text-emerald-500 animate-spin mr-2" />
              <span className="text-xs text-slate-500">Memuat data kelas...</span>
            </div>
          ) : kelasData.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <School size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs text-slate-400">Tidak ada data kelas</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Daftar Kelas — Pilih Tujuan Pindah
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kelas Asal</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Jurusan</th>
                      <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Siswa</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-56">Pindah ke Kelas</th>
                      <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {kelasData.map(kelas => {
                      const isLoading = loadingPindah[kelas.kelas_id]
                      const tujuanId  = pindahTarget[kelas.kelas_id] || ''
                      // Filter kelas tujuan: exclude kelas asal sendiri
                      const opsiTujuan = (loadingKelasList ? [] : kelasList).filter(k => k.id !== kelas.kelas_id)
                      return (
                        <tr key={kelas.kelas_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Kelas asal */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                <GraduationCap size={13} className="text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{kelas.nama_kelas}</p>
                                <p className="text-[10px] text-slate-400">Tingkat {kelas.tingkat}</p>
                              </div>
                            </div>
                          </td>
                          {/* Jurusan */}
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{kelas.jurusan || '-'}</td>
                          {/* Jumlah siswa */}
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                              <Users size={9} /> {kelas.total_siswa}
                            </span>
                          </td>
                          {/* Dropdown tujuan */}
                          <td className="px-4 py-3">
                            <select
                              value={tujuanId}
                              onChange={e => setPindahTarget(prev => ({ ...prev, [kelas.kelas_id]: e.target.value }))}
                              disabled={isLoading || loadingKelasList || kelas.total_siswa === 0}
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">-- Pilih kelas tujuan --</option>
                              {opsiTujuan.map(k => (
                                <option key={k.id} value={k.id}>
                                  {k.nama_kelas} {k.tahun_ajaran ? `(${k.tahun_ajaran})` : ''}
                                </option>
                              ))}
                            </select>
                          </td>
                          {/* Tombol pindah */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handlePindahKelas(kelas.kelas_id, kelas.nama_kelas)}
                              disabled={!tujuanId || isLoading || kelas.total_siswa === 0}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                              {isLoading
                                ? <><RefreshCw size={11} className="animate-spin" /> Proses...</>
                                : <><MoveRight size={11} /> Pindah</>}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Selektif */}
      {activeTab === 'selektif' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select value={filterTingkat} onChange={e => setFilterTingkat(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200">
                <option value="">Semua Tingkat</option>
                <option value="10">Kelas X (10)</option>
                <option value="11">Kelas XI (11)</option>
                <option value="12">Kelas XII (12)</option>
              </select>
              <button onClick={fetchKelasData} disabled={loadingKelas}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 transition-colors">
                <RefreshCw size={13} className={loadingKelas ? 'animate-spin' : ''}/>
              </button>
            </div>
            <div className="flex items-center gap-2">
              {selectedSiswa.size > 0 && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  {selectedSiswa.size} dipilih
                </span>
              )}
              <button onClick={handleProsesSelektif} disabled={loadingSelektif || selectedSiswa.size === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-500/25 transition-all">
                {loadingSelektif ? <RefreshCw size={13} className="animate-spin"/> : <Play size={13}/>}
                Proses {selectedSiswa.size > 0 ? `(${selectedSiswa.size})` : ''} Siswa
              </button>
            </div>
          </div>

          {/* Shortcut angkatan */}
          <div className="flex flex-wrap gap-2">
            {['10','11','12'].map(t => {
              const kelasTingkat = kelasData.filter(k => String(k.tingkat) === t)
              if (!kelasTingkat.length) return null
              const ids = kelasTingkat.flatMap(k => k.siswa.map(s => s.id))
              const allSel = ids.length > 0 && ids.every(id => selectedSiswa.has(id))
              const label = t === '10' ? 'Kelas X' : t === '11' ? 'Kelas XI' : 'Kelas XII'
              const aksi  = t === '12' ? '→ Alumni' : t === '11' ? '→ XII' : '→ XI'
              return (
                <button key={t} onClick={() => toggleAngkatan(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    allSel
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                  }`}>
                  <Check size={11} className={allSel ? 'opacity-100' : 'opacity-0'}/>
                  {label} {aksi} ({ids.length} siswa)
                </button>
              )
            })}
          </div>

          {/* List kelas */}
          {loadingKelas ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="text-emerald-500 animate-spin"/>
            </div>
          ) : kelasData.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Users size={32} className="mx-auto mb-2 text-slate-300"/>
              <p className="text-sm text-slate-400">Tidak ada data kelas aktif</p>
            </div>
          ) : (
            <div className="space-y-3">
              {kelasData.map(kelas => {
                const ids = kelas.siswa.map(s => s.id)
                const allSel = ids.length > 0 && ids.every(id => selectedSiswa.has(id))
                const someSel = ids.some(id => selectedSiswa.has(id))
                const isExpanded = expandedKelas.has(kelas.kelas_id)
                const aksiLabel = kelas.aksi === 'lulus' ? '→ Alumni' : `→ Kelas ${kelas.tingkat_baru}`
                const aksiColor = kelas.aksi === 'lulus' ? 'text-orange-500' : 'text-emerald-500'

                return (
                  <div key={kelas.kelas_id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
                    {/* Header kelas */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
                      {/* Checkbox kelas */}
                      <button onClick={() => toggleKelas(kelas)}
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                          allSel ? 'bg-emerald-500 border-emerald-500' :
                          someSel ? 'bg-emerald-200 border-emerald-400' :
                          'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                        }`}>
                        {(allSel || someSel) && <Check size={11} className="text-white"/>}
                      </button>

                      <button onClick={() => {
                        setExpandedKelas(prev => {
                          const next = new Set(prev)
                          if (next.has(kelas.kelas_id)) next.delete(kelas.kelas_id)
                          else next.add(kelas.kelas_id)
                          return next
                        })
                      }} className="flex-1 flex items-center gap-3 text-left">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{kelas.nama_kelas}</p>
                          <p className="text-[10px] text-slate-400">{kelas.jurusan} · {kelas.total_siswa} siswa</p>
                        </div>
                        <span className={`text-xs font-bold ml-auto mr-2 ${aksiColor}`}>{aksiLabel}</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>
                      </button>
                    </div>

                    {/* List siswa */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {kelas.siswa.length === 0 ? (
                          <p className="px-4 py-3 text-xs text-slate-400 italic">Tidak ada siswa aktif</p>
                        ) : kelas.siswa.map(siswa => {
                          const isSel = selectedSiswa.has(siswa.id)
                          return (
                            <button key={siswa.id} onClick={() => toggleSiswa(siswa.id)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                isSel ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}>
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSel ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                {isSel && <Check size={9} className="text-white"/>}
                              </div>
                              {siswa.foto ? (
                                <img src={siswa.foto} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0"/>
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    {siswa.nama?.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{siswa.nama}</p>
                                <p className="text-[10px] text-slate-400">{siswa.nis}</p>
                              </div>
                              <span className={`text-[10px] font-bold flex-shrink-0 ${aksiColor}`}>{aksiLabel}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab History */}
      {activeTab === 'history' && (
        <>
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-lg">
              <RefreshCw size={28} className="text-emerald-500 animate-spin" />
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Memuat riwayat...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700/60 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                      <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tahun Ajaran</th>
                      <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kelas Lama</th>
                      <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kelas Baru</th>
                      <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {history.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-purple-500/5 transition-colors">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <SiswaAvatar foto={item.siswa?.foto_url} nama={item.siswa_nama} size="sm" />
                            <span className="font-medium text-xs text-slate-900 dark:text-white">
                              {item.siswa_nama}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                          {item.tahun_ajaran_lama}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-slate-500 dark:text-slate-400">
                          {item.kelas_lama}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-slate-500 dark:text-slate-400">
                          {item.kelas_baru || '-'}
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-3 py-2 text-[9px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-0.5">
                            <Clock size={8} className="text-slate-400" />
                            {formatDate(item.tanggal_naik_kelas)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-lg">
              <History size={40} className="mx-auto mb-3 text-slate-400" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada riwayat naik kelas</p>
            </div>
          )}
        </>
      )}

      {/* Inline styles */}
      <style jsx>{`
        .text-gradient-emerald {
          background: linear-gradient(135deg, #10B981 0%, #059669 50%, #10B981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dark .text-gradient-emerald {
          background: linear-gradient(135deg, #34D399 0%, #10B981 50%, #34D399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  )
}