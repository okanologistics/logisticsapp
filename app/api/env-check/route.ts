import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      MYSQL_HOST: process.env.MYSQL_HOST || 'NOT SET',
      MYSQL_USER: process.env.MYSQL_USER || 'NOT SET',
      MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? 'SET' : 'NOT SET',
      MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'NOT SET',
      MYSQL_PORT: process.env.MYSQL_PORT || 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    };

    return NextResponse.json({
      status: 'Environment Check',
      environment: envCheck,
      message: 'Check if all required environment variables are set',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'Error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'This endpoint only supports GET requests'
  }, { status: 405 });
}
