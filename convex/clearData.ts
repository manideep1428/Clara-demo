import { mutation } from "./_generated/server";

// Clear all data from the database
export const clearAllData = mutation({
    args: {},
    handler: async (ctx) => {
        // Delete all designs
        const designs = await ctx.db.query("designs").collect();
        for (const design of designs) {
            await ctx.db.delete(design._id);
        }

        // Delete all messages
        const messages = await ctx.db.query("messages").collect();
        for (const message of messages) {
            await ctx.db.delete(message._id);
        }

        // Delete all nodes
        const nodes = await ctx.db.query("nodes").collect();
        for (const node of nodes) {
            await ctx.db.delete(node._id);
        }

        return {
            success: true,
            deletedCounts: {
                designs: designs.length,
                messages: messages.length,
                nodes: nodes.length,
            },
        };
    },
});
