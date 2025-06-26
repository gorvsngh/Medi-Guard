import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { generalApiRateLimiter } from '@/lib/rateLimiter';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = generalApiRateLimiter(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Get token from request
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by ID
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (!user || !user.isActive) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare user data for response
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      bloodType: user.bloodType,
      allergies: user.allergies,
      conditions: user.conditions,
      medications: user.medications,
      emergencyContacts: user.emergencyContacts,
      publicToken: user.publicToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        user: userData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 