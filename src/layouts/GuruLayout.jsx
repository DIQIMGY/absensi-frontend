import AppLayout from './AppLayout'
import {
  LayoutDashboard, ClipboardList, User, Trophy, Calendar,
  BarChart3, GraduationCap, FileText, History, BookOpen, TrendingUp, LogOut, Award,
} from 'lucide-react'
import { guruApi } from '../services/guruService'
import { useGuruJabatan } from '../hooks/useGuruJabatan'

// Semua menu yang mungkin muncul, dengan flag `requireFullAccess`
// Menu dengan requireFullAccess:true disembunyikan untuk guru_mapel & karyawan
const ALL_MENU_ITEMS = [
  { path: '/guru/dashboard',        icon: LayoutDashboard, label: 'Dashboard',       requireFullAccess: false },
  { path: '/guru/absensi',          icon: ClipboardList,   label: 'Absensi',          requireFullAccess: false },
  { path: '/guru/pulang-siswa',     icon: LogOut,          label: 'Pulang Siswa',     requireFullAccess: true  },
  { path: '/guru/data-siswa',       icon: GraduationCap,   label: 'Data Siswa',       requireFullAccess: true  },
  { path: '/guru/izins',            icon: FileText,        label: 'Izin',             requireFullAccess: true  },
  { path: '/guru/ranking',          icon: Trophy,          label: 'Ranking Siswa',    requireFullAccess: true  },
  { path: '/guru/ranking-guru',     icon: Award,           label: 'Ranking Guru',     requireFullAccess: false },
  { path: '/guru/rekap-harian',     icon: Calendar,        label: 'Rekap Harian',     requireFullAccess: true  },
  { path: '/guru/statistik-kelas',  icon: BarChart3,       label: 'Statistik Kelas',  requireFullAccess: true  },
  { path: '/guru/riwayat-absensi',  icon: History,         label: 'Riwayat Absensi',  requireFullAccess: false },
  { path: '/guru/naik-kelas',       icon: TrendingUp,      label: 'Naik Kelas',       requireFullAccess: true  },
  { path: '/guru/profil',           icon: User,            label: 'Profil',           requireFullAccess: false },
]

const accent = {
  color: '#6366f1',
  activeBg: 'bg-indigo-50 dark:bg-indigo-900/20',
  activeBorder: 'border-indigo-200 dark:border-indigo-800/40',
  activeText: 'text-indigo-700 dark:text-indigo-400',
}

const getReadIds = (key) => {
  try {
    const read = localStorage.getItem(key)
    const lastClear = localStorage.getItem(`${key}_clear`)
    const today = new Date().toDateString()
    if (lastClear !== today) {
      localStorage.setItem(`${key}_clear`, today)
      localStorage.removeItem(key)
      return []
    }
    return read ? JSON.parse(read) : []
  } catch { return [] }
}

const saveReadId = (key, id) => {
  try {
    const ids = getReadIds(key)
    if (!ids.includes(id)) { ids.push(id); localStorage.setItem(key, JSON.stringify(ids)) }
  } catch {}
}

async function guruNotifLoader() {
  const res = await guruApi.getNotifications()
  const readIds = getReadIds('guruNotifRead')
  const list = (res.data.data?.notifications || []).map(n => ({
    ...n,
    read: readIds.includes(n.id) || n.read,
  }))
  return { list, unreadCount: list.filter(n => !n.read).length }
}

export default function GuruLayout() {
  const { isAbsensiOnly, jabatanLabel, jabatan } = useGuruJabatan()

  // Filter menu berdasarkan jabatan
  const visibleItems = ALL_MENU_ITEMS.filter(item =>
    !item.requireFullAccess || !isAbsensiOnly
  )

  const menuGroups = [
    {
      // Tampilkan label jabatan sebagai subtitle di sidebar
      title: '',
      items: visibleItems,
    },
  ]

  return (
    <AppLayout
      menuGroups={menuGroups}
      accent={accent}
      roleLabel={isAbsensiOnly ? jabatanLabel : 'Panel Guru'}
      roleIcon={<BookOpen size={9} className="text-indigo-500"/>}
      notifLoader={guruNotifLoader}
      notifMarkRead={(id) => saveReadId('guruNotifRead', id)}
      notifMarkAll={() => {}}
    />
  )
}
