// app/api/quiz/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { quizzes, questions, attempts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing its properties
    const resolvedParams = await params;
    const quizId = parseInt(resolvedParams.id);
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    const studentIdNum = parseInt(studentId);

    // Check if student has already attempted this quiz
    const existingAttempts = await db
      .select()
      .from(attempts)
      .where(
        and(
          eq(attempts.quizId, quizId),
          eq(attempts.studentId, studentIdNum),
          eq(attempts.status, 'completed')
        )
      );

    if (existingAttempts.length > 0) {
      return NextResponse.json(
        { error: 'You have already completed this quiz' },
        { status: 403 }
      );
    }

    // Get quiz details
    const quiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (quiz.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Check if quiz is still valid
    const currentQuiz = quiz[0];
    const now = new Date();
        
    if (!currentQuiz.isActive) {
      return NextResponse.json({ error: 'Quiz is not active' }, { status: 403 });
    }

    if (currentQuiz.validUntil && new Date(currentQuiz.validUntil) < now) {
      return NextResponse.json({ error: 'Quiz has expired' }, { status: 403 });
    }

    if (currentQuiz.validFrom && new Date(currentQuiz.validFrom) > now) {
      return NextResponse.json({ error: 'Quiz is not yet available' }, { status: 403 });
    }

    // Get quiz questions
    const quizQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId))
      .orderBy(questions.order);

    if (quizQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this quiz' }, { status: 404 });
    }

    // ============================================
    // FIX: Properly parse JSON string options
    // ============================================
    const processedQuestions = quizQuestions.map((question) => {
      let parsedOptions: string[] = [];

      // If options is a string, it's likely a JSON string - parse it
      if (typeof question.options === 'string') {
        try {
          // Try to parse as JSON first
          parsedOptions = JSON.parse(question.options);
        } catch (parseError) {
          console.error(`Failed to parse options for question ${question.id}:`, parseError);
          console.error('Raw options:', question.options);
          // Fallback to generic options
          parsedOptions = ['Option A', 'Option B', 'Option C', 'Option D'];
        }
      } else if (Array.isArray(question.options)) {
        // Already an array (in case schema is jsonb)
        parsedOptions = question.options as string[];
      }

      // Validate it's an array with exactly 4 elements
      if (!Array.isArray(parsedOptions)) {
        console.error(`Question ${question.id}: Options is not an array after parsing`);
        parsedOptions = ['Option A', 'Option B', 'Option C', 'Option D'];
      } else if (parsedOptions.length !== 4) {
        console.warn(
          `Question ${question.id}: Expected 4 options but got ${parsedOptions.length}`,
          parsedOptions
        );
        // If more than 4, take first 4; if less, pad with generic options
        if (parsedOptions.length > 4) {
          parsedOptions = parsedOptions.slice(0, 4);
        } else {
          while (parsedOptions.length < 4) {
            parsedOptions.push(`Option ${String.fromCharCode(65 + parsedOptions.length)}`);
          }
        }
      }

      // Return with proper typing - create a new object to avoid type conflicts
      return {
        id: question.id,
        text: question.text,
        options: parsedOptions as any, // Type assertion to avoid schema conflicts
        correctAnswer: question.correctAnswer,
      };
    });

    return NextResponse.json({
      quiz: currentQuiz,
      questions: processedQuestions
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}