import { generateChatCompletion } from '@/lib/openai'

interface GenerateTitleInput {
  prompt: string
}

interface GenerateTitleOutput {
  success: boolean
  title?: string
  error?: string
}

export async function generateDesignTitle(input: GenerateTitleInput): Promise<GenerateTitleOutput> {
  try {
    const { prompt } = input

    // Generate a short title using OpenAI
    const title = await generateChatCompletion([
      {
        role: 'system',
        content: 'You are a helpful assistant that generates concise, descriptive titles. Generate a title that is maximum 20 words and captures the essence of the user\'s request. Return only the title, nothing else.'
      },
      {
        role: 'user',
        content: `Generate a short, descriptive title (max 20 words) for this design request: "${prompt}"`
      }
    ], {
      maxTokens: 50,
      temperature: 0.7
    })

    return {
      success: true,
      title: title.trim()
    }
  } catch (error) {
    console.error('Error generating design title:', error)
    return {
      success: false,
      error: 'Failed to generate design title'
    }
  }
}
