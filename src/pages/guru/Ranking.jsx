import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, TrendingDown, Calendar,
  Users, Clock, XCircle, CheckCircle,
  Sparkles, School, ChevronDown,
  BarChart3, Activity, Filter, CalendarRange, RefreshCw,
  AlertTriangle, Building2, Medal, Award, Crown, Star,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { guruApi } from '../../services/guruService'
import toast from 'react-hot-toast'
import SiswaProfileModal from '../../components/SiswaProfileModal'

const BULAN_OPTIONS = [
  { value: 1,  label: 'Januari'   }, { value: 2,  label: 'Februari'  }, { value: 3,  label: 'Maret'     },
  { value: 4,  label: 'April'     }, { value: 5,  label: 'Mei'        }, { value: 6,  label: 'Juni'       },
  { value: 7,  label: 'Juli'      }, { value: 8,  label: 'Agustus'   }, { value: 9,  label: 'September'  },
  { value: 10, label: 'Oktober'   }, { value: 11, label: 'November'  }, { value: 12, label: 'Desember'   },
]
const TAHUN_OPTIONS = [2024, 2025, 2026, 2027]

const SCOPE_OPTIONS = [
  { value: 'kelas', label: 'Kelas Saya', icon: School  },
  { value: '10',    label: 'Kelas 10',   icon: Trophy  },
  { value: '11',    label: 'Kelas 11',   icon: Trophy  },
  { value: '12',    label: 'Kelas 12',   icon: Trophy  },
]

const TABS = [
  { key: 'rajin',     label: 'Rajin',     color: '#10b981', grad: 'linear-gradient(135deg,#059669,#10b981)', icon: CheckCircle,   desc: 'Paling sering hadir'     },
  { key: 'terlambat', label: 'Terlambat', color: '#f59e0b', grad: 'linear-gradient(135deg,#d97706,#f59e0b)', icon: Clock,         desc: 'Paling sering terlambat' },
  { key: 'alpha',     label: 'Alpha',     color: '#ef4444', grad: 'linear-gradient(135deg,#dc2626,#ef4444)', icon: AlertTriangle, desc: 'Paling sering alpha'     },
]

const PODIUM_CFG = [
  { rank: 1, size: 64, ringColor: '#f59e0b', order: 'order-2', baseH: 'h-20', Icon: Trophy },
  { rank: 2, size: 52, ringColor: '#94a3b8', order: 'order-1', baseH: 'h-14', Icon: Medal  },
  { rank: 3, size: 46, ringColor: '#f97316', order: 'order-3', baseH: 'h-10', Icon: Award  },
]

// Helper: kelas bisa string atau {id, nama_kelas}
const getKelasLabel = (kelas) => {
  if (!kelas) return '-'
  if (typeof kelas === 'object') return kelas.nama_kelas || kelas.nama || '-'
  return kelas
}

// ─── AVATAR ───────────────────────────────────────────────────────────────
function SiswaAvatar({ siswa, size = 44, rounded = 'rounded-2xl' }) {
  const [err, setErr] = useState(false)
  const initial = (siswa?.nama_lengkap || 'S').charAt(0).toUpperCase()
  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden ${rounded} bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-black text-white`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {(siswa?.foto_url || siswa?.foto) && !err
        ? <img src={siswa.foto_url || siswa.foto} alt={siswa.nama_lengkap} className="w-full h-full object-cover" onError={() => setErr(true)} />
        : initial}
    </div>
  )
}

// ─── PODIUM TOP 3 ─────────────────────────────────────────────────────────
function PodiumSection({ items, type, activeTab, onAvatarClick }) {
  const getVal = (s) => type === 'rajin' ? s.total_hadir : type === 'terlambat' ? s.total_terlambat : s.total_alpha
  const top3   = items.slice(0, 3)
  if (top3.length === 0) return null
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean)
  const rankOf  = (item) => items.indexOf(item) + 1

  return (
    <div className="relative mb-4">
      <div className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg,transparent,${activeTab.color}60,transparent)` }} />
        <div className="relative z-10 pt-5 pb-5 px-4 sm:px-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <activeTab.icon size={13} style={{ color: activeTab.color }} strokeWidth={2.5} />
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Top 3 &mdash; {activeTab.desc}
            </p>
          </div>
          <div className="flex items-end justify-center gap-4 sm:gap-8 lg:gap-12">
            {ordered.map((siswa) => {
              const rank    = rankOf(siswa)
              const podCfg  = PODIUM_CFG.find(c => c.rank === rank)
              if (!podCfg) return null
              const val     = getVal(siswa)
              const PodIcon = podCfg.Icon
              return (
                <motion.div key={siswa.id}
                  className={`flex flex-col items-center gap-2 ${podCfg.order}`}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: podCfg.rank === 1 ? 0 : podCfg.rank === 2 ? 0.08 : 0.16, type: 'spring', stiffness: 200 }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: `${podCfg.ringColor}15` }}>
                    <PodIcon size={14} style={{ color: podCfg.ringColor }} strokeWidth={2} />
                  </div>
                  <motion.div whileTap={{ scale: 0.93 }}
                    className="rounded-full p-0.5 cursor-pointer"
                    onClick={() => onAvatarClick({ ...siswa, posisi: rank })}
                    style={{
                      background: `linear-gradient(135deg,${podCfg.ringColor},${podCfg.ringColor}66)`,
                      boxShadow: `0 0 14px ${podCfg.ringColor}33`,
                    }}>
                    <div className="rounded-full p-0.5 bg-white dark:bg-slate-900">
                      <SiswaAvatar siswa={siswa} size={podCfg.size} rounded="rounded-full" />
                    </div>
                  </motion.div>
                  <div className="text-center">
                    <p className="font-black text-[12px] sm:text-[13px] leading-tight max-w-[80px] truncate text-slate-800 dark:text-white">
                      {(siswa.nama_lengkap || '').split(' ')[0]}
                    </p>
                    <p className="text-[9px] sm:text-[10px] truncate max-w-[80px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {getKelasLabel(siswa.kelas)}
                    </p>
                  </div>
                  <div className={`w-full min-w-[68px] sm:min-w-[80px] flex flex-col items-center rounded-t-xl pt-2.5 pb-1.5 px-2 ${podCfg.baseH}`}
                    style={{ background: `${activeTab.color}10`, borderTop: `2px solid ${activeTab.color}35` }}>
                    <span className="font-black tabular-nums text-base sm:text-lg leading-none" style={{ color: activeTab.color }}>{val ?? 0}</span>
                    <span className="text-[8px] mt-0.5 text-slate-400 dark:text-slate-500">{activeTab.label.toLowerCase()}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── RANKING CARD ─────────────────────────────────────────────────────────
function RankingCard({ title, data = [], icon: Icon, gradient, type, periodeLabel, onProfileClick }) {
  const getPositionStyle = (i) => {
    if (i === 0) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    if (i === 1) return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    if (i === 2) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    return 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  }

  const getVal = (siswa) => {
    if (type === 'rajin') return (
      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1 justify-end">
          <CheckCircle size={10} className="text-emerald-500" />
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{siswa.total_hadir}x</span>
        </div>
        <p className="text-[10px] text-slate-400">{siswa.persentase_kehadiran}%</p>
      </div>
    )
    if (type === 'terlambat') return (
      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 flex-shrink-0">
        <Clock size={10} />
        <span className="font-bold text-xs">{siswa.total_terlambat}x</span>
      </div>
    )
    return (
      <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 flex-shrink-0">
        <XCircle size={10} />
        <span className="font-bold text-xs">{siswa.total_alpha}x</span>
      </div>
    )
  }

  const activeColor = type === 'rajin' ? '#10b981' : type === 'terlambat' ? '#f59e0b' : '#ef4444'

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className={`p-3 sm:p-4 ${gradient}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-white/20 rounded-lg flex-shrink-0">
              <Icon size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
              <p className="text-[10px] text-white/75 truncate">{periodeLabel}</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-white/20 rounded-lg text-white text-[10px] font-semibold flex-shrink-0">
            Top {data.length}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Users size={18} className="text-slate-400" />
            </div>
            <p className="text-xs text-slate-400">Belum ada data</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {data.map((siswa, i) => (
              <motion.div key={siswa.id || i}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer hover:shadow-sm active:scale-[0.98] ${
                  i === 0
                    ? 'bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
                onClick={() => onProfileClick({ ...siswa, posisi: i + 1 })}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] border ${getPositionStyle(i)}`}>
                  {i + 1}
                </div>
                <div className="relative flex-shrink-0">
                  <SiswaAvatar siswa={siswa} size={32} rounded="rounded-full" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-700"
                    style={{ background: activeColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">{siswa.nama_lengkap}</p>
                  <p className="text-[10px] text-slate-400 truncate">{getKelasLabel(siswa.kelas)} · {siswa.nis}</p>
                </div>
                {getVal(siswa)}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-700/40 border-t border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Activity size={9} />
            <span className="truncate">{periodeLabel}</span>
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ─── STAT SUMMARY ─────────────────────────────────────────────────────────
function StatSummary({ rankingData, showStats, setShowStats }) {
  if (!rankingData) return null
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <BarChart3 size={12} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ringkasan</h3>
        </div>
        <button onClick={() => setShowStats(!showStats)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${showStats ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <AnimatePresence>
        {showStats && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Total Siswa',  val: rankingData.total_siswa                    || 0, bg: 'bg-slate-50 dark:bg-slate-700/50',    text: 'text-slate-900 dark:text-white'          },
              { label: 'Paling Rajin', val: rankingData.siswa_rajin?.length            || 0, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300'  },
              { label: 'Sering Telat', val: rankingData.siswa_sering_terlambat?.length || 0, bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-700 dark:text-amber-300'      },
              { label: 'Sering Alpha', val: rankingData.siswa_sering_alpha?.length     || 0, bg: 'bg-rose-50 dark:bg-rose-900/20',       text: 'text-rose-700 dark:text-rose-300'        },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
                <p className={`text-lg font-bold ${s.text}`}>{s.val}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function GuruRanking() {
  const [loading, setLoading]           = useState(false)
  const [rankingData, setRankingData]   = useState(null)
  const [kelasAmpu, setKelasAmpu]       = useState(null)
  const [showStats, setShowStats]       = useState(true)
  const [scope, setScope]               = useState('kelas')
  const [bulan, setBulan]               = useState(new Date().getMonth() + 1)
  const [tahun, setTahun]               = useState(new Date().getFullYear())
  const [useRange, setUseRange]         = useState(false)
  const [tanggalMulai, setTanggalMulai]     = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [activeTab, setActiveTab]       = useState(TABS[0])
  const [selectedSiswa, setSelectedSiswa]   = useState(null)

  useEffect(() => { fetchKelasDiampu() }, [])
  useEffect(() => { if (kelasAmpu !== null) fetchRanking() }, [scope, bulan, tahun, kelasAmpu])

  const fetchKelasDiampu = async () => {
    try {
      const res = await guruApi.getKelasDiampu()
      setKelasAmpu((res.data.data || [])[0] || null)
    } catch {
      toast.error('Gagal memuat kelas')
      setKelasAmpu(null)
    }
  }

  const buildParams = useCallback(() => {
    const params = { bulan, tahun }
    if (scope === 'kelas') { if (kelasAmpu) params.kelas_id = kelasAmpu.id }
    else params.tingkat = scope
    if (useRange && tanggalMulai && tanggalSelesai) {
      params.tanggal_mulai   = tanggalMulai
      params.tanggal_selesai = tanggalSelesai
      delete params.bulan; delete params.tahun
    }
    return params
  }, [scope, bulan, tahun, kelasAmpu, useRange, tanggalMulai, tanggalSelesai])

  const fetchRanking = useCallback(async () => {
    setLoading(true)
    try {
      const res = await guruApi.getRankingSiswa(buildParams())
      setRankingData(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat ranking')
    } finally {
      setLoading(false)
    }
  }, [buildParams])

  const handleApplyRange = () => {
    if (!tanggalMulai || !tanggalSelesai) { toast.error('Isi tanggal mulai dan selesai'); return }
    fetchRanking()
  }

  const getBulanName  = (v) => BULAN_OPTIONS.find(b => b.value === v)?.label || ''
  const periodeLabel  = useRange && tanggalMulai && tanggalSelesai
    ? `${tanggalMulai} – ${tanggalSelesai}`
    : `${getBulanName(bulan)} ${tahun}`
  const scopeLabel    = scope === 'kelas'
    ? (kelasAmpu ? kelasAmpu.nama_kelas : 'Kelas Saya')
    : `Angkatan Kelas ${scope}`

  const tabData = rankingData
    ? (activeTab.key === 'rajin'
        ? rankingData.siswa_rajin?.slice(0, 8) || []
        : activeTab.key === 'terlambat'
        ? [...(rankingData.siswa_sering_terlambat || [])].sort((a,b) => b.total_terlambat - a.total_terlambat).slice(0,8)
        : [...(rankingData.siswa_sering_alpha     || [])].sort((a,b) => b.total_alpha      - a.total_alpha     ).slice(0,8))
    : []

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-5">

      {/* MODAL PROFIL SISWA */}
      {selectedSiswa && (
        <SiswaProfileModal siswa={selectedSiswa} onClose={() => setSelectedSiswa(null)} />
      )}

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex-shrink-0">
            <Trophy size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Ranking Siswa</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{scopeLabel} · {periodeLabel}</p>
          </div>
        </div>
        <button onClick={fetchRanking} disabled={loading}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <RefreshCw size={14} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </motion.div>

      {/* FILTER PANEL */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 sm:p-4 space-y-3">

        {/* SCOPE */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <School size={9} /> Tampilkan
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SCOPE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setScope(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                  scope === opt.value
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}>
                {opt.value === 'kelas' && kelasAmpu
                  ? <><School size={11} />{kelasAmpu.nama_kelas}</>
                  : opt.value === 'kelas'
                  ? <><School size={11} />Kelas Saya</>
                  : <><Trophy size={11} />Angkatan {opt.value}</>
                }
              </button>
            ))}
          </div>
        </div>

        {/* PERIODE */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Filter size={9} /> Periode
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[100px]">
              <label className="block text-[10px] text-slate-400 mb-1">Bulan</label>
              <select value={bulan} onChange={e => setBulan(+e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                {BULAN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[80px]">
              <label className="block text-[10px] text-slate-400 mb-1">Tahun</label>
              <select value={tahun} onChange={e => setTahun(+e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={() => setUseRange(!useRange)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                useRange
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500'
              }`}>
              <CalendarRange size={11} />
              {useRange ? 'Range ✓' : 'Range'}
            </button>
          </div>
          {useRange && (
            <div className="flex flex-wrap items-end gap-2 mt-2">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-[10px] text-slate-400 mb-1">Dari</label>
                <input type="date" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-[10px] text-slate-400 mb-1">Sampai</label>
                <input type="date" value={tanggalSelesai} onChange={e => setTanggalSelesai(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <button onClick={handleApplyRange}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-all flex-shrink-0">
                Tampilkan
              </button>
            </div>
          )}
        </div>

        {/* PILLS */}
        <div className="flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-semibold">
            <School size={8} /> {scopeLabel}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-semibold">
            <Calendar size={8} /> {periodeLabel}
          </span>
        </div>
      </motion.div>

      {/* LOADING */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-slate-400">Memuat ranking {scopeLabel}...</p>
        </div>
      )}

      {/* DATA */}
      {!loading && rankingData && (
        <>
          <StatSummary rankingData={rankingData} showStats={showStats} setShowStats={setShowStats} />

          {/* TABS */}
          <div className="relative flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            {TABS.map(t => {
              const Icon     = t.icon
              const isActive = activeTab.key === t.key
              return (
                <button key={t.key} onClick={() => setActiveTab(t)}
                  className="relative flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all z-10">
                  {isActive && (
                    <motion.div layoutId="guru-ranking-tab"
                      className="absolute inset-0 rounded-xl shadow-md"
                      style={{ background: t.grad }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                  <Icon size={12} className={`relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} strokeWidth={2.5} />
                  <span className={`relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* PODIUM + CARD */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab.key}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}>

              {tabData.length >= 2 && (
                <PodiumSection
                  items={tabData}
                  type={activeTab.key}
                  activeTab={activeTab}
                  onAvatarClick={setSelectedSiswa}
                />
              )}

              <RankingCard
                title={activeTab.key === 'rajin' ? 'Paling Rajin' : activeTab.key === 'terlambat' ? 'Sering Terlambat' : 'Sering Alpha'}
                data={tabData}
                icon={activeTab.key === 'rajin' ? Trophy : activeTab.key === 'terlambat' ? TrendingDown : AlertTriangle}
                gradient={
                  activeTab.key === 'rajin'     ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                  activeTab.key === 'terlambat' ? 'bg-gradient-to-r from-amber-500 to-orange-500'  :
                                                  'bg-gradient-to-r from-rose-500 to-red-500'
                }
                type={activeTab.key}
                periodeLabel={`${scopeLabel} · ${periodeLabel}`}
                onProfileClick={setSelectedSiswa}
              />
            </motion.div>
          </AnimatePresence>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg flex-shrink-0">
                <Sparkles size={12} className="text-emerald-600" />
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Menampilkan ranking <strong>{scopeLabel}</strong> periode <strong>{periodeLabel}</strong>.
                {scope === 'kelas' && ' Ganti ke Angkatan 10/11/12 untuk lihat lintas kelas.'}
                {' '}Ketuk foto siswa untuk lihat profil lengkap.
              </p>
            </div>
          </motion.div>
        </>
      )}

      {/* No kelas */}
      {!loading && !rankingData && kelasAmpu === null && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 text-center border border-amber-200 dark:border-amber-800">
          <School size={28} className="text-amber-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">Belum Ada Kelas yang Diampu</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">Hubungi admin untuk menambahkan penugasan mengajar.</p>
        </div>
      )}
    </div>
  )
}
