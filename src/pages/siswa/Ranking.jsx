import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, ChevronLeft, ChevronRight, RefreshCw, Crown } from 'lucide-react'
import { siswaApi } from '../../services/siswaService'
import { BadgeOverlay } from '../../components/GachaHarian'

const TABS = [
  { key: 'hadir',     label: 'Rajin',     color: '#10b981', bg: 'bg-emerald-500', soft: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'terlambat', label: 'Terlambat', color: '#f59e0b', bg: 'bg-amber-500',   soft: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-600 dark:text-amber-400' },
  { key: 'alpha',     label: 'Alpha',     color: '#ef4444', bg: 'bg-rose-500',    soft: 'bg-rose-50 dark:bg-rose-900/20',     text: 'text-rose-600 dark:text-rose-400' },
]

const MEDALS = ['🥇','🥈','🥉']

function SiswaAvatar({ siswa, size = 44, showBadge = true }) {
  const [err, setErr] = useState(false)
  const initial = (siswa.nama_lengkap || 'S').charAt(0).toUpperCase()
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className={`w-full h-full overflow-hidden bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center font-black text-white ${siswa.active_badge ? 'rounded-full' : 'rounded-xl'}`}
        style={{ fontSize: Math.round(size * 0.38) }}>
        {siswa.foto_url && !err
          ? <img src={siswa.foto_url} alt={siswa.nama_lengkap} className="w-full h-full object-cover" onError={() => setErr(true)}/>
          : initial}
      </div>
      {showBadge && siswa.active_badge && (
        <BadgeOverlay badgeId={siswa.active_badge} badges={[]} size="sm"/>
      )}
    </div>
  )
}

export default function SiswaRankingPage() {
  const [tab, setTab]         = useState('hadir')
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRanking = useCallback(async (pg = 1, sort = tab, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const res = await siswaApi.getRankingSekolah({ page: pg, sort })
      setData(res.data.data)
      setPage(pg)
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [tab])

  useEffect(() => { fetchRanking(1, tab) }, [tab])

  const handleTab = (key) => { setTab(key); setPage(1) }
  const handlePage = (pg) => { fetchRanking(pg, tab) }

  const activeTab = TABS.find(t => t.key === tab)
  const items     = data?.data || []
  const total     = data?.total || 0
  const lastPage  = data?.last_page || 1
  const myId      = data?.my_id
  const myPosisi  = data?.my_posisi

  const valKey = tab === 'hadir' ? 'total_hadir' : tab === 'terlambat' ? 'total_terlambat' : 'total_alpha'
  const maxVal = items[0]?.[valKey] || 1

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy size={20} className="text-amber-500"/> Ranking Sekolah
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {data?.bulan && `Bulan ${data.bulan}/${data.tahun} · `}{total} siswa
          </p>
        </div>
        <button onClick={() => fetchRanking(page, tab, true)} disabled={refreshing}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
        </button>
      </div>

      {/* Posisi saya */}
      {myPosisi && (
        <div className="mb-4 px-4 py-3 rounded-2xl flex items-center gap-3"
          style={{ background: `${activeTab.color}15`, border: `1px solid ${activeTab.color}30` }}>
          <Crown size={16} style={{ color: activeTab.color }}/>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Posisimu: <span style={{ color: activeTab.color }}>#{myPosisi}</span>
            <span className="text-slate-400 font-normal"> dari {total} siswa</span>
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <button key={t.key} onClick={() => handleTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              tab === t.key
                ? `${t.bg} text-white shadow-lg`
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-violet-500 rounded-full animate-spin"/>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={`${tab}-${page}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-2">
            {items.map((siswa, i) => {
              const isMe    = siswa.id === myId
              const posisi  = siswa.posisi
              const val     = siswa[valKey]
              const barW    = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0
              const medal   = posisi <= 3 ? MEDALS[posisi - 1] : null

              return (
                <motion.div key={siswa.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border overflow-hidden transition-all ${
                    isMe
                      ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700/50 ring-1 ring-violet-300 dark:ring-violet-700/50'
                      : posisi === 1
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                  }`}>

                  {/* Bar background */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ width: `${barW}%`, background: `${activeTab.color}08`, transition: 'width 0.8s ease' }}/>

                  {/* Posisi */}
                  <div className="w-8 text-center flex-shrink-0">
                    {medal
                      ? <span className="text-lg leading-none">{medal}</span>
                      : <span className="text-xs font-black text-slate-400 dark:text-slate-500">#{posisi}</span>
                    }
                  </div>

                  {/* Avatar + border */}
                  <SiswaAvatar siswa={siswa} size={40}/>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-black truncate ${isMe ? 'text-violet-700 dark:text-violet-300' : 'text-slate-800 dark:text-white'}`}>
                        {siswa.nama_lengkap}
                        {isMe && <span className="ml-1 text-[9px] font-bold text-violet-500">(Kamu)</span>}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{siswa.kelas} · {siswa.nis}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-emerald-500 font-bold">{siswa.total_hadir}H</span>
                      <span className="text-[9px] text-amber-500 font-bold">{siswa.total_terlambat}T</span>
                      <span className="text-[9px] text-rose-500 font-bold">{siswa.total_alpha}A</span>
                    </div>
                  </div>

                  {/* Nilai utama */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-black tabular-nums" style={{ color: activeTab.color }}>{val}</p>
                    <p className="text-[9px] text-slate-400">{activeTab.label.toLowerCase()}</p>
                  </div>
                </motion.div>
              )
            })}

            {items.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Trophy size={32} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Belum ada data ranking</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => handlePage(page - 1)} disabled={page <= 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft size={14}/> Prev
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {page} / {lastPage}
          </span>
          <button onClick={() => handlePage(page + 1)} disabled={page >= lastPage}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Next <ChevronRight size={14}/>
          </button>
        </div>
      )}
    </div>
  )
}
