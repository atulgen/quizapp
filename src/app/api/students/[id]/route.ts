
import db from '@/db';
import { students } from '@/db/schema';
import { and, eq, ne, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';


// Get student by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = parseInt(params.id);
    
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const student = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId));

    if (student.length === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(student[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update student details
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = parseInt(params.id);
    const body = await request.json();
    
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Check if student exists
    const existingStudent = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId));

    if (existingStudent.length === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if email or enrollment number is being updated to an existing one
    if (body.email || body.enrollmentNumber) {
      const conflictStudent = await db
        .select()
        .from(students)
        .where(
          and(
            or(
              eq(students.email, body.email || ''),
              eq(students.enrollmentNumber, body.enrollmentNumber || '')
            ),
            ne(students.id, studentId)
          )
        );

      if (conflictStudent.length > 0) {
        return NextResponse.json(
          { error: 'Email or enrollment number already exists' },
          { status: 409 }
        );
      }
    }

    // Update student
    const updatedStudent = await db
      .update(students)
      .set({
        name: body.name,
        email: body.email,
        phone: body.phone,
        enrollmentNumber: body.enrollmentNumber,
        course: body.course,
        batch: body.batch,
        updatedAt: new Date(),
      })
      .where(eq(students.id, studentId))
      .returning();

    return NextResponse.json(updatedStudent[0]);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete student
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // const session = await auth();
    const studentId = parseInt(params.id);
    
    // if (!session?.user?.role || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Check if student exists
    const existingStudent = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId));

    if (existingStudent.length === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Delete student
    await db.delete(students).where(eq(students.id, studentId));

    return NextResponse.json(
      { message: 'Student deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}