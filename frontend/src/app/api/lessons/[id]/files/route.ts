import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/lessons/[id]/files - получить все файлы урока
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id);
    
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    const files = await prisma.lessonFile.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// POST /api/lessons/[id]/files - создать новый файл
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id);
    
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { filename, url, type, size } = body;

    if (!filename || !url || !type) {
      return NextResponse.json(
        { error: 'Filename, URL and type are required' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли урок
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    const file = await prisma.lessonFile.create({
      data: {
        lessonId,
        filename,
        url,
        type,
        size: size || null
      }
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    console.error('Error creating file:', error);
    return NextResponse.json(
      { error: 'Failed to create file' },
      { status: 500 }
    );
  }
}