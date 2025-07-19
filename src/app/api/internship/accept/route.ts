// app/api/internship/accept/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { internshipOffers, internshipAcceptances, students } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { token, phone, fatherName, permanentAddress, resumeUrl } = await request.json();

    // Validate required fields
    if (!token || !phone || !fatherName || !permanentAddress || !resumeUrl) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for tracking
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Find the offer with this token
    const offerResults = await db
      .select()
      .from(internshipOffers)
      .where(eq(internshipOffers.token, token))
      .limit(1);

    if (offerResults.length === 0) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      );
    }

    const offer = offerResults[0];

    // Check if token has expired
    if (new Date() > offer.expiresAt) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 410 }
      );
    }

    // Check if already accepted
    if (offer.status === 'accepted') {
      return NextResponse.json(
        { error: 'This offer has already been accepted' },
        { status: 409 }
      );
    }

    // Check if acceptance already exists
    const existingAcceptance = await db
      .select()
      .from(internshipAcceptances)
      .where(eq(internshipAcceptances.offerId, offer.id))
      .limit(1);

    if (existingAcceptance.length > 0) {
      return NextResponse.json(
        { error: 'This offer has already been accepted' },
        { status: 409 }
      );
    }

    // Execute operations sequentially without transaction
    try {
      // Update student phone if not exists
      await db
        .update(students)
        .set({ phone })
        .where(eq(students.id, offer.studentId));

      // Insert acceptance record
      await db.insert(internshipAcceptances).values({
        offerId: offer.id,
        studentId: offer.studentId,
        phone,
        fatherName,
        permanentAddress,
        resumeUrl,
        ipAddress,
        userAgent,
        submittedAt: new Date(),
      });

      // Update offer status to accepted
      await db
        .update(internshipOffers)
        .set({ 
          status: 'accepted',
          acceptedAt: new Date()
        })
        .where(eq(internshipOffers.id, offer.id));

      return NextResponse.json(
        { 
          message: 'Internship offer accepted successfully',
          success: true 
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error during acceptance process:', error);
      return NextResponse.json(
        { error: 'Failed to process acceptance' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error accepting internship offer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';