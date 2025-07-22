import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { quizzes, students, attempts } from '@/db/schema';
import db from '@/db';

export async function GET() {
  try {
    // Get all stats in a single query for efficiency
    const stats = await db.transaction(async (tx) => {
      // Total quizzes
      const totalQuizzes = await tx
        .select({ count: sql<number>`count(*)` })
        .from(quizzes)
        .where(sql`${quizzes.isActive} = true`);

      // Total students
      const totalStudents = await tx
        .select({ count: sql<number>`count(*)` })
        .from(students);

      // Total attempts
      const totalAttempts = await tx
        .select({ count: sql<number>`count(*)` })
        .from(attempts)
        .where(sql`${attempts.status} = 'completed'`);

      // Average score (only from completed attempts)
      const averageScore = await tx
        .select({ avg: sql<number>`avg(${attempts.score})` })
        .from(attempts)
        .where(sql`${attempts.status} = 'completed' AND ${attempts.score} IS NOT NULL`);

      return {
        totalQuizzes: totalQuizzes[0].count,
        totalStudents: totalStudents[0].count,
        totalAttempts: totalAttempts[0].count,
        averageScore: averageScore[0].avg ? Math.round(averageScore[0].avg * 10) / 10 : 0, // Round to 1 decimal place
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}