// app/api/admin/quizzes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { quizzes, questions, attempts, students } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// Helper function to handle params
async function getParams(request: NextRequest) {
  // Extract the id from the URL pathname
  const pathname = request.nextUrl.pathname;
  // Assumes route is /api/admin/quizzes/[id]
  const parts = pathname.split('/');
  const id = parts[parts.length - 1];
  return { id };
}

// GET /api/admin/quizzes/[id] - Get specific quiz with questions
export async function GET(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    const quizId = parseInt(id);

    // Rest of your GET implementation remains the same...
    const quiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (quiz.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const quizQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId))
      .orderBy(questions.order);

    const formattedQuestions = quizQuestions.map(q => ({
      ...q,
      options: JSON.parse(q.options),
    }));

    const stats = await db
      .select({
        totalAttempts: sql<number>`COUNT(*)`,
        averageScore: sql<number>`AVG(${attempts.score})`,
        passRate: sql<number>`AVG(CASE WHEN ${attempts.passed} THEN 1.0 ELSE 0.0 END) * 100`,
      })
      .from(attempts)
      .where(eq(attempts.quizId, quizId));

    return NextResponse.json({
      quiz: quiz[0],
      questions: formattedQuestions,
      stats: stats[0] || { totalAttempts: 0, averageScore: 0, passRate: 0 },
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/quizzes/[id] - Update quiz
export async function PUT(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    const quizId = parseInt(id);
    const body = await request.json();
    const { quiz, questions: questionsData } = body;

    // Rest of your PUT implementation remains the same...
    const [updatedQuiz] = await db
      .update(quizzes)
      .set({
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        isActive: quiz.isActive,
      })
      .where(eq(quizzes.id, quizId))
      .returning();

    if (!updatedQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    await db.delete(questions).where(eq(questions.quizId, quizId));

    const questionsToInsert = questionsData.map((q: any, index: number) => ({
      quizId: quizId,
      text: q.text,
      options: JSON.stringify(q.options),
      correctAnswer: q.correctAnswer,
      order: index,
    }));

    await db.insert(questions).values(questionsToInsert);

    return NextResponse.json({
      message: 'Quiz updated successfully',
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/quizzes/[id] - Delete quiz
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    const quizId = parseInt(id);

    // Rest of your DELETE implementation remains the same...
    const quiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (quiz.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    await db.delete(quizzes).where(eq(quizzes.id, quizId));

    return NextResponse.json({
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}