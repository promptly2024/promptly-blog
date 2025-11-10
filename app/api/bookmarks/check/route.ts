import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/actions/syncUser';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
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

        const bookmark = await db.query.bookmarks.findFirst({
            where: (bookmarks, { eq, and }) => 
                and(
                    eq(bookmarks.userId, user.id),
                    eq(bookmarks.postId, postId)
                ),
        });

        return NextResponse.json({
            success: true,
            isBookmarked: !!bookmark,
            bookmarkId: bookmark?.id || null,
        });

    } catch (error) {
        console.error('Error checking bookmark:', error);
        return NextResponse.json(
            { error: 'Failed to check bookmark status' },
            { status: 500 }
        );
    }
}
