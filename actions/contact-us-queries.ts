"use server";
import { contactQueries } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";

export const createContactQuery = async ({
    name,
    email,
    subject,
    category,
    message,
}: {
    name: string;
    email: string;
    subject: string;
    category: string;
    message: string;
}) => {
    const result = await db.insert(contactQueries).values({
        name,
        email,
        subject: subject,
        category: category,
        message,
        status: "new",
    }).returning();

    return result[0];
};

// 2️⃣ Fetch contact queries with optional filters
export const getContactQueries = async (filters?: {
    status?: "new" | "in_progress" | "resolved";
    category?: string;
}) => {
    // Build filter conditions
    const conditions = [];
    if (filters?.status) {
        conditions.push(eq(contactQueries.status, filters.status));
    }
    if (filters?.category) {
        conditions.push(eq(contactQueries.category, filters.category));
    }

    const query = db
        .select()
        .from(contactQueries)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(sql`${contactQueries.createdAt} DESC`);

    const result = await query;
    return result;
};
