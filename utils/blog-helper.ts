import { categories, media, postCategories, posts, user } from "@/db/schema";
import { db } from "@/lib/db";
import { CategoryType } from "@/types/blog";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { serializeDocument } from "./date-formatter";

export const isValidUUID = (id: string): boolean =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const isValidSlug = (slug: string): boolean =>
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

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

    // isOwner means if true, the blog should belongs to owner.
    // Fetch post + cover image
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
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,

            // image info from media
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
        .where(and(eq(posts.id, postId), isOwner ? eq(posts.authorId, userId) : eq(posts.visibility, 'public')))
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
        .leftJoin(postCategories, eq(categories.id, postCategories.categoryId))
        .where(eq(postCategories.postId, post.id))
        .execute();

    return {
        ...post,
        categories: cats.map(serializeDocument),
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
        .leftJoin(postCategories, eq(categories.id, postCategories.categoryId))
        .where(eq(postCategories.postId, postId))
        .execute();

    return cats.map(serializeDocument);
};