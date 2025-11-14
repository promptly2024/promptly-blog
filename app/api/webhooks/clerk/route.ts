import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logAudit } from '@/actions/logAudit';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('Received Clerk webhook');
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return NextResponse.json('Server misconfiguration', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return NextResponse.json('Missing svix headers', { status: 400 });
  }

  const rawBody = await req.text();
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    console.error('Invalid JSON payload');
    return NextResponse.json('Invalid JSON payload', { status: 400 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent | null = null;

  try {
    // verify using rawBody to preserve exact signature
    evt = wh.verify(rawBody, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json('Webhook verification failed', { status: 400 });
  }

  const adminEmail = ['rohitkuyada@gmail.com'];
  const eventType = (evt?.type ?? payload?.type) as string | undefined;

  if (eventType === 'user.created') {
    console.log('Processing user.created event');
    const data = (evt?.data ?? payload?.data) as any;
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = data ?? {};
    console.log('User data:', data);
    if (!id) return NextResponse.json('Missing user id', { status: 400 });

    const primaryEmail = (email_addresses && email_addresses[0]?.email_address) ? String(email_addresses[0].email_address).toLowerCase().trim() : '';

    let createdUser: any = null;
    let alreadyExists = false;

    try {
      await db.transaction(async (tx) => {
        const existingUser = await tx.select().from(user).where(eq(user.clerkId, id)).limit(1);
        if (existingUser.length > 0) {
          alreadyExists = true;
          return;
        }

        const res = await tx.insert(user).values({
          clerkId: id,
          name: `${first_name ?? ''} ${last_name ?? ''}`.trim(),
          email: primaryEmail,
          avatarUrl: image_url ?? null,
          siteRole: adminEmail.includes(primaryEmail) ? 'admin' : 'user',
          bio: typeof public_metadata?.bio === 'string' ? public_metadata.bio : null,
        }).returning();

        createdUser = res[0] ?? null;
      });
    } catch (error) {
      console.error('Error creating user (transaction):', error);
      return NextResponse.json('Failed to create user', { status: 500 });
    }

    if (alreadyExists) {
      return NextResponse.json('User already exists', { status: 200 });
    }

    if (createdUser) {
      try {
        // logAudit may be independent; log but do not fail webhook processing if audit fails
        await logAudit(createdUser.id, 'user', createdUser.id, 'create', {
          email: createdUser.email,
          siteRole: createdUser.siteRole,
        });
      } catch (err) {
        console.error('Failed to write audit log:', err);
      }
    }
  }

  if (eventType === 'user.updated') {
    const data = (evt?.data ?? payload?.data) as any;
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = data ?? {};
    if (!id) return new Response('Missing user id', { status: 400 });

    const primaryEmail = (email_addresses && email_addresses[0]?.email_address) ? String(email_addresses[0].email_address).toLowerCase().trim() : '';

    try {
      await db.transaction(async (tx) => {
        await tx.update(user)
          .set({
            name: `${first_name ?? ''} ${last_name ?? ''}`.trim(),
            email: primaryEmail,
            avatarUrl: image_url ?? null,
            bio: typeof public_metadata?.bio === 'string' ? public_metadata.bio : null,
          })
          .where(eq(user.clerkId, id));
      });
    } catch (error) {
      console.error('Error updating user (transaction):', error);
      return NextResponse.json('Failed to update user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const data = (evt?.data ?? payload?.data) as any;
    const { id } = data ?? {};
    if (!id) return NextResponse.json('Missing user id', { status: 400 });

    try {
      await db.transaction(async (tx) => {
        await tx.delete(user).where(eq(user.clerkId, id));
      });
    } catch (error) {
      console.error('Error deleting user (transaction):', error);
      return NextResponse.json('Failed to delete user', { status: 500 });
    }
  }

  return NextResponse.json('Webhook processed successfully', { status: 200 });
}
