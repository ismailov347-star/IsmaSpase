import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/topics/[id] - получить тему по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        lessons: {
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
        }
      }
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

    return NextResponse.json(topic, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}

// PUT /api/topics/[id] - обновить тему
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    const body = await request.json();
    const { title, description, isLocked } = body;

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

    const topic = await prisma.topic.update({
      where: { id },
      data: {
        title,
        description: description || null,
        isLocked: isLocked || false
      }
    });

    return NextResponse.json(topic, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}

// DELETE /api/topics/[id] - удалить тему
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    await prisma.topic.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Topic deleted successfully' },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}