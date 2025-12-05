import { useState, useRef, useEffect } from 'react';
import { MessageSquare, StopCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area.tsx';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
} from './ui/prompt-input.tsx';
import { useChat, type LiveNode } from '../hooks/useChat.ts';
import { ChatMessage } from './ChatMessage.tsx';
import { SidebarTrigger, SidebarHeader } from './ui/sidebar.tsx';

interface ChatBoxProps {
  designId: string;
  initialPrompt?: string;
  chatId: string;
  onNodeUpdate?: (node: LiveNode) => void;
}

export function ChatBox({ designId, initialPrompt, chatId, onNodeUpdate }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, streamingMessage, sendMessage, stopGeneration } = useChat({
    designId,
    chatId,
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onNodeUpdate,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  // Auto-submit initial prompt
  useEffect(() => {
    if (initialPrompt && !hasAutoSubmitted && !isLoading && messages.length === 0) {
      setInput(initialPrompt);
      setHasAutoSubmitted(true);
      
      setTimeout(() => {
        sendMessage(initialPrompt);
      }, 500);
    }
  }, [initialPrompt, hasAutoSubmitted, isLoading, messages.length, sendMessage]);

  return (
    <div className="h-full w-full bg-gradient-to-b from-background to-background/95 flex flex-col">
      {/* Header with Sidebar Trigger */}
      <SidebarHeader className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-sm font-semibold">Chat</h2>
          </div>
        </div>
      </SidebarHeader>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xs font-medium text-foreground mb-1.5">Start Creating</h3>
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Describe your design ideas and I'll help you create beautiful interfaces with live previews.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))}

          {/* Streaming message */}
          {isLoading && streamingMessage && (
            <ChatMessage
              role="assistant"
              content={streamingMessage}
              isStreaming={true}
            />
          )}

          {/* Loading indicator when no streaming content yet */}
          {isLoading && !streamingMessage && (
            <div className="flex gap-2 p-3">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-4">
        <PromptInput onSubmit={handleSubmit} className="bg-background/50 border-border/50">
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="min-h-[80px] max-h-[120px] text-sm placeholder:text-muted-foreground/70"
          />
          
          <PromptInputToolbar>
            <PromptInputTools>
              {isLoading && (
                <PromptInputButton
                  variant="ghost"
                  onClick={stopGeneration}
                  className="text-red-500 hover:text-red-600"
                >
                  <StopCircle className="w-4 h-4" />
                </PromptInputButton>
              )}
            </PromptInputTools>
            
            <PromptInputSubmit
              status={isLoading ? 'streaming' : undefined}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
