import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/lessons/[id]/files/[fileId] - получить файл по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const fileId = parseInt(params.fileId);
    
    if (isNaN(fileId)) {
      return NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    const file = await prisma.lessonFile.findUnique({
      where: { id: fileId },
      include: { lesson: true }
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/[id]/files/[fileId] - удалить файл
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const fileId = parseInt(params.fileId);
    
    if (isNaN(fileId)) {
      return NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    await prisma.lessonFile.delete({
      where: { id: fileId }
    });

    return NextResponse.json(
      { message: 'File deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}