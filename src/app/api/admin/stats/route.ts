import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/db';
import { quizzes, questions, attempts, students } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Get total counts
    const totalQuizzes = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(quizzes);

    const totalQuestions = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(questions);

    const totalStudents = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(students);

    const totalAttempts = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(attempts);

    // Get active quizzes count
    const activeQuizzes = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(quizzes)
      .where(eq(quizzes.isActive, true));

    // Get recent attempts with student and quiz info
    const recentAttempts = await db
      .select({
        id: attempts.id,
        score: attempts.score,
        passed: attempts.passed,
        completedAt: attempts.completedAt,
        studentName: students.name,
        quizTitle: quizzes.title,
      })
      .from(attempts)
      .innerJoin(students, eq(attempts.studentId, students.id))
      .innerJoin(quizzes, eq(attempts.quizId, quizzes.id))
      .orderBy(desc(attempts.completedAt))
      .limit(10);

    // Get quiz performance stats
    const quizStats = await db
      .select({
        quizId: quizzes.id,
        quizTitle: quizzes.title,
        totalAttempts: sql<number>`COUNT(${attempts.id})`,
        averageScore: sql<number>`AVG(${attempts.score})`,
        passRate: sql<number>`AVG(CASE WHEN ${attempts.passed} THEN 1.0 ELSE 0.0 END) * 100`,
      })
      .from(quizzes)
      .leftJoin(attempts, eq(quizzes.id, attempts.quizId))
      .groupBy(quizzes.id, quizzes.title)
      .orderBy(desc(sql<number>`COUNT(${attempts.id})`))
      .limit(10);

    return NextResponse.json({
      totals: {
        quizzes: totalQuizzes[0].count,
        questions: totalQuestions[0].count,
        students: totalStudents[0].count,
        attempts: totalAttempts[0].count,
        activeQuizzes: activeQuizzes[0].count,
      },
      recentAttempts,
      quizStats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
