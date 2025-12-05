import { cn } from '../lib/utils';
import { MarkdownRenderer } from './MarkdownRenderer';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming = false }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-2 p-3 rounded-lg',
        isUser ? 'bg-muted/50' : 'bg-background'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className="flex-1 min-w-0 pt-0.5 overflow-hidden">
        <div className="font-medium text-xs mb-1 text-muted-foreground">
          {isUser ? 'You' : 'Assistant'}
        </div>
        
        {isUser ? (
          <div className="text-foreground text-xs leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
            {content}
          </div>
        ) : (
          <div className="text-foreground text-xs overflow-hidden">
            <MarkdownRenderer content={content} />
            {isStreaming && (
              <span className="inline-block w-3 h-3 ml-1 bg-primary animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
