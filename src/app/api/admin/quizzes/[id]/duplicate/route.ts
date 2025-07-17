import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/db';
import { quizzes, questions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/admin/quizzes/[id]/duplicate - Duplicate a quiz
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sourceQuizId = parseInt(params.id);

    // Get source quiz
    const sourceQuiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, sourceQuizId))
      .limit(1);

    if (sourceQuiz.length === 0) {
      return NextResponse.json(
        { error: 'Source quiz not found' },
        { status: 404 }
      );
    }

    // Create duplicate quiz
    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        title: `${sourceQuiz[0].title} (Copy)`,
        description: sourceQuiz[0].description,
        timeLimit: sourceQuiz[0].timeLimit,
        passingScore: sourceQuiz[0].passingScore,
        isActive: false, // Set as inactive by default
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