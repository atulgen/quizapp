
import db from '@/db';
import { students } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';


// Create new student or get all students (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.enrollmentNumber) {
      return NextResponse.json(
        { error: 'Name, email, and enrollment number are required' },
        { status: 400 }
      );
    }

    // Check if email or enrollment number already exists
    const existingStudent = await db
      .select()
      .from(students)
      .where(
        or(
          eq(students.email, body.email),
          eq(students.enrollmentNumber, body.enrollmentNumber)
        )
      );

    if (existingStudent.length > 0) {
      return NextResponse.json(
        { error: 'Email or enrollment number already exists' },
        { status: 409 }
      );
    }

    // Create new student
    const newStudent = await db
      .insert(students)
      .values({
        name: body.name,
        email: body.email,
        phone: body.phone,
        enrollmentNumber: body.enrollmentNumber,
        course: body.course,
        batch: body.batch,
      })
      .returning();

    return NextResponse.json(newStudent[0], { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all students (admin only)
export async function GET(request: Request) {
  try {
    // const session = await auth();
    
    // if (!session?.user?.role || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const allStudents = await db.select().from(students);
    return NextResponse.json(allStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}