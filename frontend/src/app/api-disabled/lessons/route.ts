import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/lessons - получить все уроки
export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        topic: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    return NextResponse.json(lessons, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}

// POST /api/lessons - создать новый урок
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topicId, title, videoUrl, isLocked } = body;

    if (!title || !topicId) {
      return NextResponse.json(
        { error: 'Title and topicId are required' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    // Проверяем, существует ли тема
    const topic = await prisma.topic.findUnique({
      where: { id: parseInt(topicId) }
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        topicId: parseInt(topicId),
        title,
        videoUrl: videoUrl || null,
        isLocked: isLocked || false
      },
      include: {
        topic: true
      }
    });

    return NextResponse.json(lesson, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}