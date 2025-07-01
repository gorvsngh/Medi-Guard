import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations';
import { signToken, setTokenCookie } from '@/lib/auth';
import { authRateLimiter } from '@/lib/rateLimiter';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login API called');
    
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
    console.log('📝 Request body:', { ...body, password: '[HIDDEN]' });
    
    console.log('🔍 Validating request...');
    const validationResult = loginSchema.safeParse(body);

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
    const { email, password } = validationResult.data;
    console.log('📋 Extracted data:', { email, password: '[HIDDEN]' });

    // Find user by email
    console.log('🔍 Finding user by email...');
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      console.log('❌ User not found or inactive');
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ User found:', { id: user._id, email: user.email });

    // Verify password
    console.log('🔐 Verifying password...');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ Password verified successfully');

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
        message: 'Login successful',
        user: userData,
      },
      { status: 200 }
    );

    response.cookies.set(cookie.name, cookie.value, cookie.options);
    console.log('✅ Login completed successfully');

    return response;
  } catch (error: unknown) {
    console.error('💥 Login error occurred:');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.error('Full error:', error);

    console.log('❌ Unknown error, returning 500');
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 