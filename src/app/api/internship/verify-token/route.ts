// app/api/internship/verify-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { internshipOffers, students } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find the offer with this token
    const offer = await db
      .select({
        id: internshipOffers.id,
        studentId: internshipOffers.studentId,
        email: internshipOffers.email,
        expiresAt: internshipOffers.expiresAt,
        status: internshipOffers.status,
        studentName: students.name,
        studentEmail: students.email,
        studentPhone: students.phone,
      })
      .from(internshipOffers)
      .innerJoin(students, eq(internshipOffers.studentId, students.id))
      .where(eq(internshipOffers.token, token))
      .limit(1);

    if (offer.length === 0) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      );
    }

    const offerData = offer[0];

    // Check if token has expired
    if (new Date() > offerData.expiresAt) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 410 } // Gone
      );
    }

    // Check if already accepted
    if (offerData.status === 'accepted') {
      return NextResponse.json(
        { error: 'This offer has already been accepted' },
        { status: 409 } // Conflict
      );
    }

    // Return student data
    return NextResponse.json({
      success: true,
      student: {
        name: offerData.studentName,
        email: offerData.studentEmail,
        phone: offerData.studentPhone,
      },
      offer: {
        id: offerData.id,
        expiresAt: offerData.expiresAt,
      },
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}