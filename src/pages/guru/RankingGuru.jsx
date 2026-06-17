import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, RefreshCw, Crown, ChevronLeft, ChevronRight, ChevronDown,
  CheckCircle, Clock, AlertTriangle, X, Disc, UserCircle2,
  TrendingUp, Hash, Medal, Award, Users, Calendar, Filter,
} from 'lucide-react'
import { guruApi } from '../../services/guruService'
import GuruProfileModal from '../../components/GuruProfileModal'

const TABS = [
  { key:'rajin',     label:'Rajin',     color:'#10b981', grad:'linear-gradient(135deg,#059669,#10b981)', text:'text-emerald-600 dark:text-emerald-400', icon:CheckCircle,   desc:'Paling sering hadir',     dataKey:'guru_rajin'            },
  { key:'terlambat', label:'Terlambat', color:'#f59e0b', grad:'linear-gradient(135deg,#d97706,#f59e0b)', text:'text-amber-600 dark:text-amber-400',   icon:Clock,         desc:'Paling sering terlambat', dataKey:'guru_sering_terlambat' },
  { key:'alpha',     label:'Alpha',     color:'#ef4444', grad:'linear-gradient(135deg,#dc2626,#ef4444)', text:'text-rose-600 dark:text-rose-400',     icon:AlertTriangle, desc:'Paling sering alpha',     dataKey:'guru_sering_alpha'     },
]

const PODIUM_CFG = [
  { rank:1, size:64, ringColor:'#f59e0b', order:'order-2', baseH:'h-20', Icon:Trophy },
  { rank:2, size:52, ringColor:'#94a3b8', order:'order-1', baseH:'h-14', Icon:Medal  },
  { rank:3, size:46, ringColor:'#f97316', order:'order-3', baseH:'h-10', Icon:Award  },
]

const BULAN_OPT = [
  {value:1,label:'Januari'},{value:2,label:'Februari'},{value:3,label:'Maret'},
  {value:4,label:'April'},{value:5,label:'Mei'},{value:6,label:'Juni'},
  {value:7,label:'Juli'},{value:8,label:'Agustus'},{value:9,label:'September'},
  {value:10,label:'Oktober'},{value:11,label:'November'},{value:12,label:'Desember'},
]
const TAHUN_OPT = [new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1]

// ─── AVATAR ──────────────────────────────────────────────────────────────────
function GuruAvatar({ guru, size=44, rounded='rounded-2xl' }) {
  const [err, setErr] = useState(false)
  const g    = guru?.guru || guru
  const nama = g?.nama || g?.nama_lengkap || 'G'
  const foto = g?.foto_url || g?.foto
  return (
    <div className={`relative flex-shrink-0 overflow-hidden ${rounded} bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center font-black text-white`}
      style={{ width:size, height:size, fontSize:Math.round(size*0.38) }}>
      {foto && !err
        ? <img src={foto} alt={nama} className="w-full h-full object-cover" onError={()=>setErr(true)} />
        : nama.charAt(0).toUpperCase()}
    </div>
  )
}

// ─── PODIUM ───────────────────────────────────────────────────────────────────
function PodiumSection({ items, activeTab, onAvatarClick }) {
  const getVal = (item) =>
    activeTab.key==='rajin' ? item.total_hadir :
    activeTab.key==='terlambat' ? item.total_terlambat : item.total_alpha

  if (items.length < 2) return null
  const top3    = items.slice(0,3)
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean)

  return (
    <div className="relative mb-4">
      <div className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background:`linear-gradient(90deg,transparent,${activeTab.color}60,transparent)` }} />
        <div className="relative z-10 pt-5 pb-5 px-4 sm:px-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <activeTab.icon size={13} style={{ color:activeTab.color }} strokeWidth={2.5} />
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Top 3 &mdash; {activeTab.desc}
            </p>
          </div>
          <div className="flex items-end justify-center gap-4 sm:gap-8 lg:gap-12">
            {ordered.map((item, oi) => {
              const rank   = oi===0 ? 2 : oi===1 ? 1 : 3
              const podCfg = PODIUM_CFG.find(c=>c.rank===rank)
              const val    = getVal(item)
              const guru   = item.guru || item
              const PIcon  = podCfg.Icon
              return (
                <motion.div key={guru.id||oi} className={`flex flex-col items-center gap-2 ${podCfg.order}`}
                  initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                  transition={{delay:rank===1?0:rank===2?0.08:0.16,type:'spring',stiffness:200}}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{background:`${podCfg.ringColor}15`}}>
                    <PIcon size={14} style={{color:podCfg.ringColor}} strokeWidth={2} />
                  </div>
                  <motion.div whileTap={{scale:0.93}} className="rounded-full p-0.5 cursor-pointer"
                    onClick={()=>onAvatarClick({...item,posisi:rank})}
                    style={{background:`linear-gradient(135deg,${podCfg.ringColor},${podCfg.ringColor}66)`,boxShadow:`0 0 14px ${podCfg.ringColor}33`}}>
                    <div className="rounded-full p-0.5 bg-white dark:bg-slate-900">
                      <GuruAvatar guru={guru} size={podCfg.size} rounded="rounded-full" />
                    </div>
                  </motion.div>
                  <div className="text-center">
                    <p className="font-black text-[12px] sm:text-[13px] leading-tight max-w-[80px] truncate text-slate-800 dark:text-white">
                      {(guru.nama||guru.nama_lengkap||'').split(' ')[0]}
                    </p>
                    <p className="text-[9px] sm:text-[10px] truncate max-w-[80px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {guru.nip||'-'}
                    </p>
                  </div>
                  <div className={`w-full min-w-[68px] sm:min-w-[80px] flex flex-col items-center rounded-t-xl pt-2.5 pb-1.5 px-2 ${podCfg.baseH}`}
                    style={{background:`${activeTab.color}10`,borderTop:`2px solid ${activeTab.color}35`}}>
                    <span className="font-black tabular-nums text-base sm:text-lg leading-none" style={{color:activeTab.color}}>{val??0}</span>
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

// ─── PAGINATION ──────────────────────────────────────────────────────────────
function Pagination({ page, lastPage, total, perPage, onPage, color }) {
  const from  = (page-1)*perPage+1
  const to    = Math.min(page*perPage, total)
  const pages = []
  if (lastPage<=7) { for(let i=1;i<=lastPage;i++) pages.push(i) }
  else {
    pages.push(1)
    if(page>3) pages.push('...')
    for(let i=Math.max(2,page-1);i<=Math.min(lastPage-1,page+1);i++) pages.push(i)
    if(page<lastPage-2) pages.push('...')
    pages.push(lastPage)
  }
  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] text-slate-400">
          <span className="font-semibold text-slate-600 dark:text-slate-300">{from}&ndash;{to}</span> dari{' '}
          <span className="font-semibold text-slate-600 dark:text-slate-300">{total}</span> guru
        </span>
        <span className="text-[11px] text-slate-400">
          Hal <span className="font-semibold text-slate-600 dark:text-slate-300">{page}</span> / {lastPage}
        </span>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        <motion.button whileTap={{scale:0.9}} onClick={()=>onPage(page-1)} disabled={page<=1}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronLeft size={15} />
        </motion.button>
        {pages.map((p,i) => p==='...'
          ? <span key={`d${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">···</span>
          : <motion.button key={p} whileTap={{scale:0.88}} onClick={()=>onPage(p)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${p===page?'text-white shadow-md':'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500'}`}
              style={p===page?{background:color,boxShadow:`0 4px 12px ${color}40`}:{}}>
              {p}
            </motion.button>
        )}
        <motion.button whileTap={{scale:0.9}} onClick={()=>onPage(page+1)} disabled={page>=lastPage}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronRight size={15} />
        </motion.button>
      </div>
      <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mx-1">
        <motion.div className="h-full rounded-full" style={{background:color}}
          initial={{width:0}} animate={{width:`${(page/lastPage)*100}%`}}
          transition={{duration:0.4,ease:'easeOut'}} />
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function RankingGuruPage() {
  const [tab, setTab]               = useState('rajin')
  const [statistik, setStatistik]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage]             = useState(1)
  const [selectedItem, setSelectedItem] = useState(null)
  const [bulan, setBulan]           = useState(new Date().getMonth()+1)
  const [tahun, setTahun]           = useState(new Date().getFullYear())
  const [showFilter, setShowFilter] = useState(false)
  const listRef = useRef(null)
  const PER_PAGE = 10

  const activeTab = TABS.find(t=>t.key===tab)

  const fetchData = useCallback(async (isRefresh=false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const res = await guruApi.getRankingGuruStatistik({ bulan, tahun })
      setStatistik(res.data.data)
      setPage(1)
    } catch(err) {
      console.error('RankingGuru error:', err?.response?.data || err)
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [bulan, tahun])

  useEffect(() => { fetchData() }, [bulan, tahun])

  const handleTab = (key) => { setTab(key); setPage(1) }
  const handlePage = (pg) => {
    setPage(pg)
    setTimeout(()=>listRef.current?.scrollIntoView({behavior:'smooth',block:'start'}), 80)
  }

  // Data sesuai tab — support paginasi lokal
  const allItems = (statistik?.[activeTab.dataKey] || []).map((item,i)=>({...item,posisi:i+1}))
  const total    = allItems.length
  const lastPage = Math.max(1, Math.ceil(total/PER_PAGE))
  const items    = allItems.slice((page-1)*PER_PAGE, page*PER_PAGE)
  const maxVal   = allItems[0]
    ? (activeTab.key==='rajin' ? allItems[0].total_hadir : activeTab.key==='terlambat' ? allItems[0].total_terlambat : allItems[0].total_alpha)
    : 1

  const periodeLabel = `${BULAN_OPT.find(b=>b.value===bulan)?.label} ${tahun}`

  return (
    <div className="max-w-2xl lg:max-w-3xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 pb-12">

      {/* MODAL */}
      {selectedItem && <GuruProfileModal guru={selectedItem} onClose={()=>setSelectedItem(null)} />}

      {/* HEADER */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{background:activeTab.grad}}>
              <Trophy size={16} className="text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ranking Guru</h1>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 ml-[46px]">
            <span className="font-semibold text-slate-500 dark:text-slate-300">{total} guru</span>
            {' · '}{periodeLabel}
          </p>
        </div>
        <motion.button whileTap={{scale:0.9}} onClick={()=>fetchData(true)} disabled={refreshing}
          className="mt-1 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all shadow-sm">
          <RefreshCw size={14} className={refreshing?'animate-spin':''} />
        </motion.button>
      </div>

      {/* FILTER */}
      <div className="mb-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        <button onClick={()=>setShowFilter(v=>!v)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <span className="flex items-center gap-2">
            <Filter size={12} />
            Periode: <span className="text-slate-700 dark:text-slate-200 ml-1">{periodeLabel}</span>
          </span>
          <ChevronDown size={13} className={`transition-transform duration-200 ${showFilter?'rotate-180':''}`} />
        </button>
        <AnimatePresence>
          {showFilter && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
              transition={{duration:0.2}} className="overflow-hidden">
              <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex-1 min-w-[110px]">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Bulan</label>
                  <select value={bulan} onChange={e=>setBulan(+e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                    {BULAN_OPT.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[80px]">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Tahun</label>
                  <select value={tahun} onChange={e=>setTahun(+e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                    {TAHUN_OPT.map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TABS */}
      <div className="relative flex gap-1.5 mb-5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
        {TABS.map(t => {
          const Icon    = t.icon
          const isActive = tab===t.key
          return (
            <button key={t.key} onClick={()=>handleTab(t.key)}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all z-10">
              {isActive && (
                <motion.div layoutId="rankingguru-tab-bg" className="absolute inset-0 rounded-xl shadow-md"
                  style={{background:t.grad}} transition={{type:'spring',stiffness:400,damping:30}} />
              )}
              <Icon size={13} className={`relative z-10 transition-colors ${isActive?'text-white':t.text}`} strokeWidth={2.5} />
              <span className={`relative z-10 transition-colors ${isActive?'text-white':'text-slate-500 dark:text-slate-400'}`}>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-[3px] border-t-transparent animate-spin"
              style={{borderColor:`${activeTab.color} transparent transparent transparent`}} />
          </div>
          <p className="text-sm text-slate-400">Memuat ranking guru...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={`${tab}-${page}`} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.15}}>

            {/* PODIUM */}
            {page===1 && <PodiumSection items={allItems} activeTab={activeTab} onAvatarClick={setSelectedItem} />}

            {/* LIST */}
            <div ref={listRef} className="space-y-1.5">
              {items.map((item, i) => {
                const guru   = item.guru || item
                const posisi = item.posisi
                const val    = activeTab.key==='rajin' ? item.total_hadir : activeTab.key==='terlambat' ? item.total_terlambat : item.total_alpha
                const barW   = maxVal>0 ? Math.round((val/maxVal)*100) : 0
                const isTop3 = posisi<=3 && page===1
                const RIcon  = posisi===1 ? Trophy : posisi===2 ? Medal : Award

                return (
                  <motion.div key={guru.id||i}
                    initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
                    transition={{delay:i*0.025,type:'spring',stiffness:220,damping:22}}
                    className={`relative flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-2xl border overflow-hidden transition-all cursor-pointer active:scale-[0.99] ${
                      isTop3 && posisi===1
                        ? 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                    onClick={()=>setSelectedItem(item)}>
                    {/* bg bar */}
                    <motion.div className="absolute inset-y-0 left-0 pointer-events-none"
                      initial={{width:0}} animate={{width:`${barW}%`}}
                      transition={{delay:0.25+i*0.02,duration:0.6,ease:'easeOut'}}
                      style={{background:`${activeTab.color}06`}} />
                    {/* RANK */}
                    <div className="w-8 sm:w-9 flex-shrink-0 flex items-center justify-center">
                      {isTop3
                        ? <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{background:`${PODIUM_CFG.find(c=>c.rank===posisi)?.ringColor}15`}}>
                            <RIcon size={14} style={{color:PODIUM_CFG.find(c=>c.rank===posisi)?.ringColor}} strokeWidth={2} />
                          </div>
                        : <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">{posisi}</div>
                      }
                    </div>
                    {/* AVATAR */}
                    <div className="flex-shrink-0"><GuruAvatar guru={guru} size={40} rounded="rounded-full" /></div>
                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate leading-tight text-slate-800 dark:text-white">{guru.nama||guru.nama_lengkap||'-'}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-mono">{guru.nip||'-'}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold" style={{background:'#10b98112',color:'#059669'}}>
                          <CheckCircle size={9} strokeWidth={2.5} />{item.total_hadir??0}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold" style={{background:'#f59e0b12',color:'#b45309'}}>
                          <Clock size={9} strokeWidth={2.5} />{item.total_terlambat??0}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold" style={{background:'#ef444412',color:'#dc2626'}}>
                          <AlertTriangle size={9} strokeWidth={2.5} />{item.total_alpha??0}
                        </span>
                      </div>
                    </div>
                    {/* SCORE */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                      <span className="text-xl sm:text-2xl font-black tabular-nums leading-none" style={{color:activeTab.color}}>{val??0}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{activeTab.label.toLowerCase()}</span>
                      <div className="w-10 sm:w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div className="h-full rounded-full transition-all duration-700" style={{width:`${barW}%`,background:activeTab.color}} />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              {items.length===0 && !loading && (
                <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Trophy size={26} className="opacity-25" />
                  </div>
                  <p className="text-sm font-medium">Belum ada data ranking guru</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600 text-center px-4">
                    Data akan muncul setelah guru melakukan absensi pada periode {periodeLabel}
                  </p>
                </div>
              )}
            </div>
            {lastPage>1 && <Pagination page={page} lastPage={lastPage} total={total} perPage={PER_PAGE} onPage={handlePage} color={activeTab.color} />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
