// app/api/attempts/sync-time/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { attempts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { attemptId, timeRemaining } = await req.json();

    if (!attemptId || timeRemaining === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // You can store timeRemaining in a custom field or just acknowledge the sync
    // For now, we'll just return success to confirm the connection is alive
    
    return NextResponse.json({ success: true, timeRemaining });
  } catch (error) {
    console.error('Sync time error:', error);
    return NextResponse.json(
      { error: 'Failed to sync time' },
      { status: 500 }
    );
  }
}

