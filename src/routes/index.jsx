import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

// Layouts
import AuthLayout from '../layouts/AuthLayout'
import AdminLayout from '../layouts/AdminLayout'
import GuruLayout from '../layouts/GuruLayout'
import SiswaLayout from '../layouts/SiswaLayout'
import ProtectedRoute from '../components/ProtectedRoute'

// Public & Auth Pages
import PublicAbsen from '../pages/PublicAbsen'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard'
import Users from '../pages/admin/Users'
import Siswas from '../pages/admin/Siswas'
import Gurus from '../pages/admin/Gurus'
import Kelas from '../pages/admin/Kelas'
import Jurusans from '../pages/admin/Jurusans'
import TahunAjarans from '../pages/admin/TahunAjarans'
import MataPelajarans from '../pages/admin/MataPelajarans'
import Absensis from '../pages/admin/Absensis'
import AbsensiGuru from '../pages/admin/AbsensiGuru'
import Izins from '../pages/admin/Izins'
import Pengaturan from '../pages/admin/Pengaturan'
import Laporan from '../pages/admin/Laporan'
import LaporanGuru from '../pages/admin/LaporanGuru'
import Ranking from '../pages/admin/Ranking'
import Logging from '../pages/admin/Logging'
import Alumni from '../pages/admin/Alumni'
import NaikKelas from '../pages/admin/NaikKelas'

// Guru Pages
import GuruDashboard from '../pages/guru/Dashboard'
import GuruAbsensi from '../pages/guru/Absensi'
import GuruProfil from '../pages/guru/Profil'
import GuruRanking from '../pages/guru/Ranking'
import GuruRekapHarian from '../pages/guru/RekapHarian'
import GuruStatistikKelas from '../pages/guru/StatistikKelas'
import GuruDataSiswa from '../pages/guru/DataSiswa'
import GuruIzins from '../pages/guru/Izins'
import GuruRiwayatAbsensi from '../pages/guru/RiwayatAbsensi'
import GuruNaikKelas from '../pages/guru/NaikKelas'

// Siswa Pages
import SiswaDashboard from '../pages/siswa/Dashboard'
import SiswaAbsen from '../pages/siswa/Absen'
import SiswaRiwayat from '../pages/siswa/Riwayat'
import SiswaProfil from '../pages/siswa/Profil'
import SiswaRanking from '../pages/siswa/Ranking'

function DashboardRedirect() {
  const { getDashboardRoute } = useAuthStore()
  return <Navigate to={getDashboardRoute()} replace />
}

export const router = createBrowserRouter([
  { path: '/',      element: <PublicAbsen /> },
  { path: '/absen', element: <PublicAbsen /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'guru', 'siswa']}>
        <DashboardRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: '/register',
    element: <AuthLayout />,
    children: [{ index: true, element: <Register /> }],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,              element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard',        element: <AdminDashboard /> },
      { path: 'users',            element: <Users /> },
      { path: 'siswas',           element: <Siswas /> },
      { path: 'gurus',            element: <Gurus /> },
      { path: 'kelas',            element: <Kelas /> },
      { path: 'jurusans',         element: <Jurusans /> },
      { path: 'tahun-ajarans',    element: <TahunAjarans /> },
      { path: 'mata-pelajarans',  element: <MataPelajarans /> },
      { path: 'absensis',         element: <Absensis /> },
      { path: 'absensi-guru',     element: <AbsensiGuru /> },
      { path: 'izins',            element: <Izins /> },
      { path: 'pengaturan',       element: <Pengaturan /> },
      { path: 'laporan',          element: <Laporan /> },
      { path: 'laporan-guru',     element: <LaporanGuru /> },
      { path: 'ranking',          element: <Ranking /> },
      { path: 'logging',          element: <Logging /> },
      { path: 'alumni',           element: <Alumni /> },
      { path: 'naik-kelas',       element: <NaikKelas /> },
    ],
  },
  {
    path: '/guru',
    element: (
      <ProtectedRoute allowedRoles={['guru', 'admin']}>
        <GuruLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,              element: <Navigate to="/guru/dashboard" replace /> },
      { path: 'dashboard',        element: <GuruDashboard /> },
      { path: 'absensi',          element: <GuruAbsensi /> },
      { path: 'ranking',          element: <GuruRanking /> },
      { path: 'rekap-harian',     element: <GuruRekapHarian /> },
      { path: 'statistik-kelas',  element: <GuruStatistikKelas /> },
      { path: 'data-siswa',       element: <GuruDataSiswa /> },
      { path: 'izins',            element: <GuruIzins /> },
      { path: 'riwayat-absensi',  element: <GuruRiwayatAbsensi /> },
      { path: 'naik-kelas',       element: <GuruNaikKelas /> },
      { path: 'profil',           element: <GuruProfil /> },
    ],
  },
  {
    path: '/siswa',
    element: (
      <ProtectedRoute allowedRoles={['siswa', 'admin']}>
        <SiswaLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,       element: <Navigate to="/siswa/dashboard" replace /> },
      { path: 'dashboard', element: <SiswaDashboard /> },
      { path: 'absen',     element: <SiswaAbsen /> },
      { path: 'riwayat',   element: <SiswaRiwayat /> },
      { path: 'profil',    element: <SiswaProfil /> },
      { path: 'ranking',   element: <SiswaRanking /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])
