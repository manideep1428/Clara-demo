import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Square, Trash2, Copy, Download, Eye, Code } from 'lucide-react'

interface StreamingState {
  isStreaming: boolean
  html: string
  tokens: number
  startTime: number | null
}

export default function LiveHTMLRenderer() {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    html: '',
    tokens: 0,
    startTime: null
  })
  const [prompt, setPrompt] = useState('Create a beautiful landing page for a coffee shop with hero section, menu preview, and contact form')
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview')

  // Listen for HTML generation events from chat
  useEffect(() => {
    const handleHtmlGenerated = (event: CustomEvent) => {
      const { html, fileName, screenName } = event.detail;
      
      // Auto-populate the renderer with generated HTML
      setStreamingState({
        isStreaming: false,
        html: html,
        tokens: html.length,
        startTime: null
      });
      
      // Update prompt to show what was generated
      setPrompt(`Generated: ${screenName} (${fileName})`);
    };

    window.addEventListener('htmlGenerated', handleHtmlGenerated as EventListener);
    
    return () => {
      window.removeEventListener('htmlGenerated', handleHtmlGenerated as EventListener);
    };
  }, []);

  // Start live HTML generation
  const startLiveGeneration = useCallback(async () => {
    if (!prompt.trim()) return

    // Reset state
    setStreamingState({
      isStreaming: true,
      html: '',
      tokens: 0,
      startTime: Date.now()
    })

    // Import the mock streaming service
    const { mockStreamingService } = await import('@/services/mockStreamingService')

    let accumulatedHtml = ''

    mockStreamingService.streamHTML({
      prompt,
      onChunk: (chunk: string) => {
        accumulatedHtml += chunk
        
        // Basic HTML sanitization (remove script tags for security)
        const sanitizedHtml = accumulatedHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

        setStreamingState(prev => ({
          ...prev,
          html: sanitizedHtml,
          tokens: prev.tokens + 1
        }))
      },
      onComplete: () => {
        setStreamingState(prev => ({ ...prev, isStreaming: false }))
      },
      onError: (error: string) => {
        console.error('Streaming error:', error)
        setStreamingState(prev => ({ ...prev, isStreaming: false }))
      }
    })
  }, [prompt])

  // Stop streaming
  const stopGeneration = useCallback(async () => {
    const { mockStreamingService } = await import('@/services/mockStreamingService')
    mockStreamingService.abort()
    setStreamingState(prev => ({ ...prev, isStreaming: false }))
  }, [])

  // Clear HTML
  const clearHtml = useCallback(() => {
    setStreamingState({
      isStreaming: false,
      html: '',
      tokens: 0,
      startTime: null
    })
  }, [])

  // Copy HTML to clipboard
  const copyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(streamingState.html)
      // In a real app, show toast notification
      console.log('HTML copied to clipboard')
    } catch (error) {
      console.error('Failed to copy HTML:', error)
    }
  }, [streamingState.html])

  // Download HTML file
  const downloadHtml = useCallback(() => {
    const blob = new Blob([streamingState.html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated-page.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [streamingState.html])

  const elapsedTime = streamingState.startTime 
    ? ((Date.now() - streamingState.startTime) / 1000).toFixed(1)
    : '0.0'

  const tokensPerSecond = streamingState.startTime
    ? (streamingState.tokens / ((Date.now() - streamingState.startTime) / 1000)).toFixed(1)
    : '0.0'

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Live HTML Renderer
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 max-w-2xl">
              Watch HTML being generated in real-time as the LLM streams tokens • Built with Tailwind CSS
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl text-center border border-blue-200 dark:border-blue-800">
              <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">{streamingState.tokens}</div>
              <div className="text-blue-500 dark:text-blue-300 text-xs">Tokens</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl text-center border border-green-200 dark:border-green-800">
              <div className="font-bold text-green-600 dark:text-green-400 text-lg">{elapsedTime}s</div>
              <div className="text-green-500 dark:text-green-300 text-xs">Time</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl text-center border border-purple-200 dark:border-purple-800">
              <div className="font-bold text-purple-600 dark:text-purple-400 text-lg">{tokensPerSecond}</div>
              <div className="text-purple-500 dark:text-purple-300 text-xs">Tokens/s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Prompt Input */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Describe your HTML page
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Create a beautiful landing page for a coffee shop with hero section, menu preview, and contact form..."
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 shadow-sm"
              disabled={streamingState.isStreaming}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {!streamingState.isStreaming ? (
                <Button
                  onClick={startLiveGeneration}
                  disabled={!prompt.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Generate Live
                </Button>
              ) : (
                <Button
                  onClick={stopGeneration}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              )}
              
              <Button
                onClick={clearHtml}
                variant="outline"
                disabled={streamingState.isStreaming}
                className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyHtml}
                variant="outline"
                size="sm"
                disabled={!streamingState.html}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              
              <Button
                onClick={downloadHtml}
                variant="outline"
                size="sm"
                disabled={!streamingState.html}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 mt-6">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">View Mode:</span>
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex gap-1">
            <Button
              onClick={() => setViewMode('preview')}
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              className={viewMode === 'preview' 
                ? 'bg-white dark:bg-gray-600 shadow-sm' 
                : 'hover:bg-white/50 dark:hover:bg-gray-600/50'
              }
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={() => setViewMode('code')}
              variant={viewMode === 'code' ? 'default' : 'ghost'}
              size="sm"
              className={viewMode === 'code' 
                ? 'bg-white dark:bg-gray-600 shadow-sm' 
                : 'hover:bg-white/50 dark:hover:bg-gray-600/50'
              }
            >
              <Code className="h-4 w-4 mr-2" />
              Code
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {viewMode === 'preview' ? (
          /* Live Preview */
          <div className="flex-1 bg-white dark:bg-gray-800">
            {streamingState.html ? (
              <div className="h-full overflow-auto">
                <div
                  className="min-h-full"
                  dangerouslySetInnerHTML={{ __html: streamingState.html }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-medium">Live Preview</p>
                  <p className="text-sm mt-2">HTML will appear here as it's generated</p>
                  {streamingState.isStreaming && (
                    <div className="mt-6">
                      <div className="flex justify-center mb-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Generating HTML...</p>
                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1 mt-2">
                          <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Code View */
          <div className="flex-1 bg-gray-900 text-green-400 font-mono text-sm">
            <ScrollArea className="h-full">
              <div className="p-4">
                {streamingState.html ? (
                  <pre className="whitespace-pre-wrap break-words">
                    {streamingState.html}
                  </pre>
                ) : (
                  <div className="text-center text-gray-500 mt-20">
                    <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium">HTML Code</p>
                    <p className="text-sm mt-2">Generated HTML will appear here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-2 ${
              streamingState.isStreaming 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                streamingState.isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              {streamingState.isStreaming ? 'Streaming...' : 'Ready'}
            </span>
            
            {streamingState.html && (
              <span className="text-gray-600 dark:text-gray-400">
                {streamingState.html.length} characters
              </span>
            )}
          </div>
          
          <div className="text-gray-500">
            Live HTML Renderer v1.0
          </div>
        </div>
      </div>
    </div>
  )
}
