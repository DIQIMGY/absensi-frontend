import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuthStore } from '../stores/authStore'

// Layouts (tetap static — kecil)
import AuthLayout from '../layouts/AuthLayout'
import AdminLayout from '../layouts/AdminLayout'
import GuruLayout from '../layouts/GuruLayout'
import SiswaLayout from '../layouts/SiswaLayout'
import ProtectedRoute from '../components/ProtectedRoute'

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-violet-500 rounded-full animate-spin"/>
  </div>
)

const Lazy = (Component) => (
  <Suspense fallback={<PageLoader/>}>
    <Component/>
  </Suspense>
)

// Public & Auth
const PublicAbsen    = lazy(() => import('../pages/PublicAbsen'))
const Login          = lazy(() => import('../pages/auth/Login'))
const Register       = lazy(() => import('../pages/auth/Register'))

// Admin
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'))
const Users          = lazy(() => import('../pages/admin/Users'))
const Siswas         = lazy(() => import('../pages/admin/Siswas'))
const Gurus          = lazy(() => import('../pages/admin/Gurus'))
const Kelas          = lazy(() => import('../pages/admin/Kelas'))
const Jurusans       = lazy(() => import('../pages/admin/Jurusans'))
const TahunAjarans   = lazy(() => import('../pages/admin/TahunAjarans'))
const MataPelajarans = lazy(() => import('../pages/admin/MataPelajarans'))
const Absensis       = lazy(() => import('../pages/admin/Absensis'))
const AbsensiGuru    = lazy(() => import('../pages/admin/AbsensiGuru'))
const Izins          = lazy(() => import('../pages/admin/Izins'))
const Pengaturan     = lazy(() => import('../pages/admin/Pengaturan'))
const Laporan        = lazy(() => import('../pages/admin/Laporan'))
const LaporanGuru    = lazy(() => import('../pages/admin/LaporanGuru'))
const Ranking        = lazy(() => import('../pages/admin/Ranking'))
const Logging        = lazy(() => import('../pages/admin/Logging'))
const Alumni         = lazy(() => import('../pages/admin/Alumni'))
const NaikKelas      = lazy(() => import('../pages/admin/NaikKelas'))

// Guru
const GuruDashboard       = lazy(() => import('../pages/guru/Dashboard'))
const GuruAbsensi         = lazy(() => import('../pages/guru/Absensi'))
const GuruProfil          = lazy(() => import('../pages/guru/Profil'))
const GuruRanking         = lazy(() => import('../pages/guru/Ranking'))
const GuruRekapHarian     = lazy(() => import('../pages/guru/RekapHarian'))
const GuruStatistikKelas  = lazy(() => import('../pages/guru/StatistikKelas'))
const GuruDataSiswa       = lazy(() => import('../pages/guru/DataSiswa'))
const GuruIzins           = lazy(() => import('../pages/guru/Izins'))
const GuruRiwayatAbsensi  = lazy(() => import('../pages/guru/RiwayatAbsensi'))
const GuruNaikKelas       = lazy(() => import('../pages/guru/NaikKelas'))

// Siswa
const SiswaDashboard = lazy(() => import('../pages/siswa/Dashboard'))
const SiswaAbsen     = lazy(() => import('../pages/siswa/Absen'))
const SiswaRiwayat   = lazy(() => import('../pages/siswa/Riwayat'))
const SiswaProfil    = lazy(() => import('../pages/siswa/Profil'))

function DashboardRedirect() {
  const { getDashboardRoute } = useAuthStore()
  return <Navigate to={getDashboardRoute()} replace />
}

export const router = createBrowserRouter([
  { path: '/',      element: Lazy(PublicAbsen) },
  { path: '/absen', element: Lazy(PublicAbsen) },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin','guru','siswa']}>
        <DashboardRedirect/>
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <AuthLayout/>,
    children: [{ index: true, element: Lazy(Login) }],
  },
  {
    path: '/register',
    element: <AuthLayout/>,
    children: [{ index: true, element: Lazy(Register) }],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout/>
      </ProtectedRoute>
    ),
    children: [
      { index: true,              element: <Navigate to="/admin/dashboard" replace/> },
      { path: 'dashboard',        element: Lazy(AdminDashboard) },
      { path: 'users',            element: Lazy(Users) },
      { path: 'siswas',           element: Lazy(Siswas) },
      { path: 'gurus',            element: Lazy(Gurus) },
      { path: 'kelas',            element: Lazy(Kelas) },
      { path: 'jurusans',         element: Lazy(Jurusans) },
      { path: 'tahun-ajarans',    element: Lazy(TahunAjarans) },
      { path: 'mata-pelajarans',  element: Lazy(MataPelajarans) },
      { path: 'absensis',         element: Lazy(Absensis) },
      { path: 'absensi-guru',     element: Lazy(AbsensiGuru) },
      { path: 'izins',            element: Lazy(Izins) },
      { path: 'pengaturan',       element: Lazy(Pengaturan) },
      { path: 'laporan',          element: Lazy(Laporan) },
      { path: 'laporan-guru',     element: Lazy(LaporanGuru) },
      { path: 'ranking',          element: Lazy(Ranking) },
      { path: 'logging',          element: Lazy(Logging) },
      { path: 'alumni',           element: Lazy(Alumni) },
      { path: 'naik-kelas',       element: Lazy(NaikKelas) },
    ],
  },
  {
    path: '/guru',
    element: (
      <ProtectedRoute allowedRoles={['guru','admin']}>
        <GuruLayout/>
      </ProtectedRoute>
    ),
    children: [
      { index: true,              element: <Navigate to="/guru/dashboard" replace/> },
      { path: 'dashboard',        element: Lazy(GuruDashboard) },
      { path: 'absensi',          element: Lazy(GuruAbsensi) },
      { path: 'ranking',          element: Lazy(GuruRanking) },
      { path: 'rekap-harian',     element: Lazy(GuruRekapHarian) },
      { path: 'statistik-kelas',  element: Lazy(GuruStatistikKelas) },
      { path: 'data-siswa',       element: Lazy(GuruDataSiswa) },
      { path: 'izins',            element: Lazy(GuruIzins) },
      { path: 'riwayat-absensi',  element: Lazy(GuruRiwayatAbsensi) },
      { path: 'naik-kelas',       element: Lazy(GuruNaikKelas) },
      { path: 'profil',           element: Lazy(GuruProfil) },
    ],
  },
  {
    path: '/siswa',
    element: (
      <ProtectedRoute allowedRoles={['siswa','admin']}>
        <SiswaLayout/>
      </ProtectedRoute>
    ),
    children: [
      { index: true,    element: <Navigate to="/siswa/dashboard" replace/> },
      { path: 'dashboard', element: Lazy(SiswaDashboard) },
      { path: 'absen',     element: Lazy(SiswaAbsen) },
      { path: 'riwayat',   element: Lazy(SiswaRiwayat) },
      { path: 'profil',    element: Lazy(SiswaProfil) },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace/> },
])
