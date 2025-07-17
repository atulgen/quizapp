import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/db';
import { quizzes } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH /api/admin/quizzes/[id]/toggle-status - Toggle quiz active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = parseInt(params.id);

    // Get current status
    const quiz = await db
      .select({ isActive: quizzes.isActive })
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (quiz.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Toggle status
    const [updatedQuiz] = await db
      .update(quizzes)
      .set({ isActive: !quiz[0].isActive })
      .where(eq(quizzes.id, quizId))
      .returning();

    return NextResponse.json({
      message: 'Quiz status updated successfully',
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error('Error toggling quiz status:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz status' },
      { status: 500 }
    );
  }
}
