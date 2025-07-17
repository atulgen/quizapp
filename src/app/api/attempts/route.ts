import { NextResponse } from 'next/server';
import  db  from '@/db';
import { attempts } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check for existing attempt
    const existingAttempt = await db.select()
      .from(attempts)
      .where(
        and(
          eq(attempts.studentId, body.studentId),
          eq(attempts.quizId, body.quizId)
        )
      )
      .limit(1);

    if (existingAttempt.length > 0) {
      return NextResponse.json(
        { error: 'You have already attempted this quiz' },
        { status: 400 }
      );
    }

    const newAttempt = await db.insert(attempts).values({
      quizId: body.quizId,
      studentId: body.studentId,
      score: body.score,
      passed: body.passed,
    }).returning();

    return NextResponse.json(newAttempt[0]);
  } catch (error) {
    console.error('Attempt submission error:', error);
    return NextResponse.json(
      { error: 'Failed to record attempt' },
      { status: 500 }
    );
  }
}

// Add GET handler to check for existing attempts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const quizId = searchParams.get('quizId');

    if (!studentId || !quizId) {
      return NextResponse.json(
        { error: 'Missing parameters' },
        { status: 400 }
      );
    }

    const existingAttempts = await db.select()
      .from(attempts)
      .where(
        and(
          eq(attempts.studentId, parseInt(studentId)),
          eq(attempts.quizId, parseInt(quizId))
        )
      );

    return NextResponse.json(existingAttempts);
  } catch (error) {
    console.error('Error checking attempts:', error);
    return NextResponse.json(
      { error: 'Failed to check attempts' },
      { status: 500 }
    );
  }
}