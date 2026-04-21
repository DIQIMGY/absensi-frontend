import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader } from 'lucide-react'

/**
 * QrCard — render kartu QR estetik di canvas lalu download sebagai PNG
 *
 * Props:
 *   qrUrl      — URL gambar QR (blob URL atau https)
 *   nama       — nama lengkap
 *   identifier — NIS / NIP / dll
 *   labelId    — label identifier, misal "NIS" atau "NIP"
 *   role       — 'siswa' | 'guru'
 *   kelas      — nama kelas (opsional, siswa)
 *   sekolah    — nama sekolah (opsional)
 *   onClose    — callback tutup modal
 */
export default function QrCard({ qrUrl, nama, identifier, labelId = 'NIS', role = 'siswa', kelas, sekolah, onClose }) {
  const canvasRef = useRef(null)
  const [rendered, setRendered] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Warna tema per role
  const theme = role === 'guru'
    ? { from: '#064e3b', mid: '#065f46', to: '#0f766e', accent: '#34d399', light: '#d1fae5', text: '#065f46' }
    : { from: '#2e1065', mid: '#4c1d95', to: '#5b21b6', accent: '#a78bfa', light: '#ede9fe', text: '#4c1d95' }

  useEffect(() => {
    if (!qrUrl) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const W = 480
    const H = 680
    canvas.width = W
    canvas.height = H

    const qrImg = new Image()
    qrImg.crossOrigin = 'anonymous'
    qrImg.onload = () => {
      // ── Background gradient ──
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, theme.from)
      bg.addColorStop(0.5, theme.mid)
      bg.addColorStop(1, theme.to)
      ctx.fillStyle = bg
      roundRect(ctx, 0, 0, W, H, 32)
      ctx.fill()

      // ── Dot pattern overlay ──
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      for (let x = 0; x < W; x += 24) {
        for (let y = 0; y < H; y += 24) {
          ctx.beginPath()
          ctx.arc(x, y, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // ── Glow orbs ──
      const g1 = ctx.createRadialGradient(W * 0.8, H * 0.1, 0, W * 0.8, H * 0.1, 200)
      g1.addColorStop(0, 'rgba(255,255,255,0.12)')
      g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, W, H)

      const g2 = ctx.createRadialGradient(W * 0.2, H * 0.85, 0, W * 0.2, H * 0.85, 180)
      g2.addColorStop(0, 'rgba(255,255,255,0.08)')
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, W, H)

      // ── Header: nama sekolah ──
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      roundRect(ctx, 24, 24, W - 48, 56, 16)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = 'bold 15px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(sekolah || 'Sistem Absensi Digital', W / 2, 58)

      // ── Role badge ──
      const roleLabel = role === 'guru' ? 'GURU' : 'SISWA'
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      roundRect(ctx, W / 2 - 36, 96, 72, 26, 13)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = 'bold 11px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(roleLabel, W / 2, 114)

      // ── QR Code card (putih) ──
      const qrSize = 240
      const qrX = (W - qrSize) / 2
      const qrY = 140

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.35)'
      ctx.shadowBlur = 32
      ctx.shadowOffsetY = 8
      ctx.fillStyle = '#ffffff'
      roundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 24)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // QR image
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

      // Corner decorations on QR card
      const corners = [[qrX - 16, qrY - 16], [qrX + qrSize + 16 - 20, qrY - 16],
                       [qrX - 16, qrY + qrSize + 16 - 20], [qrX + qrSize + 16 - 20, qrY + qrSize + 16 - 20]]
      ctx.fillStyle = theme.accent
      corners.forEach(([cx, cy]) => {
        ctx.fillRect(cx, cy, 20, 4)
        ctx.fillRect(cx, cy, 4, 20)
      })

      // ── Divider ──
      const divY = qrY + qrSize + 40
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillRect(40, divY, W - 80, 1)

      // ── Nama ──
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 26px system-ui, sans-serif'
      ctx.textAlign = 'center'
      // Truncate nama kalau terlalu panjang
      const maxNamaWidth = W - 80
      let namaText = nama || '-'
      while (ctx.measureText(namaText).width > maxNamaWidth && namaText.length > 3) {
        namaText = namaText.slice(0, -4) + '...'
      }
      ctx.fillText(namaText, W / 2, divY + 36)

      // ── Identifier (NIS/NIP) ──
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '14px system-ui, sans-serif'
      ctx.fillText(`${labelId}: ${identifier || '-'}`, W / 2, divY + 60)

      // ── Kelas (siswa only) ──
      if (kelas) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '13px system-ui, sans-serif'
        ctx.fillText(kelas, W / 2, divY + 80)
      }

      // ── Footer ──
      const footerY = H - 48
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      roundRect(ctx, 24, footerY - 16, W - 48, 40, 12)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.font = '11px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Scan QR Code ini untuk absensi', W / 2, footerY + 8)

      setRendered(true)
    }
    qrImg.onerror = () => setRendered(true)
    qrImg.src = qrUrl
  }, [qrUrl, nama, identifier, labelId, role, kelas, sekolah])

  const handleDownload = () => {
    setDownloading(true)
    const canvas = canvasRef.current
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `QR-${role === 'guru' ? 'Guru' : 'Siswa'}-${identifier || 'absensi'}.png`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
      setDownloading(false)
    }, 'image/png', 1.0)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview canvas */}
      <div className="relative">
        {!rendered && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <Loader size={24} className="animate-spin text-slate-400" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="rounded-2xl shadow-2xl"
          style={{ width: 240, height: 340, display: rendered ? 'block' : 'none' }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-xs">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={!rendered || downloading}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 shadow-lg
            ${role === 'guru'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/25'
              : 'bg-gradient-to-r from-violet-500 to-indigo-500 shadow-violet-500/25'}`}
        >
          {downloading
            ? <><Loader size={14} className="animate-spin" /> Menyiapkan...</>
            : <><Download size={14} /> Download Kartu QR</>}
        </motion.button>
        {onClose && (
          <button onClick={onClose}
            className="px-4 py-3 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Tutup
          </button>
        )}
      </div>
    </div>
  )
}

// Helper: rounded rect path
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
