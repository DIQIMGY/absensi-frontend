import api from './api'

export const siswaApi = {
  getDashboard: () => api.get('/siswa/dashboard'),
  getRanking: () => api.get('/siswa/ranking'),
  absenMasuk: (data) => api.post('/siswa/absen', data),
  getRiwayat: (params) => api.get('/siswa/riwayat', { params }),
  getStatistik: () => api.get('/siswa/statistik'),
  downloadQrCode: () => api.get('/siswa/download-qr', { responseType: 'blob' }),
  
  // Notifikasi
  getNotifications: () => api.get('/siswa/notifications'),
  
  // Izin
  getIzins: (params) => api.get('/siswa/izins', { params }),
  getIzinToday: () => api.get('/siswa/izins/today'),
  
  // Profil
  getProfil: () => api.get('/siswa/profil'),
  updateProfil: (data) => api.put('/siswa/profil', data),
  updateFoto: (data) => api.post('/siswa/profil/foto', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Kampus Impian
  getKampusImpian: () => api.get('/siswa/kampus-impian'),
  getTopKampus: () => api.get('/siswa/kampus-impian/top'),
  saveKampusImpian: (data) => api.post('/siswa/kampus-impian', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateKampusImpian: (data) => api.put('/siswa/kampus-impian', data),
  deleteKampusImpian: () => api.delete('/siswa/kampus-impian'),
  hapusFotoKampus: () => api.delete('/siswa/kampus-impian/foto'),
  uploadVideoKampus: (data) => api.post('/siswa/kampus-impian/video', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  hapusVideoKampus: () => api.delete('/siswa/kampus-impian/video'),

  // Gacha Harian
  getGachaStatus: () => api.get('/siswa/gacha/status'),
  rollGacha: () => api.post('/siswa/gacha/roll'),
  equipBadge: (badge_id) => api.post('/siswa/gacha/equip', { badge_id }),
  unequipBadge: () => api.post('/siswa/gacha/unequip'),
}