// app/api/admin/students/route.ts
import { NextResponse } from 'next/server';
import  db  from '@/db';
import { students, attempts, quizzes } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const allStudents = await db
      .select({
        id: students.id,
        name: students.name,
        email: students.email,
        phone: students.phone,
      })
      .from(students);

    const studentsWithAttempts = await Promise.all(
      allStudents.map(async (student) => {
        const studentAttempts = await db
          .select({
            id: attempts.id,
            quizId: attempts.quizId,
            quizTitle: quizzes.title,
            score: attempts.score,
            passed: attempts.passed,
            completedAt: attempts.completedAt,
          })
          .from(attempts)
          .leftJoin(quizzes, eq(attempts.quizId, quizzes.id))
          .where(eq(attempts.studentId, student.id));

        return {
          ...student,
          attempts: studentAttempts,
        };
      })
    );

    return NextResponse.json({ students: studentsWithAttempts });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}