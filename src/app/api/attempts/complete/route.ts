// app/api/attempts/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/db';
import { attempts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const {
      attemptId,
      score,
      totalQuestions,
      correctAnswers,
      passed,
      timeSpent,
    } = await req.json();

    if (!attemptId) {
      return NextResponse.json(
        { error: 'Attempt ID is required' },
        { status: 400 }
      );
    }

    // Check if already completed
    const existing = await db
      .select()
      .from(attempts)
      .where(eq(attempts.id, attemptId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    if (existing[0].status === 'completed') {
      return NextResponse.json(
        { error: 'Quiz already submitted' },
        { status: 409 }
      );
    }

    // Update attempt as completed
    const updated = await db
      .update(attempts)
      .set({
        status: 'completed',
        score,
        totalQuestions,
        correctAnswers,
        passed: passed || false,
        completedAt: new Date(),
        timeSpent,
      })
      .where(eq(attempts.id, attemptId))
      .returning();

    return NextResponse.json({
      success: true,
      attemptId: updated[0].id,
      score: updated[0].score,
      passed: updated[0].passed,
    });
  } catch (error) {
    console.error('Complete attempt error:', error);
    return NextResponse.json(
      { error: 'Failed to complete quiz' },
      { status: 500 }
    );
  }
}