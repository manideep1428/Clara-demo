import { ClaraArtifactParser, type ParsedArtifact } from './parser'

export function parseMessageForArtifacts(content: string): ParsedArtifact[] {
  const artifacts: ParsedArtifact[] = []
  
  // Look for Clara artifact tags in the message content
  const artifactRegex = /<claraArtifact\s+id="([^"]+)"\s+title="([^"]+)">([\s\S]*?)<\/claraArtifact>/g
  let match: RegExpExecArray | null

  while ((match = artifactRegex.exec(content)) !== null) {
    try {
      // Extract the full artifact text including the tags
      const artifactText = match[0]
      const parsed = ClaraArtifactParser.parse(artifactText)
      artifacts.push(parsed)
    } catch (error) {
      console.error('Failed to parse artifact:', error)
    }
  }

  return artifacts
}

export function hasArtifacts(content: string): boolean {
  return /<claraArtifact\s+id="[^"]+"\s+title="[^"]+">/g.test(content)
}

export function stripArtifactsFromContent(content: string): string {
  // Remove artifact tags but keep the confirmation text
  return content.replace(/<claraArtifact\s+id="[^"]+"\s+title="[^"]+">([\s\S]*?)<\/claraArtifact>/g, '')
    .replace(/^\s*Certainly\.\s*I\s*will\s*create\s*this\s*as\s*you\s*requested\.\s*/i, 'I created the requested interface for you.')
    .trim()
}
