import api from './api'

export const siswaApi = {
  getDashboard: () => api.get('/siswa/dashboard'),
  getRanking: () => api.get('/siswa/ranking'),
  absenMasuk: (data) => api.post('/siswa/absen', data),
  getRiwayat: (params) => api.get('/siswa/riwayat', { params }),
  getStatistik: () => api.get('/siswa/statistik'),
  downloadQrCode: () => api.get('/siswa/download-qr', { responseType: 'blob' }),
  downloadFoto: () => api.get('/siswa/profil/download-foto', { responseType: 'blob' }),
  
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
  updateFotoCover: (data) => api.post('/siswa/profil/foto-cover', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  hapusFotoCover: () => api.delete('/siswa/profil/foto-cover'),

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

  // Ranking Sekolah
  getRankingSekolah: (params) => api.get('/siswa/ranking-sekolah', { params }),

  // Pesan Dispen
  getPesanDispenGurus: () => api.get('/siswa/pesan-dispen/gurus'),
  getPesanDispen: () => api.get('/siswa/pesan-dispen'),
  kirimPesanDispen: (data) => api.post('/siswa/pesan-dispen', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Musik Favorit
  updateMusik: (data) => api.post('/siswa/profil/musik', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  hapusMusik: () => api.delete('/siswa/profil/musik'),
}