import { useState, useRef, useEffect } from 'react'
import { X, Maximize2, Minimize2, RotateCcw, Smartphone, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HTMLPreviewProps {
  htmlContent: string
  onClose: () => void
  title?: string
}

export function HTMLPreview({ htmlContent, onClose, title = "HTML Preview" }: HTMLPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(htmlContent)
        doc.close()
      }
    }
  }, [htmlContent])

  const handleRefresh = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(htmlContent)
        doc.close()
      }
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm ${isFullscreen ? '' : 'p-4'}`}>
      <div className={`bg-card border border-border rounded-lg shadow-lg overflow-hidden ${
        isFullscreen ? 'h-full' : 'h-[80vh] max-w-6xl mx-auto'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">{title}</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('desktop')}
                className={`h-6 px-2 text-xs ${viewMode === 'desktop' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <Monitor className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('mobile')}
                className={`h-6 px-2 text-xs ${viewMode === 'mobile' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <Smartphone className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-6 px-2"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="h-6 px-2"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-6 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 overflow-hidden">
          <div className={`mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden ${
            viewMode === 'mobile' 
              ? 'max-w-sm h-full' 
              : 'w-full h-full'
          }`}>
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="HTML Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
