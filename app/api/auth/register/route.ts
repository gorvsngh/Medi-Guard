import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations';
import { signToken, setTokenCookie } from '@/lib/auth';
import { authRateLimiter } from '@/lib/rateLimiter';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Registration API called');
    
    // Apply rate limiting
    const rateLimitResult = authRateLimiter(request);
    if (rateLimitResult) {
      console.log('❌ Rate limit exceeded');
      return rateLimitResult;
    }

    console.log('✅ Rate limit passed');

    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    // Parse and validate request body
    console.log('📝 Parsing request body...');
    const body = await request.json();
    console.log('📝 Request body:', { ...body, password: '[HIDDEN]', confirmPassword: '[HIDDEN]' });
    
    console.log('🔍 Validating request...');
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.errors);
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

    console.log('✅ Validation passed');
    const { name, email, password } = validationResult.data;
    console.log('📋 Extracted data:', { name, email, password: '[HIDDEN]' });

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    console.log('✅ User does not exist, creating new user...');
    // Create new user
    const user = new User({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
    });

    console.log('💾 Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully');

    // Generate JWT token
    console.log('🔑 Generating JWT token...');
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });
    console.log('✅ JWT token generated');

    // Prepare user data for response (exclude password hash)
    console.log('📄 Preparing user data for response...');
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      bloodType: user.bloodType,
      publicToken: user.publicToken,
    };
    console.log('📄 User data:', userData);

    // Set HTTP-only cookie and return response
    console.log('🍪 Setting cookie...');
    const cookie = setTokenCookie(token);
    const response = NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user: userData,
      },
      { status: 201 }
    );

    response.cookies.set(cookie.name, cookie.value, cookie.options);
    console.log('✅ Registration completed successfully');

    return response;
  } catch (error: any) {
    console.error('💥 Registration error occurred:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Full error:', error);

    if (error.code === 11000) {
      // MongoDB duplicate key error
      console.log('❌ MongoDB duplicate key error');
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    console.log('❌ Unknown error, returning 500');
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 