import { NextResponse } from 'next/server';
import { desc, sql } from 'drizzle-orm';
import { quizzes, attempts } from '@/db/schema';
import db from '@/db';

export async function GET() {
  try {
    const recentQuizzes = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        createdAt: quizzes.createdAt,
        attemptsCount: sql<number>`COUNT(${attempts.id})`.as('attemptsCount'),
        avgScore: sql<number>`ROUND(AVG(${attempts.score}), 1)`.as('avgScore'),
      })
      .from(quizzes)
      .leftJoin(
        attempts,
        sql`${attempts.quizId} = ${quizzes.id} AND ${attempts.status} = 'completed'`
      )
      .groupBy(quizzes.id)
      .orderBy(desc(quizzes.createdAt))
      .limit(5);

    return NextResponse.json(
      recentQuizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        attempts: quiz.attemptsCount,
        avgScore: quiz.avgScore || 0,
        createdAt: quiz.createdAt ? quiz.createdAt.toISOString() : null,
      }))
    );
  } catch (error) {
    console.error('Error fetching recent quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent quizzes' },
      { status: 500 }
    );
  }
}