import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new message
export const createMessage = mutation({
    args: {
        designId: v.string(),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            designId: args.designId,
            role: args.role,
            content: args.content,
            timestamp: Date.now(),
        });

        return messageId;
    },
});

// Get all messages for a design
export const getMessages = query({
    args: {
        designId: v.string(),
    },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_designId", (q) => q.eq("designId", args.designId))
            .collect();

        // Sort by timestamp
        return messages.sort((a, b) => a.timestamp - b.timestamp);
    },
});

// Delete all messages for a design
export const deleteMessages = mutation({
    args: {
        designId: v.string(),
    },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_designId", (q) => q.eq("designId", args.designId))
            .collect();

        for (const message of messages) {
            await ctx.db.delete(message._id);
        }

        return { success: true, deletedCount: messages.length };
    },
});
