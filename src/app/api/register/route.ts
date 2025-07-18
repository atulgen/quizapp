// app/api/register/route.ts
import  db  from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email , phone } = await request.json();

    // Check if student exists or create new
    const [existingStudent] = await db
      .select()
      .from(students)
      .where(eq(students.email, email))
      .limit(1);

    let student;
    if (!existingStudent) {
      const [newStudent] = await db
        .insert(students)
        .values({ name, email ,phone })
        .returning();
      student = newStudent;
    } else {
      student = existingStudent;
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}