import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePengaturanStore } from '../stores/pengaturanStore'

export default function AuthLayout() {
  const { pengaturan } = usePengaturanStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Outlet tanpa wrapper - biar halaman bisa full width */}
      <Outlet />
    </div>
  )
}