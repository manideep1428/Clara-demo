import { useState } from 'react'
import { FileText, Eye, Download, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ParsedFile } from '@/lib/parser'

interface FileComponentProps {
  file: ParsedFile
  onPreview?: (content: string) => void
  onSave?: (file: ParsedFile) => void
}

export function FileComponent({ file, onPreview, onSave }: FileComponentProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(file.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePreview = () => {
    if (onPreview && file.language === 'html') {
      onPreview(file.content)
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave(file)
    }
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      html: 'text-orange-500',
      css: 'text-blue-500',
      javascript: 'text-yellow-500',
      typescript: 'text-blue-600',
      json: 'text-green-500',
      python: 'text-green-600',
      java: 'text-red-500',
      cpp: 'text-purple-500',
      go: 'text-cyan-500',
      rust: 'text-orange-600',
      php: 'text-indigo-500',
      ruby: 'text-red-600',
      markdown: 'text-gray-500',
    }
    return colors[language] || 'text-gray-400'
  }

  const formatFileSize = (content: string) => {
    const bytes = new Blob([content]).size
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* File Header */}
      <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{file.path}</span>
          <span className={`text-xs px-2 py-1 rounded-full bg-muted ${getLanguageColor(file.language)}`}>
            {file.language}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {file.content.split('\n').length} lines • {formatFileSize(file.content)}
          </span>
        </div>
      </div>

      {/* File Actions */}
      <div className="flex items-center gap-2 p-3 bg-muted/30 border-b border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-7 text-xs"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
        
        {file.language === 'html' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="h-7 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-7 text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="h-7 text-xs"
        >
          <Download className="h-3 w-3 mr-1" />
          Save
        </Button>
      </div>

      {/* File Content */}
      {expanded && (
        <div className="p-3">
          <pre className="text-xs bg-muted/50 p-3 rounded border overflow-x-auto">
            <code className="text-muted-foreground">{file.content}</code>
          </pre>
        </div>
      )}

      {/* Content Preview (collapsed) */}
      {!expanded && (
        <div className="p-3">
          <pre className="text-xs bg-muted/50 p-3 rounded border overflow-hidden">
            <code className="text-muted-foreground">
              {file.content.split('\n').slice(0, 5).join('\n')}
              {file.content.split('\n').length > 5 && '\n...'}
            </code>
          </pre>
        </div>
      )}
    </div>
  )
}
