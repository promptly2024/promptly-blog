import { categories, comments, commentReactions, media, postCategories, postReactions, posts, user } from "@/db/schema";
import { db } from "@/lib/db";
import { CategoryType } from "@/types/blog";
import { currentUser } from "@clerk/nextjs/server";
import { and, count, eq, inArray } from "drizzle-orm";
import { serializeDocument } from "./date-formatter";
import { isValidUUID } from "./isValid";

const resolvePostId = async (idOrSlug: string): Promise<string | null> => {
    const whereClause = isValidUUID(idOrSlug)
        ? eq(posts.id, idOrSlug)
        : eq(posts.slug, idOrSlug);

    const result = await db
        .select({ id: posts.id })
        .from(posts)
        .where(whereClause)
        .limit(1)
        .execute();

    return result[0]?.id ?? null;
};

export const getUserIdFromClerk = async (): Promise<string> => {
    const clerkUser = await currentUser();
    if (!clerkUser?.id) throw new Error("Unauthorized, please log in.");

    const dbUser = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.clerkId, clerkUser.id))
        .limit(1)
        .execute();

    const userId = dbUser[0]?.id;
    if (!userId) throw new Error("Unauthorized, user not found.");
    return userId;
};

export const fetchPostWithCategories = async (
    idOrSlug: string,
    userId: string,
    isOwner: boolean,
) => {
    const postId = await resolvePostId(idOrSlug);
    if (!postId) throw new Error("Post not found.");

    // Main post query with cover image
    const postResult = await db
        .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            contentMd: posts.contentMd,
            coverImageId: posts.coverImageId,
            ogImageUrl: posts.ogImageUrl,
            canonicalUrl: posts.canonicalUrl,
            metaTitle: posts.metaTitle,
            metaDescription: posts.metaDescription,
            status: posts.status,
            visibility: posts.visibility,
            publishedAt: posts.publishedAt,
            authorId: posts.authorId,
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
            deletedAt: posts.deletedAt,

            // Cover image info from media
            coverImage: {
                id: media.id,
                url: media.url,
                type: media.type,
                altText: media.altText,
                provider: media.provider,
            }
        })
        .from(posts)
        .leftJoin(media, eq(posts.coverImageId, media.id))
        .where(and(
            eq(posts.id, postId), 
            isOwner ? eq(posts.authorId, userId) : eq(posts.status, 'published')
        ))
        .limit(1)
        .execute();

    if (postResult.length === 0) throw new Error("Post not found or not yours.");
    const post = postResult[0];

    // Fetch categories
    const cats = await db
        .select({
            id: categories.id,
            name: categories.name,
            createdAt: categories.createdAt,
        })
        .from(categories)
        .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
        .where(eq(postCategories.postId, post.id))
        .execute();

    const reactionCounts = await db
        .select({
            type: postReactions.type,
            count: count(postReactions.id).as('count'),
        })
        .from(postReactions)
        .where(eq(postReactions.postId, post.id))
        .groupBy(postReactions.type)
        .execute();

    // Get user's reactions if authenticated
    let userReactions: { type: string }[] = [];
    if (userId && !isOwner) {
        userReactions = await db
            .select({ type: postReactions.type })
            .from(postReactions)
            .where(
                and(
                    eq(postReactions.postId, post.id),
                    eq(postReactions.userId, userId)
                )
            )
            .execute();
    }

    // Fetch comments with user info
    const commentsData = await db
        .select({
            // Comment fields
            id: comments.id,
            content: comments.content,
            status: comments.status,
            createdAt: comments.createdAt,
            updatedAt: comments.updatedAt,
            
            // User fields
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userAvatarUrl: user.avatarUrl,
        })
        .from(comments)
        .innerJoin(user, eq(comments.userId, user.id))
        .where(and(
            eq(comments.postId, post.id),
            eq(comments.status, 'visible')
        ))
        .orderBy(comments.createdAt)
        .execute();

    // Get comment reaction counts for all comments
    const commentIds = commentsData.map(c => c.id);
    let commentReactionCounts: { commentId: string; type: string; count: number }[] = [];
    
    if (commentIds.length > 0) {
        // Use inArray instead of sql.raw with ANY
        const commentReactionsData = await db
            .select({
                commentId: commentReactions.commentId,
                type: commentReactions.type,
                count: count(commentReactions.id).as('count'),
            })
            .from(commentReactions)
            .where(inArray(commentReactions.commentId, commentIds))
            .groupBy(commentReactions.commentId, commentReactions.type)
            .execute();
        
        commentReactionCounts = commentReactionsData.map(item => ({
            commentId: item.commentId,
            type: item.type,
            count: Number(item.count)
        }));
    }

    // Get user's comment reactions if authenticated
    let userCommentReactions: { commentId: string; type: string }[] = [];
    if (userId && !isOwner && commentIds.length > 0) {
        userCommentReactions = await db
            .select({
                commentId: commentReactions.commentId,
                type: commentReactions.type,
            })
            .from(commentReactions)
            .where(
                and(
                    inArray(commentReactions.commentId, commentIds),
                    eq(commentReactions.userId, userId)
                )
            )
            .execute();
    }

    // Process reaction counts into the expected format
    const reactionCountsFormatted = {
        like: 0,
        love: 0,
        clap: 0,
        insightful: 0,
        laugh: 0,
        sad: 0,
        angry: 0,
    };

    reactionCounts.forEach((reaction) => {
        reactionCountsFormatted[reaction.type as keyof typeof reactionCountsFormatted] = Number(reaction.count);
    });

    // Process user reactions
    const userReactionsFormatted: Record<string, boolean> = {};
    userReactions.forEach((reaction) => {
        userReactionsFormatted[reaction.type] = true;
    });

    // Process comments with their reactions
    const processedComments = commentsData.map((comment) => {
        // Get reaction counts for this comment
        const commentReactions = commentReactionCounts
            .filter(cr => cr.commentId === comment.id)
            .reduce((acc, cr) => {
                acc[cr.type] = cr.count;
                return acc;
            }, {} as Record<string, number>);

        // Get user reactions for this comment
        const commentUserReactions = userCommentReactions
            .filter(ucr => ucr.commentId === comment.id)
            .reduce((acc, ucr) => {
                acc[ucr.type] = true;
                return acc;
            }, {} as Record<string, boolean>);

        return {
            ...comment,
            user: {
                id: comment.userId,
                name: comment.userName,
                email: comment.userEmail,
                avatarUrl: comment.userAvatarUrl,
            },
            reactionCounts: {
                like: 0,
                love: 0,
                clap: 0,
                insightful: 0,
                laugh: 0,
                sad: 0,
                angry: 0,
                ...commentReactions
            },
            userReactions: commentUserReactions,
        };
    });

    return {
        ...post,
        categories: cats.map(serializeDocument),
        reactionCounts: reactionCountsFormatted,
        userReactions: userReactionsFormatted,
        comments: processedComments.map(serializeDocument),
        totalComments: processedComments.length,
        totalReactions: Object.values(reactionCountsFormatted).reduce((sum, count) => sum + count, 0),
    };
};

export const fetchAllCategories = async (): Promise<CategoryType[]> => {
    const categoriesList = await db
        .select({
            id: categories.id,
            name: categories.name,
            createdAt: categories.createdAt,
        })
        .from(categories)
        .execute();

    return categoriesList.map(serializeDocument);
};

export const fetchCategoriesByPostId = async (
    idOrSlug: string
): Promise<CategoryType[]> => {
    const postId = await resolvePostId(idOrSlug);
    if (!postId) return [];

    const cats = await db
        .select({
            id: categories.id,
            name: categories.name,
            createdAt: categories.createdAt,
        })
        .from(categories)
        .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
        .where(eq(postCategories.postId, postId))
        .execute();

    return cats.map(serializeDocument);
};
