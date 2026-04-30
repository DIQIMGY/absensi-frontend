import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Users, CheckCircle, AlertCircle, Send, X, Search, RefreshCw, ChevronDown, ChevronUp, Info, GraduationCap, BookOpen, Sparkles, Clock, BarChart3, UserX, MessageSquare, Check } from "lucide-react"
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

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/30">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">Rekomendasi Tidak Naik Kelas</h1>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Sparkles size={10} className="text-violet-500" />Tandai siswa yang tidak naik kelas, kirim ke admin
            </p>
          </div>
        </div>
        <button onClick={fetchData} className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all self-start sm:self-auto">
          <RefreshCw size={15} className="text-slate-500" />
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40">
        <Info size={15} className="text-violet-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-0.5">Cara Kerja</p>
          <p className="text-[11px] text-violet-600 dark:text-violet-400 leading-relaxed">
            Centang siswa yang <strong>tidak naik kelas</strong> dari kelas yang kamu ampu, lalu klik <strong>Kirim ke Admin</strong>. Admin akan melihat daftar ini dan siswa tersebut akan otomatis tercentang di halaman Naik Kelas Selektif.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
        {[{ key: "pilih", label: "Pilih Siswa", icon: UserX }, { key: "riwayat", label: "Riwayat Kiriman", icon: Clock }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === t.key ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}>
            <t.icon size={12} />{t.label}
          </button>
        ))}
      </div>

      {/* TAB: PILIH SISWA */}
      {activeTab === "pilih" && (
        <div className="space-y-4">
          {/* Search + counter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari nama atau NIS siswa..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
            </div>
            {totalDipilih > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
                <UserX size={13} className="text-violet-500" />
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300">{totalDipilih} dipilih</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              <RefreshCw size={24} className="animate-spin text-violet-500" />
            </div>
          ) : filteredKelas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              <BookOpen size={40} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">Tidak ada kelas yang diampu</p>
              <p className="text-xs text-slate-400 mt-1">Hubungi admin untuk mengatur kelas</p>
            </div>
          ) : (
            filteredKelas.map(kelas => {
              const allSelected = kelas.siswa.length > 0 && kelas.siswa.every(s => selectedSiswa.has(s.id))
              const someSelected = kelas.siswa.some(s => selectedSiswa.has(s.id))
              const isExpanded = expandedKelas.has(kelas.kelas_id)
              const selectedCount = kelas.siswa.filter(s => selectedSiswa.has(s.id)).length

              return (
                <div key={kelas.kelas_id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  {/* Kelas header */}
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setExpandedKelas(prev => { const n = new Set(prev); if (n.has(kelas.kelas_id)) n.delete(kelas.kelas_id); else n.add(kelas.kelas_id); return n })}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex-shrink-0">
                        <GraduationCap size={16} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{kelas.nama_kelas}</p>
                        <p className="text-[11px] text-slate-400">{kelas.jurusan} · Tingkat {kelas.tingkat} · {kelas.total_siswa} siswa</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {selectedCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold">{selectedCount} tidak naik</span>
                      )}
                      <button onClick={e => { e.stopPropagation(); toggleKelas(kelas) }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${allSelected ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-violet-50 hover:text-violet-600"}`}>
                        {allSelected ? "Batal Semua" : "Pilih Semua"}
                      </button>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Siswa list */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800/50">
                          {kelas.siswa.map(siswa => {
                            const dipilih = selectedSiswa.has(siswa.id)
                            return (
                              <div key={siswa.id}
                                onClick={() => toggleSiswa(siswa.id)}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${dipilih ? "bg-red-50 dark:bg-red-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"}`}>
                                {/* Checkbox */}
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${dipilih ? "bg-red-500 border-red-500" : "border-slate-300 dark:border-slate-600"}`}>
                                  {dipilih && <Check size={11} className="text-white" strokeWidth={3} />}
                                </div>
                                {/* Avatar */}
                                <SiswaAvatar foto={siswa.foto} nama={siswa.nama_lengkap} />
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold truncate ${dipilih ? "text-red-700 dark:text-red-400" : "text-slate-800 dark:text-slate-200"}`}>{siswa.nama_lengkap}</p>
                                  <p className="text-[10px] text-slate-400 truncate">NIS: {siswa.nis}</p>
                                </div>
                                {/* Stats */}
                                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                                  <div className="text-center">
                                    <p className="text-[9px] text-slate-400">Alpha</p>
                                    <p className={`text-xs font-bold ${siswa.total_alpha > 5 ? "text-red-500" : "text-slate-600 dark:text-slate-400"}`}>{siswa.total_alpha}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-slate-400">Hadir</p>
                                    <KehadiranBadge persen={siswa.persentase_kehadiran} />
                                  </div>
                                </div>
                                {/* Mobile stats */}
                                <div className="sm:hidden flex-shrink-0">
                                  <KehadiranBadge persen={siswa.persentase_kehadiran} />
                                </div>
                                {/* Dipilih badge */}
                                {dipilih && (
                                  <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[9px] font-bold flex-shrink-0">
                                    <UserX size={9} />Tidak Naik
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          )}

          {/* Alasan & Submit */}
          {totalDipilih > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-violet-200 dark:border-violet-800/40 shadow-lg shadow-violet-500/10 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-b border-violet-100 dark:border-violet-800/30">
                <div className="flex items-center gap-2">
                  <UserX size={16} className="text-violet-600 dark:text-violet-400" />
                  <p className="text-sm font-bold text-violet-700 dark:text-violet-300">{totalDipilih} siswa ditandai tidak naik kelas</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <button onClick={() => setShowAlasan(!showAlasan)}
                  className="flex items-center gap-2 text-xs text-slate-500 hover:text-violet-600 transition-colors">
                  <MessageSquare size={13} />
                  {showAlasan ? "Sembunyikan" : "Tambah"} alasan (opsional)
                  <ChevronDown size={12} className={`transition-transform ${showAlasan ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {showAlasan && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <textarea value={alasan} onChange={e => setAlasan(e.target.value)} rows={3} placeholder="Contoh: Nilai tidak memenuhi KKM, sering tidak hadir, dll..."
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button onClick={handleSubmit} disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all">
                  {submitting ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                  {submitting ? "Mengirim..." : `Kirim ${totalDipilih} Rekomendasi ke Admin`}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* TAB: RIWAYAT */}
      {activeTab === "riwayat" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {loadingRiwayat ? (
            <div className="flex items-center justify-center py-16"><RefreshCw size={24} className="animate-spin text-violet-500" /></div>
          ) : rekomendasiSaya.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Clock size={40} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">Belum ada rekomendasi yang dikirim</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {rekomendasiSaya.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <SiswaAvatar foto={r.foto} nama={r.nama_siswa} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{r.nama_siswa}</p>
                    <p className="text-[10px] text-slate-400">NIS: {r.nis} · {r.kelas}</p>
                    {r.alasan && <p className="text-[10px] text-slate-500 mt-0.5 truncate">"{r.alasan}"</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : r.status === "diproses" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {r.status === "pending" ? "Menunggu" : r.status === "diproses" ? "Diproses" : "Ditolak"}
                    </span>
                    {r.status === "pending" && (
                      <button onClick={() => handleHapus(r.siswa_id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
