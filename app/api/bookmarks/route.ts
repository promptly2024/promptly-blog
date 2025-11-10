import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/actions/syncUser';
import { logAudit } from '@/actions/logAudit';
import { db } from '@/lib/db';
import { bookmarks, posts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// POST - Create a bookmark
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { postId } = await request.json();

        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            );
        }

        // Verify post exists and is published
        const post = await db.query.posts.findFirst({
            where: (posts, { eq }) => eq(posts.id, postId),
        });

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        if (post.status !== 'approved' && post.deletedAt === null) {
            return NextResponse.json(
                { error: 'Post is not available for bookmarking' },
                { status: 400 }
            );
        }

        // Create bookmark
        const [bookmark] = await db
            .insert(bookmarks)
            .values({
                userId: user.id,
                postId,
            })
            .returning();

        // Log the action using your logAudit helper
        await logAudit(user.id, 'post', postId, 'create', {
            action: 'bookmark_post',
            bookmarkId: bookmark.id,
        });

        return NextResponse.json(
            { 
                success: true, 
                bookmark,
                message: 'Post bookmarked successfully' 
            },
            { status: 201 }
        );

    } catch (error: any) {
        // Handle duplicate bookmark error
        if (error.code === '23505') {
            return NextResponse.json(
                { error: 'Post already bookmarked' },
                { status: 409 }
            );
        }

        console.error('Bookmark creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create bookmark' },
            { status: 500 }
        );
    }
}

// DELETE - Remove a bookmark
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');

        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            );
        }

        // Delete bookmark
        const result = await db
            .delete(bookmarks)
            .where(
                and(
                    eq(bookmarks.userId, user.id),
                    eq(bookmarks.postId, postId)
                )
            )
            .returning();

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Bookmark not found' },
                { status: 404 }
            );
        }

        // Log the action
        await logAudit(user.id, 'post', postId, 'delete', {
            action: 'unbookmark_post',
            bookmarkId: result[0].id,
        });

        return NextResponse.json(
            { 
                success: true,
                message: 'Bookmark removed successfully' 
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Bookmark deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to remove bookmark' },
            { status: 500 }
        );
    }
}
