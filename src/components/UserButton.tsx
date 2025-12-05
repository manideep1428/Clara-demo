import { UserButton as ClerkUserButton } from "@clerk/clerk-react";

export function UserButton() {
  return (
    <ClerkUserButton 
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "w-9 h-9"
        }
      }}
    />
  );
}
