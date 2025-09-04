import { media, posts, user } from "@/db/schema";
import { db } from "@/lib/db";
import { calculateReadingTime, calculateWordCount, generateExcerpt } from "@/utils/helper-blog";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, isNull, desc, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Types for better type safety
export interface CreatePostRequest {
    title: string;
    contentMd: string;
    excerpt?: string;
    coverImageId?: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    status?: 'draft' | 'published' | 'scheduled';
    visibility?: 'public' | 'private';
    scheduledAt?: string;
}

interface PostsQueryParams {
    page?: string;
    limit?: string;
    status?: string;
    visibility?: string;
    authorId?: string;
    sortBy?: 'createdAt' | 'publishedAt' | 'updatedAt' | 'title';
    sortOrder?: 'asc' | 'desc';
}

// Utility functions
const generateSlug = async (title: string, excludeId?: string): Promise<string> => {
    let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim(); // Trim whitespace

    // Truncate to 50 characters for better SEO
    if (baseSlug.length > 50) {
        baseSlug = baseSlug.substring(0, 50).replace(/-[^-]*$/, '');
    }

    // Check if slug already exists
    let counter = 1;
    let finalSlug = baseSlug;

    while (true) {
        const existingPost = await db.select({ id: posts.id })
            .from(posts)
            .where(
                excludeId
                    ? and(eq(posts.slug, finalSlug), eq(posts.id, excludeId))
                    : eq(posts.slug, finalSlug)
            )
            .limit(1);

        if (existingPost.length === 0) {
            break;
        }

        finalSlug = `${baseSlug}-${counter}`;
        counter++;
    }

    return finalSlug;
};

export async function POST(request: NextRequest) {
    try {
        // Authentication check
        const clerkUser = await currentUser();
        if (!clerkUser || !clerkUser.id) {
            return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
        }

        // Parse and validate request body
        const body: CreatePostRequest = await request.json();
        const {
            title,
            contentMd,
            coverImageId,
            slug: providedSlug,
            status = 'draft',
            visibility = 'public',
            scheduledAt
        } = body;

        // Validation
        if (!title || !contentMd) {
            return NextResponse.json({
                error: "Title and content are required.",
                details: {
                    title: !title ? "Title is required" : null,
                    contentMd: !contentMd ? "Content is required" : null
                }
            }, { status: 400 });
        }

        if (title.length > 256) {
            return NextResponse.json({ error: "Title must be less than 256 characters." }, { status: 400 });
        }

        // Find author
        const authorResult = await db.select().from(user).where(eq(user.clerkId, clerkUser.id));
        if (!authorResult || authorResult.length === 0) {
            return NextResponse.json({ error: "Author not found." }, { status: 404 });
        }
        const author = authorResult[0];

        // Validate cover image if provided
        if (coverImageId) {
            const imageResult = await db.select()
                .from(media)
                .where(eq(media.id, coverImageId))
                .limit(1);

            if (imageResult.length === 0) {
                return NextResponse.json({ error: "Cover image not found." }, { status: 404 });
            }
        }

        // Generate unique slug
        const finalSlug = providedSlug || await generateSlug(title);

        // Calculate content metrics
        const wordCount = calculateWordCount(contentMd);
        const readingTime = calculateReadingTime(contentMd);
        const autoExcerpt = generateExcerpt(contentMd);

        // Get the request origin for canonical URL
        const origin = request.headers.get('origin') ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const canonicalUrl = `${origin}/blog/${finalSlug}`;

        // Prepare timestamps
        const now = new Date();
        const publishedAt = status === 'published' ? now :
            (status === 'scheduled' && scheduledAt ? new Date(scheduledAt) : null);

        // Create post
        const newPostResult = await db.insert(posts).values({
            title,
            contentMd,
            excerpt: autoExcerpt,
            coverImageId: coverImageId || null,
            authorId: author.id,
            slug: finalSlug,
            canonicalUrl,
            metaTitle: title, // later, generate with AI
            metaDescription: autoExcerpt, // later, generate with AI
            status,
            visibility,
            wordCount,
            readingTimeMins: readingTime,
            publishedAt,
            scheduledAt: status === 'scheduled' && scheduledAt ? new Date(scheduledAt) : null,
            approvedAt: status === 'published' ? now : null,
            createdAt: now,
            updatedAt: now,
        }).returning();

        const createdPost = newPostResult[0];

        return NextResponse.json({
            success: true,
            message: "Post created successfully.",
            post: {
                id: createdPost.id,
                title: createdPost.title,
                slug: createdPost.slug,
                status: createdPost.status,
                canonicalUrl: createdPost.canonicalUrl,
                wordCount: createdPost.wordCount,
                readingTimeMins: createdPost.readingTimeMins,
                createdAt: createdPost.createdAt,
                publishedAt: createdPost.publishedAt,
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error creating post:", error);

        // Handle specific database errors
        if (error.code === '23505') { // Unique constraint violation
            return NextResponse.json({
                error: "A post with this slug already exists. Please try a different title or provide a custom slug."
            }, { status: 409 });
        }

        return NextResponse.json({
            error: "Failed to create post.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const params: PostsQueryParams = {
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '10',
            status: searchParams.get('status') || undefined,
            visibility: searchParams.get('visibility') || undefined,
            authorId: searchParams.get('authorId') || undefined,
            sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
            sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
        };

        // Validate pagination
        const page = Math.max(1, parseInt(params.page || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(params.limit || '10'))); // Max 100 posts per page
        const offset = (page - 1) * limit;

        // Build query conditions
        const conditions = [];

        // Only show non-deleted posts
        conditions.push(isNull(posts.deletedAt));

        if (params.status) {
            conditions.push(eq(posts.status, params.status as any));
        }

        if (params.visibility) {
            conditions.push(eq(posts.visibility, params.visibility as any));
        }

        if (params.authorId) {
            conditions.push(eq(posts.authorId, params.authorId));
        }

        // Determine sort order
        const sortColumn = posts[params.sortBy as keyof typeof posts] || posts.createdAt;
        const sortOrder = params.sortOrder === 'asc' ? asc : desc;

        // Execute query with pagination
        const postsResult = await db.select({
            id: posts.id,
            authorId: posts.authorId,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            coverImageId: posts.coverImageId,
            metaTitle: posts.metaTitle,
            metaDescription: posts.metaDescription,
            status: posts.status,
            visibility: posts.visibility,
            publishedAt: posts.publishedAt,
            scheduledAt: posts.scheduledAt,
            wordCount: posts.wordCount,
            readingTimeMins: posts.readingTimeMins,
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
        })
            .from(posts)
            .where(and(...conditions))
            .orderBy(sortOrder(sortColumn as any))
            .limit(limit)
            .offset(offset);

        // Get total count for pagination
        const totalCountResult = await db.select({ count: posts.id })
            .from(posts)
            .where(and(...conditions));

        const totalCount = totalCountResult.length;
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            success: true,
            posts: postsResult,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            filters: {
                status: params.status,
                visibility: params.visibility,
                authorId: params.authorId,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
            }
        });

    } catch (error: any) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({
            error: "Failed to fetch posts.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// PUT method for updating posts
export async function PUT(request: NextRequest) {
    try {
        // Authentication check
        const clerkUser = await currentUser();
        if (!clerkUser || !clerkUser.id) {
            return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: "Post ID is required for updates." }, { status: 400 });
        }

        // Find author
        const authorResult = await db.select().from(user).where(eq(user.clerkId, clerkUser.id));
        if (!authorResult || authorResult.length === 0) {
            return NextResponse.json({ error: "Author not found." }, { status: 404 });
        }

        // Check if post exists and user owns it
        const existingPost = await db.select()
            .from(posts)
            .where(and(eq(posts.id, id), eq(posts.authorId, authorResult[0].id)))
            .limit(1);

        if (existingPost.length === 0) {
            return NextResponse.json({ error: "Post not found or access denied." }, { status: 404 });
        }

        // Update slug if title changed
        if (updateData.title && updateData.title !== existingPost[0].title) {
            updateData.slug = await generateSlug(updateData.title, id);
        }

        // Recalculate metrics if content changed
        if (updateData.contentMd) {
            updateData.wordCount = calculateWordCount(updateData.contentMd);
            updateData.readingTimeMins = calculateReadingTime(updateData.contentMd);

            if (!updateData.excerpt) {
                updateData.excerpt = generateExcerpt(updateData.contentMd);
            }
        }

        // Update timestamps
        updateData.updatedAt = new Date();

        const updatedPost = await db.update(posts)
            .set(updateData)
            .where(eq(posts.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Post updated successfully.",
            post: updatedPost[0]
        });

    } catch (error: any) {
        console.error("Error updating post:", error);
        return NextResponse.json({
            error: "Failed to update post.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
