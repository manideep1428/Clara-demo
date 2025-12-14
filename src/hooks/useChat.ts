import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { streamChatCompletion, type ChatMessage as OpenAIChatMessage } from '../lib/openai';
import { generateUUID } from '../lib/utils';
import { getSystemPrompt } from '../lib/prompt';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}



interface UseChatOptions {
  designId: string;
  chatId: string;
  messages?: Array<{
    _id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  onError?: (error: Error) => void;
  onNodeUpdate?: (nodes: Map<string, any>) => void;
  getExistingNodeCount?: () => number;
}

export function useChat({ designId, chatId, messages: existingMessages, onError, onNodeUpdate, getExistingNodeCount }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Track created node IDs for this design session using a ref
  const createdNodeIdsRef = useRef<Set<string>>(new Set());

  // Convex mutations
  const createMessage = useMutation(api.messages.createMessage);
  const upsertNode = useMutation(api.nodes.upsertNode);

  // Initialize messages from props
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

  // Track the current design ID to detect changes
  const currentDesignIdRef = useRef<string>(designId);

  // Sync created node IDs when design changes or messages update
  useEffect(() => {
    // Only clear when design actually changes
    if (currentDesignIdRef.current !== designId) {
      console.log('🔄 Design changed from', currentDesignIdRef.current, 'to', designId, '- clearing createdNodeIds');
      createdNodeIdsRef.current.clear();
      currentDesignIdRef.current = designId;
    }
    
    // If we have existing messages, add any node IDs we don't already have
    if (existingMessages) {
      existingMessages.forEach(msg => {
        if (msg.role === 'assistant') {
          // Extract node IDs from claraArtifact tags
          const idMatches = msg.content.matchAll(/id="([^"]+)"/g);
          for (const match of idMatches) {
            if (!createdNodeIdsRef.current.has(match[1])) {
              createdNodeIdsRef.current.add(match[1]);
              console.log('🔄 Added node ID from message:', match[1]);
            }
          }
        }
      });
      console.log('🔄 Current createdNodeIds:', Array.from(createdNodeIdsRef.current));
    }
  }, [designId, existingMessages]);

  /* Tool Definition */
  const tools = [
    {
      type: "function",
      function: {
        name: "artifacts",
        description: "Creates and updates mobile UI artifacts. Use this tool to generate the HTML code for the design.",
        parameters: {
          type: "object",
          properties: {
            command: { type: "string", enum: ["create", "update", "rewrite"] },
            id: { type: "string", description: "Unique ID. MUST be a NEW ID for every new screen/page even if related. Only reuse if updating the SAME screen." },
            title: { type: "string", description: "Human readable title" },
            type: { type: "string", enum: ["text/html", "application/vnd.ant.code"] },
            content: { type: "string", description: "The complete HTML code" }
          },
          required: ["command", "id", "type", "title", "content"]
        }
      }
    }
  ];

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Capture current messages before updating state
    const currentMessages = messages;

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingMessage('');

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
        ...currentMessages.map(msg => ({
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
      let accumulatedText = '';
      // Track multiple tool calls by index
      const toolCalls = new Map<number, { id: string; name: string; args: string }>();

      console.log('🚀 Starting generation...', { message: userMessage.id, existingNodeCount: getExistingNodeCount ? getExistingNodeCount() : 0 });

      // Stream response from OpenAI
      abortControllerRef.current = new AbortController();

      for await (const chunk of streamChatCompletion(conversationHistory, {
        temperature: 0.7,
        maxTokens: 4000,
        tools: tools,
      })) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        if (chunk.type === 'content' && chunk.content) {
          accumulatedText += chunk.content;
          setStreamingMessage(accumulatedText);
        }

        if (chunk.type === 'tool' && chunk.toolCall) {
          const { index, id, function: fn } = chunk.toolCall;

          if (!toolCalls.has(index)) {
            toolCalls.set(index, { id: id || '', name: fn?.name || '', args: '' });
          }
          const currentCall = toolCalls.get(index)!;

          if (id) currentCall.id = id;
          if (fn?.name) currentCall.name = fn.name;
          if (fn?.arguments) currentCall.args += fn.arguments;

          // Attempt to update live preview for ALL active tool calls
          if (onNodeUpdate) {
            const liveNodesUpdate = new Map<string, any>();
            const existingNodeCount = getExistingNodeCount ? getExistingNodeCount() : 0;

            // First pass: collect all node IDs being created in this batch
            const batchNodeIds: string[] = [];
            toolCalls.forEach((call) => {
              const idMatch = call.args.match(/"id"\s*:\s*"([^"]+)"/);
              if (idMatch && !batchNodeIds.includes(idMatch[1])) {
                batchNodeIds.push(idMatch[1]);
              }
            });

            toolCalls.forEach((call, idx) => {
              let partialContent = '';
              let tempId = call.id || `temp-${idx}`;
              let tempTitle = 'Generating...';

              try {
                const idMatch = call.args.match(/"id"\s*:\s*"([^"]+)"/);
                if (idMatch) tempId = idMatch[1];

                const titleMatch = call.args.match(/"title"\s*:\s*"([^"]+)"/);
                if (titleMatch) tempTitle = titleMatch[1];

                // Robust content extraction
                const contentStartRegex = /"content"\s*:\s*"/;
                const contentStartMatch = call.args.match(contentStartRegex);

                if (contentStartMatch && contentStartMatch.index !== undefined) {
                  const startIndex = contentStartMatch.index + contentStartMatch[0].length;
                  let rawContent = call.args.substring(startIndex);

                  // Try to find the end of the content string
                  let endIndex = -1;
                  for (let i = 0; i < rawContent.length; i++) {
                    if (rawContent[i] === '"') {
                      let backslashCount = 0;
                      for (let j = i - 1; j >= 0; j--) {
                        if (rawContent[j] === '\\') backslashCount++;
                        else break;
                      }
                      if (backslashCount % 2 === 0) {
                        endIndex = i;
                        break;
                      }
                    }
                  }

                  if (endIndex !== -1) {
                    rawContent = rawContent.substring(0, endIndex);
                  }

                  partialContent = rawContent
                    .replace(/\\n/g, '\n')
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\')
                    .replace(/\\t/g, '\t')
                    .replace(/\\r/g, '\r')
                    .replace(/\\b/g, '\b')
                    .replace(/\\f/g, '\f');
                }
              } catch (e) {
                console.error("Error parsing partial streaming JSON", e);
              }

              if (partialContent) {
                // Ensure we have a valid ID for the streaming node
                if (!tempId || tempId.startsWith('temp-')) {
                  const idMatch = call.args.match(/"id"\s*:\s*"([^"]+)"/);
                  if (idMatch) tempId = idMatch[1];
                }

                // Skip if we still don't have a valid ID
                if (!tempId || tempId.startsWith('temp-')) {
                  console.log('⚠️ Skipping node without valid ID');
                  return;
                }

                // Calculate position based on:
                // 1. If node already exists in createdNodeIdsRef, use its index
                // 2. Otherwise, use existingNodeCount + position in current batch
                const allCreatedIds = Array.from(createdNodeIdsRef.current);
                let nodeIndex = allCreatedIds.indexOf(tempId);
                if (nodeIndex === -1) {
                  // New node - calculate based on existing DB nodes + batch position
                  const batchIndex = batchNodeIds.indexOf(tempId);
                  nodeIndex = existingNodeCount + (batchIndex >= 0 ? batchIndex : 0);
                }

                const x = (nodeIndex % 3) * 450;
                const y = Math.floor(nodeIndex / 3) * 850;

                liveNodesUpdate.set(tempId, {
                  id: tempId,
                  artifactId: tempId,
                  title: tempTitle,
                  htmlContent: partialContent,
                  isStreaming: true,
                  x,
                  y
                });
                console.log('🔴 Live node update:', { id: tempId, nodeIndex, batchIndex: batchNodeIds.indexOf(tempId), existingCount: existingNodeCount, position: { x, y } });
              }
            });

            if (liveNodesUpdate.size > 0) {
              onNodeUpdate(liveNodesUpdate);
            }
          }
        }
      }

      // Final processing
      let finalContent = accumulatedText;
      const hasToolCalls = toolCalls.size > 0;

      console.log('✅ Streaming complete. Tool calls:', toolCalls.size, 'Text length:', accumulatedText.length);
      console.log('📋 Tool calls to process:', Array.from(toolCalls.entries()).map(([idx, call]) => ({
        index: idx,
        id: call.id,
        name: call.name,
        argsLength: call.args.length,
        argsPreview: call.args.substring(0, 200)
      })));
      console.log('📊 Current createdNodeIds before processing:', Array.from(createdNodeIdsRef.current));

      // Process ALL tool calls
      for (const [_, call] of toolCalls) {
        if (!call.args) continue;

        let args: any = null;

        // Strategy 1: strict JSON parse
        try {
          args = JSON.parse(call.args);
        } catch (e) {
          console.warn('Strict JSON parse failed, attempting repair/fallback for call:', call.id);

          // Strategy 2: Fix common truncation
          try {
            let repaired = call.args.trim();
            if (!repaired.endsWith('}')) repaired += '"}';
            try {
              args = JSON.parse(repaired);
            } catch (e2) {
              if (!repaired.endsWith('}')) repaired += '}';
              args = JSON.parse(repaired);
            }
          } catch (e3) {
            // Strategy 3: Manual extraction fallback
            try {
              let fallbackId = call.id;
              let fallbackTitle = "Generated Design";
              let fallbackContent = "";

              const idMatch = call.args.match(/"id"\s*:\s*"([^"]+)"/);
              if (idMatch) fallbackId = idMatch[1];

              const titleMatch = call.args.match(/"title"\s*:\s*"([^"]+)"/);
              if (titleMatch) fallbackTitle = titleMatch[1];

              const contentStartRegex = /"content"\s*:\s*"/;
              const contentStartMatch = call.args.match(contentStartRegex);
              if (contentStartMatch && contentStartMatch.index !== undefined) {
                const startIndex = contentStartMatch.index + contentStartMatch[0].length;
                let rawContent = call.args.substring(startIndex);

                // Fallback unescape
                fallbackContent = rawContent
                  .replace(/\\n/g, '\n')
                  .replace(/\\"/g, '"')
                  .replace(/\\\\/g, '\\')
                  .replace(/\\t/g, '\t');
              }

              if (fallbackContent) {
                console.log("⚠️ Used fallback extraction for artifact:", fallbackId);
                args = {
                  command: 'create', // Default to create if we had to fallback
                  type: 'text/html',
                  id: fallbackId,
                  title: fallbackTitle,
                  content: fallbackContent
                };
              }
            } catch (e4) {
              console.error("All parsing strategies failed for tool call:", call.id, e4);
            }
          }
        }

        // If we extracted valid args (either via JSON or fallback), process it
        if (args && args.content) {
          // Default command if missing
          const command = args.command || 'create';
          console.log('🎯 Processing tool call:', { id: args.id, title: args.title, command, contentLength: args.content.length });

          if (['create', 'update', 'rewrite'].includes(command)) {
            // Track this node ID as created
            createdNodeIdsRef.current.add(args.id);
            console.log('📝 Added to createdNodeIds:', args.id, 'Total:', createdNodeIdsRef.current.size);

            // Construct legacy XML for persistence
            const xmlArtifact = `<claraArtifact type="${args.type === 'code' ? 'code' : 'code'}" id="${args.id}" title="${args.title}">\n${args.content}\n</claraArtifact>`;

            // Append to text content
            finalContent += `\n\n${xmlArtifact}`;

            // Calculate position based on all created nodes
            const allCreatedIds = Array.from(createdNodeIdsRef.current);
            const nodeIndex = allCreatedIds.indexOf(args.id);
            const x = (nodeIndex % 3) * 450;
            const y = Math.floor(nodeIndex / 3) * 850;

            // Persist node to database with position
            try {
              console.log('💾 Persisting artifact to database:', {
                designId,
                nodeId: args.id,
                title: args.title || 'Untitled',
                contentLength: args.content.length,
                position: { x, y }
              });
              const result = await upsertNode({
                designId,
                nodeId: args.id,
                artifactId: args.id,
                title: args.title || 'Untitled',
                htmlContent: args.content,
                filePath: '',
                language: 'html',
                x,
                y,
              });
              console.log('✅ Artifact persisted:', args.id, 'Result:', result);
            } catch (err) {
              console.error('❌ Failed to persist artifact:', args.id, err);
            }

            // Final node update (mark as not streaming and keep in liveNodes)
            if (onNodeUpdate) {
              const nodes = new Map<string, any>();
              nodes.set(args.id, {
                id: args.id,
                artifactId: args.id,
                title: args.title || 'Untitled',
                htmlContent: args.content,
                isStreaming: false,
                x,
                y,
              });
              onNodeUpdate(nodes);
              console.log('✅ Marked node as complete:', args.id);
            }
          }
        } else {
          console.error("Failed to extract args from tool call:", call.id, call.args.substring(0, 100) + "...");
        }
      }

      // Add a default message if there's no text content but we have tool calls
      if (hasToolCalls && !accumulatedText.trim()) {
        // Add a simple acknowledgment before the artifacts
        finalContent = "I've created the design for you.\n\n" + finalContent;
      }

      // Fallback if no content was generated at all
      if (!finalContent.trim()) {
        if (toolCalls.size > 0) {
          finalContent = "I attempted to generate a design, but encountered an error processing the result. Please try again.";
        } else {
          finalContent = "I received your request but couldn't generate a response. Please try again.";
        }
      }

      // Create final assistant message
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: finalContent,
        timestamp: Date.now(),
      };

      // Add to messages FIRST (before saving to DB) so user sees it immediately
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');

      // Save assistant message to Convex (async, doesn't block UI)
      await createMessage({
        designId,
        role: 'assistant',
        content: finalContent,
      });


    } catch (error) {
      console.error('Error sending message:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
      setStreamingMessage(''); // Clear streaming message immediately
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, designId, createMessage, upsertNode, onError, onNodeUpdate]);

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
