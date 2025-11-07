// app/api/attempts/start/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/db';
import { attempts, responses, quizzes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { quizId, studentId } = await req.json();

    if (!quizId || !studentId) {
      return NextResponse.json(
        { error: 'Quiz ID and Student ID are required' },
        { status: 400 }
      );
    }

    // Check for existing in-progress or completed attempts
    const existingAttempts = await db
      .select()
      .from(attempts)
      .where(
        and(
          eq(attempts.quizId, quizId),
          eq(attempts.studentId, studentId)
        )
      );

    // Check if student already completed the quiz
    const completedAttempt = existingAttempts.find(a => a.status === 'completed');
    if (completedAttempt) {
      return NextResponse.json(
        { error: 'You have already completed this quiz' },
        { status: 403 }
      );
    }

    // Find in-progress attempt or create new one
    let attempt = existingAttempts.find(a => a.status === 'in_progress');

    if (attempt) {
      // Resume existing attempt
      const existingResponses = await db
        .select()
        .from(responses)
        .where(eq(responses.attemptId, attempt.id));

      const existingAnswers: Record<number, string> = {};
      const existingChoices: Record<number, string> = {};

      existingResponses.forEach(response => {
        if (response.selectedAnswer) {
          existingAnswers[response.questionId] = response.selectedAnswer;
          existingChoices[response.questionId] = response.selectedAnswer;
        }
      });

      // Calculate time remaining
      const quiz = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId))
        .limit(1);

      const quizDuration = quiz[0]?.timeLimit * 60 || 3600;
      const elapsed = attempt.startedAt 
        ? Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000)
        : 0;
      const timeRemaining = Math.max(0, quizDuration - elapsed);

      return NextResponse.json({
        attemptId: attempt.id,
        existingAnswers,
        existingChoices,
        timeRemaining,
        resumed: true,
      });
    }

    // Create new attempt
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const newAttempt = await db
      .insert(attempts)
      .values({
        quizId,
        studentId,
        status: 'in_progress',
        startedAt: new Date(),
        ipAddress,
        userAgent,
      })
      .returning();

    const quiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    const timeRemaining = quiz[0]?.timeLimit * 60 || 3600;

    return NextResponse.json({
      attemptId: newAttempt[0].id,
      timeRemaining,
      resumed: false,
    });
  } catch (error) {
    console.error('Start attempt error:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz attempt' },
      { status: 500 }
    );
  }
}