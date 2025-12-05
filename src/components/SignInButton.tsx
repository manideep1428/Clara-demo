import { SignInButton as ClerkSignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <ClerkSignInButton mode="modal">
      <Button className="relative px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl text-white text-sm font-medium hover:shadow-lg transition duration-300 hover:cursor-pointer">
        Sign In
      </Button>
    </ClerkSignInButton>
  );
}
