import { user } from "@/db/schema";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function syncUser() {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    // check if user exists in DB
    const existing = await db.select().from(user).where(eq(user.id, clerkUser.id));

    if (existing.length === 0) {
        // if not, create new
        await db.insert(user).values({
            id: clerkUser.id, // likely your PK
            name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
            avatarUrl: clerkUser.imageUrl ?? null
        });
    } else {
        // if exists, you can update info
        await db.update(user)
            .set({
                name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`,
                email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
                avatarUrl: clerkUser.imageUrl ?? null,
                bio: typeof clerkUser.publicMetadata.bio === "string" ? clerkUser.publicMetadata.bio : null,
            })
            .where(eq(user.id, clerkUser.id));
    }

    return clerkUser;
}
