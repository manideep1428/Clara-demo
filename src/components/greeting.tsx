import { memo } from 'react';
import { Sparkles } from 'lucide-react';

export const Greeting = memo(() => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Welcome to Clara Design</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                    Start a conversation to create beautiful mobile designs. I'll help you build stunning UI screens.
                </p>
            </div>
        </div>
    );
});

Greeting.displayName = 'Greeting';
