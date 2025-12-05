import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { getSystemPrompt } from './prompt'

const API_KEY = "sk-mega-20fa5d7d1805413dece10dc92d9d1f96e0c07288b21d5124e7ea7a13fb5c9130"

// import.meta.env.VITE_MEGALLM_API_KEY

const systemPrompt = getSystemPrompt();


if (!API_KEY) {
  console.warn('VITE_MEGALLM_API_KEY is not set. OpenAI chat completions will not work.')
}

const client = new OpenAI({
  baseURL: 'https://ai.megallm.io/v1',
  apiKey: 'sk-mega-20fa5d7d1805413dece10dc92d9d1f96e0c07288b21d5124e7ea7a13fb5c9130',
  dangerouslyAllowBrowser: true,
})

export type ChatMessage = ChatCompletionMessageParam

export interface ChatCompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  messages: ChatMessage[]
}

/**
 * Generate text response using OpenAI chat completions
 */
export async function generateChatCompletion(
  messages: ChatMessage[],
  options: Partial<ChatCompletionOptions> = {}
): Promise<string> {

  const {
    model = 'moonshotai/kimi-k2-instruct-0905',
    temperature = 0.7,
    maxTokens = 1000
  } = options

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    })

    return response.choices[0]?.message?.content || 'No response generated'
  } catch (error) {
    console.error('Error generating chat completion:', error)
    throw error
  }
}

/**
 * Stream chat completion responses (for real-time updates)
 */
export async function* streamChatCompletion(
  messages: ChatMessage[],
  options: Partial<ChatCompletionOptions> = {}
): AsyncGenerator<string, void, unknown> {
  const {
    model = 'moonshotai/kimi-k2-instruct-0905',
    temperature = 0.7,
    maxTokens = 4000
  } = options

  try {
    const stream = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        yield content
      }
    }
  } catch (error) {
    console.error('Error streaming chat completion:', error)
    throw error
  }
}

/**
 * Generate a simple text response using OpenAI (convenience function)
 */
export async function generateText(prompt: string | ChatMessage[]): Promise<string> {
  const messages: ChatMessage[] = []

  // Add system prompt if provided
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  // Add user prompt
  messages.push({ role: 'user', content: prompt as string })

  return generateChatCompletion(messages)
}

/**
 * Generate text with conversation context
 */
export async function generateTextWithContext(
  messages: ChatMessage[],
  options?: Partial<ChatCompletionOptions>
): Promise<string> {
  return generateChatCompletion(messages, options)
}

/**
 * Create a text message
 */
export function createTextMessage(role: 'user' | 'assistant' | 'system', content: string): ChatMessage {
  return { role, content }
}

/**
 * Create a user message with image and text
 */
export function createImageMessage(text: string, imageUrl: string, detail: 'low' | 'high' | 'auto' = 'auto'): ChatMessage {
  return {
    role: 'user',
    content: [
      { type: 'text', text },
      { type: 'image_url', image_url: { url: imageUrl, detail } }
    ]
  }
}

/**
 * Convert a file to base64 data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
