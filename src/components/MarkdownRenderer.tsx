import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { cn } from '../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Custom styles for code wrapping
const codeWrapStyles = `
  .markdown-content pre {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    word-break: break-all !important;
  }
  .markdown-content code {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
`;

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: codeWrapStyles }} />
      <div
        className={cn(
          'markdown-content prose prose-xs max-w-none text-xs overflow-hidden',
          'prose-headings:text-xs prose-headings:font-semibold prose-headings:text-foreground prose-headings:mb-1 prose-headings:mt-2',
          'prose-p:text-xs prose-p:text-foreground prose-p:leading-relaxed prose-p:my-1 prose-p:break-words',
          'prose-a:text-xs prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:break-all',
          'prose-strong:text-xs prose-strong:text-foreground prose-strong:font-semibold',
          'prose-code:text-[10px] prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:break-all',
          'prose-pre:text-[10px] prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:p-2 prose-pre:my-2 prose-pre:rounded prose-pre:max-w-full',
          'prose-blockquote:text-xs prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:pl-3 prose-blockquote:my-2 prose-blockquote:break-words',
          'prose-ul:text-xs prose-ul:my-1 prose-ul:pl-4 prose-ol:text-xs prose-ol:my-1 prose-ol:pl-4',
          'prose-li:text-xs prose-li:text-foreground prose-li:my-0.5 prose-li:marker:text-muted-foreground prose-li:break-words',
          'prose-table:text-xs prose-table:text-foreground prose-th:border prose-th:border-border prose-th:p-1 prose-td:border prose-td:border-border prose-td:p-1',
          'prose-hr:border-border prose-hr:my-2',
          className
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </>
  );
}
