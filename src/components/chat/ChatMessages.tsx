import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, FileText, Smartphone, Check } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArtifactComponent } from './ArtifactComponent'
import { HTMLPreview } from './HTMLPreview'
import { useMessageParser } from '@/hooks/useMessageParser'
// import { useMutation } from 'convex/react'
// import { api } from '../../../convex/_generated/api'
import type { ParsedFile, ParsedArtifact } from '@/lib/parser'
import type { Message } from '@/types/chat'

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    analysis: true,
    actions: true
  })
  const [htmlPreview, setHtmlPreview] = useState<{ content: string; title: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Parse messages to extract Clara artifacts
  const parsedMessages = useMessageParser(messages)
  
  // const saveArtifact = useMutation(api.artifacts.saveArtifact)
  // const saveFile = useMutation(api.artifacts.saveFile)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handlePreviewHTML = (content: string, title: string = 'HTML Preview') => {
    setHtmlPreview({ content, title })
  }

  const handleSaveFile = async (file: ParsedFile) => {
    try {
      // TODO: Implement Convex file saving when artifacts module is ready
      console.log('Saving file:', file.path)
      // For now, just download the file
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.path
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }

  const handleSaveArtifact = async (artifact: ParsedArtifact) => {
    try {
      // TODO: Implement Convex artifact saving when artifacts module is ready
      console.log('Saving artifact:', artifact.id)
      // For now, download all files as a zip would be ideal, but let's just log
      artifact.files.forEach(file => {
        console.log(`File: ${file.path} (${file.language})`)
      })
    } catch (error) {
      console.error('Failed to save artifact:', error)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {Array(parsedMessages.length).fill(0).map((_, index) => (
          <div key={index} className="space-y-3">
            {/* Expandable Analysis Section */}
            {parsedMessages[index].hasAnalysis && (
              <div className="bg-sidebar-accent border border-sidebar-border rounded-lg">
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, analysis: !prev.analysis }))}
                  className="w-full flex items-center gap-2 p-3 text-left hover:bg-sidebar-accent/70 transition-colors"
                >
                  {expandedSections.analysis ? (
                    <ChevronDown className="h-4 w-4 text-sidebar-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-sidebar-primary" />
                  )}
                  <Check className="h-4 w-4 text-sidebar-primary" />
                  <span className="text-sidebar-accent-foreground font-medium text-sm">ANALYZED REQUEST</span>
                </button>
              </div>
            )}

            {/* Expandable Planned Actions Section */}
            {parsedMessages[index].hasPlannedActions && (
              <div className="bg-sidebar-accent border border-sidebar-border rounded-lg">
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, actions: !prev.actions }))}
                  className="w-full flex items-center gap-2 p-3 text-left hover:bg-sidebar-accent/70 transition-colors"
                >
                  {expandedSections.actions ? (
                    <ChevronDown className="h-4 w-4 text-sidebar-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-sidebar-primary" />
                  )}
                  <Check className="h-4 w-4 text-sidebar-primary" />
                  <span className="text-sidebar-accent-foreground font-medium text-sm">PLANNED ACTIONS</span>
                </button>
              </div>
            )}

            {/* Generated Screens */}
            {parsedMessages[index].screens && parsedMessages[index].screens.length > 0 && (
              <div className="space-y-2">
                {parsedMessages[index].screens.map((screen) => (
                  <div
                    key={screen.id}
                    className="bg-card border border-border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {screen.type === 'home' ? (
                        <FileText className="h-5 w-5 text-sidebar-primary" />
                      ) : (
                        <Smartphone className="h-5 w-5 text-sidebar-primary" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-card-foreground font-medium">{screen.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Check className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-500">Generated screen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Clara Artifacts */}
            {parsedMessages[index].artifacts && parsedMessages[index].artifacts.length > 0 && (
              <div className="space-y-2">
                {parsedMessages[index].artifacts.map((artifact, artifactIndex) => (
                  <ArtifactComponent
                    key={artifactIndex}
                    artifact={artifact}
                    onPreviewHTML={(content) => handlePreviewHTML(content, artifact.title)}
                    onSaveFile={handleSaveFile}
                    onSaveAll={handleSaveArtifact}
                  />
                ))}
              </div>
            )}

            {/* Message Content */}
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-card-foreground text-sm leading-relaxed">{parsedMessages[index].content}</p>
              
              {/* Display user uploaded images */}
              {parsedMessages[index].images && parsedMessages[index].images.length > 0 && (
                <div className="flex flex-col gap-2 mt-3">
                  {parsedMessages[index].images.map((imageUrl, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-border shadow-md max-w-[200px]">
                      <img 
                        src={imageUrl} 
                        alt={`Uploaded image ${idx + 1}`}
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-sidebar-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* HTML Preview Modal */}
      {htmlPreview && (
        <HTMLPreview
          htmlContent={htmlPreview.content}
          title={htmlPreview.title}
          onClose={() => setHtmlPreview(null)}
        />
      )}
    </ScrollArea>
  )
}
