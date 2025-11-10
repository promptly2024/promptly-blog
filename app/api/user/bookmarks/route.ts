import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/actions/syncUser';
import { db } from '@/lib/db';
import { bookmarks, posts, user, media } from '@/db/schema';
import { eq, desc, sql, isNull, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Get bookmarked posts with details
        const bookmarkedPosts = await db
            .select({
                bookmarkId: bookmarks.id,
                bookmarkedAt: bookmarks.createdAt,
                post: {
                    id: posts.id,
                    title: posts.title,
                    slug: posts.slug,
                    excerpt: posts.excerpt,
                    status: posts.status,
                    publishedAt: posts.publishedAt,
                    readingTimeMins: posts.readingTimeMins,
                    coverImageUrl: media.url,
                },
                author: {
                    id: user.id,
                    name: user.name,
                    avatarUrl: user.avatarUrl,
                },
            })
            .from(bookmarks)
            .innerJoin(posts, eq(bookmarks.postId, posts.id))
            .innerJoin(user, eq(posts.authorId, user.id))
            .leftJoin(media, eq(posts.coverImageId, media.id))
            .where(
                and(
                    eq(bookmarks.userId, currentUser.id),
                    isNull(posts.deletedAt)
                )
            )
            .orderBy(desc(bookmarks.createdAt))
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(bookmarks)
            .innerJoin(posts, eq(bookmarks.postId, posts.id))
            .where(
                and(
                    eq(bookmarks.userId, currentUser.id),
                    isNull(posts.deletedAt)
                )
            );

        return NextResponse.json({
            success: true,
            data: bookmarkedPosts,
            pagination: {
                page,
                limit,
                total: Number(count),
                totalPages: Math.ceil(Number(count) / limit),
            },
        });

    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookmarks' },
            { status: 500 }
        );
    }
}
