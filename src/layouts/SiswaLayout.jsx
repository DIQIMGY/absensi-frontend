import AppLayout from './AppLayout'
import { LayoutDashboard, Camera, History, User, GraduationCap, Trophy } from 'lucide-react'
import { siswaApi } from '../services/siswaService'
import PulangNotification from '../components/PulangNotification'
import SantaiDirumahNotification from '../components/SantaiDirumahNotification'

const menuGroups = [
  {
    title: '',
    items: [
      { path: '/siswa/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/siswa/absen',     icon: Camera,          label: 'Absen' },
      { path: '/siswa/riwayat',   icon: History,         label: 'Riwayat' },
      { path: '/siswa/ranking',   icon: Trophy,          label: 'Ranking' },
      { path: '/siswa/profil',    icon: User,            label: 'Profil' },
    ],
  },
]

const accent = {
  color: '#8b5cf6',
  activeBg: 'bg-violet-50 dark:bg-violet-900/20',
  activeBorder: 'border-violet-200 dark:border-violet-800/40',
  activeText: 'text-violet-700 dark:text-violet-400',
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

async function siswaNotifLoader() {
  const res = await siswaApi.getNotifications()
  const readIds = getReadIds('siswaNotifRead')
  const list = (res.data.data?.notifications || []).map(n => ({
    ...n,
    read: readIds.includes(n.id) || n.read,
  }))
  return { list, unreadCount: list.filter(n => !n.read).length }
}

export default function SiswaLayout() {
  return (
    <>
      <PulangNotification/>
      <SantaiDirumahNotification/>
      <AppLayout
        menuGroups={menuGroups}
        accent={accent}
        roleLabel="Panel Siswa"
        roleIcon={<GraduationCap size={9} className="text-violet-500"/>}
        notifLoader={siswaNotifLoader}
        notifMarkRead={(id) => saveReadId('siswaNotifRead', id)}
        notifMarkAll={() => {}}
      />
    </>
  )
}
