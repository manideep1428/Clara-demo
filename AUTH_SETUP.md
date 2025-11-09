# Custom Email Authentication Setup

This project uses a custom email authentication system with Resend for sending verification emails and Convex for data storage.

## Features

- ✅ Email/Password signup and login
- ✅ Email verification with codes
- ✅ Secure password hashing with bcryptjs
- ✅ Beautiful, modern UI with TailwindCSS
- ✅ Data stored in Convex database
- ✅ Email sending via Resend API

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed:
- `resend` - Email sending service
- `bcryptjs` - Password hashing
- `nanoid` - Unique code generation

### 2. Configure Resend

1. Go to [Resend](https://resend.com) and create an account
2. Navigate to [API Keys](https://resend.com/api-keys)
3. Create a new API key
4. Copy the API key

### 3. Update Environment Variables

Update `.env.local` with your Resend API key:

```env
RESEND_API_KEY=re_your_actual_api_key_here
APP_URL=http://localhost:3000
```

For production, update `APP_URL` to your production domain.

### 4. Configure Convex Environment Variables

Set the Resend API key in your Convex deployment:

```bash
npx convex env set RESEND_API_KEY re_your_actual_api_key_here
npx convex env set APP_URL http://localhost:3000
```

For production:
```bash
npx convex env set RESEND_API_KEY re_your_actual_api_key_here --prod
npx convex env set APP_URL https://yourdomain.com --prod
```

### 5. Update Email Sender

In `convex/auth.ts`, update the `from` field in the `sendVerificationEmail` function:

```typescript
from: "onboarding@resend.dev", // Change to your verified domain
```

To use a custom domain:
1. Add and verify your domain in [Resend Domains](https://resend.com/domains)
2. Update the `from` field to use your domain (e.g., `noreply@yourdomain.com`)

### 6. Start Development

```bash
# Start Convex backend
npx convex dev

# In another terminal, start the dev server
bun run dev
```

## Database Schema

### Users Table
- `email` (string) - User's email address
- `password` (string) - Hashed password
- `name` (optional string) - User's name
- `isVerified` (boolean) - Email verification status
- `createdAt` (number) - Timestamp

### Verification Codes Table
- `email` (string) - Associated email
- `code` (string) - Verification code
- `expiresAt` (number) - Expiration timestamp (15 minutes)
- `type` (union) - "signup" or "login"
- `createdAt` (number) - Timestamp

## API Functions

### Mutations

#### `signup`
Creates a new user account and sends verification email.

```typescript
await convex.mutation(api.auth.signup, {
  email: "user@example.com",
  password: "securepassword",
  name: "John Doe" // optional
});
```

#### `login`
Authenticates a user with email and password.

```typescript
await convex.mutation(api.auth.login, {
  email: "user@example.com",
  password: "securepassword"
});
```

#### `verifyEmail`
Verifies user's email with the provided code.

```typescript
await convex.mutation(api.auth.verifyEmail, {
  code: "abc123xyz"
});
```

#### `resendVerificationCode`
Resends verification code to user's email.

```typescript
await convex.mutation(api.auth.resendVerificationCode, {
  email: "user@example.com"
});
```

### Queries

#### `getCurrentUser`
Retrieves user information by email.

```typescript
await convex.query(api.auth.getCurrentUser, {
  email: "user@example.com"
});
```

## Routes

- `/auth/signup` - User registration page
- `/auth/login` - User login page
- `/auth/verify` - Email verification page

## Authentication Flow

### Signup Flow
1. User fills out signup form with email, password, and optional name
2. Backend hashes password and creates user record (unverified)
3. Generates unique verification code
4. Sends verification email via Resend
5. User receives email with code and verification link
6. User clicks link or enters code on verification page
7. Backend verifies code and marks user as verified
8. User is redirected to home page

### Login Flow
1. User enters email and password
2. Backend verifies credentials
3. If user is not verified, sends new verification code
4. If verified, returns user data and redirects to home
5. User data is stored in localStorage

## Security Features

- Passwords are hashed using bcryptjs with salt rounds of 10
- Verification codes expire after 15 minutes
- Codes are deleted after successful verification
- Email uniqueness is enforced at database level
- Password minimum length of 8 characters

## Customization

### Email Template
Edit the HTML in `convex/auth.ts` > `sendVerificationEmail` function to customize the email appearance.

### Verification Code Length
Change the nanoid length in `convex/auth.ts`:
```typescript
const code = nanoid(10); // Change 10 to desired length
```

### Code Expiration Time
Modify the expiration time in `convex/auth.ts`:
```typescript
const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
```

## Troubleshooting

### TypeScript Errors
The TypeScript errors you see are expected until Convex regenerates the types. Run:
```bash
npx convex dev
```

This will regenerate the types and resolve all errors.

### Email Not Sending
1. Verify your Resend API key is correct
2. Check that environment variables are set in Convex
3. Ensure the `from` email is from a verified domain
4. Check Resend dashboard for error logs

### Verification Code Not Working
1. Check if the code has expired (15 minutes)
2. Verify the code matches exactly (case-sensitive)
3. Try resending a new code

## Production Deployment

1. Set production environment variables in Convex
2. Update `APP_URL` to your production domain
3. Verify your custom domain in Resend
4. Update the `from` email address
5. Deploy your application

## Support

For issues or questions:
- Convex docs: https://docs.convex.dev
- Resend docs: https://resend.com/docs
- TanStack Router: https://tanstack.com/router
