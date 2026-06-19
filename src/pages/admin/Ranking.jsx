import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, TrendingDown, Award, Calendar,
  Crown, Clock, Users, CheckCircle, XCircle,
  RefreshCw, ChevronDown, GraduationCap, Info,
  Filter, CalendarRange, School, FileSpreadsheet, FileText, Download,
} from 'lucide-react'
import { adminApi } from '../../services/adminService'
import toast from 'react-hot-toast'
import SiswaProfileModal from '../../components/SiswaProfileModal'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BULAN = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]
const TAHUN = [2024, 2025, 2026, 2027]
const TINGKAT_OPTIONS = [
  { value: '', label: 'Semua Angkatan' },
  { value: '10', label: 'Kelas 10' },
  { value: '11', label: 'Kelas 11' },
  { value: '12', label: 'Kelas 12' },
]

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ src, name, size = 36, gradient = 'from-indigo-500 to-violet-600' }) => {
  const [err, setErr] = useState(false)
  const initial = (name || '?').charAt(0).toUpperCase()
  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center font-bold text-white flex-shrink-0 bg-gradient-to-br ${gradient}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {src && !err
        ? <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} />
        : initial}
    </div>
  )
}

// ── Podium top-3 ──────────────────────────────────────────────────────────────
const PODIUM_CFG = [
  { rank: 1, icon: Crown,  ring: 'ring-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20',   num: 'text-amber-600 dark:text-amber-400',   bar: 'h-20 bg-gradient-to-t from-amber-400 to-amber-300',   label: 'bg-amber-400',  gradient: 'from-amber-500 to-orange-400' },
  { rank: 2, icon: Award,  ring: 'ring-slate-400',  bg: 'bg-slate-50 dark:bg-slate-800/60',   num: 'text-slate-500 dark:text-slate-400',   bar: 'h-14 bg-gradient-to-t from-slate-400 to-slate-300',   label: 'bg-slate-400',  gradient: 'from-slate-500 to-slate-400' },
  { rank: 3, icon: Trophy, ring: 'ring-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', num: 'text-orange-600 dark:text-orange-400', bar: 'h-10 bg-gradient-to-t from-orange-400 to-orange-300', label: 'bg-orange-400', gradient: 'from-orange-500 to-amber-400' },
]

const PodiumBlock = ({ siswa, cfg, type, onProfileClick }) => {
  const Icon = cfg.icon
  const val = type === 'rajin'
    ? `${siswa.total_hadir}× · ${siswa.persentase_kehadiran}%`
    : type === 'terlambat' ? `${siswa.total_terlambat}×` : `${siswa.total_alpha}×`
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: cfg.rank * 0.08, type: 'spring', stiffness: 120 }}
      className="flex flex-col items-center gap-2">
      <motion.div whileTap={{ scale: 0.93 }} className="relative cursor-pointer" onClick={() => onProfileClick({ ...siswa, posisi: cfg.rank })}>
        <div className={`ring-2 ${cfg.ring} ring-offset-2 ring-offset-white dark:ring-offset-slate-900 rounded-full`}>
          <Avatar src={siswa.foto_url || siswa.foto} name={siswa.nama_lengkap} size={cfg.rank === 1 ? 52 : 44} gradient={cfg.gradient} />
        </div>
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${cfg.label} flex items-center justify-center shadow-sm`}>
          <Icon size={10} className="text-white" />
        </div>
      </motion.div>
      <div className="text-center max-w-[80px]">
        <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">{siswa.nama_lengkap}</p>
        <p className="text-[9px] text-slate-400 truncate">{siswa.kelas?.nama_kelas || '-'}</p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.num} border border-current/20`}>{val}</span>
      <div className={`w-16 rounded-t-lg ${cfg.bar} flex items-end justify-center pb-1`}>
        <span className="text-white font-black text-sm">{cfg.rank}</span>
      </div>
    </motion.div>
  )
}

// ── Row rank 4+ ───────────────────────────────────────────────────────────────
const RankRow = ({ siswa, index, type, onProfileClick }) => {
  const val = type === 'rajin'
    ? { text: `${siswa.total_hadir}×`, sub: `${siswa.persentase_kehadiran}% hadir`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
    : type === 'terlambat'
    ? { text: `${siswa.total_terlambat}×`, sub: 'terlambat', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' }
    : { text: `${siswa.total_alpha}×`, sub: 'alpha', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' }
  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer active:scale-[0.98]"
      onClick={() => onProfileClick({ ...siswa, posisi: index + 4 })}>
      <span className="w-5 text-center text-xs font-bold text-slate-400 tabular-nums flex-shrink-0">{index + 4}</span>
      <Avatar src={siswa.foto_url || siswa.foto} name={siswa.nama_lengkap} size={32} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{siswa.nama_lengkap}</p>
        <p className="text-[10px] text-slate-400 truncate">{siswa.kelas?.nama_kelas || '-'}</p>
      </div>
      <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${val.bg} ${val.color}`}>{val.text}</div>
    </motion.div>
  )
}

// ── Warning row ───────────────────────────────────────────────────────────────
const WarningRow = ({ siswa, index, type, maxVal, onProfileClick }) => {
  const isTerlambat = type === 'terlambat'
  const val  = isTerlambat ? siswa.total_terlambat : siswa.total_alpha
  const pct  = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0
  const barColor = isTerlambat ? 'bg-amber-400' : 'bg-rose-400'
  const badgeCfg = isTerlambat
    ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/40'
    : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700/40'
  const numCfg = index === 0 ? 'text-slate-800 dark:text-slate-100 font-black' : index === 1 ? 'text-slate-600 dark:text-slate-300 font-bold' : 'text-slate-400 font-semibold'
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer active:scale-[0.98]"
      onClick={() => onProfileClick({ ...siswa, posisi: index + 1 })}>
      <span className={`w-5 text-center text-xs tabular-nums flex-shrink-0 ${numCfg}`}>{index + 1}</span>
      <Avatar src={siswa.foto_url || siswa.foto} name={siswa.nama_lengkap} size={36}
        gradient={isTerlambat ? 'from-amber-400 to-orange-500' : 'from-rose-400 to-red-500'} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">{siswa.nama_lengkap}</p>
        <p className="text-[10px] text-slate-400 truncate mb-1.5">{siswa.kelas?.nama_kelas || '-'}</p>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ delay: 0.2 + index * 0.05, duration: 0.7, ease: 'easeOut' }}
            className={`h-full rounded-full ${barColor}`} />
        </div>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums flex-shrink-0 ${badgeCfg}`}>{val}×</span>
    </motion.div>
  )
}

// ── Card config ───────────────────────────────────────────────────────────────
const CARD_CFG = {
  rajin:     { title: 'Paling Rajin',     icon: CheckCircle, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800/40', topBar: 'bg-emerald-500' },
  terlambat: { title: 'Sering Terlambat', icon: Clock,       iconBg: 'bg-amber-50 dark:bg-amber-900/30',   iconColor: 'text-amber-600 dark:text-amber-400',   border: 'border-amber-100 dark:border-amber-800/40',   topBar: 'bg-amber-500'   },
  alpha:     { title: 'Sering Alpha',     icon: XCircle,     iconBg: 'bg-rose-50 dark:bg-rose-900/30',     iconColor: 'text-rose-600 dark:text-rose-400',     border: 'border-rose-100 dark:border-rose-800/40',     topBar: 'bg-rose-500'    },
}

const RankingCard = ({ data = [], type, delay = 0, onProfileClick }) => {
  const cfg = CARD_CFG[type]
  const Icon = cfg.icon
  const isPodium = type === 'rajin'
  const top3 = data.slice(0, 3)
  const rest  = data.slice(3)
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumCfgs  = [PODIUM_CFG[1], PODIUM_CFG[0], PODIUM_CFG[2]]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 110 }}
      className={`relative overflow-hidden bg-white dark:bg-slate-900 border ${cfg.border} rounded-2xl shadow-sm flex flex-col`}>
      <div className={`absolute inset-x-0 top-0 h-0.5 ${cfg.topBar}`} />
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
          <Icon size={17} className={cfg.iconColor} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{cfg.title}</p>
          <p className="text-[10px] text-slate-400">{data.length} siswa tercatat</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-5 gap-3 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Users size={20} className="text-slate-400" />
          </div>
          <p className="text-xs text-slate-400">Belum ada data periode ini</p>
        </div>
      ) : isPodium ? (
        <>
          <div className="px-5 pb-4">
            <div className="flex items-end justify-center gap-3">
              {podiumOrder.map((siswa, i) => siswa && (
                <PodiumBlock key={siswa.id} siswa={siswa} cfg={podiumCfgs[i]} type={type} onProfileClick={onProfileClick} />
              ))}
            </div>
          </div>
          {rest.length > 0 && <div className="mx-5 border-t border-slate-100 dark:border-slate-800 mb-1" />}
          {rest.length > 0 && (
            <div className="px-2 pb-3">
              {rest.map((siswa, i) => <RankRow key={siswa.id} siswa={siswa} index={i} type={type} onProfileClick={onProfileClick} />)}
            </div>
          )}
        </>
      ) : (
        <div className="px-2 pb-3">
          {data.map((siswa, i) => {
            const maxVal = data[0] ? (type === 'terlambat' ? data[0].total_terlambat : data[0].total_alpha) : 1
            return <WarningRow key={siswa.id} siswa={siswa} index={i} type={type} maxVal={maxVal} onProfileClick={onProfileClick} />
          })}
        </div>
      )}
    </motion.div>
  )
}

const MiniStat = ({ label, value, color, bg, delay }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className={`${bg} rounded-2xl p-4 flex flex-col gap-1`}>
    <p className={`text-2xl font-black tabular-nums leading-none ${color}`}>{value}</p>
    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{label}</p>
  </motion.div>
)

// ── Helpers ekspor ────────────────────────────────────────────────────────────
const buildLists = (rankingData) => ({
  rajin:     (rankingData?.siswa_rajin || []).slice(0, 8),
  terlambat: [...(rankingData?.siswa_sering_terlambat || [])].sort((a, b) => b.total_terlambat - a.total_terlambat).slice(0, 8),
  alpha:     [...(rankingData?.siswa_sering_alpha     || [])].sort((a, b) => b.total_alpha     - a.total_alpha    ).slice(0, 8),
})

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Ranking() {
  const today = new Date()
  const [loading, setLoading]         = useState(false)
  const [rankingData, setRankingData] = useState(null)
  const [bulan, setBulan]             = useState(today.getMonth() + 1)
  const [tahun, setTahun]             = useState(today.getFullYear())
  const [tingkat, setTingkat]         = useState('')
  const [useRange, setUseRange]           = useState(false)
  const [tanggalMulai, setTanggalMulai]   = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [selectedSiswa, setSelectedSiswa] = useState(null)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => { fetchRanking() }, [bulan, tahun, tingkat])

  const fetchRanking = async () => {
    try {
      setLoading(true)
      const params = { bulan, tahun }
      if (tingkat) params.tingkat = tingkat
      if (useRange && tanggalMulai && tanggalSelesai) {
        params.tanggal_mulai   = tanggalMulai
        params.tanggal_selesai = tanggalSelesai
        delete params.bulan
        delete params.tahun
      }
      const res = await adminApi.getRankingSiswa(params)
      setRankingData(res.data.data)
    } catch {
      toast.error('Gagal memuat data ranking')
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

  const periodeLabel = useRange && tanggalMulai && tanggalSelesai
    ? `${tanggalMulai} – ${tanggalSelesai}`
    : `${BULAN[bulan - 1]} ${tahun}`

  const tingkatLabel = TINGKAT_OPTIONS.find(t => t.value === tingkat)?.label || 'Semua Angkatan'

  // ── Ekspor Excel ────────────────────────────────────────────────────────────
  const exportExcel = () => {
    if (!rankingData) return toast.error('Belum ada data untuk diekspor')
    setExportLoading(true)
    try {
      const { rajin, terlambat, alpha } = buildLists(rankingData)
      const maxLen = Math.max(rajin.length, terlambat.length, alpha.length, 1)

      // ── Sheet 1: Rekap Gabungan ──────────────────────────────────────────
      const wsData = [
        [`RANKING SISWA — ${periodeLabel.toUpperCase()} — ${tingkatLabel.toUpperCase()}`],
        [`Dicetak: ${new Date().toLocaleString('id-ID')}`],
        [],
        ['NO', 'PALING RAJIN', '', '', '', '', 'SERING TERLAMBAT', '', '', 'SERING ALPHA', '', ''],
        ['',   'Nama Siswa', 'Kelas', 'Total Hadir', 'Absen', '% Hadir', 'Nama Siswa', 'Kelas', 'Total Terlambat', 'Nama Siswa', 'Kelas', 'Total Alpha'],
        ...Array.from({ length: maxLen }, (_, i) => [
          i + 1,
          rajin[i]?.nama_lengkap     || '', rajin[i]?.kelas?.nama_kelas   || '',
          rajin[i]?.total_hadir      ?? '', rajin[i]?.total_alpha         ?? '',
          rajin[i]?.persentase_kehadiran != null ? `${rajin[i].persentase_kehadiran}%` : '',
          terlambat[i]?.nama_lengkap || '', terlambat[i]?.kelas?.nama_kelas || '',
          terlambat[i]?.total_terlambat ?? '',
          alpha[i]?.nama_lengkap     || '', alpha[i]?.kelas?.nama_kelas   || '',
          alpha[i]?.total_alpha      ?? '',
        ]),
      ]
      const ws = XLSX.utils.aoa_to_sheet(wsData)

      // Lebar kolom
      ws['!cols'] = [
        { wch: 4 },
        { wch: 26 }, { wch: 13 }, { wch: 13 }, { wch: 10 }, { wch: 10 },
        { wch: 26 }, { wch: 13 }, { wch: 17 },
        { wch: 26 }, { wch: 13 }, { wch: 13 },
      ]
      // Merge
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // judul
        { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } }, // tanggal cetak
        { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },  // NO
        { s: { r: 3, c: 1 }, e: { r: 3, c: 5 } },  // Paling Rajin
        { s: { r: 3, c: 6 }, e: { r: 3, c: 8 } },  // Sering Terlambat
        { s: { r: 3, c: 9 }, e: { r: 3, c: 11 } }, // Sering Alpha
      ]

      // ── Styling cells ─────────────────────────────────────────────────────
      const C = (r, c) => XLSX.utils.encode_cell({ r, c })
      const setStyle = (addr, style) => {
        if (!ws[addr]) ws[addr] = { t: 's', v: '' }
        ws[addr].s = style
      }

      // Judul
      setStyle(C(0,0), {
        font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F46E5' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: { bottom: { style: 'thin', color: { rgb: 'C7D2FE' } } },
      })
      // Dicetak
      setStyle(C(1,0), {
        font: { italic: true, sz: 9, color: { rgb: '64748B' } },
        fill: { fgColor: { rgb: 'EEF2FF' } },
        alignment: { horizontal: 'center' },
      })

      // Group header (baris 3)
      const groupCfg = [
        { col: 1, bg: '059669', label: 'PALING RAJIN' },    // emerald
        { col: 6, bg: 'D97706', label: 'SERING TERLAMBAT' }, // amber
        { col: 9, bg: 'DC2626', label: 'SERING ALPHA' },     // rose
      ]
      groupCfg.forEach(({ col, bg }) => {
        const end = col === 1 ? 5 : col === 6 ? 8 : 11
        for (let c = col; c <= end; c++) {
          setStyle(C(3, c), {
            font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: bg } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: { top: { style: 'thin', color: { rgb: 'FFFFFF' } }, bottom: { style: 'thin', color: { rgb: 'FFFFFF' } } },
          })
        }
      })
      // NO header
      setStyle(C(3,0), {
        font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '374151' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      })

      // Sub-header (baris 4)
      const subHeaderBg = [
        { cols: [0],      bg: '374151' },
        { cols: [1,2,3,4,5],   bg: '065F46' },
        { cols: [6,7,8],       bg: '92400E' },
        { cols: [9,10,11],     bg: '7F1D1D' },
      ]
      subHeaderBg.forEach(({ cols, bg }) => cols.forEach(c => {
        setStyle(C(4, c), {
          font: { bold: true, sz: 9, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: bg } },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: { top: { style: 'thin', color: { rgb: 'FFFFFF' } }, bottom: { style: 'medium', color: { rgb: 'FFFFFF' } } },
        })
      }))

      // Data rows
      const rowBg   = { rajin: ['D1FAE5', 'A7F3D0'], terlambat: ['FEF3C7', 'FDE68A'], alpha: ['FFE4E6', 'FECDD3'] }
      const dataStart = 5
      for (let i = 0; i < maxLen; i++) {
        const r  = dataStart + i
        const alt = i % 2 === 1
        const noStyle = { font: { bold: true, sz: 9, color: { rgb: '374151' } }, fill: { fgColor: { rgb: alt ? 'F8FAFC' : 'FFFFFF' } }, alignment: { horizontal: 'center' }, border: { right: { style: 'thin', color: { rgb: 'E2E8F0' } } } }
        setStyle(C(r, 0), noStyle)
        // Rajin cols
        const rajinBg = alt ? rowBg.rajin[1] : rowBg.rajin[0]
        ;[1,2,3,4,5].forEach(c => setStyle(C(r, c), { font: { sz: 9 }, fill: { fgColor: { rgb: rajinBg } }, alignment: { horizontal: c === 0 || c >= 3 ? 'center' : 'left', wrapText: true }, border: { right: { style: 'hair', color: { rgb: 'D1FAE5' } } } }))
        // Terlambat cols
        const terlBg = alt ? rowBg.terlambat[1] : rowBg.terlambat[0]
        ;[6,7,8].forEach(c => setStyle(C(r, c), { font: { sz: 9 }, fill: { fgColor: { rgb: terlBg } }, alignment: { horizontal: c === 8 ? 'center' : 'left', wrapText: true }, border: { right: { style: 'hair', color: { rgb: 'FDE68A' } } } }))
        // Alpha cols
        const alphaBg = alt ? rowBg.alpha[1] : rowBg.alpha[0]
        ;[9,10,11].forEach(c => setStyle(C(r, c), { font: { sz: 9 }, fill: { fgColor: { rgb: alphaBg } }, alignment: { horizontal: c === 11 ? 'center' : 'left', wrapText: true }, border: { right: { style: 'hair', color: { rgb: 'FECDD3' } } } }))
      }

      // Row heights
      ws['!rows'] = [{ hpt: 28 }, { hpt: 16 }, { hpt: 6 }, { hpt: 22 }, { hpt: 22 }]

      // ── Sheet 2-4: masing-masing kategori ────────────────────────────────
      const makeSheetSingle = (list, cfg) => {
        const shData = [
          [`RANKING SISWA — ${cfg.label.toUpperCase()}`],
          [`Periode: ${periodeLabel}   |   Angkatan: ${tingkatLabel}   |   Dicetak: ${new Date().toLocaleString('id-ID')}`],
          [],
          cfg.headers,
          ...list.map((s, i) => cfg.row(s, i)),
        ]
        const sh = XLSX.utils.aoa_to_sheet(shData)
        sh['!cols'] = cfg.cols
        sh['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: cfg.headers.length - 1 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: cfg.headers.length - 1 } },
        ]
        sh['!rows'] = [{ hpt: 24 }, { hpt: 14 }, { hpt: 6 }, { hpt: 18 }]
        const hdrStyle = { font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: cfg.color } }, alignment: { horizontal: 'center', wrapText: true }, border: { bottom: { style: 'medium', color: { rgb: 'FFFFFF' } } } }
        cfg.headers.forEach((_, c) => {
          const addr = XLSX.utils.encode_cell({ r: 3, c })
          if (!sh[addr]) sh[addr] = { t: 's', v: '' }
          sh[addr].s = hdrStyle
        })
        // Data styling
        for (let i = 0; i < list.length; i++) {
          const r   = 4 + i
          const bg  = i % 2 === 0 ? cfg.bgLight : cfg.bgAlt
          cfg.headers.forEach((_, c) => {
            const addr = XLSX.utils.encode_cell({ r, c })
            if (!sh[addr]) sh[addr] = { t: 's', v: '' }
            sh[addr].s = { font: { sz: 9 }, fill: { fgColor: { rgb: bg } }, alignment: { horizontal: c === 0 ? 'center' : 'left' }, border: { bottom: { style: 'hair', color: { rgb: 'E2E8F0' } } } }
          })
        }
        // Title style
        const t0 = XLSX.utils.encode_cell({ r: 0, c: 0 })
        if (!sh[t0]) sh[t0] = { t: 's', v: '' }
        sh[t0].s = { font: { bold: true, sz: 13, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: cfg.color } }, alignment: { horizontal: 'center', vertical: 'center' } }
        const t1 = XLSX.utils.encode_cell({ r: 1, c: 0 })
        if (!sh[t1]) sh[t1] = { t: 's', v: '' }
        sh[t1].s = { font: { italic: true, sz: 9, color: { rgb: '475569' } }, fill: { fgColor: { rgb: cfg.bgLight } }, alignment: { horizontal: 'center' } }
        return sh
      }

      const shRajin = makeSheetSingle(rajin, {
        label: 'Paling Rajin', color: '059669', bgLight: 'D1FAE5', bgAlt: 'A7F3D0',
        headers: ['#', 'Nama Siswa', 'Kelas', 'Total Hadir', 'Total Absen', '% Hadir'],
        cols: [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 13 }, { wch: 10 }],
        row: (s, i) => [i+1, s.nama_lengkap, s.kelas?.nama_kelas||'-', s.total_hadir, s.total_alpha, `${s.persentase_kehadiran}%`],
      })
      const shTerlambat = makeSheetSingle(terlambat, {
        label: 'Sering Terlambat', color: 'D97706', bgLight: 'FEF3C7', bgAlt: 'FDE68A',
        headers: ['#', 'Nama Siswa', 'Kelas', 'Total Terlambat'],
        cols: [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 18 }],
        row: (s, i) => [i+1, s.nama_lengkap, s.kelas?.nama_kelas||'-', `${s.total_terlambat}×`],
      })
      const shAlpha = makeSheetSingle(alpha, {
        label: 'Sering Alpha', color: 'DC2626', bgLight: 'FFE4E6', bgAlt: 'FECDD3',
        headers: ['#', 'Nama Siswa', 'Kelas', 'Total Alpha'],
        cols: [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 14 }],
        row: (s, i) => [i+1, s.nama_lengkap, s.kelas?.nama_kelas||'-', `${s.total_alpha}×`],
      })

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Gabungan')
      XLSX.utils.book_append_sheet(wb, shRajin, 'Paling Rajin')
      XLSX.utils.book_append_sheet(wb, shTerlambat, 'Sering Terlambat')
      XLSX.utils.book_append_sheet(wb, shAlpha, 'Sering Alpha')

      const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true })
      saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Ranking_${periodeLabel}_${tingkatLabel}.xlsx`)
      toast.success('Berhasil ekspor Excel!')
    } catch (e) {
      console.error(e)
      toast.error('Gagal ekspor Excel')
    } finally {
      setExportLoading(false)
    }
  }

  // ── Ekspor PDF ──────────────────────────────────────────────────────────────
  const exportPDF = () => {
    if (!rankingData) return toast.error('Belum ada data untuk diekspor')
    setExportLoading(true)
    try {
      const { rajin, terlambat, alpha } = buildLists(rankingData)
      const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pW   = doc.internal.pageSize.getWidth()
      const pH   = doc.internal.pageSize.getHeight()
      const ml   = 14
      const mr   = pW - ml
      const now  = new Date().toLocaleString('id-ID')

      // helper: gambar header halaman
      const drawPageHeader = (pageTitle) => {
        // strip ungu
        doc.setFillColor(79, 70, 229)
        doc.rect(0, 0, pW, 22, 'F')
        doc.setFillColor(99, 102, 241)
        doc.rect(0, 16, pW, 6, 'F')
        // judul
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.setTextColor(255, 255, 255)
        doc.text('RANKING SISWA', ml, 10)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(pageTitle, ml, 15)
        // kanan
        doc.setFontSize(7)
        doc.text(`Periode: ${periodeLabel}`, mr, 8, { align: 'right' })
        doc.text(`Angkatan: ${tingkatLabel}`, mr, 13, { align: 'right' })
        doc.setTextColor(0, 0, 0)
      }

      // helper: footer setiap halaman
      const drawFooter = () => {
        doc.setFillColor(241, 245, 249)
        doc.rect(0, pH - 10, pW, 10, 'F')
        doc.setFontSize(7)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(100, 116, 139)
        doc.text(`Dicetak: ${now}`, ml, pH - 4)
        doc.text(`Halaman ${doc.internal.getCurrentPageInfo().pageNumber}`, mr, pH - 4, { align: 'right' })
        doc.setTextColor(0, 0, 0)
      }

      // helper: section label pill
      const drawSectionBadge = (label, y, color) => {
        doc.setFillColor(...color)
        doc.roundedRect(ml, y - 4.5, 68, 6.5, 2, 2, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(255, 255, 255)
        doc.text(label, ml + 3, y)
        doc.setTextColor(0, 0, 0)
      }

      // helper: stat badge kanan section
      const drawStatBadge = (label, val, x, y, color) => {
        doc.setFillColor(...color, 30)
        doc.roundedRect(x, y - 4.5, 36, 6.5, 2, 2, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...color)
        doc.text(`${label}: ${val}`, x + 3, y)
        doc.setTextColor(0, 0, 0)
      }

      // ── HALAMAN 1: Paling Rajin ──────────────────────────────────────────
      drawPageHeader('Rekap Kehadiran')
      drawSectionBadge('  Paling Rajin', 30, [5, 150, 105])
      drawStatBadge('Total siswa', rajin.length, mr - 36, 30, [5, 150, 105])

      autoTable(doc, {
        startY: 34,
        head: [['#', 'Nama Siswa', 'Kelas / Jurusan', 'Hadir', 'Alpha', '% Hadir']],
        body: rajin.map((s, i) => [
          i + 1,
          s.nama_lengkap,
          s.kelas?.nama_kelas || '-',
          s.total_hadir ?? '-',
          s.total_alpha ?? '-',
          `${s.persentase_kehadiran ?? 0}%`,
        ]),
        headStyles: {
          fillColor: [5, 150, 105], textColor: 255,
          fontStyle: 'bold', fontSize: 8,
          halign: 'center', valign: 'middle', cellPadding: 3,
        },
        bodyStyles:  { fontSize: 8, cellPadding: 2.5, valign: 'middle' },
        alternateRowStyles: { fillColor: [209, 250, 229] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 38, halign: 'center' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 18, halign: 'center' },
          5: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        },
        margin: { left: ml, right: ml },
        tableLineColor: [209, 250, 229],
        tableLineWidth: 0.1,
        didDrawPage: () => drawFooter(),
      })

      // ── HALAMAN 2: Sering Terlambat ──────────────────────────────────────
      doc.addPage()
      drawPageHeader('Rekap Keterlambatan')
      drawSectionBadge('  Sering Terlambat', 30, [217, 119, 6])
      drawStatBadge('Total siswa', terlambat.length, mr - 36, 30, [217, 119, 6])

      autoTable(doc, {
        startY: 34,
        head: [['#', 'Nama Siswa', 'Kelas / Jurusan', 'Total Terlambat', 'Hadir', '% Hadir']],
        body: terlambat.map((s, i) => [
          i + 1,
          s.nama_lengkap,
          s.kelas?.nama_kelas || '-',
          `${s.total_terlambat ?? 0}×`,
          s.total_hadir ?? '-',
          `${s.persentase_kehadiran ?? 0}%`,
        ]),
        headStyles: {
          fillColor: [217, 119, 6], textColor: 255,
          fontStyle: 'bold', fontSize: 8,
          halign: 'center', valign: 'middle', cellPadding: 3,
        },
        bodyStyles:  { fontSize: 8, cellPadding: 2.5, valign: 'middle' },
        alternateRowStyles: { fillColor: [254, 243, 199] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 38, halign: 'center' },
          3: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
          4: { cellWidth: 18, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
        },
        margin: { left: ml, right: ml },
        tableLineColor: [254, 243, 199],
        tableLineWidth: 0.1,
        didDrawPage: () => drawFooter(),
      })

      // ── HALAMAN 3: Sering Alpha ──────────────────────────────────────────
      doc.addPage()
      drawPageHeader('Rekap Ketidakhadiran')
      drawSectionBadge('  Sering Alpha', 30, [220, 38, 38])
      drawStatBadge('Total siswa', alpha.length, mr - 36, 30, [220, 38, 38])

      autoTable(doc, {
        startY: 34,
        head: [['#', 'Nama Siswa', 'Kelas / Jurusan', 'Total Alpha', 'Terlambat', '% Hadir']],
        body: alpha.map((s, i) => [
          i + 1,
          s.nama_lengkap,
          s.kelas?.nama_kelas || '-',
          `${s.total_alpha ?? 0}×`,
          s.total_terlambat ?? '-',
          `${s.persentase_kehadiran ?? 0}%`,
        ]),
        headStyles: {
          fillColor: [220, 38, 38], textColor: 255,
          fontStyle: 'bold', fontSize: 8,
          halign: 'center', valign: 'middle', cellPadding: 3,
        },
        bodyStyles:  { fontSize: 8, cellPadding: 2.5, valign: 'middle' },
        alternateRowStyles: { fillColor: [255, 228, 230] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 38, halign: 'center' },
          3: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
          4: { cellWidth: 22, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
        },
        margin: { left: ml, right: ml },
        tableLineColor: [255, 228, 230],
        tableLineWidth: 0.1,
        didDrawPage: () => drawFooter(),
      })

      doc.save(`Ranking_${periodeLabel}_${tingkatLabel}.pdf`)
      toast.success('Berhasil ekspor PDF!')
    } catch (e) {
      console.error(e)
      toast.error('Gagal ekspor PDF')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">

      {/* MODAL */}
      {selectedSiswa && (
        <SiswaProfileModal siswa={selectedSiswa} onClose={() => setSelectedSiswa(null)} />
      )}

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
            <Trophy size={17} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Ranking Siswa</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {periodeLabel} · {tingkatLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Ekspor Excel */}
          <button
            onClick={exportExcel}
            disabled={loading || exportLoading || !rankingData}
            title="Ekspor Excel"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={13} />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {/* Ekspor PDF */}
          <button
            onClick={exportPDF}
            disabled={loading || exportLoading || !rankingData}
            title="Ekspor PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileText size={13} />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Refresh */}
          <button onClick={fetchRanking} disabled={loading}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw size={13} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* ── Filter Panel ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-4 space-y-3">

        {/* Row 1: Bulan, Tahun, Tingkat */}
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 self-center">
            <Filter size={12} /> Filter
          </div>

          {/* Bulan */}
          <div className="flex-1 min-w-[110px]">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              <Calendar size={9} className="inline mr-1" />Bulan
            </label>
            <select value={bulan} onChange={e => { setBulan(+e.target.value); setUseRange(false) }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all">
              {BULAN.map((b, i) => <option key={i} value={i+1}>{b}</option>)}
            </select>
          </div>

          {/* Tahun */}
          <div className="flex-1 min-w-[80px]">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Tahun</label>
            <select value={tahun} onChange={e => { setTahun(+e.target.value); setUseRange(false) }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all">
              {TAHUN.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Tingkat/Angkatan */}
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              <School size={9} className="inline mr-1" />Angkatan
            </label>
            <select value={tingkat} onChange={e => setTingkat(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all">
              {TINGKAT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Date range toggle */}
        <div className="flex flex-wrap items-end gap-2.5">
          <button onClick={() => setUseRange(!useRange)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              useRange
                ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700'
                : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500'
            }`}>
            <CalendarRange size={12} />
            {useRange ? 'Pakai Date Range ✓' : 'Pakai Date Range'}
          </button>

          {useRange && (
            <>
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Dari Tanggal</label>
                <input type="date" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" />
              </div>
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Sampai Tanggal</label>
                <input type="date" value={tanggalSelesai} onChange={e => setTanggalSelesai(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" />
              </div>
              <button onClick={handleApplyRange}
                className="px-4 py-1.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
                Tampilkan
              </button>
            </>
          )}
        </div>

        {/* Pill aktif filter */}
        {(tingkat || (useRange && tanggalMulai && tanggalSelesai)) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tingkat && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-[10px] font-semibold">
                <School size={9} /> {tingkatLabel}
                <button onClick={() => setTingkat('')} className="ml-0.5 hover:text-violet-900">×</button>
              </span>
            )}
            {useRange && tanggalMulai && tanggalSelesai && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-semibold">
                <CalendarRange size={9} /> {tanggalMulai} – {tanggalSelesai}
                <button onClick={() => { setUseRange(false); setTanggalMulai(''); setTanggalSelesai('') }} className="ml-0.5 hover:text-indigo-900">×</button>
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Memuat ranking...</p>
          </div>
        </div>
      )}

      {!loading && rankingData && (
        <>
          {/* ── Mini Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Total Siswa"        value={rankingData.total_siswa || 0}                       color="text-slate-800 dark:text-slate-100"    bg="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl" delay={0} />
            <MiniStat label="Siswa Rajin"         value={rankingData.siswa_rajin?.length || 0}               color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl" delay={0.05} />
            <MiniStat label="Sering Terlambat"    value={rankingData.siswa_sering_terlambat?.length || 0}   color="text-amber-600 dark:text-amber-400"    bg="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-2xl" delay={0.1} />
            <MiniStat label="Sering Alpha"         value={rankingData.siswa_sering_alpha?.length || 0}       color="text-rose-600 dark:text-rose-400"      bg="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 rounded-2xl" delay={0.15} />
          </div>

          {/* ── Ranking Cards ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <RankingCard data={rankingData.siswa_rajin?.slice(0, 8) || []} type="rajin" delay={0.1} onProfileClick={setSelectedSiswa} />
            <RankingCard data={[...(rankingData.siswa_sering_terlambat || [])].sort((a,b) => b.total_terlambat - a.total_terlambat).slice(0, 8)} type="terlambat" delay={0.15} onProfileClick={setSelectedSiswa} />
            <RankingCard data={[...(rankingData.siswa_sering_alpha || [])].sort((a,b) => b.total_alpha - a.total_alpha).slice(0, 8)} type="alpha" delay={0.2} onProfileClick={setSelectedSiswa} />
          </div>

          {/* ── Info note ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5">
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info size={13} className="text-violet-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Data ranking dihitung berdasarkan rekap kehadiran siswa periode{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{periodeLabel}</span>
              {tingkat && <>, angkatan kelas <span className="font-semibold text-slate-700 dark:text-slate-300">{tingkat}</span></>}.
            </p>
          </motion.div>
        </>
      )}

      {!loading && !rankingData && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap size={28} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada data untuk periode ini</p>
        </div>
      )}
    </div>
  )
}
