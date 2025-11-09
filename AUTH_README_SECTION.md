# 🔐 Custom Email Authentication

This project includes a complete custom email authentication system with:

- **Email/Password Authentication** - Secure signup and login
- **Email Verification** - Verification codes sent via Resend
- **Password Security** - Bcrypt hashing with salt rounds
- **Modern UI** - Beautiful auth pages with TailwindCSS
- **Convex Backend** - All user data stored in Convex

## Quick Setup

1. **Get Resend API Key**
   ```bash
   # Visit https://resend.com/api-keys
   ```

2. **Configure Environment**
   ```bash
   # Update .env.local
   RESEND_API_KEY=re_your_key_here
   
   # Set in Convex
   npx convex env set RESEND_API_KEY re_your_key_here
   npx convex env set APP_URL http://localhost:3000
   ```

3. **Start Development**
   ```bash
   npx convex dev  # Terminal 1
   bun run dev     # Terminal 2
   ```

## Routes

- `/auth/signup` - Create new account
- `/auth/login` - Sign in
- `/auth/verify` - Email verification

## Documentation

- 📖 [Quick Start Guide](./QUICK_START.md) - Get up and running in 3 steps
- 📚 [Detailed Setup](./AUTH_SETUP.md) - Complete API documentation and customization

## Features

✅ Secure password hashing  
✅ Email verification with expiring codes  
✅ Resend email integration  
✅ User session management  
✅ Beautiful, responsive UI  
✅ TypeScript support  

---

**Note:** TypeScript errors in `convex/auth.ts` will resolve automatically when you run `npx convex dev`.
