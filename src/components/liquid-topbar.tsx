import { motion } from "framer-motion"
import { LogOut, LayoutDashboard } from "lucide-react"
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react"
import { SignInButton } from "./SignInButton"
import { useNavigate } from "@tanstack/react-router"

export function LiquidGlassHeader() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="
        fixed top-6 left-1/2 -translate-x-1/2
        w-[92%] max-w-6xl
        backdrop-blur-2xl bg-white/5 border border-white/10
        shadow-[0_0_30px_rgba(255,255,255,0.08)]
        rounded-2xl px-6 py-3 flex items-center justify-between z-50
      "
    >
       <div className="flex items-center h-10">
         <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain"/>
       </div>

      <SignedOut>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm select-none">
            Sign in to save your work
          </span>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
            <SignInButton  />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <span className="text-slate-300 text-sm select-none">
            {user?.primaryEmailAddress?.emailAddress || user?.username || 'User'}
          </span>
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </SignedIn>
    </motion.header>
  )
}