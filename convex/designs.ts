import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new design
export const createDesign = mutation({
  args: {
    designId: v.string(),
    userId: v.string(),
    name: v.string(),
    nodes: v.string(),
    edges: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const designId = await ctx.db.insert("designs", {
      designId: args.designId,
      userId: args.userId,
      name: args.name,
      nodes: args.nodes,
      edges: args.edges,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, designId };
  },
});

// Update an existing design
export const updateDesign = mutation({
  args: {
    designId: v.string(),
    nodes: v.string(),
    edges: v.string(),
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
      edges: args.edges,
      ...(args.name && { name: args.name }),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get a design by ID
export const getDesign = query({
  args: { designId: v.string() },
  handler: async (ctx, args) => {
    const design = await ctx.db
      .query("designs")
      .withIndex("by_designId", (q) => q.eq("designId", args.designId))
      .first();

    if (!design) {
      return null;
    }

    return {
      designId: design.designId,
      userId: design.userId,
      name: design.name,
      nodes: JSON.parse(design.nodes),
      edges: JSON.parse(design.edges),
      createdAt: design.createdAt,
      updatedAt: design.updatedAt,
    };
  },
});

// Get all designs for a user
export const getUserDesigns = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const designs = await ctx.db
      .query("designs")
      .withIndex("by_userId_updatedAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return designs.map((design) => ({
      designId: design.designId,
      name: design.name,
      thumbnail: design.thumbnail,
      createdAt: design.createdAt,
      updatedAt: design.updatedAt,
    }));
  },
});

// Delete a design
export const deleteDesign = mutation({
  args: { designId: v.string() },
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

// Rename a design
export const renameDesign = mutation({
  args: {
    designId: v.string(),
    name: v.string(),
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
      name: args.name,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
