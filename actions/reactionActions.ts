"use server";

import { db } from "@/lib/db";
import { postReactions, posts, user } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { syncUser } from "./syncUser";

export type ReactionType = 'like' | 'love' | 'clap' | 'insightful' | 'laugh' | 'sad' | 'angry';

export interface ReactionCounts {
  like: number;
  love: number;
  clap: number;
  insightful: number;
  laugh: number;
  sad: number;
  angry: number;
}

export interface UserReactions {
  [key: string]: boolean;
}

export async function toggleReaction(postId: string, reactionType: ReactionType) {
  // Use your syncUser function
  const clerkUser = await syncUser();
  if (!clerkUser) {
    throw new Error("You must be signed in to react to posts");
  }

  // Get user from database using clerkId
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.clerkId, clerkUser.id));

  if (!dbUser) {
    throw new Error("User account not found. Please try signing in again");
  }

  // Verify post exists and is published
  const [post] = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.id, postId),
        eq(posts.status, 'published')
      )
    );

  if (!post) {
    throw new Error("Post not found or not available");
  }

  try {
    // Check if reaction already exists
    const existingReaction = await db
      .select()
      .from(postReactions)
      .where(
        and(
          eq(postReactions.postId, postId),
          eq(postReactions.userId, dbUser.id),
          eq(postReactions.type, reactionType)
        )
      );

    if (existingReaction.length > 0) {
      // Remove existing reaction (toggle off)
      await db
        .delete(postReactions)
        .where(
          and(
            eq(postReactions.postId, postId),
            eq(postReactions.userId, dbUser.id),
            eq(postReactions.type, reactionType)
          )
        );
    } else {
      // Add new reaction
      await db.insert(postReactions).values({
        postId,
        userId: dbUser.id,
        type: reactionType,
      });
    }

    revalidatePath(`/blog/${postId}`);
  } catch (error) {
    console.error('Error toggling reaction:', error);
    throw new Error('Failed to update reaction. Please try again');
  }
}

export async function getPostReactions(postId: string): Promise<{
  counts: ReactionCounts;
  userReactions: UserReactions;
}> {
  // Use syncUser to get current user (returns null if not authenticated)
  const clerkUser = await syncUser();
  
  // Get reaction counts
  const reactionCountsResult = await db
    .select({
      type: postReactions.type,
      count: sql<number>`count(*)`,
    })
    .from(postReactions)
    .where(eq(postReactions.postId, postId))
    .groupBy(postReactions.type);

  const counts: ReactionCounts = {
    like: 0,
    love: 0,
    clap: 0,
    insightful: 0,
    laugh: 0,
    sad: 0,
    angry: 0,
  };

  reactionCountsResult.forEach((result) => {
    counts[result.type as ReactionType] = result.count;
  });

  // Get user's reactions if authenticated
  let userReactions: UserReactions = {};
  if (clerkUser) {
    const [dbUser] = await db
      .select()
      .from(user)
      .where(eq(user.clerkId, clerkUser.id));

    if (dbUser) {
      const userReactionResults = await db
        .select({ type: postReactions.type })
        .from(postReactions)
        .where(
          and(
            eq(postReactions.postId, postId),
            eq(postReactions.userId, dbUser.id)
          )
        );

      userReactionResults.forEach((reaction) => {
        userReactions[reaction.type] = true;
      });
    }
  }

  return { counts, userReactions };
}
