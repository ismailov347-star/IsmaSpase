import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/lessons/[id]/tips/[tipId] - получить совет по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; tipId: string } }
) {
  try {
    const tipId = parseInt(params.tipId);
    
    if (isNaN(tipId)) {
      return NextResponse.json(
        { error: 'Invalid tip ID' },
        { status: 400 }
      );
    }

    const tip = await prisma.tip.findUnique({
      where: { id: tipId },
      include: { lesson: true }
    });

    if (!tip) {
      return NextResponse.json(
        { error: 'Tip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tip);
  } catch (error) {
    console.error('Error fetching tip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tip' },
      { status: 500 }
    );
  }
}

// PUT /api/lessons/[id]/tips/[tipId] - обновить совет
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; tipId: string } }
) {
  try {
    const tipId = parseInt(params.tipId);
    
    if (isNaN(tipId)) {
      return NextResponse.json(
        { error: 'Invalid tip ID' },
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

    const tip = await prisma.tip.update({
      where: { id: tipId },
      data: {
        title,
        content,
        order: order || 0
      }
    });

    return NextResponse.json(tip);
  } catch (error) {
    console.error('Error updating tip:', error);
    return NextResponse.json(
      { error: 'Failed to update tip' },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/[id]/tips/[tipId] - удалить совет
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; tipId: string } }
) {
  try {
    const tipId = parseInt(params.tipId);
    
    if (isNaN(tipId)) {
      return NextResponse.json(
        { error: 'Invalid tip ID' },
        { status: 400 }
      );
    }

    await prisma.tip.delete({
      where: { id: tipId }
    });

    return NextResponse.json(
      { message: 'Tip deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting tip:', error);
    return NextResponse.json(
      { error: 'Failed to delete tip' },
      { status: 500 }
    );
  }
}