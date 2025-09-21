import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/topics - получить все темы
export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        lessons: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    return NextResponse.json(topics, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}

// POST /api/topics - создать новую тему
export async function POST(request: NextRequest) {
  try {
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

    const topic = await prisma.topic.create({
      data: {
        title,
        description: description || null,
        isLocked: isLocked || false
      }
    });

    return NextResponse.json(topic, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}