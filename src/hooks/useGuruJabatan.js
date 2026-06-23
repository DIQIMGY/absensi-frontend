/**
 * useGuruJabatan — hook untuk cek jabatan/security level guru di frontend.
 *
 * Jabatan:
 *   kepsek     = Kepala Sekolah → akses penuh semua fitur & semua kelas
 *   wali_kelas = Wali Kelas     → akses penuh fitur, hanya kelas yang diampu
 *   guru_mapel = Guru Mapel     → hanya fitur absensi diri sendiri
 *   karyawan   = Karyawan       → sama seperti guru_mapel, label berbeda
 */
import { useAuthStore } from '../stores/authStore'

export function useGuruJabatan() {
  const { user } = useAuthStore()
  const jabatan = user?.guru?.jabatan ?? 'guru_mapel'

  return {
    jabatan,
    jabatanLabel: user?.guru?.jabatan_label ?? 'Guru',

    /** Kepala Sekolah — akses semua fitur, semua kelas */
    isKepsek: jabatan === 'kepsek',

    /** Wali Kelas — akses semua fitur, kelas diampu saja */
    isWaliKelas: jabatan === 'wali_kelas',

    /** Guru Mapel — hanya absensi diri sendiri, TIDAK ada data siswa/kelas */
    isGuruMapel: jabatan === 'guru_mapel',

    /** Karyawan — sama seperti guru mapel */
    isKaryawan: jabatan === 'karyawan',

    /**
     * isAbsensiOnly = true untuk guru_mapel & karyawan.
     * Halaman yang TIDAK boleh diakses: pulang-siswa, data-siswa, izins,
     * ranking, rekap-harian, statistik-kelas, naik-kelas, dan
     * chart/data siswa di dashboard.
     */
    isAbsensiOnly: jabatan === 'guru_mapel' || jabatan === 'karyawan',

    /**
     * canAccessAllKelas = true hanya untuk kepsek.
     * Kepsek bisa lihat data semua kelas.
     */
    canAccessAllKelas: jabatan === 'kepsek',

    /**
     * hasFullAccess = true untuk kepsek & wali_kelas.
     * Bisa akses semua menu: pulang siswa, data siswa, izin,
     * ranking, rekap, statistik, naik kelas, dll.
     */
    hasFullAccess: jabatan === 'kepsek' || jabatan === 'wali_kelas',
  }
}
