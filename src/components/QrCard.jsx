import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader } from 'lucide-react'

// Convert any URL ke base64 — skip kalau sudah base64
async function toBase64(url) {
  if (!url) return null
  if (url.startsWith('data:')) return url  // sudah base64, langsung pakai
  // URL https — fetch dan convert
  try {
    const res = await fetch(url, { mode: 'cors' })
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  } catch { return null }
}

export default function QrCard({ qrUrl, nama, identifier, labelId = 'NIS', role = 'siswa', kelas, foto, sekolah, onClose }) {
  const [qrB64, setQrB64] = useState(null)
  const [fotoB64, setFotoB64] = useState(null)
  const [ready, setReady] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const isGuru = role === 'guru'

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [q, f] = await Promise.all([toBase64(qrUrl), toBase64(foto)])
      if (!cancelled) { setQrB64(q); setFotoB64(f); setReady(true) }
    }
    load()
    return () => { cancelled = true }
  }, [qrUrl, foto])

  const handleDownload = () => {
    if (!ready || !qrB64) return
    setDownloading(true)

    const W = 640, H = fotoB64 ? 860 : 800
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')

    const accent = isGuru ? '#10b981' : '#8b5cf6'

    // ── Background gradient ──
    const bg = ctx.createLinearGradient(0, 0, W, H)
    if (isGuru) { bg.addColorStop(0,'#064e3b'); bg.addColorStop(0.5,'#065f46'); bg.addColorStop(1,'#0f766e') }
    else        { bg.addColorStop(0,'#2e1065'); bg.addColorStop(0.5,'#4c1d95'); bg.addColorStop(1,'#5b21b6') }
    rr(ctx, 0, 0, W, H, 48); ctx.fillStyle = bg; ctx.fill()

    // ── Dot pattern ──
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    for (let x = 0; x < W; x += 24) for (let y = 0; y < H; y += 24) {
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill()
    }

    // ── Glow orbs ──
    const g1 = ctx.createRadialGradient(W*0.85, H*0.08, 0, W*0.85, H*0.08, 260)
    g1.addColorStop(0,'rgba(255,255,255,0.14)'); g1.addColorStop(1,'transparent')
    ctx.fillStyle = g1; ctx.fillRect(0,0,W,H)

    // ── Header pill: nama sekolah ──
    ctx.fillStyle = 'rgba(255,255,255,0.13)'
    rr(ctx, W/2-160, 32, 320, 52, 16); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.font = 'bold 22px system-ui,sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(sekolah || 'Sistem Absensi Digital', W/2, 66)

    // ── Role badge ──
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    rr(ctx, W/2-52, 96, 104, 34, 17); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = 'bold 14px system-ui,sans-serif'
    ctx.fillText(isGuru ? 'GURU' : 'SISWA', W/2, 119)

    let curY = 148

    // ── Foto user ──
    const drawRest = () => {
      // ── QR white card ──
      const qrSize = 280, qrX = (W-qrSize)/2, qrY = curY
      ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12
      ctx.fillStyle = '#ffffff'; rr(ctx, qrX-20, qrY-20, qrSize+40, qrSize+40, 28); ctx.fill()
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

      // Corner accents
      const cs = 22
      ;[[qrX-20,qrY-20],[qrX+qrSize+20-cs,qrY-20],[qrX-20,qrY+qrSize+20-cs],[qrX+qrSize+20-cs,qrY+qrSize+20-cs]].forEach(([cx,cy],i) => {
        ctx.strokeStyle = accent; ctx.lineWidth = 4; ctx.lineCap = 'round'
        ctx.beginPath()
        if (i===0) { ctx.moveTo(cx+cs,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+cs) }
        if (i===1) { ctx.moveTo(cx,cy); ctx.lineTo(cx+cs,cy); ctx.lineTo(cx+cs,cy+cs) }
        if (i===2) { ctx.moveTo(cx,cy); ctx.lineTo(cx,cy+cs); ctx.lineTo(cx+cs,cy+cs) }
        if (i===3) { ctx.moveTo(cx+cs,cy); ctx.lineTo(cx+cs,cy+cs); ctx.lineTo(cx,cy+cs) }
        ctx.stroke()
      })

      // QR image
      if (qrB64) {
        const qrImg = new Image(); qrImg.src = qrB64
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
      }

      // ── Divider ──
      const divY = qrY + qrSize + 44
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(60, divY, W-120, 1)

      // ── Nama ──
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 32px system-ui,sans-serif'; ctx.textAlign = 'center'
      let n = nama || '-'
      while (ctx.measureText(n).width > W-80 && n.length > 3) n = n.slice(0,-4)+'...'
      ctx.fillText(n, W/2, divY+46)

      // ── Identifier ──
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '20px system-ui,sans-serif'
      ctx.fillText(`${labelId}: ${identifier||'-'}`, W/2, divY+76)

      // ── Kelas ──
      if (kelas) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '18px system-ui,sans-serif'
        ctx.fillText(kelas, W/2, divY+102)
      }

      // ── Footer ──
      const footY = H - 56
      ctx.fillStyle = 'rgba(255,255,255,0.09)'; rr(ctx, 40, footY-18, W-80, 44, 16); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '15px system-ui,sans-serif'
      ctx.fillText('Scan QR Code ini untuk absensi', W/2, footY+10)

      // ── Export ──
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Kartu-QR-${isGuru?'Guru':'Siswa'}-${identifier||'absensi'}.png`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 100)
        setDownloading(false)
      }, 'image/png', 1.0)
    }

    if (fotoB64) {
      const fotoImg = new Image(); fotoImg.src = fotoB64
      fotoImg.onload = () => {
        // Foto bulat
        const fr = 48, fx = W/2-fr, fy = curY
        ctx.save(); ctx.beginPath(); ctx.arc(W/2, fy+fr, fr, 0, Math.PI*2); ctx.clip()
        ctx.drawImage(fotoImg, fx, fy, fr*2, fr*2); ctx.restore()
        // Border foto
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3
        ctx.beginPath(); ctx.arc(W/2, fy+fr, fr+2, 0, Math.PI*2); ctx.stroke()
        curY += fr*2 + 20
        drawRest()
      }
      fotoImg.onerror = () => { curY += 0; drawRest() }
    } else {
      drawRest()
    }
  }

  // Helper rounded rect
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r)
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h)
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r)
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath()
  }

  const accent = isGuru ? '#10b981' : '#8b5cf6'
  const gradBg = isGuru
    ? 'linear-gradient(145deg,#064e3b 0%,#065f46 45%,#0f766e 100%)'
    : 'linear-gradient(145deg,#2e1065 0%,#4c1d95 45%,#5b21b6 100%)'

  return (
    <div className="flex flex-col items-center gap-4">

      {/* PREVIEW KARTU */}
      <div style={{
        width: 280, borderRadius: 20, overflow: 'hidden',
        background: gradBg, fontFamily: 'system-ui,-apple-system,sans-serif',
        position: 'relative',
      }}>
        {/* Dot pattern */}
        <div style={{ position:'absolute',inset:0,opacity:0.06,
          backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',
          backgroundSize:'16px 16px' }}/>
        <div style={{ position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)' }}/>

        {/* Header */}
        <div style={{ position:'relative',zIndex:1,padding:'16px 20px 12px',
          display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
          <div style={{ background:'rgba(255,255,255,0.12)',borderRadius:10,padding:'5px 14px',
            color:'rgba(255,255,255,0.9)',fontSize:11,fontWeight:700 }}>
            {sekolah || 'Sistem Absensi Digital'}
          </div>
          <div style={{ background:'rgba(255,255,255,0.18)',borderRadius:16,padding:'3px 12px',
            color:'rgba(255,255,255,0.85)',fontSize:9,fontWeight:800,letterSpacing:'0.15em',textTransform:'uppercase' }}>
            {isGuru ? 'Guru' : 'Siswa'}
          </div>
        </div>

        {/* Foto */}
        {fotoB64 && (
          <div style={{ position:'relative',zIndex:1,display:'flex',justifyContent:'center',marginBottom:8 }}>
            <div style={{ width:56,height:56,borderRadius:'50%',overflow:'hidden',
              border:'2px solid rgba(255,255,255,0.35)',boxShadow:'0 4px 12px rgba(0,0,0,0.25)' }}>
              <img src={fotoB64} alt="foto" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
            </div>
          </div>
        )}

        {/* QR */}
        <div style={{ position:'relative',zIndex:1,display:'flex',justifyContent:'center',padding:'0 20px' }}>
          {ready && qrB64 ? (
            <div style={{ background:'#fff',borderRadius:16,padding:12,
              boxShadow:'0 8px 28px rgba(0,0,0,0.3)',position:'relative' }}>
              {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i) => (
                <div key={i} style={{
                  position:'absolute',width:12,height:12,...pos,
                  borderTop:i<2?`2px solid ${accent}`:'none',
                  borderBottom:i>=2?`2px solid ${accent}`:'none',
                  borderLeft:(i===0||i===2)?`2px solid ${accent}`:'none',
                  borderRight:(i===1||i===3)?`2px solid ${accent}`:'none',
                  borderRadius:i===0?'3px 0 0 0':i===1?'0 3px 0 0':i===2?'0 0 0 3px':'0 0 3px 0',
                }}/>
              ))}
              <img src={qrB64} alt="QR" style={{ width:168,height:168,display:'block',objectFit:'contain' }}/>
            </div>
          ) : (
            <div style={{ width:168,height:168,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Loader size={28} className="animate-spin text-white/40" />
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ position:'relative',zIndex:1,margin:'14px 20px 0',height:1,background:'rgba(255,255,255,0.15)' }}/>

        {/* Info */}
        <div style={{ position:'relative',zIndex:1,padding:'12px 20px',textAlign:'center' }}>
          <div style={{ color:'#fff',fontSize:15,fontWeight:800,marginBottom:3,
            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
            {nama || '-'}
          </div>
          <div style={{ color:'rgba(255,255,255,0.6)',fontSize:11,fontWeight:500,marginBottom:kelas?2:0 }}>
            {labelId}: {identifier || '-'}
          </div>
          {kelas && <div style={{ color:'rgba(255,255,255,0.5)',fontSize:10,fontWeight:500 }}>{kelas}</div>}
        </div>

        {/* Footer */}
        <div style={{ position:'relative',zIndex:1,margin:'0 20px 16px',
          background:'rgba(255,255,255,0.08)',borderRadius:10,padding:'6px 12px',
          textAlign:'center',color:'rgba(255,255,255,0.45)',fontSize:9,fontWeight:600 }}>
          Scan QR Code ini untuk absensi
        </div>
      </div>

      {/* TOMBOL */}
      <div className="flex gap-3 w-full" style={{ maxWidth: 280 }}>
        <motion.button whileTap={{ scale:0.97 }} onClick={handleDownload}
          disabled={!ready || downloading}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 shadow-lg"
          style={{
            background: isGuru ? 'linear-gradient(135deg,#059669,#0d9488)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            boxShadow: isGuru ? '0 8px 24px rgba(5,150,105,0.3)' : '0 8px 24px rgba(124,58,237,0.3)',
          }}>
          {downloading ? <><Loader size={14} className="animate-spin"/> Menyiapkan...</> : <><Download size={14}/> Download</>}
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
