import { useState } from 'react'
import { ChevronDown, ChevronRight, Package, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileComponent } from './FileComponent'
import { ClaraArtifactParser, type ParsedArtifact, type ParsedFile } from '@/lib/parser'

interface ArtifactComponentProps {
  artifact: ParsedArtifact
  onPreviewHTML?: (content: string) => void
  onSaveFile?: (file: ParsedFile) => void
  onSaveAll?: (artifact: ParsedArtifact) => void
}

export function ArtifactComponent({ 
  artifact, 
  onPreviewHTML, 
  onSaveFile, 
  onSaveAll 
}: ArtifactComponentProps) {
  const [expanded, setExpanded] = useState(true)

  const handlePreviewHTML = (content: string) => {
    if (onPreviewHTML) {
      onPreviewHTML(content)
    }
  }

  const handleSaveFile = (file: ParsedFile) => {
    if (onSaveFile) {
      onSaveFile(file)
    }
  }

  const handleSaveAll = () => {
    if (onSaveAll) {
      onSaveAll(artifact)
    }
  }

  const stats = {
    totalLines: ClaraArtifactParser.getTotalLines(artifact),
    totalCharacters: ClaraArtifactParser.getTotalCharacters(artifact),
    languages: ClaraArtifactParser.getLanguages(artifact),
    fileCount: artifact.files.length
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Artifact Header */}
      <div className="bg-muted/50 border-b border-border">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/70 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Package className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <h3 className="font-medium text-sm">{artifact.title}</h3>
            <p className="text-xs text-muted-foreground">
              {stats.fileCount} files • {stats.totalLines} lines • {stats.languages.join(', ')}
            </p>
          </div>
        </button>
      </div>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Artifact Actions */}
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveAll}
              className="h-7 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Save All Files
            </Button>
            
            {artifact.files.some(f => f.language === 'html') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const htmlFile = artifact.files.find(f => f.language === 'html')
                  if (htmlFile) handlePreviewHTML(htmlFile.content)
                }}
                className="h-7 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview HTML
              </Button>
            )}
          </div>

          {/* Files */}
          <div className="space-y-2">
            {artifact.files.map((file, index) => (
              <FileComponent
                key={index}
                file={file}
                onPreview={handlePreviewHTML}
                onSave={handleSaveFile}
              />
            ))}
          </div>

          {/* Artifact Stats */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            <strong>Artifact ID:</strong> {artifact.id} • 
            <strong> Total Characters:</strong> {stats.totalCharacters.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}
