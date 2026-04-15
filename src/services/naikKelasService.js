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
  proses: async () => {
    const response = await api.post('/admin/naik-kelas/proses', {
      confirm: true
    });
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
