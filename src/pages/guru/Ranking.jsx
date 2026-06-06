import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, TrendingUp, TrendingDown, Calendar,
  Medal, Star, Crown, User, Users, Clock,
  AlertCircle, XCircle, CheckCircle, Award,
  Sparkles, GraduationCap, School, ChevronDown,
  BarChart3, Activity, Filter, CalendarRange,
} from 'lucide-react'
import { guruApi } from '../../services/guruService'
import toast from 'react-hot-toast'

const BULAN_OPTIONS = [
  { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },   { value: 5, label: 'Mei' },       { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },    { value: 8, label: 'Agustus' },   { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },{ value: 11, label: 'November' }, { value: 12, label: 'Desember' },
]
const TAHUN_OPTIONS  = [2024, 2025, 2026, 2027]
const TINGKAT_OPTIONS = [
  { value: '', label: 'Semua Angkatan' },
  { value: '10', label: 'Kelas 10' },
  { value: '11', label: 'Kelas 11' },
  { value: '12', label: 'Kelas 12' },
]

export default function GuruRanking() {
  const [loading, setLoading]     = useState(false)
  const [rankingData, setRankingData] = useState(null)
  const [kelasAmpu, setKelasAmpu] = useState(null)
  const [showStats, setShowStats] = useState(true)
  const [filters, setFilters]     = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    tingkat: '',
  })
  const [useRange, setUseRange]               = useState(false)
  const [tanggalMulai, setTanggalMulai]       = useState('')
  const [tanggalSelesai, setTanggalSelesai]   = useState('')

  useEffect(() => { fetchKelasDiampu() }, [])
  useEffect(() => { if (kelasAmpu) fetchRanking() }, [filters, kelasAmpu])

  const fetchKelasDiampu = async () => {
    try {
      const res = await guruApi.getKelasDiampu()
      const kelasData = res.data.data || []
      if (!kelasData.length) {
        toast.error('Belum ada kelas yang diampu. Hubungi admin.')
        return
      }
      setKelasAmpu(kelasData[0])
    } catch {
      toast.error('Gagal memuat daftar kelas')
    }
  }

  const fetchRanking = async () => {
    if (!kelasAmpu) return
    try {
      setLoading(true)
      const params = {
        bulan:    filters.bulan,
        tahun:    filters.tahun,
        kelas_id: kelasAmpu.id,
      }
      if (filters.tingkat) params.tingkat = filters.tingkat
      if (useRange && tanggalMulai && tanggalSelesai) {
        params.tanggal_mulai   = tanggalMulai
        params.tanggal_selesai = tanggalSelesai
        delete params.bulan
        delete params.tahun
      }
      const res = await guruApi.getRankingSiswa(params)
      setRankingData(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat data ranking')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyRange = () => {
    if (useRange && (!tanggalMulai || !tanggalSelesai)) {
      toast.error('Isi tanggal mulai dan selesai')
      return
    }
    fetchRanking()
  }

  const getBulanName = (v) => BULAN_OPTIONS.find(b => b.value === v)?.label || ''
  const periodeLabel = useRange && tanggalMulai && tanggalSelesai
    ? `${tanggalMulai} – ${tanggalSelesai}`
    : `${getBulanName(filters.bulan)} ${filters.tahun}`
  const tingkatLabel = TINGKAT_OPTIONS.find(t => t.value === filters.tingkat)?.label || 'Semua Angkatan'

  // ── Avatar ─────────────────────────────────────────────────────────────────
  const Avatar = ({ src, name, size = 32 }) => {
    const [err, setErr] = useState(false)
    const initial = (name || '?')[0].toUpperCase()
    return (
      <div className={`w-${size === 32 ? 7 : size === 36 ? 8 : 9} h-${size === 32 ? 7 : size === 36 ? 8 : 9} rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold text-xs flex-shrink-0`}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}>
        {src && !err
          ? <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} />
          : initial}
      </div>
    )
  }

  // ── Ranking Card ───────────────────────────────────────────────────────────
  const RankingCard = ({ title, data, icon: Icon, gradient, type }) => {
    const getPositionColor = (i) => {
      if (i === 0) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      if (i === 1) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      if (i === 2) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800'
      return 'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    }
    const getVal = (siswa) => {
      if (type === 'rajin') return (
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">{siswa.total_hadir}x</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{siswa.persentase_kehadiran}%</p>
        </div>
      )
      if (type === 'terlambat') return (
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <Clock size={11} className="flex-shrink-0" />
          <span className="font-bold text-xs sm:text-sm">{siswa.total_terlambat}x</span>
        </div>
      )
      return (
        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
          <XCircle size={11} className="flex-shrink-0" />
          <span className="font-bold text-xs sm:text-sm">{siswa.total_alpha}x</span>
        </div>
      )
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-lg transition-all">
        <div className={`p-3 sm:p-4 ${gradient} border-b border-slate-200 dark:border-slate-700`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
                <Icon size={15} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
                <p className="text-[10px] text-white/80 truncate">{kelasAmpu?.nama_kelas} · {periodeLabel}</p>
              </div>
            </div>
            <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-[10px] sm:text-xs font-medium flex-shrink-0">
              Top {data?.length || 0}
            </div>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          {data && data.length > 0 ? (
            <div className="space-y-1.5 sm:space-y-2">
              {data.map((siswa, i) => (
                <motion.div key={siswa.id}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all hover:shadow-md ${
                    i === 0
                      ? 'bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10 border-amber-200 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700'
                  }`}>
                  <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-bold text-[10px] sm:text-xs border ${getPositionColor(i)}`}>
                    {i + 1}
                  </div>
                  <Avatar src={siswa.foto_url || siswa.foto} name={siswa.nama_lengkap} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm truncate">{siswa.nama_lengkap}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                      {siswa.kelas?.nama_kelas || '-'} · {siswa.nis}
                    </p>
                  </div>
                  {getVal(siswa)}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 inline-block mb-3">
                <Users size={22} className="text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada data untuk periode ini</p>
            </div>
          )}
        </div>
        {data && data.length > 0 && (
          <div className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Activity size={9} className="flex-shrink-0" />
              <span className="truncate">Data kehadiran {periodeLabel}</span>
            </p>
          </div>
        )}
      </motion.div>
    )
  }

  const StatSummary = () => {
    if (!rankingData) return null
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex-shrink-0">
              <BarChart3 size={13} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ringkasan Statistik</h3>
          </div>
          <button onClick={() => setShowStats(!showStats)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0">
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${showStats ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <AnimatePresence>
          {showStats && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'Total',  val: rankingData.total_siswa || 0,                         bg: 'bg-slate-50 dark:bg-slate-700/50',           text: 'text-slate-900 dark:text-white' },
                { label: 'Rajin',  val: rankingData.siswa_rajin?.length || 0,                  bg: 'bg-emerald-50 dark:bg-emerald-900/20',        text: 'text-emerald-700 dark:text-emerald-300' },
                { label: 'Telat',  val: rankingData.siswa_sering_terlambat?.length || 0,       bg: 'bg-amber-50 dark:bg-amber-900/20',            text: 'text-amber-700 dark:text-amber-300' },
                { label: 'Alpha',  val: rankingData.siswa_sering_alpha?.length || 0,           bg: 'bg-rose-50 dark:bg-rose-900/20',              text: 'text-rose-700 dark:text-rose-300' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
                  <p className={`text-base sm:text-lg font-bold ${s.text}`}>{s.val}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  if (!kelasAmpu && !loading) return (
    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 text-center border border-amber-200 dark:border-amber-800">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
        <School size={24} className="text-amber-600 dark:text-amber-400" />
      </div>
      <h3 className="text-base font-semibold text-amber-900 dark:text-amber-100 mb-2">Tidak Ada Kelas yang Diampu</h3>
      <p className="text-xs text-amber-700 dark:text-amber-300">Hubungi admin untuk menambahkan penugasan kelas.</p>
    </div>
  )

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex-shrink-0">
            <Trophy size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Ranking Siswa</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {kelasAmpu?.nama_kelas || '...'} · {periodeLabel} · {tingkatLabel}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 sm:p-4 space-y-3">

        {/* Info kelas */}
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 w-fit">
          <School size={13} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Kelas: {kelasAmpu?.nama_kelas || '...'}</span>
        </div>

        {/* Row 1: Bulan, Tahun, Tingkat */}
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 self-center">
            <Filter size={12} /> Periode
          </div>

          <div className="flex-1 min-w-[110px]">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Bulan</label>
            <select value={filters.bulan} onChange={e => setFilters(p => ({ ...p, bulan: +e.target.value }))}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
              {BULAN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[80px]">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Tahun</label>
            <select value={filters.tahun} onChange={e => setFilters(p => ({ ...p, tahun: +e.target.value }))}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
              {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              <School size={9} className="inline mr-1" />Angkatan
            </label>
            <select value={filters.tingkat} onChange={e => setFilters(p => ({ ...p, tingkat: e.target.value }))}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
              {TINGKAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Date range */}
        <div className="flex flex-wrap items-end gap-2.5">
          <button onClick={() => setUseRange(!useRange)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              useRange
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500'
            }`}>
            <CalendarRange size={12} />
            {useRange ? 'Date Range ✓' : 'Date Range'}
          </button>

          {useRange && (
            <>
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Dari</label>
                <input type="date" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
              </div>
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Sampai</label>
                <input type="date" value={tanggalSelesai} onChange={e => setTanggalSelesai(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
              </div>
              <button onClick={handleApplyRange}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
                Tampilkan
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Memuat ranking...</p>
        </div>
      )}

      {!loading && kelasAmpu && (
        <>
          <StatSummary />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <RankingCard title="Siswa Paling Rajin"   data={rankingData?.siswa_rajin?.slice(0, 5)} icon={Trophy} gradient="bg-gradient-to-r from-emerald-500 to-teal-500" type="rajin" />
            <RankingCard title="Sering Terlambat"      data={[...(rankingData?.siswa_sering_terlambat||[])].sort((a,b)=>b.total_terlambat-a.total_terlambat).slice(0,5)} icon={TrendingDown} gradient="bg-gradient-to-r from-amber-500 to-orange-500" type="terlambat" />
            <RankingCard title="Sering Alpha"          data={[...(rankingData?.siswa_sering_alpha||[])].sort((a,b)=>b.total_alpha-a.total_alpha).slice(0,5)} icon={TrendingUp} gradient="bg-gradient-to-r from-rose-500 to-red-500" type="alpha" />
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex-shrink-0">
                <Sparkles size={13} className="text-emerald-600" />
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Data ranking kehadiran siswa kelas <strong>{kelasAmpu?.nama_kelas}</strong> periode <strong>{periodeLabel}</strong>
                {filters.tingkat ? `, angkatan kelas ${filters.tingkat}` : ''}.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
