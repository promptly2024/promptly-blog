import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, comments, media, postReactions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/actions/syncUser';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = currentUser.id;

    const postStats = await db
      .select({
        status: posts.status,
        count: sql<number>`count(*)::int`,
      })
      .from(posts)
      .where(and(
        eq(posts.authorId, userId),
        sql`${posts.deletedAt} IS NULL`
      ))
      .groupBy(posts.status);

    const statusCounts = {
      draft: 0,
      under_review: 0,
      approved: 0,
      scheduled: 0,
      rejected: 0,
      archived: 0,
    };

    postStats.forEach(stat => {
      statusCounts[stat.status as keyof typeof statusCounts] = stat.count;
    });

    const totalPosts = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    const commentsResult = await db
      .select({
        totalComments: sql<number>`count(*)::int`,
      })
      .from(comments)
      .innerJoin(posts, eq(comments.postId, posts.id))
      .where(and(
        eq(posts.authorId, userId),
        sql`${posts.deletedAt} IS NULL`
      ));

    const totalComments = commentsResult[0]?.totalComments || 0;

    const reactionsResult = await db
      .select({
        totalReactions: sql<number>`count(*)::int`,
      })
      .from(postReactions)
      .innerJoin(posts, eq(postReactions.postId, posts.id))
      .where(and(
        eq(posts.authorId, userId),
        sql`${posts.deletedAt} IS NULL`
      ));

    const totalReactions = reactionsResult[0]?.totalReactions || 0;

    const mediaResult = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(media)
      .where(eq(media.createdBy, userId));

    const mediaUploads = mediaResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalPosts,
        draftPosts: statusCounts.draft,
        underReview: statusCounts.under_review,
        approvedPosts: statusCounts.approved,
        scheduledPosts: statusCounts.scheduled,
        rejectedPosts: statusCounts.rejected,
        archivedPosts: statusCounts.archived,
        totalComments,
        totalReactions,
        mediaUploads,
      }
    });

  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
