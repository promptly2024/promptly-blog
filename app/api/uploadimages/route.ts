import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media, user, posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";
import { Readable } from "stream";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { syncUser } from "@/actions/syncUser";

export async function POST(request: Request) {
  try {
    const clerkUser = await syncUser();
    if (!clerkUser?.id)
      return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });

    // Parse multipart/form-data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const altText = formData.get("altText") as string | null;
    const provider = formData.get("provider") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }
    const filename = file.name; 
    // Upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadStream = () =>
      new Promise<{ url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "promptly-blog" },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined
          ) => {
            if (error || !result) return reject(error);
            resolve({ url: result.secure_url });
          }
        );
        Readable.from(buffer).pipe(stream);
      });

    const { url: imageUrl } = await uploadStream();

    // Find user in DB
    const dbUser = await db.query.user.findFirst({
      where: eq(user.clerkId, clerkUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Save media
    const [newMedia] = await db.insert(media).values({
      createdBy: dbUser.id,
      url: imageUrl,
      altText: altText || filename || "User uploaded image",
      type: "image",
      provider: provider || "cloudinary",
    }).returning();

    return NextResponse.json({ message: "Media saved.", media: newMedia }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// Get all the image user is using in blogs
export async function GET(request: Request) {
  try {
    const clerkUser = await syncUser();
    if (!clerkUser?.id)
      return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });

    // Find user in DB
    const dbUser = await db.query.user.findFirst({
      where: eq(user.clerkId, clerkUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Get all images for this user
    const images = await db.query.media.findMany({
      where: (m) => eq(m.createdBy, dbUser.id) && eq(m.type, "image"),
      orderBy: (m, { desc }) => [desc(m.createdAt)],
    });

    // Only generate publicId for Cloudinary images
    const imagesWithPublicId = images.map((img) => {
      let publicId = "";
      try {
        if (img.url.includes("res.cloudinary.com")) {
          const urlParts = img.url.split("/");
          const folderIndex = urlParts.findIndex((part) => part === "upload");
          if (folderIndex !== -1) {
            publicId = urlParts.slice(folderIndex + 1).join("/").replace(/\.[^/.]+$/, "");
          }
        }
      } catch {
        publicId = "";
      }
      return {
        id: img.id,
        url: img.url,
        publicId,
        alt: img.altText,
        createdAt: img.createdAt,
      };
    });

    return NextResponse.json({ media: imagesWithPublicId }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// Delete endpoint to delete images the user is using to create the blogs
export async function DELETE(request: Request) {
  try {
    const clerkUser = await syncUser();
    if (!clerkUser?.id) {
      return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
    }

    const { id, publicId } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing image id." }, { status: 400 });
    }

    // Find user in database
    const dbUser = await db.query.user.findFirst({
      where: eq(user.clerkId, clerkUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Find media record to delete and check ownership
    const dbMedia = await db.query.media.findFirst({
      where: (m) => eq(m.id, id) && eq(m.createdBy, dbUser.id),
    });
    if (!dbMedia) {
      return NextResponse.json(
        { error: "Media not found or not owned by user." },
        { status: 404 }
      );
    }

    // Run DB changes in a transaction
    await db.transaction(async (tx) => {
      // Nullify coverImageId in posts referencing this media
      await tx
        .update(posts)
        .set({ coverImageId: null })
        .where(eq(posts.coverImageId, id));

      // Delete media record
      await tx.delete(media).where(eq(media.id, id));
    });

    // Delete from Cloudinary outside transaction because external API can't be rolled back
    if (
      publicId &&
      typeof publicId === "string" &&
      dbMedia.url.includes("res.cloudinary.com")
    ) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
        // Not fatal: DB already consistent
      }
    }

    return NextResponse.json({ message: "Image deleted." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}