import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update a node
export const upsertNode = mutation({
  args: {
    designId: v.string(),
    nodeId: v.string(),
    artifactId: v.string(),
    title: v.string(),
    htmlContent: v.string(),
    filePath: v.string(),
    language: v.string(),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("nodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing node
      await ctx.db.patch(existing._id, {
        title: args.title,
        htmlContent: args.htmlContent,
        filePath: args.filePath,
        language: args.language,
        // Only update position if provided, otherwise keep existing
        ...(args.x !== undefined && { x: args.x }),
        ...(args.y !== undefined && { y: args.y }),
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new node
      return await ctx.db.insert("nodes", {
        designId: args.designId,
        nodeId: args.nodeId,
        artifactId: args.artifactId,
        title: args.title,
        htmlContent: args.htmlContent,
        filePath: args.filePath,
        language: args.language,
        x: args.x,
        y: args.y,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Update node position only
export const updateNodePosition = mutation({
  args: {
    nodeId: v.string(),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    const node = await ctx.db
      .query("nodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .first();

    if (node) {
      await ctx.db.patch(node._id, {
        x: args.x,
        y: args.y,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get all nodes for a design
export const getNodesByDesign = query({
  args: { designId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nodes")
      .withIndex("by_designId", (q) => q.eq("designId", args.designId))
      .collect();
  },
});

// Get a specific node
export const getNode = query({
  args: { nodeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .first();
  },
});

// Delete a node
export const deleteNode = mutation({
  args: { nodeId: v.string() },
  handler: async (ctx, args) => {
    const node = await ctx.db
      .query("nodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .first();

    if (node) {
      await ctx.db.delete(node._id);
    }
  },
});
