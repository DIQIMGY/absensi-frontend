import { useEffect, useRef, useState } from 'react'

/**
 * Animasi angka naik dari 0 ke target
 * @param {number} target - nilai akhir
 * @param {object} options
 * @param {number} options.duration - durasi ms (default 1200)
 * @param {number} options.delay - delay sebelum mulai ms (default 0)
 * @param {boolean} options.enabled - aktifkan animasi (default true)
 */
export function useCountUp(target, { duration = 1200, delay = 0, enabled = true } = {}) {
  const [value, setValue] = useState(0)
  const rafRef  = useRef(null)
  const prevTarget = useRef(null)

  useEffect(() => {
    if (!enabled || target === undefined || target === null) return
    if (prevTarget.current === target) return
    prevTarget.current = target

    let startTime = null
    const from = 0
    const to   = Number(target) || 0

    const delayTimer = setTimeout(() => {
      const step = (ts) => {
        if (!startTime) startTime = ts
        const progress = Math.min((ts - startTime) / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(from + (to - from) * eased))
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step)
        } else {
          setValue(to)
        }
      }
      rafRef.current = requestAnimationFrame(step)
    }, delay)

    return () => {
      clearTimeout(delayTimer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, delay, enabled])

  return value
}

/**
 * Komponen wrapper — langsung render angka dengan animasi
 */
export function CountUp({ value, duration = 1200, delay = 0, className = '', suffix = '', prefix = '' }) {
  const animated = useCountUp(value, { duration, delay })
  return (
    <span className={className}>
      {prefix}{animated.toLocaleString('id-ID')}{suffix}
    </span>
  )
}
