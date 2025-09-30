// app/api/admin/taxonomy/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql, eq, or } from "drizzle-orm";
import { categories, postCategories, postTags, tags } from "@/db/schema";
import { getCurrentUser } from "@/actions/syncUser";
import { currentUser } from "@clerk/nextjs/server";
import { logAudit } from "@/actions/logAudit";
import { success } from "zod";

type BodyType = {
    type: "category" | "tag";
    id?: string;
    name?: string;
    slug?: string;
};

export async function GET() {
    try {
        // Check if user is logged in
        const clerkUser = await currentUser();
        if (!clerkUser?.id) {
            return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
        }

        // Check if user is admin
        const existingUser = await getCurrentUser();
        if (!existingUser || existingUser.siteRole !== "admin") {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }

        const [categoriesResult, tagsResult] = await Promise.all([
            db
                .select({
                    id: categories.id,
                    name: categories.name,
                    createdAt: categories.createdAt,
                    postsCount: sql<number>`cast(count(${postCategories.postId}) as int)`.as("postsCount"),
                })
                .from(categories)
                .leftJoin(postCategories, eq(postCategories.categoryId, categories.id))
                .groupBy(categories.id),

            db
                .select({
                    id: tags.id,
                    name: tags.name,
                    slug: tags.slug,
                    createdAt: tags.createdAt,
                    postsCount: sql<number>`cast(count(${postTags.postId}) as int)`.as("postsCount"),
                })
                .from(tags)
                .leftJoin(postTags, eq(postTags.tagId, tags.id))
                .groupBy(tags.id),
        ]);

        return NextResponse.json({
            success: true,
            message: "Categories and tags fetched successfully",
            categories: categoriesResult,
            tags: tagsResult,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch categories and tags" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        // Check if user is logged in
        const clerkUser = await currentUser();
        if (!clerkUser?.id) {
            return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
        }

        // Check if user is admin
        const existingUser = await getCurrentUser();
        if (!existingUser || existingUser.siteRole !== "admin") {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }

        const body: BodyType = await req.json();

        if (!body.type || !body.name) {
            return NextResponse.json(
                { success: false, message: "type and name are required" },
                { status: 400 }
            );
        }
        if (body.name.length > 64 || body.slug && body.slug.length > 64) {
            return new Response(
                JSON.stringify({ error: "Name or slug too long (max 64 chars)" }),
                { status: 400 }
            );
        }


        if (body.type === "category") {
            // Check if category already exists
            const existingCategoryArr = await db
                .select()
                .from(categories)
                .where(eq(categories.name, body.name))
                .limit(1);
            const existingCategory = existingCategoryArr[0];
            if (existingCategory) {
                logAudit(existingUser.id, 'other', existingCategory.id, 'create', {
                    success: false,
                    message: `Attempted to create duplicate category '${body.name}' by admin ${existingUser.id}`
                });
                return NextResponse.json({ success: true, category: existingCategory, message: "Category already exists" });
            }

            const [inserted] = await db.insert(categories).values({ name: body.name }).returning();
            return NextResponse.json({ success: true, category: inserted });
        }

        if (body.type === "tag") {
            if (!body.slug) {
                return NextResponse.json(
                    { success: false, message: "slug is required for tags" },
                    { status: 400 }
                );
            }

            // Check if tag with same name or slug already exists
            const existingTagArr = await db
                .select()
                .from(tags)
                .where(
                    or(eq(tags.name, body.name), eq(tags.slug, body.slug))
                )
                .limit(1);
            const existingTag = existingTagArr[0];
            if (existingTag) {
                logAudit(existingUser.id, 'other', existingTag.id, 'create', {
                    success: false,
                    message: `Attempted to create duplicate tag '${body.name}' or slug '${body.slug}' by admin ${existingUser.id}`
                });
                return NextResponse.json({ success: true, tag: existingTag, message: "Tag already exists" });
            }

            const [inserted] = await db.insert(tags).values({ name: body.name, slug: body.slug }).returning();
            logAudit(existingUser.id, 'other', inserted.id, 'create', {
                success: true,
                message: `Tag '${body.name}' created by admin ${existingUser.id}`
            });
            return NextResponse.json({ success: true, tag: inserted });
        }

        return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Failed to create item" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        // Check if user is logged in
        const clerkUser = await currentUser();
        if (!clerkUser?.id) {
            return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
        }

        // Check if user is admin
        const existingUser = await getCurrentUser();
        if (!existingUser || existingUser.siteRole !== "admin") {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }
        const body: BodyType = await req.json();

        if (!body.type || !body.id || !body.name) {
            return NextResponse.json(
                { success: false, message: "type, id, and name are required" },
                { status: 400 }
            );
        }

        if (body.type === "category") {
            const [updated] = await db.update(categories).set({ name: body.name }).where(eq(categories.id, body.id)).returning();
            logAudit(existingUser.id, 'other', updated.id, 'update', {
                success: true,
                message: `Category '${body.name}' updated by admin ${existingUser.id}`
            });
            return NextResponse.json({ success: true, category: updated });
        }

        if (body.type === "tag") {
            if (!body.slug) {
                return NextResponse.json(
                    { success: false, message: "slug is required for tags" },
                    { status: 400 }
                );
            }
            const [updated] = await db.update(tags).set({ name: body.name, slug: body.slug }).where(eq(tags.id, body.id)).returning();
            logAudit(existingUser.id, 'other', updated.id, 'update', {
                success: true,
                message: `Tag '${body.name}' updated by admin ${existingUser.id}`
            });
            return NextResponse.json({ success: true, tag: updated });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Failed to update item" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        // Check if user is logged in
        const clerkUser = await currentUser();
        if (!clerkUser?.id) {
            return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
        }

        // Check if user is admin
        const existingUser = await getCurrentUser();
        if (!existingUser || existingUser.siteRole !== "admin") {
            return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
        }
        const body: BodyType = await req.json();

        if (!body.type || !body.id) {
            return NextResponse.json(
                { success: false, message: "type and id are required" },
                { status: 400 }
            );
        }

        if (body.type === "category") {
            await db.delete(categories).where(eq(categories.id, body.id));
            logAudit(existingUser.id, 'other', body.id, 'delete', {
                success: true,
                message: `Category deleted by admin ${existingUser.id}`
            });
            return NextResponse.json({ success: true, message: "Category deleted" });
        }

        if (body.type === "tag") {
            await db.delete(tags).where(eq(tags.id, body.id));
            logAudit(existingUser.id, 'other', body.id, 'delete', {
                success: true,
                message: `Tag deleted by admin ${existingUser.id}`
            });
            return NextResponse.json({ success: true, message: "Tag deleted" });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Failed to delete item" }, { status: 500 });
    }
}