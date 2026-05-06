import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, Eye, Play, History, AlertTriangle,
  CheckCircle, Users, GraduationCap, ArrowRight,
  Sparkles, RefreshCw, Calendar, Info, Clock,
  Award, Shield, BookOpen, School, UserCheck,
  ArrowUpCircle, ArrowDownCircle, ChevronRight, ChevronDown,
  Filter, Search, Check, X, HelpCircle, FileText,
  BarChart3, Layers, ListChecks, MoveRight, UserX, Bell, MessageSquare,
  ChevronUp, Star, Zap
} from 'lucide-react'
import naikKelasService from '../../services/naikKelasService'
import { adminApi } from '../../services/adminService'
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
  const isDikecualikan = item.status === 'dikecualikan'
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-default border ${
      isDikecualikan
        ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40'
        : 'bg-slate-50 dark:bg-slate-800/60 border-transparent hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:border-purple-500/30'
    }`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className={`flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-bold shadow-sm ${
          isDikecualikan ? 'bg-amber-400 text-white' :
          index < 3 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        }`}>
          {isDikecualikan ? '!' : index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-xs text-slate-900 dark:text-white truncate flex items-center gap-1">
            {item.nama}
            {item.status === 'lulus' && <Award size={10} className="text-emerald-500 flex-shrink-0" />}
            {isDikecualikan && <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1 py-0.5 rounded flex-shrink-0">Tidak Naik</span>}
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
        <ArrowRight size={8} className={isDikecualikan ? 'text-amber-400' : 'text-purple-500'} />
        <span className={`text-[9px] font-medium ${isDikecualikan ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
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

// Warning Banner Component
const WarningBanner = () => {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 overflow-hidden shadow-sm">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-200 dark:border-amber-800/40">
          <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Shield size={13} />
            Perhatian Penting
          </p>
        </div>
        <div className={`w-6 h-6 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center transition-transform ${collapsed ? '' : 'rotate-180'}`}>
          <ChevronDown size={13} className="text-amber-600 dark:text-amber-400" />
        </div>
      </button>
      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
            Proses naik kelas akan memindahkan semua siswa aktif ke kelas berikutnya.
            Siswa kelas XII akan dijadikan alumni. Proses ini{' '}
            <span className="font-black text-amber-800 dark:text-amber-200">tidak dapat dibatalkan</span>.
            Pastikan data sudah benar sebelum melanjutkan.
          </p>
          <div className="flex items-start gap-2 pt-2 border-t border-amber-200 dark:border-amber-800/40">
            <CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
              Untuk auto naik kelas, aktifkan fitur di halaman{' '}
              <span className="font-bold">Tahun Ajaran</span> dan set tanggal semester genap selesai.
            </p>
          </div>
        </div>
      )}
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
  const [searchSelektif, setSearchSelektif] = useState('')

  // State untuk pindah kelas
  const [kelasList, setKelasList] = useState([])
  const [loadingKelasList, setLoadingKelasList] = useState(false)
  const [pindahTarget, setPindahTarget] = useState({})
  const [loadingPindah, setLoadingPindah] = useState({})
  const [searchPindah, setSearchPindah] = useState('')

  // State pindah kelas selektif per-siswa
  const [selectedPindah, setSelectedPindah] = useState(new Set()) // siswa_ids yang dipilih untuk dipindah
  const [pindahTujuanGlobal, setPindahTujuanGlobal] = useState('') // kelas tujuan global
  const [expandedPindahKelas, setExpandedPindahKelas] = useState(new Set())
  const [loadingPindahSelektif, setLoadingPindahSelektif] = useState(false)

  // State untuk rekomendasi dari guru
  const [rekomendasi, setRekomendasi] = useState([])
  const [rekomendasiStats, setRekomendasiStats] = useState(null)
  const [loadingRekomendasi, setLoadingRekomendasi] = useState(false)

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

  useEffect(() => {
    if (activeTab === 'rekomendasi') fetchRekomendasi()
  }, [activeTab])

  // Filter data selektif berdasarkan search
  const filteredKelasSelektif = kelasData.map(kelas => {
    if (!searchSelektif) return kelas
    const q = searchSelektif.toLowerCase()
    const kelasMatch = kelas.nama_kelas.toLowerCase().includes(q) || (kelas.jurusan || '').toLowerCase().includes(q)
    const filteredSiswa = kelas.siswa.filter(s => s.nama.toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q))
    if (kelasMatch) return kelas
    if (filteredSiswa.length > 0) return { ...kelas, siswa: filteredSiswa, total_siswa: filteredSiswa.length }
    return null
  }).filter(Boolean)

  // Filter data pindah berdasarkan search
  const filteredKelasPindah = kelasData.filter(kelas => {
    if (!searchPindah) return true
    const q = searchPindah.toLowerCase()
    return kelas.nama_kelas.toLowerCase().includes(q) || (kelas.jurusan || '').toLowerCase().includes(q)
  })

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
        await Promise.all([fetchKelasData(), fetchPreview(), fetchHistory(), fetchStatistik()])
      } else {
        toast.error(res.message || 'Gagal pindah kelas')
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal pindah kelas')
    } finally {
      setLoadingPindah(prev => ({ ...prev, [kelasAsalId]: false }))
    }
  }

  const handlePindahSiswaSelektif = async () => {
    if (selectedPindah.size === 0) { toast.error('Pilih minimal 1 siswa'); return }
    if (!pindahTujuanGlobal) { toast.error('Pilih kelas tujuan dulu'); return }
    const tujuanNama = kelasList.find(k => k.id == pindahTujuanGlobal)?.nama_kelas || pindahTujuanGlobal
    const confirmed = await confirmAction(
      `Pindah ${selectedPindah.size} Siswa?`,
      `${selectedPindah.size} siswa akan dipindah ke "${tujuanNama}". Tindakan ini tidak dapat dibatalkan!`
    )
    if (!confirmed) return
    try {
      setLoadingPindahSelektif(true)
      const res = await naikKelasService.pindahSiswa(Array.from(selectedPindah), pindahTujuanGlobal)
      if (res.success) {
        toast.success(res.message)
        setSelectedPindah(new Set())
        setPindahTujuanGlobal('')
        await Promise.all([fetchKelasData(), fetchPreview(), fetchHistory(), fetchStatistik()])
      } else {
        toast.error(res.message || 'Gagal pindah siswa')
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal pindah siswa')
    } finally {
      setLoadingPindahSelektif(false)
    }
  }

  const togglePindahSiswa = (siswaId) => {
    setSelectedPindah(prev => {
      const next = new Set(prev)
      if (next.has(siswaId)) next.delete(siswaId)
      else next.add(siswaId)
      return next
    })
  }

  const togglePindahKelas = (kelas) => {
    const ids = kelas.siswa.map(s => s.id)
    setSelectedPindah(prev => {
      const next = new Set(prev)
      const allSel = ids.every(id => next.has(id))
      if (allSel) ids.forEach(id => next.delete(id))
      else ids.forEach(id => next.add(id))
      return next
    })
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

  const fetchRekomendasi = async () => {
    try {
      setLoadingRekomendasi(true)
      const res = await adminApi.getRekomendasiNaikKelas()
      const d = res.data?.data
      setRekomendasi(d?.data || [])
      setRekomendasiStats(d?.stats || null)
    } catch { toast.error('Gagal memuat rekomendasi') }
    finally { setLoadingRekomendasi(false) }
  }

  const handlePakaiRekomendasi = async () => {
    // Ambil siswa_ids dari rekomendasi pending, lalu pindah ke tab selektif dengan pre-select
    try {
      const res = await adminApi.getRekomendasiSiswaIds()
      const ids = res.data?.data?.siswa_ids || []
      if (ids.length === 0) { toast.error('Tidak ada rekomendasi pending'); return }
      // Set selected siswa dan pindah ke tab selektif
      setSelectedSiswa(new Set(ids.map(Number)))
      setActiveTab('selektif')
      toast.success(`${ids.length} siswa dari rekomendasi guru sudah dipilih di tab Naik Kelas Selektif`)
    } catch { toast.error('Gagal memuat data rekomendasi') }
  }

  const handleUpdateStatusRekomendasi = async (id, status) => {
    try {
      await adminApi.updateStatusRekomendasi(id, { status })
      toast.success('Status diperbarui')
      fetchRekomendasi()
    } catch { toast.error('Gagal update status') }
  }

  const handleResetRekomendasi = async () => {
    const confirmed = await confirmAction(
      'Reset Semua Rekomendasi?',
      'Semua rekomendasi akan dihapus. Guru bisa mengirim rekomendasi baru di siklus berikutnya.'
    )
    if (!confirmed) return
    try {
      await adminApi.resetRekomendasiNaikKelas()
      toast.success('Semua rekomendasi berhasil direset')
      fetchRekomendasi()
      // Refresh kelas data supaya tidak_naik hilang
      if (activeTab === 'selektif') fetchKelasData()
    } catch { toast.error('Gagal reset rekomendasi') }
  }

  // Set berisi semua siswa_id yang tidak boleh naik kelas (dari rekomendasi guru)
  const tidakNaikSet = new Set(
    kelasData.flatMap(k => k.siswa.filter(s => s.tidak_naik).map(s => s.id))
  )

  const toggleSiswa = (siswaId) => {
    // Jangan izinkan centang siswa yang tidak naik kelas
    if (tidakNaikSet.has(siswaId)) return
    setSelectedSiswa(prev => {
      const next = new Set(prev)
      if (next.has(siswaId)) next.delete(siswaId)
      else next.add(siswaId)
      return next
    })
  }

  const toggleKelas = (kelas) => {
    // Hanya pilih siswa yang BOLEH naik (tidak_naik = false)
    const ids = kelas.siswa.filter(s => !s.tidak_naik).map(s => s.id)
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
    // Hanya pilih siswa yang BOLEH naik (tidak_naik = false)
    const ids = kelasTingkat.flatMap(k => k.siswa.filter(s => !s.tidak_naik).map(s => s.id))
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
    // Pastikan siswa tidak_naik tidak ikut diproses (double safeguard)
    const idsAman = Array.from(selectedSiswa).filter(id => !tidakNaikSet.has(id))
    if (idsAman.length === 0) {
      toast.error('Tidak ada siswa yang bisa diproses')
      return
    }
    const confirmed = await confirmAction(
      `Proses ${idsAman.length} Siswa?`,
      `Siswa kelas X/XI akan naik kelas. Siswa kelas XII akan dijadikan alumni. Tindakan ini tidak dapat dibatalkan!`
    )
    if (!confirmed) return
    try {
      setLoadingSelektif(true)
      const res = await naikKelasService.prosesSelektif(idsAman)
      if (res.success) {
        toast.success(res.message)
        setSelectedSiswa(new Set())
        await Promise.all([fetchKelasData(), fetchPreview(), fetchHistory(), fetchStatistik()])
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
        // Refresh semua data sekarang juga — tidak perlu reload halaman
        await Promise.all([fetchPreview(), fetchHistory(), fetchStatistik()])
        if (activeTab === 'selektif' || activeTab === 'pindah') {
          await fetchKelasData()
        }
      } else {
        // Jika sudah pernah diproses, tawarkan force
        if (res.message?.includes('sudah pernah diproses')) {
          const forceConfirmed = await confirmAction(
            'Proses Ulang Naik Kelas?',
            'Naik kelas sudah pernah diproses untuk tahun ajaran ini. Apakah Anda yakin ingin memproses ulang? Siswa yang sudah naik kelas akan diproses lagi.'
          )
          if (forceConfirmed) {
            const resForce = await naikKelasService.proses(true)
            if (resForce.success) {
              toast.success('Naik kelas berhasil diproses ulang!')
              await Promise.all([fetchPreview(), fetchHistory(), fetchStatistik()])
              if (activeTab === 'selektif' || activeTab === 'pindah') {
                await fetchKelasData()
              }
            } else {
              toast.error(resForce.message || 'Gagal proses ulang naik kelas')
            }
          }
        } else {
          toast.error(res.message || 'Gagal proses naik kelas')
        }
      }
    } catch (error) {
      console.error('Error proses naik kelas:', error)
      const msg = error.response?.data?.message || 'Gagal proses naik kelas'
      toast.error(msg)
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
    <div className="w-full max-w-full overflow-x-hidden space-y-5">

      {/* ═══════════════════════════════════════════════════════════
          HEADER CARD — Full-width gradient emerald→teal
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 shadow-2xl shadow-emerald-500/30">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-5 sm:p-7">
          {/* Top row: icon + title + action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Left: icon + title */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                  <TrendingUp size={26} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                  <Sparkles size={9} className="text-yellow-900" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                  Naik Kelas
                </h1>
                <p className="text-emerald-100 text-sm mt-1 font-medium">
                  Proses kenaikan kelas siswa akhir tahun ajaran
                </p>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => { fetchPreview(); fetchHistory(); fetchStatistik() }}
                className="p-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white rounded-xl transition-all shadow-sm"
                title="Refresh data"
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={handleProsesNaikKelas}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 rounded-xl font-bold text-sm shadow-lg transition-all"
              >
                {loading ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Play size={15} className="fill-emerald-600" />
                )}
                Proses Naik Kelas
              </button>
            </div>
          </div>

          {/* Stat pills row */}
          {statistik && (
            <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-white/20">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-4 py-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wide">Total Diproses</p>
                  <p className="text-white text-lg font-black leading-none">{statistik.statistik?.total || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-4 py-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wide">Naik Kelas</p>
                  <p className="text-white text-lg font-black leading-none">{statistik.statistik?.naik || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-4 py-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <GraduationCap size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wide">Lulus (Alumni)</p>
                  <p className="text-white text-lg font-black leading-none">{statistik.statistik?.lulus || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ═══════════════════════════════════════════════════════════
          WARNING BANNER — Orange/amber collapsible
      ═══════════════════════════════════════════════════════════ */}
      <WarningBanner />

      {/* ═══════════════════════════════════════════════════════════
          TABS — Pill style, horizontal scroll on mobile
      ═══════════════════════════════════════════════════════════ */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-max min-w-full sm:w-auto">
          {[
            { id: 'preview', label: 'Preview', icon: Eye },
            { id: 'pindah', label: 'Pindah Kelas', icon: MoveRight },
            { id: 'selektif', label: 'Naik Kelas Selektif', icon: ListChecks },
            { id: 'rekomendasi', label: 'Rekomendasi Guru', icon: Bell, badge: rekomendasiStats?.pending > 0 ? rekomendasiStats.pending : null },
            { id: 'history', label: 'Riwayat', icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
              {tab.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB CONTENT
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'preview' && (
        <>
          {loadingPreview ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-3">
                <RefreshCw size={22} className="text-emerald-500 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Memuat preview data...</p>
              <p className="text-xs text-slate-400 mt-1">Mohon tunggu sebentar</p>
            </div>
          ) : preview ? (
            <div className="space-y-4">
              {/* Tahun ajaran card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-lg">
                <div className="flex flex-wrap items-center gap-4">
                  {/* From */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Tahun Ajaran Dari</p>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{preview.tahun_ajaran_lama}</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30 flex-shrink-0">
                    <ArrowRight size={16} className="text-white" />
                  </div>

                  {/* To */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800/40">
                      <Calendar size={16} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wide">Tahun Ajaran Ke</p>
                      <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{preview.tahun_ajaran_baru}</p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center border border-teal-200 dark:border-teal-800/40">
                      <Users size={16} className="text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-teal-500 font-semibold uppercase tracking-wide">Total Siswa</p>
                      <p className="font-bold text-sm text-teal-600 dark:text-teal-400">{preview.total_siswa}</p>
                    </div>
                  </div>
                </div>

                {/* Stats pills */}
                {preview.statistik && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800/40">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                        <TrendingUp size={11} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-[9px] text-purple-500 font-semibold">X → XI</p>
                        <p className="text-xs font-black text-purple-700 dark:text-purple-300">{preview.statistik.naik_x_xi} siswa</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800/40">
                      <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                        <TrendingUp size={11} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-[9px] text-indigo-500 font-semibold">XI → XII</p>
                        <p className="text-xs font-black text-indigo-700 dark:text-indigo-300">{preview.statistik.naik_xi_xii} siswa</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/40">
                      <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                        <GraduationCap size={11} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[9px] text-emerald-500 font-semibold">Lulus</p>
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">{preview.statistik.lulus} siswa</p>
                      </div>
                    </div>
                    {(preview.statistik.dikecualikan > 0 || preview.total_dikecualikan > 0) && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/40">
                        <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                          <UserX size={11} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-[9px] text-amber-600 font-semibold">Dikecualikan</p>
                          <p className="text-xs font-black text-amber-700 dark:text-amber-300">{preview.statistik.dikecualikan || preview.total_dikecualikan} siswa</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Toggle detail */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                  >
                    <div className={`w-5 h-5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                      <ChevronDown size={12} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {showDetails ? 'Sembunyikan' : 'Tampilkan'} detail preview siswa
                  </button>
                </div>
              </div>

              {/* Detail Preview */}
              {showDetails && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-lg overflow-hidden">
                  <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
                      <Eye size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Daftar Preview Siswa</h3>
                      <p className="text-[10px] text-slate-400">{preview.detail?.length || 0} siswa total</p>
                    </div>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-1">
                      {preview.detail?.slice(0, 50).map((item, idx) => (
                        <PreviewCard key={idx} item={item} index={idx} />
                      ))}
                    </div>
                    {preview.detail?.length > 50 && (
                      <div className="mt-4 pt-4 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
                        Menampilkan 50 dari {preview.detail.length} siswa
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-lg">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                <Info size={28} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tidak ada data preview</p>
              <p className="text-xs text-slate-400 mt-1">Belum ada data naik kelas yang bisa ditampilkan</p>
            </div>
          )}
        </>
      )}

      {/* Tab Pindah Kelas */}
      {activeTab === 'pindah' && (
        <div className="space-y-4">

          {/* Toolbar: search + kelas tujuan + centang semua + proses */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchPindah}
                  onChange={e => setSearchPindah(e.target.value)}
                  placeholder="Cari nama siswa, NIS, atau kelas..."
                  className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                />
                {searchPindah && (
                  <button onClick={() => setSearchPindah('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={12} />
                  </button>
                )}
              </div>
              {/* Kelas tujuan global */}
              <select
                value={pindahTujuanGlobal}
                onChange={e => setPindahTujuanGlobal(e.target.value)}
                disabled={loadingKelasList}
                className="sm:w-56 px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-700 dark:text-slate-200"
              >
                <option value="">-- Pilih kelas tujuan --</option>
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Centang Semua */}
              {(() => {
                const semuaIds = kelasData
                  .flatMap(k => k.siswa)
                  .filter(s => {
                    if (!searchPindah) return true
                    const q = searchPindah.toLowerCase()
                    return s.nama?.toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q)
                  })
                  .map(s => s.id)
                const semuaSel = semuaIds.length > 0 && semuaIds.every(id => selectedPindah.has(id))
                return (
                  <button
                    onClick={() => {
                      if (semuaSel) setSelectedPindah(new Set())
                      else setSelectedPindah(new Set(semuaIds))
                    }}
                    disabled={loadingKelas || semuaIds.length === 0}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 ${
                      semuaSel
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:text-emerald-600'
                    }`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${semuaSel ? 'bg-white border-white' : 'border-current'}`}>
                      {semuaSel && <Check size={10} className="text-emerald-500" strokeWidth={3}/>}
                    </div>
                    {semuaSel ? 'Batal Semua' : 'Centang Semua'}
                    <span className="text-[10px] opacity-70">({semuaIds.length})</span>
                  </button>
                )
              })()}

              {selectedPindah.size > 0 && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  {selectedPindah.size} dipilih
                </span>
              )}

              <button
                onClick={handlePindahSiswaSelektif}
                disabled={loadingPindahSelektif || selectedPindah.size === 0 || !pindahTujuanGlobal}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all ml-auto">
                {loadingPindahSelektif ? <RefreshCw size={13} className="animate-spin"/> : <MoveRight size={13}/>}
                Pindah {selectedPindah.size > 0 ? `(${selectedPindah.size})` : ''} Siswa
              </button>
            </div>

            {!pindahTujuanGlobal && selectedPindah.size > 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle size={11}/> Pilih kelas tujuan dulu sebelum proses
              </p>
            )}
          </div>

          {/* List kelas + siswa */}
          {loadingKelas ? (
            <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              <RefreshCw size={20} className="text-emerald-500 animate-spin mr-2" />
              <span className="text-xs text-slate-500">Memuat data...</span>
            </div>
          ) : kelasData.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              <School size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs text-slate-400">Tidak ada data kelas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {kelasData.map(kelas => {
                // Filter siswa berdasarkan search
                const siswaFiltered = searchPindah
                  ? kelas.siswa.filter(s => {
                      const q = searchPindah.toLowerCase()
                      return s.nama?.toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q)
                    })
                  : kelas.siswa

                // Sembunyikan kelas kalau search aktif dan tidak ada siswa cocok
                if (searchPindah && siswaFiltered.length === 0) return null

                const isExpanded = expandedPindahKelas.has(kelas.kelas_id) || !!searchPindah
                const ids = siswaFiltered.map(s => s.id)
                const allSel = ids.length > 0 && ids.every(id => selectedPindah.has(id))
                const someSel = ids.some(id => selectedPindah.has(id))

                return (
                  <div key={kelas.kelas_id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    {/* Header kelas */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
                      {/* Checkbox kelas */}
                      <button onClick={() => {
                        const next = new Set(selectedPindah)
                        if (allSel) ids.forEach(id => next.delete(id))
                        else ids.forEach(id => next.add(id))
                        setSelectedPindah(next)
                      }}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          allSel ? 'bg-emerald-500 border-emerald-500' :
                          someSel ? 'bg-emerald-200 border-emerald-400' :
                          'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                        }`}>
                        {(allSel || someSel) && <Check size={11} className="text-white"/>}
                      </button>

                      <button onClick={() => setExpandedPindahKelas(prev => {
                        const n = new Set(prev)
                        if (n.has(kelas.kelas_id)) n.delete(kelas.kelas_id)
                        else n.add(kelas.kelas_id)
                        return n
                      })} className="flex-1 flex items-center gap-3 text-left">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <GraduationCap size={13} className="text-emerald-600 dark:text-emerald-400"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{kelas.nama_kelas}</p>
                          <p className="text-[10px] text-slate-400">{kelas.jurusan} · {siswaFiltered.length} siswa{searchPindah && siswaFiltered.length !== kelas.total_siswa ? ` (dari ${kelas.total_siswa})` : ''}</p>
                        </div>
                        {someSel && !allSel && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full flex-shrink-0">
                            {ids.filter(id => selectedPindah.has(id)).length} dipilih
                          </span>
                        )}
                        {allSel && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full flex-shrink-0">
                            Semua dipilih
                          </span>
                        )}
                        <ChevronDown size={14} className={`text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}/>
                      </button>
                    </div>

                    {/* List siswa */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {siswaFiltered.length === 0 ? (
                          <p className="px-4 py-3 text-xs text-slate-400 italic">Tidak ada siswa aktif</p>
                        ) : siswaFiltered.map(siswa => {
                          const isSel = selectedPindah.has(siswa.id)
                          return (
                            <button key={siswa.id} onClick={() => togglePindahSiswa(siswa.id)}
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
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{siswa.nama?.charAt(0)}</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{siswa.nama}</p>
                                <p className="text-[10px] text-slate-400">{siswa.nis}</p>
                              </div>
                              {isSel && pindahTujuanGlobal && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex-shrink-0 flex items-center gap-1">
                                  <MoveRight size={10}/>
                                  {kelasList.find(k => k.id == pindahTujuanGlobal)?.nama_kelas}
                                </span>
                              )}
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
            <div className="flex items-center gap-2 flex-wrap">
              {/* TOMBOL CENTANG SEMUA */}
              {(() => {
                const semuaBolehNaik = kelasData.flatMap(k => k.siswa.filter(s => !s.tidak_naik).map(s => s.id))
                const semuaSelected = semuaBolehNaik.length > 0 && semuaBolehNaik.every(id => selectedSiswa.has(id))
                const totalTidakNaik = kelasData.reduce((a, k) => a + (k.total_tidak_naik || 0), 0)
                return (
                  <button
                    onClick={() => {
                      if (semuaSelected) {
                        setSelectedSiswa(new Set())
                      } else {
                        setSelectedSiswa(new Set(semuaBolehNaik))
                      }
                    }}
                    disabled={loadingKelas || semuaBolehNaik.length === 0}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 ${
                      semuaSelected
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:text-emerald-600'
                    }`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${semuaSelected ? 'bg-white border-white' : 'border-current'}`}>
                      {semuaSelected && <Check size={10} className="text-emerald-500" strokeWidth={3}/>}
                    </div>
                    {semuaSelected ? 'Batal Semua' : 'Centang Semua'}
                    <span className="text-[10px] opacity-70">({semuaBolehNaik.length})</span>
                    {totalTidakNaik > 0 && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full text-[9px] font-black">
                        {totalTidakNaik} dikecualikan
                      </span>
                    )}
                  </button>
                )
              })()}
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

          {/* Search selektif */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchSelektif}
              onChange={e => setSearchSelektif(e.target.value)}
              placeholder="Cari nama siswa, NIS, atau nama kelas..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 shadow-sm"
            />
            {searchSelektif && (
              <button onClick={() => setSearchSelektif('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Shortcut angkatan */}
          {!searchSelektif && (
          <div className="flex flex-wrap gap-2">
            {['10','11','12'].map(t => {
              const kelasTingkat = kelasData.filter(k => String(k.tingkat) === t)
              if (!kelasTingkat.length) return null
              // Hanya hitung siswa yang boleh naik
              const ids = kelasTingkat.flatMap(k => k.siswa.filter(s => !s.tidak_naik).map(s => s.id))
              const totalTidakNaik = kelasTingkat.reduce((a, k) => a + (k.total_tidak_naik || 0), 0)
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
                  {totalTidakNaik > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full text-[9px] font-black">
                      {totalTidakNaik} tidak naik
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          )}

          {/* List kelas */}
          {loadingKelas ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="text-emerald-500 animate-spin"/>
            </div>
          ) : filteredKelasSelektif.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Users size={32} className="mx-auto mb-2 text-slate-300"/>
              <p className="text-sm text-slate-400">{searchSelektif ? 'Tidak ada hasil pencarian' : 'Tidak ada data kelas aktif'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredKelasSelektif.map(kelas => {
                // Hanya hitung siswa yang boleh naik (tidak_naik = false)
                const ids = kelas.siswa.filter(s => !s.tidak_naik).map(s => s.id)
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[10px] text-slate-400">{kelas.jurusan} · {kelas.total_siswa} siswa</p>
                            {kelas.total_tidak_naik > 0 && (
                              <span className="text-[9px] font-black text-red-500 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <UserX size={8}/>{kelas.total_tidak_naik} tidak naik
                              </span>
                            )}
                          </div>
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
                          const tidakNaik = siswa.tidak_naik === true

                          if (tidakNaik) {
                            // Siswa tidak naik kelas — tampil tapi tidak bisa dicentang
                            return (
                              <div key={siswa.id}
                                className="w-full flex items-center gap-3 px-4 py-2.5 bg-red-50 dark:bg-red-900/10 cursor-not-allowed opacity-80">
                                {/* Checkbox dikunci */}
                                <div className="w-4 h-4 rounded border-2 border-red-300 dark:border-red-700 flex items-center justify-center flex-shrink-0 bg-red-100 dark:bg-red-900/30">
                                  <X size={9} className="text-red-500"/>
                                </div>
                                {siswa.foto ? (
                                  <img src={siswa.foto} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 opacity-60"/>
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-bold text-red-500">{siswa.nama?.charAt(0)}</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-red-700 dark:text-red-400 truncate">{siswa.nama}</p>
                                  <p className="text-[10px] text-slate-400">{siswa.nis}</p>
                                </div>
                                <span className="text-[10px] font-black text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                                  <UserX size={9}/>Tidak Naik
                                </span>
                              </div>
                            )
                          }

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

      {/* Tab Rekomendasi Guru */}
      {activeTab === 'rekomendasi' && (
        <div className="space-y-4">
          {/* Header + action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex-shrink-0">
                <Bell size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Rekomendasi dari Guru</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Siswa yang direkomendasikan guru untuk tidak naik kelas. Klik tombol di bawah untuk langsung memilih mereka di tab Naik Kelas Selektif.</p>
              </div>
            </div>
            <button onClick={handlePakaiRekomendasi}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-500/25 transition-all flex-shrink-0 self-start sm:self-auto">
              <ListChecks size={13} />
              Pakai Rekomendasi → Selektif
            </button>
            <button onClick={handleResetRekomendasi}
              className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 rounded-xl text-xs font-bold transition-all flex-shrink-0 self-start sm:self-auto">
              <X size={13} />
              Reset Semua
            </button>
          </div>

          {/* Stats */}
          {rekomendasiStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total', value: rekomendasiStats.total, color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
                { label: 'Menunggu', value: rekomendasiStats.pending, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
                { label: 'Diproses', value: rekomendasiStats.diproses, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' },
                { label: 'Ditolak', value: rekomendasiStats.ditolak, color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl p-3 border border-slate-200 dark:border-slate-700`}>
                  <p className="text-[10px] font-medium opacity-70 mb-1">{s.label}</p>
                  <p className="text-xl font-black">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* List rekomendasi */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {loadingRekomendasi ? (
              <div className="flex items-center justify-center py-16"><RefreshCw size={24} className="animate-spin text-violet-500" /></div>
            ) : rekomendasi.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Bell size={40} className="text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-500">Belum ada rekomendasi dari guru</p>
                <p className="text-xs text-slate-400 mt-1">Guru bisa mengirim rekomendasi dari menu Naik Kelas di panel guru</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {rekomendasi.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Avatar */}
                    {r.foto ? (
                      <img src={r.foto} alt={r.nama_siswa} className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-slate-800" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {r.nama_siswa?.charAt(0)}
                      </div>
                    )}
                    {/* Info siswa */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{r.nama_siswa}</p>
                        <span className="text-[10px] text-slate-400">NIS: {r.nis}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-slate-500">{r.kelas} · {r.jurusan}</span>
                        <span className="text-[10px] text-violet-500">oleh: {r.guru_nama}</span>
                      </div>
                      {r.alasan && (
                        <p className="text-[10px] text-slate-400 mt-0.5 italic truncate">"{r.alasan}"</p>
                      )}
                    </div>
                    {/* Status + actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : r.status === 'diproses' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {r.status === 'pending' ? 'Menunggu Review' : r.status === 'diproses' ? '✓ Disetujui (Tidak Naik)' : '✗ Ditolak (Bisa Naik)'}
                      </span>
                      {r.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleUpdateStatusRekomendasi(r.id, 'diproses')}
                            className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all" title="Setujui — siswa tidak naik kelas">
                            <Check size={12} />
                          </button>
                          <button onClick={() => handleUpdateStatusRekomendasi(r.id, 'ditolak')}
                            className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 rounded-lg transition-all" title="Tolak — siswa tetap bisa naik kelas">
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab History */}
      {activeTab === 'history' && (
        <>
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-3">
                <RefreshCw size={22} className="text-emerald-500 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Memuat riwayat...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-lg overflow-hidden">
              {/* Table header */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
                  <History size={14} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Riwayat Naik Kelas</h3>
                  <p className="text-[10px] text-slate-400">{history.length} data riwayat</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tahun Ajaran</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kelas Lama</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kelas Baru</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
                    {history.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <SiswaAvatar foto={item.siswa?.foto_url} nama={item.siswa_nama} size="sm" />
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                              {item.siswa_nama}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                            {item.tahun_ajaran_lama}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                          {item.kelas_lama}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <ArrowRight size={10} className="text-emerald-500 flex-shrink-0" />
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              {item.kelas_baru || 'Alumni'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock size={9} className="text-slate-400 flex-shrink-0" />
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
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-lg">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                <History size={28} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Belum ada riwayat naik kelas</p>
              <p className="text-xs text-slate-400 mt-1">Riwayat akan muncul setelah proses naik kelas dilakukan</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}