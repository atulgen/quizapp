// app/api/attempts/route.ts
import { NextResponse } from 'next/server';
import  db  from '@/db';
import { attempts } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
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