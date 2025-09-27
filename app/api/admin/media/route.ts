import { getCurrentUser } from "@/actions/syncUser";
import { media, user } from "@/db/schema";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, ilike, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

async function getMediaList({ page = 1, limit = 20, provider, search }: { page?: number; limit?: number; provider?: string; search?: string }) {
    const offset = (page - 1) * limit;

    const filters = [];
    if (provider) filters.push(eq(media.provider, provider));
    if (search) filters.push(ilike(media.altText, `%${search}%`));

    // Query for items
    const query = db
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
        .leftJoin(user, eq(media.createdBy, user.id));

    if (filters.length > 0) {
        query.where(and(...filters));
    }

    const items = await query.limit(limit).offset(offset);

    // Count query with filters
    const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(media);

    if (filters.length > 0) {
        countQuery.where(and(...filters));
    }

    const [{ count }] = await countQuery;

    const pagination = {
        page, limit,
        total: Number(count),
        hasNext: offset + items.length < Number(count),
        hasPrevious: page > 1
    };
    return { pagination, items };
}

export async function GET(req: Request) {
    try {
        // Check if user is logged in
        const clerkUser = await currentUser();
        if (!clerkUser?.id) {
            return NextResponse.json(
                { error: "Unauthorized, please log in." },
                { status: 401 }
            );
        }

        // Check if user is admin
        const existingUser = await getCurrentUser();
        if (!existingUser || existingUser.siteRole !== "admin") {
            return NextResponse.json(
                { error: "Access Denied. Admins only." },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const provider = searchParams.get("provider") || undefined;
        const search = searchParams.get("search") || undefined;

        const data = await getMediaList({ page, limit, provider, search });

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error fetching media:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
