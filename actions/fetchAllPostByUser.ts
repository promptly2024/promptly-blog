import {
    posts,
    media,
    postCategories,
    categories,
    postTags,
    tags,
    postReactions,
    comments,
} from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { pgEnum } from "drizzle-orm/pg-core";

// Utility to keep consistent API responses
const serializeDocument = (doc: any) => ({
    ...doc,
    createdAt: doc.createdAt?.toISOString?.(),
    updatedAt: doc.updatedAt?.toISOString?.(),
    publishedAt: doc.publishedAt?.toISOString?.(),
    scheduledAt: doc.scheduledAt?.toISOString?.(),
    deletedAt: doc.deletedAt?.toISOString?.(),
});

export const fetchAllPostsByUserId = async (
    userId: string,
    onlyPublic: boolean = false
) => {
    // Base condition: authorId must match
    const baseCondition = eq(posts.authorId, userId);

    // If onlyPublic = true, add extra filter
    const condition = onlyPublic
        ? and(baseCondition, eq(posts.visibility, "public"))
        : baseCondition;

    // Select posts with metadata
    const allPostsRaw = await db
        .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            contentMd: posts.contentMd,

            // Media
            coverImageId: posts.coverImageId,
            coverImageUrl: media.url,
            coverImageAlt: media.altText,

            // SEO
            ogImageUrl: posts.ogImageUrl,
            canonicalUrl: posts.canonicalUrl,
            metaTitle: posts.metaTitle,
            metaDescription: posts.metaDescription,

            // Status & visibility
            status: posts.status,
            visibility: posts.visibility,

            // Dates
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
            publishedAt: posts.publishedAt,
            scheduledAt: posts.scheduledAt,
            submittedAt: posts.submittedAt,
            approvedAt: posts.approvedAt,
            rejectedAt: posts.rejectedAt,
            rejectionReason: posts.rejectionReason,
            deletedAt: posts.deletedAt,

            // Analytics
            wordCount: posts.wordCount,
            readingTimeMins: posts.readingTimeMins,

            // Derived counts (comments, reactions)
            commentCount: sql<number>`COUNT(DISTINCT ${comments.id})`,
            reactionCount: sql<number>`COUNT(DISTINCT ${postReactions.id})`,
        })
        .from(posts)
        .leftJoin(media, eq(posts.coverImageId, media.id))
        .leftJoin(comments, eq(comments.postId, posts.id))
        .leftJoin(postReactions, eq(postReactions.postId, posts.id))
        .where(condition)
        .groupBy(
            posts.id,
            media.url,
            media.altText
        )
        .execute();

    const allPosts: UsersBlogType[] = allPostsRaw.map(serializeDocument);

    // Fetch categories + tags separately (since they’re many-to-many)
    const postIds = allPosts.map((p) => p.id);

    const categoriesMap: Record<string, string[]> = {};
    const tagsMap: Record<string, string[]> = {};

    // if (postIds.length > 0) {
    //     const categoriesRes = await db
    //         .select({
    //             postId: postCategories.postId,
    //             categoryName: categories.name,
    //         })
    //         .from(postCategories)
    //         .innerJoin(categories, eq(postCategories.categoryId, categories.id))
    //         .where(sql`${postCategories.postId} IN (${sql.join(postIds)})`);

    //     for (const row of categoriesRes) {
    //         if (!categoriesMap[row.postId]) categoriesMap[row.postId] = [];
    //         categoriesMap[row.postId].push(row.categoryName);
    //     }

    //     const tagsRes = await db
    //         .select({
    //             postId: postTags.postId,
    //             tagName: tags.name,
    //         })
    //         .from(postTags)
    //         .innerJoin(tags, eq(postTags.tagId, tags.id))
    //         .where(sql`${postTags.postId} IN (${sql.join(postIds)})`);

    //     for (const row of tagsRes) {
    //         if (!tagsMap[row.postId]) tagsMap[row.postId] = [];
    //         tagsMap[row.postId].push(row.tagName);
    //     }
    // }

    // Final serialized response
    // return allPosts.map((post) => ({
    //     posts: serializeDocument(post),
    //     categories: categoriesMap[post.id] || [],
    //     tags: tagsMap[post.id] || [],
    // }));
    return allPosts;
};

export interface UsersBlogType {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    contentMd: string;

    // Media
    coverImageId: string | null;
    coverImageUrl: string | null;
    coverImageAlt: string | null;

    // SEO
    ogImageUrl: string | null;
    canonicalUrl: string | null; // <-- changed from string to string | null
    metaTitle: string | null;    // <-- changed from string to string | null
    metaDescription: string | null; // <-- changed from string to string | null

    // Status & visibility
    status: BlogStatusType;
    visibility: BlogVisibilityType;

    // Dates
    createdAt: string | null;    // <-- changed from string to string | null
    updatedAt: string | null;
    publishedAt: string | null;
    scheduledAt: string | null;
    submittedAt: string | null;
    approvedAt: string | null;
    rejectedAt: string | null;
    rejectionReason: string | null;
    deletedAt: string | null;

    // Analytics
    wordCount: number;
    readingTimeMins: number;

    // Derived counts (comments, reactions)
    commentCount: number;
    reactionCount: number;
}

export type BlogStatusType = "draft" | "submitted" | "under_review" | "approved" | "scheduled" | "published" | "rejected" | "archived";
export type BlogVisibilityType = "public" | "unlisted" | "private";