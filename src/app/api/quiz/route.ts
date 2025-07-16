// app/api/quiz/route.ts
import { NextResponse } from 'next/server';
import { eq, count } from 'drizzle-orm';
import { quizResponses, quizzes } from '@/db/schema';
import db from '@/db';

export const dynamic = 'force-dynamic'; // Required for dynamic fetching

export interface TQuiz {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

export interface TQuizResponse {
  prev: boolean;
  next: boolean;
  page: string;
  quiz: TQuiz;
  total: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    const page = searchParams.get('page');
    const quizId = searchParams.get('quizId');

    // GET /api/quiz - Get all quizzes or paginated quiz
    if (!action) {
      // If no page parameter, return all quizzes
      if (!page) {
        const allQuizzes = await db.select().from(quizzes).orderBy(quizzes.id);
        return NextResponse.json(allQuizzes);
      }

      const pageToNum = parseInt(page);
      
      // Validate page number
      if (isNaN(pageToNum) || pageToNum < 0) {
        return NextResponse.json(
          { error: 'Invalid page number' },
          { status: 400 }
        );
      }

      // Get total count of quizzes
      const [{ count: totalQuizzes }] = await db.select({ count: count() }).from(quizzes);
      
      // Get specific quiz by page (0-indexed)
      const quiz = await db.select()
        .from(quizzes)
        .where(eq(quizzes.id, pageToNum + 1)) // Convert 0-indexed to 1-indexed for database
        .limit(1);

      if (quiz.length === 0) {
        return NextResponse.json(
          { error: 'Quiz not found' },
          { status: 404 }
        );
      }

      const currentQuiz = quiz[0];
      const lastPage = totalQuizzes - 1;

      let response: TQuizResponse;

      if (pageToNum === 0) {
        response = {
          prev: false,
          next: true,
          page,
          quiz: currentQuiz,
          total: totalQuizzes
        };
      } else if (pageToNum === lastPage) {
        response = {
          prev: true,
          next: false,
          page,
          quiz: currentQuiz,
          total: totalQuizzes
        };
      } else {
        response = {
          prev: true,
          next: true,
          page,
          quiz: currentQuiz,
          total: totalQuizzes
        };
      }

      return NextResponse.json(response);
    }

    // GET /api/quiz?action=getById&id=123 - Get individual quiz by ID
    if (action === 'getById') {
      const quizId = parseInt(id as string);

      if (isNaN(quizId)) {
        return NextResponse.json(
          { error: 'Invalid quiz ID' },
          { status: 400 }
        );
      }

      const quiz = await db.select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId))
        .limit(1);

      if (quiz.length === 0) {
        return NextResponse.json(
          { error: 'Quiz not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(quiz[0]);
    }

    // GET /api/quiz?action=responses&quizId=123 - Get quiz responses
    if (action === 'responses') {
      if (quizId) {
        // Get responses for specific quiz
        const responses = await db.select()
          .from(quizResponses)
          .where(eq(quizResponses.quizId, parseInt(quizId)));

        return NextResponse.json(responses);
      } else {
        // Get all responses
        const responses = await db.select().from(quizResponses);
        return NextResponse.json(responses);
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Quiz API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    const requestData = await request.json();

    // POST /api/quiz - Create new quiz
    if (!action) {
      const { question, options, answer } = requestData;

      // Validate required fields
      if (!question || !options || !answer) {
        return NextResponse.json(
          { error: 'Missing required fields: question, options, answer' },
          { status: 400 }
        );
      }

      if (!Array.isArray(options) || options.length === 0) {
        return NextResponse.json(
          { error: 'Options must be a non-empty array' },
          { status: 400 }
        );
      }

      // Insert new quiz
      const newQuiz = await db.insert(quizzes).values({
        question,
        options,
        answer
      }).returning();

      return NextResponse.json(newQuiz[0], { status: 201 });
    }

    // POST /api/quiz?action=response - Submit quiz response
    if (action === 'response') {
      const { quizId, userAnswer } = requestData;

      if (!quizId || !userAnswer) {
        return NextResponse.json(
          { error: 'Missing required fields: quizId, userAnswer' },
          { status: 400 }
        );
      }

      // Get the correct answer for the quiz
      const quiz = await db.select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId))
        .limit(1);

      if (quiz.length === 0) {
        return NextResponse.json(
          { error: 'Quiz not found' },
          { status: 404 }
        );
      }

      const correctAnswer = quiz[0].answer;
      const isCorrect = userAnswer === correctAnswer;

      // Save the response
      const response = await db.insert(quizResponses).values({
        quizId,
        userAnswer,
        isCorrect
      }).returning();

      return NextResponse.json({
        ...response[0],
        correctAnswer,
        message: isCorrect ? 'Correct!' : 'Incorrect!'
      }, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Quiz API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const requestData = await request.json();

    const quizId = parseInt(id as string);

    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      );
    }

    const { question, options, answer } = requestData;

    if (!question || !options || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedQuiz = await db.update(quizzes)
      .set({ 
        question, 
        options, 
        answer,
        updatedAt: new Date()
      })
      .where(eq(quizzes.id, quizId))
      .returning();

    if (updatedQuiz.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedQuiz[0]);
    
  } catch (error) {
    console.error('Quiz API PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const quizId = parseInt(id as string);

    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      );
    }

    const deletedQuiz = await db.delete(quizzes)
      .where(eq(quizzes.id, quizId))
      .returning();

    if (deletedQuiz.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Quiz deleted successfully' }
    );
    
  } catch (error) {
    console.error('Quiz API DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}