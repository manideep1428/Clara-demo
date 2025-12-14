import { X, FileIcon, ImageIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FileAttachment {
  id: string
  file: File
  preview?: string
}

interface FileAttachmentsProps {
  attachments: FileAttachment[]
  onRemove: (id: string) => void
}

export function FileAttachments({ attachments, onRemove }: FileAttachmentsProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <AnimatePresence>
      {attachments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-2 px-4 pb-3"
        >
          {attachments.map((attachment) => (
            <motion.div
              key={attachment.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative group"
            >
              <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
                {attachment.preview ? (
                  <img
                    src={attachment.preview}
                    alt={attachment.file.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : attachment.file.type.startsWith("image/") ? (
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                ) : (
                  <FileIcon className="w-5 h-5 text-slate-400" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-white truncate max-w-[120px]">
                    {attachment.file.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatFileSize(attachment.file.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(attachment.id)}
                  className="ml-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export type { FileAttachment }
