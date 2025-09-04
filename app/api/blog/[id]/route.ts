import { posts, user } from "@/db/schema";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// DELETE method for soft deleting posts
export async function DELETE(request: NextRequest) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser || !clerkUser.id) {
            return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('id');

        if (!postId) {
            return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
        }

        // Find author
        const authorResult = await db.select().from(user).where(eq(user.clerkId, clerkUser.id));
        if (!authorResult || authorResult.length === 0) {
            return NextResponse.json({ error: "Author not found." }, { status: 404 });
        }

        // Check if post exists and user owns it
        const existingPost = await db.select()
            .from(posts)
            .where(and(eq(posts.id, postId), eq(posts.authorId, authorResult[0].id)))
            .limit(1);

        if (existingPost.length === 0) {
            return NextResponse.json({ error: "Post not found or access denied." }, { status: 404 });
        }

        // Soft delete
        await db.update(posts)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(posts.id, postId));

        return NextResponse.json({
            success: true,
            message: "Post deleted successfully."
        });

    } catch (error: any) {
        console.error("Error deleting post:", error);
        return NextResponse.json({
            error: "Failed to delete post.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}