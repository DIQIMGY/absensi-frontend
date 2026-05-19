import AppLayout from './AppLayout'
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, School, BookOpen,
  Calendar, BookMarked, ClipboardList, Settings, FileText, Trophy,
  AlertCircle, Activity, BarChart3, TrendingUp, Shield, LogOut,
} from 'lucide-react'
import { adminApi } from '../services/adminService'
import { useThemeStore } from '../stores/themeStore'

const menuGroups = [
  {
    title: 'Utama',
    items: [
      { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    title: 'Manajemen Data',
    items: [
      { path: '/admin/users',           icon: Users,        label: 'Pengguna' },
      { path: '/admin/siswas',          icon: GraduationCap,label: 'Siswa' },
      { path: '/admin/gurus',           icon: UserCheck,    label: 'Guru' },
      { path: '/admin/alumni',          icon: GraduationCap,label: 'Alumni' },
      { path: '/admin/naik-kelas',      icon: TrendingUp,   label: 'Naik Kelas' },
      { path: '/admin/kelas',           icon: School,       label: 'Kelas' },
      { path: '/admin/jurusans',        icon: BookOpen,     label: 'Jurusan' },
      { path: '/admin/tahun-ajarans',   icon: Calendar,     label: 'Tahun Ajaran' },
      { path: '/admin/mata-pelajarans', icon: BookMarked,   label: 'Mata Pelajaran' },
    ],
  },
  {
    title: 'Operasional',
    items: [
      { path: '/admin/absensis',     icon: ClipboardList, label: 'Absensi Siswa' },
      { path: '/admin/absensi-guru', icon: UserCheck,     label: 'Absensi Masuk Guru' },
      { path: '/admin/pulang-guru',  icon: LogOut,        label: 'Absensi Pulang Guru' },
      { path: '/admin/ranking',      icon: Trophy,        label: 'Ranking' },
      { path: '/admin/izins',        icon: AlertCircle,   label: 'Izin' },
    ],
  },
  {
    title: 'Laporan & Log',
    items: [
      { path: '/admin/laporan',      icon: FileText,  label: 'Laporan Siswa' },
      { path: '/admin/laporan-guru', icon: BarChart3, label: 'Laporan Guru' },
      { path: '/admin/logging',      icon: Activity,  label: 'Log Aktivitas' },
    ],
  },
  {
    title: 'Pengaturan',
    items: [
      { path: '/admin/pengaturan', icon: Settings, label: 'Pengaturan' },
    ],
  },
]

const accent = {
  color: '#10b981',
  activeBg: 'bg-emerald-50 dark:bg-emerald-900/20',
  activeBorder: 'border-emerald-200 dark:border-emerald-800/40',
  activeText: 'text-emerald-700 dark:text-emerald-400',
}

// Notification loader helper
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

async function adminNotifLoader() {
  const res = await adminApi.getNotifications()
  const readIds = getReadIds('adminNotifRead')
  const list = (res.data.data?.notifications || []).map(n => ({
    ...n,
    read: readIds.includes(n.id) || n.read,
  }))
  return { list, unreadCount: list.filter(n => !n.read).length }
}

export default function AdminLayout() {
  return (
    <AppLayout
      menuGroups={menuGroups}
      accent={accent}
      roleLabel="Administrator"
      roleIcon={<Shield size={9} className="text-emerald-500"/>}
      notifLoader={adminNotifLoader}
      notifMarkRead={(id) => saveReadId('adminNotifRead', id)}
      notifMarkAll={() => {}}
    />
  )
}
