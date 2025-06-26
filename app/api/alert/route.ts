import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { alertSchema } from '@/lib/validations';
import { alertRateLimiter } from '@/lib/rateLimiter';
import { sendEmergencyAlert } from '@/lib/twilio';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = alertRateLimiter(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Parse request body
    const body = await request.json();
    
    // Check if this is an authenticated user or public token request
    let user;
    let isPublicRequest = false;

    if (body.publicToken) {
      // Public request using public token
      isPublicRequest = true;
      const validationResult = alertSchema.safeParse(body);
      
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

      // Connect to database
      await connectDB();

      // Find user by public token
      user = await User.findOne({ 
        publicToken: validationResult.data.publicToken,
        isActive: true 
      });

      if (!user) {
        return NextResponse.json(
          { message: 'Invalid public token' },
          { status: 404 }
        );
      }
    } else {
      // Authenticated request
      const token = getTokenFromRequest(request);
      if (!token) {
        return NextResponse.json(
          { message: 'Authentication required or public token missing' },
          { status: 401 }
        );
      }

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
      user = await User.findById(payload.userId);
      if (!user || !user.isActive) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Check if user has emergency contacts
    if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
      return NextResponse.json(
        { message: 'No emergency contacts configured' },
        { status: 400 }
      );
    }

    // Prepare alert data
    const alertData = {
      patientName: user.name,
      location: body.location,
      emergencyContacts: user.emergencyContacts,
      customMessage: body.customMessage,
    };

    // Send emergency alert
    const alertResult = await sendEmergencyAlert(alertData);

    if (!alertResult.success) {
      return NextResponse.json(
        { 
          message: alertResult.message,
          details: alertResult.results,
        },
        { status: 500 }
      );
    }

    // Log the emergency alert (in production, you might want to store this in a separate alerts collection)
    console.log(`🚨 Emergency alert sent for ${user.name} (${user.email})`);
    
    return NextResponse.json(
      {
        success: true,
        message: alertResult.message,
        alertsSent: alertResult.results?.length || 0,
        isPublic: isPublicRequest,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Emergency alert error:', error);
    return NextResponse.json(
      { message: 'Failed to send emergency alert' },
      { status: 500 }
    );
  }
} 