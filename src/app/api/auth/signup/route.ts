// app/api/auth/signup/route.ts
import db from '@/db';
import { adminUsers } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength validation
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};

// Check if user is authorized to create admin accounts
const checkAdminAuthorization = async (request: NextRequest): Promise<boolean> => {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return false;
    }

    const { payload } = await jwtVerify(token, secret);
    
    // Check if current user is a super admin or has permission to create admin users
    return payload.role === 'super_admin' || payload.role === 'admin';
  } catch {
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { 
      username, 
      password, 
      email, 
      firstName, 
      lastName, 
      role = 'admin',
      requireAuth = true // Set to false if you want to allow public signup
    } = await request.json();

    // Check authorization if required
    if (requireAuth) {
      const isAuthorized = await checkAdminAuthorization(request);
      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Unauthorized to create admin users' },
          { status: 403 }
        );
      }
    }

    // Validate required fields
    if (!username || !password || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      );
    }

    // Validate username (no spaces, minimum length)
    if (username.length < 3 || /\s/.test(username)) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long and contain no spaces' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'super_admin', 'moderator'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUserByUsername = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    if (existingUserByUsername.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingUserByEmail = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Hash password with high salt rounds for security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin user
    const newUser = await db
      .insert(adminUsers)
      .values({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    const createdUser = newUser[0];

    // Create JWT token for the new user
    const token = await new SignJWT({
      userId: createdUser.id,
      username: createdUser.username,
      email: createdUser.email,
      role: createdUser.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    // Create response
    const response = NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        role: createdUser.role,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt
      }
    }, { status: 201 });

    // Set httpOnly cookie for the new user
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}