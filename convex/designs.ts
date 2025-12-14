import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new design
export const createDesign = mutation({
    args: {
        designId: v.string(),
        userId: v.string(),
        name: v.string(),
        nodes: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Check if design already exists
        const existing = await ctx.db
            .query("designs")
            .withIndex("by_designId", (q) => q.eq("designId", args.designId))
            .first();

        if (existing) {
            // Update existing design instead
            await ctx.db.patch(existing._id, {
                nodes: args.nodes,
                updatedAt: now,
            });
            return existing._id;
        }

        // Create new design
        const designId = await ctx.db.insert("designs", {
            designId: args.designId,
            userId: args.userId,
            name: args.name,
            nodes: args.nodes,
            createdAt: now,
            updatedAt: now,
        });

        return designId;
    },
});

// Update an existing design
export const updateDesign = mutation({
    args: {
        designId: v.string(),
        nodes: v.string(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const design = await ctx.db
            .query("designs")
            .withIndex("by_designId", (q) => q.eq("designId", args.designId))
            .first();

        if (!design) {
            throw new Error("Design not found");
        }

        await ctx.db.patch(design._id, {
            nodes: args.nodes,
            ...(args.name && { name: args.name }),
            updatedAt: Date.now(),
        });

        return design._id;
    },
});

// Get a design by designId
export const getDesign = query({
    args: {
        designId: v.string(),
    },
    handler: async (ctx, args) => {
        const design = await ctx.db
            .query("designs")
            .withIndex("by_designId", (q) => q.eq("designId", args.designId))
            .first();

        if (!design) {
            return null;
        }

        // Parse nodes back to array
        return {
            ...design,
            nodes: JSON.parse(design.nodes),
        };
    },
});

// Get all designs for a user
export const getUserDesigns = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const designs = await ctx.db
            .query("designs")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();

        return designs.map((design) => ({
            ...design,
            nodes: JSON.parse(design.nodes),
        }));
    },
});

// Delete a design
export const deleteDesign = mutation({
    args: {
        designId: v.string(),
    },
    handler: async (ctx, args) => {
        const design = await ctx.db
            .query("designs")
            .withIndex("by_designId", (q) => q.eq("designId", args.designId))
            .first();

        if (!design) {
            throw new Error("Design not found");
        }

        await ctx.db.delete(design._id);
        return { success: true };
    },
});
