import { useRef, useState, useEffect, useMemo } from 'react';
import { NodeProps, Node } from '@xyflow/react';

// Define the data structure for our custom node
export type LiveNodeData = {
    artifactId: string;
    title: string;
    htmlContent: string;
    isStreaming: boolean;
    id?: string;
};

type LiveNodeProps = NodeProps<Node<LiveNodeData>>;

const PHONE_WIDTH = 375;
const MIN_HEIGHT = 400;

const LiveNode = ({ data }: LiveNodeProps) => {
    const { title, htmlContent, isStreaming, id } = data;

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [contentHeight, setContentHeight] = useState<number>(MIN_HEIGHT);
    const prevHeightRef = useRef<number>(MIN_HEIGHT);
    const [iframeKey, setIframeKey] = useState(0);

    // Always wrap content in complete HTML structure for iframe rendering
    // Show placeholder during streaming, render actual content only when complete
    const processedContent = useMemo(() => {
        // During streaming, show placeholder
        if (isStreaming) {
            return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:20px;display:flex;align-items:center;justify-content:center;min-height:400px;font-family:sans-serif;background:#f8fafc;"><div style="text-align:center;"><div style="width:40px;height:40px;border:3px solid #e2e8f0;border-top-color:#8b5cf6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;"></div><div style="color:#64748b;font-size:14px;">Generating design...</div></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style></body></html>`;
        }

        // If content is empty/whitespace, show placeholder
        if (!htmlContent || htmlContent.trim().length === 0) {
            return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:20px;display:flex;align-items:center;justify-content:center;min-height:400px;font-family:sans-serif;color:#64748b;"><div style="text-align:center;">No content</div></body></html>`;
        }

        // If already a full HTML document, use as-is
        if (/<!DOCTYPE html>|<html[\s>]/i.test(htmlContent)) {
            return htmlContent;
        }

        // Otherwise, wrap the partial content in a complete HTML structure
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><style>*{box-sizing:border-box}html{height:auto!important;overflow:hidden!important}body{margin:0;padding:0;height:auto!important;overflow:hidden!important;min-height:0!important}</style></head><body>${htmlContent}</body></html>`;
    }, [htmlContent, isStreaming]);

    // Debug: Log when content updates
    useEffect(() => {
        console.log('🎨 LiveNode content update:', {
            id,
            title,
            contentLength: htmlContent?.length || 0,
            isStreaming,
            hasContent: Boolean(htmlContent && htmlContent.trim().length > 0)
        });
    }, [htmlContent, id, title, isStreaming]);

    // Measure content when htmlContent changes
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        // Wait for content to render
        const measureAfterRender = () => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const doc = iframe.contentDocument;
                    if (!doc?.body) return;

                    // Get the actual content height by measuring all children
                    let maxBottom = 0;
                    const children = doc.body.children;
                    for (let i = 0; i < children.length; i++) {
                        const child = children[i] as HTMLElement;
                        const rect = child.getBoundingClientRect();
                        const bottom = rect.top + rect.height;
                        if (bottom > maxBottom) maxBottom = bottom;
                    }

                    // If no children, use scrollHeight as fallback
                    const measuredHeight = maxBottom > 0 ? maxBottom : doc.body.scrollHeight;
                    const newHeight = Math.max(MIN_HEIGHT, Math.ceil(measuredHeight) + 20);

                    // Only update if significantly different (prevents jitter)
                    if (Math.abs(newHeight - prevHeightRef.current) > 5) {
                        prevHeightRef.current = newHeight;
                        setContentHeight(newHeight);
                    }
                }, 50);
            });
        };

        // Measure on load
        const handleLoad = () => measureAfterRender();
        iframe.addEventListener('load', handleLoad);

        // Also measure when content prop changes
        measureAfterRender();

        return () => {
            iframe.removeEventListener('load', handleLoad);
        };
    }, [htmlContent]);

    return (
        <div
            className="shadow-2xl rounded-3xl border-[8px] border-zinc-900 bg-zinc-900 overflow-hidden relative group"
            style={{
                width: PHONE_WIDTH + 16,
                height: contentHeight + 55,
            }}
        >
            {/* Header / Drag Handle */}
            <div className="custom-drag-handle h-10 bg-zinc-900 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing border-b border-zinc-800">
                <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="flex items-center gap-2">
                    {isStreaming && (
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Generating</span>
                        </div>
                    )}
                    <div className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">{id || 'Preview'}</div>
                </div>
            </div>

            {/* Iframe - sized to content */}
            <div className="bg-white overflow-hidden" style={{ width: PHONE_WIDTH, height: contentHeight }}>
                <iframe
                    key={`${id}-${htmlContent?.length || 0}`}
                    ref={iframeRef}
                    title={title || "Live Preview"}
                    srcDoc={processedContent}
                    className="border-none block"
                    style={{ width: PHONE_WIDTH, height: contentHeight, display: 'block' }}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    scrolling="no"
                />
            </div>
        </div>
    );
};
export default LiveNode;
