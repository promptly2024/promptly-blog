import { z } from 'zod';
import { syncUser } from '@/actions/syncUser';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';


const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  bio: z.string().max(1000, 'Bio too long').optional(),
});

export async function PUT(request: Request) {
  try {
    const clerkUser = await syncUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const updatedUser = await db
      .update(user)
      .set({
        name: validatedData.name,
        bio: validatedData.bio || null,
        updatedAt: new Date(),
      })
      .where(eq(user.clerkId, clerkUser.id))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues }, 
        { status: 400 }
      );
    }

    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
