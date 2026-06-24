import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Users, CheckCircle, AlertCircle, Send, X, Search, RefreshCw, ChevronDown, ChevronUp, Info, GraduationCap, BookOpen, Sparkles, Clock, BarChart3, UserX, MessageSquare, Check, School, Award, ShieldAlert, Eye, EyeOff, Trash2, Ban } from "lucide-react"
import { guruApi } from "../../services/guruService"
import toast from "react-hot-toast"

// Avatar siswa
function SiswaAvatar({ foto, nama, size = "sm" }) {
  const [err, setErr] = useState(false)
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"
  if (foto && !err) return <img src={foto} alt={nama} className={`${dim} rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-slate-800`} onError={() => setErr(true)} />
  return <div className={`${dim} rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white dark:ring-slate-800`}>{nama?.charAt(0).toUpperCase()}</div>
}

// Badge kehadiran
function KehadiranBadge({ persen }) {
  const color = persen >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : persen >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>{persen}%</span>
}

// Stat card for header
function HeaderStat({ icon: Icon, label, value, color = "violet" }) {
  const colors = {
    violet: "from-violet-500/20 to-indigo-500/20 text-violet-200 border-violet-400/30",
    red: "from-red-500/20 to-rose-500/20 text-red-200 border-red-400/30",
    emerald: "from-emerald-500/20 to-teal-500/20 text-emerald-200 border-emerald-400/30",
  }
  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-br border backdrop-blur-sm ${colors[color]}`}>
      <Icon size={16} className="opacity-80 flex-shrink-0" />
      <div>
        <p className="text-[10px] opacity-70 font-medium">{label}</p>
        <p className="text-lg font-black leading-none">{value}</p>
      </div>
    </div>
  )
}

export default function GuruNaikKelas() {
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedSiswa, setSelectedSiswa] = useState(new Set())
  const [expandedKelas, setExpandedKelas] = useState(new Set())
  const [search, setSearch] = useState("")
  const [alasan, setAlasan] = useState("")
  const [showAlasan, setShowAlasan] = useState(false)
  const [rekomendasiSaya, setRekomendasiSaya] = useState([])
  const [activeTab, setActiveTab] = useState("pilih") // pilih | riwayat
  const [loadingRiwayat, setLoadingRiwayat] = useState(false)
  const [showInfoBanner, setShowInfoBanner] = useState(true)

  useEffect(() => { fetchData() }, [])
  useEffect(() => { if (activeTab === "riwayat") fetchRiwayat() }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await guruApi.getNaikKelasKelasSiswa()
      const data = res.data?.data || []
      setKelasList(data)
      // Auto expand semua kelas
      setExpandedKelas(new Set(data.map(k => k.kelas_id)))
      // Pre-select siswa yang sudah direkomendasikan
      const preSelected = new Set()
      data.forEach(k => k.siswa?.forEach(s => { if (s.direkomendasikan) preSelected.add(s.id) }))
      setSelectedSiswa(preSelected)
    } catch { toast.error("Gagal memuat data kelas") }
    finally { setLoading(false) }
  }

  const fetchRiwayat = async () => {
    try {
      setLoadingRiwayat(true)
      const res = await guruApi.getRekomendasiSaya()
      setRekomendasiSaya(res.data?.data || [])
    } catch { toast.error("Gagal memuat riwayat") }
    finally { setLoadingRiwayat(false) }
  }

  const toggleSiswa = (id) => {
    setSelectedSiswa(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleKelas = (kelas) => {
    const ids = kelas.siswa.map(s => s.id)
    setSelectedSiswa(prev => {
      const next = new Set(prev)
      const allSelected = ids.every(id => next.has(id))
      if (allSelected) ids.forEach(id => next.delete(id)); else ids.forEach(id => next.add(id))
      return next
    })
  }

  const handleSubmit = async () => {
    if (selectedSiswa.size === 0) { toast.error("Pilih minimal 1 siswa"); return }
    try {
      setSubmitting(true)
      await guruApi.simpanRekomendasi({ siswa_ids: Array.from(selectedSiswa), alasan })
      toast.success(`Berhasil mengirim rekomendasi ${selectedSiswa.size} siswa ke admin!`)
      setAlasan("")
      setShowAlasan(false)
      fetchData()
    } catch (e) { toast.error(e.response?.data?.message || "Gagal mengirim rekomendasi") }
    finally { setSubmitting(false) }
  }

  const handleHapus = async (siswaId) => {
    try {
      await guruApi.hapusRekomendasi(siswaId)
      toast.success("Rekomendasi dihapus")
      fetchRiwayat()
      fetchData()
    } catch { toast.error("Gagal menghapus rekomendasi") }
  }

  // Filter siswa berdasarkan search
  const filteredKelas = kelasList.map(k => {
    if (!search) return k
    const q = search.toLowerCase()
    const filtered = k.siswa.filter(s => s.nama_lengkap.toLowerCase().includes(q) || (s.nis || "").toLowerCase().includes(q))
    return { ...k, siswa: filtered }
  }).filter(k => k.siswa.length > 0 || !search)

  const totalSiswa = kelasList.reduce((a, k) => a + (k.siswa?.length || 0), 0)
  const totalDipilih = selectedSiswa.size

  const riwayatMenunggu = rekomendasiSaya.filter(r => r.status === "pending").length
  const riwayatDisetujui = rekomendasiSaya.filter(r => r.status === "diproses").length
  const riwayatDitolak = rekomendasiSaya.filter(r => r.status === "ditolak").length

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-5">

      {/* ═══════════════════════════════════════════════════════
          PREMIUM HEADER CARD
      ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 shadow-2xl shadow-violet-500/30">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-400/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-violet-300/10 rounded-full blur-lg pointer-events-none" />

        <div className="relative p-5 sm:p-6">
          {/* Top row: icon + title + refresh */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                <School size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white leading-tight">Rekomendasi Tidak Naik Kelas</h1>
                <p className="text-violet-200 text-xs mt-0.5 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-violet-300" />
                  Tandai siswa, kirim rekomendasi ke admin
                </p>
              </div>
            </div>
            <button onClick={fetchData}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all backdrop-blur-sm flex-shrink-0 group">
              <RefreshCw size={15} className="text-white group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-2">
            <HeaderStat icon={GraduationCap} label="Kelas Diampu" value={kelasList.length} color="violet" />
            <HeaderStat icon={Users} label="Total Siswa" value={totalSiswa} color="emerald" />
            <HeaderStat icon={UserX} label="Tidak Naik" value={totalDipilih} color="red" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          INFO BANNER — COLLAPSIBLE STEP GUIDE
      ═══════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-violet-200 dark:border-violet-800/50 overflow-hidden bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40">
        <button
          onClick={() => setShowInfoBanner(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-violet-100/50 dark:hover:bg-violet-900/20 transition-colors">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-500/10 rounded-lg">
              <Info size={13} className="text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xs font-bold text-violet-700 dark:text-violet-300">Panduan Penggunaan</span>
          </div>
          <ChevronDown size={14} className={`text-violet-500 transition-transform duration-300 ${showInfoBanner ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {showInfoBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}>
              <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { step: "1", title: "Centang Siswa", desc: "Pilih siswa yang tidak naik kelas dari daftar kelas yang kamu ampu", icon: Check },
                  { step: "2", title: "Tambah Alasan", desc: "Opsional: tambahkan alasan atau catatan untuk admin", icon: MessageSquare },
                  { step: "3", title: "Kirim ke Admin", desc: "Klik tombol kirim, admin akan memproses rekomendasi kamu", icon: Send },
                ].map(({ step, title, desc, icon: Icon }) => (
                  <div key={step} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-violet-100 dark:border-violet-800/30">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-md shadow-violet-500/30">
                      {step}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-violet-700 dark:text-violet-300">{title}</p>
                      <p className="text-[10px] text-violet-600/80 dark:text-violet-400/80 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PILL TABS
      ═══════════════════════════════════════════════════════ */}
      <div className="flex gap-2">
        {[
          { key: "pilih", label: "Pilih Siswa", icon: UserX },
          { key: "riwayat", label: "Riwayat Kiriman", icon: Clock, badge: rekomendasiSaya.length },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === t.key
                ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}>
            <t.icon size={12} />
            {t.label}
            {t.badge > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === t.key ? "bg-white/25 text-white" : "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB: PILIH SISWA
      ═══════════════════════════════════════════════════════ */}
      {activeTab === "pilih" && (
        <div className="space-y-4">

          {/* Search bar + counter badge */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <AnimatePresence>
              {totalDipilih > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40 border border-red-200 dark:border-red-800/50 rounded-2xl shadow-sm">
                  <UserX size={13} className="text-red-500" />
                  <span className="text-xs font-black text-red-600 dark:text-red-400">{totalDipilih} siswa dipilih</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-violet-100 dark:border-violet-900/40 border-t-violet-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <School size={16} className="text-violet-500" />
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-500 mt-4">Memuat data kelas...</p>
            </div>

          ) : filteredKelas.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-4 shadow-inner">
                <BookOpen size={28} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Tidak ada kelas yang diampu</p>
              <p className="text-xs text-slate-400 mt-1.5 text-center max-w-xs">Hubungi admin untuk mengatur kelas yang kamu ampu</p>
              <button onClick={fetchData} className="mt-4 flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-xl text-xs font-semibold hover:bg-violet-100 transition-colors">
                <RefreshCw size={12} />Muat Ulang
              </button>
            </div>

          ) : (
            /* Kelas cards */
            filteredKelas.map(kelas => {
              const allSelected = kelas.siswa.length > 0 && kelas.siswa.every(s => selectedSiswa.has(s.id))
              const someSelected = kelas.siswa.some(s => selectedSiswa.has(s.id))
              const isExpanded = expandedKelas.has(kelas.kelas_id)
              const selectedCount = kelas.siswa.filter(s => selectedSiswa.has(s.id)).length

              return (
                <motion.div
                  key={kelas.kelas_id}
                  layout
                  className={`bg-white dark:bg-slate-900 rounded-3xl border overflow-hidden shadow-sm transition-all ${
                    selectedCount > 0
                      ? "border-red-200 dark:border-red-800/50 shadow-red-500/5"
                      : "border-slate-200 dark:border-slate-700"
                  }`}>

                  {/* Kelas header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    onClick={() => setExpandedKelas(prev => {
                      const n = new Set(prev)
                      if (n.has(kelas.kelas_id)) n.delete(kelas.kelas_id); else n.add(kelas.kelas_id)
                      return n
                    })}>

                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-2xl flex-shrink-0 ${selectedCount > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-violet-100 dark:bg-violet-900/30"}`}>
                        <GraduationCap size={16} className={selectedCount > 0 ? "text-red-600 dark:text-red-400" : "text-violet-600 dark:text-violet-400"} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-sm text-slate-800 dark:text-slate-100">{kelas.nama_kelas}</p>
                          {selectedCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[9px] font-black">
                              {selectedCount} tidak naik
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          <span className="font-medium text-slate-500 dark:text-slate-400">{kelas.jurusan}</span>
                          {" · "}Tingkat {kelas.tingkat}
                          {" · "}
                          <span className="font-semibold">{kelas.total_siswa}</span> siswa
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <button
                        onClick={e => { e.stopPropagation(); toggleKelas(kelas) }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                          allSelected
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 hover:border-violet-200"
                        }`}>
                        {allSelected ? "Batal Semua" : "Pilih Semua"}
                      </button>
                      <div className={`p-1.5 rounded-xl transition-colors ${isExpanded ? "bg-violet-100 dark:bg-violet-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                        {isExpanded
                          ? <ChevronUp size={14} className="text-violet-500" />
                          : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Siswa list */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}>
                        <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800/50">
                          {kelas.siswa.map(siswa => {
                            const dipilih = selectedSiswa.has(siswa.id)
                            return (
                              <div
                                key={siswa.id}
                                onClick={() => toggleSiswa(siswa.id)}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                                  dipilih
                                    ? "bg-red-50 dark:bg-red-950/20 border-l-2 border-l-red-400"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/30 border-l-2 border-l-transparent"
                                }`}>

                                {/* Checkbox */}
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all shadow-sm ${
                                  dipilih ? "bg-red-500 border-red-500 shadow-red-500/30" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                }`}>
                                  {dipilih && <Check size={11} className="text-white" strokeWidth={3} />}
                                </div>

                                {/* Avatar */}
                                <SiswaAvatar foto={siswa.foto} nama={siswa.nama_lengkap} />

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold truncate ${dipilih ? "text-red-700 dark:text-red-400" : "text-slate-800 dark:text-slate-200"}`}>
                                    {siswa.nama_lengkap}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">NIS: {siswa.nis}</p>
                                </div>

                                {/* Stats — desktop */}
                                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                                  <div className="text-center min-w-[36px]">
                                    <p className="text-[9px] text-slate-400 font-medium">Alpha</p>
                                    <p className={`text-xs font-black ${siswa.total_alpha > 5 ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
                                      {siswa.total_alpha}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-slate-400 font-medium mb-0.5">Hadir</p>
                                    <KehadiranBadge persen={siswa.persentase_kehadiran} />
                                  </div>
                                  {dipilih && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-[9px] font-black">
                                      <UserX size={9} />Tidak Naik
                                    </span>
                                  )}
                                </div>

                                {/* Stats — mobile */}
                                <div className="sm:hidden flex-shrink-0">
                                  <KehadiranBadge persen={siswa.persentase_kehadiran} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })
          )}

          {/* ─── STICKY SUBMIT PANEL ─── */}
          <AnimatePresence>
            {totalDipilih > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="sticky bottom-4 z-20">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-violet-200 dark:border-violet-800/50 shadow-2xl shadow-violet-500/20 overflow-hidden">
                  {/* Top accent bar */}
                  <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-600" />

                  <div className="p-4 space-y-3">
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <UserX size={14} className="text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                            {totalDipilih} siswa tidak naik kelas
                          </p>
                          <p className="text-[10px] text-slate-400">Siap dikirim ke admin</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAlasan(!showAlasan)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-slate-500 hover:text-violet-600 rounded-xl text-[10px] font-semibold transition-all border border-slate-200 dark:border-slate-700">
                        <MessageSquare size={11} />
                        {showAlasan ? "Tutup" : "Alasan"}
                        <ChevronDown size={10} className={`transition-transform ${showAlasan ? "rotate-180" : ""}`} />
                      </button>
                    </div>

                    {/* Alasan textarea */}
                    <AnimatePresence>
                      {showAlasan && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}>
                          <textarea
                            value={alasan}
                            onChange={e => setAlasan(e.target.value)}
                            rows={3}
                            placeholder="Contoh: Nilai tidak memenuhi KKM, sering tidak hadir, dll..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs resize-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit button */}
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-violet-500/30 transition-all">
                      {submitting
                        ? <><RefreshCw size={15} className="animate-spin" />Mengirim...</>
                        : <><Send size={15} />Kirim {totalDipilih} Rekomendasi ke Admin</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: RIWAYAT KIRIMAN
      ═══════════════════════════════════════════════════════ */}
      {activeTab === "riwayat" && (
        <div className="space-y-4">

          {/* Summary stats */}
          {rekomendasiSaya.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Menunggu", value: riwayatMenunggu, color: "amber", icon: Clock },
                { label: "Disetujui", value: riwayatDisetujui, color: "emerald", icon: CheckCircle },
                { label: "Ditolak", value: riwayatDitolak, color: "red", icon: AlertCircle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className={`p-3 rounded-2xl border text-center ${
                  color === "amber" ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40" :
                  color === "emerald" ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40" :
                  "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40"
                }`}>
                  <Icon size={16} className={`mx-auto mb-1 ${
                    color === "amber" ? "text-amber-500" :
                    color === "emerald" ? "text-emerald-500" : "text-red-500"
                  }`} />
                  <p className={`text-xl font-black ${
                    color === "amber" ? "text-amber-700 dark:text-amber-400" :
                    color === "emerald" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                  }`}>{value}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {loadingRiwayat ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-10 h-10 rounded-full border-4 border-violet-100 dark:border-violet-900/40 border-t-violet-500 animate-spin mb-3" />
                <p className="text-xs text-slate-400">Memuat riwayat...</p>
              </div>
            ) : rekomendasiSaya.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-4 shadow-inner">
                  <Clock size={28} className="text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Belum ada rekomendasi dikirim</p>
                <p className="text-xs text-slate-400 mt-1.5 text-center max-w-xs">Pilih siswa di tab "Pilih Siswa" dan kirim rekomendasi ke admin</p>
                <button onClick={() => setActiveTab("pilih")} className="mt-4 flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-xl text-xs font-semibold hover:bg-violet-100 transition-colors">
                  <UserX size={12} />Pilih Siswa Sekarang
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {rekomendasiSaya.map((r, idx) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">

                    {/* Avatar */}
                    <SiswaAvatar foto={r.foto} nama={r.nama_siswa} size="md" />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{r.nama_siswa}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            NIS: <span className="font-semibold">{r.nis}</span>
                            {" · "}
                            <span className="font-semibold text-violet-500">{r.kelas}</span>
                          </p>
                        </div>
                        {/* Status badge */}
                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-black ${
                          r.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : r.status === "diproses"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {r.status === "pending"
                            ? <><Clock size={9} className="inline mr-0.5" />Menunggu</>
                            : r.status === "diproses"
                            ? <><Check size={9} className="inline mr-0.5" />Disetujui</>
                            : <><Ban size={9} className="inline mr-0.5" />Ditolak</>
                          }
                        </span>
                      </div>

                      {/* Alasan */}
                      {r.alasan && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 italic bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                          "{r.alasan}"
                        </p>
                      )}

                      {/* Footer: date + delete */}
                      <div className="flex items-center justify-between mt-2">
                        {r.created_at && (
                          <p className="text-[9px] text-slate-400">
                            {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                        {r.status === "pending" && (
                          <button
                            onClick={() => handleHapus(r.siswa_id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800/50">
                            <Trash2 size={10} />Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
