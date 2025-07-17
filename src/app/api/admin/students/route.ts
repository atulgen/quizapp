import { NextRequest, NextResponse } from 'next/server';
import  db  from '@/db';
import { students, attempts, quizzes } from '@/db/schema';
import { eq, sql, desc, like, or, and } from 'drizzle-orm';

// GET /api/admin/students - Get all students with their attempt statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [];
    if (search) {
      whereConditions.push(
        or(
          like(students.name, `%${search}%`),
          like(students.email, `%${search}%`)
        )
      );
    }

    // Get students with attempt statistics
    const studentData = await db
      .select({
        id: students.id,
        name: students.name,
        email: students.email,
        createdAt: students.createdAt,
        totalAttempts: sql<number>`COUNT(${attempts.id})`,
        averageScore: sql<number>`AVG(${attempts.score})`,
        passedAttempts: sql<number>`SUM(CASE WHEN ${attempts.passed} THEN 1 ELSE 0 END)`,
      })
      .from(students)
      .leftJoin(attempts, eq(students.id, attempts.studentId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(students.id)
      .orderBy(desc(students.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(students)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
    
    const totalCount = totalCountResult[0].count;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      students: studentData,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}