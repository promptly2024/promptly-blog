import { getCurrentUser } from "@/actions/syncUser";
import { media, user } from "@/db/schema";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { posts } from "@/db/schema";

async function checkAdmin() {
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
        return { error: "Unauthorized", status: 401 };
    }

    const existingUser = await getCurrentUser();
    if (!existingUser || existingUser.siteRole !== "admin") {
        return { error: "Admins only", status: 403 };
    }

    return null;
}


export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
        }
        const error = await checkAdmin();
        if (error) return NextResponse.json(error, { status: error.status });

        const item = await db
            .select({
                id: media.id,
                url: media.url,
                type: media.type,
                provider: media.provider,
                altText: media.altText,
                createdAt: media.createdAt,
                createdBy: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    siteRole: user.siteRole,
                },
            })
            .from(media)
            .leftJoin(user, eq(media.createdBy, user.id))
            .where(eq(media.id, id))
            .then((res) => res[0]);

        if (!item) {
            return NextResponse.json({ error: "Media not found" }, { status: 404 });
        }
        // Get usage
        const usage = await db
            .select({
                postId: posts.id,
                title: posts.title,
                slug: posts.slug,
                status: posts.status,
                publishedAt: posts.publishedAt,
            })
            .from(posts)
            .where(eq(posts.coverImageId, item.id));

        return NextResponse.json({
            data: { ...item }, usage
        },
            { status: 200 });
    } catch (error) {
        console.error("Error fetching media detail:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH /api/admin/media/:id
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
        }
        const error = await checkAdmin();
        if (error) return NextResponse.json(error, { status: error.status });

        const body = await req.json();
        const { altText, provider } = body;
        if (!altText && !provider) {
            return NextResponse.json(
                { error: "altText or provider are required" },
                { status: 400 }
            );
        }
        if (altText && typeof altText !== "string") {
            return NextResponse.json(
                { error: "altText must be a string" },
                { status: 400 }
            );
        }
        if (provider && typeof provider !== "string") {
            return NextResponse.json(
                { error: "provider must be a string" },
                { status: 400 }
            );
        }
        const updateData: Partial<typeof media> = {};
        if (altText) updateData.altText = altText;
        if (provider) updateData.provider = provider;
        const data = await db
            .update(media)
            .set(updateData)
            .where(eq(media.id, id))
            .returning();

        return NextResponse.json(
            {
                success: true, message: "Media updated successfully",
                data: data,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating media:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE /api/admin/media/:id
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
        }
        const error = await checkAdmin();
        if (error) return NextResponse.json(error, { status: error.status });

        // Update all posts using this media as coverImageId to null
        await db.update(posts).set({ coverImageId: null }).where(eq(posts.coverImageId, id));

        // Delete the media item
        await db.delete(media).where(eq(media.id, id));

        // TODO: Consider deleting associated files from storage if applicable
        return NextResponse.json(
            { success: true, message: "Media deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting media:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}