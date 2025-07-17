// app/api/admin/quizzes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, sql, and, or, like } from 'drizzle-orm';
import { questions, quizzes } from '@/db/schema';
import db from '@/db';

// GET /api/admin/quizzes - Get all quizzes with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // 'active', 'inactive', or null for all
    
    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [];
    if (search) {
      whereConditions.push(
        or(
          like(quizzes.title, `%${search}%`),
          like(quizzes.description, `%${search}%`)
        )
      );
    }
    if (status === 'active') {
      whereConditions.push(eq(quizzes.isActive, true));
    } else if (status === 'inactive') {
      whereConditions.push(eq(quizzes.isActive, false));
    }

    // Get quizzes with question counts
    const quizData = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        timeLimit: quizzes.timeLimit,
        passingScore: quizzes.passingScore,
        isActive: quizzes.isActive,
        createdAt: quizzes.createdAt,
        questionsCount: sql<number>`COUNT(${questions.id})`.as('questionsCount'),
      })
      .from(quizzes)
      .leftJoin(questions, eq(quizzes.id, questions.quizId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(quizzes.id)
      .orderBy(desc(quizzes.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(quizzes)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
    
    const totalCount = totalCountResult[0].count;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      quizzes: quizData,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quiz, questions: questionsData } = body;

    // Validate required fields
    if (!quiz.title || !questionsData || questionsData.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one question are required' },
        { status: 400 }
      );
    }

    // Create quiz
    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        isActive: quiz.isActive,
      })
      .returning();

    // Create questions
    const questionsToInsert = questionsData.map((q: any, index: number) => ({
      quizId: newQuiz.id,
      text: q.text,
      options: JSON.stringify(q.options), // Store options as JSON
      correctAnswer: q.correctAnswer,
      order: index,
    }));

    await db.insert(questions).values(questionsToInsert);

    return NextResponse.json(
      { message: 'Quiz created successfully', quiz: newQuiz },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
