import { motion } from 'framer-motion'

export function ProjectCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative overflow-hidden"
    >
      <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 animate-pulse">
            <div className="w-6 h-6 bg-slate-700 rounded" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 rounded-full border border-slate-700/50">
            <div className="w-16 h-3 bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="h-5 bg-slate-700/50 rounded animate-pulse w-3/4" />
          <div className="h-5 bg-slate-700/50 rounded animate-pulse w-1/2" />
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
            <div className="w-20 h-3 bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="w-12 h-3 bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}
