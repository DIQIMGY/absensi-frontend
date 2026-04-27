import { useEffect, useRef } from 'react'
import { usePengaturanStore } from '../stores/pengaturanStore'

const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

export default function CustomCursor() {
  const { pengaturan } = usePengaturanStore()
  const canvasRef = useRef(null)
  const dataRef   = useRef({ text: 'Welcome', logo: null })

  useEffect(() => {
    dataRef.current.text = `Welcome, ${pengaturan?.nama_sekolah || 'Sistem Absensi'}`
  }, [pengaturan?.nama_sekolah])

  useEffect(() => {
    const src = pengaturan?.logo_sekolah
    if (!src) return
    const img = new Image()
    img.src = src
    img.onload = () => { dataRef.current.logo = img }
  }, [pengaturan?.logo_sekolah])

  // ── TOUCH EFFECT ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isTouch()) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    // Partikel aktif
    let particles = []
    let raf = null

    const colorAt = (ratio) => {
      const r = Math.round(99  + (16  - 99)  * ratio)
      const g = Math.round(102 + (185 - 102) * ratio)
      const b = Math.round(241 + (129 - 241) * ratio)
      return [r, g, b]
    }

    const spawnRipple = (x, y) => {
      const text = dataRef.current.text
      const logo = dataRef.current.logo

      // Ring ripple utama
      particles.push({ type: 'ring', x, y, r: 0, maxR: 60, life: 1, decay: 0.035 })
      particles.push({ type: 'ring', x, y, r: 0, maxR: 40, life: 1, decay: 0.055, color: [16,185,129] })

      // Logo/dot di tengah
      particles.push({ type: 'logo', x, y, r: 0, maxR: 16, life: 1, decay: 0.025, logo })

      // Partikel icon shapes menyebar (heart, star, lightning)
      const SHAPE_COLORS = ['#10b981','#6366f1','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#34d399','#fbbf24']
      const SHAPE_TYPES = ['heart','star','lightning','star','heart','ring','star','heart','lightning','star','heart','ring']
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        const speed = 2.5 + Math.random() * 2
        const col = SHAPE_COLORS[i % SHAPE_COLORS.length]
        const shapeType = SHAPE_TYPES[i % SHAPE_TYPES.length]
        particles.push({
          type: 'shape', shapeType, col,
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1, decay: 0.022 + Math.random() * 0.01,
          sz: 4 + Math.random() * 4,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.15,
        })
      }
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles = particles.filter(p => p.life > 0)
      if (particles.length === 0) return

      for (const p of particles) {
        p.life -= p.decay
        if (p.life <= 0) continue
        const alpha = Math.max(0, p.life)

        if (p.type === 'ring') {
          p.r += (p.maxR - p.r) * 0.12
          const [r,g,b] = p.color || [99,102,241]
          ctx.save()
          ctx.globalAlpha = alpha * 0.6
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.strokeStyle = `rgb(${r},${g},${b})`
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.restore()
        }

        if (p.type === 'logo') {
          p.r += (p.maxR - p.r) * 0.1
          ctx.save()
          ctx.globalAlpha = alpha
          if (p.logo) {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.clip()
            ctx.drawImage(p.logo, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)
          } else {
            const g2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
            g2.addColorStop(0, 'rgba(16,185,129,0.9)')
            g2.addColorStop(1, 'rgba(99,102,241,0.1)')
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
            ctx.fillStyle = g2; ctx.fill()
          }
          ctx.restore()
        }

        if (p.type === 'shape') {
          p.x += p.vx; p.y += p.vy
          p.vx *= 0.93; p.vy *= 0.93
          p.rot += p.rotSpeed
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.translate(p.x, p.y); ctx.rotate(p.rot)
          ctx.fillStyle = p.col; ctx.strokeStyle = p.col
          ctx.shadowColor = p.col; ctx.shadowBlur = 8
          const sz = p.sz
          if (p.shapeType === 'heart') {
            ctx.beginPath()
            ctx.moveTo(0, sz * 0.3)
            ctx.bezierCurveTo(0, 0, -sz, 0, -sz, sz * 0.3)
            ctx.bezierCurveTo(-sz, sz * 0.65, 0, sz, 0, sz)
            ctx.bezierCurveTo(0, sz, sz, sz * 0.65, sz, sz * 0.3)
            ctx.bezierCurveTo(sz, 0, 0, 0, 0, sz * 0.3)
            ctx.closePath(); ctx.fill()
          } else if (p.shapeType === 'star') {
            ctx.beginPath()
            for (let j = 0; j < 10; j++) {
              const r = j % 2 === 0 ? sz : sz * 0.4
              const a = (j * Math.PI) / 5 - Math.PI / 2
              j === 0 ? ctx.moveTo(r * Math.cos(a), r * Math.sin(a))
                      : ctx.lineTo(r * Math.cos(a), r * Math.sin(a))
            }
            ctx.closePath(); ctx.fill()
          } else if (p.shapeType === 'lightning') {
            ctx.beginPath()
            ctx.moveTo(sz * 0.3, -sz); ctx.lineTo(-sz * 0.1, 0)
            ctx.lineTo(sz * 0.2, 0); ctx.lineTo(-sz * 0.3, sz)
            ctx.lineTo(sz * 0.1, sz * 0.1); ctx.lineTo(-sz * 0.1, sz * 0.1)
            ctx.closePath(); ctx.fill()
          } else {
            ctx.beginPath(); ctx.arc(0, 0, sz, 0, Math.PI * 2)
            ctx.lineWidth = 2; ctx.stroke()
          }
          ctx.restore()
        }
      }
    }

    const onTouch = (e) => {
      // Jangan block event asli
      for (const t of e.changedTouches) {
        spawnRipple(t.clientX, t.clientY)
      }
      if (particles.length > 0 && !raf) raf = requestAnimationFrame(loop)
    }

    document.addEventListener('touchstart', onTouch, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('touchstart', onTouch)
    }
  }, []) // eslint-disable-line

  // ── MOUSE CURSOR (laptop) ────────────────────────────────────────────────────
  useEffect(() => {
    if (isTouch()) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    let mx = -999, my = -999, isIdle = false, idleTimer = null
    let idleAngle = 0, blend = 0, blends = [], raf = null, prevT = 0, chain = []

    const initChain = (x, y) => {
      const text = dataRef.current.text
      chain  = Array.from({ length: text.length }, () => ({ x, y }))
      blends = Array(text.length).fill(0)
    }

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY
      canvas.style.opacity = '1'
      if (chain.length === 0) initChain(mx, my)
      isIdle = false; clearTimeout(idleTimer)
      idleTimer = setTimeout(() => { isIdle = true }, 500)
    }
    const onLeave = () => { canvas.style.opacity = '0'; isIdle = false; clearTimeout(idleTimer) }
    const onEnter = () => { canvas.style.opacity = '1' }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    const lerp  = (a, b, t) => a + (b - a) * t
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
    const eio   = t => t < 0.5 ? 2*t*t : 1 - (-2*t+2)**2/2
    const colorAt = (ratio) => {
      const r = Math.round(99  + (16  - 99)  * ratio)
      const g = Math.round(102 + (185 - 102) * ratio)
      const b = Math.round(241 + (129 - 241) * ratio)
      return [r, g, b]
    }

    const loop = (t) => {
      raf = requestAnimationFrame(loop)
      const dt = prevT ? clamp((t - prevT) / 16.67, 0.1, 3) : 1
      prevT = t
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const text = dataRef.current.text
      const len  = text.length
      if (len === 0 || chain.length === 0) return

      while (chain.length < len)  { chain.push({ x: mx, y: my }); blends.push(0) }
      while (chain.length > len)  { chain.pop(); blends.pop() }

    // ── IDLE ORBITS — geometric shapes (no emoji) ──────────────────
    blend = lerp(blend, isIdle ? 1 : 0, clamp(0.05 * dt, 0, 0.2))
    idleAngle += 0.022 * dt

    for (let i = 0; i < len; i++) {
      const threshold   = (i / len) * 0.55
      const localTarget = isIdle ? clamp((blend - threshold) / (1 - threshold + 0.001), 0, 1) : 0
      const speed       = isIdle ? clamp(0.06 * dt, 0, 0.2) : clamp(0.18 * dt, 0, 0.6)
      blends[i] = lerp(blends[i], localTarget, speed)
    }

    if (blend < 0.99) {
      for (let i = 0; i < len; i++) {
        const target = i === 0 ? { x: mx, y: my } : chain[i - 1]
        const speed  = clamp((0.25 - (i / len) * 0.19) * dt, 0.01, 0.9)
        chain[i].x = lerp(chain[i].x, target.x, speed)
        chain[i].y = lerp(chain[i].y, target.y, speed)
      }
    }
    if (blend > 0.01) {
      const radius = 52 + Math.sin(idleAngle * 1.5) * 4
      for (let i = 0; i < len; i++) {
        if (blends[i] < 0.005) continue
        const a  = idleAngle + (i / len) * Math.PI * 2
        const tx = mx + Math.cos(a) * radius
        const ty = my + Math.sin(a) * radius
        const pull = clamp(blends[i] * 0.13 * dt, 0, 0.5)
        chain[i].x = lerp(chain[i].x, tx, pull)
        chain[i].y = lerp(chain[i].y, ty, pull)
      }
    }

    // Glow blur trail
    ctx.save(); ctx.filter = 'blur(9px)'
    for (let i = len-1; i >= 0; i--) {
      const ratio = 1 - i/len; const [r,g,b] = colorAt(ratio)
      ctx.beginPath(); ctx.arc(chain[i].x, chain[i].y, 3 + ratio*9, 0, Math.PI*2)
      ctx.fillStyle = `rgba(${r},${g},${b},${0.04 + ratio*0.07})`; ctx.fill()
    }
    ctx.restore()

    if (blend < 0.8) {
      ctx.save(); ctx.globalAlpha = (1 - blend) * 0.18; ctx.beginPath()
      ctx.moveTo(chain[0].x, chain[0].y)
      for (let i = 1; i < len; i++) {
        const cx = (chain[i].x + chain[i-1].x) / 2; const cy = (chain[i].y + chain[i-1].y) / 2
        ctx.quadraticCurveTo(chain[i-1].x, chain[i-1].y, cx, cy)
      }
      const lg = ctx.createLinearGradient(chain[0].x, chain[0].y, chain[len-1].x, chain[len-1].y)
      lg.addColorStop(0, 'rgba(16,185,129,0.9)'); lg.addColorStop(1, 'rgba(99,102,241,0.15)')
      ctx.strokeStyle = lg; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore()
    }

    // Teks bergerak (saat tidak idle)
    for (let i = len-1; i >= 0; i--) {
      const ratio = 1 - i/len; const [r,g,b] = colorAt(ratio)
      const fs = 12 + 6 * ratio; const bi = blends[i]
      const pulse = bi * (0.5 + 0.5 * Math.sin(idleAngle * 2.5 + i * 0.4))
      const alpha = 0.5 + ratio * 0.45 + pulse * 0.05
      const idleRot = idleAngle + (i/len) * Math.PI*2 + Math.PI/2
      const rot = idleRot * eio(bi)
      ctx.save(); ctx.translate(chain[i].x, chain[i].y); ctx.rotate(rot)
      if (i < 3) { ctx.shadowColor = `rgba(${r},${g},${b},${0.5 * ratio})`; ctx.shadowBlur = 8 + ratio * 8 }
      ctx.font = `bold ${fs}px ui-sans-serif,system-ui,sans-serif`
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(text[i] || '', 0, 0); ctx.restore()
    }

    // ── IDLE ORBITS — icon shapes (heart, star, lightning, etc) ──────────────────
    if (blend > 0.05) {
      const opa = Math.min(1, blend * 2)

      // Helper: draw heart
      const drawHeart = (ctx, x, y, size) => {
        ctx.beginPath()
        ctx.moveTo(x, y + size * 0.3)
        ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.3)
        ctx.bezierCurveTo(x - size, y + size * 0.65, x, y + size, x, y + size)
        ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.65, x + size, y + size * 0.3)
        ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3)
        ctx.closePath()
      }

      // Helper: draw star
      const drawStar = (ctx, x, y, size, points = 5) => {
        ctx.beginPath()
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? size : size * 0.4
          const a = (i * Math.PI) / points - Math.PI / 2
          i === 0 ? ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
                  : ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a))
        }
        ctx.closePath()
      }

      // Helper: draw lightning bolt
      const drawLightning = (ctx, x, y, size) => {
        ctx.beginPath()
        ctx.moveTo(x + size * 0.3, y - size)
        ctx.lineTo(x - size * 0.1, y)
        ctx.lineTo(x + size * 0.2, y)
        ctx.lineTo(x - size * 0.3, y + size)
        ctx.lineTo(x + size * 0.1, y + size * 0.1)
        ctx.lineTo(x - size * 0.1, y + size * 0.1)
        ctx.closePath()
      }

      // Helper: draw circle ring
      const drawRing = (ctx, x, y, size) => {
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
      }

      // Orbit 1 — dalam, cepat — hearts emerald
      const r1 = 38 + Math.sin(idleAngle * 2) * 3
      const ICONS1 = ['heart','heart','star','heart','star']
      const COLORS1 = ['#10b981','#34d399','#6ee7b7','#059669','#047857']
      ICONS1.forEach((type, i) => {
        const a = idleAngle * 1.8 + (i / ICONS1.length) * Math.PI * 2
        const x = mx + Math.cos(a) * r1
        const y = my + Math.sin(a) * r1
        const sz = 5 + 2 * Math.sin(idleAngle * 3 + i)
        const rot = idleAngle * 1.5 + i
        ctx.save()
        ctx.globalAlpha = opa * (0.7 + 0.3 * Math.sin(idleAngle * 2 + i))
        ctx.translate(x, y); ctx.rotate(rot)
        ctx.fillStyle = COLORS1[i]
        ctx.shadowColor = COLORS1[i]; ctx.shadowBlur = 8
        if (type === 'heart') drawHeart(ctx, 0, -sz * 0.5, sz * 0.6)
        else drawStar(ctx, 0, 0, sz)
        ctx.fill()
        ctx.restore()
      })

      // Orbit 2 — tengah, berlawanan — stars + lightning indigo
      const r2 = 62 + Math.sin(idleAngle * 1.3) * 5
      const ICONS2 = ['star','lightning','star','lightning','star']
      const COLORS2 = ['#6366f1','#818cf8','#a5b4fc','#4f46e5','#7c3aed']
      ICONS2.forEach((type, i) => {
        const a = -idleAngle * 1.2 + (i / ICONS2.length) * Math.PI * 2
        const x = mx + Math.cos(a) * r2
        const y = my + Math.sin(a) * r2
        const sz = 6 + 2 * Math.sin(idleAngle * 2.5 + i * 1.2)
        const rot = idleAngle * 2 + i
        ctx.save()
        ctx.globalAlpha = opa * (0.6 + 0.4 * Math.sin(idleAngle * 1.5 + i * 0.8))
        ctx.translate(x, y); ctx.rotate(rot)
        ctx.fillStyle = COLORS2[i]
        ctx.shadowColor = COLORS2[i]; ctx.shadowBlur = 10
        if (type === 'star') drawStar(ctx, 0, 0, sz)
        else drawLightning(ctx, 0, 0, sz * 0.7)
        ctx.fill()
        ctx.restore()
      })

      // Orbit 3 — luar, lambat — rings + hearts amber
      const r3 = 88 + Math.sin(idleAngle * 0.8) * 6
      const ICONS3 = ['ring','heart','ring','star','ring']
      const COLORS3 = ['#f59e0b','#fbbf24','#fcd34d','#d97706','#b45309']
      ICONS3.forEach((type, i) => {
        const a = idleAngle * 0.7 + (i / ICONS3.length) * Math.PI * 2
        const x = mx + Math.cos(a) * r3
        const y = my + Math.sin(a) * r3
        const sz = 6 + 2 * Math.sin(idleAngle * 1.8 + i * 1.5)
        const rot = a * 0.5 + idleAngle
        ctx.save()
        ctx.globalAlpha = opa * (0.5 + 0.3 * Math.sin(idleAngle + i * 0.6))
        ctx.translate(x, y); ctx.rotate(rot)
        ctx.fillStyle = COLORS3[i]
        ctx.strokeStyle = COLORS3[i]
        ctx.shadowColor = COLORS3[i]; ctx.shadowBlur = 8
        if (type === 'ring') {
          drawRing(ctx, 0, 0, sz)
          ctx.lineWidth = 2; ctx.stroke()
        } else if (type === 'heart') {
          drawHeart(ctx, 0, -sz * 0.5, sz * 0.6); ctx.fill()
        } else {
          drawStar(ctx, 0, 0, sz); ctx.fill()
        }
        ctx.restore()
      })

      // Glow ring
      ctx.save()
      ctx.globalAlpha = opa * 0.12
      const gRing = ctx.createRadialGradient(mx, my, 30, mx, my, 100)
      gRing.addColorStop(0, 'rgba(16,185,129,0.4)')
      gRing.addColorStop(0.5, 'rgba(99,102,241,0.2)')
      gRing.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(mx, my, 100, 0, Math.PI * 2)
      ctx.fillStyle = gRing; ctx.fill()
      ctx.restore()
    }

    renderLogo(ctx, mx, my, dataRef.current.logo, idleAngle, blend)
    }

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf); clearTimeout(idleTimer)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, []) // eslint-disable-line

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
        opacity: isTouch() ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    />
  )
}

function renderLogo(ctx, x, y, img, angle, blend) {
  const R = 14, pulse = 0.5 + 0.5 * Math.sin(angle * 3)
  const eb = blend < 0.5 ? 2*blend*blend : 1 - (-2*blend+2)**2/2
  const g = ctx.createRadialGradient(x, y, 0, x, y, R + 14 + pulse*4)
  g.addColorStop(0,   `rgba(16,185,129,${0.22 + pulse*0.1})`)
  g.addColorStop(0.5, `rgba(99,102,241,0.06)`)
  g.addColorStop(1,   'rgba(0,0,0,0)')
  ctx.beginPath(); ctx.arc(x, y, R + 14 + pulse*4, 0, Math.PI*2); ctx.fillStyle = g; ctx.fill()
  if (eb > 0.05) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle * 2.2); ctx.globalAlpha = eb * 0.6
    ctx.beginPath(); ctx.arc(0, 0, R+5, 0, Math.PI*2)
    ctx.setLineDash([3,6]); ctx.strokeStyle = 'rgba(99,102,241,0.85)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]); ctx.restore()
    ctx.save(); ctx.translate(x, y); ctx.rotate(-angle * 1.5); ctx.globalAlpha = eb * 0.3
    ctx.beginPath(); ctx.arc(0, 0, R+10, 0, Math.PI*2)
    ctx.setLineDash([2,8]); ctx.strokeStyle = 'rgba(16,185,129,0.8)'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]); ctx.restore()
  }
  if (img) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI*2); ctx.clip()
    ctx.drawImage(img, x-R, y-R, R*2, R*2); ctx.restore()
    ctx.beginPath(); ctx.arc(x, y, R+1.5, 0, Math.PI*2)
    ctx.strokeStyle = `rgba(99,102,241,${0.5 + pulse*0.3})`; ctx.lineWidth = 2; ctx.stroke()
  } else {
    ctx.beginPath(); ctx.arc(x, y, 5 + pulse*2, 0, Math.PI*2)
    ctx.fillStyle = `rgba(16,185,129,${0.85 + pulse*0.15})`
    ctx.shadowColor = 'rgba(16,185,129,0.8)'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0
  }
}
