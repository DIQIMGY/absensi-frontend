import api from './api'

const deleteWithFallback = async (url) => {
  try {
    return await api.delete(url)
  } catch (error) {
    if (error.response && error.response.status === 405) {
      const form = new FormData()
      form.append('_method', 'DELETE')
      return api.post(url, form)
    }
    throw error
  }
}

export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getDashboardStatistik: (period) => api.get('/admin/dashboard/statistik', { params: { period } }),
  
  // Notifications
  getNotifications: () => api.get('/admin/notifications', { silent: true }),
  
  // Users
  getUserStats: () => api.get('/admin/users-stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => deleteWithFallback(`/admin/users/${id}`),
  resetPassword: (id, data) => api.post(`/admin/users/${id}/reset-password`, data),
  toggleActive: (id) => api.post(`/admin/users/${id}/toggle-active`),
  uploadFotoUser: (id, formData) => api.post(`/admin/users/${id}/upload-foto`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  hapusFotoUser: (id) => api.delete(`/admin/users/${id}/hapus-foto`),
  getTrashedUsers: (params) => api.get('/admin/users-trashed', { params }),
  restoreUser: (id) => api.post(`/admin/users/${id}/restore`),
  forceDeleteUser: (id) => api.delete(`/admin/users/${id}/force-delete`),
  
  // Siswa - SUDAH SESUAI DENGAN BACKEND
  getSiswaStats: () => api.get('/admin/siswas-stats'),
  getSiswas: (params) => api.get('/admin/siswas', { params }),
  createSiswa: (data) => api.post('/admin/siswas', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateSiswa: (id, data) => api.post(`/admin/siswas/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteSiswa: (id) => deleteWithFallback(`/admin/siswas/${id}`),
  resetQrCode: (id) => api.post(`/admin/siswas/${id}/reset-qr`),
  downloadQrCode: (id) => api.get(`/admin/siswas/${id}/download-qr`, { 
    responseType: 'blob' 
  }),
  importSiswas: (data) => api.post('/admin/siswas/import', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // Guru
  getGuruStats: () => api.get('/admin/gurus-stats'),
  getGurus: (params) => api.get('/admin/gurus', { params }),
  createGuru: (data) => api.post('/admin/gurus', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateGuru: (id, data) => {
    if (data instanceof FormData && !data.has('_method')) {
      data.append('_method', 'PUT')
    }
    return api.post(`/admin/gurus/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteGuru: (id) => deleteWithFallback(`/admin/gurus/${id}`),
  resetGuruQrCode: (id) => api.post(`/admin/gurus/${id}/reset-qr`),
  downloadGuruQrCode: (id) => api.get(`/admin/gurus/${id}/download-qr`, { 
    responseType: 'blob' 
  }),
  getTrashedGurus: (params) => api.get('/admin/gurus-trashed', { params }),
  restoreGuru: (id) => api.post(`/admin/gurus/${id}/restore`),
  forceDeleteGuru: (id) => api.delete(`/admin/gurus/${id}/force-delete`),
  
  // Master Data
  getKelasStats: () => api.get('/admin/kelas-stats'),
  getKelas: (params) => api.get('/admin/kelas', { params }),
  getAllKelas: () => api.get('/admin/kelas-all'),
  createKelas: (data) => api.post('/admin/kelas', data),
  updateKelas: (id, data) => api.put(`/admin/kelas/${id}`, data),
  deleteKelas: (id) => deleteWithFallback(`/admin/kelas/${id}`),
  
  getJurusans: (params) => api.get('/admin/jurusans', { params }),
  getAllJurusans: () => api.get('/admin/jurusans-all'),
  createJurusan: (data) => api.post('/admin/jurusans', data),
  updateJurusan: (id, data) => api.put(`/admin/jurusans/${id}`, data),
  deleteJurusan: (id) => deleteWithFallback(`/admin/jurusans/${id}`),
  
  getTahunAjarans: (params) => api.get('/admin/tahun-ajarans', { params }),
  getAllTahunAjarans: () => api.get('/admin/tahun-ajarans-all'),
  createTahunAjaran: (data) => api.post('/admin/tahun-ajarans', data),
  updateTahunAjaran: (id, data) => api.put(`/admin/tahun-ajarans/${id}`, data),
  deleteTahunAjaran: (id) => deleteWithFallback(`/admin/tahun-ajarans/${id}`),
  setActiveTahunAjaran: (id) => api.post(`/admin/tahun-ajarans/${id}/set-active`),
  
  getMataPelajarans: (params) => api.get('/admin/mata-pelajarans', { params }),
  getAllMataPelajarans: () => api.get('/admin/mata-pelajarans-all'),
  createMataPelajaran: (data) => api.post('/admin/mata-pelajarans', data),
  updateMataPelajaran: (id, data) => api.put(`/admin/mata-pelajarans/${id}`, data),
  deleteMataPelajaran: (id) => deleteWithFallback(`/admin/mata-pelajarans/${id}`),
  
  // Absensi
  getAbsensis: (params) => api.get('/admin/absensis', { params }),
  deleteAbsensi: (id) => deleteWithFallback(`/admin/absensis/${id}`),
  getStatistik: () => api.get('/admin/absensis-statistik'),
  getStatistikByDate: (params) => api.get('/admin/absensis-statistik-by-date', { params }),
  getRekap: (params) => api.get('/admin/absensis-rekap', { params }),
  
  // Absensi Guru
  getAbsensiGuru: (params) => api.get('/admin/absensi-guru', { params }),
  getAbsensiGuruStatistik: (params) => api.get('/admin/absensi-guru/statistik', { params }),
  getAbsensiGuruRekapPerGuru: (params) => api.get('/admin/absensi-guru/rekap-per-guru', { params }),
  getAbsensiGuruDetail: (id) => api.get(`/admin/absensi-guru/${id}`),
  exportAbsensiGuru: (params) => api.get('/admin/absensi-guru/export', { 
    params,
    responseType: 'blob' 
  }),
  
  // Pengaturan
  getPengaturan: () => api.get('/admin/pengaturan'),
  updatePengaturan: (data) => api.post('/admin/pengaturan', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Laporan
  getLaporanHarian: (params) => api.get('/admin/laporan/harian', { params }),
  getLaporanBulanan: (params) => api.get('/admin/laporan/bulanan', { params }),
  getLaporanPerSiswa: (siswaId, params) => api.get(`/admin/laporan/siswa/${siswaId}`, { params }),
  exportPdf: (params) => api.get('/admin/laporan/export-pdf', { 
    params,
    responseType: 'blob' 
  }),
  exportExcel: (params) => api.get('/admin/laporan/export-excel', { 
    params,
    responseType: 'blob' 
  }),
  
  // Laporan Guru
  getLaporanGuruBulanan: (params) => api.get('/admin/laporan-guru/bulanan', { params }),
  exportGuruPdf: (params) => api.get('/admin/laporan-guru/export-pdf', { 
    params,
    responseType: 'blob' 
  }),
  exportGuruExcel: (params) => api.get('/admin/laporan-guru/export-excel', { 
    params,
    responseType: 'blob' 
  }),
  
  // Import Siswa
  importSiswa: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/siswas/import', formData)
  },
  
  // Ranking
  getRankingSiswa: (params) => api.get('/admin/ranking/siswa', { params }),
  getStatistikSiswa: (params) => api.get('/admin/ranking/statistik', { params }),
  
  // Activity Logs
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
  getActivityLogStats: () => api.get('/admin/activity-logs/stats'),
  deleteActivityLog: (id) => deleteWithFallback(`/admin/activity-logs/${id}`),
  clearActivityLogs: (days) => api.post('/admin/activity-logs/clear', { days }),
  
  // Izin
  getIzins: (params) => api.get('/admin/izins', { params }),
  getIzinStats: () => api.get('/admin/izins/stats'),
  approveIzin: (id, data) => api.post(`/admin/izins/${id}/approve`, data),
  rejectIzin: (id, data) => api.post(`/admin/izins/${id}/reject`, data),
  deleteIzin: (id) => deleteWithFallback(`/admin/izins/${id}`),
  
  // Alumni
  getAlumni: (params) => api.get('/admin/alumni', { params }),
  getAlumniTahunLulus: () => api.get('/admin/alumni/tahun-lulus'),
  exportAlumni: (params) => api.get('/admin/alumni/export', { 
    params,
    responseType: 'blob' 
  }),
}
