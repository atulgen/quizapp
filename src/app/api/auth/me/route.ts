import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your_default_secret');

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      user: {
        id: payload.userId,
        username: payload.username,
        email: payload.email,
        role: payload.role
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}