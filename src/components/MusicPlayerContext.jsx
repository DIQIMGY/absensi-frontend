import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'
import { siswaApi } from '../services/siswaService'

const MusicPlayerContext = createContext(null)

export function MusicPlayerProvider({ children }) {
  const audioRef = useRef(null)
  const [musikData, setMusikData] = useState(null)   // { nama, artis, foto_url, audio_url }
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const { isAuthenticated, user } = useAuthStore()

  // Fetch data musik dari profil siswa
  const fetchMusik = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'siswa') return
    try {
      setIsLoading(true)
      const res = await siswaApi.getProfil()
      const d = res.data.data
      if (d?.musik_audio_url || d?.musik_nama) {
        setMusikData({
          nama: d.musik_nama || '',
          artis: d.musik_artis || '',
          foto_url: d.musik_foto_url || null,
          audio_url: d.musik_audio_url || null,
        })
      } else {
        setMusikData(null)
      }
    } catch { /* silent */ }
    finally {
      setIsLoading(false)
      setLoaded(true)
    }
  }, [isAuthenticated, user?.role])

  // Fetch saat pertama mount / login
  useEffect(() => {
    if (isAuthenticated && user?.role === 'siswa') {
      fetchMusik()
    } else {
      // Bukan siswa atau logout — stop & reset
      stopAndReset()
    }
  }, [isAuthenticated, user?.role])

  // Saat musik_data berubah (misal setelah edit di Profil), update audio src
  useEffect(() => {
    if (!audioRef.current) return
    if (musikData?.audio_url) {
      const wasPlaying = isPlaying
      audioRef.current.src = musikData.audio_url
      audioRef.current.load()
      if (wasPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false))
      }
    } else {
      audioRef.current.pause()
      audioRef.current.src = ''
      setIsPlaying(false)
    }
  }, [musikData?.audio_url])

  // Listen event dari Profil.jsx saat musik diupdate/dihapus
  useEffect(() => {
    const onMusikChanged = () => {
      fetchMusik()
    }
    const onMusikStop = () => {
      stopAndReset()
    }
    window.addEventListener('musik-changed', onMusikChanged)
    window.addEventListener('musik-stop', onMusikStop)
    return () => {
      window.removeEventListener('musik-changed', onMusikChanged)
      window.removeEventListener('musik-stop', onMusikStop)
    }
  }, [fetchMusik])

  const stopAndReset = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    setIsPlaying(false)
    setMusikData(null)
    setLoaded(false)
  }

  const toggle = async () => {
    if (!audioRef.current) return

    // Kalau belum pernah load, fetch dulu
    if (!loaded) {
      await fetchMusik()
      return
    }

    if (!musikData?.audio_url) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      // Set src kalau belum
      if (!audioRef.current.src || audioRef.current.src !== musikData.audio_url) {
        audioRef.current.src = musikData.audio_url
        audioRef.current.load()
      }
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch { setIsPlaying(false) }
    }
  }

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  return (
    <MusicPlayerContext.Provider value={{ musikData, isPlaying, isLoading, loaded, toggle, stop, fetchMusik }}>
      {/* Hidden audio element — persists across navigation */}
      <audio
        ref={audioRef}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error('useMusicPlayer must be used inside MusicPlayerProvider')
  return ctx
}
