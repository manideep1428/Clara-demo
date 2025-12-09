import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { useConvexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { LiquidGlassHeader } from '@/components/liquid-topbar'
import { Plus, FileText, Clock } from 'lucide-react'
import { ProjectCardSkeleton } from '@/components/ProjectCardSkeleton'

function formatTimeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(months / 12)
  return `${years}y ago`
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()

  const designs = useConvexQuery(
    api.designs.getUserDesigns,
    user?.id ? { userId: user.id } : 'skip'
  )
  
  const isLoading = designs === undefined

  if (!isLoaded) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 20%, #3f0f5c 40%, #5f1a3d 60%, #6b2d4d 80%, #4a2c3e 100%)" }}
      >
        <LiquidGlassHeader />
        <div className="pt-32 px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="h-10 bg-slate-700/50 rounded animate-pulse w-64 mb-2" />
                <div className="h-5 bg-slate-700/50 rounded animate-pulse w-48" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ProjectCardSkeleton key={i} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    navigate({ to: '/', search: { prompt: '' } })
    return null
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 20%, #3f0f5c 40%, #5f1a3d 60%, #6b2d4d 80%, #4a2c3e 100%)" }}
    >
      <LiquidGlassHeader />
      
      <div className="pt-32 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Projects</h1>
              <p className="text-slate-400">Manage and view all your designs</p>
            </div>
            <button
              onClick={() => navigate({ to: '/', search: { prompt: '' } })}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ProjectCardSkeleton key={i} index={i} />
              ))}
            </div>
          ) : !designs || designs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">No projects yet</h2>
              <p className="text-slate-400 mb-6">Create your first project to get started</p>
              <button
                onClick={() => navigate({ to: '/', search: { prompt: '' } })}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl transition-all"
              >
                Create Project
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {designs.map((design: any, index: number) => (
                <motion.div
                  key={design._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate({ to: `/design/${design.designId}` })}
                  className="group relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-violet-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20">
                    <div className="flex items-center justify-between mb-5">
                      <div className="p-3 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-2xl border border-violet-400/30">
                        <FileText className="w-6 h-6 text-violet-300" />
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 rounded-full border border-slate-700/50">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-400 font-medium">{formatTimeAgo(design.updatedAt)}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-violet-200 transition-colors">
                      {design.name}
                    </h3>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-sm text-slate-400">{design.nodes.length} components</span>
                      </div>
                      <div className="flex items-center gap-2 text-violet-400 group-hover:text-violet-300 transition-colors font-medium">
                        <span className="text-sm">Open</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}