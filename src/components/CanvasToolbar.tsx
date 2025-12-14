import { useRef } from 'react'
import { Plus, Hand, MousePointer, RotateCcw, Upload, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CanvasToolbarProps {
  onAddImage: (imageUrl: string) => void
  onClearCanvas: () => void
  onResetView: () => void
  selectedTool: 'select' | 'hand'
  onToolChange: (tool: 'select' | 'hand') => void
  className?: string
}

export function CanvasToolbar({ 
  onAddImage, 
  onClearCanvas, 
  onResetView,
  selectedTool,
  onToolChange,
  className 
}: CanvasToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Create object URL for the uploaded image
    const imageUrl = URL.createObjectURL(file)
    onAddImage(imageUrl)
    
    // Reset the input
    event.target.value = ''
  }

  const addSampleImage = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
      'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400',
      'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
    ]
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)]
    onAddImage(randomImage)
  }

  return (
    <div className={cn(
      "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
      "bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700",
      "flex items-center gap-2 p-2",
      className
    )}>
      {/* Tool Selection */}
      <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
        <Button
          variant={selectedTool === 'select' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onToolChange('select')}
          className="h-8 w-8 p-0"
        >
          <MousePointer className="h-4 w-4" />
        </Button>
        <Button
          variant={selectedTool === 'hand' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onToolChange('hand')}
          className="h-8 w-8 p-0"
        >
          <Hand className="h-4 w-4" />
        </Button>
      </div>

      {/* Add Images */}
      <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 w-8 p-0"
          title="Upload Image"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addSampleImage}
          className="h-8 w-8 p-0"
          title="Add Sample Image"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* View Controls */}
      <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetView}
          className="h-8 w-8 p-0"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearCanvas}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
          title="Clear Canvas"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}
