import api from './api';

const naikKelasService = {
  // Preview naik kelas
  preview: async () => {
    const response = await api.get('/admin/naik-kelas/preview');
    return response.data;
  },

  // List siswa per kelas untuk naik kelas selektif
  getSiswaPerKelas: async (tingkat = null) => {
    const response = await api.get('/admin/naik-kelas/siswa-per-kelas', {
      params: tingkat ? { tingkat } : {}
    });
    return response.data;
  },

  // Proses naik kelas selektif (siswa yang dipilih)
  prosesSelektif: async (siswaIds) => {
    const response = await api.post('/admin/naik-kelas/proses-selektif', {
      siswa_ids: siswaIds
    });
    return response.data;
  },

  // Proses naik kelas manual
  proses: async (force = false) => {
    const response = await api.post('/admin/naik-kelas/proses', {
      confirm: true,
      force,
    });
    return response.data;
  },

  // Pindah semua siswa dari kelas asal ke kelas tujuan
  pindahKelas: async (kelasAsalId, kelasTujuanId) => {
    const response = await api.post('/admin/naik-kelas/pindah-kelas', {
      kelas_asal_id: kelasAsalId,
      kelas_tujuan_id: kelasTujuanId,
    });
    return response.data;
  },

  // Pindah siswa tertentu (selektif) ke kelas tujuan
  pindahSiswa: async (siswaIds, kelasTujuanId) => {
    const response = await api.post('/admin/naik-kelas/pindah-siswa', {
      siswa_ids: siswaIds,
      kelas_tujuan_id: kelasTujuanId,
    });
    return response.data;
  },

  // Ambil semua kelas aktif (untuk dropdown tujuan)
  getKelasList: async () => {
    const response = await api.get('/admin/kelas', { params: { per_page: 999, is_active: 1 } });
    return response.data;
  },

  // History naik kelas
  getHistory: async (params = {}) => {
    const response = await api.get('/admin/naik-kelas/history', { params });
    return response.data;
  },

  // Detail history
  getDetail: async (id) => {
    const response = await api.get(`/admin/naik-kelas/${id}`);
    return response.data;
  },

  // Statistik naik kelas
  getStatistik: async (tahunAjaran = null) => {
    const response = await api.get('/admin/naik-kelas/statistik', {
      params: { tahun_ajaran: tahunAjaran }
    });
    return response.data;
  },
};

export default naikKelasService;
