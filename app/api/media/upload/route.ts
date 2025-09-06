import { media, user } from "@/db/schema";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { isValidUrl } from "@/utils/helper-blog";

export async function POST(request: NextRequest) {
    try {
        // Authentication check
        const clerkUser = await currentUser();
        if (!clerkUser?.id) {
            return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
        }

        // Parse and validate request body
        const body = await request.json();
        const { imageUrl, altText, provider } = body;

        if (!imageUrl || typeof imageUrl !== "string" || imageUrl.length > 255) {
            return NextResponse.json({ error: "Valid image URL is required and must be 255 characters or less." }, { status: 400 });
        }
        if (altText && (typeof altText !== "string" || altText.length > 255)) {
            return NextResponse.json({ error: "Alt text must be 255 characters or less." }, { status: 400 });
        }
        if (!isValidUrl(imageUrl)) {
            return NextResponse.json({ error: "Image URL must be a valid URL." }, { status: 400 });
        }

        // Check if user exists in our database
        const dbUser = await db.query.user.findFirst({
            where: eq(user.clerkId, clerkUser.id),
        });
        if (!dbUser) {
            return NextResponse.json({ error: "User not found in database." }, { status: 404 });
        }

        // Insert new media record
        const [newMedia] = await db.insert(media).values({
            createdBy: dbUser.id,
            url: imageUrl,
            altText: altText || null,
            type: "image",
            provider,
        }).returning();

        return NextResponse.json({ message: "Image uploaded successfully.", media: newMedia }, { status: 201 });
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}