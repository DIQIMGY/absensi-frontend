import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { publicApi } from '../services/publicApi'

export const usePengaturanStore = create(
  persist(
    (set, get) => ({
      pengaturan: {
        nama_sekolah: 'SMK Negeri 1 Contoh',
        alamat_sekolah: 'Jl. Pendidikan No. 1, Jakarta',
        logo_sekolah: null,
        kepala_sekolah: '',
        nip_kepala_sekolah: '',
        jam_buka_absen: '06:00',
        jam_masuk: '07:15',
        jam_pulang: '15:00',
        batas_keterlambatan: 15,
        hari_aktif: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
        status_libur: false,
        keterangan_libur: '',
        tanggal_libur_mulai: '',
        tanggal_libur_selesai: '',
        foto_libur: null,
        foto_libur_2: null,
        foto_libur_3: null,
        foto_libur_4: null,
        foto_libur_bg: null,
        events: [],
      },
      isLoading: false,
      error: null,
      lastFetched: null, // Track when data was last fetched

      // Fetch pengaturan dari API
      fetchPengaturan: async (force = false) => {
        const state = get()
        
        // ALWAYS fetch if forced (untuk memastikan data terbaru)
        if (force) {
          console.log('🔄 FORCE Fetching pengaturan from API')
        } else {
          // Skip fetch if data was fetched less than 5 seconds ago
          if (state.lastFetched) {
            const timeSinceLastFetch = Date.now() - state.lastFetched
            if (timeSinceLastFetch < 5000) {
              console.log('⏭️ Skipping fetch, data is fresh')
              return
            }
          }
        }
        
        console.log('🔄 Fetching pengaturan from API (force:', force, ')')
        set({ isLoading: true, error: null })
        try {
          const response = await publicApi.getPengaturan()
          const data = response.data.data
          
          console.log('📥 API Response received:', {
            jam_buka_absen: data.jam_buka_absen,
            jam_masuk: data.jam_masuk,
            jam_pulang: data.jam_pulang,
            nama_sekolah: data.nama_sekolah,
            status_libur: data.status_libur
          })
          
          // Parse hari_aktif if it's a string
          let hariAktif = data.hari_aktif || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
          if (typeof hariAktif === 'string') {
            try {
              hariAktif = JSON.parse(hariAktif)
            } catch (e) {
              hariAktif = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
            }
          }
          if (!Array.isArray(hariAktif)) {
            hariAktif = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
          }
          
          const updatedPengaturan = {
            nama_sekolah: data.nama_sekolah || 'SMK Negeri 1 Contoh',
            alamat_sekolah: data.alamat_sekolah || '',
            logo_sekolah: data.logo_sekolah || null,
            kepala_sekolah: data.kepala_sekolah || '',
            nip_kepala_sekolah: data.nip_kepala_sekolah || '',
            jam_buka_absen: data.jam_buka_absen?.substring(0, 5) || '06:00',
            jam_masuk: data.jam_masuk?.substring(0, 5) || '07:15',
            jam_pulang: data.jam_pulang?.substring(0, 5) || '15:00',
            batas_keterlambatan: data.batas_keterlambatan || 15,
            hari_aktif: hariAktif,
            status_libur: data.status_libur || false,
            keterangan_libur: data.keterangan_libur || '',
            tanggal_libur_mulai: data.tanggal_libur_mulai || '',
            tanggal_libur_selesai: data.tanggal_libur_selesai || '',
            foto_libur:   data.foto_libur   || null,
            foto_libur_2: data.foto_libur_2 || null,
            foto_libur_3: data.foto_libur_3 || null,
            foto_libur_4: data.foto_libur_4 || null,
            foto_libur_bg: data.foto_libur_bg || null,
            events: Array.isArray(data.events) ? data.events : [],
            event_fotos: Array.isArray(data.event_fotos) ? data.event_fotos : [],
            video_dashboard: data.video_dashboard || null,
            budaya_info:  data.budaya_info  || null,
            budaya_fotos: Array.isArray(data.budaya_fotos) ? data.budaya_fotos : [],
            budaya_video: data.budaya_video || null,
            budaya_video_2: data.budaya_video_2 || null,
            budaya_bg: data.budaya_bg || null,
            alam_info:  data.alam_info  || null,
            alam_fotos: Array.isArray(data.alam_fotos) ? data.alam_fotos : [],
            alam_bg:    data.alam_bg    || null,
            alam_fotos_2: Array.isArray(data.alam_fotos_2) ? data.alam_fotos_2 : [],
            prestasi_judul: data.prestasi_judul || null,
            prestasi_deskripsi: data.prestasi_deskripsi || null,
            prestasi_siswa: Array.isArray(data.prestasi_siswa) ? data.prestasi_siswa : [],
          }
          
          console.log('✅ Setting pengaturan to store:')
          console.log('   - nama_sekolah:', updatedPengaturan.nama_sekolah)
          console.log('   - jam_buka_absen:', updatedPengaturan.jam_buka_absen)
          console.log('   - jam_masuk:', updatedPengaturan.jam_masuk)
          console.log('   - jam_pulang:', updatedPengaturan.jam_pulang)
          console.log('   - logo_sekolah:', updatedPengaturan.logo_sekolah)
          console.log('   - status_libur:', updatedPengaturan.status_libur)
          
          set({
            pengaturan: updatedPengaturan,
            isLoading: false,
            lastFetched: Date.now(),
          })
          
          return updatedPengaturan
        } catch (error) {
          console.error('❌ Error fetching pengaturan:', error)
          set({ 
            error: error.message,
            isLoading: false 
          })
          throw error
        }
      },

      // Update pengaturan (setelah save di admin)
      updatePengaturan: (newPengaturan) => {
        console.log('📝 Updating pengaturan in store:', newPengaturan)
        const current = get().pengaturan
        const updated = { 
          ...current, 
          ...newPengaturan 
        }
        console.log('✅ Updated pengaturan:', updated)
        console.log('🔄 Changes detected:', {
          nama_sekolah: current.nama_sekolah !== updated.nama_sekolah,
          logo_sekolah: current.logo_sekolah !== updated.logo_sekolah
        })
        set({ 
          pengaturan: updated,
          lastFetched: Date.now() // Update timestamp
        })
      },

      // Clear pengaturan
      clearPengaturan: () => {
        set({
          pengaturan: {
            nama_sekolah: 'SMK Negeri 1 Contoh',
            alamat_sekolah: '',
            logo_sekolah: null,
            kepala_sekolah: '',
            nip_kepala_sekolah: '',
            jam_buka_absen: '06:00',
            jam_masuk: '07:15',
            jam_pulang: '15:00',
            batas_keterlambatan: 15,
            hari_aktif: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
            status_libur: false,
            keterangan_libur: '',
            tanggal_libur_mulai: '',
            tanggal_libur_selesai: '',
            foto_libur: null,
            foto_libur_2: null,
            foto_libur_3: null,
            foto_libur_4: null,
            foto_libur_bg: null,
            events: [],
          },
          lastFetched: null,
        })
      },
    }),
    {
      name: 'pengaturan-storage',
      version: 5,
      migrate: () => ({
        pengaturan: {
          nama_sekolah: 'SMK Negeri 1 Contoh',
          alamat_sekolah: '',
          logo_sekolah: null,
          kepala_sekolah: '',
          nip_kepala_sekolah: '',
          jam_buka_absen: '06:00',
          jam_masuk: '07:15',
          jam_pulang: '15:00',
          batas_keterlambatan: 15,
          hari_aktif: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
          status_libur: false,
          keterangan_libur: '',
          tanggal_libur_mulai: '',
          tanggal_libur_selesai: '',
          foto_libur: null, foto_libur_2: null, foto_libur_3: null, foto_libur_4: null, foto_libur_bg: null,
          events: [], event_fotos: [],
          video_dashboard: null,
          budaya_info: null, budaya_fotos: [], budaya_video: null, budaya_video_2: null, budaya_bg: null,
          alam_info: null, alam_fotos: [], alam_bg: null, alam_fotos_2: [],
          prestasi_judul: null, prestasi_deskripsi: null, prestasi_siswa: [],
        },
        lastFetched: null,
      }),
      partialize: (state) => ({
        pengaturan: state.pengaturan,
        lastFetched: state.lastFetched,
      }),
    }
  )
)
