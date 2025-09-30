// app/api/admin/posts/route.ts
import { NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    user,
    posts,
    comments,
    contactQueries,
    collaborationInvites,
    approvalLog,
    auditLogs,
    categories,
    tags,
    postReactions,
    commentReactions,
    postCategories,
    postTags,
    media,
} from "@/db/schema";
import { getCurrentUser } from "@/actions/syncUser";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: Request) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser?.id) {
            return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
        }

        const existingUser = await getCurrentUser();
        if (!existingUser || existingUser.siteRole !== "admin") {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }

        const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(user);
        const [totalPosts] = await db.select({ count: sql<number>`count(*)` }).from(posts);
        const [totalComments] = await db.select({ count: sql<number>`count(*)` }).from(comments);
        const [totalContactQueries] = await db.select({ count: sql<number>`count(*)` }).from(contactQueries);
        const [totalInvites] = await db.select({ count: sql<number>`count(*)` }).from(collaborationInvites);
        const [totalCategories] = await db.select({ count: sql<number>`count(*)` }).from(categories);
        const [totalTags] = await db.select({ count: sql<number>`count(*)` }).from(tags);

        const postsUnderReview = await db
            .select({
                id: posts.id,
                title: posts.title,
                submittedAt: posts.createdAt,
                authorName: user.name,
                coverImageUrl: media.url,
                authorProfileImage: user.avatarUrl,
                authorEmail: user.email,
            })
            .from(posts)
            .leftJoin(user, eq(posts.authorId, user.id))
            .leftJoin(media, eq(posts.coverImageId, media.id))
            .where(eq(posts.status, "under_review"))
            .orderBy(desc(posts.submittedAt))
            .limit(5);

        const scheduledPosts = await db
            .select({
                id: posts.id,
                title: posts.title,
                scheduledAt: posts.scheduledAt,
                authorName: user.name,
                coverImageUrl: media.url,
                authorProfileImage: user.avatarUrl,
                authorEmail: user.email,
            })
            .from(posts)
            .leftJoin(user, eq(posts.authorId, user.id))
            .leftJoin(media, eq(posts.coverImageId, media.id))
            .where(eq(posts.status, "scheduled"))
            .orderBy(desc(posts.scheduledAt))
            .limit(5);

        const flaggedComments = await db
            .select({
                id: comments.id,
                content: comments.content,
                userId: comments.userId,
                createdAt: comments.createdAt,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
            })
            .from(comments)
            .leftJoin(user, eq(comments.userId, user.id))
            .where(eq(comments.status, "flagged"))
            .orderBy(desc(comments.createdAt))
            .limit(5);

        const pendingInvites = await db
            .select({
                id: collaborationInvites.id,
                inviteeEmail: collaborationInvites.inviteeEmail,
                role: collaborationInvites.role,
                createdAt: collaborationInvites.createdAt,
                inviterName: user.name,
                inviterEmail: user.email,
                inviterProfileImage: user.avatarUrl,
            })
            .from(collaborationInvites)
            .leftJoin(user, eq(collaborationInvites.inviterId, user.id))
            .where(eq(collaborationInvites.status, "pending"))
            .orderBy(desc(collaborationInvites.createdAt))
            .limit(5);

        const pendingQueries = await db
            .select({
                id: contactQueries.id,
                name: contactQueries.name,
                email: contactQueries.email,
                subject: contactQueries.subject,
                createdAt: contactQueries.createdAt,
            })
            .from(contactQueries)
            .where(eq(contactQueries.status, "new"))
            .orderBy(desc(contactQueries.createdAt))
            .limit(5);

        const recentApprovals = await db
            .select({
                postId: approvalLog.postId,
                decision: approvalLog.decision,
                reason: approvalLog.reason,
                decidedAt: approvalLog.decidedAt,
                decidedBy: approvalLog.decidedByUserId,
            })
            .from(approvalLog)
            .orderBy(desc(approvalLog.decidedAt))
            .limit(5);

        const recentAuditLogs = await db
            .select({
                id: auditLogs.id,
                actorUserId: auditLogs.actorUserId,
                targetType: auditLogs.targetType,
                targetId: auditLogs.targetId,
                action: auditLogs.action,
                createdAt: auditLogs.createdAt,
            })
            .from(auditLogs)
            .orderBy(desc(auditLogs.createdAt))
            .limit(10);

        const recentUsers = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                siteRole: user.siteRole,
                createdAt: user.createdAt,
            })
            .from(user)
            .orderBy(desc(user.createdAt))
            .limit(5);

        const topCategories = await db
            .select({
                id: categories.id,
                name: categories.name,
                count: sql<number>`count(${postCategories.postId})`,
            })
            .from(categories)
            .leftJoin(postCategories, sql`${categories.id} = ${postCategories.categoryId}`)
            .groupBy(categories.id)
            .orderBy(desc(sql`count(${postCategories.postId})`))
            .limit(10);

        const topTags = await db
            .select({
                id: tags.id,
                name: tags.name,
                count: sql<number>`count(${postTags.postId})`,
            })
            .from(tags)
            .leftJoin(postTags, sql`${tags.id} = ${postTags.tagId}`)
            .groupBy(tags.id)
            .orderBy(desc(sql`count(${postTags.postId})`))
            .limit(10);

        const reactionSummary = await db
            .select({
                type: postReactions.type,
                count: sql<number>`count(*)`,
            })
            .from(postReactions)
            .groupBy(postReactions.type);

        const commentReactionSummary = await db
            .select({
                type: commentReactions.type,
                count: sql<number>`count(*)`,
            })
            .from(commentReactions)
            .groupBy(commentReactions.type);

        return NextResponse.json({
            success: true,
            message: "Admin overview data fetched successfully",
            data: {
                counts: {
                    users: totalUsers.count,
                    posts: totalPosts.count,
                    comments: totalComments.count,
                    contactQueries: totalContactQueries.count,
                    invites: totalInvites.count,
                    categories: totalCategories.count,
                    tags: totalTags.count,
                },
                workflow: {
                    postsUnderReview,
                    scheduledPosts,
                    flaggedComments,
                    pendingInvites,
                    pendingQueries,
                },
                recent: {
                    approvals: recentApprovals,
                    auditLogs: recentAuditLogs,
                    users: recentUsers,
                },
                trends: {
                    topTags,
                    topCategories,
                    postReactions: reactionSummary,
                    commentReactions: commentReactionSummary,
                },
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch admin overview" }, { status: 500 });
    }
}