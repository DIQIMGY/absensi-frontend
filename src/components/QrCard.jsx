import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader } from 'lucide-react'
import html2canvas from 'html2canvas'

export default function QrCard({ qrUrl, nama, identifier, labelId = 'NIS', role = 'siswa', kelas, foto, sekolah, onClose }) {
  const cardRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [qrBase64, setQrBase64] = useState(null)
  const isGuru = role === 'guru'

  // Convert QR URL ke base64 agar html2canvas bisa render
  useEffect(() => {
    if (!qrUrl) return
    if (qrUrl.startsWith('data:')) { setQrBase64(qrUrl); return }
    fetch(qrUrl)
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader()
        reader.onloadend = () => setQrBase64(reader.result)
        reader.readAsDataURL(blob)
      })
      .catch(() => setQrBase64(qrUrl))
  }, [qrUrl])

  const handleDownload = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      })
      const url = canvas.toDataURL('image/png', 1.0)
      const a = document.createElement('a')
      a.href = url
      a.download = `Kartu-QR-${isGuru ? 'Guru' : 'Siswa'}-${identifier || 'absensi'}.png`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    } catch (e) { console.error(e) }
    finally { setDownloading(false) }
  }

  if (!qrBase64) return (
    <div className="py-10 text-center">
      <Loader size={32} className="animate-spin text-slate-400 mx-auto mb-3" />
      <p className="text-sm text-slate-400">Memuat QR Code...</p>
    </div>
  )

  const accent = isGuru ? '#10b981' : '#8b5cf6'
  const gradBg = isGuru
    ? 'linear-gradient(145deg,#064e3b 0%,#065f46 45%,#0f766e 100%)'
    : 'linear-gradient(145deg,#2e1065 0%,#4c1d95 45%,#5b21b6 100%)'

  return (
    <div className="flex flex-col items-center gap-4">

      {/* KARTU */}
      <div ref={cardRef} style={{
        width: 320, borderRadius: 24, overflow: 'hidden',
        background: gradBg, fontFamily: 'system-ui,-apple-system,sans-serif',
        position: 'relative',
      }}>
        {/* Dot pattern */}
        <div style={{
          position:'absolute',inset:0,opacity:0.06,
          backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',
          backgroundSize:'18px 18px',
        }}/>
        {/* Glow */}
        <div style={{ position:'absolute',top:-60,right:-60,width:200,height:200,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)' }}/>
        <div style={{ position:'absolute',bottom:-40,left:-40,width:160,height:160,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 70%)' }}/>

        {/* HEADER */}
        <div style={{ position:'relative',zIndex:1,padding:'20px 24px 12px',
          display:'flex',flexDirection:'column',alignItems:'center',gap:8 }}>
          <div style={{ background:'rgba(255,255,255,0.12)',borderRadius:12,padding:'6px 16px',
            color:'rgba(255,255,255,0.9)',fontSize:12,fontWeight:700 }}>
            {sekolah || 'Sistem Absensi Digital'}
          </div>
          <div style={{ background:'rgba(255,255,255,0.18)',borderRadius:20,padding:'3px 14px',
            color:'rgba(255,255,255,0.85)',fontSize:10,fontWeight:800,letterSpacing:'0.15em',textTransform:'uppercase' }}>
            {isGuru ? 'Guru' : 'Siswa'}
          </div>
        </div>

        {/* FOTO USER */}
        {foto && (
          <div style={{ position:'relative',zIndex:1,display:'flex',justifyContent:'center',marginBottom:8 }}>
            <div style={{ width:64,height:64,borderRadius:14,overflow:'hidden',
              border:'3px solid rgba(255,255,255,0.3)',boxShadow:'0 4px 16px rgba(0,0,0,0.25)' }}>
              <img src={foto} alt="foto" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
            </div>
          </div>
        )}

        {/* QR CODE */}
        <div style={{ position:'relative',zIndex:1,display:'flex',justifyContent:'center',padding:'0 24px' }}>
          <div style={{ background:'#fff',borderRadius:18,padding:14,
            boxShadow:'0 12px 40px rgba(0,0,0,0.35)',position:'relative' }}>
            {/* Corner accents */}
            {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i) => (
              <div key={i} style={{
                position:'absolute',width:14,height:14,...pos,
                borderTop: i<2 ? `3px solid ${accent}` : 'none',
                borderBottom: i>=2 ? `3px solid ${accent}` : 'none',
                borderLeft: (i===0||i===2) ? `3px solid ${accent}` : 'none',
                borderRight: (i===1||i===3) ? `3px solid ${accent}` : 'none',
                borderRadius: i===0?'4px 0 0 0':i===1?'0 4px 0 0':i===2?'0 0 0 4px':'0 0 4px 0',
              }}/>
            ))}
            <img src={qrBase64} alt="QR" style={{ width:192,height:192,display:'block',objectFit:'contain' }}/>
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ position:'relative',zIndex:1,margin:'18px 24px 0',height:1,background:'rgba(255,255,255,0.15)' }}/>

        {/* INFO */}
        <div style={{ position:'relative',zIndex:1,padding:'14px 24px',textAlign:'center' }}>
          <div style={{ color:'#fff',fontSize:17,fontWeight:800,marginBottom:3,
            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
            {nama || '-'}
          </div>
          <div style={{ color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:500,marginBottom:kelas?2:0 }}>
            {labelId}: {identifier || '-'}
          </div>
          {kelas && <div style={{ color:'rgba(255,255,255,0.5)',fontSize:11,fontWeight:500 }}>{kelas}</div>}
        </div>

        {/* FOOTER */}
        <div style={{ position:'relative',zIndex:1,margin:'0 24px 20px',
          background:'rgba(255,255,255,0.08)',borderRadius:12,padding:'8px 16px',
          textAlign:'center',color:'rgba(255,255,255,0.45)',fontSize:10,fontWeight:600 }}>
          Scan QR Code ini untuk absensi
        </div>
      </div>

      {/* TOMBOL */}
      <div className="flex gap-3 w-full" style={{ maxWidth: 320 }}>
        <motion.button whileTap={{ scale:0.97 }} onClick={handleDownload} disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 shadow-lg"
          style={{
            background: isGuru ? 'linear-gradient(135deg,#059669,#0d9488)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            boxShadow: isGuru ? '0 8px 24px rgba(5,150,105,0.3)' : '0 8px 24px rgba(124,58,237,0.3)',
          }}>
          {downloading ? <><Loader size={14} className="animate-spin"/> Menyiapkan...</> : <><Download size={14}/> Download Kartu QR</>}
        </motion.button>
        {onClose && (
          <button onClick={onClose}
            className="px-4 py-3 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
            Tutup
          </button>
        )}
      </div>
    </div>
  )
}
