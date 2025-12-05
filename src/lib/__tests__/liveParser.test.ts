import { describe, it, expect } from 'vitest';
import { LiveClaraParser } from '../liveParser';

describe('LiveClaraParser', () => {
  it('should parse Clara artifact with HTML content', () => {
    const parser = new LiveClaraParser();
    
    const chunk1 = '<claraArtifact id="test-1" title="Test Page">';
    const chunk2 = '<claraAction type="file" filePath="index.html">';
    const chunk3 = '<!DOCTYPE html><html><body>Hello</body></html>';
    const chunk4 = '</claraAction></claraArtifact>';

    parser.processChunk(chunk1);
    parser.processChunk(chunk2);
    const result = parser.processChunk(chunk3);
    parser.processChunk(chunk4);

    expect(result).toBeTruthy();
    expect(result?.id).toBe('test-1');
    expect(result?.title).toBe('Test Page');
    expect(parser.getCurrentHtmlContent()).toContain('Hello');
  });

  it('should handle streaming chunks progressively', () => {
    const parser = new LiveClaraParser();
    
    parser.processChunk('<claraArtifact id="stream-test" title="Streaming">');
    parser.processChunk('<claraAction type="file" filePath="index.html">');
    
    expect(parser.isCapturing()).toBe(true);
    
    parser.processChunk('<!DOCTYPE html>');
    parser.processChunk('<html><body>');
    parser.processChunk('<h1>Title</h1>');
    
    const content = parser.getCurrentHtmlContent();
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('<h1>Title</h1>');
  });
});
