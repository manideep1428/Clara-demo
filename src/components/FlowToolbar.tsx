import { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { 
  Hand, 
  MousePointer, 
  Maximize2,
  Minus,
  Plus
} from 'lucide-react';

type Tool = 'select' | 'hand';

interface FlowToolbarProps {
  onToolChange?: (tool: Tool) => void;
}

export function FlowToolbar({ onToolChange }: FlowToolbarProps) {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const [zoom, setZoom] = useState(100);

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    onToolChange?.(tool);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // V for select tool
      if (e.key === 'v' || e.key === 'V') {
        handleToolChange('select');
      }
      // H for hand tool
      else if (e.key === 'h' || e.key === 'H') {
        handleToolChange('hand');
      }
      // + or = for zoom in
      else if ((e.key === '+' || e.key === '=') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleZoomIn();
      }
      // - for zoom out
      else if (e.key === '-' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleZoomOut();
      }
      // Shift + 1 for fit view
      else if (e.shiftKey && e.key === '1') {
        e.preventDefault();
        handleFitView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleZoomIn = () => {
    zoomIn({ duration: 200 });
    setTimeout(() => {
      const currentZoom = Math.round(getZoom() * 100);
      setZoom(currentZoom);
    }, 250);
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 200 });
    setTimeout(() => {
      const currentZoom = Math.round(getZoom() * 100);
      setZoom(currentZoom);
    }, 250);
  };

  const handleFitView = () => {
    fitView({ duration: 200, padding: 0.2 });
    setTimeout(() => {
      const currentZoom = Math.round(getZoom() * 100);
      setZoom(currentZoom);
    }, 250);
  };

  const handleResetZoom = () => {
    fitView({ duration: 200, padding: 0.2, maxZoom: 1, minZoom: 1 });
    setZoom(100);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center gap-1">
        {/* Tool Selection */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleToolChange('select')}
            className={`p-2.5 rounded-lg transition-all ${
              activeTool === 'select'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Select Tool (V)"
          >
            <MousePointer className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleToolChange('hand')}
            className={`p-2.5 rounded-lg transition-all ${
              activeTool === 'hand'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Hand Tool (H)"
          >
            <Hand className="w-5 h-5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 px-3 border-r border-gray-200 dark:border-gray-700">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title="Zoom Out (-)"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleResetZoom}
            className="min-w-[60px] px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            title="Reset Zoom"
          >
            {zoom}%
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title="Zoom In (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1 pl-3">
          <button
            onClick={handleFitView}
            className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title="Fit View (Shift + 1)"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
