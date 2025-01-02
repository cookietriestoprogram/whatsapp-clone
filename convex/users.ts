import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: { 
    userId: v.string(),
    email: v.string(),
    createdAt: v.number(),
    name: v.string(),
    profileImage: v.string()
    
    },
  handler: async (ctx, args) => {

    try {
        const newUser = await ctx.db.insert("users", {
            userId: args.userId,
            email: args.email,
            createdAt: args.createdAt,
            name: args.name,
            profileImage: args.profileImage
        })
        return newUser
    } catch (error) {
        throw new Error("User information did not insert successfully.")
    }

  },
});