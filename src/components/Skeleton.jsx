// Skeleton loading components — shimmer effect
export function SkeletonBox({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]
        bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"/>
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          className={`h-3 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-10 h-10 rounded-xl flex-shrink-0"/>
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-3 w-1/2"/>
          <SkeletonBox className="h-2 w-1/3"/>
        </div>
      </div>
      <SkeletonBox className="h-8 w-1/3"/>
      <SkeletonText lines={2}/>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-700">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox key={i} className="h-3 flex-1"/>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-5 py-3.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBox key={c} className={`h-3 flex-1 ${c === 0 ? 'w-8 flex-none' : ''}`}/>
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonStatCards({ count = 4, className = '' }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <SkeletonBox className="h-3 w-20"/>
            <SkeletonBox className="w-8 h-8 rounded-xl"/>
          </div>
          <SkeletonBox className="h-7 w-16 mb-2"/>
          <SkeletonBox className="h-2 w-24"/>
        </div>
      ))}
    </div>
  )
}
