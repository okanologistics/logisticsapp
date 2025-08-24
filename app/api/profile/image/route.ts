import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { pool } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret'
);

const MAX_FILE_SIZE = 600 * 1024; // 600KB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const { payload } = await jwtVerify(token, secret);
  return payload as { userId: string; email: string; role: string };
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    console.log('Profile image upload: Starting authentication...');
    const user = await getAuthenticatedUser();
    console.log('Profile image upload: Authenticated user:', user.email);
    
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      console.log('Profile image upload: No file provided');
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    console.log('Profile image upload: File received:', file.name, file.size, file.type);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log('Profile image upload: Invalid file type:', file.type);
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log('Profile image upload: File too large:', file.size);
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 600KB.' 
      }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    
    console.log('Profile image upload: Generated filename:', fileName);
    console.log('Profile image upload: Upload directory:', uploadDir);
    
    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log('Profile image upload: Upload directory ensured');
    } catch (error) {
      console.log('Profile image upload: Directory creation error (may already exist):', error);
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    console.log('Profile image upload: File written to:', filePath);

    // Update database with new profile image path
    const imagePath = `/uploads/profiles/${fileName}`;
    console.log('Profile image upload: Updating database with path:', imagePath);
    console.log('Profile image upload: User ID:', user.userId);
    
    // Update profiles table (where the actual investor data is stored)
    const result = await pool.query(
      'UPDATE profiles SET profile_image = ? WHERE user_id = ?',
      [imagePath, user.userId]
    );
    console.log('Profile image upload: Database update result:', result);
    
    // Check if any rows were affected
    const [resultInfo] = result as any[];
    if (resultInfo.affectedRows === 0) {
      console.log('Profile image upload: No rows affected - user may not exist in profiles table');
      throw new Error('User profile not found');
    }

    return NextResponse.json({
      success: true,
      imagePath,
      message: 'Profile image uploaded successfully'
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser();
    
    // Remove profile image from database
    await pool.query(
      'UPDATE profiles SET profile_image = NULL WHERE user_id = ?',
      [user.userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile image removed successfully'
    });

  } catch (error) {
    console.error('Profile image deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to remove profile image' },
      { status: 500 }
    );
  }
}
