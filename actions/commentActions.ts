"use server";

import { db } from "@/lib/db";
import { comments, user, posts } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { syncUser } from "./syncUser";

export interface CommentData {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export async function addComment(postId: string, content: string) {
  // Use your syncUser function
  const clerkUser = await syncUser();
  if (!clerkUser) {
    throw new Error("You must be signed in to comment");
  }

  if (!content.trim()) {
    throw new Error("Comment content cannot be empty");
  }

  if (content.length > 1000) {
    throw new Error("Comment is too long (maximum 1000 characters)");
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
    throw new Error("Post not found or not available for comments");
  }

  try {
    // Add comment
    await db.insert(comments).values({
      postId,
      userId: dbUser.id,
      content: content.trim(),
      status: 'visible', // Auto-approve for now
    });

    revalidatePath(`/blog/${postId}`);
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment. Please try again');
  }
}

export async function getPostComments(postId: string): Promise<CommentData[]> {
  const commentResults = await db
    .select({
      id: comments.id,
      content: comments.content,
      status: comments.status,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      authorId: user.id,
      authorName: user.name,
      authorAvatarUrl: user.avatarUrl,
    })
    .from(comments)
    .innerJoin(user, eq(comments.userId, user.id))
    .where(
      and(
        eq(comments.postId, postId),
        eq(comments.status, 'visible')
      )
    )
    .orderBy(desc(comments.createdAt));

  return commentResults.map((comment) => ({
    id: comment.id,
    content: comment.content,
    status: comment.status,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: {
      id: comment.authorId,
      name: comment.authorName,
      avatarUrl: comment.authorAvatarUrl,
    },
  }));
}

export async function deleteComment(commentId: string) {
  // Use your syncUser function
  const clerkUser = await syncUser();
  if (!clerkUser) {
    throw new Error("You must be signed in to delete comments");
  }

  // Get user from database using clerkId
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.clerkId, clerkUser.id));

  if (!dbUser) {
    throw new Error("User account not found");
  }

  // Check if user owns the comment
  const [comment] = await db
    .select({ postId: comments.postId, userId: comments.userId })
    .from(comments)
    .where(eq(comments.id, commentId));

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== dbUser.id) {
    throw new Error("You can only delete your own comments");
  }

  try {
    // Soft delete comment
    await db
      .update(comments)
      .set({ status: 'deleted' })
      .where(eq(comments.id, commentId));

    revalidatePath(`/blog/${comment.postId}`);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Failed to delete comment. Please try again');
  }
}
