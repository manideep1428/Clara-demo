import { FileText, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileReferenceProps {
    id: string;
    title: string;
    description?: string;
    onClick?: () => void;
}

export function FileReference({ title, description, onClick }: FileReferenceProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left p-3 rounded-lg border border-border/50',
                'bg-gradient-to-br from-muted/30 to-muted/10',
                'hover:from-muted/50 hover:to-muted/20',
                'transition-all duration-200',
                'group cursor-pointer'
            )}
        >
            <div className="flex items-start gap-3">
                {/* File Icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-4 h-4 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <h4 className="text-xs font-semibold text-foreground truncate">
                            {title}
                        </h4>
                    </div>

                    {description && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </button>
    );
}
