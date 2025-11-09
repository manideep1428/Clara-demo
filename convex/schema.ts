import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    isVerified: v.boolean(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  verificationCodes: defineTable({
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    type: v.union(v.literal("signup"), v.literal("login")),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_code", ["code"]),

  designs: defineTable({
    designId: v.string(), // UUID
    userId: v.string(), // User email or ID
    name: v.string(),
    nodes: v.string(), // JSON stringified nodes array
    edges: v.string(), // JSON stringified edges array
    thumbnail: v.optional(v.string()), // Optional thumbnail URL
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_designId", ["designId"])
    .index("by_userId", ["userId"])
    .index("by_userId_updatedAt", ["userId", "updatedAt"]),
});
