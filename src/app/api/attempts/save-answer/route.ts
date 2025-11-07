// app/api/attempts/save-answer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/db';
import { responses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { attemptId, questionId, selectedAnswer, isCorrect } = await req.json();

    if (!attemptId || !questionId || !selectedAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if response already exists
    const existing = await db
      .select()
      .from(responses)
      .where(
        and(
          eq(responses.attemptId, attemptId),
          eq(responses.questionId, questionId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Answer already exists. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Insert new response
    const newResponse = await db
      .insert(responses)
      .values({
        attemptId,
        questionId,
        selectedAnswer,
        isCorrect: isCorrect || false,
        answeredAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      responseId: newResponse[0].id,
    });
  } catch (error) {
    console.error('Save answer error:', error);
    return NextResponse.json(
      { error: 'Failed to save answer' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { attemptId, questionId, selectedAnswer, isCorrect } = await req.json();

    if (!attemptId || !questionId || !selectedAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update existing response
    const updated = await db
      .update(responses)
      .set({
        selectedAnswer,
        isCorrect: isCorrect || false,
        answeredAt: new Date(),
      })
      .where(
        and(
          eq(responses.attemptId, attemptId),
          eq(responses.questionId, questionId)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      responseId: updated[0].id,
    });
  } catch (error) {
    console.error('Update answer error:', error);
    return NextResponse.json(
      { error: 'Failed to update answer' },
      { status: 500 }
    );
  }
}
