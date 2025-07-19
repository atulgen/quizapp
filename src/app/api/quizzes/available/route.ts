// app/api/quizzes/available/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { quizzes, attempts } from '@/db/schema';
import { eq, and, count, max, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('studentId');

    if (!studentIdParam) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const studentId = parseInt(studentIdParam);
    const currentTime = new Date();

    // Get all active quizzes
    const allQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.isActive, true))
      .orderBy(desc(quizzes.createdAt));

    // Get attempt counts for this student
    const studentAttempts = await db
      .select({
        quizId: attempts.quizId,
        totalAttempts: count(),
        lastScore: max(attempts.score),
      })
      .from(attempts)
      .where(eq(attempts.studentId, studentId))
      .groupBy(attempts.quizId);

    // Get completed attempt counts separately
    const completedAttempts = await db
      .select({
        quizId: attempts.quizId,
        completedCount: count(),
      })
      .from(attempts)
      .where(and(eq(attempts.studentId, studentId), eq(attempts.status, 'completed')))
      .groupBy(attempts.quizId);

    // Create maps for quick lookup
    const attemptsMap = new Map(
      studentAttempts.map(attempt => [attempt.quizId, attempt])
    );
    
    const completedMap = new Map(
      completedAttempts.map(attempt => [attempt.quizId, attempt.completedCount])
    );

    // Transform the result
    const availableQuizzes = allQuizzes.map(quiz => {
      const attemptData = attemptsMap.get(quiz.id);
      const totalAttempts = attemptData?.totalAttempts || 0;
      const completedCount = completedMap.get(quiz.id) || 0;
      const lastScore = attemptData?.lastScore || null;
      
      const hasCompleted = completedCount > 0;
      const hasExhaustedAttempts = quiz.maxAttempts !== null && quiz.maxAttempts !== undefined
        ? totalAttempts >= quiz.maxAttempts
        : false;
      const isExpired = (quiz.validFrom && quiz.validFrom > currentTime) || 
                       (quiz.validUntil && quiz.validUntil < currentTime);

      let status = 'available';
      if (hasCompleted) status = 'completed';
      else if (hasExhaustedAttempts) status = 'exhausted';

      const canTakeQuiz = !hasCompleted && !hasExhaustedAttempts && !isExpired;

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        validFrom: quiz.validFrom,
        validUntil: quiz.validUntil,
        maxAttempts: quiz.maxAttempts,
        hasAttempted: totalAttempts > 0,
        attemptCount: totalAttempts,
        canTakeQuiz,
        status,
        lastScore,
        lastPassed: (lastScore !== null && quiz.passingScore !== null && quiz.passingScore !== undefined) ? lastScore >= quiz.passingScore : null
      };
    });

    return NextResponse.json({
      quizzes: availableQuizzes
    });

  } catch (error) {
    console.error('Error fetching available quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available quizzes' },
      { status: 500 }
    );
  }
}