'use client';

import { memo, useMemo } from 'react';
import { useWindowSize } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

type ChatHeaderProps = {
  chatId: string;
  title?: string;
  onNewChat?: () => void;
};

function PureDesignHeader({
  chatId,
  title,
  onNewChat,
}: ChatHeaderProps) {
  const { width: windowWidth } = useWindowSize();

  const headerTitle = useMemo(() => {
    if (title && title.trim().length > 0) return title;
    const shortId = chatId.slice(0, 8);
    return `Chat · ${shortId}`;
  }, [title, chatId]);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/80 px-2 py-2 backdrop-blur-md md:px-3">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">
            {headerTitle}
          </span>
          <span className="text-[10px] text-muted-foreground">
            ID: {chatId}
          </span>
        </div>
      </div>

      {/* Right section */}
      <div className="ml-auto flex items-center gap-2">
        {(!open || windowWidth < 768) && (
          <Button
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={() => onNewChat?.()}
          >
            <PlusIcon />
            <span className="ml-1 hidden sm:inline">New chat</span>
          </Button>
        )}
      </div>
    </header>
  );
}

export const ChatHeader = memo(
  PureDesignHeader,
  (prevProps, nextProps) => {
    return (
      prevProps.chatId === nextProps.chatId &&
      prevProps.title === nextProps.title
    );
  },
);
