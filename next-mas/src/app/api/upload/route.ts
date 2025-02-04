import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = [];

    // Handle design file
    const designFile = formData.get('file') as File;
    if (designFile) {
      files.push({
        file: designFile,
        type: 'design'
      });
    }

    // Handle research file
    const researchFile = formData.get('research') as File;
    if (researchFile) {
      files.push({
        file: researchFile,
        type: 'research'
      });
    }
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure uploads directory exists
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const results = await Promise.all(
      files.map(async ({ file, type }) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Create unique filename
        const uniqueFilename = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, uniqueFilename);
        
        // Write file to uploads directory
        await writeFile(filePath, buffer);

        return {
          type,
          url: `/uploads/${uniqueFilename}`
        };
      })
    );
    
    // Return the public URLs
    return NextResponse.json(
      results.reduce((acc, { type, url }) => ({
        ...acc,
        [type === 'design' ? 'url' : type]: url
      }), {})
    );
    
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Error uploading files' },
      { status: 500 }
    );
  }
}
