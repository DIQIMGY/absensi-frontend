import { useEffect } from 'react'
import { usePengaturanStore } from '../stores/pengaturanStore'

export default function PengaturanProvider({ children }) {
  const { fetchPengaturan } = usePengaturanStore()

  useEffect(() => {
    // Fetch pengaturan saat app pertama kali load
    fetchPengaturan()
  }, [fetchPengaturan])

  return children
}
