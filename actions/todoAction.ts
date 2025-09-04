"use server";
import { user } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function createUser(name: string, email: string, clerkId: string) {
    // check if user already exists
    const existingUserArr = await db.select().from(user).where(eq(user.email, email)).limit(1);
    const existingUser = existingUserArr[0];
    if (existingUser) {
        throw new Error("User already exists");
    }
    await db.insert(user).values({ name, email, clerkId });
}

export async function getUsers() {
    return await db.select().from(user);
}