import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader } from 'lucide-react'
import html2canvas from 'html2canvas'

/**
 * QrCard — kartu QR estetik yang bisa didownload sebagai PNG
 *
 * Props:
 *   qrUrl      — URL gambar QR
 *   nama       — nama lengkap
 *   identifier — NIS / NIP
 *   labelId    — "NIS" | "NIP"
 *   role       — 'siswa' | 'guru'
 *   kelas      — nama kelas (opsional)
 *   sekolah    — nama sekolah (opsional)
 *   onClose    — callback tutup
 */
export default function QrCard({ qrUrl, nama, identifier, labelId = 'NIS', role = 'siswa', kelas, sekolah, onClose }) {
  const cardRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  const isGuru = role === 'guru'

  const handleDownload = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      })
      const url = canvas.toDataURL('image/png', 1.0)
      const a = document.createElement('a')
      a.href = url
      a.download = `Kartu-QR-${isGuru ? 'Guru' : 'Siswa'}-${identifier || 'absensi'}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">

      {/* ── KARTU QR ── */}
      <div ref={cardRef}
        style={{
          width: 320,
          borderRadius: 24,
          overflow: 'hidden',
          background: isGuru
            ? 'linear-gradient(145deg,#064e3b 0%,#065f46 45%,#0f766e 100%)'
            : 'linear-gradient(145deg,#2e1065 0%,#4c1d95 45%,#5b21b6 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Dot pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}/>

        {/* Glow top-right */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        {/* Glow bottom-left */}
        <div style={{
          position: 'absolute', bottom: -40, left: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        {/* ── HEADER ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          padding: '20px 24px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          {/* Nama sekolah */}
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 12, padding: '6px 16px',
            color: 'rgba(255,255,255,0.9)',
            fontSize: 12, fontWeight: 700,
            letterSpacing: '0.02em',
          }}>
            {sekolah || 'Sistem Absensi Digital'}
          </div>

          {/* Role badge */}
          <div style={{
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 20, padding: '3px 14px',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 10, fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            {isGuru ? 'Guru' : 'Siswa'}
          </div>
        </div>

        {/* ── QR CODE ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', justifyContent: 'center',
          padding: '0 24px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: 16,
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            position: 'relative',
          }}>
            {/* Corner accents */}
            {[
              { top: 0, left: 0 }, { top: 0, right: 0 },
              { bottom: 0, left: 0 }, { bottom: 0, right: 0 },
            ].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: 16, height: 16,
                ...pos,
                borderTop: i < 2 ? `3px solid ${isGuru ? '#10b981' : '#8b5cf6'}` : 'none',
                borderBottom: i >= 2 ? `3px solid ${isGuru ? '#10b981' : '#8b5cf6'}` : 'none',
                borderLeft: (i === 0 || i === 2) ? `3px solid ${isGuru ? '#10b981' : '#8b5cf6'}` : 'none',
                borderRight: (i === 1 || i === 3) ? `3px solid ${isGuru ? '#10b981' : '#8b5cf6'}` : 'none',
                borderRadius: i === 0 ? '4px 0 0 0' : i === 1 ? '0 4px 0 0' : i === 2 ? '0 0 0 4px' : '0 0 4px 0',
              }}/>
            ))}
            <img
              src={qrUrl}
              alt="QR Code"
              crossOrigin="anonymous"
              style={{ width: 200, height: 200, display: 'block', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          margin: '20px 24px 0',
          height: 1,
          background: 'rgba(255,255,255,0.15)',
        }}/>

        {/* ── INFO ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          padding: '16px 24px',
          textAlign: 'center',
        }}>
          {/* Nama */}
          <div style={{
            color: '#ffffff',
            fontSize: 18, fontWeight: 800,
            letterSpacing: '-0.01em',
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {nama || '-'}
          </div>

          {/* Identifier */}
          <div style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 12, fontWeight: 500,
            marginBottom: kelas ? 2 : 0,
          }}>
            {labelId}: {identifier || '-'}
          </div>

          {/* Kelas */}
          {kelas && (
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 11, fontWeight: 500,
            }}>
              {kelas}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          margin: '0 24px 20px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '8px 16px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.45)',
          fontSize: 10, fontWeight: 600,
          letterSpacing: '0.03em',
        }}>
          Scan QR Code ini untuk absensi
        </div>
      </div>

      {/* ── TOMBOL ── */}
      <div className="flex gap-3 w-full" style={{ maxWidth: 320 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 shadow-lg"
          style={{
            background: isGuru
              ? 'linear-gradient(135deg,#059669,#0d9488)'
              : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            boxShadow: isGuru
              ? '0 8px 24px rgba(5,150,105,0.3)'
              : '0 8px 24px rgba(124,58,237,0.3)',
          }}
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
