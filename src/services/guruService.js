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
  downloadQrCode: () => api.get('/guru/profil/download-qr', { responseType: 'blob' }),
  getQrCode: () => api.get('/guru/profil/qr'),
  
  // Ranking & Statistik
  getRankingSiswa: (params) => api.get('/guru/ranking/siswa', { params }),
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
  
  // Riwayat Absensi Guru
  getRiwayatAbsensi: (params) => api.get('/guru/riwayat-absensi', { params }),
}
