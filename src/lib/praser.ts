// types.ts
export interface TextArtifact {
  type: 'text';
  content: string;
}

export interface CodeArtifact {
  type: 'code';
  id: string;
  title: string;
  content: string;
}

export type ParsedArtifact = TextArtifact | CodeArtifact;

export interface ParseResult {
  artifacts: ParsedArtifact[];
  hasHTML: boolean;
  htmlCount: number;
  textCount: number;
}

// parser.ts
export class ClaraResponseParser {
  /**
   * Parse Clara's response and extract artifacts
   * @param text - The raw response text from Clara
   * @returns ParseResult with all artifacts and metadata
   */
  static parse(text: string): ParseResult {
    if (!text || !text.trim()) {
      return {
        artifacts: [],
        hasHTML: false,
        htmlCount: 0,
        textCount: 0
      };
    }

    const artifacts: ParsedArtifact[] = [];

    // Regex to match claraArtifact tags
    const artifactRegex = /<claraArtifact\s+type="(text|code)"(?:\s+id="([^"]*)")?(?:\s+title="([^"]*)")?\s*>([\s\S]*?)<\/claraArtifact>/gi;

    let match: RegExpExecArray | null;
    let lastIndex = 0;

    // Extract all artifacts
    while ((match = artifactRegex.exec(text)) !== null) {
      // Add any text before this artifact as plain text
      const beforeText = text.slice(lastIndex, match.index).trim();
      if (beforeText) {
        artifacts.push({
          type: 'text',
          content: beforeText
        });
      }

      const [fullMatch, type, id, title, content] = match;

      if (type === 'text') {
        artifacts.push({
          type: 'text',
          content: content.trim()
        });
      } else if (type === 'code') {
        artifacts.push({
          type: 'code',
          id: id || `artifact-${artifacts.length}`,
          title: title || 'Untitled Code',
          content: content.trim()
        });
      }

      lastIndex = match.index + fullMatch.length;
    }

    // Add any remaining text after last artifact
    const remainingText = text.slice(lastIndex).trim();
    if (remainingText) {
      artifacts.push({
        type: 'text',
        content: remainingText
      });
    }

    // If no artifacts found, check for markdown code blocks
    if (artifacts.length === 0) {
      const markdownCodeRegex = /```(html|xml|javascript|css)?\s*([\s\S]*?)```/gi;
      let codeMatch;
      let hasCodeBlocks = false;
      lastIndex = 0;
      const codeArtifacts: ParsedArtifact[] = [];

      while ((codeMatch = markdownCodeRegex.exec(text)) !== null) {
        hasCodeBlocks = true;
        const [fullMatch, content] = codeMatch;

        // Add text before code
        const beforeText = text.slice(lastIndex, codeMatch.index).trim();
        if (beforeText) {
          codeArtifacts.push({
            type: 'text',
            content: beforeText
          });
        }

        // Add code artifact
        // Try to extract title/id from content comment or generate one
        codeArtifacts.push({
          type: 'code',
          id: `artifact-${codeArtifacts.length}`,
          title: 'Generated Design',
          content: content.trim()
        });

        lastIndex = codeMatch.index + fullMatch.length;
      }

      if (hasCodeBlocks) {
        // Add remaining text
        const remaining = text.slice(lastIndex).trim();
        if (remaining) {
          codeArtifacts.push({ type: 'text', content: remaining });
        }
        artifacts.push(...codeArtifacts);
      } else {
        // Truly no artifacts, treat as plain text
        artifacts.push({
          type: 'text',
          content: text
        });
      }
    }

    // Count HTML files and text blocks
    let htmlCount = 0;
    let textCount = 0;

    artifacts.forEach(artifact => {
      if (artifact.type === 'code' && this.isHTML(artifact.content)) {
        htmlCount++;
      } else if (artifact.type === 'text') {
        textCount++;
      }
    });

    return {
      artifacts,
      hasHTML: htmlCount > 0,
      htmlCount,
      textCount
    };
  }

  /**
   * Check if content is HTML
   * @param content - The content to check
   * @returns true if content is HTML
   */
  static isHTML(content: string): boolean {
    return /<!DOCTYPE html>|<html[\s>]/i.test(content);
  }

  /**
   * Download HTML content as a file
   * @param content - HTML content
   * @param filename - Desired filename (default: design.html)
   */
  static downloadHTML(content: string, filename: string = 'design.html'): void {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy content to clipboard
   * @param content - Content to copy
   * @returns Promise that resolves when copied
   */
  static async copyToClipboard(content: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      throw err;
    }
  }

  /**
   * Extract only HTML artifacts from parsed result
   * @param parseResult - The parse result
   * @returns Array of HTML code artifacts
   */
  static extractHTMLArtifacts(parseResult: ParseResult): CodeArtifact[] {
    return parseResult.artifacts.filter(
      (artifact): artifact is CodeArtifact =>
        artifact.type === 'code' && this.isHTML(artifact.content)
    );
  }

  /**
   * Extract only text artifacts from parsed result
   * @param parseResult - The parse result
   * @returns Array of text artifacts
   */
  static extractTextArtifacts(parseResult: ParseResult): TextArtifact[] {
    return parseResult.artifacts.filter(
      (artifact): artifact is TextArtifact => artifact.type === 'text'
    );
  }

  /**
   * Get artifact by ID
   * @param parseResult - The parse result
   * @param id - The artifact ID to find
   * @returns The code artifact or undefined
   */
  static getArtifactById(parseResult: ParseResult, id: string): CodeArtifact | undefined {
    return parseResult.artifacts.find(
      (artifact): artifact is CodeArtifact =>
        artifact.type === 'code' && artifact.id === id
    );
  }

  /**
   * Create a sanitized filename from artifact title
   * @param title - The artifact title
   * @param extension - File extension (default: .html)
   * @returns Sanitized filename
   */
  static createFilename(title: string, extension: string = '.html'): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .concat(extension);
  }
}

// Example usage in your component:
/*
import { ClaraResponseParser, ParseResult, CodeArtifact, TextArtifact } from './parser';

function YourComponent() {
  const [response, setResponse] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  useEffect(() => {
    const result = ClaraResponseParser.parse(response);
    setParseResult(result);
  }, [response]);

  const handleDownload = (artifact: CodeArtifact) => {
    const filename = ClaraResponseParser.createFilename(artifact.title);
    ClaraResponseParser.downloadHTML(artifact.content, filename);
  };

  const handleCopy = async (content: string) => {
    try {
      await ClaraResponseParser.copyToClipboard(content);
      alert('Copied!');
    } catch (err) {
      alert('Failed to copy');
    }
  };

  return (
    <div>
      <textarea 
        value={response} 
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Paste Clara's response here..."
      />
      
      {parseResult && (
        <div>
          <p>Found {parseResult.htmlCount} HTML files</p>
          <p>Found {parseResult.textCount} text blocks</p>
          
          {parseResult.artifacts.map((artifact, index) => (
            <div key={index}>
              {artifact.type === 'text' ? (
                <pre>{artifact.content}</pre>
              ) : (
                <div>
                  <h3>{artifact.title}</h3>
                  <button onClick={() => handleDownload(artifact)}>
                    Download
                  </button>
                  <button onClick={() => handleCopy(artifact.content)}>
                    Copy
                  </button>
                  {ClaraResponseParser.isHTML(artifact.content) && (
                    <iframe srcDoc={artifact.content} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
*/