import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Gift, RefreshCw, Lock } from 'lucide-react'
import { siswaApi } from '../services/siswaService'
import toast from 'react-hot-toast'

// ── Rarity config ──────────────────────────────────────────────
export const RARITY_CFG = {
  legendary: { label: 'Legendary', text: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/50', glow: 'shadow-yellow-400/40' },
  epic:      { label: 'Epic',      text: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400/50', glow: 'shadow-purple-400/40' },
  rare:      { label: 'Rare',      text: 'text-blue-400',   bg: 'bg-blue-400/20',   border: 'border-blue-400/50',   glow: 'shadow-blue-400/40'   },
  uncommon:  { label: 'Uncommon',  text: 'text-green-400',  bg: 'bg-green-400/20',  border: 'border-green-400/50',  glow: 'shadow-green-400/40'  },
  common:    { label: 'Common',    text: 'text-slate-400',  bg: 'bg-slate-400/20',  border: 'border-slate-400/50',  glow: 'shadow-slate-400/20'  },
}

// ── Badge pool ─────────────────────────────────────────────────
export const BADGE_POOL = [
  { id: 'bintang_emas',   name: 'Bintang Emas',   emoji: '⭐', rarity: 'legendary' },
  { id: 'mahkota',        name: 'Mahkota',         emoji: '👑', rarity: 'legendary' },
  { id: 'berlian',        name: 'Berlian',         emoji: '💎', rarity: 'epic'      },
  { id: 'petir',          name: 'Petir',           emoji: '⚡', rarity: 'epic'      },
  { id: 'api',            name: 'Api',             emoji: '🔥', rarity: 'rare'      },
  { id: 'pelangi',        name: 'Pelangi',         emoji: '🌈', rarity: 'rare'      },
  { id: 'roket',          name: 'Roket',           emoji: '🚀', rarity: 'uncommon'  },
  { id: 'daun',           name: 'Daun',            emoji: '🍀', rarity: 'uncommon'  },
  { id: 'buku',           name: 'Buku',            emoji: '📚', rarity: 'common'    },
  { id: 'pensil',         name: 'Pensil',          emoji: '✏️', rarity: 'common'    },
]

// ── BadgeOverlay ───────────────────────────────────────────────
export function BadgeOverlay({ badgeId, badges = [], size = 'md' }) {
  const badge = badges.find(b => b.id === badgeId) || BADGE_POOL.find(b => b.id === badgeId)
  if (!badge) return null

  const sizeMap = { sm: 'w-5 h-5 text-[10px]', md: 'w-6 h-6 text-xs', lg: 'w-8 h-8 text-sm' }
  const posMap  = { sm: '-bottom-0.5 -right-0.5', md: '-bottom-1 -right-1', lg: '-bottom-1 -right-1' }
  const cfg = RARITY_CFG[badge.rarity] || RARITY_CFG.common

  return (
    <div className={`absolute ${posMap[size]} ${sizeMap[size]} rounded-full flex items-center justify-center
      border-2 border-white/60 shadow-lg ${cfg.bg} ${cfg.glow} z-10`}
      title={`${badge.name} · ${cfg.label}`}>
      <span>{badge.emoji}</span>
    </div>
  )
}

// ── GachaHarian (default export) ───────────────────────────────
export default function GachaHarian({ onBadgeChange }) {
  const [status, setStatus]     = useState(null)   // { can_roll, next_roll_at, active_badge, badges }
  const [rolling, setRolling]   = useState(false)
  const [result, setResult]     = useState(null)    // badge yang baru didapat
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(() => { fetchStatus() }, [])

  const fetchStatus = async () => {
    try {
      const res = await siswaApi.getGachaStatus()
      setStatus(res.data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const handleRoll = async () => {
    if (rolling || !status?.can_roll) return
    setRolling(true)
    try {
      const res = await siswaApi.rollGacha()
      const badge = res.data.badge
      setResult(badge)
      setShowResult(true)
      await fetchStatus()
      onBadgeChange?.(res.data.active_badge, res.data.badges)
      toast.success(`Dapat badge ${badge?.name || ''}!`, { icon: badge?.emoji || '🎉' })
    } catch (e) {
      const msg = e.response?.data?.message || 'Gagal roll gacha'
      toast.error(msg)
    } finally { setRolling(false) }
  }

  if (loading) return null

  const cfg = result ? (RARITY_CFG[result.rarity] || RARITY_CFG.common) : null
  const canRoll = status?.can_roll

  // Format waktu berikutnya
  let nextLabel = ''
  if (!canRoll && status?.next_roll_at) {
    try {
      const d = new Date(status.next_roll_at)
      nextLabel = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    } catch { nextLabel = 'besok' }
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20">
          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
            <Gift size={14} className="text-violet-600 dark:text-violet-400" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Gacha Harian</p>
          <span className="ml-auto text-[10px] text-slate-400">1x per hari</span>
        </div>

        <div className="p-5">
          {/* Badge koleksi */}
          {status?.badges?.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Koleksi Badge</p>
              <div className="flex flex-wrap gap-2">
                {status.badges.map(badge => {
                  const bcfg = RARITY_CFG[badge.rarity] || RARITY_CFG.common
                  const isActive = status.active_badge === badge.id
                  return (
                    <button
                      key={badge.id}
                      onClick={async () => {
                        try {
                          if (isActive) {
                            await siswaApi.unequipBadge()
                            onBadgeChange?.(null, status.badges)
                            toast.success('Badge dilepas')
                          } else {
                            await siswaApi.equipBadge(badge.id)
                            onBadgeChange?.(badge.id, status.badges)
                            toast.success('Badge terpasang!')
                          }
                          await fetchStatus()
                        } catch { toast.error('Gagal') }
                      }}
                      title={`${badge.name} · ${bcfg.label}${isActive ? ' (aktif)' : ''}`}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isActive
                          ? `${bcfg.bg} ${bcfg.border} text-slate-800 dark:text-slate-100`
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{badge.emoji}</span>
                      <span className="hidden sm:inline">{badge.name}</span>
                      <span className={`text-[9px] font-bold ${bcfg.text}`}>{bcfg.label}</span>
                      {isActive && <span className="text-[9px] text-emerald-500">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Roll button */}
          <button
            onClick={handleRoll}
            disabled={!canRoll || rolling}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
              ${canRoll
                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
          >
            {rolling
              ? <><RefreshCw size={14} className="animate-spin" /> Rolling...</>
              : canRoll
                ? <><Sparkles size={14} /> Roll Gacha Sekarang</>
                : <><Lock size={14} /> Tersedia pukul {nextLabel}</>
            }
          </button>
        </div>
      </div>

      {/* Result modal */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className={`relative flex flex-col items-center gap-4 p-8 rounded-3xl border-2 shadow-2xl
                bg-white dark:bg-slate-900 ${cfg?.border} ${cfg?.glow} max-w-xs w-full mx-4`}
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="text-6xl"
              >
                {result.emoji}
              </motion.div>
              <div className="text-center">
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${cfg?.text}`}>{cfg?.label}</p>
                <p className="text-xl font-black text-slate-800 dark:text-slate-100">{result.name}</p>
              </div>
              <button
                onClick={() => setShowResult(false)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold shadow"
              >
                Keren!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
