import api from './api'

export const guruApi = {
  getDashboard: () => api.get('/guru/dashboard', { silent: true }),
  getAbsensis: (params) => api.get('/guru/absensis', { params }),
  updateStatus: (id, data) => api.put(`/guru/absensis/${id}/status`, data),
  syncIzinToAbsensi: (data) => api.post('/guru/absensis/sync-izin', data),
  getKelasDiampu: () => api.get('/guru/kelas-diampu', { silent: true }),
  getRekapKelas: (params) => api.get('/guru/rekap-kelas', { params }),
  
  // Notifikasi — silent karena polling tiap 30 detik
  getNotifications: () => api.get('/guru/notifications', { silent: true }),
  
  // Profil
  getProfile: () => api.get('/guru/profil'),
  updateProfile: (data) => api.post('/guru/profil', data),
  updateFotoUser: (data) => api.post('/guru/profil/foto-user', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadQrCode: () => api.get('/guru/profil/download-qr', { responseType: 'blob' }),
  downloadFoto: () => api.get('/guru/profil/download-foto', { responseType: 'blob' }),
  updateFotoCover: (data) => api.post('/guru/profil/foto-cover', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  hapusFotoCover: () => api.delete('/guru/profil/foto-cover'),
  getQrCode: () => api.get('/guru/profil/qr'),
  
  // Ranking & Statistik
  getRankingSiswa: (params) => api.get('/guru/ranking/siswa', { params }),
  getRankingGuru: (params) => api.get('/guru/ranking/guru', { params }),
  getRankingGuruStatistik: (params) => api.get('/guru/ranking/guru-statistik', { params, silent: true }),
  getRekapHarian: (params) => api.get('/guru/rekap-harian', { params }),
  getStatistikKelas: (params) => api.get('/guru/statistik-kelas', { params }),
  
  // Izin
  getIzins: (params) => api.get('/guru/izins', { params }),
  getIzinStats: () => api.get('/guru/izins/stats', { silent: true }),
  getPendingIzinsToday: () => api.get('/guru/izins/pending-today', { silent: true }),
  approveIzin: (id, data) => api.post(`/guru/izins/${id}/approve`, data),
  rejectIzin: (id, data) => api.post(`/guru/izins/${id}/reject`, data),
  
  // Data Siswa
  getSiswas: (params) => api.get('/guru/siswas', { params }),
  getSiswaStats: () => api.get('/guru/siswas/stats', { silent: true }),
  getSiswaQr: (id) => api.get(`/guru/siswas/${id}/qr`),
  resetSiswaQr: (id) => api.post(`/guru/siswas/${id}/reset-qr`),
  downloadSiswaQr: (id) => api.get(`/guru/siswas/${id}/download-qr`, { responseType: 'blob' }),
  checkSiswaFingerprint: (id) => api.get('/guru/siswas/fingerprint/check', { params: { id } }),
  registerSiswaFingerprint: (id) => api.post('/guru/siswas/fingerprint/register', { id }),
  unregisterSiswaFingerprint: (id) => api.delete('/guru/siswas/fingerprint/unregister', { data: { id } }),
  
  // Riwayat Absensi Guru
  getRiwayatAbsensi: (params) => api.get('/guru/riwayat-absensi', { params }),

  // Pulang Siswa (per kelas yang diampu)
  getPulangSiswa: (params) => api.get('/guru/pulang-siswa', { params }),
  getPulangSiswaStatistik: (params) => api.get('/guru/pulang-siswa/statistik', { params }),

  // Naik Kelas - Rekomendasi
  getNaikKelasKelasSiswa: () => api.get('/guru/naik-kelas/kelas-siswa'),
  getRekomendasiSaya: () => api.get('/guru/naik-kelas/rekomendasi-saya'),
  simpanRekomendasi: (data) => api.post('/guru/naik-kelas/rekomendasi', data),
  hapusRekomendasi: (siswaId) => api.delete(`/guru/naik-kelas/rekomendasi/${siswaId}`),

  // Pesan Dispen dari Siswa
  getPesanDispen: (params) => api.get('/guru/pesan-dispen', { params }),
  getPesanDispenUnread: () => api.get('/guru/pesan-dispen/unread', { silent: true }),
  markPesanDispenRead: () => api.post('/guru/pesan-dispen/mark-read'),
  approvePesanDispen: (id, data) => api.post(`/guru/pesan-dispen/${id}/approve`, data),
  rejectPesanDispen: (id, data) => api.post(`/guru/pesan-dispen/${id}/reject`, data),

  // ─── KEPSEK: Pantau absensi semua guru ──────────────────────────────
  kepsekGetAbsensiMasukGuru: (params) => api.get('/guru/kepsek/absensi-guru', { params }),
  kepsekGetAbsensiMasukStatistik: (params) => api.get('/guru/kepsek/absensi-guru/statistik', { params, silent: true }),
  kepsekGetAbsensiMasukRekap: (params) => api.get('/guru/kepsek/absensi-guru/rekap', { params, silent: true }),
  kepsekGetAbsensiPulangGuru: (params) => api.get('/guru/kepsek/absensi-guru-pulang', { params }),
  kepsekGetAbsensiPulangStatistik: (params) => api.get('/guru/kepsek/absensi-guru-pulang/statistik', { params, silent: true }),
}
