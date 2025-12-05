
import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { ChatMessage } from '../components/ChatMessage';
import LiveNode from '../components/LiveNode';
import { LiveClaraParser } from '../lib/liveParser';
import type { LiveNode as LiveNodeType } from '../hooks/useChat';

export const Route = createFileRoute('/test-live')({
  component: TestLivePage,
});

const MOCK_CLARA_RESPONSE = `Sure! I'll create a beautiful landing page for you.

<claraArtifact id="landing-page-1" title="Modern Landing Page">
<claraAction type="file" filePath="index.html">
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>TechFlow - Innovation Simplified</title>
</head>
<body class="bg-gray-50">
  <h1>Hello from landing page</h1>
</body>
</html>
</claraAction>
</claraArtifact>

There you go! A modern landing page.`;

function TestLivePage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [liveNodes, setLiveNodes] = useState<Map<string, LiveNodeType>>(new Map());
  const [isStreaming, setIsStreaming] = useState(false);

  const simulateStreaming = useCallback(async () => {
    if (isStreaming) return;

    setIsStreaming(true);
    setMessages([{ role: 'user', content: 'Create a modern landing page' }]);
    setLiveNodes(new Map());

    const parser = new LiveClaraParser();
    let streamedContent = '';
    let currentNodeId: string | null = null;

    const chunks = MOCK_CLARA_RESPONSE.match(/.{1,60}/gs) || [];

    for (const chunk of chunks) {
      streamedContent += chunk;
      parser.processChunk(chunk);

      const metadata = parser.getArtifactMetadata();
      const htmlContent = parser.getCurrentHtmlContent();
      const ok = metadata && htmlContent && htmlContent.trim().length > 0;

      if (ok) {
        if (!currentNodeId) {
          currentNodeId = `node-${metadata.id}-${Date.now()}`;
        }

        const liveNode: LiveNodeType = {
          id: currentNodeId,
          artifactId: metadata.id,
          title: metadata.title,
          htmlContent,
          isStreaming: parser.isCapturing(),
        };

        setLiveNodes(prev => {
          const updated = new Map(prev);
          updated.set(currentNodeId!, liveNode);
          return updated;
        });
      }

      setMessages([
        { role: 'user', content: 'Create a modern landing page' },
        { role: 'assistant', content: streamedContent },
      ]);

      await new Promise(res => setTimeout(res, 20));
    }

    setIsStreaming(false);
  }, [isStreaming]);

  const nodes = Array.from(liveNodes.values());

  return (
    <div className="pt-20 mx-auto max-w-6xl px-6">
      <div className="text-center mb-6">
        <Button
          onClick={simulateStreaming}
          disabled={isStreaming}
          className="px-6"
        >
          {isStreaming ? 'Streaming...' : 'Start Test Stream'}
        </Button>
      </div>

      <ScrollArea className="border rounded-lg p-4 h-64 mb-8 bg-background">
        <div className="space-y-4">
          {messages.map((message, idx) => (
            <ChatMessage
              key={idx}
              role={message.role}
              content={message.content}
              isStreaming={idx === messages.length - 1 && isStreaming}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="min-h-[300px] flex flex-wrap gap-6">
        {nodes.length === 0 && (
          <p className="text-muted-foreground mx-auto mt-10">
            Run the stream to generate LiveNodes
          </p>
        )}

        {nodes.map(node => (
          <LiveNode
            key={node.id}
            id={node.id}
            title={node.title}
            htmlContent={node.htmlContent}
            isStreaming={node.isStreaming}
          />
        ))}
      </div>
    </div>
  );
}
