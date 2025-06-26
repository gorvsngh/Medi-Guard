import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { profileSchema } from '@/lib/validations';
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

    // Find user profile
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (!user || !user.isActive) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return profile data
    const profileData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      bloodType: user.bloodType,
      allergies: user.allergies,
      conditions: user.conditions,
      medications: user.medications,
      emergencyContacts: user.emergencyContacts,
      publicToken: user.publicToken,
      publicUrl: `${process.env.DOMAIN || 'http://localhost:3000'}/public/${user.publicToken}`,
    };

    return NextResponse.json(
      {
        success: true,
        profile: profileData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = profileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const profileData = validationResult.data;

    // Connect to database
    await connectDB();

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      payload.userId,
      {
        name: profileData.name,
        bloodType: profileData.bloodType,
        allergies: profileData.allergies,
        conditions: profileData.conditions,
        medications: profileData.medications,
        emergencyContacts: profileData.emergencyContacts,
      },
      { 
        new: true,
        runValidators: true,
      }
    ).select('-passwordHash');

    if (!updatedUser || !updatedUser.isActive) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return updated profile data
    const responseData = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      bloodType: updatedUser.bloodType,
      allergies: updatedUser.allergies,
      conditions: updatedUser.conditions,
      medications: updatedUser.medications,
      emergencyContacts: updatedUser.emergencyContacts,
      publicToken: updatedUser.publicToken,
      publicUrl: `${process.env.DOMAIN || 'http://localhost:3000'}/public/${updatedUser.publicToken}`,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        profile: responseData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: Object.values(error.errors).map((err: any) => ({
            field: err.path,
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 