import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logAudit } from '@/actions/logAudit';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET environment variable');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { 
      status: 400 
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification failed', { 
      status: 400 
    });
  }

  const adminEmail = ['rohitkuyada@gmail.com'];
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;

    try {
      const newUser = await db.insert(user).values({
        clerkId: id,
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        email: email_addresses[0]?.email_address ?? "",
        avatarUrl: image_url ?? null,
        siteRole: adminEmail.includes(email_addresses[0]?.email_address ?? "") 
          ? "admin" 
          : "user",
        bio: typeof public_metadata?.bio === "string" ? public_metadata.bio : null,
      }).returning();

      if (newUser.length > 0) {
        await logAudit(newUser[0].id, "user", newUser[0].id, "create", {
          email: newUser[0].email,
          siteRole: newUser[0].siteRole,
        });
      }

      console.log('User created:', newUser[0]?.email);
    } catch (error) {
      console.error('Error creating user:', error);
      return new Response('Error: Failed to create user', { 
        status: 500 
      });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;

    try {
      await db.update(user)
        .set({
          name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
          email: email_addresses[0]?.email_address ?? "",
          avatarUrl: image_url ?? null,
          bio: typeof public_metadata?.bio === "string" ? public_metadata.bio : null,
        })
        .where(eq(user.clerkId, id));

      console.log('User updated:', email_addresses[0]?.email_address);
    } catch (error) {
      console.error('Error updating user:', error);
      return new Response('Error: Failed to update user', { 
        status: 500 
      });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await db.delete(user).where(eq(user.clerkId, id!));
      console.log('User deleted:', id);
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error: Failed to delete user', { 
        status: 500 
      });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
