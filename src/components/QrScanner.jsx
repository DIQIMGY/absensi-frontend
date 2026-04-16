import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { 
  Camera, X, RefreshCw, Smartphone, CameraOff, 
  ScanLine, Maximize2, Minimize2, Info, Loader,
  CheckCircle, AlertCircle, QrCode, RotateCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function QrScanner({ onScan, onError, onClose }) {
  const [isScanning, setIsScanning] = useState(false)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [cameraPermission, setCameraPermission] = useState(null)
  const [scanStatus, setScanStatus] = useState('idle') // idle, scanning, success, error
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const scannerRef = useRef(null)
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const isMountedRef = useRef(true)
  const isCleaningUpRef = useRef(false)
  const readerIdRef = useRef(`qr-reader-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    isMountedRef.current = true
    isCleaningUpRef.current = false
    checkCameraPermission()
    getCameras()
    
    return () => {
      isMountedRef.current = false
      isCleaningUpRef.current = true
      cleanupScanner()
    }
  }, [])

  useEffect(() => {
    if (!isMountedRef.current) return
    if (!selectedCamera) return
    if (isScanning) return
    startScanner()
  }, [selectedCamera])

  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' })
      setCameraPermission(permission.state)
      
      permission.onchange = () => {
        setCameraPermission(permission.state)
      }
    } catch (err) {
      console.log('Permission API not supported')
    }
  }

  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras()
      if (devices && devices.length && isMountedRef.current) {
        setCameras(devices)
        // Pilih kamera belakang secara default
        const backCamera = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('belakang')
        ) || devices[0]
        setSelectedCamera(backCamera.id)
      }
    } catch (err) {
      console.error('Error getting cameras:', err)
      if (isMountedRef.current) {
        setScanStatus('error')
        onError?.('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.')
      }
    }
  }

  const startScanner = async () => {
    if (!selectedCamera || !isMountedRef.current) return
    
    try {
      setScanStatus('scanning')
      setIsScanning(true)
      
      const readerElement = document.getElementById(readerIdRef.current)
      if (!readerElement) {
        throw new Error('QR reader element not found')
      }
      
      scannerRef.current = new Html5Qrcode(readerIdRef.current)
      
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 1,
        },
        (decodedText) => {
          // Success callback
          if (isMountedRef.current) {
            setScanStatus('success')
            
            // Play success sound
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)()
              const o = ctx.createOscillator()
              const g = ctx.createGain()
              o.type = 'sine'
              o.frequency.setValueAtTime(880, ctx.currentTime)
              g.gain.setValueAtTime(0.0001, ctx.currentTime)
              o.connect(g)
              g.connect(ctx.destination)
              o.start()
              g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01)
              g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15)
              o.stop(ctx.currentTime + 0.16)
            } catch (e) {
              // ignore audio errors
            }
            
            onScan?.(decodedText)
            stopScanner()
          }
        },
        (errorMessage) => {
          // Error callback (bisa diabaikan untuk scan errors)
        }
      )
    } catch (err) {
      console.error('Error starting scanner:', err)
      if (isMountedRef.current) {
        setScanStatus('error')
        setIsScanning(false)
        onError?.('Gagal memulai kamera: ' + err.message)
      }
    }
  }

  const cleanupScanner = async () => {
    if (isCleaningUpRef.current) return
    isCleaningUpRef.current = true
    
    try {
      if (scannerRef.current) {
        const scanner = scannerRef.current
        scannerRef.current = null
        
        if (scanner.isScanning) {
          try {
            await scanner.stop()
          } catch (e) {
            // ignore stop error
          }
        }
        
        try {
          const el = document.getElementById(readerIdRef.current)
          if (el) {
            scanner.clear()
            el.innerHTML = ''
          }
        } catch (e) {
          // ignore clear error
        }
      }
    } catch (err) {
      // Ignore cleanup errors
    } finally {
      if (isMountedRef.current) {
        setIsScanning(false)
        setScanStatus('idle')
      }
      isCleaningUpRef.current = false
    }
  }

  const stopScanner = async () => {
    await cleanupScanner()
  }

  const handleClose = async () => {
    await stopScanner()
    if (isMountedRef.current && !isCleaningUpRef.current) {
      onClose?.()
    }
  }

  const switchCamera = async () => {
    const currentIndex = cameras.findIndex(c => c.id === selectedCamera)
    const nextIndex = (currentIndex + 1) % cameras.length
    setSelectedCamera(cameras[nextIndex].id)
    
    if (isScanning) {
      setScanStatus('scanning')
      await stopScanner()
      setTimeout(() => {
        if (isMountedRef.current && !isCleaningUpRef.current) {
          startScanner()
        }
      }, 500)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  // Warna Emerald sebagai identitas utama
  const emerald = {
    primary: '#10B981',
    dark: '#059669',
    soft: '#6EE7B7',
    light: '#D1FAE5'
  }

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      onTouchEnd={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <motion.div
        variants={modalVariants}
        className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl border border-emerald-200 dark:border-emerald-500/30 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'max-w-md w-full'
        }`}
        ref={containerRef}
      >
        {/* Header - Emerald Gradient */}
        <div className="px-4 py-3 border-b border-emerald-100 dark:border-emerald-500/20 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-500">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <motion.div
              animate={isScanning ? { rotate: [0, 360] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Camera size={20} />
            </motion.div>
            Scan QR Code
          </h3>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors"
              title={isFullscreen ? "Keluar fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors"
              title="Tutup"
            >
              <X size={18} />
            </motion.button>
          </div>
        </div>

        <div className="p-4">
          {/* Camera Permission Status */}
          {cameraPermission === 'denied' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-orange-50 dark:bg-slate-900/50 border border-orange-300 dark:border-orange-500/30 rounded-xl flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  Izin Kamera Ditolak
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Untuk menggunakan fitur scan QR Code, Anda perlu memberikan izin akses kamera.
                </p>
              </div>
            </motion.div>
          )}

          {/* Camera Selection */}
          {cameras.length > 1 && (
            <div className="mb-4 flex items-center gap-2">
              <div className="flex-1 relative">
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm appearance-none cursor-pointer focus:outline-none focus:ring-4 transition-all ${
                    isScanning
                      ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      : 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-500/40 text-slate-700 dark:text-white focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                  disabled={isScanning}
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label?.replace('Camera', 'Kamera') || `Kamera ${camera.id.slice(0, 8)}...`}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Smartphone size={14} className={isScanning ? 'text-slate-500' : 'text-emerald-500'} />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={switchCamera}
                disabled={!isScanning}
                className={`p-2.5 border-2 rounded-xl transition-all ${
                  isScanning
                    ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                    : 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Ganti Kamera"
              >
                <RefreshCw size={16} />
              </motion.button>
            </div>
          )}

          {/* Scanner Container */}
          <div 
            className={`relative rounded-xl overflow-hidden bg-black transition-all duration-300 ${
              isFullscreen ? 'h-[calc(100vh-200px)]' : 'aspect-square w-full max-w-[320px] mx-auto'
            }`}
          >
            <div 
              id={readerIdRef.current}
              className="w-full h-full"
            />
            
            <AnimatePresence>
              {/* Overlay Status */}
              {scanStatus === 'scanning' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {/* Scanning Animation */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.01, 1],
                      opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 border-4 border-emerald-400/40 rounded-xl"
                  />
                  
                  {/* Corner Markers - Emerald */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-xl" />
                  
                  {/* Scanning Line - Emerald Gradient */}
                  <motion.div
                    animate={{ y: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                  />
                </motion.div>
              )}

              {scanStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-emerald-500/40 flex items-center justify-center backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <CheckCircle size={32} className="text-white" />
                  </motion.div>
                </motion.div>
              )}

              {scanStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center"
                >
                  <div className="text-center">
                    <CameraOff size={48} className="text-orange-500 mx-auto mb-2" />
                    <p className="text-white text-sm">Gagal mengakses kamera</p>
                  </div>
                </motion.div>
              )}

              {!isScanning && scanStatus !== 'error' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95"
                >
                  <QrCode size={48} className="text-emerald-400 mb-3" />
                  <p className="text-slate-300 text-sm">Kamera belum aktif</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startScanner}
                    className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Camera size={14} />
                    Nyalakan Kamera
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tips Toggle */}
          <button
            onClick={() => setShowTips(!showTips)}
            className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 mx-auto"
          >
            <Info size={12} />
            {showTips ? 'Sembunyikan tips' : 'Tips scanning'}
          </button>

          {/* Tips */}
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-3 bg-emerald-50 dark:bg-slate-900/50 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-1">
                    <ScanLine size={12} className="text-emerald-600 dark:text-emerald-400" />
                    Tips Scanning QR Code
                  </h4>
                  <ul className="space-y-1.5">
                    {[
                      'Pastikan pencahayaan cukup terang',
                      'Jaga jarak 10-20 cm dari QR Code',
                      'Hindari gerakan saat scanning',
                      'Pastikan QR Code tidak rusak atau buram'
                    ].map((tip, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Bar */}
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-emerald-500 rounded-full"
                />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Kamera aktif</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ScanLine size={10} />
                Menunggu QR Code...
              </span>
            </motion.div>
          )}

          {/* Control Button */}
          {isScanning && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={stopScanner}
              className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <CameraOff size={18} />
              Matikan Kamera
            </motion.button>
          )}

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-[10px] font-mono text-slate-600 dark:text-slate-400 border border-emerald-200 dark:border-emerald-500/20">
              <p>Camera Status: {isScanning ? 'Active' : 'Inactive'}</p>
              <p>Cameras Found: {cameras.length}</p>
              <p>Selected Camera: {selectedCamera.slice(0, 20)}...</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}