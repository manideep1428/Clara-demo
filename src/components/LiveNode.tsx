import { useRef, useEffect, memo } from 'react';

interface LiveNodeProps {
  id: string;
  title: string;
  htmlContent: string;
  isStreaming: boolean;
  position?: { x: number; y: number };
}

function LiveNode({ title, htmlContent, isStreaming }: LiveNodeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastContentRef = useRef<string>('');

  // Live update iframe as content streams
  useEffect(() => {
    if (!htmlContent || !iframeRef.current) return;
    
    // Only update if content changed
    if (lastContentRef.current === htmlContent) return;
    lastContentRef.current = htmlContent;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument;
    if (!doc) return;

    // For complete HTML documents
    if (htmlContent.includes('<!DOCTYPE html>') || htmlContent.includes('<html')) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }
  }, [htmlContent]);

  return (
    <div className="rounded-lg border-2 border-border bg-background shadow-lg overflow-hidden" style={{ width: 375 }}>
      {/* Header */}
      <div className="bg-muted px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground truncate">
            {title || 'Untitled'}
          </h3>
          <div className="flex items-center gap-2">
            {isStreaming && (
              <div className="flex items-center gap-1 text-xs text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </div>
            )}
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-background rounded">
              375×667
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white" style={{ height: '667px' }}>
        {htmlContent ? (
          <iframe
            ref={iframeRef}
            title={title}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
              <p className="text-xs text-muted-foreground">Generating...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(LiveNode);
