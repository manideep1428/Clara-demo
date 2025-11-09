# Quick Start Guide - Custom Email Authentication

## 🚀 Get Started in 3 Steps

### Step 1: Get Your Resend API Key

1. Visit [resend.com](https://resend.com) and sign up
2. Go to [API Keys](https://resend.com/api-keys)
3. Create a new API key
4. Copy the key (starts with `re_`)

### Step 2: Configure Environment Variables

Update `.env.local`:
```env
RESEND_API_KEY=re_your_actual_api_key_here
```

Set in Convex:
```bash
npx convex env set RESEND_API_KEY re_your_actual_api_key_here
npx convex env set APP_URL http://localhost:3000
```

### Step 3: Start the Application

```bash
# Terminal 1: Start Convex
npx convex dev

# Terminal 2: Start dev server
bun run dev
```

## 🎯 Test the Authentication

1. Open http://localhost:3000
2. Click "Sign Up" in the top right
3. Fill in your details and submit
4. Check your email for the verification code
5. Enter the code or click the verification link
6. You're logged in! 🎉

## 📁 What Was Created

### Backend (Convex)
- `convex/schema.ts` - Database schema for users and verification codes
- `convex/auth.ts` - Authentication mutations and queries

### Frontend (React)
- `src/routes/auth.signup.tsx` - Signup page
- `src/routes/auth.login.tsx` - Login page
- `src/routes/auth.verify.tsx` - Email verification page
- `src/hooks/useAuth.ts` - Authentication hook
- `src/routes/index.tsx` - Updated home page with auth header

### Documentation
- `AUTH_SETUP.md` - Detailed setup and API documentation
- `QUICK_START.md` - This file

## 🔧 TypeScript Errors?

The TypeScript errors in `convex/auth.ts` are expected and will be resolved automatically when you run:

```bash
npx convex dev
```

This command regenerates the Convex types based on your schema.

## 📧 Email Configuration

By default, emails are sent from `onboarding@resend.dev`. To use your own domain:

1. Add your domain in [Resend Domains](https://resend.com/domains)
2. Verify your domain
3. Update the `from` field in `convex/auth.ts`:
   ```typescript
   from: "noreply@yourdomain.com"
   ```

## 🎨 Features

- ✅ Email/password authentication
- ✅ Email verification with codes
- ✅ Secure password hashing
- ✅ Beautiful UI with TailwindCSS
- ✅ Persistent login with localStorage
- ✅ User profile display
- ✅ Logout functionality

## 🔐 Security

- Passwords hashed with bcryptjs (10 salt rounds)
- Verification codes expire in 15 minutes
- Email uniqueness enforced
- Codes deleted after verification

## 📚 Next Steps

- Read `AUTH_SETUP.md` for detailed documentation
- Customize email templates in `convex/auth.ts`
- Add password reset functionality
- Implement protected routes
- Add user profile management

## 🆘 Need Help?

Check the troubleshooting section in `AUTH_SETUP.md` or:
- [Convex Docs](https://docs.convex.dev)
- [Resend Docs](https://resend.com/docs)
- [TanStack Router Docs](https://tanstack.com/router)

## 🎉 You're All Set!

Your custom email authentication system is ready to use. Happy coding!
