import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  User, 
  QrCode as QrCodeIcon, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  X,
  Sparkles,
  Scan,
  Smartphone,
  Wifi,
  Zap,
  Shield,
  Clock,
  MapPin,
  Info
} from 'lucide-react'
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode'
import { siswaApi } from '../../services/siswaService'
import { showWarning, showError, showSuccess } from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'
import { usePengaturanStore } from '../../stores/pengaturanStore'
import { playSuccessSound, playErrorSound, playWarningSound, playScanSound, playLateSound } from '../../utils/soundNotification'

export default function SiswaAbsen() {
  const [activeTab, setActiveTab] = useState('manual')
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [showQrPreview, setShowQrPreview] = useState(false)
  const scannerRef = useRef(null)
  const isMountedRef = useRef(true)
  const isCleaningUpRef = useRef(false)
  const { user } = useAuthStore()
  const { pengaturan, fetchPengaturan } = usePengaturanStore()

  // Fetch pengaturan dan QR Code siswa
  useEffect(() => {
    // FORCE clear cache jika jam pulang tidak masuk akal
    const cachedData = localStorage.getItem('pengaturan-storage')
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData)
        const jamPulang = parsed?.state?.pengaturan?.jam_pulang
        if (jamPulang && jamPulang < '06:00') {
          console.warn('⚠️ Jam pulang tidak valid, clearing cache:', jamPulang)
          localStorage.removeItem('pengaturan-storage')
        }
      } catch (e) {
        console.error('Error parsing cache:', e)
      }
    }
    
    // Fetch pengaturan terbaru from database saat component mount
    fetchPengaturan(true) // Force fetch fresh data
    fetchQrCode()
  }, [])

  // Cleanup scanner saat unmount
  useEffect(() => {
    isMountedRef.current = true
    isCleaningUpRef.current = false
    
    return () => {
      isMountedRef.current = false
      isCleaningUpRef.current = true
      cleanupScanner()
    }
  }, [])

  // Start/stop scanner berdasarkan tab
  useEffect(() => {
    if (activeTab === 'qr' && !isCleaningUpRef.current) {
      setTimeout(() => {
        if (isMountedRef.current) {
          startScanner()
        }
      }, 300)
    } else {
      cleanupScanner()
    }
  }, [activeTab])

  const fetchQrCode = async () => {
    try {
      const response = await siswaApi.downloadQrCode()
      const blob = new Blob([response.data], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error fetching QR code:', error)
    }
  }

  // Cek apakah hari ini adalah hari aktif
  const isHariAktif = () => {
    const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' })
    const hariAktif = pengaturan.hari_aktif || []
    return hariAktif.includes(hariIni)
  }

  // Cek apakah hari ini adalah hari libur
  const isLibur = () => {
    if (!pengaturan.status_libur) return false
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (!pengaturan.tanggal_libur_mulai || !pengaturan.tanggal_libur_selesai) {
      return false
    }
    
    const mulai = new Date(pengaturan.tanggal_libur_mulai)
    mulai.setHours(0, 0, 0, 0)
    
    const selesai = new Date(pengaturan.tanggal_libur_selesai)
    selesai.setHours(0, 0, 0, 0)
    
    return today >= mulai && today <= selesai
  }

  // Cek apakah sudah lewat jam pulang
  const isSudahPulang = () => {
    if (!pengaturan.jam_pulang) return false
    
    const now = new Date()
    const [hours, minutes] = pengaturan.jam_pulang.split(':')
    const jamPulang = new Date()
    jamPulang.setHours(parseInt(hours), parseInt(minutes), 0)
    
    return now > jamPulang
  }

  // Cek apakah belum jam buka absen
  const isBelumBuka = () => {
    if (!pengaturan.jam_buka_absen) return false
    
    const now = new Date()
    const [hours, minutes] = pengaturan.jam_buka_absen.split(':')
    const jamBuka = new Date()
    jamBuka.setHours(parseInt(hours), parseInt(minutes), 0)
    
    return now < jamBuka
  }

  // Cek apakah boleh absen hari ini
  const bolehAbsen = () => {
    return isHariAktif() && !isLibur() && !isSudahPulang() && !isBelumBuka()
  }

  // Get pesan kenapa tidak bisa absen
  const getPesanTidakBisa = () => {
    if (isBelumBuka()) {
      return {
        title: 'Absensi Belum Dibuka',
        message: `Absensi akan dibuka pada jam ${pengaturan.jam_buka_absen?.substring(0, 5)}. Silakan coba lagi nanti.`,
        icon: '⏰'
      }
    }
    if (isSudahPulang()) {
      return {
        title: 'Waktu Absensi Sudah Ditutup',
        message: `Absensi sudah ditutup pada jam ${pengaturan.jam_pulang?.substring(0, 5)}. Sampai jumpa besok!`,
        icon: '🏠'
      }
    }
    if (isLibur()) {
      return {
        title: 'Hari Libur',
        message: pengaturan.keterangan_libur || 'Sekolah sedang libur. Tidak dapat melakukan absensi.',
        icon: '🏖️'
      }
    }
    if (!isHariAktif()) {
      return {
        title: 'Bukan Hari Aktif',
        message: 'Hari ini bukan hari aktif sekolah. Tidak dapat melakukan absensi.',
        icon: '📅'
      }
    }
    return null
  }

  const cleanupScanner = async () => {
    if (isCleaningUpRef.current) return
    isCleaningUpRef.current = true
    
    try {
      if (scannerRef.current) {
        const scanner = scannerRef.current
        scannerRef.current = null
        
        if (scanner.isScanning) {
          await scanner.stop()
        }
        
        setTimeout(() => {
          try {
            scanner.clear()
          } catch (e) {
            // Ignore
          }
        }, 100)
      }
    } catch (err) {
      // Ignore cleanup errors
    } finally {
      if (isMountedRef.current) {
        setScanning(false)
      }
      setTimeout(() => {
        isCleaningUpRef.current = false
      }, 200)
    }
  }

  const startScanner = async () => {
    if (isCleaningUpRef.current || !isMountedRef.current || scanning) return
    
    // Validasi hari aktif dan libur
    if (!bolehAbsen()) {
      const pesan = getPesanTidakBisa()
      playWarningSound()
      await showWarning(pesan.title, pesan.message)
      return
    }
    
    try {
      setScanning(true)
      setScanResult(null)

      const qrCodeSuccessCallback = (decodedText) => {
        if (!isMountedRef.current || !scanning) return
        console.log('QR Code detected:', decodedText)
        
        playScanSound()
        
        setScanResult(decodedText)
        
        cleanupScanner().then(() => {
          handleAbsen('qr_code', decodedText)
        })
      }

      const config = {
        fps: 60,
        qrbox: { width: 250, height: 250 }, // Lebih kecil untuk mobile
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 1.5,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        videoConstraints: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      }

      const readerElement = document.getElementById('qr-reader')
      if (!readerElement) {
        throw new Error('QR reader element not found')
      }

      const html5QrCode = new Html5Qrcode('qr-reader')
      scannerRef.current = html5QrCode

      const cameraConfigs = [
        {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        {
          facingMode: { ideal: 'environment' }
        }
      ]

      let cameraStarted = false
      for (const cameraConfig of cameraConfigs) {
        try {
          await html5QrCode.start(
            cameraConfig,
            config,
            qrCodeSuccessCallback,
            (errorMessage) => {}
          )
          cameraStarted = true
          console.log('Camera started with config:', cameraConfig)
          break
        } catch (cameraError) {
          console.log('Camera config failed:', cameraConfig, cameraError)
          continue
        }
      }

      if (!cameraStarted) {
        throw new Error('Tidak dapat mengakses kamera dengan konfigurasi apapun')
      }

    } catch (err) {
      console.error('Scanner error:', err)
      if (isMountedRef.current) {
        const errorMsg = err.message || 'Gagal mengakses kamera'
        if (errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')) {
          toast.error('Izin kamera ditolak. Silakan izinkan akses kamera di browser.')
        } else if (errorMsg.includes('NotFoundError') || errorMsg.includes('not found')) {
          toast.error('Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.')
        } else if (errorMsg.includes('tidak dapat mengakses kamera')) {
          toast.error('Tidak dapat mengakses kamera. Coba gunakan browser Chrome atau Firefox.')
        } else {
          toast.error('Gagal mengakses kamera. Coba refresh halaman atau restart browser.')
        }
        setScanning(false)
        isCleaningUpRef.current = false
      }
    }
  }

  const handleAbsen = async (metode, qrCode = null) => {
    // Validasi hari aktif dan libur
    if (!bolehAbsen()) {
      const pesan = getPesanTidakBisa()
      playWarningSound()
      await showWarning(pesan.title, pesan.message)
      return
    }

    setLoading(true)
    try {
      const data = {
        metode,
        ...(qrCode && { qr_code: qrCode }),
      }

      console.log('Sending absen request:', { metode, hasQrCode: !!qrCode })

      const response = await siswaApi.absenMasuk(data)
      const result = response.data?.data || {}

      console.log('Absen response:', result)

      setScanResult(null)
      
      if (result.is_terlambat) {
        playLateSound()
        await showWarning(
          'Perhatian! Anda Terlambat',
          `Anda terlambat ${result.menit_terlambat} menit dari jam masuk`
        )
      } else {
        playSuccessSound()
        showSuccess('Absensi Berhasil', 'Selamat, Anda telah berhasil absen tepat waktu')
      }

      setTimeout(() => {
        setActiveTab('manual')
      }, 1000)
      
    } catch (error) {
      console.error('Absen error:', error)
      console.error('Error response:', error.response?.data)
      
      const message = error.response?.data?.message || 'Gagal melakukan absensi'
      const errors = error.response?.data?.errors || {}
      
      if (errors.qr_code) {
        console.error('QR Code validation error:', errors.qr_code)
      }
      
      setScanResult(null)
      
      // Handle pesan jam buka/tutup absen
      if (message.includes('belum dibuka')) {
        playWarningSound()
        await showWarning('Absensi Belum Dibuka', message)
        return
      }

      if (message.includes('sudah ditutup')) {
        playWarningSound()
        await showWarning('Absensi Sudah Ditutup', message)
        return
      }

      if (message.includes('sudah melakukan absensi')) {
        playWarningSound()
        await showWarning('Sudah Absen Hari Ini', message)
      } else {
        playErrorSound()
        showError('Absensi Gagal', message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    await handleAbsen('manual')
  }

  const restartScanner = () => {
    setScanResult(null)
    isCleaningUpRef.current = false
    startScanner()
  }

  const handleDownloadQr = async () => {
    try {
      const response = await siswaApi.downloadQrCode()
      const blob = new Blob([response.data], { type: 'image/svg+xml' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `QR-${user?.name || 'siswa'}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('QR Code berhasil diunduh')
    } catch (error) {
      toast.error('Gagal mengunduh QR Code')
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 sm:gap-3 min-w-0"
      >
        <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl flex-shrink-0">
          <Camera size={18} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
            Absensi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Lakukan absensi dengan mudah dan cepat
          </p>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-t-lg sm:rounded-t-xl border border-slate-200 dark:border-slate-700 border-b-0 overflow-hidden">
          <div className="flex p-1 sm:p-1.5 bg-slate-50 dark:bg-slate-700/50 m-3 sm:m-4 rounded-lg sm:rounded-xl">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium text-[10px] sm:text-xs md:text-sm transition-all ${
                activeTab === 'manual'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              <User size={14} />
              <span className="truncate">Absen Manual</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium text-[10px] sm:text-xs md:text-sm transition-all ${
                activeTab === 'qr'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              <Scan size={14} />
              <span className="truncate">Scan QR Code</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-b-lg sm:rounded-b-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Warning Banner - All Conditions */}
          {!bolehAbsen() && (() => {
            const pesan = getPesanTidakBisa()
            const bgColor = isBelumBuka() || isSudahPulang() 
              ? 'from-blue-500 to-blue-600' 
              : 'from-amber-500 to-orange-500'
            
            return (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mx-4 sm:mx-5 md:mx-6 mt-4 sm:mt-5 md:mt-6 mb-4 sm:mb-5 md:mb-6 bg-gradient-to-r ${bgColor} rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-xl`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold mb-2">
                      {pesan.icon} {pesan.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                      {pesan.message}
                    </p>
                    {isLibur() && pengaturan.tanggal_libur_mulai && pengaturan.tanggal_libur_selesai && (
                      <p className="text-xs text-white/80 mt-2">
                        Periode: {new Date(pengaturan.tanggal_libur_mulai).toLocaleDateString('id-ID')} - {new Date(pengaturan.tanggal_libur_selesai).toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })()}

          <AnimatePresence mode="wait">
            {/* Tab Manual */}
            {activeTab === 'manual' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 sm:p-5 md:p-6"
              >
                <form onSubmit={handleManualSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                      <User className="text-purple-600 dark:text-purple-400" size={32} />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 truncate">
                      Absensi Manual
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Klik tombol di bawah untuk melakukan absensi
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !bolehAbsen()}
                    className={`w-full py-3 sm:py-3.5 md:py-4 font-semibold rounded-lg sm:rounded-xl shadow-lg transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                      !bolehAbsen()
                        ? 'bg-slate-400 dark:bg-slate-600 text-slate-200 dark:text-slate-400 cursor-not-allowed shadow-slate-400/30'
                        : loading
                        ? 'bg-purple-600 text-white opacity-50 cursor-not-allowed shadow-purple-500/30'
                        : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-purple-500/30'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="truncate">Memproses...</span>
                      </>
                    ) : !bolehAbsen() ? (
                      <>
                        <AlertCircle size={16} />
                        <span className="truncate">
                          {isLibur() ? 'Hari Libur' : 'Tidak Aktif'}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span className="truncate">Absen Sekarang</span>
                      </>
                    )}
                  </button>

                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                      <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-medium mb-1">Perhatian!</p>
                        <p>Pastikan Anda berada di area sekolah saat melakukan absensi.</p>
                        {!bolehAbsen() && (
                          <p className="mt-2 font-medium text-amber-900 dark:text-amber-100">
                            {isLibur() ? '🏖️ Sekolah sedang libur' : '📅 Bukan hari aktif sekolah'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MapPin size={16} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-200 truncate">
                          Lokasi Anda
                        </p>
                        <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 truncate">
                          Sistem akan mendeteksi lokasi Anda secara otomatis
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Tab QR Code */}
            {activeTab === 'qr' && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 sm:p-5 md:p-6"
              >
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                      <Scan className="text-purple-600 dark:text-purple-400" size={32} />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 truncate">
                      Scan QR Code
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Tunjukkan QR Code Anda ke kamera
                    </p>
                  </div>

                  {/* QR Code Preview */}
                  {qrCodeUrl && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border-2 border-purple-200 dark:border-purple-800">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            QR Code Pribadi Anda
                          </h4>
                          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">
                            Download dan simpan QR Code ini
                          </p>
                        </div>
                        <button
                          onClick={() => setShowQrPreview(!showQrPreview)}
                          className="p-1.5 sm:p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                        >
                          {showQrPreview ? <X size={16} /> : <QrCodeIcon size={16} />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {showQrPreview && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col items-center gap-3 sm:gap-4 py-3 sm:py-4">
                              <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg">
                                <img 
                                  src={qrCodeUrl} 
                                  alt="QR Code" 
                                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                                />
                              </div>
                              <button
                                onClick={handleDownloadQr}
                                className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shadow-lg shadow-purple-500/30 transition-all"
                              >
                                <Download size={14} />
                                <span className="truncate">Download QR Code</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Scanner Section */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-dashed border-purple-200 dark:border-purple-800">
                    {/* QR Scanner Container */}
                    <div className="relative mb-3 sm:mb-4">
                      <div 
                        id="qr-reader" 
                        className="rounded-lg sm:rounded-xl overflow-hidden border-2 border-purple-200 dark:border-purple-800 bg-black"
                        style={{ 
                          minHeight: scanning ? '300px' : '0px',
                          height: scanning ? 'auto' : '0px',
                          maxWidth: '100%'
                        }}
                      ></div>
                      
                      {scanning && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          {/* Scan Area */}
                          <div className="relative">
                            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 border-4 border-purple-400 rounded-2xl sm:rounded-3xl opacity-80 animate-pulse shadow-xl shadow-purple-400/50"></div>
                            
                            {/* Corner Indicators */}
                            <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-t-4 border-l-4 border-purple-400 rounded-tl-xl sm:rounded-tl-2xl"></div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-t-4 border-r-4 border-purple-400 rounded-tr-xl sm:rounded-tr-2xl"></div>
                            <div className="absolute -bottom-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-b-4 border-l-4 border-purple-400 rounded-bl-xl sm:rounded-bl-2xl"></div>
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-b-4 border-r-4 border-purple-400 rounded-br-xl sm:rounded-br-2xl"></div>
                            
                            {/* Center Text */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/70 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium">
                                📱 Arahkan QR Code ke sini
                              </div>
                            </div>
                            
                            {/* Scanning Line */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-40 h-0.5 sm:w-48 sm:h-0.5 md:w-56 md:h-1 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-400 animate-pulse"></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Status Indicator */}
                      {scanning && (
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-purple-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 sm:gap-2 shadow-lg">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                          <span className="truncate">Mencari QR Code...</span>
                        </div>
                      )}
                    </div>

                    {scanResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 mb-3 sm:mb-4"
                      >
                        <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-1 sm:mb-2" />
                        <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium truncate">
                          QR Code terdeteksi! Memproses absensi...
                        </p>
                      </motion.div>
                    )}

                    {/* Scanner Controls */}
                    {scanning && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => {
                            cleanupScanner()
                            setScanResult(null)
                          }}
                          className="flex-1 py-2.5 sm:py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-colors"
                        >
                          <X size={14} />
                          <span className="truncate">Tutup Kamera</span>
                        </button>
                        <button
                          onClick={restartScanner}
                          className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-colors shadow-lg shadow-purple-500/30"
                        >
                          <RefreshCw size={14} />
                          <span className="truncate">Restart</span>
                        </button>
                      </div>
                    )}

                    {!scanning && !scanResult && (
                      <div className="space-y-3 sm:space-y-4">
                        <button
                          onClick={restartScanner}
                          disabled={loading || !bolehAbsen()}
                          className={`w-full py-3 sm:py-3.5 md:py-4 font-semibold rounded-lg sm:rounded-xl shadow-lg transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                            !bolehAbsen()
                              ? 'bg-slate-400 dark:bg-slate-600 text-slate-200 dark:text-slate-400 cursor-not-allowed shadow-slate-400/30'
                              : loading
                              ? 'bg-purple-600 text-white opacity-50 cursor-not-allowed shadow-purple-500/30'
                              : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-purple-500/30'
                          }`}
                        >
                          {!bolehAbsen() ? (
                            <>
                              <AlertCircle size={16} />
                              <span className="truncate">
                                {isLibur() ? 'Hari Libur' : 'Tidak Aktif'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Camera size={16} />
                              <span className="truncate">Buka Kamera</span>
                            </>
                          )}
                        </button>
                        
                        {/* Quick Tips */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
                          <p className="text-purple-800 dark:text-purple-200 text-xs sm:text-sm font-medium text-center truncate">
                            ⚡ Deteksi cepat dalam 0.5 detik!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="text-purple-600 dark:text-purple-400" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white mb-2 sm:mb-3 truncate">
                          Tips Scanning Sukses
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <p className="text-[10px] sm:text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1 truncate">
                              <Smartphone size={12} />
                              <span className="truncate">Persiapan</span>
                            </p>
                            <ul className="space-y-1 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                              <li className="flex items-start gap-1 sm:gap-2">
                                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500 mt-1 flex-shrink-0"></span>
                                <span className="truncate">Download QR Code dan simpan di HP</span>
                              </li>
                              <li className="flex items-start gap-1 sm:gap-2">
                                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500 mt-1 flex-shrink-0"></span>
                                <span className="truncate">Pastikan QR Code kontras dan jelas</span>
                              </li>
                            </ul>
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <p className="text-[10px] sm:text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1 truncate">
                              <Wifi size={12} />
                              <span className="truncate">Teknik Scanning</span>
                            </p>
                            <ul className="space-y-1 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                              <li className="flex items-start gap-1 sm:gap-2">
                                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500 mt-1 flex-shrink-0"></span>
                                <span className="truncate">Jarak ideal: 10-20 cm dari kamera</span>
                              </li>
                              <li className="flex items-start gap-1 sm:gap-2">
                                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500 mt-1 flex-shrink-0"></span>
                                <span className="truncate">Pastikan pencahayaan cukup terang</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Info size={14} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <div className="text-[10px] sm:text-xs text-purple-800 dark:text-purple-200">
                        <p className="font-medium mb-1">Informasi:</p>
                        <p>Pastikan Anda memiliki QR Code pribadi. Jika belum, download di atas.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}