import { QueryClient } from "@tanstack/react-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider } from "convex/react";
import { ThemeProvider } from "./hooks/use-theme";
import { ClerkProvider } from "@clerk/clerk-react";

export function Providers({ children }: { children: React.ReactNode }) {
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!;
  const CLERK_PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY!;
  
  if (!CONVEX_URL) {
    console.error("missing envar VITE_CONVEX_URL");
  }
  
  if (!CLERK_PUBLISHABLE_KEY) {
    console.error("missing envar VITE_CLERK_PUBLISHABLE_KEY");
  }

  const convexQueryClient = new ConvexQueryClient(CONVEX_URL);

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);
  
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ConvexProvider client={convexQueryClient.convexClient}>
        <ThemeProvider defaultTheme="light" storageKey="clara-theme">
          {children}
        </ThemeProvider>
      </ConvexProvider>
    </ClerkProvider>
  );
}