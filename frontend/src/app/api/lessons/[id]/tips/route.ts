import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/lessons/[id]/tips - получить все советы урока
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

    const tips = await prisma.tip.findMany({
      where: { lessonId },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(tips);
  } catch (error) {
    console.error('Error fetching tips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tips' },
      { status: 500 }
    );
  }
}

// POST /api/lessons/[id]/tips - создать новый совет
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
    const { title, content, order } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
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

    const tip = await prisma.tip.create({
      data: {
        lessonId,
        title,
        content,
        order: order || 0
      }
    });

    return NextResponse.json(tip, { status: 201 });
  } catch (error) {
    console.error('Error creating tip:', error);
    return NextResponse.json(
      { error: 'Failed to create tip' },
      { status: 500 }
    );
  }
}