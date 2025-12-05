import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CanvasImage {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
  selected?: boolean
}

interface InfiniteCanvasProps {
  images: CanvasImage[]
  onImagesChange: (images: CanvasImage[]) => void
  onImagePositionChange?: (imageId: string, x: number, y: number) => void
  className?: string
}

export function InfiniteCanvas({ images, onImagesChange, onImagePositionChange, className }: InfiniteCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null)
  const [draggedImageOffset, setDraggedImageOffset] = useState({ x: 0, y: 0 })

  // Handle canvas panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y })
      setSelectedImageId(null)
    }
  }, [canvasOffset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && !draggedImageId) {
      setCanvasOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart, draggedImageId])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDraggedImageId(null)
  }, [])

  // Handle zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)))
  }, [])

  // Handle image selection
  const handleImageClick = useCallback((imageId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedImageId(imageId)
  }, [])

  // Handle image dragging
  const handleImageMouseDown = useCallback((imageId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraggedImageId(imageId)
    setSelectedImageId(imageId)
    
    const image = images.find(img => img.id === imageId)
    if (image) {
      setDraggedImageOffset({
        x: e.clientX - image.x,
        y: e.clientY - image.y
      })
    }
  }, [images])

  // Handle image position updates
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedImageId) {
        const newX = e.clientX - draggedImageOffset.x
        const newY = e.clientY - draggedImageOffset.y
        
        const newImages = images.map(img => 
          img.id === draggedImageId 
            ? { 
                ...img, 
                x: newX,
                y: newY
              }
            : img
        )
        onImagesChange(newImages)
      }
    }

    const handleGlobalMouseUp = () => {
      if (draggedImageId && onImagePositionChange) {
        // Find the final position of the dragged image
        const draggedImage = images.find(img => img.id === draggedImageId)
        if (draggedImage) {
          onImagePositionChange(draggedImageId, draggedImage.x, draggedImage.y)
        }
      }
      setDraggedImageId(null)
    }

    if (draggedImageId) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [draggedImageId, draggedImageOffset, images, onImagesChange, onImagePositionChange])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageId && e.key === 'Delete') {
        const newImages = images.filter(img => img.id !== selectedImageId)
        onImagesChange(newImages)
        setSelectedImageId(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedImageId, images, onImagesChange])

  return (
    <div 
      ref={canvasRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900 cursor-grab active:cursor-grabbing",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          transform: `translate(${canvasOffset.x % (20 * zoom)}px, ${canvasOffset.y % (20 * zoom)}px)`
        }}
      />

      {/* Canvas content */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {images.map((image) => (
          <div
            key={image.id}
            className={cn(
              "absolute border-2 border-transparent hover:border-blue-400 transition-colors cursor-move",
              selectedImageId === image.id && "border-blue-500 shadow-lg"
            )}
            style={{
              left: image.x,
              top: image.y,
              width: image.width,
              height: image.height
            }}
            onClick={(e) => handleImageClick(image.id, e)}
            onMouseDown={(e) => handleImageMouseDown(image.id, e)}
          >
            <img
              src={image.src}
              alt="Canvas image"
              className="w-full h-full object-cover rounded-lg pointer-events-none"
              draggable={false}
            />
            
            {/* Selection handles */}
            {selectedImageId === image.id && (
              <>
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Canvas info */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md text-sm">
        <div>Zoom: {Math.round(zoom * 100)}%</div>
        <div>Images: {images.length}</div>
      </div>

      {/* Instructions */}
      {images.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">Empty Canvas</p>
            <p className="text-sm">Add images to get started</p>
          </div>
        </div>
      )}
    </div>
  )
}
