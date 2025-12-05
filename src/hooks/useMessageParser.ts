import { useMemo } from 'react'
import { parseMessageForArtifacts, stripArtifactsFromContent } from '@/lib/messageParser'
import type { Message } from '@/types/chat'

export function useMessageParser(messages: Message[]) {
  const parsedMessages = useMemo(() => {
    return messages.map(message => {
      if (message.role === 'assistant') {
        // Parse artifacts from the message content
        const artifacts = parseMessageForArtifacts(message.content)
        
        // Strip artifact tags from content for cleaner display
        const cleanContent = stripArtifactsFromContent(message.content)
        
        return {
          ...message,
          content: cleanContent,
          artifacts: artifacts.length > 0 ? artifacts : message.artifacts
        }
      }
      
      return message
    })
  }, [messages])

  return parsedMessages
}

export function useArtifactParser(content: string) {
  return useMemo(() => {
    const artifacts = parseMessageForArtifacts(content)
    const cleanContent = stripArtifactsFromContent(content)
    
    return {
      artifacts,
      cleanContent,
      hasArtifacts: artifacts.length > 0
    }
  }, [content])
}
