import { useEffect, useRef } from 'react'

const COLORS = [
  '#10b981', '#6366f1', '#f59e0b', '#ec4899',
  '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316',
]

/**
 * Confetti burst — muncul sekali lalu hilang
 * Trigger dengan prop `active={true}`
 * 
 * Usage:
 *   const [confetti, setConfetti] = useState(false)
 *   <Confetti active={confetti} onDone={() => setConfetti(false)} />
 *   setConfetti(true)  // trigger
 */
export default function Confetti({ active, onDone, count = 80, originX, originY }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    // Origin: tengah layar atau posisi custom
    const ox = originX ?? window.innerWidth  / 2
    const oy = originY ?? window.innerHeight / 2

    // Buat partikel
    const particles = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 4 + Math.random() * 8
      return {
        x: ox, y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,  // sedikit ke atas
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        life: 1,
        decay: 0.012 + Math.random() * 0.01,
      }
    })

    let done = false
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let alive = 0
      for (const p of particles) {
        if (p.life <= 0) continue
        alive++

        p.x  += p.vx
        p.y  += p.vy
        p.vy += 0.25  // gravity
        p.vx *= 0.99  // air resistance
        p.rotation += p.rotSpeed
        p.life -= p.decay

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      if (alive > 0) {
        rafRef.current = requestAnimationFrame(loop)
      } else if (!done) {
        done = true
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onDone?.()
      }
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active]) // eslint-disable-line

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[99998]"
    />
  )
}
