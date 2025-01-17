import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure uploads directory exists
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Create unique filename
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    // Write file to uploads directory
    await writeFile(filePath, buffer);
    
    // Return the public URL
    return NextResponse.json({ 
      url: `/uploads/${uniqueFilename}` 
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
