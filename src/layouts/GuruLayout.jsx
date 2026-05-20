import AppLayout from './AppLayout'
import {
  LayoutDashboard, ClipboardList, User, Trophy, Calendar,
  BarChart3, GraduationCap, FileText, History, BookOpen, TrendingUp, LogOut,
} from 'lucide-react'
import { guruApi } from '../services/guruService'

const menuGroups = [
  {
    title: '',
    items: [
      { path: '/guru/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/guru/absensi',          icon: ClipboardList,   label: 'Absensi' },
      { path: '/guru/pulang-siswa',     icon: LogOut,          label: 'Pulang Siswa' },
      { path: '/guru/data-siswa',       icon: GraduationCap,   label: 'Data Siswa' },
      { path: '/guru/izins',            icon: FileText,        label: 'Izin' },
      { path: '/guru/ranking',          icon: Trophy,          label: 'Ranking' },
      { path: '/guru/rekap-harian',     icon: Calendar,        label: 'Rekap Harian' },
      { path: '/guru/statistik-kelas',  icon: BarChart3,       label: 'Statistik Kelas' },
      { path: '/guru/riwayat-absensi',  icon: History,         label: 'Riwayat Absensi' },
      { path: '/guru/naik-kelas',       icon: TrendingUp,      label: 'Naik Kelas' },
      { path: '/guru/profil',           icon: User,            label: 'Profil' },
    ],
  },
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
  return (
    <AppLayout
      menuGroups={menuGroups}
      accent={accent}
      roleLabel="Panel Guru"
      roleIcon={<BookOpen size={9} className="text-indigo-500"/>}
      notifLoader={guruNotifLoader}
      notifMarkRead={(id) => saveReadId('guruNotifRead', id)}
      notifMarkAll={() => {}}
    />
  )
}
