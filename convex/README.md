# Convex Backend - Authentication System

This directory contains the Convex backend for the custom email authentication system.

## Files

- **`schema.ts`** - Database schema definition for users and verification codes
- **`auth.ts`** - Authentication mutations and queries

## Environment Variables Required

Set these in your Convex deployment:

```bash
# Development
npx convex env set RESEND_API_KEY re_your_api_key_here
npx convex env set APP_URL http://localhost:3000

# Production
npx convex env set RESEND_API_KEY re_your_api_key_here --prod
npx convex env set APP_URL https://yourdomain.com --prod
```

## Database Tables

### `users`
Stores user account information.

**Fields:**
- `email` (string) - Unique user email
- `password` (string) - Hashed password (bcrypt)
- `name` (string, optional) - User's display name
- `isVerified` (boolean) - Email verification status
- `createdAt` (number) - Account creation timestamp

**Indexes:**
- `by_email` - For fast email lookups

### `verificationCodes`
Stores temporary verification codes for email verification.

**Fields:**
- `email` (string) - Associated user email
- `code` (string) - Unique verification code
- `expiresAt` (number) - Expiration timestamp (15 minutes from creation)
- `type` (union: "signup" | "login") - Code purpose
- `createdAt` (number) - Code creation timestamp

**Indexes:**
- `by_email` - For finding codes by email
- `by_code` - For verifying codes

## API Functions

### Mutations

#### `signup(email, password, name?)`
Creates a new user account and sends verification email.

**Returns:** `{ success: boolean, message: string }`

#### `login(email, password)`
Authenticates user and returns user data if verified.

**Returns:** `{ success: boolean, user?: object, needsVerification?: boolean }`

#### `verifyEmail(code)`
Verifies user email with the provided code.

**Returns:** `{ success: boolean, user: object }`

#### `resendVerificationCode(email)`
Resends verification code to the user's email.

**Returns:** `{ success: boolean, message: string }`

### Queries

#### `getCurrentUser(email)`
Retrieves user information by email.

**Returns:** `{ id, email, name?, isVerified } | null`

## Email Configuration

Emails are sent using the Resend API. The default sender is `onboarding@resend.dev`.

To use a custom domain:
1. Verify your domain in Resend
2. Update the `from` field in `auth.ts`:
   ```typescript
   from: "noreply@yourdomain.com"
   ```

## Security Notes

- Passwords are hashed using bcryptjs with 10 salt rounds
- Verification codes expire after 15 minutes
- Codes are automatically deleted after successful verification
- Email uniqueness is enforced at the database level

## Development

Run Convex in development mode:
```bash
npx convex dev
```

This will:
- Watch for file changes
- Regenerate TypeScript types
- Sync schema with the database
- Enable real-time updates

## Type Generation

Convex automatically generates TypeScript types in `_generated/`. These types are used throughout the application for type safety.

If you see TypeScript errors, ensure Convex is running:
```bash
npx convex dev
```
