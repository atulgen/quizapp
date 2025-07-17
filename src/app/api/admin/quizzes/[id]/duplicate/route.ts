import { NextRequest, NextResponse } from 'next/server';
import db  from '@/db';
import { quizzes, questions } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Context {
  params: {
    id: string;
  };
}

export async function POST(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    const sourceQuizId = parseInt(context.params.id);

    if (isNaN(sourceQuizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      );
    }

    // Get source quiz
    const [sourceQuiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, sourceQuizId))
      .limit(1);

    if (!sourceQuiz) {
      return NextResponse.json(
        { error: 'Source quiz not found' },
        { status: 404 }
      );
    }

    // Create duplicate quiz
    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        title: `${sourceQuiz.title} (Copy)`,
        description: sourceQuiz.description,
        timeLimit: sourceQuiz.timeLimit,
        passingScore: sourceQuiz.passingScore,
        isActive: false,
      })
      .returning();

    // Get source questions
    const sourceQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, sourceQuizId))
      .orderBy(questions.order);

    // Create duplicate questions
    if (sourceQuestions.length > 0) {
      const questionsToInsert = sourceQuestions.map(q => ({
        quizId: newQuiz.id,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        order: q.order,
      }));

      await db.insert(questions).values(questionsToInsert);
    }

    return NextResponse.json({
      message: 'Quiz duplicated successfully',
      quiz: newQuiz,
    });
  } catch (error) {
    console.error('Error duplicating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate quiz' },
      { status: 500 }
    );
  }
}