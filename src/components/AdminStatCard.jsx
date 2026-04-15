/**
 * AdminStatCard — clean, consistent stat card untuk semua halaman admin
 * Menggantikan gradient dark cards yang norak
 */
import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer } from 'recharts'

const SPARK = [3, 5, 2, 7, 4, 6, 5]

export default function AdminStatCard({ label, value, icon: Icon, color = '#10b981', border, bg, tc, iconBg, delay = 0, subtitle, sparkType = 'bar' }) {
  const sparkData = SPARK.map(v => ({ v }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 130 }}
      className={`relative overflow-hidden bg-white dark:bg-slate-900 border ${border || 'border-slate-100 dark:border-slate-800'} rounded-2xl hover:shadow-md dark:hover:shadow-slate-900 transition-all group`}
    >
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg,${color},${color}55)` }}/>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg || 'bg-slate-100 dark:bg-slate-800'} group-hover:scale-105 transition-transform`}>
            <Icon size={15} style={{ color }}/>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{value ?? 0}</span>
        </div>
        <p className={`text-xs font-semibold mb-0.5 ${tc || 'text-slate-500 dark:text-slate-400'}`}>{label}</p>
        {subtitle && <p className="text-[10px] text-slate-400 mb-1">{subtitle}</p>}
        <div className="h-7 -mx-1 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            {sparkType === 'area' ? (
              <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`asc-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#asc-${label})`} dot={false}/>
              </AreaChart>
            ) : (
              <BarChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
                <Bar dataKey="v" fill={color} fillOpacity={0.45} radius={[2, 2, 0, 0]} maxBarSize={7}/>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
