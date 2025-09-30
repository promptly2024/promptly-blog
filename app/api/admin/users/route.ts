import { getCurrentUser } from "@/actions/syncUser";
import { posts, user, comments, postReactions, postCollaborators, collaborationInvites } from "@/db/schema";
import { db } from "@/lib/db";
import { parseIntOrDefault } from "@/utils/isValid";
import { currentUser } from "@clerk/nextjs/server";
import { eq, count, ilike, or, and, asc, desc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

        // Parse query params for search, filter, sort
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get("search")?.trim();
        const filterRole = searchParams.get("role");
        const postActivity = searchParams.get("postActivity"); // "none" | "published"
        const sortBy = searchParams.get("sortBy") ?? "createdAt";
        const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";

        // Pagination params
        const pageNum = parseIntOrDefault(searchParams.get("page"), 1, 1);
        const pageSize = parseIntOrDefault(searchParams.get("limit"), 20, 1);
        const offset = (pageNum - 1) * pageSize;

        // Build where conditions
        let whereClauses = [];
        if (search) {
            whereClauses.push(
                // Search by name, email, id (case-insensitive)
                or(
                    ilike(user.name, `%${search}%`),
                    ilike(user.email, `%${search}%`),
                    // Cast user.id to text for ilike
                    sql`${user.id}::text ilike ${`%${search}%`}`
                )
            );
        }
        if (filterRole && (filterRole === "user" || filterRole === "admin")) {
            whereClauses.push(eq(user.siteRole, filterRole as "user" | "admin"));
        }

        // Initial query builder
        let query;
        if (whereClauses.length) {
            query = db.select().from(user).where(and(...whereClauses));
        } else {
            query = db.select().from(user);
        }

        // Fetch total users count (with filters)
        const totalUsersResult = await db.select({ total: count() }).from(user)
            .where(whereClauses.length ? and(...whereClauses) : undefined)
            .execute();
        const totalUsers = totalUsersResult[0]?.total ?? 0;

        // Pagination
        query = query.limit(pageSize).offset(offset);

        // Sorting by user fields
        const sortableUserFields = ["name", "email", "createdAt", "updatedAt"];
        const userFieldMap = {
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        if (sortableUserFields.includes(sortBy)) {
            query = query.orderBy(
                sortDir === "desc" ? desc(userFieldMap[sortBy as keyof typeof userFieldMap]) : asc(userFieldMap[sortBy as keyof typeof userFieldMap])
            );
        }

        // Fetch paginated users
        const usersData = await query.execute();

        // Add counts (posts, comments, reactions, collaborations, invites)
        const usersWithStats = await Promise.all(
            usersData.map(async (u) => {
                const [postCountRes, commentCountRes, reactionCountRes, collaborationsCountRes, invitesCountRes] = await Promise.all([
                    db.select({ count: count() }).from(posts).where(eq(posts.authorId, u.id)).execute(),
                    db.select({ count: count() }).from(comments).where(eq(comments.userId, u.id)).execute(),
                    db.select({ count: count() }).from(postReactions).where(eq(postReactions.userId, u.id)).execute(),
                    db.select({ count: count() }).from(postCollaborators).where(eq(postCollaborators.userId, u.id)).execute(),
                    db.select({ count: count() }).from(collaborationInvites).where(eq(collaborationInvites.inviterId, u.id)).execute(),
                ]);

                return {
                    ...u,
                    postCount: postCountRes[0]?.count ?? 0,
                    commentCount: commentCountRes[0]?.count ?? 0,
                    reactionCount: reactionCountRes[0]?.count ?? 0,
                    collaborationsCount: collaborationsCountRes[0]?.count ?? 0,
                    invitesCount: invitesCountRes[0]?.count ?? 0,
                };
            })
        );

        // Filter by post activity
        let filteredUsers = usersWithStats;
        if (postActivity === "none") {
            filteredUsers = filteredUsers.filter(u => u.postCount === 0);
        } else if (postActivity === "published") {
            filteredUsers = filteredUsers.filter(u => u.postCount > 0);
        }

        // Sort by stats if needed
        const sortableStats = ["postCount", "commentCount", "reactionCount"];
        const statsFieldMap: Record<string, keyof typeof usersWithStats[0]> = {
            postCount: "postCount",
            commentCount: "commentCount",
            reactionCount: "reactionCount",
        };
        if (sortableStats.includes(sortBy)) {
            filteredUsers = filteredUsers.sort((a, b) => {
                const field = statsFieldMap[sortBy];
                const aVal = Number(a[field] ?? 0);
                const bVal = Number(b[field] ?? 0);
                if (sortDir === "desc") return bVal - aVal;
                return aVal - bVal;
            });
        }

        // Paginate after filtering by post activity and sorting by stats
        const totalFiltered = filteredUsers.length;
        const paginatedUsers = filteredUsers.slice(offset, offset + pageSize);
        const pagination = {
            page: pageNum,
            pageSize: pageSize,
            total: totalFiltered,
            totalPages: Math.ceil(totalFiltered / pageSize),
            hasNext: offset + paginatedUsers.length < totalFiltered,
            hasPrev: pageNum > 1
        }
        return NextResponse.json({
            pagination,
            users: paginatedUsers,
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
