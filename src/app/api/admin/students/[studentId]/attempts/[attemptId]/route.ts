// app/api/admin/students/[studentId]/attempts/[attemptId]/route.ts
import { NextResponse } from 'next/server';
import  db  from '@/db';
import { attempts, students, quizzes, questions } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { studentId: string; attemptId: string } }
) {
  try {
    // Fetch basic attempt info
    const attemptData = await db
      .select({
        id: attempts.id,
        quizId: attempts.quizId,
        quizTitle: quizzes.title,
        studentName: students.name,
        studentEmail: students.email,
        score: attempts.score,
        passed: attempts.passed,
        completedAt: attempts.completedAt,
      })
      .from(attempts)
      .leftJoin(quizzes, eq(attempts.quizId, quizzes.id))
      .leftJoin(students, eq(attempts.studentId, students.id))
      .where(
        and(
          eq(attempts.id, Number(params.attemptId)),
          eq(attempts.studentId, Number(params.studentId))
        )
      )
      .limit(1);

    if (attemptData.length === 0) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    // Fetch responses (you'll need to adjust this based on how you store responses)
    // This is a simplified example - you'll need to implement your actual response storage
    // const responses = await db.query.responses.findMany({
    //   where: (responses, { eq }) => eq(responses.attemptId, Number(params.attemptId)),
    //   with: {
    //     question: true,
    //   },
    // });

    // Format responses (adjust based on your schema)
    // const formattedResponses = responses.map((response) => ({
    //   questionId: response.questionId,
    //   questionText: response.question.text,
    //   selectedOption: response.selectedOption,
    //   correctOption: response.question.correctAnswer,
    //   isCorrect: response.selectedOption === response.question.correctAnswer,
    // }));

    return NextResponse.json({
      // attempt: {
      //   ...attemptData[0],
      //   responses: formattedResponses,
      // },
    });
  } catch (error) {
    console.error('Error fetching attempt details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attempt details' },
      { status: 500 }
    );
  }
}