import api from './api'

export const publicApi = {
  // Absen manual (NISN + Nama)
  absenManual: (data) => api.post('/public/absen/manual', data),
  
  // Absen QR Code
  absenQr: (data) => api.post('/public/absen/qr', data),
  
  // Absen Guru Manual (NIP)
  absenGuruManual: (data) => api.post('/public/absen-guru/manual', data),
  
  // Absen Guru QR Code
  absenGuruQr: (data) => api.post('/public/absen-guru/qr', data),
  
  // Cek data siswa (untuk validasi)
  cekSiswa: (nisn) => api.post('/public/cek-siswa', { nisn }),
  
  // Check siswa by NIS (untuk form izin)
  checkSiswa: (data) => api.post('/public/check-siswa', data),
  
  // Debug absensi status
  debugAbsensi: (data) => api.post('/public/debug-absensi', data),
  
  // Ambil pengaturan (jam masuk, dll)
  getPengaturan: () => api.get('/public/pengaturan'),
  
  // Download logo sekolah (dengan CORS header)
  downloadLogo: () => api.get('/public/pengaturan/logo', { responseType: 'blob' }),
  
  // Submit izin
  submitIzin: (data) => api.post('/public/izin', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Daftar kelas (untuk registrasi tanpa login)
  getKelas: () => api.get('/public/kelas'),
  
  // Daftar mata pelajaran (untuk registrasi guru)
  getMataPelajaran: () => api.get('/public/mata-pelajaran')
}