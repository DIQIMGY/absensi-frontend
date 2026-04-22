import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader } from 'lucide-react'
import html2canvas from 'html2canvas'

async function toB64(url) {
  if (!url) return null
  if (url.startsWith('data:')) return url
  if (url.startsWith('blob:')) {
    // Blob URL — fetch langsung bisa
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      return new Promise(r => { const fr = new FileReader(); fr.onloadend = () => r(fr.result); fr.readAsDataURL(blob) })
    } catch { return null }
  }
  // URL http/https — coba fetch dengan no-cors fallback
  try {
    const res = await fetch(url, { mode: 'cors' })
    const blob = await res.blob()
    return new Promise(r => { const fr = new FileReader(); fr.onloadend = () => r(fr.result); fr.readAsDataURL(blob) })
  } catch {
    // CORS gagal — return null, jangan pakai URL asli (akan taint canvas)
    return null
  }
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r)
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h)
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r)
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath()
}

export default function QrCard({ qrUrl, nama, identifier, labelId='NIS', role='siswa', kelas, foto, logo, sekolah, onClose }) {
  const cardRef = useRef(null)
  const [qrB64, setQrB64]     = useState(null)
  const [fotoB64, setFotoB64] = useState(null)
  const [logoB64, setLogoB64] = useState(null)
  const [ready, setReady]     = useState(false)
  const [dl, setDl]           = useState(false)
  const isGuru = role === 'guru'
  const C = isGuru
    ? { top:'#065f46', bot:'#064e3b', accent:'#34d399' }
    : { top:'#4c1d95', bot:'#2e1065', accent:'#a78bfa' }

  useEffect(() => {
    let dead = false
    setReady(false); setQrB64(null); setFotoB64(null); setLogoB64(null)
    if (!qrUrl) return
    Promise.all([toB64(qrUrl), toB64(foto), toB64(logo)]).then(([q,f,l]) => {
      if (dead) return
      setQrB64(q || (qrUrl.startsWith('data:') ? qrUrl : null))
      setFotoB64(f); setLogoB64(l); setReady(true)
    })
    return () => { dead = true }
  }, [qrUrl, foto, logo])

  const handleDownload = async () => {
    if (!ready || !qrB64 || !cardRef.current) return
    setDl(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      })
      canvas.toBlob(blob => {
        if (!blob) { setDl(false); return }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ID-Card-${isGuru?'Guru':'Siswa'}-${identifier||'absensi'}.png`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 100)
        setDl(false)
      }, 'image/png', 1.0)
    } catch (e) {
      console.error('Download error:', e)
      setDl(false)
    }
  }

  const gradBg = `linear-gradient(160deg,${C.top} 0%,${C.bot} 100%)`
  const accent = C.accent

  return (
    <div className="flex flex-col items-center gap-4">
      {/* PREVIEW */}
      <div ref={cardRef} style={{ width:300,borderRadius:18,overflow:'hidden',background:gradBg,
        position:'relative',fontFamily:'system-ui,-apple-system,sans-serif',
        boxShadow:'0 20px 60px rgba(0,0,0,0.35)' }}>
        {/* Dots */}
        <div style={{ position:'absolute',inset:0,opacity:0.05,pointerEvents:'none',
          backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',backgroundSize:'16px 16px' }}/>
        {/* Glow */}
        <div style={{ position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',pointerEvents:'none',
          background:'radial-gradient(circle,rgba(255,255,255,0.14) 0%,transparent 70%)' }}/>

        {/* TOP */}
        <div style={{ position:'relative',zIndex:1,padding:'14px 14px 12px' }}>
          {/* Accent bar */}
          <div style={{ position:'absolute',left:0,top:42,width:3,height:90,background:accent,borderRadius:'0 2px 2px 0' }}/>

          {/* Header row: logo + nama sekolah */}
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
            {/* Logo */}
            <div style={{ width:34,height:34,borderRadius:'50%',overflow:'hidden',flexShrink:0,
              border:'1.5px solid rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.15)',
              display:'flex',alignItems:'center',justifyContent:'center' }}>
              {logoB64 && logoB64.startsWith('data:')
                ? <img src={logoB64} alt="logo" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                : <span style={{ color:'rgba(255,255,255,0.7)',fontSize:12,fontWeight:800 }}>
                    {(sekolah||'S').charAt(0).toUpperCase()}
                  </span>
              }
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ color:'rgba(255,255,255,0.88)',fontSize:10,fontWeight:700,
                lineHeight:1.3, wordBreak:'break-word' }}>
                {sekolah||'Sistem Absensi Digital'}
              </div>
            </div>
            <div style={{ background:accent,borderRadius:8,padding:'4px 10px',
              color:'#fff',fontSize:9,fontWeight:800,letterSpacing:'0.1em',
              textTransform:'uppercase',flexShrink:0,
              display:'flex',alignItems:'center',justifyContent:'center',
              lineHeight:1,minHeight:22 }}>
              {isGuru?'Guru':'Siswa'}
            </div>
          </div>

          {/* Info + Foto */}
          <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
            {/* Info */}
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ color:'#fff',fontSize:17,fontWeight:800,marginBottom:6,
                wordBreak:'break-word',lineHeight:1.2 }}>{nama||'-'}</div>
              <div style={{ marginBottom:4 }}>
                <div style={{ color:'rgba(255,255,255,0.45)',fontSize:9,fontWeight:700,
                  textTransform:'uppercase',letterSpacing:'0.08em' }}>{labelId}</div>
                <div style={{ color:'rgba(255,255,255,0.88)',fontSize:13,fontWeight:700 }}>{identifier||'-'}</div>
              </div>
              {kelas && (
                <div>
                  <div style={{ color:'rgba(255,255,255,0.45)',fontSize:9,fontWeight:700,
                    textTransform:'uppercase',letterSpacing:'0.08em' }}>Kelas</div>
                  <div style={{ color:'rgba(255,255,255,0.88)',fontSize:13,fontWeight:700 }}>{kelas}</div>
                </div>
              )}
            </div>
            {/* Foto */}
            <div style={{ width:72,height:90,borderRadius:10,overflow:'hidden',flexShrink:0,
              border:'2px solid rgba(255,255,255,0.25)',background:'rgba(255,255,255,0.1)',
              display:'flex',alignItems:'center',justifyContent:'center' }}>
              {fotoB64 && fotoB64.startsWith('data:')
                ? <img src={fotoB64} alt="foto" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                : <span style={{ color:'rgba(255,255,255,0.3)',fontSize:22 }}>?</span>}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:1,background:'rgba(255,255,255,0.12)',margin:'0 14px' }}/>

        {/* QR */}
        <div style={{ position:'relative',zIndex:1,padding:'12px 14px 12px',
          display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
          {ready && qrB64 && qrB64.startsWith('data:') ? (
            <div style={{ background:'#fff',borderRadius:12,padding:10,
              boxShadow:'0 6px 20px rgba(0,0,0,0.25)',position:'relative' }}>
              {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i)=>(
                <div key={i} style={{ position:'absolute',width:10,height:10,...pos,
                  borderTop:i<2?`2px solid ${accent}`:'none',
                  borderBottom:i>=2?`2px solid ${accent}`:'none',
                  borderLeft:(i===0||i===2)?`2px solid ${accent}`:'none',
                  borderRight:(i===1||i===3)?`2px solid ${accent}`:'none',
                  borderRadius:i===0?'3px 0 0 0':i===1?'0 3px 0 0':i===2?'0 0 0 3px':'0 0 3px 0' }}/>
              ))}
              <img src={qrB64} alt="QR" style={{ width:180,height:180,display:'block',objectFit:'contain' }}/>
            </div>
          ) : (
            <div style={{ width:180,height:180,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Loader size={28} className="animate-spin" style={{ color:'rgba(255,255,255,0.4)' }}/>
            </div>
          )}
          <div style={{ color:'rgba(255,255,255,0.4)',fontSize:9,fontWeight:600,letterSpacing:'0.05em' }}>
            Scan QR Code ini untuk absensi
          </div>
        </div>
      </div>

      {/* TOMBOL */}
      <div className="flex gap-3 w-full" style={{ maxWidth:300 }}>
        <motion.button whileTap={{ scale:0.97 }} onClick={handleDownload}
          disabled={!ready||dl}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
          style={{
            background:isGuru?'linear-gradient(135deg,#059669,#0d9488)':'linear-gradient(135deg,#7c3aed,#4f46e5)',
            boxShadow:isGuru?'0 8px 24px rgba(5,150,105,0.3)':'0 8px 24px rgba(124,58,237,0.3)',
          }}>
          {dl?<><Loader size={14} className="animate-spin"/> Menyiapkan...</>:<><Download size={14}/> Download ID Card</>}
        </motion.button>
        {onClose&&(
          <button onClick={onClose}
            className="px-4 py-3 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
            Tutup
          </button>
        )}
      </div>
    </div>
  )
}
