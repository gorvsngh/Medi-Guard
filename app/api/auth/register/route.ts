import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations';
import { signToken, setTokenCookie } from '@/lib/auth';
import { authRateLimiter } from '@/lib/rateLimiter';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Register API called');
    
    // Apply rate limiting
    const rateLimitResult = authRateLimiter(request);
    if (rateLimitResult) {
      console.log('❌ Rate limit exceeded for registration');
      return rateLimitResult;
    }

    console.log('✅ Rate limit passed for registration');

    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected for registration');

    // Parse and validate request body
    console.log('📝 Parsing registration request body...');
    const body = await request.json();
    console.log('📝 Registration data:', { ...body, password: '[HIDDEN]', confirmPassword: '[HIDDEN]' });
    
    console.log('🔍 Validating registration request...');
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      console.log('❌ Registration validation failed:', validationResult.error.errors);
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

    console.log('✅ Registration validation passed');
    const { name, email, password } = validationResult.data;
    console.log('📋 Extracted registration data:', { name, email, password: '[HIDDEN]' });

    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists with email:', email);
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    console.log('✅ Email is available for registration');

    // Create new user
    console.log('👤 Creating new user...');
    const newUser = new User({
      name,
      email,
      passwordHash: password, // This will be hashed by the pre-save middleware
    });

    console.log('💾 Saving user to database...');
    await newUser.save();
    console.log('✅ User created successfully:', { id: newUser._id, email: newUser.email });

    // Generate JWT token
    console.log('🔑 Generating JWT token...');
    const token = signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
    });
    console.log('✅ JWT token generated for new user');

    // Prepare user data for response (exclude password hash)
    console.log('📄 Preparing user data for response...');
    const userData = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      bloodType: newUser.bloodType,
      publicToken: newUser.publicToken,
    };
    console.log('📄 User registration response data:', userData);

    // Set HTTP-only cookie and return response
    console.log('🍪 Setting authentication cookie...');
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
  } catch (error: unknown) {
    console.error('💥 Registration error occurred:');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.error('Full error:', error);

    // Handle duplicate key error (user already exists)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      console.log('❌ Duplicate key error - user already exists');
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Handle validation errors from Mongoose
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError' && 'errors' in error) {
      console.log('❌ Mongoose validation error:', error.errors);
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: Object.values(error.errors as Record<string, { path: string; message: string }>).map((err) => ({
            field: err.path,
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.log('❌ Unknown registration error, returning 500');
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 