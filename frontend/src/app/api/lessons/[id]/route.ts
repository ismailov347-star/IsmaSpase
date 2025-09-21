import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/lessons/[id] - получить урок по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id },
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

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    return NextResponse.json(lesson, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}

// PUT /api/lessons/[id] - обновить урок
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    const body = await request.json();
    const { topicId, title, videoUrl, isLocked } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    // Если передан topicId, проверяем существование темы
    if (topicId) {
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
    }

    const updateData: any = {
      title,
      videoUrl: videoUrl || null,
      isLocked: isLocked || false
    };

    if (topicId) {
      updateData.topicId = parseInt(topicId);
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
      include: {
        topic: true
      }
    });

    return NextResponse.json(lesson, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}

// DELETE /api/lessons/[id] - удалить урок
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    await prisma.lesson.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Lesson deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}