import { useEffect, useRef } from 'react'
import { usePengaturanStore } from '../stores/pengaturanStore'

export default function CustomCursor() {
  const { pengaturan } = usePengaturanStore()
  const canvasRef = useRef(null)
  const dataRef   = useRef({
    text: 'Welcome',
    logo: null,
    logoLoaded: false,
  })

  // Update text
  useEffect(() => {
    const nama = pengaturan?.nama_sekolah || 'Sistem Absensi'
    dataRef.current.text = `Welcome, ${nama}`
  }, [pengaturan?.nama_sekolah])

  // Load logo
  useEffect(() => {
    const src = pengaturan?.logo_sekolah
    if (!src) return
    const img = new Image()
    img.src = src
    img.onload = () => {
      dataRef.current.logo = img
      dataRef.current.logoLoaded = true
    }
  }, [pengaturan?.logo_sekolah])

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Resize canvas
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ── State ──────────────────────────────────────────────────────────────
    let mx = -999, my = -999
    let isIdle    = false
    let idleTimer = null
    let idleAngle = 0
    let blend     = 0      // 0 = snake, 1 = circle — master blend
    let blends    = []     // per-segment blend, staggered
    let raf       = null
    let prevT     = 0

    // Chain: array of {x, y} — satu per karakter
    let chain = []

    const initChain = (x, y) => {
      const text = dataRef.current.text
      chain  = Array.from({ length: text.length }, () => ({ x, y }))
      blends = Array(text.length).fill(0)
    }

    // ── Events ─────────────────────────────────────────────────────────────
    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      canvas.style.opacity = '1'

      if (chain.length === 0) initChain(mx, my)

      isIdle = false
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => { isIdle = true }, 500)
    }
    const onLeave = () => {
      canvas.style.opacity = '0'
      isIdle = false
      clearTimeout(idleTimer)
    }
    const onEnter = () => { canvas.style.opacity = '1' }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    // ── Helpers ────────────────────────────────────────────────────────────
    const lerp = (a, b, t) => a + (b - a) * t
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
    const eio = t => t < 0.5 ? 2*t*t : 1 - (-2*t+2)**2/2

    const colorAt = (ratio) => {
      // indigo → emerald
      const r = Math.round(99  + (16  - 99)  * ratio)
      const g = Math.round(102 + (185 - 102) * ratio)
      const b = Math.round(241 + (129 - 241) * ratio)
      return [r, g, b]
    }

    // ── Main loop ──────────────────────────────────────────────────────────
    const loop = (t) => {
      raf = requestAnimationFrame(loop)
      const dt = prevT ? clamp((t - prevT) / 16.67, 0.1, 3) : 1
      prevT = t

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const text = dataRef.current.text
      const len  = text.length
      if (len === 0 || chain.length === 0) return

      // Sync chain & blends length
      while (chain.length < len)  { chain.push({ x: mx, y: my }); blends.push(0) }
      while (chain.length > len)  { chain.pop(); blends.pop() }

      // Master blend — naik/turun cepat
      blend = lerp(blend, isIdle ? 1 : 0, clamp(0.05 * dt, 0, 0.2))
      idleAngle += 0.022 * dt

      // Per-segment blend — staggered: kepala duluan, ekor belakangan
      // Delay antar segmen: ~1.5 frame per segmen
      for (let i = 0; i < len; i++) {
        // Threshold: segmen i mulai bergerak setelah master blend > i/len * 0.6
        const threshold = (i / len) * 0.55
        const localTarget = isIdle
          ? clamp((blend - threshold) / (1 - threshold + 0.001), 0, 1)
          : 0
        // Naik lambat (smooth masuk lingkaran), turun cepat (langsung balik snake)
        const speed = isIdle
          ? clamp(0.06 * dt, 0, 0.2)   // lambat masuk
          : clamp(0.18 * dt, 0, 0.6)   // cepat keluar
        blends[i] = lerp(blends[i], localTarget, speed)
      }

      // ── Update posisi chain ──────────────────────────────────────────────

      if (blend < 0.99) {
        // SNAKE: logo (kepala, i=0) langsung ngejar mouse cepat
        // Setiap huruf berikutnya makin lambat — ekor paling lambat
        for (let i = 0; i < len; i++) {
          const target = i === 0
            ? { x: mx, y: my }          // kepala ngejar mouse
            : chain[i - 1]              // badan ngejar segmen depannya

          // Speed makin kecil ke belakang: kepala 0.25, ekor ~0.06
          const speed = clamp((0.25 - (i / len) * 0.19) * dt, 0.01, 0.9)
          chain[i].x = lerp(chain[i].x, target.x, speed)
          chain[i].y = lerp(chain[i].y, target.y, speed)
        }
      }

      if (blend > 0.01) {
        // CIRCLE: tiap segmen ditarik ke posisi lingkaran sesuai blend-nya sendiri
        const radius = 52 + Math.sin(idleAngle * 1.5) * 4
        for (let i = 0; i < len; i++) {
          if (blends[i] < 0.005) continue
          const a    = idleAngle + (i / len) * Math.PI * 2
          const tx   = mx + Math.cos(a) * radius
          const ty   = my + Math.sin(a) * radius
          const pull = clamp(blends[i] * 0.13 * dt, 0, 0.5)
          chain[i].x = lerp(chain[i].x, tx, pull)
          chain[i].y = lerp(chain[i].y, ty, pull)
        }
      }

      // ── Render ───────────────────────────────────────────────────────────

      // 1. Glow blur (di belakang)
      ctx.save()
      ctx.filter = 'blur(9px)'
      for (let i = len-1; i >= 0; i--) {
        const ratio = 1 - i/len
        const [r,g,b] = colorAt(ratio)
        ctx.beginPath()
        ctx.arc(chain[i].x, chain[i].y, 3 + ratio*9, 0, Math.PI*2)
        ctx.fillStyle = `rgba(${r},${g},${b},${0.04 + ratio*0.07})`
        ctx.fill()
      }
      ctx.restore()

      // 2. Spine line saat snake
      if (blend < 0.8) {
        ctx.save()
        ctx.globalAlpha = (1 - blend) * 0.18
        ctx.beginPath()
        ctx.moveTo(chain[0].x, chain[0].y)
        for (let i = 1; i < len; i++) {
          const cx = (chain[i].x + chain[i-1].x) / 2
          const cy = (chain[i].y + chain[i-1].y) / 2
          ctx.quadraticCurveTo(chain[i-1].x, chain[i-1].y, cx, cy)
        }
        const lg = ctx.createLinearGradient(chain[0].x, chain[0].y, chain[len-1].x, chain[len-1].y)
        lg.addColorStop(0, 'rgba(16,185,129,0.9)')
        lg.addColorStop(1, 'rgba(99,102,241,0.15)')
        ctx.strokeStyle = lg
        ctx.lineWidth   = 1.5
        ctx.stroke()
        ctx.restore()
      }

      // 3. Huruf — chain[0] = 'W' (huruf pertama), logo di mx/my terpisah
      for (let i = len-1; i >= 0; i--) {
        const ratio = 1 - i/len
        const [r,g,b] = colorAt(ratio)
        const fs    = 12 + 6 * ratio
        const bi    = blends[i]  // blend individual segmen ini
        const pulse = bi * (0.5 + 0.5 * Math.sin(idleAngle * 2.5 + i * 0.4))
        const alpha = 0.5 + ratio * 0.45 + pulse * 0.05

        // Rotasi: tegak saat snake, tangensial saat idle — pakai blend per-segmen
        const idleRot = idleAngle + (i/len) * Math.PI*2 + Math.PI/2
        const rot     = idleRot * eio(bi)

        ctx.save()
        ctx.translate(chain[i].x, chain[i].y)
        ctx.rotate(rot)
        if (i < 3) {
          ctx.shadowColor = `rgba(${r},${g},${b},${0.5 * ratio})`
          ctx.shadowBlur  = 8 + ratio * 8
        }
        ctx.font         = `bold ${fs}px ui-sans-serif,system-ui,sans-serif`
        ctx.fillStyle    = `rgba(${r},${g},${b},${alpha})`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text[i] || '', 0, 0)
        ctx.restore()
      }

      // 4. Logo — selalu di posisi mouse (kepala saat snake, tengah saat idle)
      renderLogo(ctx, mx, my, dataRef.current.logo, idleAngle, blend)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(idleTimer)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, []) // eslint-disable-line

  if (!window.matchMedia('(pointer: fine)').matches) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
        opacity: 0,
        transition: 'opacity 0.4s ease',
      }}
    />
  )
}

function renderLogo(ctx, x, y, img, angle, blend) {
  const R     = 14
  const pulse = 0.5 + 0.5 * Math.sin(angle * 3)
  const eb    = blend < 0.5 ? 2*blend*blend : 1 - (-2*blend+2)**2/2

  // Glow
  const g = ctx.createRadialGradient(x, y, 0, x, y, R + 14 + pulse*4)
  g.addColorStop(0,   `rgba(16,185,129,${0.22 + pulse*0.1})`)
  g.addColorStop(0.5, `rgba(99,102,241,0.06)`)
  g.addColorStop(1,   'rgba(0,0,0,0)')
  ctx.beginPath(); ctx.arc(x, y, R + 14 + pulse*4, 0, Math.PI*2)
  ctx.fillStyle = g; ctx.fill()

  // Dashed rings saat idle
  if (eb > 0.05) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle * 2.2)
    ctx.globalAlpha = eb * 0.6
    ctx.beginPath(); ctx.arc(0, 0, R+5, 0, Math.PI*2)
    ctx.setLineDash([3,6]); ctx.strokeStyle = 'rgba(99,102,241,0.85)'
    ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([])
    ctx.restore()

    ctx.save(); ctx.translate(x, y); ctx.rotate(-angle * 1.5)
    ctx.globalAlpha = eb * 0.3
    ctx.beginPath(); ctx.arc(0, 0, R+10, 0, Math.PI*2)
    ctx.setLineDash([2,8]); ctx.strokeStyle = 'rgba(16,185,129,0.8)'
    ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([])
    ctx.restore()
  }

  // Logo image
  if (img) {
    ctx.save()
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI*2); ctx.clip()
    ctx.drawImage(img, x-R, y-R, R*2, R*2)
    ctx.restore()
    ctx.beginPath(); ctx.arc(x, y, R+1.5, 0, Math.PI*2)
    ctx.strokeStyle = `rgba(99,102,241,${0.5 + pulse*0.3})`
    ctx.lineWidth = 2; ctx.stroke()
  } else {
    ctx.beginPath(); ctx.arc(x, y, 5 + pulse*2, 0, Math.PI*2)
    ctx.fillStyle   = `rgba(16,185,129,${0.85 + pulse*0.15})`
    ctx.shadowColor = 'rgba(16,185,129,0.8)'; ctx.shadowBlur = 12
    ctx.fill(); ctx.shadowBlur = 0
  }
}
