// Live streaming parser for Clara artifacts
export interface ClaraFile {
  path: string;
  content: string;
  language: string;
}

export interface ClaraArtifact {
  id: string;
  title: string;
  files: ClaraFile[];
}

export class LiveClaraParser {
  private buffer: string = '';
  private captureEnabled: boolean = false;
  private currentArtifactId: string = '';
  private currentArtifactTitle: string = '';
  private currentFilePath: string = '';
  private currentFileContent: string = '';
  private insideAction: boolean = false;

  // Process incoming chunk and return parsed artifact if available
  processChunk(chunk: string): ClaraArtifact | null {
    this.buffer += chunk;

    // Detect artifact start
    const artifactMatch = this.buffer.match(/<claraArtifact\s+id="([^"]+)"\s+title="([^"]+)">/);
    if (artifactMatch && !this.currentArtifactId) {
      this.currentArtifactId = artifactMatch[1];
      this.currentArtifactTitle = artifactMatch[2];
    }

    // Detect action start
    const actionMatch = chunk.match(/<claraAction\s+type="file"\s+filePath="([^"]+)">/);
    if (actionMatch) {
      this.currentFilePath = actionMatch[1];
      this.insideAction = true;
      this.captureEnabled = true;
      this.currentFileContent = '';
      return null;
    }

    // Detect action end (but handle it in the capture section below)
    if (chunk.includes('</claraAction>') && !this.captureEnabled) {
      this.insideAction = false;
      return null;
    }

    // Capture file content
    if (this.captureEnabled && this.insideAction) {
      // Remove the opening tag from content if present in this chunk
      let contentChunk = chunk;
      const tagMatch = contentChunk.match(/<claraAction[^>]*>/);
      if (tagMatch) {
        contentChunk = contentChunk.substring(tagMatch[0].length);
      }
      
      // Check for closing tag
      const closingTagIndex = contentChunk.indexOf('</claraAction>');
      if (closingTagIndex !== -1) {
        // Extract content before closing tag
        contentChunk = contentChunk.substring(0, closingTagIndex);
        this.currentFileContent += contentChunk;
        
        // Mark as complete
        this.captureEnabled = false;
        this.insideAction = false;
        
        // Return final artifact
        if (this.currentArtifactId && this.currentFileContent.trim()) {
          const language = this.getLanguageFromPath(this.currentFilePath);
          return {
            id: this.currentArtifactId,
            title: this.currentArtifactTitle,
            files: [{
              path: this.currentFilePath,
              content: this.currentFileContent,
              language
            }]
          };
        }
        return null;
      }
      
      // Add chunk to content
      this.currentFileContent += contentChunk;
      
      // Return partial artifact for live rendering (every chunk with content)
      if (this.currentArtifactId && this.currentFileContent.trim()) {
        const language = this.getLanguageFromPath(this.currentFilePath);
        return {
          id: this.currentArtifactId,
          title: this.currentArtifactTitle,
          files: [{
            path: this.currentFilePath,
            content: this.currentFileContent,
            language
          }]
        };
      }
    }

    return null;
  }

  // Get current HTML content for live rendering
  getCurrentHtmlContent(): string {
    return this.currentFileContent;
  }

  // Check if currently capturing
  isCapturing(): boolean {
    return this.captureEnabled;
  }

  // Get artifact metadata
  getArtifactMetadata(): { id: string; title: string } | null {
    if (this.currentArtifactId) {
      return {
        id: this.currentArtifactId,
        title: this.currentArtifactTitle
      };
    }
    return null;
  }

  // Reset parser state
  reset(): void {
    this.buffer = '';
    this.captureEnabled = false;
    this.currentArtifactId = '';
    this.currentArtifactTitle = '';
    this.currentFilePath = '';
    this.currentFileContent = '';
    this.insideAction = false;
  }

  private getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'html': 'html',
      'css': 'css',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'md': 'markdown'
    };
    return langMap[ext || ''] || 'text';
  }
}
