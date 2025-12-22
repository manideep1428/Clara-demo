import type React from "react";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Paperclip } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area.tsx";
import { PromptInputSubmit } from "./ui/prompt-input.tsx";
import { useChat } from "../hooks/useChat.ts";
import { FileAttachments, type FileAttachment } from "./FileAttachments.tsx";
import { Textarea } from "./ui/textarea.tsx";
import ChatMessage from "./ChatMessage.tsx";

interface ChatBoxProps {
  designId: string;
  chatId: string;
  messages?: Array<{
    _id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }>;
  initialPrompt?: string;
  onNodeUpdate?: (nodes: Map<string, any>) => void;
  getExistingNodeCount?: () => number;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

export function ChatBox({
  designId,
  chatId,
  messages: existingMessages,
  initialPrompt,
  onNodeUpdate,
  getExistingNodeCount,
  onGeneratingChange,
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, streamingMessage, sendMessage, stopGeneration } =
    useChat({
      designId,
      chatId,
      messages: existingMessages,
      onNodeUpdate,
      getExistingNodeCount,
      onError: (error) => {
        console.error("Chat error:", error);
      },
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Notify parent about generating state
  useEffect(() => {
    onGeneratingChange?.(isLoading);
  }, [isLoading, onGeneratingChange]);

  // Initial prompt handling
  const hasInitiatedRef = useRef(false);

  useEffect(() => {
    // If we have existing messages, we've already initiated this chat
    if (existingMessages && existingMessages.length > 0) {
      hasInitiatedRef.current = true;
      return;
    }

    // Only send initial message if we have a prompt, haven't initiated, AND we know there are no messages
    // We check the messages from useChat (which are loaded from existingMessages)
    if (
      initialPrompt &&
      !hasInitiatedRef.current &&
      messages.length === 0 &&
      existingMessages !== undefined
    ) {
      hasInitiatedRef.current = true;
      // Short timeout to ensure hydration and connection
      setTimeout(() => {
        sendMessage(initialPrompt);
      }, 500);
    }
  }, [initialPrompt, sendMessage, messages, existingMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    setAttachments([]);
    await sendMessage(message);
  };

  // File handling
  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const maxFiles = 3;
    const newFiles = Array.from(files)
      .filter(
        (file) =>
          file.type.startsWith("image/") || file.type === "application/pdf"
      )
      .slice(0, maxFiles - attachments.length);

    const newAttachments: FileAttachment[] = newFiles.map((file) => {
      const attachment: FileAttachment = {
        id: Math.random().toString(36).substring(7),
        file,
      };

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id
                ? { ...a, preview: e.target?.result as string }
                : a
            )
          );
        };
        reader.readAsDataURL(file);
      }

      return attachment;
    });

    setAttachments((prev) => [...prev, ...newAttachments].slice(0, maxFiles));
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === inputContainerRef.current) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="h-full w-full bg-transparent flex flex-col">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                <div className="relative w-16 h-16 bg-linear-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                Start Creating
              </h3>
              <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-xs">
                Describe your design ideas and I'll help you create beautiful
                mobile interfaces with live previews.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-xs">
                <div className="text-[11px] text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg border border-border">
                  💡 Try: "Create a login screen"
                </div>
                <div className="text-[11px] text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg border border-border">
                  💡 Try: "Design a dashboard"
                </div>
              </div>
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
            <div className="flex gap-3 justify-start items-start">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                <MessageSquare size={16} className="text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex gap-1">
                  <div
                    className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  Generating design...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-muted/30 backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <div
            ref={inputContainerRef}
            className={`
              relative bg-muted/40 rounded-xl border-2 transition-all duration-200
              ${isFocused ? "border-violet-500/60 shadow-lg shadow-violet-500/20 ring-2 ring-violet-500/10" : "border-border shadow-sm"}
              ${isDragging ? "border-violet-500/60 bg-violet-500/5 shadow-lg shadow-violet-500/10" : ""}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  isDragging ? "Drop files here..." : "Ask me anything..."
                }
                className="w-full bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[60px] max-h-[120px] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading) {
                      handleSubmit(e as any);
                    }
                  }
                }}
              />
            </div>

            {/* File Attachments */}
            <FileAttachments
              attachments={attachments}
              onRemove={removeAttachment}
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                  accept="image/*,.pdf"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || attachments.length >= 3}
                  className="h-8 px-3 rounded-lg text-xs flex items-center gap-2 transition-colors disabled:opacity-50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Attach</span>
                  {attachments.length > 0 && (
                    <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-md">
                      {attachments.length}/3
                    </span>
                  )}
                </button>
              </div>

              <PromptInputSubmit
                status={isLoading ? "streaming" : undefined}
                disabled={!isLoading && !input.trim()}
                onClick={(e) => {
                  if (isLoading) {
                    e.preventDefault();
                    stopGeneration();
                  }
                }}
                className="bg-linear-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white h-8 w-8 rounded-lg transition-colors shadow-sm"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
