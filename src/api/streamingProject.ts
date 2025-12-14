import { streamChatCompletion, type ChatMessage } from '@/lib/openai'
import { getSystemPrompt } from '@/lib/prompt'

export interface StreamProjectOptions {
    prompt: string
    userId: string
    onToken?: (token: string) => void
    onComplete?: (projectId: string, fullResponse: string) => void
    onError?: (error: Error) => void
}

/**
 * Creates a new project and streams AI response in real-time
 * Saves tokens to database while streaming
 */
export async function createStreamingProject({
    prompt,
    userId,
    onToken,
    onComplete,
    onError,
}: StreamProjectOptions): Promise<{
    projectId: string
    stream: AsyncGenerator<string, void, unknown>
}> {
    try {
        // Generate UUID for the project
        const projectId = crypto.randomUUID()

        // Prepare messages for AI
        const messages: ChatMessage[] = [
            { role: 'system', content: getSystemPrompt() },
            { role: 'user', content: prompt },
        ]

        // Create the stream
        const stream = streamChatCompletion(messages, {
            maxTokens: 4000,
            temperature: 0.7,
        })

        return { projectId, stream }
    } catch (error) {
        console.error('Error creating streaming project:', error)
        onError?.(error as Error)
        throw error
    }
}

/**
 * Process the stream and save to database
 */
export async function processStream({
    projectId,
    stream,
    userId,
    prompt,
    createDesign,
    createMessage,
    onToken,
    onComplete,
}: {
    projectId: string
    stream: AsyncGenerator<string, void, unknown>
    userId: string
    prompt: string
    createDesign: any
    createMessage: any
    onToken?: (token: string) => void
    onComplete?: (fullResponse: string) => void
}) {
    let fullResponse = ''

    try {
        // Create initial design record
        await createDesign({
            designId: projectId,
            userId,
            name: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
            nodes: JSON.stringify([]),
        })

        // Save user message
        await createMessage({
            designId: projectId,
            role: 'user',
            content: prompt,
            timestamp: Date.now(),
        })

        // Stream and accumulate tokens
        for await (const token of stream) {
            fullResponse += token
            onToken?.(token)

            // Periodically save to database (every 50 characters to reduce DB calls)
            if (fullResponse.length % 50 === 0) {
                await createMessage({
                    designId: projectId,
                    role: 'assistant',
                    content: fullResponse,
                    timestamp: Date.now(),
                })
            }
        }

        // Save final complete response
        await createMessage({
            designId: projectId,
            role: 'assistant',
            content: fullResponse,
            timestamp: Date.now(),
        })

        onComplete?.(fullResponse)
    } catch (error) {
        console.error('Error processing stream:', error)
        throw error
    }
}
