import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
    theme: 'light',
    setTheme: () => null,
    toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export function ThemeProvider({
    children,
    defaultTheme = 'light',
    storageKey = 'ui-theme',
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        // Only access localStorage in browser environment
        if (isBrowser) {
            return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
        }
        return defaultTheme;
    });

    useEffect(() => {
        // Only run in browser environment
        if (!isBrowser) return;

        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            if (isBrowser) {
                localStorage.setItem(storageKey, theme);
            }
            setTheme(theme);
        },
        toggleTheme: () => {
            const newTheme = theme === 'light' ? 'dark' : 'light';
            if (isBrowser) {
                localStorage.setItem(storageKey, newTheme);
            }
            setTheme(newTheme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};
