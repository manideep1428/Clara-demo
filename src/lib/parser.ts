interface ParsedFile {
  path: string;
  content: string;
  language: string;
}

interface ParsedArtifact {
  id: string;
  title: string;
  files: ParsedFile[];
}

class ClaraArtifactParser {
  private static getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      'html': 'html',
      'css': 'css',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'md': 'markdown',
      'xml': 'xml',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return languageMap[ext] || 'plaintext';
  }

  public static parse(text: string): ParsedArtifact {
    // Extract artifact ID and title
    const artifactMatch = text.match(/<claraArtifact\s+id="([^"]+)"\s+title="([^"]+)">/);
    if (!artifactMatch) {
      throw new Error('No claraArtifact tag found in input');
    }

    const artifactId = artifactMatch[1];
    const artifactTitle = artifactMatch[2];

    // Extract all file actions
    const fileRegex = /<claraAction\s+type="file"\s+filePath="([^"]+)">([\s\S]*?)<\/claraAction>/g;
    const files: ParsedFile[] = [];
    let match: RegExpExecArray | null;

    while ((match = fileRegex.exec(text)) !== null) {
      const filePath = match[1];
      let content = match[2].trim();
      
      // Clean up content - remove leading/trailing whitespace from each line
      content = content
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n');
      
      files.push({
        path: filePath,
        content: content,
        language: this.getLanguageFromPath(filePath)
      });
    }

    if (files.length === 0) {
      throw new Error('No file actions found in artifact');
    }

    return {
      id: artifactId,
      title: artifactTitle,
      files: files
    };
  }

  public static extractFilesByExtension(
    artifact: ParsedArtifact, 
    extension: string
  ): ParsedFile[] {
    return artifact.files.filter(file => 
      file.path.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
    );
  }

  public static getFileByPath(
    artifact: ParsedArtifact, 
    path: string
  ): ParsedFile | undefined {
    return artifact.files.find(file => file.path === path);
  }

  public static toJSON(artifact: ParsedArtifact): string {
    return JSON.stringify(artifact, null, 2);
  }

  public static getFilePaths(artifact: ParsedArtifact): string[] {
    return artifact.files.map(file => file.path);
  }

  public static getLanguages(artifact: ParsedArtifact): string[] {
    const languages = new Set(artifact.files.map(file => file.language));
    return Array.from(languages);
  }

  public static getTotalLines(artifact: ParsedArtifact): number {
    return artifact.files.reduce(
      (total, file) => total + file.content.split('\n').length,
      0
    );
  }

  public static getTotalCharacters(artifact: ParsedArtifact): number {
    return artifact.files.reduce(
      (total, file) => total + file.content.length,
      0
    );
  }
}

// Example usage:
const exampleInput = `
Certainly. I will create this as you requested.

<claraArtifact id="gaming-website-home" title="Gaming Website Home Page">
  <claraAction type="file" filePath="index.html">
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>NEXUS Gaming</title>
    </head>
    <body>
      <h1>Welcome to NEXUS</h1>
    </body>
    </html>
  </claraAction>
</claraArtifact>
`;

// Usage examples:
try {
  // Parse the artifact
  const parsed = ClaraArtifactParser.parse(exampleInput);
  
  console.log('=== Artifact Info ===');
  console.log(`ID: ${parsed.id}`);
  console.log(`Title: ${parsed.title}`);
  console.log(`Files: ${parsed.files.length}`);
  console.log('');
  
  console.log('=== Files ===');
  parsed.files.forEach((file, index) => {
    console.log(`\n[${index + 1}] ${file.path} (${file.language})`);
    console.log(`Lines: ${file.content.split('\n').length}`);
    console.log(`Characters: ${file.content.length}`);
    console.log('Content preview:');
    console.log(file.content.substring(0, 100) + '...');
  });
  
  console.log('\n=== Statistics ===');
  console.log(`Total Lines: ${ClaraArtifactParser.getTotalLines(parsed)}`);
  console.log(`Total Characters: ${ClaraArtifactParser.getTotalCharacters(parsed)}`);
  console.log(`Languages: ${ClaraArtifactParser.getLanguages(parsed).join(', ')}`);
  console.log(`File Paths: ${ClaraArtifactParser.getFilePaths(parsed).join(', ')}`);
  
  // Get specific file
  const htmlFile = ClaraArtifactParser.getFileByPath(parsed, 'index.html');
  if (htmlFile) {
    console.log(`\n=== HTML File Content ===`);
    console.log(htmlFile.content);
  }
  
  // Get files by extension
  const htmlFiles = ClaraArtifactParser.extractFilesByExtension(parsed, 'html');
  console.log(`\n=== HTML Files Count: ${htmlFiles.length} ===`);
  
  // Export to JSON
  console.log('\n=== JSON Export ===');
  console.log(ClaraArtifactParser.toJSON(parsed));
  
} catch (error) {
  if (error instanceof Error) {
    console.error('Parsing error:', error.message);
  }
}

export { ClaraArtifactParser, ParsedFile, ParsedArtifact };