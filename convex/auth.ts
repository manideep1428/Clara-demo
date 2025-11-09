import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { api } from "./_generated/api";

// Helper function to send email via Resend
async function sendVerificationEmail(email: string, code: string, type: "signup" | "login") {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const subject = type === "signup" ? "Verify your email" : "Your login code";
  const verificationLink = `${process.env.APP_URL || "http://localhost:3000"}/auth/verify?code=${code}`;
  
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev", // Change this to your verified domain
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome!</h2>
          <p>Your verification code is: <strong style="font-size: 24px; color: #0ea5e9;">${code}</strong></p>
          <p>Or click the link below to verify:</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px;">
            Verify Email
          </a>
          <p style="color: #666; margin-top: 20px;">This code will expire in 15 minutes.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

// Internal query to get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Internal mutation to create user
export const createUser = mutation({
  args: {
    email: v.string(),
    hashedPassword: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.hashedPassword,
      name: args.name,
      isVerified: false,
      createdAt: Date.now(),
    });
    return userId;
  },
});

// Internal mutation to create verification code
export const createVerificationCode = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    type: v.union(v.literal("signup"), v.literal("login")),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await ctx.db.insert("verificationCodes", {
      email: args.email,
      code: args.code,
      expiresAt: expiresAt,
      type: args.type,
      createdAt: Date.now(),
    });
  },
});

// Internal mutation to delete user
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});

// Signup action
export const signup = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.runQuery(api.auth.getUserByEmail, {
      email: args.email,
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(args.password, 10);

    // Generate verification code
    const code = nanoid(10);

    // Create user (unverified)
    const userId = await ctx.runMutation(api.auth.createUser, {
      email: args.email,
      hashedPassword: hashedPassword,
      name: args.name,
    });

    // Store verification code
    await ctx.runMutation(api.auth.createVerificationCode, {
      email: args.email,
      code: code,
      type: "signup",
    });

    // Send verification email
    try {
      await sendVerificationEmail(args.email, code, "signup");
    } catch (error) {
      // Rollback user creation if email fails
      await ctx.runMutation(api.auth.deleteUser, { userId });
      throw new Error(`Failed to send verification email: ${error}`);
    }

    return {
      success: true,
      message: "Verification email sent. Please check your inbox.",
    };
  },
});

// Login action
export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.runQuery(api.auth.getUserByEmail, {
      email: args.email,
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(args.password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new verification code
      const code = nanoid(10);

      await ctx.runMutation(api.auth.createVerificationCode, {
        email: args.email,
        code: code,
        type: "login",
      });

      await sendVerificationEmail(args.email, code, "login");

      return {
        success: false,
        needsVerification: true,
        message: "Please verify your email. A new verification code has been sent.",
      };
    }

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  },
});

// Verify email mutation
export const verifyEmail = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    // Find verification code
    const verification = await ctx.db
      .query("verificationCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!verification) {
      throw new Error("Invalid verification code");
    }

    // Check if code is expired
    if (verification.expiresAt < Date.now()) {
      await ctx.db.delete(verification._id);
      throw new Error("Verification code has expired");
    }

    // Find and update user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", verification.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update user verification status
    await ctx.db.patch(user._id, {
      isVerified: true,
    });

    // Delete verification code
    await ctx.db.delete(verification._id);

    // Delete all other verification codes for this email
    const otherCodes = await ctx.db
      .query("verificationCodes")
      .withIndex("by_email", (q) => q.eq("email", verification.email))
      .collect();

    for (const code of otherCodes) {
      await ctx.db.delete(code._id);
    }

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  },
});

// Internal mutation to delete verification codes by email
export const deleteVerificationCodesByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const oldCodes = await ctx.db
      .query("verificationCodes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    for (const code of oldCodes) {
      await ctx.db.delete(code._id);
    }
  },
});

// Resend verification code action
export const resendVerificationCode = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.runQuery(api.auth.getUserByEmail, {
      email: args.email,
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("User is already verified");
    }

    // Delete old verification codes
    await ctx.runMutation(api.auth.deleteVerificationCodesByEmail, {
      email: args.email,
    });

    // Generate new verification code
    const code = nanoid(10);

    await ctx.runMutation(api.auth.createVerificationCode, {
      email: args.email,
      code: code,
      type: "signup",
    });

    await sendVerificationEmail(args.email, code, "signup");

    return {
      success: true,
      message: "Verification code sent successfully",
    };
  },
});

// Get current user query
export const getCurrentUser = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
    };
  },
});
