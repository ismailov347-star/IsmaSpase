import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/topics/[id]/lessons - получить все уроки темы
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const topicId = parseInt(params.id);
    
    if (isNaN(topicId)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      );
    }

    const lessons = await prisma.lesson.findMany({
      where: { topicId },
      include: {
        tips: {
          orderBy: { order: 'asc' }
        },
        materials: {
          orderBy: { order: 'asc' }
        },
        files: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            tips: true,
            materials: true,
            files: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

// POST /api/topics/[id]/lessons - создать новый урок в теме
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const topicId = parseInt(params.id);
    
    if (isNaN(topicId)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, content, videoUrl, order } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли тема
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Если порядок не указан, ставим в конец
    let lessonOrder = order;
    if (lessonOrder === undefined || lessonOrder === null) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { topicId },
        orderBy: { order: 'desc' }
      });
      lessonOrder = lastLesson ? lastLesson.order + 1 : 0;
    }

    const lesson = await prisma.lesson.create({
      data: {
        topicId,
        title,
        description: description || null,
        content: content || null,
        videoUrl: videoUrl || null,
        order: lessonOrder
      },
      include: {
        topic: true,
        tips: {
          orderBy: { order: 'asc' }
        },
        materials: {
          orderBy: { order: 'asc' }
        },
        files: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}