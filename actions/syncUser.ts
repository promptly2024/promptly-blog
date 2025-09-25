import { user } from "@/db/schema";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function syncUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const adminEmail = ['rohitkuyada@gmail.com'];

  // check if user exists in DB
  const existing = await db.select().from(user).where(eq(user.clerkId, clerkUser.id));

  if (existing.length === 0) {
    // if not, create new
    await db.insert(user).values({
      clerkId: clerkUser.id,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      avatarUrl: clerkUser.imageUrl ?? null,
      siteRole: adminEmail.includes(clerkUser.emailAddresses[0]?.emailAddress ?? "") ? "admin" : "user",
      bio: typeof clerkUser.publicMetadata.bio === "string" ? clerkUser.publicMetadata.bio : null,
    });
  } else {
    // if exists, update info
    await db.update(user)
      .set({
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        avatarUrl: clerkUser.imageUrl ?? null,
        // siteRole: adminEmail.includes(clerkUser.emailAddresses[0]?.emailAddress ?? "") ? "admin" : "user",
        bio: typeof clerkUser.publicMetadata.bio === "string" ? clerkUser.publicMetadata.bio : null,
      })
      .where(eq(user.clerkId, clerkUser.id));
  }

  return clerkUser;
}

export async function getCurrentUser() {
  await syncUser();
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const existing = await db.select().from(user).where(eq(user.clerkId, clerkUser.id));
  if (existing.length === 0) {
    return null;
  }
  return existing[0];
}