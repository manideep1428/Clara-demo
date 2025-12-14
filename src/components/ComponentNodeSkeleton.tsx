import { motion } from 'framer-motion'

export function ComponentNodeSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="absolute"
      style={{
        left: `${(index % 3) * 450 + 100}px`,
        top: `${Math.floor(index / 3) * 300 + 100}px`,
        width: '400px',
      }}
    >
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-slate-700/50 rounded animate-pulse w-32" />
          <div className="w-8 h-8 bg-slate-800/60 rounded-lg animate-pulse" />
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="h-4 bg-slate-700/50 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-700/50 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-slate-700/50 rounded animate-pulse w-4/6" />
        </div>
        
        <div className="h-32 bg-slate-800/60 rounded-lg animate-pulse" />
        
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <div className="h-3 bg-slate-700/50 rounded animate-pulse w-24" />
        </div>
      </div>
    </motion.div>
  )
}
