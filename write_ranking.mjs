import { writeFileSync } from 'fs'

const PART1 = `import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, RefreshCw, Crown, Star,
  ChevronLeft, ChevronRight,
  CheckCircle, Clock, AlertTriangle, X,
  GraduationCap, Shield,
} from 'lucide-react'
import { siswaApi } from '../../services/siswaService'
import { BadgeOverlay } from '../../components/GachaHarian'

const TABS = [
  { key:'hadir',     label:'Rajin',     emoji:'🏆', color:'#10b981', gradFull:'linear-gradient(135deg,#059669,#10b981,#34d399)', text:'text-emerald-600 dark:text-emerald-400', icon:CheckCircle,   desc:'Paling sering hadir' },
  { key:'terlambat', label:'Terlambat', emoji:'⏰', color:'#f59e0b', gradFull:'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)', text:'text-amber-600 dark:text-amber-400',   icon:Clock,         desc:'Paling sering terlambat' },
  { key:'alpha',     label:'Alpha',     emoji:'💀', color:'#ef4444', gradFull:'linear-gradient(135deg,#dc2626,#ef4444,#f87171)', text:'text-rose-600 dark:text-rose-400',     icon:AlertTriangle, desc:'Paling sering alpha' },
]
const PODIUM_CFG = [
  { rank:1, size:60, crown:'👑', ringColor:'#f59e0b', order:'order-2', baseH:'h-20' },
  { rank:2, size:50, crown:'🥈', ringColor:'#94a3b8', order:'order-1', baseH:'h-14' },
  { rank:3, size:44, crown:'🥉', ringColor:'#f97316', order:'order-3', baseH:'h-10' },
]

function SiswaAvatar({ siswa, size=44 }) {
  const [err, setErr] = useState(false)
  const initial = (siswa?.nama_lengkap||'S').charAt(0).toUpperCase()
  const hasBadge = !!siswa?.active_badge
  return (
    <div className="relative flex-shrink-0" style={{ width:size, height:size }}>
      <div className={\`w-full h-full overflow-hidden bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center font-black text-white \${hasBadge?'rounded-full':'rounded-2xl'}\`}
        style={{ fontSize:Math.round(size*0.38) }}>
        {siswa?.foto_url && !err
          ? <img src={siswa.foto_url} alt={siswa.nama_lengkap} className="w-full h-full object-cover" onError={()=>setErr(true)}/>
          : initial}
      </div>
      {hasBadge && <BadgeOverlay badgeId={siswa.active_badge} badges={[]} size="sm"/>}
    </div>
  )
}
`

writeFileSync('src/pages/siswa/Ranking.jsx', PART1, 'utf8')
console.log('part1 ok', PART1.length)
