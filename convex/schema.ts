import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    designs: defineTable({
        designId: v.string(),
        userId: v.string(),
        name: v.string(),
        nodes: v.string(), // JSON stringified nodes array
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_designId", ["designId"])
        .index("by_userId", ["userId"]),

    messages: defineTable({
        designId: v.string(),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        timestamp: v.number(),
    })
        .index("by_designId", ["designId"])
        .index("by_timestamp", ["timestamp"]),

    nodes: defineTable({
        designId: v.string(),
        nodeId: v.string(),
        artifactId: v.string(),
        title: v.string(),
        htmlContent: v.string(),
        filePath: v.string(),
        language: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_designId", ["designId"])
        .index("by_nodeId", ["nodeId"])
        .index("by_artifactId", ["artifactId"]),
});
