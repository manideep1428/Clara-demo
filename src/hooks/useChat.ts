import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { streamChatCompletion, type ChatMessage as OpenAIChatMessage } from '../lib/openai';
import { generateUUID } from '../lib/utils';
import { getSystemPrompt } from '../lib/prompt';
import { LiveClaraParser } from '../lib/liveParser';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface LiveNode {
  id: string;
  artifactId: string;
  title: string;
  htmlContent: string;
  isStreaming: boolean;
}

interface UseChatOptions {
  designId: string;
  chatId: string;
  onError?: (error: Error) => void;
  onNodeUpdate?: (node: LiveNode) => void;
}

export function useChat({ designId, chatId, onError, onNodeUpdate }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const parserRef = useRef<LiveClaraParser>(new LiveClaraParser());

  // Convex mutations
  const createMessage = useMutation(api.messages.createMessage);
  const upsertNode = useMutation(api.nodes.upsertNode);
  
  // Load existing messages
  const existingMessages = useQuery(api.messages.getMessages, { designId });

  // Initialize messages from Convex
  useEffect(() => {
    if (existingMessages) {
      setMessages(existingMessages.map(msg => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })));
    }
  }, [existingMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingMessage('');

    // Reset parser for new generation
    parserRef.current.reset();
    let currentNodeId: string | null = null;

    try {
      // Save user message to Convex
      await createMessage({
        designId,
        role: 'user',
        content: userMessage.content,
      });

      // Prepare messages for OpenAI with system prompt
      const systemPrompt = getSystemPrompt();
      const conversationHistory: OpenAIChatMessage[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: userMessage.content,
        },
      ];

      // Create assistant message placeholder
      const assistantMessageId = generateUUID();
      let fullResponse = '';

      // Stream response from OpenAI
      abortControllerRef.current = new AbortController();
      
      for await (const chunk of streamChatCompletion(conversationHistory, {
        temperature: 0.7,
        maxTokens: 4000,
      })) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        
        fullResponse += chunk;
        setStreamingMessage(fullResponse);

        // Parse chunk for Clara artifacts
        const artifact = parserRef.current.processChunk(chunk);
        const metadata = parserRef.current.getArtifactMetadata();
        const htmlContent = parserRef.current.getCurrentHtmlContent();

        // If we have artifact metadata and HTML content, update the node
        if (metadata && htmlContent && onNodeUpdate) {
          if (!currentNodeId) {
            currentNodeId = `node-${metadata.id}-${Date.now()}`;
            console.log('🎨 Created new node:', currentNodeId, 'for artifact:', metadata.id);
          }

          const liveNode: LiveNode = {
            id: currentNodeId,
            artifactId: metadata.id,
            title: metadata.title,
            htmlContent: htmlContent,
            isStreaming: parserRef.current.isCapturing(),
          };

          console.log('📡 Live update:', {
            nodeId: currentNodeId,
            title: metadata.title,
            contentLength: htmlContent.length,
            isStreaming: liveNode.isStreaming
          });

          // Send live update to parent
          onNodeUpdate(liveNode);

          // Save to Convex (debounced by the streaming nature)
          if (artifact && artifact.files.length > 0) {
            const file = artifact.files[0];
            await upsertNode({
              designId,
              nodeId: currentNodeId,
              artifactId: metadata.id,
              title: metadata.title,
              htmlContent: htmlContent,
              filePath: file.path,
              language: file.language,
            });
          }
        }
      }

      // Final update when streaming completes
      if (currentNodeId && onNodeUpdate) {
        const metadata = parserRef.current.getArtifactMetadata();
        const htmlContent = parserRef.current.getCurrentHtmlContent();
        
        if (metadata && htmlContent) {
          const finalNode: LiveNode = {
            id: currentNodeId,
            artifactId: metadata.id,
            title: metadata.title,
            htmlContent: htmlContent,
            isStreaming: false,
          };
          onNodeUpdate(finalNode);
        }
      }

      // Create final assistant message
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      };

      // Save assistant message to Convex
      await createMessage({
        designId,
        role: 'assistant',
        content: fullResponse,
      });

      // Add to messages
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');

    } catch (error) {
      console.error('Error sending message:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, designId, createMessage, onError, onNodeUpdate, upsertNode]);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setStreamingMessage('');
  }, []);

  return {
    messages,
    isLoading,
    streamingMessage,
    sendMessage,
    stopGeneration,
    chatId,
  };
}
