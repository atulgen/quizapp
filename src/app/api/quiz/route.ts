// app/api/quiz/route.ts
import  db  from '@/db';
import { NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { quizzes, questions } from '@/db/schema';

export async function GET() {
  try {
    // Get the first active quiz
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.isActive, true))
      .limit(1);

    if (!quiz) {
      return NextResponse.json(
        { error: 'No active quiz available' },
        { status: 404 }
      );
    }

    // Get all questions for the quiz
    const quizQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quiz.id))
      .orderBy(asc(questions.order));

    return NextResponse.json({
      quiz,
      questions: quizQuestions.map((q) => ({
        ...q,
        options: q.options.split(','),
      })),
    });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}