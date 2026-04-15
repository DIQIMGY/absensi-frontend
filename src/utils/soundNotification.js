// Sound Notification Utility
// Pakai file audio manusia dari /sounds/, fallback ke Web Audio API tone

class SoundNotification {
  constructor() {
    this.audioContext = null
  }

  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    return this.audioContext
  }

  // Play file audio, fallback ke fn kalau gagal
  playAudio(filename, fallbackFn) {
    try {
      const audio = new Audio(`/sounds/${filename}`)
      audio.volume = 1.0
      const p = audio.play()
      if (p !== undefined) {
        p.catch(() => { if (fallbackFn) fallbackFn() })
      }
    } catch {
      if (fallbackFn) fallbackFn()
    }
  }

  playTone(frequency, duration, volume = 0.3, type = 'sine', startTime = null) {
    try {
      const ctx = this.initAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.value = frequency
      oscillator.type = type
      const start = startTime || ctx.currentTime
      gainNode.gain.setValueAtTime(0, start)
      gainNode.gain.linearRampToValueAtTime(volume, start + 0.01)
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, start + duration * 0.5)
      gainNode.gain.linearRampToValueAtTime(0, start + duration)
      oscillator.start(start)
      oscillator.stop(start + duration)
    } catch {}
  }

  // ── BERHASIL ABSEN ────────────────────────────────────────────────────────
  playSuccess() {
    this.playAudio('terlambat.mpeg', () => {
      const ctx = this.initAudioContext()
      const now = ctx.currentTime
      this.playTone(880, 0.08, 0.25, 'sine', now)
      this.playTone(1047, 0.15, 0.3, 'sine', now + 0.08)
    })
  }

  // ── TERLAMBAT ─────────────────────────────────────────────────────────────
  playLate() {
    this.playAudio('berhasil.mpeg', () => {
      const ctx = this.initAudioContext()
      const now = ctx.currentTime
      this.playTone(440, 0.1, 0.3, 'triangle', now)
      this.playTone(370, 0.15, 0.3, 'triangle', now + 0.1)
    })
  }

  // ── SUDAH ABSEN ───────────────────────────────────────────────────────────
  playAlreadyAbsen() {
    this.playAudio('sudahabsen.mpeg', () => {
      const ctx = this.initAudioContext()
      const now = ctx.currentTime
      this.playTone(600, 0.08, 0.2, 'square', now)
      this.playTone(500, 0.12, 0.2, 'square', now + 0.09)
    })
  }

  // ── WARNING (sistem tutup, belum buka, dll) ───────────────────────────────
  playWarning() {
    try {
      const ctx = this.initAudioContext()
      const now = ctx.currentTime
      this.playTone(800, 0.1, 0.3, 'square', now)
      this.playTone(600, 0.1, 0.3, 'square', now + 0.1)
      this.playTone(800, 0.12, 0.25, 'square', now + 0.2)
    } catch {}
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  playError() {
    try {
      const ctx = this.initAudioContext()
      const now = ctx.currentTime
      this.playTone(300, 0.15, 0.3, 'sawtooth', now)
      this.playTone(250, 0.2, 0.3, 'sawtooth', now + 0.15)
    } catch {}
  }

  // ── SCAN ──────────────────────────────────────────────────────────────────
  playScan() {
    try {
      const ctx = this.initAudioContext()
      const now = ctx.currentTime
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(400, now)
      oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.08)
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, now + 0.08)
      oscillator.start(now)
      oscillator.stop(now + 0.08)
    } catch {}
  }

  playClick() {
    try {
      const ctx = this.initAudioContext()
      const now = ctx.currentTime
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.type = 'sine'
      oscillator.frequency.value = 1000
      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03)
      oscillator.start(now)
      oscillator.stop(now + 0.03)
    } catch {}
  }

  playNotification() {
    try {
      const ctx = this.initAudioContext()
      const now = ctx.currentTime
      this.playTone(880, 0.1, 0.25, 'sine', now)
      this.playTone(1047, 0.15, 0.3, 'sine', now + 0.1)
    } catch {}
  }
}

export const soundNotification = new SoundNotification()

export const playSuccessSound      = () => soundNotification.playSuccess()
export const playErrorSound        = () => soundNotification.playError()
export const playWarningSound      = () => soundNotification.playWarning()
export const playScanSound         = () => soundNotification.playScan()
export const playLateSound         = () => soundNotification.playLate()
export const playClickSound        = () => soundNotification.playClick()
export const playNotificationSound = () => soundNotification.playNotification()
export const playAlreadyAbsenSound = () => soundNotification.playAlreadyAbsen()
