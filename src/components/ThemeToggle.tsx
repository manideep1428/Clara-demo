import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/use-theme';
import { Button } from './ui/button';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 transition-all hover:bg-muted"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground" />
            ) : (
                <Sun className="w-5 h-5 text-foreground" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
