import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUp, Loader, Paperclip } from "lucide-react"
import { PromptSuggestions } from "@/components/PromptSuggestions"
import { HeroHeading } from '@/components/hero-heading'
import { LiquidGlassHeader } from '@/components/liquid-topbar'
import { FileAttachments } from '@/components/FileAttachments'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useUser, useClerk } from '@clerk/clerk-react'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/')({
  component: Dashboard,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      prompt: (search.prompt as string) || '',
    }
  },
})

interface FileAttachment {
  id: string
  file: File
  preview?: string
}

export default function Dashboard() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { user } = useUser()
  const { openSignIn } = useClerk()

  const createDesignMutation = useConvexMutation(api.designs.createDesign)



  const handleSuggestionClick = async (text: string) => {
    setIsTyping(true)
    setPrompt("")
    for (let i = 0; i <= text.length; i++) {
      await new Promise((r) => setTimeout(r, 5))
      setPrompt(text.slice(0, i))
    }
    setIsTyping(false)
  }

  const createStreamingProject = async (promptText: string) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // Generate UUID for the project
      const projectId = crypto.randomUUID()

      // Create initial design record
      await createDesignMutation({
        designId: projectId,
        userId: user.id,
        name: promptText.slice(0, 50) + (promptText.length > 50 ? '...' : ''),
        nodes: JSON.stringify([]),
      })

      // Redirect to design page with prompt in state
      navigate({
        to: `/design/${projectId}`,
        // @ts-ignore
        state: { prompt: promptText }
      })

    } catch (err) {
      console.error("Error creating project:", err)
      setError("Unable to create project. Please try again.")
      setIsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!prompt.trim()) return

    if (!user) {
      localStorage.setItem("pendingPrompt", prompt)
      openSignIn({ appearance: { layout: { socialButtonsPlacement: "bottom" } } })
      return
    }

    await createStreamingProject(prompt)
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const maxFiles = 5
    const newFiles = Array.from(files).slice(0, maxFiles - attachments.length)
    const newAttachments: FileAttachment[] = newFiles.map((file) => {
      const attachment: FileAttachment = {
        id: Math.random().toString(36).substring(7),
        file,
      }

      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setAttachments((prev) =>
            prev.map((a) => (a.id === attachment.id ? { ...a, preview: e.target?.result as string } : a))
          )
        }
        reader.readAsDataURL(file)
      }

      return attachment
    })

    setAttachments((prev) => [...prev, ...newAttachments].slice(0, maxFiles))
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <div
        className="relative z-10 flex flex-col min-h-screen"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 20%, #3f0f5c 40%, #5f1a3d 60%, #6b2d4d 80%, #4a2c3e 100%)" }}
      >
        <div className="flex-1 flex flex-col items-center justify-start pt-40 px-4">
          <LiquidGlassHeader />
          <HeroHeading />

          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-2xl mb-6 relative flex justify-center">
              <motion.div
                className="absolute inset-0 rounded-[32px] blur-3xl opacity-50"
                animate={{
                  background: isLoading
                    ? "radial-gradient(ellipse 600px 400px at center, rgba(139,92,246,.4), rgba(59,130,246,.2), transparent 70%)"
                    : isTyping
                      ? "radial-gradient(ellipse 600px 400px at center, rgba(59,130,246,.3), transparent 70%)"
                      : "radial-gradient(ellipse 600px 400px at center, rgba(100,116,139,.2), transparent 70%)"
                }}
                transition={{ duration: 0.6 }}
              />

              <motion.div
                className="relative bg-black/80 backdrop-blur-xl rounded-[32px] border shadow-2xl overflow-hidden w-full"
                animate={{
                  borderColor: isLoading
                    ? "rgb(139 92 246 / 0.8)"
                    : isTyping
                      ? "rgb(59 130 246 / 0.6)"
                      : isDragging
                        ? "rgb(139 92 246 / 0.6)"
                        : "rgb(71 85 105 / 0.5)"
                }}
                transition={{ duration: 0.3 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ScrollArea className="max-h-[300px]">
                  <div className="p-4">
                    <Textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => !isTyping && !isLoading && setPrompt(e.target.value)}
                      placeholder={
                        isLoading
                          ? "Creating your design..."
                          : isTyping
                            ? "Filling in your prompt..."
                            : isDragging
                              ? "Drop files here..."
                              : "Ask Lovable to create a"
                      }
                      disabled={isTyping || isLoading}
                      className="w-full bg-transparent border-none text-white placeholder:text-slate-500 text-base py-2 resize-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px]"
                      style={{ lineHeight: "1.5" }}
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !isTyping && !isLoading) {
                          e.preventDefault()
                          handleCreateProject()
                        }
                      }}
                    />
                  </div>
                </ScrollArea>

                <FileAttachments attachments={attachments} onRemove={removeAttachment} />

                <div className="flex items-center justify-between px-4 pb-4">
                  <div className="flex items-center gap-2 border-2 rounded-2xl">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || isTyping || attachments.length >= 5}
                      className="h-8 px-3 rounded-md text-sm flex items-center gap-2 transition-colors disabled:opacity-50 text-slate-400 hover:text-white hover:bg-slate-800 hover:cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4" />
                      Attach
                    </button>
                  </div>

                  <button
                    onClick={handleCreateProject}
                    disabled={!prompt.trim() || isTyping || isLoading}
                    className="h-10 w-10 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            </div>

            <div className="w-full max-w-2xl flex justify-center mt-2">
              <div className="w-full">
                <PromptSuggestions onSuggestionClick={handleSuggestionClick} />
              </div>
            </div>
          </div>



          {prompt.trim() && !isLoading && (
            <p className="text-slate-400 text-sm text-center mt-4">Press Enter or click to create</p>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg max-w-2xl"
            >
              <p className="text-red-400 text-sm text-center">{error}</p>
            </motion.div>
          )}

          {/* Dev Test Link */}
          <div className="mt-8">
            <a
              href="/test-live"
              className="text-slate-400 hover:text-slate-300 text-xs underline"
            >
              🧪 Test Live Rendering
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
