import { memo, useMemo } from "react";
import { MessageSquare, User, Code2 } from "lucide-react";
import { ClaraResponseParser } from "../lib/praser";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  // Parse the content if it's from assistant
  const parsedContent = useMemo(() => {
    if (role === "assistant") {
      return ClaraResponseParser.parse(content);
    }
    return null;
  }, [role, content]);

  // Render user message (simple)
  if (isUser) {
    return (
      <div className="flex gap-3 justify-end items-end">
        <div className="max-w-xs px-4 py-2.5 rounded-2xl rounded-br-none text-sm leading-relaxed bg-linear-to-r from-violet-600 to-blue-600 text-white whitespace-pre-wrap">
          {content}
        </div>
        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mb-1">
          <User size={16} className="text-violet-400" />
        </div>
      </div>
    );
  }

  // Get text content to display
  const textContent =
    parsedContent?.artifacts
      .filter(
        (artifact) =>
          artifact.type === "text" &&
          !ClaraResponseParser.isHTML(artifact.content)
      )
      .map((artifact) => artifact.content)
      .join("\n\n") || "";

  // Render assistant message with parsed artifacts
  return (
    <div className="flex gap-3 justify-start items-start">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
        <MessageSquare size={16} className="text-muted-foreground" />
      </div>

      <div className="flex-1 max-w-md space-y-3">
        {textContent && (
          <div
            className={`
              text-sm leading-relaxed text-foreground whitespace-pre-wrap
              ${isStreaming ? "animate-pulse" : ""}
            `}
          >
            {textContent}
          </div>
        )}

        {/* Show count of designs being rendered on canvas */}
        {parsedContent && parsedContent.htmlCount > 0 && (
          <div className="text-xs text-muted-foreground flex items-center gap-2 pt-2">
            <Code2 size={12} />
            <span>
              {isStreaming
                ? `Generating ${parsedContent.htmlCount} design${parsedContent.htmlCount > 1 ? "s" : ""} on canvas...`
                : `${parsedContent.htmlCount} design${parsedContent.htmlCount > 1 ? "s" : ""} on canvas`}
            </span>
          </div>
        )}

        {/* Show generating indicator when streaming but no text yet */}
        {isStreaming && !textContent && parsedContent?.htmlCount === 0 && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <div className="flex gap-1">
              <div
                className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span>Generating...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ChatMessage);
