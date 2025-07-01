import { NextRequest, NextResponse } from 'next/server';
import { sendTestSMS } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testNumber } = body;

    if (!testNumber) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Test phone number is required' 
        },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing SMS to: ${testNumber}`);

    // Send test SMS
    const result = await sendTestSMS(testNumber);

    const statusCode = result.success ? 200 : 500;

    return NextResponse.json(result, { status: statusCode });
  } catch (error: unknown) {
    console.error('Test SMS API error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to send test SMS',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 