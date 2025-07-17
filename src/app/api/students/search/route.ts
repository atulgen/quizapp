
import db from '@/db';
import { students } from '@/db/schema';
import { ilike, or, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const query = searchParams.get('query');
    
    if (type !== 'students' || !query) {
      return NextResponse.json(
        { error: 'Invalid search parameters' },
        { status: 400 }
      );
    }

    // Search students by name, email, or enrollment number
    const results = await db
      .select()
      .from(students)
      .where(
        or(
          ilike(students.name, `%${query}%`),
          ilike(students.email, `%${query}%`),
          ilike(students.enrollmentNumber, `%${query}%`)
        )
      );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}