import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { syncUser } from '@/actions/syncUser';
import { z } from 'zod';

export async function GET() {
  try {
    const clerkUser = await syncUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await db
      .select()
      .from(user)
      .where(eq(user.clerkId, clerkUser.id))
      .limit(1);

    if (userProfile.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
