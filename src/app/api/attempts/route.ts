// app/api/attempts/route.ts - Store Quiz Responses After Completion
import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/db';
import { attempts, responses, studentQuizStatus } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      quizId,
      studentId,
      score,
      totalQuestions,
      correctAnswers,
      passed,
      responses: questionResponses,
      timeSpent
    } = body;

    // Validate required fields
    if (!quizId || !studentId || score === undefined || !questionResponses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if student has already completed this quiz
    const existingAttempt = await db
      .select()
      .from(attempts)
      .where(
        and(
          eq(attempts.quizId, quizId),
          eq(attempts.studentId, studentId),
          eq(attempts.status, 'completed')
        )
      )
      .limit(1);

    if (existingAttempt.length > 0) {
      return NextResponse.json(
        { error: 'Quiz already completed' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for security
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 1. Create the attempt record
    const [attempt] = await db
      .insert(attempts)
      .values({
        quizId,
        studentId,
        attemptNumber: 1, // Since we only allow one attempt
        status: 'completed',
        score,
        totalQuestions,
        correctAnswers,
        passed,
        completedAt: new Date(),
        timeSpent,
        ipAddress: clientIP,
        userAgent,
      })
      .returning();

    if (!attempt) {
      throw new Error('Failed to create attempt record');
    }

    // 2. Insert individual question responses
    if (questionResponses.length > 0) {
      const responseInserts = questionResponses.map((response: any) => ({
        attemptId: attempt.id,
        questionId: response.questionId,
        selectedAnswer: response.selectedAnswerChoice || response.selectedAnswer, // Use choice identifier (A, B, C, D)
        isCorrect: response.isCorrect,
        answeredAt: new Date(),
      }));

      try {
        await db.insert(responses).values(responseInserts);
      } catch (error) {
        console.error('Failed to insert responses:', error);
        // Optionally, you could try to delete the attempt record here
        // to maintain some level of consistency
      }
    }

    // 3. Update or create student quiz status
    try {
      const existingStatus = await db
        .select()
        .from(studentQuizStatus)
        .where(
          and(
            eq(studentQuizStatus.studentId, studentId),
            eq(studentQuizStatus.quizId, quizId)
          )
        )
        .limit(1);

      if (existingStatus.length > 0) {
        // Update existing status
        await db
          .update(studentQuizStatus)
          .set({
            status: 'completed',
            attemptsUsed: 1,
            completedAt: new Date(),
            lastAccessedAt: new Date(),
          })
          .where(
            and(
              eq(studentQuizStatus.studentId, studentId),
              eq(studentQuizStatus.quizId, quizId)
            )
          );
      } else {
        // Create new status record
        await db.insert(studentQuizStatus).values({
          studentId,
          quizId,
          status: 'completed',
          attemptsUsed: 1,
          firstAccessedAt: new Date(),
          lastAccessedAt: new Date(),
          completedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to update student quiz status:', error);
      // Status update failed, but attempt was recorded
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      message: 'Quiz completed successfully'
    });

  } catch (error) {
    console.error('Error storing quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to store quiz attempt' },
      { status: 500 }
    );
  }
}

// GET method to retrieve attempt details (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('attemptId');
    const studentId = searchParams.get('studentId');
    const quizId = searchParams.get('quizId');

    if (!attemptId && (!studentId || !quizId)) {
      return NextResponse.json(
        { error: 'Either attemptId or both studentId and quizId are required' },
        { status: 400 }
      );
    }

    let whereCondition;
    if (attemptId) {
      whereCondition = eq(attempts.id, parseInt(attemptId));
    } else {
      whereCondition = and(
        eq(attempts.studentId, parseInt(studentId!)),
        eq(attempts.quizId, parseInt(quizId!))
      );
    }

    const attempt = await db
      .select()
      .from(attempts)
      .where(whereCondition)
      .limit(1);

    if (attempt.length === 0) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    // Get associated responses
    const attemptResponses = await db
      .select()
      .from(responses)
      .where(eq(responses.attemptId, attempt[0].id));

    return NextResponse.json({
      attempt: attempt[0],
      responses: attemptResponses
    });

  } catch (error) {
    console.error('Error fetching attempt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attempt' },
      { status: 500 }
    );
  }
}